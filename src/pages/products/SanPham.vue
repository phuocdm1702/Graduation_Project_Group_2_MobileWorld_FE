<template>
  <div class="container-fluid py-4 product-management">
    <!-- Header -->
    <HeaderCard title="Quản Lý Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input v-model.trim="keyword" @input="debouncedSearch" type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm..." class="form-control search-input" />
              </div>
            </div>
          </div>

          <!-- Filter for Manufacturer -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hãng</label>
              <select v-model="filters.idNhaSanXuat" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                  {{ option.nhaSanXuat }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for OS -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <select v-model="filters.idHeDieuHanh" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                  {{ option.heDieuHanh }} {{ option.phienBan }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Screen Technology -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công nghệ màn hình</label>
              <select v-model="filters.idCongNgheManHinh" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                  {{ option.chuanManHinh }} {{ option.congNgheManHinh }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Battery -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Pin</label>
              <select v-model="filters.idPin" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                  {{ option.loaiPin }} {{ option.dungLuongPin }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Stock Status -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng thái tồn kho</label>
              <select v-model="filters.stockStatus" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option value="inStock">Còn hàng</option>
                <option value="outOfStock">Hết hàng</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item me-4">
                  <span class="stat-label">Tổng số sản phẩm:</span>
                  <span class="stat-value">{{ filteredProducts.length }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <router-link to="/themChiTietSanPham" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i>
              Thêm chi tiết sản phẩm
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-table">
      <!-- Table/Card View Toggle -->
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredProducts.length }} sản phẩm</span>
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
        <div v-if="viewMode === 'table'">
          <DataTable title="" :headers="headers" :data="paginatedProducts"
            :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]">
            <template #stt="{ item, index }">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #tenSanPham="{ item }">
              <div class="code-text">{{ item.tenSanPham }}</div>
            </template>
            <template #nhaSanXuat="{ item }">
              <div class="employee-name">{{ item.nhaSanXuat }}</div>
            </template>
            <template #heDieuHanh="{ item }">
              <div class="customer-name">{{ item.heDieuHanh }} {{ item.phienBan }}</div>
            </template>
            <template #congNgheManHinh="{ item }">
              <div class="customer-name">{{ item.congNgheManHinh }}</div>
            </template>
            <template #tenCpu="{ item }">
              <div class="customer-name">{{ item.tenCpu }}</div>
            </template>
            <template #dungLuongPin="{ item }">
              <div class="customer-name">{{ item.dungLuongPin }}</div>
            </template>
            <template #imeiCount="{ item }">
              <div class="amount-cell">{{ item.imeiCount || '0' }}</div>
            </template>
            <template #priceRange="{ item }">
              <div class="amount-cell">
                <div class="total-amount">
                  {{ formatPrice(item.minPrice) }} - {{ formatPrice(item.maxPrice) }}
                </div>
              </div>
            </template>
            <template #stockStatus="{ item }">
              <span class="status-badge" :class="getStatusBadgeClass(item.imeiCount === 0 ? 'Hết hàng' : 'Còn hàng')">
                <i :class="getStatusIcon(item.imeiCount === 0 ? 'Hết hàng' : 'Còn hàng')" class="me-1"></i>
                {{ item.imeiCount === 0 ? 'Hết hàng' : 'Còn hàng' }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="action-buttons-cell">
                <button class="btn btn-sm btn-table" @click="viewProduct(item)" title="Xem chi tiết">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="editProduct(item)" title="Chỉnh sửa">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="confirmDeleteProduct(item)" title="Xóa">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else class="card-grid">
          <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
            <div class="product-card-header">
              <div class="product-code">{{ product.tenSanPham }}</div>
              <span class="status-badge"
                :class="getStatusBadgeClass(product.imeiCount === 0 ? 'Hết hàng' : 'Còn hàng')">
                {{ product.imeiCount === 0 ? 'Hết hàng' : 'Còn hàng' }}
              </span>
            </div>

            <div class="product-card-body">
              <div class="product-info">
                <div class="product-name">{{ product.nhaSanXuat }}</div>
                <div class="product-detail">{{ product.heDieuHanh }} {{ product.phienBan }}</div>
              </div>

              <div class="product-details">
                <div class="detail-row">
                  <span class="detail-label">Màn hình:</span>
                  <span class="detail-value">{{ product.congNgheManHinh }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">CPU:</span>
                  <span class="detail-value">{{ product.tenCpu }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pin:</span>
                  <span class="detail-value">{{ product.dungLuongPin }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Số lượng:</span>
                  <span class="detail-value">{{ product.imeiCount || '0' }}</span>
                </div>
              </div>

              <div class="product-amounts">
                <div class="total-amount">
                  {{ formatPrice(product.minPrice) }} - {{ formatPrice(product.maxPrice) }}
                </div>
              </div>
            </div>

            <div class="product-card-actions">
              <button class="btn btn-sm btn-table" @click="viewProduct(product)">
                <i class="bi bi-eye me-1"></i> Xem
              </button>
              <button class="btn btn-sm btn-table" @click="editProduct(product)">
                <i class="bi bi-edit-fill"></i> Sửa
              </button>
              <button class="btn btn-sm btn-table" @click="confirmDeleteProduct(product)">
                <i class="bi bi-trash-fill"></i> Xóa
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
import SanPhamJS from './js/SanPham';

export default {
  name: 'ProductManagement',
  ...SanPhamJS
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

@keyframes gentleGlow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }

  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Base Styles */
.product-management {
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

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

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

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    width: 130px;
    display: flex;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    align-items: center;
}

.badge-completed {
    background: #34d399;
    color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.badge-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.code-text {
  font-weight: 500;
  color: #34d399;
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

.product-card {
  background: #f8f9fa;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(52, 211, 153, 0.2);
}

.product-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.product-code {
  font-weight: 600;
  color: #34d399;
}

.product-card-body {
  padding: 1rem;
}

.product-info {
  margin-bottom: 1rem;
}

.product-name {
  font-weight: 600;
  color: #1f3a44;
}

.product-detail {
  font-size: 0.875rem;
  color: #6c757d;
}

.product-details {
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

.product-amounts {
  padding-top: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
}

.product-card-actions {
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

  .status-badge {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .card-grid {
    grid-template-columns: 1fr;
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
</style>