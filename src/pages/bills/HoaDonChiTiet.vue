<template>
  <div class="container-fluid py-4 invoice-detail-management animate__animated animate__fadeIn">
    <!-- Header -->
    <HeaderCard title="Hóa Đơn Chi Tiết" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" class="page-header" />

    <!-- Status Timeline -->
    <FilterTableSection title="Trạng Thái Hóa Đơn" icon="bi bi-clock-history">
      <div class="mx-4 my-5">
        <div class="timeline-container" :class="{ 'single-status': invoice.loaiDon === 'trực tiếp' }">
          <div v-for="(status, index) in timelineStatuses" :key="index" class="timeline-step" :class="{
            'completed': status.completed,
            'current': status.current,
            'canceled': status.title === 'Đã hủy'
          }" @click="changeStatus(status.title)">
            <div class="step-circle">
              <i :class="status.icon"></i>
            </div>
            <div class="step-content">
              <h6 class="step-title">{{ status.title }}</h6>
              <p class="step-time">{{ status.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Thông tin chính -->
    <div class="row g-4 mb-4 animate__animated animate__zoomIn" style="--animate-delay: 0.3s;">
      <!-- Thông tin đơn hàng -->
      <div class="col-lg-6">
        <FilterTableSection title="Thông Tin Đơn Hàng" icon="bi bi-receipt" class="filter-table-section">
          <div class="section-body m-3">
            <div class="info-card glass-card">
              <div class="card-body">
                <div class="info-row" v-for="(info, index) in orderInfo" :key="index">
                  <span class="info-label">{{ info.label }}</span>
                  <span class="info-value" :class="{
                    'code-text': info.key === 'ma',
                    'type-badge': info.key === 'loaiDon',
                    'status-badge': info.key === 'trangThai',
                    [getBadgeClass(info.key, info.value)]: info.key === 'loaiDon' || info.key === 'trangThai',
                  }">
                    {{ info.value }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>

      <!-- Thông tin khách hàng -->
      <div class="col-lg-6">
        <FilterTableSection title="Thông Tin Khách Hàng" icon="bi bi-person-circle" class="filter-table-section">
          <div class="section-body m-3">
            <div class="info-card glass-card">
              <div class="card-body">
                <div class="info-row" v-for="(info, index) in customerInfo" :key="index">
                  <span class="info-label">{{ info.label }}</span>
                  <span class="info-value">
                    {{ info.value || 'Không có' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Danh sách sản phẩm -->
    <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-box-seam">
      <div class="section-body m-3">
        <div class="product-actions mb-3 d-flex justify-content-end gap-2">
          <button class="btn btn-action" @click="isAddProductModalVisible = true" :disabled="isActionButtonsDisabled">
            Thêm Sản Phẩm
          </button>
        </div>
        <div class="products-list">
          <div v-for="product in products" :key="product.id" class="product-card animate__animated animate__zoomIn"
            style="--animate-delay: 0.4s;">
            <div class="product-card-content">
              <div class="product-image">
                <img :src="product.image || '/assets/placeholder-product.png'" alt="Product Image"
                  class="product-img" />
              </div>
              <div class="product-details">
                <h6 class="product-name">{{ product.name }} {{ product.color }} {{ product.ram }} {{ product.capacity }}
                </h6>
                <div class="product-price">
                  <span class="price-amount">{{ formatPrice(product.price) }}</span>
                  <span class="quantity">x{{ product.quantity || 1 }}</span>
                </div>
                <div class="product-imei" v-if="product.imei">
                  <span class="imei-label">IMEI:</span>
                  <span class="imei-code">{{ truncateIMEI(product.imei) }}</span>
                </div>
              </div>
            </div>
            <div class="product-card-actions">
              <button class="btn btn-sm btn-view" @click="showIMEIModal(product)" title="Xem IMEI"
                :disabled="isActionButtonsDisabled">
                Xem IMEI
              </button>
              <button class="btn btn-sm btn-view" @click="showConfirmIMEIModal(product)" title="Xác nhận IMEI"
                :disabled="isActionButtonsDisabled">
                Xác nhận
              </button>
              <button class="btn btn-sm btn-delete" @click="removeProduct(product)" title="Xóa sản phẩm"
                :disabled="isActionButtonsDisabled">
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Modal Split View Thêm Sản Phẩm và IMEI -->
    <div v-if="isAddProductModalVisible" class="modal-backdrop-blur" @click.self="isAddProductModalVisible = false">
      <div class="modal-container glass-modal split-modal animate__animated animate__zoomIn">
        <!-- Left Side - Product List (60%) -->
        <div class="split-view-left">
          <div class="modal-header gradient-header">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2"></i>
              Thêm Sản Phẩm Mới
            </h5>
          </div>
          <div class="modal-body">
            <div class="m-4">
              <!-- Tìm kiếm và lọc sản phẩm -->
              <div class="row g-4 align-items-end">
                <div class="col-lg-12">
                  <div class="search-group">
                    <label class="filter-label">Tìm kiếm</label>
                    <div class="search-input-wrapper">
                      <i class="bi bi-search search-icon"></i>
                      <input type="text" class="form-control search-input"
                        placeholder="Nhập tên sản phẩm hoặc mã sản phẩm..." v-model="productSearchQuery"
                        @input="debouncedSearchProduct($event.target.value)" style="padding-left: 2.5rem;" />
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="filter-label">Màu sắc</label>
                  <select v-model="filterColor" class="form-select search-input">
                    <option value="">Tất cả màu</option>
                    <option v-for="color in uniqueColors" :key="color" :value="color">{{ color }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="filter-label">RAM</label>
                  <select v-model="filterRam" class="form-select search-input">
                    <option value="">Tất cả RAM</option>
                    <option v-for="ram in uniqueRams" :key="ram" :value="ram">{{ ram }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="filter-label">Bộ nhớ</label>
                  <select v-model="filterStorage" class="form-select search-input">
                    <option value="">Tất cả bộ nhớ</option>
                    <option v-for="storage in uniqueStorages" :key="storage" :value="storage">{{ storage }}</option>
                  </select>
                </div>
              </div>
              <!-- Thống kê và nút đặt lại -->
              <div class="filter-actions mt-3 d-flex justify-content-between align-items-center">
                <div class="filter-stats">
                  <div class="stat-item">
                    <span class="stat-label">Tổng số sản phẩm: </span>
                    <span class="stat-value">{{ filteredProducts.length }}</span>
                  </div>
                </div>
                <div class="action-buttons d-flex gap-2">
                  <button class="btn btn-reset" @click="resetProductFilters">Đặt lại</button>
                </div>
              </div>
            </div>
            <!-- DataTable cho danh sách sản phẩm -->
            <div class="table-body">
              <DataTable title="" :headers="productHeaders" 
              :data="paginatedProducts"
                :pageSizeOptions="productPageSizeOptions" 
                :currentPage="productCurrentPage"
                :itemsPerPage="productItemsPerPage" 
                :totalPages="totalProductPages" 
                :rowClass="getProductRowClass"
                @update:currentPage="updateProductPage" @update:itemsPerPage="updateProductItemsPerPage">
                <template #stt="{ globalIndex }">
                  {{ globalIndex + 1 }}
                </template>
                <template #actions="{ item }">
                  <i class="bi bi-plus-circle-fill action-icon text-success cursor-pointer"
                    @click="showNewIMEIList(item)" :class="{ 'text-muted': item.trangThai !== 'Còn hàng' }"
                    :disabled="item.trangThai !== 'Còn hàng'"></i>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Right Side - IMEI List (40%) -->
        <div class="split-view-right" v-if="showNewIMEIModal">
          <div class="modal-header gradient-header">
            <h5 class="modal-title">
              <i class="bi bi-upc-scan me-2"></i>
              Chọn IMEI
            </h5>
            <button class="btn-close-modern" @click="isAddProductModalVisible = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body imei-selection-container">
            <!-- Product Info Card -->
            <div class="product-info-card">
              <div class="product-image-wrapper">
                <img :src="selectedNewProduct?.anhSanPham || selectedNewProduct?.duongDan"
                  :alt="selectedNewProduct?.tenSanPham" class="product-preview-image" />
              </div>
              <div class="product-details-wrapper">
                <h5 class="product-title">{{ selectedNewProduct?.tenSanPham }}</h5>
                <div class="product-badges">
                  <span class="spec-badge">{{ selectedNewProduct?.mauSac }}</span>
                  <span class="spec-badge">{{ selectedNewProduct?.dungLuongRam }}</span>
                  <span class="spec-badge">{{ selectedNewProduct?.dungLuongBoNhoTrong }}</span>
                </div>
                <div class="product-price">
                  <span class="price-label">Giá bán:</span>
                  <span class="price-value">{{ formatPrice(selectedNewProduct?.giaBan) }}</span>
                </div>
              </div>
            </div>

            <!-- IMEI Selection Section -->
            <div class="imei-selection-section">
              <div class="section-header">
                <h6 class="section-title">
                  <i class="bi bi-list-check me-2"></i>
                  Danh sách IMEI khả dụng
                </h6>
                <span class="imei-counter">{{ selectedIMEIsNew.length }}/{{ availableIMEIsNew.length }}</span>
              </div>

              <!-- Empty State -->
              <div v-if="availableIMEIsNew.length === 0" class="empty-imei-state">
                <i class="bi bi-inbox"></i>
                <p>Không có IMEI nào khả dụng</p>
              </div>

              <!-- IMEI List -->
              <div v-else class="imei-list">
                <div v-for="(imei, index) in availableIMEIsNew" :key="imei.id" class="imei-card"
                  :class="{ 'selected': selectedIMEIsNew.includes(imei.imei) }">
                  <div class="imei-card-content">
                    <div class="imei-checkbox">
                      <input type="checkbox" :id="'imei-' + imei.id" :value="imei.imei" v-model="selectedIMEIsNew"
                        class="custom-checkbox" />
                      <label :for="'imei-' + imei.id"></label>
                    </div>
                    <div class="imei-info">
                      <span class="imei-number">{{ imei.imei }}</span>
                      <span class="imei-index">#{{ index + 1 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-reset" @click="closeNewIMEIModal">
              <i class="bi bi-x-circle me-2"></i>
              Hủy bỏ
            </button>
            <button class="btn btn-action" @click="addProductWithIMEIsNew" :disabled="selectedIMEIsNew.length === 0">
              <i class="bi bi-check-circle me-2"></i>
              Thêm vào hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lịch sử thanh toán & Lịch sử hóa đơn & Tổng kết đơn hàng -->
    <div class="d-flex flex-wrap g-4 mb-4 animate__animated animate__fadeIn" style="--animate-delay: 0.5s;">
      <!-- Lịch sử thanh toán -->
      <div class="flex-child flex-history">
        <FilterTableSection title="Lịch Sử Thanh Toán" icon="bi bi-cash-stack" class="filter-table-section">
          <div class="section-body m-3">
            <div class="history-timeline">
              <div v-for="payment in payments" :key="payment.id" class="history-item"
                :class="{ 'completed': payment.status === 'completed' }">
                <div class="history-dot"></div>
                <div class="history-content">
                  <div class="history-title">
                    {{ payment.method }} - {{ formatPrice(payment.amount) }}
                  </div>
                  <div class="history-details">
                    <span class="code-text">{{ payment.code }}</span>
                    <span class="ms-2">({{ payment.confirmedBy }})</span>
                    <span class="history-time">{{ getPaymentTime(payment) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Lịch sử hóa đơn -->
        <FilterTableSection title="Lịch Sử Hóa Đơn" icon="bi bi-clock-history" class="filter-table-section">
          <div class="section-body m-3">
            <div class="history-timeline history-scrollable">
              <div v-for="item in history" :key="item.id" class="history-item"
                :class="{ 'completed': item.status === 'completed' }">
                <div class="history-dot"></div>
                <div class="history-content">
                  <div class="history-title">
                    {{ item.action }}
                  </div>
                  <div class="history-details">
                    <span>{{ item.employee }}</span>
                    <span class="ms-2" style="font-weight: 500;">{{ item.timestamp }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>

      <!-- Tổng kết đơn hàng -->
      <div class="flex-child flex-summary">
        <FilterTableSection title="Tổng Kết Đơn Hàng" icon="bi bi-calculator" class="filter-table-section">
          <div class="section-body">
            <div class="summary-container">
              <!-- Header thống kê -->
              <div class="summary-header">
                <div class="summary-icon">
                  <i class="bi bi-receipt"></i>
                </div>
                <div class="summary-title">
                  <h4>Chi Tiết Thanh Toán</h4>
                  <span class="summary-subtitle">Tổng kết đơn hàng</span>
                </div>
              </div>

              <!-- Chi tiết thanh toán -->
              <div class="payment-details">
                <div class="detail-item">
                  <div class="detail-left">
                    <div class="detail-icon subtotal">
                      <i class="bi bi-bag-check"></i>
                    </div>
                    <div class="detail-info">
                      <span class="detail-label">Tổng tiền hàng</span>
                      <span class="detail-desc">Giá trị sản phẩm</span>
                    </div>
                  </div>
                  <div class="detail-value">
                    <span class="amount">{{ formatPrice(totalPrice) }}</span>
                  </div>
                </div>

                <div class="detail-item discount-item">
                  <div class="detail-left">
                    <div class="detail-icon discount">
                      <i class="bi bi-percent"></i>
                    </div>
                    <div class="detail-info">
                      <span class="detail-label">Giảm giá</span>
                      <span class="detail-desc">Khuyến mãi áp dụng</span>
                    </div>
                  </div>
                  <div class="detail-value">
                    <span class="amount discount-amount">-{{ formatPrice(discount) }}</span>
                  </div>
                </div>

                <!-- Divider -->
                <div class="payment-divider">
                  <div class="divider-line"></div>
                  <div class="divider-icon">
                    <i class="bi bi-calculator"></i>
                  </div>
                  <div class="divider-line"></div>
                </div>

                <!-- Tổng tiền -->
                <div class="detail-item total-item">
                  <div class="detail-left">
                    <div class="detail-icon total">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                    <div class="detail-info">
                      <span class="detail-label">Thành tiền</span>
                      <span class="detail-desc">Số tiền phải thanh toán</span>
                    </div>
                  </div>
                  <div class="detail-value">
                    <span class="amount total-amount">{{ formatPrice(totalPrice - discount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer actions -->
              <div class="summary-footer">
                <div class="payment-status">
                  <i class="bi bi-check-circle-fill"></i>
                  <span>Đã xác nhận</span>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons m-3 animate__animated animate__fadeInUp d-flex gap-2 justify-content-end"
      style="--animate-delay: 0.6s;">
      <router-link to="/hoaDon" class="btn btn-reset">
        Quay lại
      </router-link>
      <button class="btn btn-action" @click="showUpdateModal">
        Cập nhật
      </button>
      <button class="btn btn-action" @click="printInvoice">
        In hóa đơn
      </button>
    </div>

    <!-- IMEI Modal -->
    <div v-if="isIMEIModalVisible" class="modal-backdrop-blur" @click.self="closeIMEIModal">
      <div class="modal-container glass-modal animate__animated animate__zoomIn">
        <div class="modal-header">
          <h5 class="modal-title">
            IMEI - {{ selectedProduct?.name }} {{ selectedProduct?.color }} {{ selectedProduct?.ram }} {{
              selectedProduct?.capacity }}
          </h5>
          <button class="btn-close-glass" @click="closeIMEIModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body imei-container">
          <div class="imei-input mb-3">
            <div class="input-group">
              <input v-model="newIMEI" type="text" class="form-control" placeholder="Nhập hoặc quét IMEI"
                @keyup.enter="addIMEI" />
            </div>
          </div>
          <div v-if="selectedProduct?.imeiList?.length" class="imei-list">
            <div v-for="(imeiObj, index) in selectedProduct.imeiList" :key="imeiObj.imei"
              class="imei-item animate__animated animate__fadeIn">
              <div class="imei-content">
                <span class="imei-code">IMEI: {{ imeiObj.imei }}</span>
                <span class="imei-status-badge" :class="getIMEIStatusClass(imeiObj.status)">
                  {{ imeiObj.status }}
                </span>
              </div>
              <button class="btn btn-sm btn-delete" @click="deleteIMEI(imeiObj.imei)" title="Xóa IMEI">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-info-circle"></i>
            Không có IMEI nào được chọn.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-reset" @click="closeIMEIModal">
            Đóng
          </button>
          <button class="btn btn-action" @click="saveIMEIChanges">
            Lưu
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm IMEI Modal -->
    <div v-if="isConfirmIMEIModalVisible" class="modal-backdrop-blur" @click.self="closeConfirmIMEIModal">
      <div class="modal-container glass-modal animate__animated animate__zoomIn">
        <div class="modal-header">
          <h5 class="modal-title">
            Xác Nhận IMEI - {{ selectedProduct?.name }} {{ selectedProduct?.color }} {{ selectedProduct?.ram }} {{
              selectedProduct?.capacity }}
          </h5>
          <button class="btn-close-glass" @click="closeConfirmIMEIModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="m-4">
            <div class="row g-4 align-items-end">
              <div class="col-lg-12">
                <div class="search-group">
                  <label class="filter-label">Tìm kiếm</label>
                  <div class="search-input-wrapper">
                    <i class="bi bi-search search-icon"></i>
                    <input type="text" class="form-control search-input" placeholder="Nhập mã IMEI hoặc IMEI..."
                      v-model="searchIMEI" @input="debouncedSearchIMEI($event.target.value)"
                      style="padding-left: 2.5rem;" />
                  </div>
                </div>
              </div>
            </div>
            <div class="filter-actions mt-3 d-flex justify-content-between align-items-center">
              <div class="filter-stats">
                <div class="stat-item">
                  <span class="stat-label">Tổng số IMEI: </span>
                  <span class="stat-value">{{ filteredIMEIs.length }}</span>
                </div>
              </div>
              <div class="action-buttons d-flex gap-2">
                <button class="btn btn-action" @click="scanQRForIMEI" title="Quét QR">
                  Quét QR
                </button>
                <button class="btn btn-reset" @click="resetIMEIFilters">
                  Đặt lại
                </button>
              </div>
            </div>
          </div>

          <!-- Table Section -->
          <div class="table-body">
            <DataTable title="" :headers="imeiHeaders" :data="filteredIMEIs"
              :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]" :rowClass="getRowClass">
              <template #stt="{ globalIndex }">
                {{ globalIndex + 1 }}
              </template>
              <template #maImel="{ item }">
                <span class="ma-imel-code" :class="{ 'text-muted': !item.maImel }">
                  {{ item.maImel || 'N/A' }}
                </span>
              </template>
              <template #imei="{ item }">
                <span class="imei-code">{{ item.imei || 'N/A' }}</span>
              </template>
              <template #ram="{ item }">
                <span>{{ item.ram || 'N/A' }}</span>
              </template>
              <template #capacity="{ item }">
                <span>{{ item.capacity || 'N/A' }}</span>
              </template>
              <template #color="{ item }">
                <span>{{ item.color || 'N/A' }}</span>
              </template>
              <template #price="{ item }">
                <span>{{ item.price ? formatPrice(item.price) : 'N/A' }}</span>
              </template>
              <template #status="{ item }">
                <span class="imei-status-badge" :class="getIMEIStatusClass(item.status)">
                  {{ item.status || 'N/A' }}
                </span>
              </template>
              <template #actions="{ item }">
                <div class="action-buttons-cell">
                  <button class="btn btn-sm btn-table" @click="selectIMEI(item.imei)" title="Chọn IMEI"
                    :disabled="item.status !== 'Còn hàng' || isLoadingIMEI">
                    <i v-if="!isLoadingIMEI" class="bi bi-plus-circle"></i>
                    <i v-else class="bi bi-spinner spinner-border spinner-border-sm"></i>
                  </button>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-reset" @click="closeConfirmIMEIModal">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Update Modal -->
    <div v-if="isUpdateModalVisible" class="modal-backdrop-blur" @click.self="closeUpdateModal">
      <div class="modal-container glass-modal animate__animated animate__zoomIn">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i> Cập Nhật Thông Tin
          </h5>
          <button class="btn-close-glass" @click="closeUpdateModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'order' }" @click="activeTab = 'order'">
                Thông Tin Đơn Hàng
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'customer' }" @click="activeTab = 'customer'">
                Thông Tin Khách Hàng
              </button>
            </li>
          </ul>
          <div v-if="activeTab === 'order'" class="tab-content">
            <div class="form-group mb-3">
              <label class="form-label">Mã đơn hàng</label>
              <input v-model="invoice.ma" type="text" class="form-control" placeholder="Nhập mã đơn hàng" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Loại đơn</label>
              <select v-model="invoice.loaiDon" class="form-select">
                <option value="online">online</option>
                <option value="trực tiếp">trực tiếp</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Trạng thái</label>
              <select v-model="invoice.trangThai" class="form-select" :disabled="invoice.loaiDon === 'trực tiếp'">
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Chờ giao hàng">Chờ giao hàng</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>
          <div v-if="activeTab === 'customer'" class="tab-content">
            <div class="form-group mb-3">
              <label class="form-label">Tên khách hàng</label>
              <input v-model="invoice.idKhachHang.ten" type="text" class="form-control"
                placeholder="Nhập tên khách hàng" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Số điện thoại</label>
              <input v-model="invoice.soDienThoaiKhachHang" type="text" class="form-control"
                placeholder="Nhập số điện thoại" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Địa chỉ</label>
              <input v-model="invoice.diaChiKhachHang" type="text" class="form-control" placeholder="Nhập địa chỉ" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Email</label>
              <input v-model="invoice.idKhachHang.email" type="email" class="form-control" placeholder="Nhập email" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-reset" @click="closeUpdateModal">
            Hủy
          </button>
          <button class="btn btn-action" @click="saveUpdateChanges">
            Lưu
          </button>
        </div>
      </div>
    </div>

    <!-- Divination Modal -->
    <div v-if="isDivinationModalVisible" class="modal-backdrop-blur" @click.self="closeDivinationModal">
      <div class="modal-container glass-modal animate__animated animate__zoomIn">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-dice-5 me-2"></i> Quét QR
          </h5>
          <button class="btn-close-glass" @click="closeDivinationModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="divination-content text-center">
            <h6>{{ divinationResult.title }}</h6>
            <p class="text-muted">{{ divinationResult.description }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-reset" @click="closeDivinationModal">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import HoaDonChiTiet from './js/HoaDonChiTiet';

export default {
  ...HoaDonChiTiet,
  computed: {
    isActionButtonsDisabled() {
      return ['Đang giao', 'Hoàn thành', 'Đã hủy'].includes(this.invoice.trangThai);
    }
  }
};
</script>

<style scoped>
/* Existing styles */
.history-timeline.history-scrollable {
  max-height: 300px;
  overflow-y: auto;
  padding-left: 1.5rem;
}

.history-timeline.history-scrollable::-webkit-scrollbar {
  width: 6px;
}

.history-timeline.history-scrollable::-webkit-scrollbar-track {
  background: rgba(52, 211, 153, 0.1);
  border-radius: 3px;
}

.history-timeline.history-scrollable::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.5);
  border-radius: 3px;
}

.products-list {
  max-height: 500px;
  overflow-y: auto;
}

.products-list::-webkit-scrollbar {
  width: 6px;
}

.products-list::-webkit-scrollbar-track {
  background: rgba(52, 211, 153, 0.1);
  border-radius: 3px;
}

.products-list::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.5);
  border-radius: 3px;
}

.timeline-step {
  cursor: pointer;
}

.btn-action:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.timeline-container.single-status {
  justify-content: center;
}

.timeline-container.single-status::before {
  display: none;
}

/* Updated styles for IMEI modal */
.imei-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.imei-item:hover {
  background: rgba(52, 211, 153, 0.1);
  box-shadow: 0 2px 8px rgba(52, 211, 153, 0.15);
}

.imei-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 0.75rem;
  margin: 0 1rem;
}

.imei-status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.btn-table {
  color: #1f3a44;
  font-size: 1.2rem;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.imei-status-valid {
  background: rgba(52, 211, 153, 0.2);
  color: #16a34a;
}

.imei-status-invalid {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.imei-status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

/* New styles for Confirm IMEI button */
.imei-index {
  width: 30px;
  font-weight: 600;
  color: #1f3a44;
  margin-right: 0.5rem;
}

/* Existing styles */
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

@keyframes subtlePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.invoice-detail-management {
  min-height: 100vh;
}

.timeline-container {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
}

.timeline-container::before {
  content: '';
  position: absolute;
  top: 25%;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #34d399, #16a34a);
  border-radius: 2px;
  transform: translateY(-50%);
}

.timeline-step {
  position: relative;
  text-align: center;
  flex: 1;
  margin: 0 1.5rem;
  transition: all 0.3s ease;
}

.step-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 2;
  margin: 0 auto 1rem;
  transition: transform 0.3s ease;
}

.timeline-step.completed .step-circle {
  background: linear-gradient(135deg, #34d399, #16a34a) !important;
  color: #ffffff !important;
  animation: subtlePulse 2s infinite;
}

.timeline-step.current .step-circle {
  background: linear-gradient(135deg, #34d399, #16a34a) !important;
  color: #ffffff !important;
  transform: scale(1.1);
}

.timeline-step.canceled .step-circle {
  background: #dc3545 !important;
  color: #ffffff !important;
  transform: scale(1.1);
  animation: subtlePulse 2s infinite;
}

.timeline-step.canceled .step-circle i {
  color: #ffffff !important;
}

.timeline-step .step-circle {
  background: #6c757d !important;
  color: #e9ecef !important;
  border: 2px solid #e5e7eb;
}

.step-content {
  padding: 0 0.5rem;
}

.step-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f3a44;
}

.step-time {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.glass-header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  padding: 1rem;
  border-radius: 12px 12px 0 0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f3a44;
}

.row.g-4.mb-4 {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.col-lg-6 {
  display: flex;
  flex: 1 1 50%;
  max-width: 50%;
}

.filter-table-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  flex: 1;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
  flex-shrink: 0;
}

.info-value {
  font-weight: 600;
  color: #1f3a44;
  text-align: right;
  display: flex;
  align-items: center;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-actions {
  padding: 0.5rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(52, 211, 153, 0.2);
  animation: gentleGlow 2s infinite;
}

.product-card-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.product-image {
  flex: 0 0 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3a44;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-amount {
  font-weight: 600;
  color: #16a34a;
  font-size: 1rem;
}

.quantity {
  font-size: 0.9rem;
  color: #6c757d;
}

.product-imei {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.imei-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.imei-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.product-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  background: rgba(248, 250, 252, 0.9);
}

.history-timeline {
  position: relative;
  padding-left: 1.5rem;
}

.history-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #34d399, #16a34a);
}

.history-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
}

.history-item.completed .history-dot {
  background: #34d399;
}

.history-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6c757d;
  position: absolute;
  left: -6px;
  top: 0.35rem;
  z-index: 1;
}

.history-content {
  flex: 1;
  padding-left: 1rem;
}

.history-title {
  font-weight: 600;
  color: #1f3a44;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.history-time {
  margin-left: auto;
  font-weight: 500;
}

.summary-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 300px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34d399, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.summary-title h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f3a44;
}

.summary-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.detail-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.detail-icon.subtotal {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.detail-icon.discount {
  background: rgba(255, 165, 0, 0.1);
  color: #ff8c00;
}

.detail-icon.total {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  color: #1f3a44;
  font-size: 0.95rem;
}

.detail-desc {
  font-size: 0.8rem;
  color: #6c757d;
}

.detail-value .amount {
  font-weight: 600;
  font-size: 1rem;
  color: #1f3a44;
}

.detail-value .discount-amount {
  color: #ff8c00;
}

.detail-value .total-amount {
  color: #16a34a;
  font-size: 1.1rem;
}

.payment-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(52, 211, 153, 0.2);
}

.divider-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
  font-size: 0.9rem;
}

.summary-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
}

.payment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #16a34a;
}

.btn-reset,
.btn-action,
.btn-view,
.btn-delete {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 10px rgba(108, 117, 125, 0.3);
}

.btn-action,
.btn-view {
  background: #34d399;
  color: white;
  border: none;
}

.btn-action:hover,
.btn-view:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-delete:hover {
  background: #c82333;
  color: white;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.3);
}

.type-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
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

.badge-waiting {
  background: #34d399;
  color: white;
}

.badge-shipping {
  background: #34d399;
  color: white;
}

.badge-delivering {
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

.code-text {
  font-family: 'Monaco', 'Menlo', monospace;
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.modal-backdrop-blur {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  z-index: 1040;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 1rem;
}

.glass-modal {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  padding: 1rem;
  border-radius: 16px 16px 0 0;
}

.modal-body {
  padding: .5rem;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  padding: 1rem;
  border-radius: 0 0 16px 16px;
}

.btn-close-glass {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close-glass:hover {
  background: rgba(220, 53, 69, 0.8);
  color: white;
}

.imei-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.imei-container::-webkit-scrollbar {
  width: 6px;
}

.imei-container::-webkit-scrollbar-track {
  background: rgba(52, 211, 153, 0.1);
  border-radius: 3px;
}

.imei-container::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.5);
  border-radius: 3px;
}

.imei-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(52, 211, 153, 0.05);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.imei-item:hover {
  background: rgba(52, 211, 153, 0.1);
}

.imei-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.imei-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1f3a44;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
}

.form-label {
  font-weight: 500;
  color: #1f3a44;
  margin-bottom: 0.5rem;
}

.nav-tabs {
  border-bottom: 1px solid rgba(52, 211, 153, 0.2);
}

.nav-tabs .nav-link {
  color: #1f3a44;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link.active {
  color: #16a34a;
  border-bottom: 2px solid #34d399;
  background: rgba(52, 211, 153, 0.05);
}

.nav-tabs .nav-link:hover {
  color: #16a34a;
  background: rgba(52, 211, 153, 0.05);
}

.d-flex.flex-wrap.g-4.mb-4 {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: stretch;
}

.flex-child.flex-history {
  flex: 2 1 65%;
  display: flex;
  flex-direction: column;
}

.flex-child.flex-summary {
  flex: 1 1 32%;
  display: flex;
  flex-direction: column;
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

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
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

@media (max-width: 992px) {

  .flex-child.flex-history,
  .flex-child.flex-summary {
    flex: 1 1 100%;
  }

  .col-lg-6 {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .timeline-container {
    flex-direction: column;
    gap: 2rem;
  }

  .timeline-container::before {
    top: 0;
    left: 50%;
    right: auto;
    width: 4px;
    height: 100%;
    transform: translateX(-50%);
  }

  .timeline-step {
    text-align: left;
    margin: 0;
  }

  .step-circle {
    margin: 0 0 0.5rem 0;
  }

  .step-content {
    padding-left: 1rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }

  .products-list {
    grid-template-columns: 1fr;
  }

  .product-card-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    width: 100%;
    height: 150px;
  }

  .product-card-actions {
    justify-content: flex-start;
  }

  .summary-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-value {
    text-align: left;
  }

  .history-timeline {
    padding-left: 1rem;
  }

  .history-dot {
    width: 10px;
    height: 10px;
    left: -5px;
  }

  .history-content {
    padding-left: 0.75rem;
  }

  .glass-modal {
    width: 90%;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.ma-imel-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1f3a44;
  font-size: 0.9rem;
}

.ma-imel-code.text-muted {
  color: #6c757d;
}

.action-icon {
  font-size: 1.2rem;
  color: #34d399;
  transition: all 0.2s ease;
}

.action-icon:hover {
  color: #16a34a;
  transform: scale(1.1);
}

.action-icon.text-muted {
  color: #6c757d;
  cursor: not-allowed;
}

/* Thêm style mới cho Modal IMEI */
.modal-dialog.modal-dialog-centered.modal-lg {
  max-width: 500px;
  /* Tăng độ rộng tối đa */
  width: 90%;
  /* Đảm bảo responsive */
  margin: 1.75rem auto;
}

.modal-content.shadow-lg.p-3.gradient-modal {
  min-height: 600px;
  /* Tăng chiều cao tối thiểu */
  max-height: 60vh;
  /* Giới hạn chiều cao tối đa */
  overflow-y: auto;
}

/* Thêm scrollbar style cho modal content */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(52, 211, 153, 0.1);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.5);
  border-radius: 3px;
}

/* Style cho modal chia đôi */
.split-modal {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
}

.split-view-left {
  flex: 0 0 60%;
  padding: 1rem;
  border-right: 1px solid rgba(52, 211, 153, 0.1);
}

.split-view-right {
  flex: 0 0 40%;
  padding: 1rem;
  background: rgba(52, 211, 153, 0.05);
}

.gradient-header {
  background: linear-gradient(135deg, #34d399 0%, #16a34a 100%);
  color: white;
  border-bottom: none;
}

.gradient-header .modal-title {
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.btn-close-modern {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close-modern:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.imei-selection-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.product-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.product-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-details-wrapper {
  flex: 1;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.spec-badge {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.price-value {
  color: #16a34a;
  font-weight: 600;
  font-size: 1.1rem;
}

.imei-selection-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.section-title {
  margin: 0;
  color: #1f3a44;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.imei-counter {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.empty-imei-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.empty-imei-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.imei-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.imei-card {
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.imei-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.imei-card.selected {
  background: rgba(52, 211, 153, 0.1);
  border-color: #34d399;
}

.imei-card-content {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
}

.imei-checkbox {
  position: relative;
}

.custom-checkbox {
  display: none;
}

.custom-checkbox+label {
  width: 20px;
  height: 20px;
  border: 2px solid #34d399;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-checkbox:checked+label::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #34d399;
  font-size: 14px;
}

.imei-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.imei-number {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: #1f3a44;
  font-weight: 500;
}

.imei-index {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .split-modal {
    flex-direction: column;
  }

  .split-view-left,
  .split-view-right {
    flex: none;
    width: 100%;
  }

  .product-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-badges {
    justify-content: center;
  }

  .imei-list {
    grid-template-columns: 1fr;
  }
}
</style>