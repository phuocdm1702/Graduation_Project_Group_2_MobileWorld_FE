<template>
  <div class="container-fluid py-4 invoice-management">
    <HeaderCard title="Quản lý Hóa đơn" badgeText="Hệ thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <!-- Single Row for All Filters -->
        <div class="row g-4 align-items-end">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" class="form-control search-input" placeholder="Mã hóa đơn, khách hàng, SĐT..."
                  :value="keyword" @input="debouncedSearch($event.target.value)" />
              </div>
            </div>
          </div>

          <!-- Date Range Picker -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian</label>
              <div class="date-range-wrapper d-flex align-items-center">
                <input type="date" v-model="startDate" class="form-control date-input" placeholder="Từ ngày" />
                <span class="date-separator mx-2">đến</span>
                <input type="date" v-model="endDate" class="form-control date-input" placeholder="Đến ngày" />
              </div>
            </div>
          </div>

          <!-- Price Range Slider -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng Giá (VND)</label>
              <div class="slider-container">
                <div class="slider-track"></div>
                <div class="slider-range" :style="{
                  left: `${((rangeMin || minInvoiceTotal) - minInvoiceTotal) / (maxInvoiceTotal - minInvoiceTotal) * 100}%`,
                  width: `${((rangeMax || maxInvoiceTotal) - (rangeMin || minInvoiceTotal)) / (maxInvoiceTotal - minInvoiceTotal) * 100}%`
                }"></div>
                <div class="slider-thumb"
                  :style="{ left: `${((rangeMin || minInvoiceTotal) - minInvoiceTotal) / (maxInvoiceTotal - minInvoiceTotal) * 100}%` }"
                  @mousedown="(e) => startDrag('min', e)"></div>
                <div class="slider-thumb"
                  :style="{ left: `${((rangeMax || maxInvoiceTotal) - minInvoiceTotal) / (maxInvoiceTotal - minInvoiceTotal) * 100}%` }"
                  @mousedown="(e) => startDrag('max', e)"></div>
                <input type="range" v-model="rangeMin" :min="minInvoiceTotal" :max="rangeMax || maxInvoiceTotal"
                  class="absolute opacity-0 w-full h-full" @input="debouncedRangeMin" />
                <input type="range" v-model="rangeMax" :min="rangeMin || minInvoiceTotal" :max="maxInvoiceTotal"
                  class="absolute opacity-0 w-full h-full" @input="debouncedRangeMax" />
              </div>
              <div class="d-flex justify-content-between text-sm text-muted mt-1">
                <span>{{ formatCurrency(rangeMin || minInvoiceTotal) }}</span>
                <span>{{ formatCurrency(rangeMax || maxInvoiceTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <!-- Stats Section -->
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex gap-4">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số hóa đơn: </span>
                  <span class="stat-value text-success">{{ filteredInvoices.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Tổng giá trị: </span>
                  <span class="stat-value text-success">{{ formatPrice(totalValue) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportExcel">
              Xuất Excel
            </button>
            <button class="btn btn-action" @click="scanQR">
              Quét QR
            </button>
            <router-link to="/banHang" class="btn btn-action">
              Tạo Hóa Đơn
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- QR Scanner Modal -->
    <div class="modal fade" id="qrScannerModal" tabindex="-1" aria-labelledby="qrScannerModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-qr">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="qrScannerModalLabel">Quét Mã QR Hóa đơn</h5>
            <button type="button" class="btn-close" @click="stopCamera"></button>
          </div>
          <div class="modal-body">
            <div class="qr-scanner-container">
              <div class="qr-overlay">
                <video id="qr-video" width="100%" height="auto" autoplay playsinline></video>
                <canvas id="qr-canvas" style="display: none;"></canvas>
                <div class="qr-scanner-border"></div>
              </div>
              <div class="qr-feedback">
                <p v-if="qrError" class="text-danger qr-feedback-error">{{ qrError }}</p>
                <p v-if="qrMessage && !qrError" class="text-info qr-feedback-message">{{ qrMessage }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="stopCamera">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-section mb-4">
      <ul class="nav nav-tabs invoice-tabs">
        <li class="nav-item">
          <button class="nav-link" :class="{ 'active': activeTab === 'all' }" @click="setActiveTab('all')">
            <i class="bi bi-receipt me-2"></i>
            Tất cả hóa đơn
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ 'active': activeTab === 'in-store' }" @click="setActiveTab('in-store')">
            <i class="bi bi-shop me-2"></i>
            Hóa đơn trực tiếp
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ 'active': activeTab === 'online' }" @click="setActiveTab('online')">
            <i class="bi bi-globe me-2"></i>
            Hóa đơn online
          </button>
        </li>
      </ul>
    </div>

    <!-- Status Filter Section -->
    <FilterTableSection title="Bộ lọc Trạng thái Hóa đơn" icon="bi bi-funnel">
      <div class="status-badge d-flex gap-3 m-3" style="width: max-content;">
        <button type="button" class="btn btn-outline-primary position-relative" @click="setActiveTabByStatus('all')">
          Tất cả
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-all"
            v-if="filteredInvoices.length">
            {{ filteredInvoices.length > 99 ? '99+' : filteredInvoices.length }}
            <span class="visually-hidden">tất cả hóa đơn</span>
          </span>
        </button>
        <button type="button" class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Chờ xác nhận')">
          Chờ xác nhận
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-waiting"
            v-if="statusCounts['Chờ xác nhận']">
            {{ statusCounts['Chờ xác nhận'] > 99 ? '99+' : statusCounts['Chờ xác nhận'] }}
            <span class="visually-hidden">hóa đơn chờ xác nhận</span>
          </span>
        </button>
        <button type="button" class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Chờ giao hàng')">
          Chờ giao hàng
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-waiting"
            v-if="statusCounts['Chờ giao hàng']">
            {{ statusCounts['Chờ giao hàng'] > 99 ? '99+' : statusCounts['Chờ giao hàng'] }}
            <span class="visually-hidden">hóa đơn chờ giao hàng</span>
          </span>
        </button>
        <button type="button" class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Đang giao')">
          Đang giao
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-waiting"
            v-if="statusCounts['Đang giao']">
            {{ statusCounts['Đang giao'] > 99 ? '99+' : statusCounts['Đang giao'] }}
            <span class="visually-hidden">hóa đơn đang giao</span>
          </span>
        </button>
        <button type="button" class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Hoàn thành')">
          Hoàn thành
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-completed"
            v-if="statusCounts['Hoàn thành']">
            {{ statusCounts['Hoàn thành'] > 99 ? '99+' : statusCounts['Hoàn thành'] }}
            <span class="visually-hidden">hóa đơn hoàn thành</span>
          </span>
        </button>
        <button type="button" class="btn btn-outline-primary position-relative" @click="setActiveTabByStatus('Đã hủy')">
          Đã hủy
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-canceled"
            v-if="statusCounts['Đã hủy']">
            {{ statusCounts['Đã hủy'] > 99 ? '99+' : statusCounts['Đã hủy'] }}
            <span class="visually-hidden">hóa đơn đã hủy</span>
          </span>
        </button>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh sách Hóa đơn" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredInvoices.length }} hóa đơn</span>
        </div>
      </div>

      <div class="table-body">
        <DataTable title="" :headers="headers" :data="filteredInvoices" :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
          :rowClass="getRowClass">
          <template #stt="{ globalIndex }">
            {{ globalIndex + 1 }}
          </template>
          <template #ma="{ item }">
            <div class="code-cell">
              <span class="code-text">{{ item.ma }}</span>
              <small class="code-date">{{ item.ngayTao }}</small>
            </div>
          </template>
          <template #maNhanVien="{ item }">
            <span class="employee-name">{{ item.maNhanVien }}</span>
          </template>
          <template #tenKhachHang="{ item }">
            <div class="customer-cell">
              <div class="customer-name">{{ item.tenKhachHang }}</div>
              <div class="customer-phone">{{ item.soDienThoaiKhachHang }}</div>
            </div>
          </template>
          <template #tongTienSauGiam="{ item }">
            <div class="amount-cell">
              <div class="total-amount">{{ formatPrice(item.tongTienSauGiam) }}</div>
              <div class="discount-info" v-if="item.soTienGiamToiDa > 0">
                <small class="text-muted">Giảm: {{ formatPrice(item.soTienGiamToiDa) }}</small>
              </div>
            </div>
          </template>
          <template #loaiDon="{ item }">
            <span class="type-badge" :class="getTypeBadgeClass(item.loaiDon)">
              {{ item.loaiDon }}
            </span>
          </template>
          <template #trangThaiFormatted="{ item }">
            <span class="status-badge" :class="getStatusBadgeClass(item.trangThaiFormatted)">
              {{ item.trangThaiFormatted }}
            </span>
          </template>
          <template #actions="{ item }">
            <div class="action-buttons-cell">
              <button class="btn btn-sm btn-table" @click="viewInvoice(item)" title="Xem chi tiết">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button class="btn btn-sm btn-table" @click="printInvoice(item)" title="Xuất Hóa đơn">
                <i class="bi bi-printer-fill"></i>
              </button>
              <button class="btn btn-sm btn-table" @click="downloadQrCode(item)" title="Tải QR">
                <i class="bi bi-qr-code"></i>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </FilterTableSection>

    <!-- Modals -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { invoiceManagementLogic } from '../bills/js/HoaDon';

export default {
  name: 'InvoiceManagement',
  components: invoiceManagementLogic.components,
  setup() {
    const logic = invoiceManagementLogic.setup();

    // Thêm hàm startDrag để xử lý kéo thả thanh trượt giá
    const startDrag = (type, event) => {
      const slider = event.target.closest('.slider-container');
      const updatePrice = (e) => {
        const rect = slider.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newPrice = Math.round(pos * (logic.maxInvoiceTotal.value - logic.minInvoiceTotal.value) + logic.minInvoiceTotal.value);

        if (type === 'min' && newPrice < logic.rangeMax.value) {
          logic.rangeMin.value = Math.max(logic.minInvoiceTotal.value, newPrice);
        } else if (type === 'max' && newPrice > logic.rangeMin.value) {
          logic.rangeMax.value = Math.min(logic.maxInvoiceTotal.value, newPrice);
        }
        logic.updateRangeMin();
        logic.updateRangeMax();
      };

      const stopDrag = () => {
        document.removeEventListener('mousemove', updatePrice);
        document.removeEventListener('mouseup', stopDrag);
      };

      document.addEventListener('mousemove', updatePrice);
      document.addEventListener('mouseup', stopDrag);
    };

    return {
      ...logic,
      startDrag,
    };
  },
};
</script>

<style scoped>
/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes gentleGlow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }

  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

@keyframes highlightFade {
  from {
    background-color: rgba(52, 211, 153, 0.4);
  }

  to {
    background-color: rgba(52, 211, 153, 0.2);
  }
}

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Highlighted Row */
.highlighted-row {
  background-color: rgba(52, 211, 153, 0.2);
  animation: highlightFade 2s ease-out;
}

/* Base Styles */
.invoice-management {
  min-height: 100vh;
}

/* Filter Label and Inputs */
.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Currency Input Styling */
.currency-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
  font-family: 'Courier New', monospace;
}

.currency-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  background: white;
}

.currency-input::placeholder {
  color: #6c757d;
  font-style: italic;
}

.price-range-hint {
  margin-top: 0.25rem;
}

.price-range-hint small {
  font-weight: 500;
  color: #16a34a !important;
}

/* Price Range */
.slider-container {
  position: relative;
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
}

.slider-track {
  height: 4px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: absolute;
}

.slider-range {
  height: 4px;
  background-color: #34d399;
  border-radius: 2px;
  position: absolute;
}

.slider-thumb {
  width: 18px;
  height: 18px;
  background-color: #34d399;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

/* Filter Stats */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #1f3a44;
  font-weight: 500;
}

.stat-value.text-success {
  color: rgb(21, 128, 61) !important;
  font-weight: bold;
}

/* Existing styles */
.page-header {
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
  align-items: center !important;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f3a44;
  letter-spacing: -0.025em;
}

.search-group {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.date-separator {
  color: #1f3a44;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset,
.btn-action {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.tab-section {
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

.invoice-tabs {
  border-bottom: 2px solid rgba(52, 211, 153, 0.2);
  margin-bottom: 1rem;
}

.nav-tabs .nav-link {
  color: #1f3a44;
  font-weight: 500;
  border: none;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
}

.nav-tabs .nav-link.active {
  background: #16a34a;
  color: white;
  border-bottom: 3px solid #16a34a;
}

.nav-tabs .nav-link:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.nav-tabs .nav-link.active:hover {
  background: #16a34a;
  color: white;
  cursor: default;
}

.btn-outline-primary {
  border-color: #16a34a !important;
  color: #16a34a !important;
}

.btn-outline-primary:hover {
  background: #16a34a !important;
  border-color: #16a34a !important;
  color: #ffffff !important;
}

.badge-waiting {
  background: #34d399;
  color: white;
}

.badge-completed {
  background: #16a34a;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.badge-all {
  background: #6f42c1;
  color: white;
}

/* Price Range Slider Styling */
.slider-container {
  position: relative;
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
}

.slider-track {
  height: 4px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: absolute;
}

.slider-range {
  height: 4px;
  background-color: #34d399;
  border-radius: 2px;
  position: absolute;
}

.slider-thumb {
  width: 18px;
  height: 18px;
  background-color: #34d399;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
  transition: transform 0.2s ease;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.absolute {
  position: absolute;
}

.opacity-0 {
  opacity: 0;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-count {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #34d399;
}

.code-date {
  font-size: 0.75rem;
  color: #6c757d;
}

.employee-name {
  font-weight: 500;
  color: #1f3a44;
}

.customer-cell {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.75rem;
  color: #6c757d;
}

.amount-cell {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.total-amount {
  font-weight: 600;
  color: #16a34a !important;
}

.discount-info {
  font-size: 0.75rem;
  color: #6c757d;
}

.type-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.badge-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.badge-info {
  background: #f8f9fa;
  color: #1f3a44;
  border: 1px solid #34d399;
}

.badge-secondary {
  background: #6c757d;
  color: white;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filter-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .date-range-wrapper {
    flex-direction: column;
    gap: 0.75rem;
  }

  .date-separator {
    display: none;
  }

  .tab-section {
    animation: fadeInUp 0.4s ease;
  }

  .btn-reset,
  .btn-action {
    padding: 0.5rem 1rem;
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .status-badge {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }

  .invoice-tabs {
    flex-direction: column;
  }

  .nav-item {
    width: 100%;
  }

  .nav-tabs .nav-link {
    width: 100%;
    text-align: left;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .status-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.animate__animated {
  --animate-duration: 0.2s;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

/* Modal QR Scanner */
.modal-qr {
  max-width: 500px;
}

.modal-content {
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 1rem;
}

.modal-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.btn-close {
  color: white;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.qr-scanner-container {
  position: relative;
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.qr-overlay {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
}

#qr-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.qr-scanner-border {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 2px solid #34d399;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
  pointer-events: none;
  animation: gentleGlow 1.5s infinite;
}

.qr-feedback {
  margin-top: 1rem;
  text-align: center;
  min-height: 1.5rem;
}

.qr-feedback-error {
  font-weight: 500;
  animation: fadeIn 0.3s ease-out;
}

.qr-feedback-message {
  font-weight: 500;
  color: #34d399;
  animation: fadeIn 0.3s ease-out;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  justify-content: center;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 10px rgba(108, 117, 125, 0.3);
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>