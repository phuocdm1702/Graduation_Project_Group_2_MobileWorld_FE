<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Quản Lý Bán Hàng" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Invoice and Customer Cluster -->
    <div class="row g-4 d-flex align-items-stretch">
      <div class="col-lg-8 d-flex flex-column">
        <!-- Invoice Search and Pending Invoices -->
        <div class="card shadow-sm mb-4 flex-fill"
          style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: none;">
          <div class="card-body p-3">
            <!-- Invoice Search -->
            <div class="search-card mb-4"
              style="background: linear-gradient(135deg, #60a5fa, #34d399); border-radius: 10px;">
              <div class="card-body p-3">
                <div class="d-flex gap-3 align-items-center flex-wrap">
                  <div class="flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text bg-white">
                        <i class="bi bi-search text-muted"></i>
                      </span>
                      <input type="text" class="form-control shadow-none" placeholder="Tìm kiếm hóa đơn..."
                        :value="invoiceSearchQuery" @input="debouncedInvoiceSearch($event.target.value)"
                        style="background: rgba(255, 255, 255, 0.95)" />
                    </div>
                  </div>
                  <button class="btn btn-light px-4 py-2 fw-semibold add-bill-btn text-dark"
                    @click="createNewPendingInvoice" :disabled="isCreatingInvoice || pendingInvoices.length >= 5">
                    Tạo hóa đơn
                  </button>
                </div>
              </div>
            </div>

            <!-- Pending Invoices -->
            <FilterTableSection title="Hóa đơn chờ" icon="bi bi-receipt-cutoff">
              <div class="bill-card" style="border-bottom-right-radius: 12px; border-bottom-left-radius: 12px;">
                <div class="card-body p-4">
                  <div class="d-flex gap-3 overflow-x-auto pb-2">
                    <div v-for="invoice in filteredPendingInvoices" :key="invoice.id"
                      @click="loadPendingInvoice(invoice)"
                      class="card shadow-sm bill-card p-2 cursor-pointer min-w-[160px] flex-shrink-0" :style="{
                        background: activeInvoiceId === invoice.id ? 'rgba(52, 211, 153, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        border: activeInvoiceId === invoice.id ? '2px solid #34d399' : 'none'
                      }">
                      <div class="card-body p-2"
                        style="border-bottom-right-radius: 12px; border-bottom-left-radius: 12px;">
                        <div class="d-flex gap-3 justify-content-between align-items-center mb-2">
                          <span class="fw-bold text-dark">{{ invoice.code }}</span>
                          <span class="badge gradient-custom-yellow text-white px-3 py-1">{{ invoice.status }}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mt-2">
                          <small class="text-muted">{{ invoice.items.length }} sản phẩm</small>
                          <button class="btn btn-sm btn-outline-danger delete-invoice-btn"
                            @click.stop="confirmCancelInvoice(invoice)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FilterTableSection>
          </div>
        </div>
      </div>

      <!-- Customer Section -->
      <div class="col-lg-4 d-flex flex-column">
        <FilterTableSection title="Khách Hàng" icon="bi bi-people" class="flex-fill">
          <div class="customer-card bg-white rounded-3 shadow-sm animate__animated animate__fadeIn flex-fill">
            <div class="card-body p-4 d-flex flex-column h-100">
              <div class="mb-4">
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-search text-teal"></i>
                  </span>
                  <input type="text" class="form-control shadow-none border-start-0"
                    placeholder="Tìm kiếm khách hàng..." :value="searchCustomer"
                    @input="debouncedCustomerSearch($event.target.value)"
                    style="border-radius: 0 10px 10px 0; transition: all 0.3s ease;"
                    @focus="this.classList.add('border-teal')" @blur="this.classList.remove('border-teal')" />
                </div>
              </div>
              <div class="row g-4 flex-grow-1">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                    Tên khách hàng <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-person text-teal"></i>
                    </span>
                    <input v-model="customer.name" type="text" class="form-control shadow-none border-start-0"
                      placeholder="Tên khách hàng" disabled
                      style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;" />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-telephone text-teal"></i>
                    </span>
                    <input v-model="customer.phone" type="tel" class="form-control shadow-none border-start-0"
                      placeholder="Số điện thoại" disabled
                      style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;" />
                  </div>
                </div>
              </div>
              <button class="btn gradient-custom-teal text-white w-100 mt-3 py-2 fw-medium add-customer-btn"
                @click="openCustomerModal" style="border-radius: 10px; transition: all 0.3s ease; font-size: 1rem;"
                @mouseover="this.style.transform = 'scale(1.02)'" @mouseout="this.style.transform = 'scale(1)'">
                Thêm khách hàng
              </button>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Cart and Product List Cluster -->
    <div class="row g-4">
      <div class="col-lg-8">
        <!-- Cart Section -->
        <FilterTableSection title="Giỏ hàng" icon="bi bi-basket">
          <div class="shadow-sm product-card"
            style="border-bottom-right-radius: 12px; border-bottom-left-radius: 12px;">
            <div class="d-flex justify-content-end">
              <button class="btn add-to-cart-btn gradient-custom-teal text-white"
                style="width: 120px; margin-top: 1rem; margin-right: 1rem;" @click="scanQR"
                :disabled="!activeInvoiceId">
                Quét QR
              </button>
            </div>
            <div class="card-body p-2">
              <DataTable title="" :headers="cartHeaders" :data="cartItems"
                :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]">
                <template #stt="{ item, index }">
                  {{ index + 1 }}
                </template>
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
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-teal"
                  style="width: 80px; height: 80px">
                  <i class="bi bi-cart-x text-white" style="font-size: 2.5rem"></i>
                </div>
                <p class="text-muted mb-0 fw-medium">Giỏ hàng trống</p>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Product List Section -->
        <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-table">
          <div class="mt-4">
            <div class="row g-3 p-2">
              <div class="col-md-3">
                <input :value="productSearchQuery" type="text" class="form-control shadow-none"
                  placeholder="Tìm kiếm sản phẩm..." @input="debouncedProductSearch($event.target.value)"
                  style="background: rgba(255, 255, 255, 0.95)" />
              </div>
              <div class="col-md-3">
                <select v-model="filterColor" class="form-select shadow-none">
                  <option value="">Tất cả màu</option>
                  <option v-for="color in uniqueColors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filterRam" class="form-select shadow-none">
                  <option value="">Tất cả RAM</option>
                  <option v-for="ram in uniqueRams" :key="ram" :value="ram">
                    {{ ram }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filterStorage" class="form-select shadow-none">
                  <option value="">Tất cả bộ nhớ</option>
                  <option v-for="storage in uniqueStorages" :key="storage" :value="storage">
                    {{ storage }}
                  </option>
                </select>
              </div>
            </div>
            <DataTable title="" :headers="productHeaders" :data="filteredProducts"
              :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]" @scroll="handleScroll">
              <template #stt="{ item, index }">
                {{ index + 1 }}
              </template>
              <template #code="{ item }">
                <span class="text-muted">{{ item.code }}</span>
              </template>
              <template #name="{ item }">
                <span class="fw-medium" style="color: #1f3a44">{{ item.name }}</span>
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
                <span class="fw-semibold" style="color: #16a34a">{{ formatPrice(item.price) }}</span>
              </template>
              <template #actions="{ item }">
                <button class="btn btn-sm px-4 py-2 add-to-cart-btn gradient-custom-teal text-white"
                  @click="showIMEIList(item)" :disabled="!activeInvoiceId">
                  <i class="bi bi-cart-plus-fill"></i>
                </button>
              </template>
            </DataTable>
          </div>
        </FilterTableSection>
      </div>

      <!-- Order Info Section -->
      <div class="col-lg-4 d-flex flex-column">
        <FilterTableSection title="Thông tin đơn" icon="bi bi-info-circle" class="flex-fill">
          <div class="order-card h-100">
            <div class="form-check form-switch m-3 d-flex justify-content-end gap-2">
              <input class="form-check-input" type="checkbox" v-model="isDelivery" @change="toggleDelivery"
                style="border-color: #34d399" />
              <label class="form-check-label text-muted">Bán giao hàng</label>
            </div>
            <div class="card-body p-3 pt-0 d-flex flex-column">
              <!-- Hiển thị placeholder khi giỏ hàng trống -->
              <div v-if="cartItems.length === 0" class="empty-cart-message text-center py-5">
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-teal"
                  style="width: 60px; height: 60px">
                  <i class="bi bi-info-circle text-white" style="font-size: 2rem"></i>
                </div>
                <p class="text-muted mb-0 fw-medium">Chưa có sản phẩm trong đơn hàng</p>
              </div>
              <!-- Nội dung thông tin đơn khi có sản phẩm -->
              <div v-else class="d-flex flex-column flex-grow-1">
                <div v-if="isDelivery" class="mb-5">
                  <h6 class="fw-bold text-dark mb-2" style="font-size: 1.3rem; letter-spacing: 0.5px;">
                    Thông tin người nhận
                  </h6>
                  <div class="receiver-form bg-white p-3 rounded-3 shadow-sm animate__animated animate__fadeIn"
                    style="border: 1px solid rgba(52, 211, 153, 0.1); backdrop-filter: blur(5px);">
                    <div class="row g-4">
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Tên người nhận <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-person text-teal"></i>
                          </span>
                          <input v-model="receiver.name" type="text" class="form-control shadow-none border-start-0"
                            placeholder="Nhập tên người nhận" :disabled="!isReceiverEditable"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;"
                            @focus="this.classList.add('border-teal')" @blur="this.classList.remove('border-teal')" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Số điện thoại <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-telephone text-teal"></i>
                          </span>
                          <input v-model="receiver.phone" type="tel" class="form-control shadow-none border-start-0"
                            placeholder="Nhập số điện thoại" :disabled="!isReceiverEditable"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;"
                            @focus="this.classList.add('border-teal')" @blur="this.classList.remove('border-teal')" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Tỉnh/Thành phố <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-alt text-teal"></i>
                          </span>
                          <select v-model="receiver.city" class="form-select shadow-none border-start-0"
                            :disabled="!isReceiverEditable" @change="handleReceiverProvinceChange"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;">
                            <option value="" disabled>Chọn tỉnh/thành phố</option>
                            <option v-for="province in provinces" :key="province.code" :value="province.name">
                              {{ province.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Quận/Huyện <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo text-teal"></i>
                          </span>
                          <select v-model="receiver.district" class="form-select shadow-none border-start-0"
                            :disabled="!isReceiverEditable || !receiver.city" @change="handleReceiverDistrictChange"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;">
                            <option value="" disabled>Chọn quận/huyện</option>
                            <option v-for="district in districts" :key="district.code" :value="district.name">
                              {{ district.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Phường/Xã <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-fill text-teal"></i>
                          </span>
                          <select v-model="receiver.ward" class="form-select shadow-none border-start-0"
                            :disabled="!isReceiverEditable || !receiver.district"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;">
                            <option value="" disabled>Chọn phường/xã</option>
                            <option v-for="ward in wards" :key="ward.code" :value="ward.name">
                              {{ ward.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem;">
                          Địa chỉ cụ thể <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-house-door text-teal"></i>
                          </span>
                          <input v-model="receiver.address" type="text" class="form-control shadow-none border-start-0"
                            placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường,...)" :disabled="!isReceiverEditable"
                            style="border-radius: 0 8px 8px 0; transition: all 0.3s ease;"
                            @focus="this.classList.add('border-teal')" @blur="this.classList.remove('border-teal')" />
                        </div>
                      </div>
                      <div class="mt-4 text-end" v-if="!isReceiverEditable">
                        <button class="btn btn-outline-teal btn-sm px-4 py-2" @click="isReceiverEditable = true"
                          style="border-radius: 8px; transition: all 0.3s ease;">
                          <i class="bi bi-pencil-square me-2"></i>Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voucher Section -->
                <div class="voucher-section mb-5">
                  <h6 class="fw-bold text-dark mb-2" style="font-size: 1.3rem; letter-spacing: 0.5px;">
                    Mã Giảm Giá
                  </h6>
                  <div class="voucher-container bg-white p-3 rounded-3 shadow-sm animate__animated animate__fadeIn"
                    style="border: 1px solid rgba(52, 211, 153, 0.1); backdrop-filter: blur(5px);">
                    <button class="btn gradient-custom-teal text-white w-100 py-3 fw-medium btn-voucher"
                      @click="showDiscountModal = true"
                      style="border-radius: 10px; transition: all 0.3s ease; font-size: 1rem;"
                      @mouseover="this.style.transform = 'scale(1.02)'" @mouseout="this.style.transform = 'scale(1)'">
                      Chọn mã giảm giá
                    </button>
                    <div class="price-info mt-4 p-3 rounded-2 bg-light shadow-sm animate__animated animate__fadeInUp"
                      style="border-left: 4px solid #34d399;">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-medium text-dark" style="font-size: 0.95rem;">Tổng tiền hàng:</span>
                        <span class="fw-bold text-dark">{{ formatPrice(totalPrice) }}</span>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-medium text-dark" style="font-size: 0.95rem;">Giảm giá:</span>
                        <span class="fw-bold text-danger">−{{ formatPrice(discount) }}</span>
                      </div>
                      <hr class="my-2" style="border-color: rgba(52, 211, 153, 0.2);">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-dark" style="font-size: 1.1rem;">Tổng thanh toán:</span>
                        <span class="fw-bold fs-4 text-success">{{ formatPrice(totalPrice - discount) }}</span>
                      </div>
                    </div>
                    <div v-if="suggestAdditionalPurchase.message"
                      class="suggestion-alert mt-3 p-3 rounded-2 animate__animated animate__bounceIn"
                      style="background: linear-gradient(135deg, #fff3e0, #ffe8cc); border: 1px solid #ff9800;">
                      <p class="fw-medium text-dark mb-0" style="color: #e65100; font-size: 0.95rem;">
                        <i class="bi bi-info-circle-fill me-2"></i>{{ suggestAdditionalPurchase.message }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Payment Methods -->
                <div>
                  <h6 class="fw-semibold text-dark">Phương thức thanh toán</h6>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <button @click="selectPayment('transfer')" class="btn px-4 py-2 select-btn"
                      :class="{ 'gradient-custom-teal text-white': paymentMethod === 'transfer', border: paymentMethod !== 'transfer' }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)">
                      Chuyển khoản
                    </button>
                    <button @click="selectPayment('cash')" class="btn px-4 py-2 select-btn"
                      :class="{ 'gradient-custom-teal text-white': paymentMethod === 'cash', border: paymentMethod !== 'cash' }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)">
                      Tiền mặt
                    </button>
                    <button @click="selectPayment('both')" class="btn px-4 py-2 select-btn"
                      :class="{ 'gradient-custom-teal text-white': paymentMethod === 'both', border: paymentMethod !== 'both' }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)">
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
                  <div v-if="showQRCode" class="mt-3 text-center qr-code-container">
                    <h6 class="fw-semibold text-dark">Quét mã QR để thanh toán</h6>
                    <qrcode-vue :value="qrCodeValue" :size="200" level="H" />
                    <p class="text-muted mt-2">Số tiền: {{ formatPrice(qrCodeAmount) }}</p>
                  </div>
                </div>

                <!-- Pay Button -->
                <button class="btn w-100 py-3 pay-btn gradient-custom-teal text-white mt-auto" @click="ThanhToan"
                  :disabled="!activeInvoiceId || cartItems.length === 0 || isCreatingOrder">
                  <i class="bi bi-credit-card me-2"></i>
                  <span class="fw-semibold">Thanh toán</span>
                </button>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- IMEI Modal for Cart Item -->
    <div v-if="showCartIMEIModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
          style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 16px;">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">IMEI của sản phẩm trong giỏ hàng</h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="closeCartIMEIModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
              style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
              <div class="row align-items-center">
                <div class="col-md-4 text-center">
                  <img
                    :src="selectedCartItem?.image || 'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'"
                    class="phone-image img-fluid rounded" :alt="selectedCartItem?.name"
                    style="max-height: 150px; object-fit: contain; transition: transform 0.3s ease;"
                    @mouseover="this.style.transform = 'scale(1.05)'" @mouseout="this.style.transform = 'scale(1)'" />
                </div>
                <div class="col-md-8">
                  <h4 class="fw-bold text-dark mb-2">{{ selectedCartItem?.name }}</h4>
                  <div class="d-flex flex-wrap gap-3">
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{
                      selectedCartItem?.color
                      }}</span>
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{ selectedCartItem?.ram
                      }}</span>
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{
                      selectedCartItem?.storage
                      }}</span>
                    <span class="badge gradient-custom-teal text-white px-3 py-1">{{
                      formatPrice(selectedCartItem?.price)
                      }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="imei-list-container">
              <h6 class="fw-semibold text-dark mb-3">Danh sách IMEI đã chọn</h6>
              <div v-if="!selectedCartItem?.imei || selectedCartItem.imei.split(', ').length === 0"
                class="text-center text-muted py-4 animate__animated animate__fadeIn">
                <i class="bi bi-info-circle me-2"></i>Không có IMEI nào được chọn.
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(imei, index) in selectedCartItem.imei.split(', ')" :key="imei"
                  class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                  style="background: #fff; border: 1px solid rgba(52, 211, 153, 0.1);">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-teal me-3" style="min-width: 30px;">{{ index + 1 }}.</span>
                      <i class="bi bi-upc-scan me-3 text-teal" style="font-size: 1.2rem;"></i>
                      <span class="text-dark fw-medium">{{ imei }}</span>
                    </div>
                    <button class="btn btn-danger btn-sm delete-imei-btn animate__animated animate__bounceIn"
                      @click="deleteIMEI(imei)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4 py-2 gradient-custom-teal text-white" @click="closeCartIMEIModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- IMEI Modal for Product Selection -->
    <div v-if="showIMEIModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
          style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 16px;">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">Chọn IMEI cho sản phẩm</h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="closeIMEIModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
              style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
              <div class="row align-items-center">
                <div class="col-md-4 text-center">
                  <img
                    :src="selectedProduct?.image || 'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'"
                    class="phone-image img-fluid rounded" :alt="selectedProduct?.name"
                    style="max-height: 150px; object-fit: contain; transition: transform 0.3s ease;"
                    @mouseover="this.style.transform = 'scale(1.05)'" @mouseout="this.style.transform = 'scale(1)'" />
                </div>
                <div class="col-md-8">
                  <h4 class="fw-bold text-dark mb-2">{{ selectedProduct?.name }}</h4>
                  <div class="d-flex flex-wrap gap-3">
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{
                      selectedProduct?.color
                      }}</span>
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{ selectedProduct?.ram
                      }}</span>
                    <span class="badge text-white px-3 py-1" style="background-color: #1f3a44;">{{
                      selectedProduct?.storage
                      }}</span>
                    <span class="badge gradient-custom-teal text-white px-3 py-1">{{ formatPrice(selectedProduct?.price)
                      }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="imei-list-container">
              <h6 class="fw-semibold text-dark mb-3">Danh sách IMEI khả dụng</h6>
              <div v-if="availableIMEIs.length === 0"
                class="text-center text-muted py-4 animate__animated animate__fadeIn">
                <i class="bi bi-info-circle me-2"></i>Không có IMEI nào khả dụng.
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(item, index) in availableIMEIs" :key="item.id"
                  class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                  style="background: #fff; border: 1px solid rgba(52, 211, 153, 0.1);">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-teal me-3" style="min-width: 30px;">{{ index + 1 }}.</span>
                      <i class="bi bi-upc-scan me-3 text-teal" style="font-size: 1.2rem;"></i>
                      <span class="text-dark fw-medium">{{ item.imei }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <input type="checkbox" :value="item.imei" v-model="selectedIMEIs"
                        class="form-check-input me-2 imei-checkbox" style="border-color: #34d399;"
                        @change="handleIMEISelection" />
                      <span v-if="selectedIMEIs.includes(item.imei)"
                        class="badge bg-success text-white px-2 py-1 animate__animated animate__bounceIn">
                        Đã chọn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="selectedIMEIs.length > 0"
                class="selected-imei-container mt-4 animate__animated animate__fadeIn">
                <h6 class="selected-imei-title fw-semibold text-dark mb-3">IMEI đã chọn</h6>
                <div class="d-flex flex-column gap-3">
                  <div v-for="(imei, index) in selectedIMEIs" :key="imei"
                    class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                    style="background: #fff; border: 1px solid rgba(52, 211, 153, 0.1);">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <span class="fw-bold text-teal me-3" style="min-width: 30px;">{{ index + 1 }}.</span>
                        <i class="bi bi-upc-scan me-2 text-teal" style="font-size: 1.1rem;"></i>
                        <span class="imei-text fw-medium text-dark">{{ imei }}</span>
                      </div>
                      <button class="delete-imei-btn btn btn-danger btn-sm" @click="removeIMEI(imei)">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-teal px-4 py-2 gradient-custom-teal text-white" @click="addProductWithIMEIs"
              :disabled="selectedIMEIs.length === 0">
              <i class="bi bi-cart-plus me-2"></i>Thêm vào giỏ hàng
            </button>
            <button class="btn btn-outline-secondary px-4 py-2" @click="closeIMEIModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <div v-if="showDiscountModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
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
            <ul class="nav nav-tabs mb-4" style="border-bottom: 2px solid rgba(52, 211, 153, 0.2)">
              <li class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === 'private' }" @click="activeTab = 'private'">
                  Mã Riêng
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === 'public' }" @click="activeTab = 'public'">
                  Mã Công Khai
                </button>
              </li>
            </ul>
            <div v-show="activeTab === 'private'" class="discount-section animate__animated animate__fadeIn">
              <h6 class="fw-semibold text-dark mb-4 text-center">Mã Giảm Giá Riêng</h6>
              <div v-if="privateDiscountCodes.length === 0" class="empty-state text-center py-5">
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-teal"
                  style="width: 60px; height: 60px">
                  <i class="bi bi-gift text-white" style="font-size: 2rem"></i>
                </div>
                <p class="text-muted mt-2">Bạn chưa có mã giảm giá riêng nào.</p>
              </div>
              <div v-else class="row g-3">
                <div v-for="code in privateDiscountCodes" :key="code.id" class="col-md-6">
                  <div class="card shadow-sm discount-card h-100 animate__animated animate__zoomIn">
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="discount-code fw-bold text-teal mb-1">{{ code.code }}</h6>
                          <p class="mb-1">Giảm <span class="highlight-text fw-semibold text-success">{{
                              formatPrice(code.value) }}</span></p>
                        </div>
                        <span class="badge bg-teal text-white px-2 py-1">Riêng</span>
                      </div>
                      <button class="btn btn-sm gradient-custom-teal text-white btn-apply w-100 mt-3"
                        @click="selectedPrivateDiscount = code; applyPrivateDiscount()">
                        <i class="bi bi-check-circle me-2"></i>Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="activeTab === 'public'" class="discount-section animate__animated animate__fadeIn">
              <h6 class="fw-semibold text-dark mb-4 text-center">Mã Giảm Giá Công Khai</h6>
              <div class="row g-3">
                <div v-for="code in publicDiscountCodes" :key="code.id" class="col-md-6">
                  <div class="card shadow-sm discount-card h-100 animate__animated animate__zoomIn">
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="discount-code fw-bold text-teal mb-1">{{ code.code }}</h6>
                          <p class="mb-1">Giảm <span class="highlight-text fw-semibold text-success">{{ code.percent
                              }}%</span></p>
                          <p class="mb-1">Đơn tối thiểu: <span class="fw-semibold">{{ formatPrice(code.minOrder)
                              }}</span>
                          </p>
                          <p class="text-muted small">Hết hạn: {{ code.expiry }}</p>
                        </div>
                        <span class="badge bg-success text-white px-2 py-1">Công khai</span>
                      </div>
                      <button class="btn btn-sm gradient-custom-teal text-white btn-apply w-100 mt-3"
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

    <!-- Customer Modal -->
    <div v-if="isCustomerModalOpen" class="modal fade show d-block" tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5)">
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
            <button class="btn btn-light px-4 py-2 gradient-custom-teal text-white" @click="addNewCustomer">
              Thêm khách hàng
            </button>
            <button class="btn btn-outline-secondary px-4 py-2" @click="isCustomerModalOpen = false">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification and Toast -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import BanHangLogic from './BanHang.js';

export default {
  name: "BanHang",
  ...BanHangLogic,
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

.gradient-custom-teal {
  background: #34d399;
}

.gradient-custom-yellow {
  background: linear-gradient(135deg, #ffa2008a, #ffb2008a);
  border: 1px solid #ffb300;
}

.gradient-custom-green {
  background: linear-gradient(135deg, #16a34a, #15803d);
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
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.bill-card {
  animation: fadeInUp 0.3s ease-out;
}

/* Ensure row stretches children to equal height */
.row.d-flex.align-items-stretch {
  display: flex !important;
  align-items: stretch !important;
}

/* Ensure columns take full height */
.col-lg-8,
.col-lg-4 {
  display: flex;
  flex-direction: column;
}

/* Ensure customer-card and its content take full height */
.customer-card {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

.customer-card .card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Ensure invoice card takes full height */
.card.shadow-sm.mb-4 {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card.shadow-sm.mb-4 .card-body {
  flex-grow: 1;
}

/* Ensure FilterTableSection takes full height */
.filter-table-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Ensure order-card takes full height */
.order-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-height: 960px;
}

/* Ensure card-body inside order-card can scroll and takes full height */
.order-card .card-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(52, 211, 153, 0.3) transparent;
}

/* Customize scrollbar */
.order-card .card-body::-webkit-scrollbar {
  width: 8px;
}

.order-card .card-body::-webkit-scrollbar-track {
  background: transparent;
}

.order-card .card-body::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.3);
  border-radius: 4px;
}

.order-card .card-body::-webkit-scrollbar-thumb:hover {
  background: rgba(52, 211, 153, 0.5);
}

/* Ensure sections inside card-body have minimum height */
.voucher-section,
.receiver-form,
.qr-code-container {
  min-height: 100px;
}

/* Center content when cart is empty */
.order-card .empty-cart-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
}

.product-card,
.customer-card,
.order-card {
  animation: slideInLeft 0.5s ease-out;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card {
  height: 100% !important;
}

.add-bill-btn,
.add-to-cart-btn,
.add-customer-btn,
.select-btn,
.btn-voucher,
.pay-btn,
.btn-apply {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-teal {
  color: #1f3a44;
}

.add-to-cart-btn:hover,
.add-customer-btn:hover,
.btn-voucher:hover,
.btn-apply:hover {
  background: #16a34a;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.select-btn:hover {
  background-color: rgba(52, 211, 153, 0.1) !important;
}

.pay-btn {
  margin-top: 1rem !important;
}

.pay-btn:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
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
  border: 1px solid rgba(52, 211, 153, 0.2);
  transition: all 0.2s ease;
}

.btn-close-custom:hover {
  background-color: rgba(52, 211, 153, 0.1);
  border-color: #34d399;
}

.form-select,
.form-control {
  transition: all 0.2s ease;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.form-select:focus,
.form-control:focus {
  border-color: rgba(52, 211, 153, 0.2);
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.1);
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(52, 211, 153, 0.3) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(52, 211, 153, 0.3);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background-color: transparent;
}

.cursor-pointer {
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  background-color: rgba(52, 211, 153, 0.1) !important;
}

.btn-outline-secondary {
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.btn-view {
  border-color: #1f3a44;
  color: #1f3a44;
}

.btn-view:hover {
  color: #ffffff;
  background-color: #1f3a44;
}

.text-dark {
  color: #1f3a44 !important;
}

.text-success {
  color: #16a34a !important;
}

.text-muted {
  color: #6c757d !important;
}

.imei-list-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(52, 211, 153, 0.3) transparent;
}

.imei-list-container::-webkit-scrollbar {
  width: 6px;
}

.imei-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(52, 211, 153, 0.3);
  border-radius: 3px;
}

.imei-list-container::-webkit-scrollbar-track {
  background-color: transparent;
}

.imei-card {
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.imei-card:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(52, 211, 153, 0.3);
}

.imei-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.imei-item i {
  color: #34d399;
  transition: color 0.2s ease;
}

.imei-item:hover i {
  color: #16a34a;
}

.selected-imei-container {
  margin-top: 1.5rem;
  animation: fadeIn 0.3s ease-out;
}

.selected-imei-title {
  color: #1f3a44;
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
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(52, 211, 153, 0.2);
}

.imei-badge:hover {
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
  transform: translateY(-1px);
}

.imei-badge .bi-upc-scan {
  color: #34d399;
  font-size: 1.1rem;
  margin-right: 0.5rem;
  transition: color 0.2s ease;
}

.imei-badge:hover .bi-upc-scan {
  color: #16a34a;
}

.imei-text {
  color: #1f3a44;
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
  color: #dc3545;
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  box-shadow: 0 2px 4px rgba(211, 47, 47, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.delete-imei-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
  transform: translateY(-1px);
}

.delete-imei-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(211, 47, 47, 0.15);
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
  content: "";
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
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
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
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.discount-card:hover {
  box-shadow: 0 6px 12px rgba(52, 211, 153, 0.3);
  transform: translateY(-3px);
}

.discount-code {
  color: #34d399;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.highlight-text {
  color: #16a34a;
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
  scrollbar-color: rgba(52, 211, 153, 0.3) transparent;
}

.discount-modal-body::-webkit-scrollbar {
  width: 6px;
}

.discount-modal-body::-webkit-scrollbar-thumb {
  background-color: rgba(52, 211, 153, 0.3);
  border-radius: 3px;
}

.discount-modal-body::-webkit-scrollbar-track {
  background-color: transparent;
}

.nav-tabs .nav-link {
  color: #1f3a44;
  font-weight: 500;
  border: none;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
  color: #34d399;
  background: transparent;
  border-bottom: 3px solid #34d399;
}

.nav-tabs .nav-link:hover {
  color: #34d399;
  background: rgba(52, 211, 153, 0.05);
}

.discount-section {
  padding: 0 0.5rem;
}

.form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.qr-code-container {
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(52, 211, 153, 0.2);
}

.product-info-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.product-info-card:hover {
  box-shadow: 0 6px 12px rgba(52, 211, 153, 0.3);
  transform: translateY(-3px);
}

.phone-image {
  filter: drop-shadow(0 2px 4px rgba(52, 211, 153, 0.2));
}

.imei-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.imei-card:hover {
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
}

.imei-checkbox {
  transform: scale(1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.imei-checkbox:checked {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.3);
}

.imei-badge {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.imei-badge:hover {
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
  transform: translateY(-1px);
}

.delete-imei-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ffffff, #f1f3f5);
  color: #dc3545;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.delete-imei-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
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

  .product-info-card {
    padding: 1.5rem;
  }

  .phone-image {
    max-height: 120px;
  }

  .imei-card {
    padding: 0.75rem;
  }

  .imei-badge {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .delete-imei-btn {
    width: 24px;
    height: 24px;
  }

  .delete-imei-btn .bi-x {
    font-size: 0.9rem;
  }

  .order-card .card-body {
    padding: 0.75rem;
  }

  .voucher-section,
  .receiver-form,
  .qr-code-container {
    min-height: 80px;
  }

  .order-card .empty-cart-message {
    min-height: 150px;
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

.btn-teal {
  background-color: #34d399;
  border-color: #34d399;
}

.btn-teal:hover {
  background-color: #16a34a;
  border-color: #16a34a;
}

.btn-outline-teal {
  border-color: #34d399;
  color: #34d399;
}

.btn-outline-teal:hover {
  background-color: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.border-teal {
  border-color: #34d399 !important;
}

.bg-teal {
  background-color: #34d399;
}
</style>