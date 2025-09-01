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
          }" @click="changeStatus(status.title)" :disabled="isActionButtonsDisabled">
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
          <button class="btn btn-custom-green" @click="isAddProductModalVisible = true" :disabled="isActionButtonsDisabled">
            Thêm Sản Phẩm
          </button>
          <button class="btn btn-custom-green" @click="showBulkConfirmIMEIModal" :disabled="isActionButtonsDisabled || !hasProductsNeedingIMEI">
            Xác Nhận IMEI
          </button>
        </div>
        <div class="products-list">
          <div v-for="groupedProduct in groupedProducts" :key="groupedProduct.id"
            class="product-card animate__animated animate__zoomIn" style="--animate-delay: 0.4s;">
            <div class="product-card-content">
              <div class="product-image">
                <img :src="groupedProduct.image || '/assets/placeholder-product.png'" alt="Product Image"
                  class="product-img" />
              </div>
              <div class="product-details">
                <h6 class="product-name">{{ groupedProduct.name }} {{ groupedProduct.color }} {{ groupedProduct.ram }}
                  {{ groupedProduct.capacity }}</h6>
                <div class="product-price">
                  <span class="price-amount">{{ formatPrice(groupedProduct.price) }}</span>
                  <span class="quantity">x{{ groupedProduct.quantity }}</span>
                </div>
                <!-- <div class="product-imei" v-if="groupedProduct.imeis.length">
                  <span class="imei-label">IMEI:</span>
                  <span v-for="(imei, index) in groupedProduct.imeis" :key="index" class="imei-code">
                    {{ truncateIMEI(imei) }}{{ index < groupedProduct.imeis.length - 1 ? ', ' : '' }}</span>
                </div> -->
              </div>
            </div>
            <div class="product-card-actions">
              <button class="btn btn-sm btn-view" @click="showViewIMEIModal(groupedProduct)" title="Xem IMEI">
                Xem IMEI
              </button>
              <button class="btn btn-sm btn-delete" @click="removeProduct(groupedProduct)" title="Xóa sản phẩm"
                :disabled="isActionButtonsDisabled">
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Modal Thêm Sản Phẩm (Redesigned) -->
    <div v-if="isAddProductModalVisible" class="modal-backdrop-blur" @click.self="isAddProductModalVisible = false">
      <div class="modal-container glass-modal modern-modal animate__animated animate__zoomIn">
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="bi bi-plus-circle"></i>
            </div>
            <div class="header-text">
              <h4 class="modal-title">Thêm Sản Phẩm Vào Hóa Đơn</h4>
              <p class="modal-subtitle">Chọn sản phẩm để thêm vào hóa đơn hiện tại</p>
            </div>
          </div>
          <button class="btn-close-modern" @click="isAddProductModalVisible = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body modern-body">
          <!-- Search and Filter Section -->
          <div class="search-filter-section">
            <div class="search-bar">
              <div class="search-input-group">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  class="form-control search-input" 
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..." 
                  v-model="productSearchQuery"
                  @input="debouncedSearchProduct($event.target.value)"
                />
                <button v-if="productSearchQuery" class="clear-search" @click="productSearchQuery = ''">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            
            <div class="filter-row">
              <div class="filter-group">
                <label class="filter-label">Màu sắc</label>
                <select v-model="filterColor" class="form-select filter-select">
                  <option value="">Tất cả</option>
                  <option v-for="color in uniqueColors" :key="color" :value="color">{{ color }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">RAM</label>
                <select v-model="filterRam" class="form-select filter-select">
                  <option value="">Tất cả</option>
                  <option v-for="ram in uniqueRams" :key="ram" :value="ram">{{ ram }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">Bộ nhớ</label>
                <select v-model="filterStorage" class="form-select filter-select">
                  <option value="">Tất cả</option>
                  <option v-for="storage in uniqueStorages" :key="storage" :value="storage">{{ storage }}</option>
                </select>
              </div>
              <div class="filter-actions">
                <button class="btn btn-secondary btn-sm" @click="resetProductFilters">
                  <i class="bi bi-arrow-clockwise me-1" style="font-size: 20px;"></i>
                </button>
              </div>
            </div>
            
            <div class="results-info">
              <span class="results-count">
                <i class="bi bi-grid me-1"></i>
                Hiển thị {{ filteredProducts.length }} sản phẩm
              </span>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="products-grid-container">
            <div v-if="filteredProducts.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-box"></i>
              </div>
              <h5>Không tìm thấy sản phẩm</h5>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
            
            <div v-else class="products-grid">
              <div 
                v-for="product in paginatedProducts" 
                :key="product.chiTietSanPhamId"
                class="product-card-modern"
                :class="{ 'unavailable': product.trangThai !== 'Còn hàng' }"
              >
                <div class="product-image-container">
                  <img 
                    :src="product.duongDan || product.anhSanPham || '/assets/placeholder-product.png'" 
                    :alt="product.tenSanPham"
                    class="product-image"
                  />
                  <div v-if="product.trangThai !== 'Còn hàng'" class="unavailable-overlay">
                    <span>Hết hàng</span>
                  </div>
                </div>
                
                <div class="product-info">
                  <h6 class="product-name">{{ product.tenSanPham }}</h6>
                  <div class="product-specs">
                    <span class="spec-tag color">{{ product.mauSac }}</span>
                    <span class="spec-tag ram">{{ product.dungLuongRam }}</span>
                    <span class="spec-tag storage">{{ product.dungLuongBoNhoTrong }}</span>
                  </div>
                  <div class="product-price">
                    <span class="price">{{ formatPrice(product.giaBan) }}</span>
                  </div>
                </div>
                
                <div class="product-actions">
                  <button 
                    class="btn btn-custom-green"
                    :disabled="product.trangThai !== 'Còn hàng'"
                    @click="selectProductForIMEI(product)"
                  >
                    <i class="bi bi-plus-lg me-1"></i>
                    Chọn sản phẩm
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Pagination -->
            <div v-if="totalProductPages > 1" class="pagination-container">
              <nav>
                <ul class="pagination pagination-modern">
                  <li class="page-item" :class="{ disabled: productCurrentPage === 1 }">
                    <button class="page-link" @click="updateProductPage(productCurrentPage - 1)" :disabled="productCurrentPage === 1">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li 
                    v-for="page in Math.min(5, totalProductPages)" 
                    :key="page" 
                    class="page-item" 
                    :class="{ active: page === productCurrentPage }"
                  >
                    <button class="page-link" @click="updateProductPage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: productCurrentPage === totalProductPages }">
                    <button class="page-link" @click="updateProductPage(productCurrentPage + 1)" :disabled="productCurrentPage === totalProductPages">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Standalone IMEI Selection Modal -->
    <div v-if="isIMEISelectionModalVisible" class="modal-backdrop-blur" @click.self="closeIMEISelectionModal">
      <div class="modal-container glass-modal imei-modal animate__animated animate__zoomIn">
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="bi bi-upc-scan"></i>
            </div>
            <div class="header-text">
              <h4 class="modal-title">Chọn IMEI Cho Sản Phẩm</h4>
              <p class="modal-subtitle">Chọn IMEI để thêm sản phẩm vào hóa đơn</p>
            </div>
          </div>
          <button class="btn-close-modern" @click="closeIMEISelectionModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body modern-body">
          <!-- Selected Product Info -->
          <div class="selected-product-info">
            <div class="product-preview">
              <div class="product-image-wrapper">
                <img 
                  :src="selectedProductForIMEI?.duongDan || selectedProductForIMEI?.anhSanPham || '/assets/placeholder-product.png'" 
                  :alt="selectedProductForIMEI?.tenSanPham"
                  class="product-preview-image"
                />
              </div>
              <div class="product-details">
                <h5 class="product-name">{{ selectedProductForIMEI?.tenSanPham }}</h5>
                <div class="product-specs">
                  <span class="spec-badge color">{{ selectedProductForIMEI?.mauSac }}</span>
                  <span class="spec-badge ram">{{ selectedProductForIMEI?.dungLuongRam }}</span>
                  <span class="spec-badge storage">{{ selectedProductForIMEI?.dungLuongBoNhoTrong }}</span>
                </div>
                <div class="product-price-info">
                  <span class="price-label">Giá bán:</span>
                  <span class="price-value">{{ formatPrice(selectedProductForIMEI?.giaBan) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- IMEI Search -->
          <div class="imei-search-section">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control search-input" 
                placeholder="Tìm kiếm IMEI..." 
                v-model="imeiSearchQuery"
                @input="debouncedSearchIMEIForProduct($event.target.value)"
              />
              <button v-if="imeiSearchQuery" class="clear-search" @click="imeiSearchQuery = ''">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div class="search-actions">
              <button class="btn btn-custom-green btn-sm" @click="scanQRForIMEI">
                <i class="bi bi-qr-code-scan me-1" style="font-size: 20px;"></i>
              </button>
            </div>
          </div>

          <!-- IMEI Selection Info -->
          <div class="selection-info">
            <div class="info-item">
              <span class="info-label">Đã chọn:</span>
              <span class="info-value">{{ selectedIMEIsForProduct.length }} IMEI</span>
            </div>
            <div class="info-item">
              <span class="info-label">Khả dụng:</span>
              <span class="info-value">{{ filteredAvailableIMEIs.length }} IMEI</span>
            </div>
          </div>

          <!-- IMEI List -->
          <div class="imei-list-container">
            <div v-if="filteredAvailableIMEIs.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-inbox"></i>
              </div>
              <h5>Không có IMEI khả dụng</h5>
              <p>Không tìm thấy IMEI nào cho sản phẩm này</p>
            </div>
            
            <div v-else class="imei-table-wrapper">
              <div class="imei-table-scroll">
                <table class="table table-hover imei-table">
                  <thead class="table-header">
                    <tr>
                      <th class="select-column">
                        <input 
                          type="checkbox" 
                          class="form-check-input select-all-checkbox"
                          :checked="selectedIMEIsForProduct.length === filteredAvailableIMEIs.length && filteredAvailableIMEIs.length > 0"
                          :indeterminate="selectedIMEIsForProduct.length > 0 && selectedIMEIsForProduct.length < filteredAvailableIMEIs.length"
                          @change="toggleSelectAllIMEIs"
                        />
                      </th>
                      <th class="index-column">#</th>
                      <th class="imei-column">Mã IMEI</th>
                      <th class="status-column">Trạng thái</th>
                      <th class="action-column">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(imei, index) in paginatedAvailableIMEIs" 
                      :key="imei.id || imei.imei"
                      class="imei-row"
                      :class="{ 'selected-row': selectedIMEIsForProduct.includes(imei.imei) }"
                      @click="toggleIMEISelection(imei.imei)"
                    >
                      <td class="select-column">
                        <input 
                          type="checkbox" 
                          :id="'imei-select-' + (imei.id || index)"
                          :checked="selectedIMEIsForProduct.includes(imei.imei)"
                          @change="toggleIMEISelection(imei.imei)"
                          @click.stop
                          class="form-check-input imei-checkbox"
                        />
                      </td>
                      <td class="index-column">
                        <span class="row-index">{{ (imeiCurrentPage - 1) * 10 + index + 1 }}</span>
                      </td>
                      <td class="imei-column">
                        <div class="imei-info">
                          <span class="imei-number imei-code">{{ imei.imei }}</span>
                        </div>
                      </td>
                      <td class="status-column">
                        <span class="badge imei-status-badge" :class="getIMEIStatusClass(imei.status || 'Còn hàng')">
                          {{ imei.status || 'Còn hàng' }}
                        </span>
                      </td>
                      <td class="action-column">
                        <button 
                          class="btn btn-sm select-btn"
                          @click.stop="toggleIMEISelection(imei.imei)"
                          :class="selectedIMEIsForProduct.includes(imei.imei) ? 'btn-custom-green' : 'btn-outline-custom-green'"
                        >
                          <i class="bi" :class="selectedIMEIsForProduct.includes(imei.imei) ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                          {{ selectedIMEIsForProduct.includes(imei.imei) ? 'Đã chọn' : 'Chọn' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- IMEI Pagination -->
            <div v-if="totalIMEIPagesForProduct > 1" class="pagination-container">
              <nav>
                <ul class="pagination pagination-modern pagination-sm">
                  <li class="page-item" :class="{ disabled: imeiCurrentPage === 1 }">
                    <button class="page-link" @click="updateIMEIPageForProduct(imeiCurrentPage - 1)" :disabled="imeiCurrentPage === 1">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li 
                    v-for="page in Math.min(3, totalIMEIPagesForProduct)" 
                    :key="page" 
                    class="page-item" 
                    :class="{ active: page === imeiCurrentPage }"
                  >
                    <button class="page-link" @click="updateIMEIPageForProduct(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: imeiCurrentPage === totalIMEIPagesForProduct }">
                    <button class="page-link" @click="updateIMEIPageForProduct(imeiCurrentPage + 1)" :disabled="imeiCurrentPage === totalIMEIPagesForProduct">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div class="modal-footer modern-footer">
          <div class="footer-info">
            <span class="selection-summary">
              <i class="bi bi-check-circle me-1"></i>
              {{ selectedIMEIsForProduct.length }} IMEI đã chọn
            </span>
          </div>
          <div class="footer-actions">
            <button class="btn btn-outline-secondary" @click="closeIMEISelectionModal">
              <i class="bi bi-x-lg me-1"></i>
              Hủy bỏ
            </button>
            <button 
              class="btn btn-custom-green" 
              @click="confirmAddProductWithIMEI" 
              :disabled="selectedIMEIsForProduct.length === 0 || isAddingProduct"
            >
              <i v-if="!isAddingProduct" class="bi bi-plus-lg me-1"></i>
              <i v-else class="bi bi-spinner spinner-border spinner-border-sm me-1"></i>
              {{ isAddingProduct ? 'Đang thêm...' : 'Thêm vào hóa đơn' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lịch sử thanh toán & Lịch sử hóa đơn & Tổng kết đơn hàng -->
    <div class="d-flex flex-wrap g-4 mb-4 animate__animated animate__fadeIn" style="--animate-delay: 0.5s;">
      <!-- Lịch sử thanh toán -->
      <div class="flex-child flex-history">
        <!-- Nhập Thông Tin Thanh Toán -->
        <FilterTableSection title="Nhập Thông Tin Thanh Toán" icon="bi bi-cash-coin" class="filter-table-section mb-4"
          v-if="invoice.trangThai !== 'Hoàn thành' && invoice.trangThai !== 'Đã hủy'">
          <div class="section-body m-3">
            <div class="payment-input-section">
              <div class="payment-input-header mb-3">
                <small class="text-muted">Nhập số tiền khách hàng thanh toán trước khi xác nhận hoàn thành đơn
                  hàng</small>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">
                    <i class="bi bi-credit-card me-1"></i>
                    Tiền chuyển khoản (VND)
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-bank"></i>
                    </span>
                    <input type="number" class="form-control payment-input" v-model="paymentData.chuyenKhoan"
                      placeholder="Nhập số tiền chuyển khoản" min="0" :max="totalPrice - discount"
                      @input="calculateRemainingAmount" />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">
                    <i class="bi bi-cash me-1"></i>
                    Tiền mặt (VND)
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-wallet2"></i>
                    </span>
                    <input type="number" class="form-control payment-input" v-model="paymentData.tienMat"
                      placeholder="Nhập số tiền mặt" min="0" :max="totalPrice - discount"
                      @input="calculateRemainingAmount" />
                  </div>
                </div>
              </div>

              <!-- Thông tin tổng kết thanh toán -->
              <div class="payment-summary mt-3 p-3 bg-light rounded">
                <div class="row text-center">
                  <div class="col-md-3">
                    <div class="summary-item">
                      <span class="summary-label">Tổng tiền cần thanh toán</span>
                      <span class="summary-value text-primary">{{ formatPrice(totalPrice - discount) }}</span>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="summary-item">
                      <span class="summary-label">Đã thanh toán</span>
                      <span class="summary-value text-success">{{ formatPrice(totalPaid) }}</span>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="summary-item">
                      <span class="summary-label">Còn lại</span>
                      <span class="summary-value" :class="remainingAmount > 0 ? 'text-warning' : 'text-success'">
                        {{ formatPrice(remainingAmount) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-success btn-sm" @click="confirmPayment"
                      :disabled="remainingAmount > 0 || totalPaid === 0">
                      <i class="bi bi-check-circle me-1"></i>
                      Xác nhận thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <FilterTableSection title="Lịch Sử Thanh Toán" icon="bi bi-cash-stack" class="filter-table-section">
          <div class="section-body m-3">
            <!-- Timeline thanh toán hiện tại -->
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
      <button class="btn btn-custom-green" @click="showUpdateModal">
        Cập nhật
      </button>
      <button class="btn btn-custom-green" @click="printInvoice">
        In hóa đơn
      </button>
    </div>

    <!-- IMEI Modal -->
    <template>
      <div v-if="isIMEIModalVisible" class="modal fade show" style="display: block;">
        <div class="modal-dialog split-modal">
          <div class="modal-content">
            <div class="modal-header gradient-header">
              <h5 class="modal-title">Chọn IMEI cho {{ selectedProduct.name }}</h5>
              <button class="btn-close-modern" @click="closeIMEIModal"></button>
            </div>
            <div class="modal-body">
              <div class="imei-selection-container">
                <div class="product-info-card">
                  <div class="product-image-wrapper">
                    <img :src="selectedProduct.image" class="product-preview-image" />
                  </div>
                  <div class="product-details-wrapper">
                    <h6 class="product-title">{{ selectedProduct.name }}</h6>
                    <div class="product-badges">
                      <span class="spec-badge">{{ selectedProduct.color }}</span>
                      <span class="spec-badge">{{ selectedProduct.ram }}</span>
                      <span class="spec-badge">{{ selectedProduct.capacity }}</span>
                    </div>
                    <div class="product-price">
                      <span class="price-label">Giá:</span>
                      <span class="price-value">{{ formatPrice(selectedProduct.price) }}</span>
                    </div>
                  </div>
                </div>
                <div class="imei-selection-section">
                  <div class="section-header">
                    <h6 class="section-title">Danh sách IMEI</h6>
                    <span class="imei-counter">{{ getSelectedIMEICount(selectedProduct.groupKey ||
                      selectedProduct.chiTietSanPhamId) }}/{{ selectedProduct.quantity }} đã chọn</span>
                  </div>
                  <div class="imei-list" v-if="availableIMEIsNew.length > 0">
                    <div v-for="(imei, index) in paginatedIMEIs" :key="index" class="imei-card"
                      :class="{ selected: isIMEISelected(imei.imel, selectedProduct.groupKey || selectedProduct.chiTietSanPhamId) }"
                      @click="selectIMEI(imei.imel, selectedProduct.groupKey || selectedProduct.chiTietSanPhamId)">
                      <div class="imei-card-content">
                        <div class="imei-checkbox">
                          <input type="checkbox" class="custom-checkbox" :value="imei.imel"
                            :checked="isIMEISelected(imei.imel, selectedProduct.groupKey || selectedProduct.chiTietSanPhamId)"
                            @change="selectIMEI(imei.imel, selectedProduct.groupKey || selectedProduct.chiTietSanPhamId)" />
                          <label></label>
                        </div>
                        <div class="imei-info">
                          <span class="imei-number">{{ truncateIMEI(imei.imel) }}</span>
                          <span class="imei-index">STT: {{ index + 1 }}</span>
                        </div>
                        hello_world
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-imei-state">
                    <i class="bi bi-box"></i>
                    <p>Không có IMEI nào khả dụng</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeIMEIModal">Hủy</button>
              <button class="btn btn-primary" @click="confirmSelectedIMEIs"
                :disabled="isConfirmingIMEI || getSelectedIMEICount(selectedProduct.groupKey || selectedProduct.chiTietSanPhamId) === 0">Xác
                nhận</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Confirm IMEI Modal -->
    <div v-if="isConfirmIMEIModalVisible" class="modal-backdrop-blur" @click.self="closeConfirmIMEIModal">
      <div class="modal-container glass-modal modern-modal animate__animated animate__zoomIn">
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="bi bi-upc-scan"></i>
            </div>
            <div class="header-text">
              <h4 class="modal-title">Xác Nhận IMEI</h4>
              <p class="modal-subtitle">{{ selectedProduct?.name }} {{ selectedProduct?.color }} {{ selectedProduct?.ram }} {{ selectedProduct?.capacity }}</p>
            </div>
          </div>
          <button class="btn-close-modern" @click="closeConfirmIMEIModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body modern-body">
          <!-- Search Section -->
          <div class="search-filter-section">
            <div class="search-bar">
              <div class="search-input-group">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  class="form-control search-input" 
                  placeholder="Tìm kiếm IMEI..." 
                  v-model="searchIMEI"
                  @input="debouncedSearchIMEI($event.target.value)"
                />
                <button v-if="searchIMEI" class="clear-search" @click="searchIMEI = ''">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            
            <div class="filter-actions">
              <button class="btn btn-custom-green btn-sm" @click="scanQRForIMEI">
                <i class="bi bi-qr-code-scan me-1"></i>
                Quét QR
              </button>
              <button class="btn btn-secondary btn-sm" @click="resetIMEIFilters">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Đặt lại
              </button>
            </div>
            
            <div class="results-info">
              <span class="results-count">
                <i class="bi bi-grid me-1"></i>
                Hiển thị {{ filteredIMEIs.length }} IMEI
              </span>
            </div>
          </div>

          <!-- Table Section -->
          <div class="imei-table-wrapper">
            <div class="imei-table-scroll">
              <table class="table table-hover imei-table">
                <thead class="table-header">
                  <tr>
                    <th class="select-column">
                      <input 
                        type="checkbox" 
                        class="form-check-input select-all-checkbox"
                        :checked="getSelectedIMEICount() === filteredIMEIs.length && filteredIMEIs.length > 0"
                        :indeterminate="getSelectedIMEICount() > 0 && getSelectedIMEICount() < filteredIMEIs.length"
                        @change="toggleSelectAllConfirmIMEIs"
                      />
                    </th>
                    <th class="index-column">#</th>
                    <th class="imei-column">Mã IMEI</th>
                    <th class="status-column">Trạng thái</th>
                    <th class="action-column">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(imei, index) in filteredIMEIs" 
                    :key="imei.id || imei.imei"
                    class="imei-row"
                    :class="{ 'selected-row': isIMEISelected(imei.imei) }"
                    @click="selectIMEI(imei.imei)"
                  >
                    <td class="select-column">
                      <input 
                        type="checkbox" 
                        :id="'confirm-imei-select-' + (imei.id || index)"
                        :checked="isIMEISelected(imei.imei)"
                        @change="selectIMEI(imei.imei)"
                        @click.stop
                        class="form-check-input imei-checkbox"
                      />
                    </td>
                    <td class="index-column">
                      <span class="row-index">{{ index + 1 }}</span>
                    </td>
                    <td class="imei-column">
                      <div class="imei-info">
                        <span class="imei-number imei-code">{{ imei.imei || 'N/A' }}</span>
                      </div>
                    </td>
                    <td class="status-column">
                      <span class="badge imei-status-badge" :class="getIMEIStatusClass(imei.status)">
                        {{ imei.status || 'N/A' }}
                      </span>
                    </td>
                    <td class="action-column">
                      <button 
                        class="btn btn-sm select-btn"
                        @click.stop="selectIMEI(imei.imei)"
                        :class="isIMEISelected(imei.imei) ? 'btn-custom-green' : 'btn-outline-custom-green'"
                        :disabled="item.status !== 'Còn hàng' || isLoadingIMEI"
                      >
                        <i class="bi" :class="isIMEISelected(imei.imei) ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                        {{ isIMEISelected(imei.imei) ? 'Đã chọn' : 'Chọn' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer modern-footer">
          <div class="footer-info">
            <span class="selection-summary">
              <i class="bi bi-check-circle me-1"></i>
              {{ getSelectedIMEICount() }}/{{ selectedProduct?.needsIMEI || selectedProduct?.quantity }} IMEI đã chọn
            </span>
          </div>
          <div class="footer-actions">
            <button class="btn btn-outline-secondary" @click="closeConfirmIMEIModal">
              <i class="bi bi-x-lg me-1"></i>
              Hủy bỏ
            </button>
            <button class="btn btn-custom-green" @click="confirmSelectedIMEIs" :disabled="isConfirmingIMEI">
              <i v-if="!isConfirmingIMEI" class="bi bi-check-circle me-1"></i>
              <i v-else class="bi bi-spinner spinner-border spinner-border-sm me-1"></i>
              {{ isConfirmingIMEI ? 'Đang xác nhận...' : 'Xác nhận IMEI' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk IMEI Confirmation Modal -->
    <div v-if="isBulkConfirmIMEIModalVisible" class="modal-backdrop-blur" @click.self="closeBulkConfirmIMEIModal">
      <div class="modal-container glass-modal bulk-modal animate__animated animate__zoomIn">
        <!-- Modal Header -->
        <div class="modal-header gradient-header">
          <h5 class="modal-title">
            Xác Nhận IMEI - Sản phẩm {{ currentBulkProductIndex + 1 }}/{{ bulkConfirmProducts.length }}
          </h5>
          <button class="btn-close-modern" @click="closeBulkConfirmIMEIModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Progress Indicator -->
        <div class="bulk-progress-container p-3 bg-light">
          <div class="progress-dots d-flex justify-content-center gap-2 mb-2">
            <div v-for="(product, index) in bulkConfirmProducts" :key="index" 
                 class="progress-dot" 
                 :class="{
                   'completed': index < currentBulkProductIndex,
                   'current': index === currentBulkProductIndex,
                   'pending': index > currentBulkProductIndex
                 }">
              <i class="bi bi-check" v-if="index < currentBulkProductIndex"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
          </div>
          <div class="progress-text text-center">
            <small class="text-muted">
              Đã hoàn thành: {{ currentBulkProductIndex }}/{{ bulkConfirmProducts.length }} sản phẩm
            </small>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" v-if="currentBulkProduct">
          <!-- Product Info Section -->
          <div class="bulk-product-info mb-4">
            <div class="d-flex align-items-center gap-3">
              <div class="product-image-small">
                <img :src="currentBulkProduct.image || '/assets/placeholder-product.png'" 
                     :alt="currentBulkProduct.name" 
                     class="img-fluid rounded" 
                     style="width: 80px; height: 80px; object-fit: cover;" />
              </div>
              <div class="product-info-text">
                <h6 class="mb-2">{{ currentBulkProduct.name }}</h6>
                <div class="d-flex gap-2 mb-2">
                  <span class="spec-badge-small">{{ currentBulkProduct.color }}</span>
                  <span class="spec-badge-small">{{ currentBulkProduct.ram }}</span>
                  <span class="spec-badge-small">{{ currentBulkProduct.capacity }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="price-text">{{ formatPrice(currentBulkProduct.price) }}</span>
                  <span class="need-imei-badge">Cần {{ currentBulkProduct.needsIMEI }} IMEI</span>
                </div>
              </div>
            </div>
          </div>

          <!-- IMEI Selection Section -->
          <div class="imei-selection-section">
            <div class="section-header d-flex justify-content-between align-items-center mb-3">
              <h6 class="section-title mb-0">
                <i class="bi bi-list-check me-2"></i>
                Danh sách IMEI khả dụng
              </h6>
              <span class="imei-counter badge bg-info">
                {{ getBulkSelectedIMEICount() }}/{{ currentBulkProduct.needsIMEI }} đã chọn
              </span>
            </div>

            <!-- Search IMEI -->
            <div class="search-group mb-3">
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" class="form-control search-input" 
                       placeholder="Tìm kiếm IMEI..." 
                       v-model="bulkSearchIMEI"
                       style="padding-left: 2.5rem;" />
              </div>
            </div>

            <!-- IMEI List -->
            <div class="bulk-imei-scroll-container">
              <div v-if="isLoadingBulkIMEI" class="text-center py-4 text-muted">
                <i class="bi bi-hourglass-split me-2"></i>Đang tải IMEI...
              </div>
              
              <div v-else-if="!isLoadingBulkIMEI && bulkAvailableIMEIs.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-inbox me-2"></i>Không có IMEI khả dụng cho sản phẩm này
              </div>
              
              <div v-else-if="filteredBulkIMEIs.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-search me-2"></i>Không tìm thấy IMEI phù hợp
              </div>
              
              <div v-else class="bulk-imei-list">
                <div v-for="(imei, index) in filteredBulkIMEIs" :key="imei.id || index" 
                     class="bulk-imei-item" 
                     :class="{ 'selected': isBulkIMEISelected(imei.imei) }"
                     @click="toggleBulkIMEISelection(imei.imei)">
                  <input type="checkbox" 
                         :id="'bulk-imei-' + index" 
                         :value="imei.imei" 
                         :checked="isBulkIMEISelected(imei.imei)"
                         @change="toggleBulkIMEISelection(imei.imei)"
                         class="me-3" />
                  <span class="imei-code">{{ imei.imei }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div class="navigation-buttons">
              <button class="btn btn-outline-secondary me-2" 
                      @click="previousBulkProduct"
                      :disabled="currentBulkProductIndex === 0">
                <i class="bi bi-chevron-left me-1"></i>Trước
              </button>
              <button class="btn btn-outline-secondary" 
                      @click="nextBulkProduct"
                      :disabled="isLastBulkProduct">
                Tiếp <i class="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
            
            <div class="action-buttons">
              <button class="btn btn-secondary me-2" @click="closeBulkConfirmIMEIModal">
                Hủy
              </button>
              <button class="btn btn-success" 
                      @click="confirmAllBulkIMEIs"
                      :disabled="isConfirmingBulkIMEI">
                <span v-if="isConfirmingBulkIMEI" class="spinner-border spinner-border-sm me-2"></span>
                Xác nhận tất cả IMEI
              </button>
            </div>
          </div>
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

    <!-- View IMEI Modal -->
    <div v-if="isViewIMEIModalVisible" class="modal-backdrop-blur" @click.self="closeViewIMEIModal">
      <div class="modal-container glass-modal large-modal animate__animated animate__zoomIn">
        <div class="modal-header gradient-header">
          <h5 class="modal-title">
            Danh Sách IMEI - {{ selectedProduct?.name }} {{ selectedProduct?.color }} {{ selectedProduct?.ram }} {{
              selectedProduct?.capacity }}
          </h5>
          <button class="btn-close-modern" @click="closeViewIMEIModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="isLoadingViewIMEI" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-3 text-muted">Đang tải danh sách IMEI...</p>
          </div>

          <!-- IMEI Table -->
          <div v-else-if="viewIMEIData.length > 0" class="table-body">
            <DataTable title="" :headers="viewIMEIHeaders" :data="viewIMEIData" :pageSizeOptions="[5, 10, 20, 50]">
              <template #stt="{ globalIndex }">
                {{ globalIndex + 1 }}
              </template>
              <template #imei="{ item }">
                <span class="imei-code">{{ item.imei || item.maImei || 'N/A' }}</span>
              </template>
              <template #tenSanPham="{ item }">
                <span>{{ item.tenSanPham || item.productName || 'N/A' }}</span>
              </template>
              <template #ram="{ item }">
                <span>{{ item.ram || item.dungLuongRam || 'N/A' }}</span>
              </template>
              <template #dungLuongBoNhoTrong="{ item }">
                <span>{{ item.dungLuongBoNhoTrong || item.boNho || item.capacity || item.dungLuongBoNho || item.storage
                  || item.memory || '256GB' }}</span>
              </template>
              <template #mauSac="{ item }">
                <span>{{ item.mauSac || item.color || 'N/A' }}</span>
              </template>
              <template #giaBan="{ item }">
                <span>{{ item.giaBan ? formatPrice(item.giaBan) : 'N/A' }}</span>
              </template>
              <template #ngayBan="{ item }">
                <span>{{ formatDate(item.ngayBan || item.saleDate) || 'N/A' }}</span>
              </template>
            </DataTable>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state text-center py-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <h5 class="mt-3 text-muted">Không có IMEI nào</h5>
            <p class="text-muted">Chưa có IMEI nào được gán cho sản phẩm này trong hóa đơn.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" @confirm="notificationOnConfirm" @cancel="notificationOnCancel" />

    <!-- Toast Notification -->
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import HoaDonChiTietLogic from './js/HoaDonChiTiet.js';

export default HoaDonChiTietLogic;
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
  display: flex;
  justify-content: center;
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
  color: white !important;
}

.badge-shipping {
  background: #34d399;
  color: white !important;
}

.badge-delivering {
  background: #34d399;
  color: white !important;;
}

.badge-completed {
  background: #16a34a;
  color: white !important;;
}

.badge-canceled {
  background: #dc3545;
  color: white !important;;
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
  max-height: 100vh;
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
  background: #34d399;
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
  width: 120px;
  height: 120px;
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
  color: #ffffff;
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
  font-weight: 500;
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

/* Bulk IMEI Confirmation Modal Styles */
.bulk-modal {
  max-width: 1000px;
  width: 90vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bulk-modal .modal-body {
  flex: 1;
  padding: 1rem;
}

.bulk-modal .modal-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  padding: 1rem;
}

.bulk-progress-container {
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  flex-shrink: 0;
}

.progress-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.progress-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.progress-dot.completed {
  background: #34d399;
  color: white;
  border-color: #34d399;
}

.progress-dot.current {
  background: #fbbf24;
  color: white;
  border-color: #fbbf24;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
}

.progress-dot.pending {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.spec-badge {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.price-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.price-value {
  color: #16a34a;
  font-weight: 600;
  font-size: 1.125rem;
  margin-left: 0.5rem;
}

/* Modern Modal Styles */
.modern-modal {
  max-width: 1000px;
  width: 90vw;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
}

.modern-header {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  padding: 1.5rem;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-text h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.modern-body {
  padding: 1.5rem;
  background: white;
  flex: 1;
}

/* Search and Filter Section */
.search-filter-section {
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-group .search-icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
  z-index: 2;
}

.search-input-group .search-input {
  padding-left: 3rem;
  padding-right: 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.modern-modal .search-input-group .search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search:hover {
  background: #f3f4f6;
  color: #374151;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.filter-select {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s;
}

.modern-modal .filter-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

.modern-modal .results-info {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #34d399;
}

.results-count {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

/* Products Grid */
.products-grid-container {
  min-height: 400px;
}

.modern-modal .products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modern-modal .product-card-modern {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.modern-modal .product-card-modern:hover {
  border-color: #34d399;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.15);
}

.modern-modal .product-card-modern.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.modern-modal .product-image-container {
  position: relative;
  height: 130px;
  overflow: hidden;
}

.modern-modal .product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.unavailable-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.modern-modal .product-info {
  padding: 0.4rem;
}

.modern-modal .product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-specs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.spec-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.spec-tag.color {
  background: #fef3c7;
  color: #92400e;
}

.spec-tag.ram {
  background: #dbeafe;
  color: #1e40af;
}

.spec-tag.storage {
  background: #f3e8ff;
  color: #7c3aed;
}

.product-price .price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
}

.product-actions {
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

.modern-modal .btn-add-product {
  width: 100%;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.modern-modal .btn-add-product:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.4);
}

.modern-modal .btn-add-product:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* IMEI Modal Styles */
.imei-modal {
  max-width: 1000px;
  width: 90vw;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
}

.imei-modal .selected-product-info {
  margin-bottom: 1.5rem;
}

.imei-modal .product-preview {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.product-image-wrapper {
  flex-shrink: 0;
}

.imei-modal .product-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  padding: 0.25rem;
}

.product-details {
  flex: 1;
}

.product-details .product-name {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.product-specs {
  margin-bottom: 1rem;
}

.spec-badge {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.product-price-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.imei-search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: end;
}

.imei-search-section .search-input-group {
  flex: 1;
}

.selection-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
}

.imei-list-container {
  min-height: 300px;
}

.imei-modal .imei-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  max-height: 350px;
  overflow-y: auto;
  padding: 1rem;
}

.imei-modal .imei-card-modern {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.imei-modal .imei-card-modern:hover {
  border-color: #34d399;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.15);
}

.imei-modal .imei-card-modern.selected {
  border-color: #34d399;
  background: #ecfdf5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.2);
}

.imei-checkbox {
  position: relative;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.custom-checkbox:checked {
  background: #34d399;
  border-color: #34d399;
}

.imei-modal .imei-info {
  flex: 1;
}

.imei-modal .imei-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.imei-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.imei-index {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.imei-modal .imei-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.imei-status.imei-status-valid {
  background: #dcfce7;
  color: #166534;
}

.imei-modal .modern-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-info {
  display: flex;
  align-items: center;
}

.imei-modal .selection-summary {
  font-size: 0.875rem;
  color: #34d399;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

/* Pagination Modern */
.pagination-modern {
  justify-content: center;
}

.pagination-modern .page-link {
  border: none;
  padding: 0.5rem 0.75rem;
  margin: 0 0.125rem;
  border-radius: 6px;
  color: #6b7280;
  background: white;
  transition: all 0.2s;
}

.modern-modal .pagination-modern .page-item.active .page-link {
  background: #34d399;
  color: white;
  border-color: #34d399;
}

.modern-modal .pagination-modern .page-link:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border-color: #34d399;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h5 {
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.quantity-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.quantity-value {
  margin-left: 0.5rem;
}

.bulk-product-info {
  background: rgba(52, 211, 153, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(52, 211, 153, 0.1);
}

.product-image-small {
  flex-shrink: 0;
}

.product-info-text {
  flex: 1;
  min-width: 0;
}

.spec-badge-small {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.price-text {
  color: #16a34a;
  font-weight: 600;
  font-size: 1rem;
}

.need-imei-badge {
  background: #fbbf24;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.bulk-imei-scroll-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.bulk-imei-list {
  padding: 0.5rem;
}

.bulk-imei-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.bulk-imei-item:hover {
  background: #e0f7ee;
  border-color: #98f3d2;
}

.bulk-imei-item.selected {
  background: #d4faec;
  border-color: #34d399;
}

.imei-code {
  font-weight: 700;
  color: #374151;
}

.imei-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.imei-number {
  font-weight: 500;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.imei-index {
  font-size: 0.75rem;
  color: #6b7280;
}

.empty-imei-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-imei-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.navigation-buttons .btn {
  min-width: 80px;
}

.action-buttons .btn {
  min-width: 120px;
}

.section-header {
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  padding-bottom: 0.5rem;
}

.section-title {
  color: #1f2937;
  font-weight: 600;
}

.imei-counter {
  font-size: 0.875rem;
}

/* Product card improvements for bulk confirmation */
.product-card-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.product-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.btn-success {
  background: #34d399;
  border: none;
  color: white;
  transition: all 0.2s ease;
}

.btn-success:hover {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
}

.btn-success:disabled {
  background: #d1d5db;
  color: #6b7280;
  transform: none;
  box-shadow: none;
}

/* Custom Green Button Styles */
.btn-custom-green {
  background: #34d399;
  border: 1px solid #34d399;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-custom-green:hover {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
}

.btn-custom-green:active,
.btn-custom-green:focus {
  background: #15803d;
  border-color: #15803d;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(52, 211, 153, 0.25);
}

.btn-custom-green:disabled {
  background: #d1d5db;
  border-color: #d1d5db;
  color: #6b7280;
  transform: none;
  box-shadow: none;
}

.btn-outline-custom-green {
  background: transparent;
  border: 1px solid #34d399;
  color: #34d399;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-outline-custom-green:hover {
  background: #34d399;
  border-color: #34d399;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
}

.btn-outline-custom-green:active,
.btn-outline-custom-green:focus {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(52, 211, 153, 0.25);
}

/* IMEI Table Styles */
.imei-table {
  min-width: 700px;
  margin-bottom: 0;
}

.imei-table-wrapper {
  width: 100%;
  margin: 1rem 0;
}

.imei-table-scroll {
  width: 100%;
  max-height: 300px;
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  position: relative;
}

.imei-table-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.imei-table-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.imei-table-scroll::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 4px;
}

.imei-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

.imei-table th {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
  padding: 12px 8px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.imei-table td {
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

.imei-table .select-column {
  width: 50px;
  text-align: center;
}

.imei-table .index-column {
  width: 60px;
  text-align: center;
}

.imei-table .imei-column {
  min-width: 200px;
}

.imei-table .status-column {
  width: 120px;
  text-align: center;
}

.imei-table .action-column {
  width: 120px;
  text-align: center;
}

.imei-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.imei-row:hover {
  background-color: #f8fafc;
}

.imei-row.selected-row {
  background-color: #ecfdf5;
  border-left: 3px solid #34d399;
}

.imei-status-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
}

.imei-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.imei-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #374151;
}

.imei-code {
  font-size: 0.75rem;
  color: #6b7280;
}

.row-index {
  font-weight: 500;
  color: #6b7280;
}

.select-all-checkbox:indeterminate {
  background-color: #34d399;
  border-color: #34d399;
}
</style>