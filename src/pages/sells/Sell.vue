<template>
  <div class="container-fluid py-4">
    <HeaderCard title="Quản Lý Bán Hàng" badgeText="Hệ Thống POS" titleColor="#002962" badgeClass="gradient-custom-blue"
      :backgroundOpacity="0.95" />

    <!-- Search and Pending Invoices -->
    <div class="card shadow-sm mb-4 search-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);">
      <div class="card-body p-3" style="background: linear-gradient(135deg, #002962, #0052cc);">
        <div class="d-flex gap-3 align-items-center">
          <div class="flex-grow-1">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input type="text" class="form-control shadow-none" placeholder="Tìm kiếm hóa đơn..."
  :value="invoiceSearchQuery" @input="debouncedInvoiceSearch($event.target.value)"
  style="background: rgba(255, 255, 255, 0.95);" />
            </div>
          </div>
          <button class="btn btn-light px-4 py-2 fw-semibold add-bill-btn text-dark" @click="createNewPendingInvoice"
            :disabled="isCreatingInvoice || pendingInvoices.length >= 5">
            <i class="bi bi-plus-circle me-2"></i>Tạo hóa đơn mới
          </button>
        </div>
      </div>
    </div>

    <!-- Pending Invoices -->
    <div class="card shadow-lg mb-4 bill-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);">
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Hóa đơn chờ</h5>
        <div class="d-flex gap-3 overflow-x-auto pb-2">
          <div v-for="invoice in filteredPendingInvoices" :key="invoice.id" @click="loadPendingInvoice(invoice)"
            class="card shadow-sm bill-card p-2 cursor-pointer min-w-[160px] flex-shrink-0" :style="{
              'background': activeInvoiceId === invoice.id ? 'rgba(0, 94, 226, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              'border': activeInvoiceId === invoice.id ? '2px solid #0052cc' : 'none'
            }">
            <div class="card-body p-2">
              <div class="d-flex gap-3 justify-content-between align-items-center mb-2">
                <span class="fw-bold text-dark">{{ invoice.code }}</span>
                <span class="badge gradient-custom-yellow text-white px-3 py-1">{{ invoice.status }}</span>
              </div>
              
              <div class="d-flex align-items-center justify-content-between mt-2">
                <small class="text-muted">{{ invoice.items.length }} sản phẩm</small>
                <button class="btn btn-sm btn-outline-danger delete-invoice-btn" @click.stop="confirmCancelInvoice(invoice)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart and Products -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card shadow-sm product-card"
          style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center p-4">
            <h5 class="mb-0 fw-bold text-dark">Giỏ hàng</h5>
            <button class="btn btn-light px-4 py-2 add-to-cart-btn gradient-custom-blue text-white" @click="scanQR"
              :disabled="!activeInvoiceId">
              <i class="bi bi-qr-code-scan me-2"></i>Quét QR
            </button>
          </div>
          <div class="card-body p-2">
            <!-- Cart Table -->
            <DataTable title="" :headers="cartHeaders" :data="cartItems" :pageSizeOptions="[5, 10]">
              <template #name="{ item }">
                <span class="text-muted">{{ item.name }}</span>
              </template>
              <template #color="{ item }">
                <span class="text-muted">{{ item.color }}</span>
              </template>
              <template #ram="{ item }">
                <span class="text-muted">{{ item.ram }}</span>
              </template>
              <template #storage="{ item }">
                <span class="text-muted">{{ item.storage }}</span>
              </template>
              <template #imei="{ item }">
                <button class="btn btn-sm btn-view" @click="showIMEIModalForItem(item)">
                  <i class="bi bi-eye"></i>
                </button>
              </template>
              <template #price="{ item }">
                <span>{{ formatPrice(item.price) }}</span>
              </template>
              <template #quantity="{ item }">
                <span>{{ item.quantity }}</span>
              </template>
              <template #total="{ item }">
                <span>{{ formatPrice(item.price * item.quantity) }}</span>
              </template>
              <template #actions="{ item }">
                <button class="btn btn-sm btn-outline-danger" @click="removeItem(item)">
                  <i class="bi bi-trash"></i>
                </button>
              </template>
            </DataTable>
            <div v-if="cartItems.length === 0" class="empty-cart-container text-center py-5">
              <div
                class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-blue"
                style="width: 80px; height: 80px;">
                <i class="bi bi-cart-x text-white" style="font-size: 2.5rem;"></i>
              </div>
              <p class="text-muted mb-0 fw-medium">Giỏ hàng trống</p>
            </div>

            <!-- Product Filters and Table -->
            <div class="mt-4">
              <div class="row g-3 p-2">
                <div class="col-md-3">
                  <input :value="productSearchQuery" type="text" class="form-control shadow-none"
  placeholder="Tìm kiếm sản phẩm..." @input="debouncedProductSearch($event.target.value)"
  style="background: rgba(255, 255, 255, 0.95);" />
                </div>
                <div class="col-md-3">
                  <select v-model="filterColor" class="form-select shadow-none">
                    <option value="">Tất cả màu</option>
                    <option v-for="color in uniqueColors" :key="color" :value="color">{{ color }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="filterRam" class="form-select shadow-none">
                    <option value="">Tất cả RAM</option>
                    <option v-for="ram in uniqueRams" :key="ram" :value="ram">{{ ram }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="filterStorage" class="form-select shadow-none">
                    <option value="">Tất cả bộ nhớ</option>
                    <option v-for="storage in uniqueStorages" :key="storage" :value="storage">{{ storage }}</option>
                  </select>
                </div>
              </div>
              <DataTable title="" :headers="productHeaders" :data="filteredProducts" :pageSizeOptions="[5, 10]"
                @scroll="handleScroll">
                <template #code="{ item }">
                  <span class="text-muted">{{ item.code }}</span>
                </template>
                <template #name="{ item }">
                  <span class="fw-medium" style="color: #002962;">{{ item.name }}</span>
                </template>
                <template #color="{ item }">
                  <span class="text-muted">{{ item.color }}</span>
                </template>
                <template #ram="{ item }">
                  <span class="text-muted">{{ item.ram }}</span>
                </template>
                <template #storage="{ item }">
                  <span class="text-muted">{{ item.storage }}</span>
                </template>
                <template #price="{ item }">
                  <span class="fw-semibold" style="color: #28a745;">{{ formatPrice(item.price) }}</span>
                </template>
                <template #actions="{ item }">
                  <button class="btn btn-sm px-4 py-2 add-to-cart-btn gradient-custom-blue text-white"
                    @click="showIMEIList(item)" :disabled="!activeInvoiceId">
                    <i class="bi bi-cart-plus-fill"></i>
                  </button>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- IMEI Modal for Cart Item -->
        <div v-if="showCartIMEIModal" class="modal fade show d-block" tabindex="-1"
          style="background: rgba(0, 0, 0, 0.5);">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg p-2 gradient-modal"
              style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 12px;">
              <div class="modal-header border-0 d-flex justify-content-between align-items-center">
                <h5 class="modal-title fw-bold text-dark">
                  IMEI của {{ selectedCartItem?.name }} ({{ selectedCartItem?.color }}, {{ selectedCartItem?.ram }}, {{
                  selectedCartItem?.storage }})
                </h5>
                <button class="btn btn-outline-secondary btn-close-custom" @click="closeCartIMEIModal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="modal-body p-4">
                <div class="imei-list-container">
                  <div v-if="selectedCartItem?.imei"
                    class="d-flex justify-content-between align-items-center imei-card mb-3 p-3 bg-light rounded"
                    v-for="imei in selectedCartItem.imei.split(', ')" :key="imei">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-upc-scan me-3 text-primary" style="font-size: 1.2rem;"></i>
                      <span class="text-dark fw-medium">{{ imei }}</span>
                    </div>
                    <button class="btn btn-danger btn-sm delete-imei-btn" @click="deleteIMEI(imei)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                  <div v-else class="text-center text-muted py-4">
                    <i class="bi bi-info-circle me-2"></i>Không có IMEI nào được chọn.
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0">
                <button class="btn btn-light px-4 py-2 gradient-custom-blue text-white" @click="closeCartIMEIModal">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- IMEI Modal for Product Selection -->
        <div v-if="showIMEIModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg p-2 gradient-modal"
              style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 12px;">
              <div class="modal-header border-0 d-flex justify-content-between align-items-center">
                <h5 class="modal-title fw-bold text-dark">
                  Chọn IMEI cho {{ selectedProduct?.name }} ({{ selectedProduct?.color }}, {{ selectedProduct?.ram }},
                  {{ selectedProduct?.storage }})
                </h5>
                <button class="btn btn-outline-secondary btn-close-custom" @click="closeIMEIModal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="modal-body p-4">
                <div class="imei-list-container">
                  <div v-for="item in availableIMEIs" :key="item.id" class="imei-card mb-3 p-3 bg-light rounded">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted fw-medium">{{ item.imei }}</span>
                      <div>
                        <input type="checkbox" :value="item.imei" v-model="selectedIMEIs" class="form-check-input me-2"
                          style="border-color: #0052cc;" @change="handleIMEISelection" />
                        <span v-if="selectedIMEIs.includes(item.imei)" class="badge bg-success text-white">Đã chọn</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="availableIMEIs.length === 0" class="text-center text-muted py-3">
                    Không có IMEI nào khả dụng.
                  </div>
                </div>
                <div v-if="selectedIMEIs.length > 0"
                  class="selected-imei-container mt-4 animate__animated animate__fadeIn">
                  <h6 class="selected-imei-title fw-semibold text-dark mb-3">IMEI đã chọn:</h6>
                  <div class="selected-imei-list d-flex flex-wrap gap-2">
                    <div v-for="imei in selectedIMEIs" :key="imei"
                      class="imei-badge d-flex align-items-center p-2 rounded shadow-sm">
                      <i class="bi bi-upc-scan me-2 text-primary" style="font-size: 1.1rem;"></i>
                      <span class="imei-text fw-medium text-dark">{{ imei }}</span>
                      <button class="delete-imei-btn ms-2" @click="removeIMEI(imei)" title="Xóa IMEI">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0">
                <button class="btn btn-primary px-4 py-2 gradient-custom-blue text-white" @click="addProductWithIMEIs"
                  :disabled="selectedIMEIs.length === 0">
                  Thêm vào giỏ hàng
                </button>
                <button class="btn btn-outline-secondary px-4 py-2" @click="closeIMEIModal">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Discount Modal -->
        <div v-if="showDiscountModal" class="modal fade show d-block" tabindex="-1"
          style="background: rgba(0, 0, 0, 0.5);">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg gradient-modal"
              style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 16px;">
              <div class="modal-header border-0 d-flex justify-content-between align-items-center p-4">
                <h5 class="modal-title fw-bold text-dark">Chọn Mã Giảm Giá</h5>
                <button class="btn btn-outline-secondary btn-close-custom" @click="showDiscountModal = false">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="modal-body p-4 discount-modal-body">
                <!-- Tabs for Private and Public Discounts -->
                <ul class="nav nav-tabs mb-4" style="border-bottom: 2px solid rgba(0, 94, 226, 0.2);">
                  <li class="nav-item">
                    <button class="nav-link" :class="{ 'active': activeTab === 'private' }"
                      @click="activeTab = 'private'">
                      Mã Riêng
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" :class="{ 'active': activeTab === 'public' }"
                      @click="activeTab = 'public'">
                      Mã Công Khai
                    </button>
                  </li>
                </ul>

                <!-- Private Discount Section -->
                <div v-show="activeTab === 'private'" class="discount-section animate__animated animate__fadeIn">
                  <h6 class="fw-semibold text-dark mb-4 text-center">Mã Giảm Giá Riêng</h6>
                  <div v-if="privateDiscountCodes.length === 0" class="empty-state text-center py-5">
                    <div
                      class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-blue"
                      style="width: 60px; height: 60px;">
                      <i class="bi bi-gift text-white" style="font-size: 2rem;"></i>
                    </div>
                    <p class="text-muted mt-2">Bạn chưa có mã giảm giá riêng nào.</p>
                  </div>
                  <div v-else class="row g-3">
                    <div v-for="code in privateDiscountCodes" :key="code.id" class="col-md-6">
                      <div class="card shadow-sm discount-card h-100 animate__animated animate__zoomIn">
                        <div class="card-body d-flex flex-column justify-content-between p-3">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 class="discount-code fw-bold text-primary mb-1">{{ code.code }}</h6>
                              <p class="mb-1">Giảm <span class="highlight-text fw-semibold text-success">{{
                                  formatPrice(code.value) }}</span></p>
                            </div>
                            <span class="badge bg-primary text-white px-2 py-1">Riêng</span>
                          </div>
                          <button class="btn btn-sm gradient-custom-blue text-white btn-apply w-100 mt-3"
                            @click="selectedPrivateDiscount = code; applyPrivateDiscount()">
                            <i class="bi bi-check-circle me-2"></i>Áp dụng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Public Discount Section -->
                <div v-show="activeTab === 'public'" class="discount-section animate__animated animate__fadeIn">
                  <h6 class="fw-semibold text-dark mb-4 text-center">Mã Giảm Giá Công Khai</h6>
                  <div class="row g-3">
                    <div v-for="code in publicDiscountCodes" :key="code.id" class="col-md-6">
                      <div class="card shadow-sm discount-card h-100 animate__animated animate__zoomIn">
                        <div class="card-body d-flex flex-column justify-content-between p-3">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 class="discount-code fw-bold text-primary mb-1">{{ code.code }}</h6>
                              <p class="mb-1">Giảm <span class="highlight-text fw-semibold text-success">{{ code.percent
                                  }}%</span></p>
                              <p class="mb-1">Đơn tối thiểu: <span class="fw-semibold">{{ formatPrice(code.minOrder)
                                  }}</span>
                              </p>
                              <p class="text-muted small">Hết hạn: {{ code.expiry }}</p>
                            </div>
                            <span class="badge bg-success text-white px-2 py-1">Công khai</span>
                          </div>
                          <button class="btn btn-sm gradient-custom-blue text-white btn-apply w-100 mt-3"
                            @click="selectedPublicDiscount = code; applyPublicDiscount()">
                            <i class="bi bi-check-circle me-2"></i>Áp dụng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0 p-4">
                <button class="btn btn-outline-secondary px-4 py-2" @click="showDiscountModal = false">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer and Order Info -->
      <div class="col-lg-4">
        <!-- Customer Info -->
        <div class="card shadow-sm customer-card mb-4"
          style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
          <div class="card-header bg-transparent p-4">
            <h5 class="mb-0 fw-bold text-dark">Khách hàng</h5>
          </div>
          <div class="card-body p-4">
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text bg-light">
                  <i class="bi bi-person text-muted"></i>
                </span>
                <input type="text" class="form-control shadow-none" placeholder="Tìm kiếm khách hàng..."
  :value="searchCustomer" @input="debouncedCustomerSearch($event.target.value)" />
              </div>
            </div>
            <button class="btn w-100 mb-3 add-customer-btn gradient-custom-blue text-white" @click="openCustomerModal">
              <i class="bi bi-person-plus me-2"></i>Thêm khách hàng mới
            </button>
            <div v-if="selectedCustomer" class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-medium text-dark">Tên khách hàng</label>
                <input v-model="customer.name" type="text" class="form-control shadow-none" placeholder="Nguyễn Oanh" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium text-dark">Số điện thoại</label>
                <input v-model="customer.phone" type="text" class="form-control shadow-none" placeholder="0985357224" />
              </div>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="card shadow-sm order-card"
          style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
          <div class="card-header bg-transparent p-4 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold text-dark">Thông tin đơn</h5>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="isDelivery" @change="toggleDelivery"
                style="border-color: #0052cc;" />
              <label class="form-check-label text-muted">Bán giao hàng</label>
            </div>
          </div>
          <div class="card-body p-4">
            <div v-if="isDelivery" class="mb-4">
              <h6 class="fw-semibold text-dark">Thông tin người nhận</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Tên người nhận</label>
                  <input v-model="receiver.name" type="text" class="form-control shadow-none"
                    :disabled="!isReceiverEditable" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Số điện thoại</label>
                  <input v-model="receiver.phone" type="text" class="form-control shadow-none"
                    :disabled="!isReceiverEditable" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Thành phố</label>
                  <select v-model="receiver.city" class="form-select shadow-none" :disabled="!isReceiverEditable"
                    @change="handleReceiverProvinceChange">
                    <option value="" disabled>Chọn tỉnh/thành phố</option>
                    <option v-for="province in provinces" :key="province.code" :value="province.name">
                      {{ province.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Quận, Huyện</label>
                  <select v-model="receiver.district" class="form-select shadow-none"
                    :disabled="!isReceiverEditable || !receiver.city" @change="handleReceiverDistrictChange">
                    <option value="" disabled>Chọn quận/huyện</option>
                    <option v-for="district in districts" :key="district.code" :value="district.name">
                      {{ district.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Phường, Xã</label>
                  <select v-model="receiver.ward" class="form-select shadow-none"
                    :disabled="!isReceiverEditable || !receiver.district">
                    <option value="" disabled>Chọn phường/xã</option>
                    <option v-for="ward in wards" :key="ward.code" :value="ward.name">
                      {{ ward.name }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-medium text-dark">Địa chỉ cụ thể</label>
                  <input v-model="receiver.address" type="text" class="form-control shadow-none"
                    :disabled="!isReceiverEditable" />
                </div>
              </div>
            </div>

            <div class="voucher-section mb-4">
              <h6 class="fw-semibold text-dark mb-3">Mã Giảm Giá</h6>
              <button class="btn select-btn gradient-custom-blue text-white w-100" @click="showDiscountModal = true">
                Chọn mã giảm giá
              </button>
              <div class="mt-3 text-end">
                <p class="text-muted fw-medium">Tổng tiền hàng: {{ formatPrice(totalPrice) }}</p>
                <p class="text-muted fw-medium">Giảm giá: -{{ formatPrice(discount) }}</p>
                <p class="fw-bold fs-4 text-success">
                  Tổng thanh toán: {{ formatPrice(totalPrice - discount) }}
                </p>
                <p v-if="suggestAdditionalPurchase.message" class="fw-medium mt-2" style="color: orangered;">
                  <i class="bi bi-info-circle me-2"></i>{{ suggestAdditionalPurchase.message }}
                </p>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-semibold text-dark">Phương thức thanh toán</h6>
              <div class="d-flex flex-wrap gap-2">
                <button @click="selectPayment('transfer')" class="btn px-4 py-2"
                  :class="{ 'gradient-custom-blue text-white': paymentMethod === 'transfer', 'border': paymentMethod !== 'transfer' }"
                  style="border: 1px solid rgba(0, 94, 226, 0.2);">
                  Chuyển khoản
                </button>
                <button @click="selectPayment('cash')" class="btn px-4 py-2"
                  :class="{ 'gradient-custom-blue text-white': paymentMethod === 'cash', 'border': paymentMethod !== 'cash' }"
                  style="border: 1px solid rgba(0, 94, 226, 0.2);">
                  Tiền mặt
                </button>
                <button @click="selectPayment('both')" class="btn px-4 py-2"
                  :class="{ 'gradient-custom-blue text-white': paymentMethod === 'both', 'border': paymentMethod !== 'both' }"
                  style="border: 1px solid rgba(0, 94, 226, 0.2);">
                  Cả hai
                </button>
              </div>
              <div v-if="paymentMethod === 'both'" class="row g-3 mt-3">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Tiền chuyển khoản</label>
                  <input v-model.number="tienChuyenKhoan" type="number" class="form-control shadow-none"
                    placeholder="Nhập số tiền chuyển khoản" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark">Tiền mặt</label>
                  <input v-model.number="tienMat" type="number" class="form-control shadow-none"
                    placeholder="Nhập số tiền mặt" min="0" />
                </div>
              </div>
              <!-- Hiển thị mã QR khi chọn chuyển khoản hoặc cả hai -->
              <div v-if="showQRCode" class="mt-3 text-center qr-code-container">
                <h6 class="fw-semibold text-dark">Quét mã QR để thanh toán</h6>
                <qrcode-vue :value="qrCodeValue" :size="200" level="H" />
                <p class="text-muted mt-2">Số tiền: {{ formatPrice(qrCodeAmount) }}</p>
              </div>
            </div>

            <button class="btn w-100 py-3 pay-btn gradient-custom-green text-white" @click="ThanhToan"
              :disabled="!activeInvoiceId || cartItems.length === 0 || isCreatingOrder">
              <i class="bi bi-credit-card me-2"></i>
              <span class="fw-semibold">Thanh toán</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <div v-if="isCustomerModalOpen" class="modal fade show d-block" tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg p-2 gradient-modal"
          style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 12px;">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">Thêm khách hàng mới</h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="isCustomerModalOpen = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Tên khách hàng</label>
                <input v-model="newCustomer.name" type="text" class="form-control shadow-none"
                  placeholder="Nhập tên khách hàng" required />
              </div>
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Số điện thoại</label>
                <input v-model="newCustomer.phone" type="text" class="form-control shadow-none"
                  placeholder="Nhập số điện thoại" required pattern="\d{10}"
                  title="Số điện thoại phải có đúng 10 chữ số" />
              </div>
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Tỉnh/Thành phố</label>
                <select v-model="newCustomer.city" class="form-select" required @change="handleProvinceChange">
                  <option value="" disabled>Chọn tỉnh/thành phố</option>
                  <option v-for="province in provinces" :key="province.code" :value="province.name">
                    {{ province.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Quận/Huyện</label>
                <select v-model="newCustomer.district" class="form-select" required @change="handleDistrictChange"
                  :disabled="!newCustomer.city">
                  <option value="" disabled>Chọn quận/huyện</option>
                  <option v-for="district in districts" :key="district.code" :value="district.name">
                    {{ district.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Phường/Xã</label>
                <select v-model="newCustomer.ward" class="form-select" required :disabled="!newCustomer.district">
                  <option value="" disabled>Chọn phường/xã</option>
                  <option v-for="ward in wards" :key="ward.code" :value="ward.name">
                    {{ ward.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-medium text-dark">Địa chỉ cụ thể</label>
                <input v-model="newCustomer.address" type="text" class="form-control shadow-none"
                  placeholder="Nhập địa chỉ cụ thể" required />
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4 py-2 gradient-custom-blue text-white" @click="addNewCustomer">
              Thêm khách hàng
            </button>
            <button class="btn btn-outline-secondary px-4 py-2" @click="isCustomerModalOpen = false">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Modal for Confirm -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />

    <!-- Toast Notification -->
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import QrcodeVue from 'qrcode.vue';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default {
  name: 'Sale',
  components: {
    HeaderCard,
    DataTable,
    NotificationModal,
    ToastNotification,
    QrcodeVue,
  },
  setup() {
    // State
    const isCreatingInvoice = ref(false);
    const isCreatingOrder = ref(false);
    const activeInvoiceId = ref(null);
    const invoiceSearchQuery = ref('');
    const pendingInvoices = ref([
      { id: 1, code: 'HD001', status: 'Chờ xử lý', items: [] },
      { id: 2, code: 'HD002', status: 'Chờ xử lý', items: [] },
    ]);
    const cartItems = ref([]);
    const showIMEIModal = ref(false);
    const showCartIMEIModal = ref(false);
    const showDiscountModal = ref(false);
    const selectedCartItem = ref(null);
    const isCustomerModalOpen = ref(false);
    const isLoadingMore = ref(false);
    const productSearchQuery = ref('');
    const filterColor = ref('');
    const filterRam = ref('');
    const filterStorage = ref('');
    const selectedProduct = ref(null);
    const selectedIMEIs = ref([]);
    const searchCustomer = ref('');
    const selectedCustomer = ref(false);
    const customer = ref({ name: '', phone: '' });
    const receiver = ref({ name: '', phone: '', city: '', district: '', ward: '', address: '' });
    const isReceiverEditable = ref(true);
    const isDelivery = ref(false);
    const selectedPrivateDiscount = ref(null);
    const selectedPublicDiscount = ref(null);
    const discount = ref(0);
    const paymentMethod = ref('cash');
    const tienChuyenKhoan = ref(0);
    const tienMat = ref(0);
    const newCustomer = ref({ name: '', phone: '', city: '', district: '', ward: '', address: '' });
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});
    const notificationModal = ref(null);
    const toastNotification = ref(null);
    const activeTab = ref('private');
    const qrCodeValue = ref('');
    const qrCodeAmount = ref(0);

    // Sample data
    const products = ref([
      { id: 1, name: 'iPhone 13', code: 'IP13', color: 'Xanh', ram: '4GB', storage: '128GB', price: 15000000 },
      { id: 2, name: 'Samsung Galaxy S21', code: 'SGS21', color: 'Đen', ram: '8GB', storage: '256GB', price: 18000000 },
      // ... other products ...
    ]);
    const availableIMEIs = ref([
      { id: 1, imei: '123456789012345' },
      { id: 2, imei: '123456789012346' },
    ]);
    const privateDiscountCodes = ref([
      { id: 1, code: 'PRIV10', value: 100000 },
    ]);
    const publicDiscountCodes = ref([
      { id: 2, code: 'GG00001', value: 600000, percent: 10, minOrder: 5000000, expiry: '30/06/2025' },
      // ... other discount codes ...
    ]);
    const provinces = ref([
      { code: 'HN', name: 'Hà Nội' },
      { code: 'HCM', name: 'TP Hồ Chí Minh' },
    ]);
    const districts = ref([]);
    const wards = ref([]);

    // DataTable headers
    const cartHeaders = ref([
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Màu sắc', value: 'color' },
      { text: 'RAM', value: 'ram' },
      { text: 'Bộ nhớ', value: 'storage' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Đơn giá', value: 'price' },
      { text: 'Số lượng', value: 'quantity' },
      { text: 'Thành tiền', value: 'total' },
      { text: 'Hành động', value: 'actions' },
    ]);

    const productHeaders = ref([
      { text: 'Mã sản phẩm', value: 'code' },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Màu', value: 'color' },
      { text: 'RAM', value: 'ram' },
      { text: 'Bộ nhớ', value: 'storage' },
      { text: 'Giá', value: 'price' },
      { text: 'Hành động', value: 'actions' },
    ]);

    // Computed
    const uniqueColors = computed(() => [...new Set(products.value.map(p => p.color))]);
    const uniqueRams = computed(() => [...new Set(products.value.map(p => p.ram))]);
    const uniqueStorages = computed(() => [...new Set(products.value.map(p => p.storage))]);

    const filteredPendingInvoices = computed(() => {
      if (!invoiceSearchQuery.value) return pendingInvoices.value;
      const query = invoiceSearchQuery.value.toLowerCase();
      return pendingInvoices.value.filter(
        (invoice) => invoice.code.toLowerCase().includes(query)
      );
    });

    const filteredProducts = computed(() => {
      let filtered = products.value;
      if (productSearchQuery.value) {
        const query = productSearchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.color.toLowerCase().includes(query)
        );
      }
      if (filterColor.value) {
        filtered = filtered.filter(p => p.color === filterColor.value);
      }
      if (filterRam.value) {
        filtered = filtered.filter(p => p.ram === filterRam.value);
      }
      if (filterStorage.value) {
        filtered = filtered.filter(p => p.storage === filterStorage.value);
      }
      return filtered;
    });

    const totalPrice = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });

    const suggestAdditionalPurchase = computed(() => {
      if (!publicDiscountCodes.value.length) {
        return {
          message: 'Không có mã giảm giá công khai nào khả dụng.',
          additionalAmount: 0,
          bestDiscount: null,
        };
      }

      const bestDiscount = publicDiscountCodes.value.reduce((best, code) => {
        if (totalPrice.value >= code.minOrder) {
          return code.value > (best?.value || 0) ? code : best;
        }
        return code.value > (best?.value || 0) && (!best || code.minOrder < best.minOrder) ? code : best;
      }, null);

      if (!bestDiscount) {
        return {
          message: 'Không có mã giảm giá phù hợp.',
          additionalAmount: 0,
          bestDiscount: null,
        };
      }

      if (totalPrice.value >= bestDiscount.minOrder) {
        return {
          message: `Bạn có thể áp dụng mã ${bestDiscount.code} để được giảm ${formatPrice(bestDiscount.value)}.`,
          additionalAmount: 0,
          bestDiscount,
        };
      }

      const additionalAmount = bestDiscount.minOrder - totalPrice.value;
      return {
        message: `Mua thêm ${formatPrice(additionalAmount)} để sử dụng mã ${bestDiscount.code} và được giảm ${formatPrice(bestDiscount.value)}.`,
        additionalAmount,
        bestDiscount,
      };
    });

    const showQRCode = computed(() => {
      if (paymentMethod.value === 'transfer') {
        qrCodeAmount.value = totalPrice.value - discount.value;
        generateQRCode(qrCodeAmount.value);
        return true;
      } else if (paymentMethod.value === 'both' && tienChuyenKhoan.value > 0) {
        qrCodeAmount.value = tienChuyenKhoan.value;
        generateQRCode(tienChuyenKhoan.value);
        return true;
      }
      return false;
    });

    // Methods
    const showToast = (type, message, isLoading = false, duration = 3000) => {
      toastNotification.value.addToast({ type, message, isLoading, duration });
    };

    const showConfirm = (message, onConfirm, onCancel = () => {}) => {
      notificationType.value = 'confirm';
      notificationMessage.value = message;
      notificationOnConfirm.value = onConfirm;
      notificationOnCancel.value = onCancel;
      isNotificationLoading.value = false;
      notificationModal.value.openModal();
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    // Debounced search functions
    const debouncedInvoiceSearch = debounce((query) => {
      invoiceSearchQuery.value = query;
    }, 300);

    const debouncedProductSearch = debounce((query) => {
      productSearchQuery.value = query;
    }, 300);

    const debouncedCustomerSearch = debounce((query) => {
      searchCustomer.value = query;
      searchCustomers();
    }, 300);

    const createNewPendingInvoice = () => {
      if (pendingInvoices.value.length >= 5) {
        showToast('error', 'Đã đạt giới hạn 5 hóa đơn chờ');
        return;
      }
      isCreatingInvoice.value = true;
      setTimeout(() => {
        const newInvoice = {
          id: pendingInvoices.value.length + 1,
          code: `HD${String(pendingInvoices.value.length + 1).padStart(3, '0')}`,
          status: 'Chờ xử lý',
          items: [],
        };
        pendingInvoices.value.push(newInvoice);
        activeInvoiceId.value = newInvoice.id;
        cartItems.value = [];
        isCreatingInvoice.value = false;
        showToast('success', `Tạo hóa đơn mới thành công: ${newInvoice.code}`);
      }, 500);
    };

    const loadPendingInvoice = (invoice) => {
      activeInvoiceId.value = invoice.id;
      cartItems.value = invoice.items;
      showToast('success', `Đã tải hóa đơn ${invoice.code}`);
    };

    const confirmCancelInvoice = (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.code}?`,
        () => cancelInvoice(invoice),
        () => {}
      );
    };

    const cancelInvoice = (invoice) => {
      isNotificationLoading.value = true;
      setTimeout(() => {
        pendingInvoices.value = pendingInvoices.value.filter((inv) => inv.id !== invoice.id);
        if (activeInvoiceId.value === invoice.id) {
          activeInvoiceId.value = null;
          cartItems.value = [];
        }
        isNotificationLoading.value = false;
        showToast('success', `Đã hủy hóa đơn ${invoice.code}`);
        resetNotification();
      }, 500);
    };

    const scanQR = () => {
      showToast('warning', 'Chức năng quét QR đang được phát triển');
    };

    const showIMEIList = (product) => {
      selectedProduct.value = product;
      showIMEIModal.value = true;
      selectedIMEIs.value = [];
    };

    const showIMEIModalForItem = (item) => {
      selectedCartItem.value = item;
      showCartIMEIModal.value = true;
    };

    const closeIMEIModal = () => {
      showIMEIModal.value = false;
      selectedProduct.value = null;
      selectedIMEIs.value = [];
    };

    const closeCartIMEIModal = () => {
      showCartIMEIModal.value = false;
      selectedCartItem.value = null;
    };

    const handleIMEISelection = () => {
      // Update selected IMEIs
    };

    const removeIMEI = (imei) => {
      selectedIMEIs.value = selectedIMEIs.value.filter((selected) => selected !== imei);
    };

    const addProductWithIMEIs = () => {
      if (selectedIMEIs.value.length === 0) return;
      const newItem = {
        id: cartItems.value.length + 1,
        name: selectedProduct.value.name,
        color: selectedProduct.value.color,
        ram: selectedProduct.value.ram,
        storage: selectedProduct.value.storage,
        imei: selectedIMEIs.value.join(', '),
        price: selectedProduct.value.price,
        quantity: selectedIMEIs.value.length,
      };
      cartItems.value.push(newItem);
      const invoice = pendingInvoices.value.find((inv) => inv.id === activeInvoiceId.value);
      if (invoice) invoice.items = cartItems.value;
      closeIMEIModal();
      showToast('success', `Đã thêm sản phẩm ${newItem.name} vào giỏ hàng`);
    };

    const removeItem = (item) => {
      cartItems.value = cartItems.value.filter((i) => i.id !== item.id);
      const invoice = pendingInvoices.value.find((inv) => inv.id === activeInvoiceId.value);
      if (invoice) invoice.items = cartItems.value;
      showToast('success', `Đã xóa sản phẩm ${item.name} khỏi giỏ hàng`);
    };

    const deleteIMEI = (imei) => {
      if (!selectedCartItem.value) return;

      const imeiArray = selectedCartItem.value.imei.split(', ').filter(i => i !== imei);
      selectedCartItem.value.imei = imeiArray.join(', ');
      selectedCartItem.value.quantity = imeiArray.length;

      if (imeiArray.length === 0) {
        cartItems.value = cartItems.value.filter(item => item.id !== selectedCartItem.value.id);
      }

      const invoice = pendingInvoices.value.find((inv) => inv.id === activeInvoiceId.value);
      if (invoice) {
        invoice.items = cartItems.value;
      }

      if (imeiArray.length === 0) {
        closeCartIMEIModal();
      }

      showToast('success', `Đã xóa IMEI ${imei}`);
    };

    const searchCustomers = () => {
      if (searchCustomer.value) {
        selectedCustomer.value = true;
        customer.value = { name: 'Nguyễn Oanh', phone: '0985357224' };
        showToast('success', `Tìm thấy khách hàng: ${customer.value.name}`);
      } else {
        selectedCustomer.value = false;
        customer.value = { name: '', phone: '' };
      }
    };

    const openCustomerModal = () => {
      newCustomer.value = { name: '', phone: '', city: '', district: '', ward: '', address: '' };
      isCustomerModalOpen.value = true;
    };

    const handleProvinceChange = () => {
      districts.value = [{ code: 'Q1', name: 'Quận 1' }, { code: 'Q2', name: 'Quận 2' }];
      newCustomer.value.district = '';
      newCustomer.value.ward = '';
      wards.value = [];
    };

    const handleDistrictChange = () => {
      wards.value = [{ code: 'P1', name: 'Phường 1' }, { code: 'P2', name: 'Phường 2' }];
      newCustomer.value.ward = '';
    };

    const handleReceiverProvinceChange = () => {
      districts.value = [{ code: 'Q1', name: 'Quận 1' }, { code: 'Q2', name: 'Quận 2' }];
      receiver.value.district = '';
      receiver.value.ward = '';
      wards.value = [];
    };

    const handleReceiverDistrictChange = () => {
      wards.value = [{ code: 'P1', name: 'Phường 1' }, { code: 'P2', name: 'Phường 2' }];
      receiver.value.ward = '';
    };

    const addNewCustomer = () => {
      if (!newCustomer.value.name || !newCustomer.value.phone) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin khách hàng');
        return;
      }
      customer.value = { name: newCustomer.value.name, phone: newCustomer.value.phone };
      selectedCustomer.value = true;
      isCustomerModalOpen.value = false;
      showToast('success', `Thêm khách hàng thành công: ${customer.value.name}`);
    };

    const toggleDelivery = () => {
      if (isDelivery.value && selectedCustomer.value) {
        receiver.value = { ...customer.value, city: '', district: '', ward: '', address: '' };
      } else {
        receiver.value = { name: '', phone: '', city: '', district: '', ward: '', address: '' };
      }
    };

    const applyPrivateDiscount = () => {
      if (selectedPrivateDiscount.value) {
        discount.value = selectedPrivateDiscount.value.value;
        showToast('success', `Áp dụng mã giảm giá ${selectedPrivateDiscount.value.code} thành công`);
        selectedPrivateDiscount.value = null;
        showDiscountModal.value = false;
      }
    };

    const applyPublicDiscount = () => {
      if (selectedPublicDiscount.value) {
        discount.value = selectedPublicDiscount.value.value;
        showToast('success', `Áp dụng mã giảm giá ${selectedPublicDiscount.value.code} thành công`);
        selectedPublicDiscount.value = null;
        showDiscountModal.value = false;
      }
    };

    const selectPayment = (method) => {
      paymentMethod.value = method;
      tienChuyenKhoan.value = 0;
      tienMat.value = 0;
      qrCodeValue.value = '';
    };

    const generateQRCode = (amount) => {
      const bankInfo = {
        bankName: 'YourBank',
        accountNumber: '1234567890',
        accountHolder: 'Your Company Name',
        amount: amount,
        description: `Thanh toán hóa đơn ${activeInvoiceId.value || 'HDXXX'}`,
      };
      qrCodeValue.value = `Bank: ${bankInfo.bankName}, Account: ${bankInfo.accountNumber}, Holder: ${bankInfo.accountHolder}, Amount: ${bankInfo.amount}, Description: ${bankInfo.description}`;
    };

    const ThanhToan = () => {
      if (!selectedCustomer.value) {
        showToast('error', 'Vui lòng chọn hoặc thêm khách hàng');
        return;
      }
      if (cartItems.value.length === 0) {
        showToast('error', 'Giỏ hàng trống');
        return;
      }
      const totalPayment = totalPrice.value - discount.value;
      if (paymentMethod.value === 'both') {
        const totalInput = (tienChuyenKhoan.value || 0) + (tienMat.value || 0);
        if (totalInput !== totalPayment) {
          showToast('error', `Số tiền thanh toán (${formatPrice(totalInput)}) không khớp với tổng thanh toán (${formatPrice(totalPayment)})`);
          return;
        }
        if (tienChuyenKhoan.value < 0 || tienMat.value < 0) {
          showToast('error', 'Số tiền thanh toán không được âm');
          return;
        }
      } else if (paymentMethod.value === 'transfer') {
        if (!qrCodeValue.value) {
          showToast('error', 'Không thể tạo mã QR. Vui lòng thử lại.');
          return;
        }
      }
      showConfirm('Bạn có chắc chắn muốn thanh toán?', createOrder);
    };

    const createOrder = () => {
      isCreatingOrder.value = true;
      setTimeout(() => {
        pendingInvoices.value = pendingInvoices.value.filter((inv) => inv.id !== activeInvoiceId.value);
        cartItems.value = [];
        activeInvoiceId.value = null;
        selectedCustomer.value = false;
        customer.value = { name: '', phone: '' };
        discount.value = 0;
        selectedPrivateDiscount.value = null;
        selectedPublicDiscount.value = null;
        isCreatingOrder.value = false;
        showToast('success', 'Thanh toán thành công');
        resetNotification();
      }, 500);
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const handleScroll = () => {
      if (isLoadingMore.value) return;
      isLoadingMore.value = true;
      showToast('success', 'Đang tải thêm sản phẩm...', true, 0);
      setTimeout(() => {
        products.value.push({
          id: products.value.length + 1,
          name: 'Oppo Reno 6',
          code: 'OPR6',
          color: 'Bạc',
          ram: '8GB',
          storage: '128GB',
          price: 12000000,
        });
        isLoadingMore.value = false;
        showToast('success', 'Đã tải thêm sản phẩm');
      }, 500);
    };

    return {
      isCreatingInvoice,
      isCreatingOrder,
      activeInvoiceId,
      invoiceSearchQuery,
      pendingInvoices,
      filteredPendingInvoices,
      cartItems,
      showIMEIModal,
      showCartIMEIModal,
      showDiscountModal,
      selectedCartItem,
      isCustomerModalOpen,
      isLoadingMore,
      productSearchQuery,
      filterColor,
      filterRam,
      filterStorage,
      selectedProduct,
      selectedIMEIs,
      searchCustomer,
      selectedCustomer,
      customer,
      receiver,
      isReceiverEditable,
      isDelivery,
      selectedPrivateDiscount,
      selectedPublicDiscount,
      discount,
      suggestAdditionalPurchase,
      paymentMethod,
      tienChuyenKhoan,
      tienMat,
      newCustomer,
      products,
      filteredProducts,
      uniqueColors,
      uniqueRams,
      uniqueStorages,
      availableIMEIs,
      privateDiscountCodes,
      publicDiscountCodes,
      provinces,
      districts,
      wards,
      totalPrice,
      cartHeaders,
      productHeaders,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
      activeTab,
      qrCodeValue,
      qrCodeAmount,
      showQRCode,
      createNewPendingInvoice,
      loadPendingInvoice,
      confirmCancelInvoice,
      cancelInvoice,
      scanQR,
      showIMEIList,
      showIMEIModalForItem,
      closeIMEIModal,
      closeCartIMEIModal,
      handleIMEISelection,
      removeIMEI,
      addProductWithIMEIs,
      removeItem,
      deleteIMEI,
      searchCustomers,
      openCustomerModal,
      handleProvinceChange,
      handleDistrictChange,
      handleReceiverProvinceChange,
      handleReceiverDistrictChange,
      addNewCustomer,
      toggleDelivery,
      applyPrivateDiscount,
      applyPublicDiscount,
      selectPayment,
      generateQRCode,
      ThanhToan,
      createOrder,
      formatPrice,
      handleScroll,
      showToast,
      showConfirm,
      resetNotification,
      debouncedInvoiceSearch,
      debouncedProductSearch,
      debouncedCustomerSearch,
    };
  },
};
</script>

<style scoped>
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
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 94, 226, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(0, 94, 226, 0.5);
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

.gradient-custom-blue {
  background: linear-gradient(135deg, #002962, #0052cc);
}

.gradient-custom-yellow {
  background: linear-gradient(135deg, #FFA000, #FFB300);
}

.gradient-custom-green {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.gradient-modal {
  animation: slideInLeft 0.35s ease-out;
}

.btn-orange {
  background-color: #ff6200;
  color: white;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-orange:hover {
  background-color: #e65c00;
}

.search-card {
  animation: fadeIn-Up 0.4s ease-out 0.1s both;
}

.bill-card {
  animation: fadeInUp 0.3s ease-out;
}

.product-card,
.customer-card,
.order-card {
  animation: slideInLeft 0.5s ease-out;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-bill-btn,
.add-to-cart-btn,
.add-customer-btn,
.select-btn,
.pay-btn,
.btn-apply {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-to-cart-btn:hover,
.add-customer-btn:hover,
.select-btn:hover,
.btn-apply:hover {
  background: linear-gradient(135deg, #003ba3, #0066ff);
  box-shadow: 0 0 15px rgba(0, 94, 226, 0.3);
}

.pay-btn:hover {
  background: linear-gradient(135deg, #2dc550, #269f42);
  box-shadow: 0 0 15px #269f42c8;
}

.empty-icon-container {
  transition: all 0.2s ease;
}

.empty-icon-container:hover {
  animation: gentleGlow 1.5s infinite;
}

.modal.fade.show {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-content {
  border-radius: 12px;
  border: none;
}

.btn-close-custom {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(0, 94, 226, 0.2);
  transition: all 0.2s ease;
}

.btn-close-custom:hover {
  background-color: rgba(0, 94, 226, 0.1);
  border-color: #0052cc;
}

.form-select,
.form-control {
  transition: all 0.2s ease;
  border: 2px solid rgba(0, 94, 226, 0.1);
  border-radius: 8px;
}

.form-select:focus,
.form-control:focus {
  border-color: rgba(0, 94, 226, 0.2);
  box-shadow: 0 0 10px rgba(0, 94, 226, 0.1);
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 94, 226, 0.3) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 94, 226, 0.3);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background-color: transparent;
}

.cursor-pointer {
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  background-color: rgba(0, 94, 226, 0.1) !important;
}

.btn-outline-secondary {
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: rgba(0, 94, 226, 0.1);
  color: #0052cc;
}

.btn-view {
  border-color: #002962;
  color: #002962;
}

.btn-view:hover {
  color: #ffffff;
  background-color: #002962;
}

.text-dark {
  color: #002962 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-muted {
  color: #6c757d !important;
}

.imei-list-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 94, 226, 0.3) transparent;
}

.imei-list-container::-webkit-scrollbar {
  width: 6px;
}

.imei-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 94, 226, 0.3);
  border-radius: 3px;
}

.imei-list-container::-webkit-scrollbar-track {
  background-color: transparent;
}

.imei-card {
  border: 1px solid rgba(0, 94, 226, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.imei-card:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.imei-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.imei-item i {
  color: #0052cc;
  transition: color 0.2s ease;
}

.imei-item:hover i {
  color: #003ba3;
}

.selected-imei-container {
  margin-top: 1.5rem;
  animation: fadeIn 0.3s ease-out;
}

.selected-imei-title {
  color: #002962;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.selected-imei-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.imei-badge {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid rgba(0, 94, 226, 0.1);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.imei-badge:hover {
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  box-shadow: 0 4px 8px rgba(0, 94, 226, 0.2);
  transform: translateY(-1px);
}

.imei-badge .bi-upc-scan {
  color: #0052cc;
  font-size: 1.1rem;
  margin-right: 0.5rem;
  transition: color 0.2s ease;
}

.imei-badge:hover .bi-upc-scan {
  color: #003ba3;
}

.imei-text {
  color: #002962;
  font-size: 0.95rem;
  font-weight: 500;
}

.delete-imei-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 8px;
  border: none;
  color: #d32f2f;
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.delete-imei-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  box-shadow: 0 4px 8px rgba(255, 75, 75, 0.3);
  transform: translateY(-1px);
}

.delete-imei-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #e63946, #d32f2f);
}

.delete-imei-btn .bi-x {
  color: #dc3545;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.delete-imei-btn:hover .bi-x {
  color: #ffffff;
}

.delete-imei-btn::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.3s ease;
  pointer-events: none;
}

.delete-imei-btn:active::after {
  transform: scale(2);
  opacity: 0;
}

.delete-invoice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.3);
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.delete-invoice-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  box-shadow: 0 4px 8px rgba(255, 75, 75, 0.3);
  transform: translateY(-1px);
}

.delete-invoice-btn .bi-trash {
  color: #dc3545;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.delete-invoice-btn:hover .bi-trash {
  color: #ffffff;
}

.discount-card {
  border: 1px solid rgba(0, 94, 226, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.discount-card:hover {
  box-shadow: 0 6px 12px rgba(0, 94, 226, 0.2);
  transform: translateY(-3px);
}

.discount-code {
  color: #0052cc;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.highlight-text {
  color: #28a745;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.discount-modal-body {
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 94, 226, 0.3) transparent;
}

.discount-modal-body::-webkit-scrollbar {
  width: 6px;
}

.discount-modal-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 94, 226, 0.3);
  border-radius: 3px;
}

.discount-modal-body::-webkit-scrollbar-track {
  background-color: transparent;
}

.nav-tabs .nav-link {
  color: #002962;
  font-weight: 500;
  border: none;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
  color: #0052cc;
  background: transparent;
  border-bottom: 3px solid #0052cc;
}

.nav-tabs .nav-link:hover {
  color: #0052cc;
  background: rgba(0, 94, 226, 0.05);
}

.discount-section {
  padding: 0 0.5rem;
}

.form-check-input:checked {
  background-color: #0052cc;
  border-color: #0052cc;
}

.qr-code-container {
  border: 1px solid rgba(0, 94, 226, 0.2);
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .bill-card,
  .product-card,
  .customer-card,
  .order-card {
    animation: fadeInUp 0.4s ease-out;
  }

  .add-bill-btn,
  .add-to-cart-btn,
  .add-customer-btn,
  .pay-btn,
  .btn-apply {
    padding: 0.5rem 1rem;
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .imei-badge {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
  .imei-badge .bi-upc-scan {
    font-size: 1rem;
  }
  .delete-imei-btn {
    width: 24px;
    height: 24px;
  }
  .delete-imei-btn .bi-x {
    font-size: 0.9rem;
  }
}

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