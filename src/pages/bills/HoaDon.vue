<template>
  <div class="container-fluid py-4 invoice-management">
    <HeaderCard title="Quản Lý Hóa Đơn" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
          <div class="col-lg-4">
            <div class="filter-group">
              <div class="price-range-container">
                <label class="filter-label">Khoảng giá trị</label>
                <div class="dual-range-slider">
                  <div class="slider-track">
                    <div class="slider-range" :style="sliderRangeStyle"></div>
                  </div>
                  <input type="range" v-model.number="rangeMin" :min="minInvoiceTotal" :max="maxInvoiceTotal"
                    class="range-slider" style="z-index: 2;" @input="updateRangeMax" />
                  <input type="range" v-model.number="rangeMax" :min="minInvoiceTotal" :max="maxInvoiceTotal"
                    class="range-slider" style="z-index: 1;" @input="updateRangeMin" />
                </div>
                <div class="range-labels d-flex justify-content-between">
                  <span>{{ formatPrice(rangeMin) }}</span>
                  <span>{{ formatPrice(rangeMax) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <!-- Stats Section -->
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item me-4">
                  <span class="stat-label">Tổng số hóa đơn:</span>
                  <span class="stat-value">{{ filteredInvoices.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Tổng giá trị:</span>
                  <span class="stat-value text-success">{{ formatPrice(totalValue) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất Excel
            </button>
            <button class="btn btn-action" @click="scanQR">
              <i class="bi bi-qr-code me-2"></i>
              Quét QR
            </button>
            <router-link to="/create-hoa-don" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i>
              Tạo Hóa Đơn
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

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
            Hóa đơn tại quầy
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
    <FilterTableSection title="Bộ Lọc Trạng Thái Hóa Đơn" icon="bi bi-funnel">
      <div class="status-badge d-flex gap-3 m-3" style="width: max-content;">
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
    <FilterTableSection title="Danh Sách Hóa Đơn" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredInvoices.length }} hóa đơn</span>
        </div>
        <div class="table-controls">
          <div class="view-toggle">
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'table', 'btn-outline-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'">
              <i class="bi bi-table"></i>
            </button>
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'card', 'btn-outline-secondary': viewMode !== 'card' }"
              @click="viewMode = 'card'">
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <DataTable title="" :headers="headers" :data="filteredInvoices"
            :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]">
<<<<<<< HEAD
            <template #index="{ index }">
              {{ index + 1 }}
            </template>
            <template #ma="{ item }">
=======
             <template #index="{ index }">
    {{ index + 1 }}
  </template>
            <template #code="{ item }">
>>>>>>> 82d887e (commit api hoa don)
              <div class="code-cell">
                <span class="code-text">{{ item.ma }}</span>
                <small class="code-date">{{ item.ngayTao }}</small>
              </div>
            </template>

            <template #maNhanVien="{ item }">
              <div class="employee-cell">
                <div class="employee-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
<<<<<<< HEAD
                <span class="employee-name">{{ item.maNhanVien }}</span>
=======
                <span class="employee-name">{{ item.idNhanVien.ma }}</span>
>>>>>>> 82d887e (commit api hoa don)
              </div>
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
                <div class="discount-info" v-if="item.discount > 0">
                  <small class="text-muted">Giảm: {{ formatPrice(item.discount) }}</small>
                </div>
              </div>
            </template>

<<<<<<< HEAD
            <template #loaiDon="{ item }">
=======
            <template #type="{ item }">
>>>>>>> 82d887e (commit api hoa don)
              <span class="type-badge" :class="getTypeBadgeClass(item.loaiDon)">
                <i :class="getTypeIcon(item.loaiDon)" class="me-1"></i>
                {{ item.type }}
              </span>
            </template>

            <template #trangThaiFormatted="{ item }">
              <span class="status-badge" :class="getStatusBadgeClass(item.trangThaiFormatted)">
                <i :class="getStatusIcon(item.trangThaiFormatted)" class="me-1"></i>
                {{ item.trangThaiFormatted }}
              </span>
            </template>

            <template #actions="{ item }">
              <div class="action-buttons-cell">
                <button class="btn btn-sm btn-table" @click="viewInvoice(item)" title="Xem chi tiết">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="editInvoice(item)" title="Xuất Hóa Đơn">
                  <i class="bi bi-printer-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="confirmDeleteInvoice(item)" title="Tải QR">
                  <i class="bi bi-qr-code"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else class="card-grid">
          <div v-for="invoice in paginatedInvoices" :key="invoice.id" class="invoice-card">
            <div class="invoice-card-header">
              <div class="invoice-code">{{ invoice.ma }}</div>
              <span class="status-badge" :class="getStatusBadgeClass(invoice.trangThaiFormatted)">
                {{ invoice.trangThaiFormatted }}
              </span>
            </div>

            <div class="invoice-card-body">
              <div class="customer-info">
                <div class="customer-name">{{ invoice.tenKhachHang }}</div>
                <div class="customer-phone">{{ invoice.soDienThoaiKhachHang }}</div>
              </div>

              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Nhân viên:</span>
<<<<<<< HEAD
                  <span class="detail-value">{{ invoice.maNhanVien }}</span>
=======
                  <span class="detail-value">{{ invoice.idNhanVien.ma }}</span>
>>>>>>> 82d887e (commit api hoa don)
                </div>
                <div class="detail-row">
                  <span class="detail-label">Loại đơn:</span>
                  <span class="type-badge" :class="getTypeBadgeClass(invoice.loaiDon)">
                    {{ invoice.loaiDon }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ngày tạo:</span>
                  <span class="detail-value">{{ invoice.ngayTao }}</span>
                </div>
              </div>

              <div class="invoice-amounts">
                <div class="total-amount">{{ formatPrice(invoice.tongTienSauGiam) }}</div>
                <div class="amount-details">
                  <small class="text-muted">Giảm: {{ formatPrice(invoice.discount) }}</small>
                  <small class="text-muted">Phí: {{ formatPrice(invoice.phiVanChuyen) }}</small>
                </div>
              </div>
            </div>

            <div class="invoice-card-actions">
              <button class="btn btn-sm btn-table" @click="viewInvoice(invoice)">
                <i class="bi bi-eye me-1"></i> Xem
              </button>
              <button class="btn btn-sm btn-table" @click="editInvoice(invoice)">
                <i class="bi bi-printer-fill"></i> Xuất HD
              </button>
              <button class="btn btn-sm btn-table" @click="confirmDeleteInvoice(invoice)">
                <i class="bi bi-qr-code"></i> Quét HD
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination for Card View -->
        <div v-if="viewMode === 'card'" class="card-pagination">
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
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
    return invoiceManagementLogic.setup();
  }
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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
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

/* Price Range */
.price-range-container {
  display: flex;
  flex-direction: column;
}

.dual-range-slider {
  position: relative;
  width: 100%;
  height: 20px;
}

.slider-track {
  position: absolute;
  top: 7px;
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
}

.slider-range {
  position: absolute;
  height: 6px;
  background: #34d399;
  border-radius: 3px;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  top: 7px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #34d399;
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.range-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #34d399;
  cursor: pointer;
  pointer-events: auto;
  border: none;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
}

/* Filter Stats */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f3a44;
}

.stat-value.text-success {
  color: #16a34a !important;
}

/* Existing styles retained */
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

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.view-toggle .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-toggle .btn-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border: none;
}

.view-toggle .btn-primary:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.view-toggle .btn-outline-secondary {
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #1f3a44;
}

.view-toggle .btn-outline-secondary:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
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

.employee-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.employee-avatar {
  font-size: 1.25rem;
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
  width: 130px;
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

.card-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.invoice-card {
  background: #f8f9fa;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.invoice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(52, 211, 153, 0.2);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.invoice-code {
  font-weight: 600;
  color: #34d399;
}

.invoice-card-body {
  padding: 1rem;
}

.customer-info {
  margin-bottom: 1rem;
}

.customer-name {
  font-weight: 600;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.875rem;
  color: #6c757d;
}

.invoice-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
  color: #1f3a44;
}

.invoice-amounts {
  padding-top: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
}

.total-amount {
  font-weight: 600;
  color: #16a34a;
  font-size: 1.1rem;
}

.amount-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.amount-details small {
  color: #6c757d;
}

.invoice-card-actions {
  padding: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.card-pagination {
  padding: 1.5rem;
}

.pagination {
  margin: 0;
  justify-content: center;
}

.page-item .page-link {
  border-radius: 8px;
  margin: 0 0.25rem;
  color: #1f3a44;
  border: 1px solid rgba(52, 211, 153, 0.2);
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-color: #34d399;
  color: white;
}

.page-item:not(.disabled) .page-link:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  border-color: #16a34a;
  color: white;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: rgba(52, 211, 153, 0.2);
  color: #6c757d;
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

  .card-grid {
    grid-template-columns: 1fr;
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

.animate__zoomIn {
  animation-name: zoomIn;
}
</style>