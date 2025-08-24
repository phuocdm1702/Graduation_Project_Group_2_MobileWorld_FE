<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Quản Lý Bán Hàng" badgeText="Hệ Thống POS" badgeClass="teal" :backgroundOpacity="0.95" />

    <!-- Invoice and Customer Cluster -->
    <div class="row d-flex align-items-stretch">
      <div class="col-lg-8 d-flex flex-column">
        <!-- Invoice Search and Pending Invoices -->
        <div class="card shadow-sm mb-4 flex-fill" style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: none;
          ">
          <div class="card-body p-3">
            <!-- Invoice Search -->
            <div class="search-card mb-4" style="
                background: linear-gradient(135deg, #60a5fa, #34d399);
                border-radius: 0.5rem;
              ">
              <div class="card-body p-3">
                <div class="d-flex gap-3 align-items-center flex-wrap">
                  <div class="flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text bg-white">
                        <i class="bi bi-search text-muted"></i>
                      </span>
                      <input type="text" class="form-control search-input" placeholder="Tìm kiếm hóa đơn..."
                        :value="invoiceSearchQuery" @input="debouncedInvoiceSearch($event.target.value)" />
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
              <div class="bill-card" style="
                  border-bottom-right-radius: 12px;
                  border-bottom-left-radius: 12px;
                ">
                <div class="card-body p-4">
                  <div class="d-flex gap-3 overflow-x-auto pb-2">
                    <div v-for="invoice in filteredPendingInvoices" :key="invoice.id"
                      @click="loadPendingInvoice(invoice)"
                      class="card shadow-sm bill-card p-2 cursor-pointer min-w-[160px] flex-shrink-0" :style="{
                        background:
                          activeInvoiceId === invoice.id
                            ? 'rgba(52, 211, 153, 0.05)'
                            : 'rgba(255, 255, 255, 0.9)',
                        border:
                          activeInvoiceId === invoice.id
                            ? '2px solid #34d399'
                            : 'none',
                      }">
                      <div class="card-body p-2" style="
                          border-bottom-right-radius: 12px;
                          border-bottom-left-radius: 12px;
                        ">
                        <div class="d-flex gap-3 justify-content-between align-items-center mb-2">
                          <span class="fw-bold text-dark">{{
                            invoice.ma
                          }}</span>
                          <span class="badge gradient-custom-yellow text-white px-3 py-1">{{ invoice.status }}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mt-2">
                          <small class="text-muted">{{ totalQuantity(invoice.items) }} sản phẩm</small>
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
          <div class="customer-card bg-white shadow-sm animate__animated animate__fadeIn flex-fill"
            style="border-radius: 0.5rem">
            <div class="card-body p-4 d-flex flex-column h-100">
              <div class="mb-4">
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-search text-teal"></i>
                  </span>
                  <input type="text" class="form-control search-input border-start-0"
                    placeholder="Tìm kiếm khách hàng, sdt..." v-model="searchCustomer"
                    @input="debouncedCustomerSearch($event.target.value)" style="
                      border-radius: 0 0.5rem 0.5rem 0;
                      transition: all 0.3s ease;
                    " @focus="this.classList.add('border-teal')" @blur="this.classList.remove('border-teal')" />
                </div>
              </div>
              <div class="row flex-grow-1">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                    Tên khách hàng <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-person text-teal"></i>
                    </span>
                    <input v-model="customer.name" type="text" class="form-control search-input border-start-0"
                      placeholder="Tên khách hàng" disabled style="
                        border-radius: 0 0.5rem 0.5rem 0;
                        transition: all 0.3s ease;
                      " />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-telephone text-teal"></i>
                    </span>
                    <input v-model="customer.phone" type="tel" class="form-control search-input border-start-0"
                      placeholder="Số điện thoại" disabled style="
                        border-radius: 0 0.5rem 0.5rem 0;
                        transition: all 0.3s ease;
                      " />
                  </div>
                </div>
              </div>
              <button class="btn teal text-white w-100 mt-3 py-2 fw-medium add-customer-btn" @click="openCustomerModal"
                style="
                  border-radius: 0.5rem;
                  transition: all 0.3s ease;
                  font-size: 1rem;
                " @mouseover="this.style.transform = 'scale(1.02)'" @mouseout="this.style.transform = 'scale(1)'">
                Thêm khách hàng
              </button>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <NotificationModal ref="notificationModal" />
    <ToastNotification ref="toastNotification" />
    <!-- Scan Barcode Modal -->
    <div v-if="showScanModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 0.5rem;
          ">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">Quét Barcode</h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="closeScanModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div id="barcode-scanner" style="position: relative">
              <video id="barcode-scanner-video" ref="videoElement" style="width: 100%; height: auto" autoplay></video>
              <div id="scan-region" ref="scanRegion" class="scan-region">
                <div class="scan-border"></div>
              </div>
              <div v-if="isScanning" class="text-center mt-2">
                <span class="spinner-border spinner-border-sm text-teal" role="status"></span>
                <span class="text-muted ms-2">Đang quét...</span>
              </div>
              <div v-if="scanError" class="text-danger text-center mt-2">
                {{ scanError }}
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button @click="closeScanModal" class="btn btn-secondary me-2">
              Đóng
            </button>
            <button @click="startZXingScan" class="btn btn-success" :disabled="isCameraActive">
              Bắt đầu quét
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Provider Modal -->
    <div v-if="showPaymentProviderModal" class="modal fade show d-block" tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 0.5rem;
          ">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">
              Chọn phương thức thanh toán
            </h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="closePaymentProviderModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex flex-column gap-3">
              <button class="btn btn-light p-3 d-flex align-items-center gap-3" @click="selectPaymentProvider('vnpay')"
                style="border: 1px solid #34d399; border-radius: 0.5rem">
                <i class="bi bi-credit-card"></i>
                <span class="fw-semibold">VNPAY</span>
              </button>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" @click="closePaymentProviderModal">
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart and Product List Cluster -->
    <div class="row d-flex align-items-stretch">
      <div class="col-lg-8 d-flex flex-column">
        <!-- Cart Section -->
        <FilterTableSection title="Sản Phẩm Trong Giỏ hàng" icon="bi bi-basket" class="flex-fill">
          <div class="shadow-sm product-card" style="
              border-bottom-right-radius: 12px;
              border-bottom-left-radius: 8px;
              flex: 1;
            ">
            <div class="d-flex justify-content-end">
              <button class="btn add-to-cart-btn teal text-white"
                style="width: 120px; margin-top: 1rem; margin-right: 1rem" @click="scanQR" :disabled="!activeInvoiceId">
                Quét QR
              </button>
            </div>
            <div class="card-body p-4">
              <!-- Thanh tìm kiếm và bộ lọc -->
              <div class="row g-3 mb-4">
                <div class="col-md-3 search-input-wrapper">
                  <i class="bi bi-search search-icon"></i>
                  <input v-model="cartSearchQuery" type="text" class="form-control search-input"
                    style="padding-left: 2rem" placeholder="Tìm sản phẩm, IMEI..."
                    @input="debouncedCartSearch($event.target.value)" />
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterColor" class="form-select search-input">
                    <option value="">Tất cả màu</option>
                    <option v-for="color in uniqueCartColors" :key="color" :value="color">
                      {{ color }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterRam" class="form-select search-input">
                    <option value="">Tất cả RAM</option>
                    <option v-for="ram in uniqueCartRams" :key="ram" :value="ram">
                      {{ ram }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterStorage" class="form-select search-input">
                    <option value="">Tất cả bộ nhớ</option>
                    <option v-for="storage in uniqueCartStorages" :key="storage" :value="storage">
                      {{ storage }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Container giỏ hàng với thanh cuộn -->
              <div v-if="!filteredCartItems || filteredCartItems.length === 0"
                class="empty-cart-container text-center py-5">
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center teal"
                  style="width: 80px; height: 80px">
                  <i class="bi bi-cart-x text-white" style="font-size: 2.5rem"></i>
                </div>
                <p class="text-muted mb-0 fw-medium">
                  Giỏ hàng trống hoặc không tìm thấy sản phẩm
                </p>
              </div>
              <div v-else class="cart-items-container" style="
                  max-height: 500px;
                  overflow-y: auto;
                  overflow-x: hidden;
                  padding-right: 10px;
                ">
                <div v-for="(item, index) in filteredCartItems" :key="item.id" class="mb-4">
                  <div class="cart-item-card shadow-sm p-4 animate__animated animate__fadeInUp" style="
                      background: rgba(255, 255, 255, 0.95);
                      border-radius: 0.5rem;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                      transition: all 0.3s ease;
                    ">
                    <div class="row align-items-center">
                      <!-- S Virgin Mary -->
                      <div class="col-md-1 text-center">
                        <span class="fw-bold text-dark">{{ index + 1 }}</span>
                      </div>
                      <!-- Hình ảnh sản phẩm -->
                      <div class="col-md-3 text-center">
                        <img :src="item.imageUrl" class="img-fluid rounded" :alt="item.tenSanPham || 'Ảnh sản phẩm'"
                          style="max-height: 120px; object-fit: contain; transition: transform 0.3s ease;"
                          loading="lazy" @error="handleImageError($event)" />
                      </div>
                      <!-- Thông tin sản phẩm -->
                      <div class="col-md-5">
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <h5 class="fw-bold text-dark mb-0">
                            {{ item.name }}
                          </h5>
                          <span class="info-icon" @mouseenter="showProductDetailsModal(item, $event)"
                            @mouseleave="hideProductDetailsModal">
                            <i class="bi bi-info-circle text-teal" style="font-size: 1.2rem"></i>
                          </span>
                        </div>
                        <div class="d-flex flex-wrap gap-2 mb-2">
                          <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ item.color
                          }}</span>
                          <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ item.ram
                          }}</span>
                          <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ item.storage
                          }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <span class="text-muted">IMEI:</span>
                          <button class="btn btn-sm btn-outline-teal" @click="showIMEIModalForItem(item)">
                            Xem IMEI
                          </button>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <span class="text-muted">Số lượng:</span>
                          <span class="fw-semibold">{{ item.quantity }}</span>
                        </div>
                        <div v-if="item.priceChangeText" class="text-muted small mb-2">
                          {{ item.priceChangeText }}
                        </div>
                        <div v-if="selectedDiscount" class="d-flex align-items-center gap-2">
                          <span class="text-muted">Mã giảm giá:</span>
                          <span class="badge bg-success text-white px-3 py-2">
                            {{ selectedDiscount.code }} (-{{
                              formatPrice(selectedDiscount.value)
                            }})
                          </span>
                        </div>
                      </div>
                      <!-- Giá và hành động -->
                      <div class="col-md-3 text-end">
                        <div class="mb-3">
                          <span class="fw-bold text-success fs-5">
                            {{ formatPrice(item.currentPrice * item.quantity) }}
                          </span>
                          <div class="text-muted small">
                            Đơn giá: {{ formatPrice(item.currentPrice) }}
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" @click="removeItem(item)">
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Product List Section -->
        <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-table" class="flex-fill">
          <div class="mt-4" style="flex: 1">
            <div class="row g-3 p-2">
              <div class="col-md-3 search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input :value="productSearchQuery" type="text" class="form-control search-input"
                  style="padding-left: 2rem" placeholder="Tìm kiếm sản phẩm..."
                  @input="debouncedProductSearch($event.target.value)" />
              </div>
              <div class="col-md-3">
                <select v-model="filterColor" class="form-select search-input">
                  <option value="">Tất cả màu</option>
                  <option v-for="color in uniqueColors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filterRam" class="form-select search-input">
                  <option value="">Tất cả RAM</option>
                  <option v-for="ram in uniqueRams" :key="ram" :value="ram">
                    {{ ram }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filterStorage" class="form-select search-input">
                  <option value="">Tất cả bộ nhớ</option>
                  <option v-for="storage in uniqueStorages" :key="storage" :value="storage">
                    {{ storage }}
                  </option>
                </select>
              </div>
            </div>
            <DataTable title="" :headers="productHeaders" :data="filteredProducts"
              :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]" @scroll="handleScroll">
              <template #stt="{ globalIndex }">
                {{ globalIndex + 1 }}
              </template>
              <template v-slot:imageUrl="{ item }">
                <img :src="item.imageUrl" alt="Ảnh sản phẩm" class="product-img"
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                  @error="handleImageError($event)" />
              </template>
              <template #tenSanPham="{ item }">
                <span class="text-muted">{{ item.tenSanPham }}</span>
              </template>
              <template #maSanPham="{ item }">
                <span class="fw-medium" style="color: #1f3a44">{{
                  item.maSanPham
                }}</span>
              </template>
              <template #mauSac="{ item }">
                <span class="text-muted">{{ item.mauSac }}</span>
              </template>
              <template #dungLuongRam="{ item }">
                <span class="text-muted">{{ item.dungLuongRam }}</span>
              </template>
              <template #dungLuongBoNhoTrong="{ item }">
                <span class="text-muted">{{ item.dungLuongBoNhoTrong }}</span>
              </template>
              <template #giaBan="{ item }">
                <span class="fw-semibold" style="color: #16a34a">{{
                  formatPrice(item.giaBan)
                }}</span>
              </template>
              <template #actions="{ item }">
                <button class="btn btn-sm px-4 py-2 add-to-cart-btn teal text-white" @click="showIMEIList(item)"
                  :disabled="!activeInvoiceId">
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
          <div class="order-card">
            <div
              class="card-header p-3 d-flex justify-content-end align-items-center border-bottom bg-white rounded-top">
              <div class="form-check form-switch d-flex align-items-center gap-2">
                <input class="form-check-input" type="checkbox" v-model="isDelivery" @change="toggleDelivery"
                  style="border-color: #34d399" />
                <label class="form-check-label text-muted mb-0">Bán giao hàng</label>
              </div>
            </div>

            <div class="card-body p-3 pt-0 d-flex flex-column variant-scroll-container">
              <!-- Hiển thị placeholder khi giỏ hàng trống -->
              <div v-if="!cartItems || cartItems.length === 0" class="empty-cart-message text-center py-4">
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center teal"
                  style="width: 60px; height: 60px">
                  <i class="bi bi-info-circle text-white" style="font-size: 2rem"></i>
                </div>
                <p class="text-muted mb-0 fw-medium">
                  Chưa có sản phẩm trong đơn hàng
                </p>
              </div>
              <!-- Nội dung thông tin đơn khi có sản phẩm -->
              <div v-else class="d-flex flex-column flex-grow-1">
                <div v-if="isDelivery" class="mb-5">
                  <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
                    <h6 class="fw-bold text-dark" style="font-size: 1.3rem; letter-spacing: 0.5px">
                      Thông tin người nhận
                    </h6>

                    <button class="btn btn-outline-teal btn-sm px-4 py-2" @click="openAddressModal"
                      style="border-radius: 0.5rem; transition: all 0.3s ease">
                      <i class="bi bi-geo-alt-fill me-2"></i>Chọn địa chỉ
                    </button>
                  </div>

                  <div class="receiver-form bg-white p-3 shadow-sm animate__animated animate__fadeIn" style="
                  border: 1px solid rgba(52, 211, 153, 0.1);
                  border-radius: 0.5rem;
                  backdrop-filter: blur(5px);
                ">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Tên người nhận <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-person text-teal"></i>
                          </span>
                          <input v-model="customer.name" type="text" class="form-control search-input border-start-0"
                            placeholder="Nhập tên người nhận" disabled style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Số điện thoại <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-telephone text-teal"></i>
                          </span>
                          <input v-model="customer.phone" type="tel" class="form-control search-input border-start-0"
                            placeholder="Nhập số điện thoại" disabled style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Tỉnh/Thành phố <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-alt text-teal"></i>
                          </span>
                          <select v-model="customer.city" class="form-select search-input border-start-0"
                            @change="handleCustomerProvinceChange" style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " disabled>
                            <option value="" disabled>
                              Chọn tỉnh/thành phố
                            </option>
                            <option v-for="province in provinces" :key="province.code" :value="province.name">
                              {{ province.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Quận/Huyện <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo text-teal"></i>
                          </span>
                          <select v-model="customer.district" class="form-select search-input border-start-0"
                            @change="handleCustomerDistrictChange" style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " disabled>
                            <option value="" disabled>Chọn quận/huyện</option>
                            <option v-for="district in districts" :key="district.code" :value="district.name">
                              {{ district.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Phường/Xã <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-fill text-teal"></i>
                          </span>
                          <select v-model="customer.ward" class="form-select search-input border-start-0" style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " disabled>
                            <option value="" disabled>Chọn phường/xã</option>
                            <option v-for="ward in wards" :key="ward.code" :value="ward.name">
                              {{ ward.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Địa chỉ cụ thể <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-house-door text-teal"></i>
                          </span>
                          <input v-model="customer.address" type="text" class="form-control search-input border-start-0"
                            placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường,...)" style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " />
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2 mt-2">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem; margin-top: 10px">
                          Giao hàng tận nhà <span class="text-danger"></span>
                        </label>
                        <input type="checkbox" class="form-check-input" v-model="isHomeDelivery" style="
                        margin-top: 10px;
                        border-color: #34d399;
                        margin-left: auto;
                      " />
                      </div>
                      <div v-if="isHomeDelivery" class="mt-2">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Phí vận chuyển <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-truck text-teal"></i>
                          </span>
                          <input v-model.number="shippingFee" type="number"
                            class="form-control search-input border-start-0" placeholder="Nhập phí vận chuyển (VND)"
                            min="0" style="
                          border-radius: 0 0.5rem 0.5rem 0;
                          transition: all 0.3s ease;
                        " @input="updateShippingFee" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voucher Section -->
                <div class="voucher-section mb-2 mt-3">
                  <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2"
                    style="font-size: 1.2rem; letter-spacing: 0.5px">
                    Mã Giảm Giá <span class="text-danger">*</span>
                  </h6>
                  <!-- Voucher Tabs -->
                  <ul class="nav nav-tabs mb-3" style="border-bottom: 2px solid #34d399">
                    <li class="nav-item">
                      <button class="nav-link" :class="{ active: activeTab === 'best' }" @click="setActiveTab('best')"
                        style="color: #1f3a44; font-weight: 600">
                        Mã Tốt Nhất
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" :class="{ active: activeTab === 'alternative' }"
                        @click="setActiveTab('alternative')" style="color: #1f3a44; font-weight: 600">
                        Mã Thay Thế
                      </button>
                    </li>
                  </ul>
                  <!-- Voucher Content -->
                  <div class="voucher-carousel-container position-relative">
                    <!-- Best Voucher -->
                    <div v-if="activeTab === 'best'"
                      class="best-voucher-card p-4 shadow-sm animate__animated animate__fadeIn" style="
                        border: 2px solid #34d399;
                        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
                        border-radius: 0.5rem;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                      ">
                      <div class="voucher-ribbon position-absolute top-0 end-0 bg-success text-white px-4 py-1" style="
                          font-size: 0.9rem;
                          font-weight: 600;
                          border-bottom-left-radius: 0.5rem;
                          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                        ">
                        Mã Tốt Nhất
                      </div>
                      <div v-if="selectedDiscount" class="d-flex justify-content-between align-items-center">
                        <div class="text-dark">
                          <div class="badge bg-success text-white px-4 py-2">
                            {{ selectedDiscount.code }}
                          </div>
                          <div class="fw-semibold mt-2 d-flex align-items-center gap-2" style="font-size: 1.2rem">
                            <i class="bi bi-tag-fill text-teal"></i>
                            Giảm:
                            <span class="text-danger fw-bold">
                              −{{
                                selectedDiscount.percent
                                  ? `${selectedDiscount.percent
                                  }% (${formatPrice(discount)})`
                                  : formatPrice(discount)
                              }}
                            </span>
                          </div>
                          <div class="text-muted mt-1" style="font-size: 0.85rem">
                            Hết hạn: {{ selectedDiscount.expiry }}
                          </div>
                          <div class="text-muted mt-1" style="font-size: 0.85rem">
                            Đơn tối thiểu:
                            {{ formatPrice(selectedDiscount.minOrder) }}
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center text-muted py-3">
                        <i class="bi bi-ticket-perforated me-2" style="font-size: 1.2rem"></i>
                        Chưa chọn mã giảm giá
                      </div>
                      <div v-else class="text-center text-muted py-3">
                        <i class="bi bi-ticket-perforated me-2" style="font-size: 1.2rem"></i>
                        Chưa chọn mã giảm giá
                      </div>
                    </div>
                    <!-- Alternative Vouchers -->
                    <div v-if="activeTab === 'alternative'" class="voucher-carousel position-relative">
                      <div class="mb-3">
                        <input v-model="alternativeSearchQuery" type="text" class="form-control search-input"
                          placeholder="Tìm kiếm mã giảm giá..." @input="
                            debouncedAlternativeSearch($event.target.value)
                            " />
                      </div>
                      <div class="d-flex gap-3 overflow-x-hidden pb-2" ref="alternativeCarousel">
                        <div v-for="(
discount, index
                          ) in filteredAlternativeDiscountsComputed" :key="discount.id"
                          v-show="index === currentAlternativeIndex" @click="selectDiscount(discount)"
                          class="voucher-card p-3 shadow-sm animate__animated animate__fadeInUp w-100" style="
                            background: #ffffff;
                            border: 1px solid #34d399;
                            border-radius: 0.5rem;
                            transition: all 0.3s ease;
                            cursor: pointer;
                          " :class="{
                            'selected-voucher':
                              selectedDiscount &&
                              selectedDiscount.id === discount.id,
                          }">
                          <div class="d-flex flex-column justify-content-between h-100">
                            <div>
                              <div class="fw-bold d-flex align-items-center gap-2 mb-2" style="font-size: 1rem">
                                <i class="bi bi-ticket-perforated text-teal"></i>
                                {{ discount.code }}
                                <span v-if="
                                  selectedDiscount &&
                                  selectedDiscount.id === discount.id
                                " class="badge bg-success text-white px-2 py-1">Đã chọn</span>
                              </div>
                              <div class="text-secondary mb-1" style="font-size: 0.9rem">
                                Giảm:
                                <strong>{{
                                  discount.percent
                                    ? `${discount.percent
                                    }% (ước tính ${formatPrice(
                                      (discount.percent / 100) * tongTien
                                    )})`
                                    : formatPrice(discount.value)
                                }}</strong>
                              </div>
                              <div class="text-secondary" style="font-size: 0.9rem">
                                Đơn tối thiểu:
                                {{ formatPrice(discount.minOrder) }}
                              </div>
                              <div class="text-secondary" style="font-size: 0.9rem">
                                Hết hạn: {{ discount.expiry }}
                              </div>
                            </div>
                            <button class="btn btn-outline-teal btn-sm px-3 py-1 mt-2"
                              @click.stop="selectDiscount(discount)">
                              Áp dụng
                            </button>
                          </div>
                        </div>
                        <div v-if="
                          filteredAlternativeDiscountsComputed.length === 0
                        " class="text-center text-muted py-4 w-100">
                          <i class="bi bi-ticket-perforated me-2" style="font-size: 1.2rem"></i>
                          Không có mã giảm giá thay thế khả dụng
                        </div>
                      </div>
                      <!-- Updated control section -->
                      <div class="carousel-controls d-flex align-items-center justify-content-center gap-3 mt-3">
                        <button class="carousel-control-prev" type="button" @click="scrollCarousel('left')"
                          :disabled="currentAlternativeIndex === 0">
                          <i class="bi bi-chevron-left text-white"></i>
                        </button>
                        <span class="text-muted fw-medium">{{ currentAlternativeIndex + 1 }} /
                          {{
                            filteredAlternativeDiscountsComputed.length
                          }}</span>
                        <button class="carousel-control-next" type="button" @click="scrollCarousel('right')" :disabled="currentAlternativeIndex ===
                          filteredAlternativeDiscountsComputed.length - 1
                          ">
                          <i class="bi bi-chevron-right text-white"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Suggested Vouchers -->
                  <div class="suggested-voucher-section mt-4">
                    <h6 class="fw-bold text-dark d-flex align-items-center gap-2"
                      style="font-size: 1.2rem; letter-spacing: 0.5px">
                      Gợi Ý Mã Giảm Giá <span class="text-danger">*</span>
                    </h6>
                    <div class="voucher-carousel">
                      <div class="d-flex gap-3 overflow-x-auto pb-2">
                        <div v-for="discount in suggestedDiscounts" :key="discount.id"
                          class="voucher-card p-3 shadow-sm animate__animated animate__fadeInUp w-100" style="
                            background: #ffffff;
                            border: 1px solid #fed7aa;
                            border-radius: 0.5rem;
                            transition: all 0.3s ease;
                          ">
                          <div class="d-flex flex-column justify-content-between h-100">
                            <div>
                              <div class="fw-bold mb-2 d-flex align-items-center gap-2" style="font-size: 1rem">
                                <i class="bi bi-ticket-perforated text-warning"></i>
                                {{ discount.code }}
                              </div>
                              <div class="text-secondary" style="font-size: 0.9rem">
                                Giảm:
                                <strong>{{
                                  discount.percent
                                    ? `${discount.percent
                                    }% (ước tính ${formatPrice(
                                      (discount.percent / 100) * tongTien
                                    )})`
                                    : formatPrice(discount.value)
                                }}</strong>
                              </div>
                              <div class="text-secondary" style="font-size: 0.9rem">
                                Đơn tối thiểu:
                                {{ formatPrice(discount.minOrder) }}
                              </div>
                              <div class="text-secondary" style="font-size: 0.9rem">
                                Hết hạn: {{ discount.expiry }}
                              </div>
                              <div class="text-warning fw-semibold mt-1" style="font-size: 0.9rem">
                                Còn thiếu:
                                {{ formatPrice(discount.missingAmount) }} để áp
                                dụng
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-if="suggestedDiscounts.length === 0" class="text-center text-muted py-4 w-100">
                          <i class="bi bi-ticket-perforated me-2" style="font-size: 1.2rem"></i>
                          Không có mã giảm giá gợi ý khả dụng
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payment Info -->
                <div class="price-info p-4 bg-light shadow-sm animate__animated animate__fadeInUp mt-2 mb-3"
                  style="border-left: 5px solid #34d399; border-radius: 0.5rem">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fw-medium text-dark" style="font-size: 0.95rem">Tổng tiền hàng:</span>
                    <span class="fw-bold text-dark">{{
                      formatPrice(tongTien)
                    }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fw-medium text-dark" style="font-size: 0.95rem">Giảm giá:</span>
                    <span class="fw-bold text-danger">−{{ formatPrice(discount) }}</span>
                  </div>
                  <div v-if="isDelivery" class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fw-medium text-dark" style="font-size: 0.95rem">Phí vận chuyển:</span>
                    <span class="fw-bold text-dark">
                      {{
                        tongTien >= FREE_SHIP_THRESHOLD
                          ? "Miễn phí"
                          : formatPrice(shippingFee)
                      }}
                    </span>
                  </div>
                  <hr class="my-3" style="border-color: rgba(52, 211, 153, 0.2)" />
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-dark" style="font-size: 1rem">Tổng thanh toán:</span>
                    <span class="fw-bold fs-5 text-success">{{
                      formatPrice(totalPayment)
                    }}</span>
                  </div>
                </div>
                <!-- Payment Methods -->
                <div>
                  <h6 class="fw-semibold text-dark">Phương thức thanh toán</h6>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <button class="btn px-4 py-2 select-btn" @click="selectPayment('transfer')" :class="{
                      'teal text-white': paymentMethod === 'transfer',
                      border: paymentMethod !== 'transfer',
                    }" style="border: 1px solid rgba(52, 211, 153, 0.2)">
                      Chuyển khoản
                    </button>
                    <button class="btn px-4 py-2 select-btn" @click="selectPayment('cash')" :class="{
                      'teal text-white': paymentMethod === 'cash',
                      border: paymentMethod !== 'cash',
                    }" style="border: 1px solid rgba(52, 211, 153, 0.2)">
                      Tiền mặt
                    </button>
                    <button class="btn px-4 py-2 select-btn" @click="selectPayment('both')" :class="{
                      'teal text-white': paymentMethod === 'both',
                      border: paymentMethod !== 'both',
                    }" style="border: 1px solid rgba(52, 211, 153, 0.2)">
                      Cả hai
                    </button>
                  </div>
                  <div v-if="paymentMethod === 'both'" class="row g-3 mt-3">
                    <div class="col-md-6">
                      <label class="form-label fw-medium text-dark">Tiền chuyển khoản</label>
                      <input v-model.number="tienChuyenKhoan" type="number" class="form-control search-input"
                        placeholder="Nhập số tiền chuyển khoản" min="0" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium text-dark">Tiền mặt</label>
                      <input v-model.number="tienMat" type="number" class="form-control search-input"
                        placeholder="Nhập số tiền mặt" min="0" />
                    </div>
                  </div>
                  <div v-if="selectedPaymentProvider" class="mt-3">
                    <p class="fw-medium text-dark">
                      Phương thức thanh toán đã chọn:
                      <span class="text-teal">{{
                        selectedPaymentProvider
                      }}</span>
                    </p>
                  </div>
                  <div v-if="showQRCode && selectedPaymentProvider !== 'vnpay'"
                    class="mt-3 text-center qr-code-container">
                    <h6 class="fw-bold text-dark">
                      Quét mã QR để thanh toán ({{ selectedPaymentProvider }})
                    </h6>
                    <qrcode :value="qrCodeValue" :size="200" level="H" />
                    <p class="text-muted mt-2">
                      Số tiền: {{ formatPrice(qrCodeAmount) }}
                    </p>
                    <p class="text-muted">Mô tả: {{ bankInfo.description }}</p>
                  </div>
                </div>

                <!-- Pay Button -->
                <button class="btn w-100 py-3 pay-btn gradient-custom-green text-white mt-3" :disabled="!activeInvoiceId ||
                  !cartItems ||
                  cartItems.length === 0 ||
                  isCreatingOrder
                  " @click="confirmPayment">
                  <span class="fw-semibold">Thanh toán</span>
                </button>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>

      <!-- Product Details Modal -->
      <div v-if="showProductDetails" class="product-details-modal shadow-lg p-3 animate__animated animate__fadeIn"
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }">
        <div class="modal-content bg-white p-4" style="border-radius: 0.5rem">
          <h5 class="fw-bold text-dark mb-3">{{ selectedCartItem?.name }}</h5>
          <div class="row">
            <div class="col-md-6">
              <p>
                <strong>Mã sản phẩm:</strong>
                {{ selectedCartItem?.maSanPham || "N/A" }}
              </p>
              <p><strong>Màu sắc:</strong> {{ selectedCartItem?.color }}</p>
              <p><strong>RAM:</strong> {{ selectedCartItem?.ram }}</p>
              <p><strong>Bộ nhớ:</strong> {{ selectedCartItem?.storage }}</p>
            </div>
            <div class="col-md-6">
              <p>
                <strong>Giá bán:</strong>
                {{ formatPrice(selectedCartItem?.currentPrice) }}
              </p>
              <p><strong>Số lượng:</strong> {{ selectedCartItem?.quantity }}</p>
              <p>
                <strong>IMEI:</strong> {{ selectedCartItem?.imei || "N/A" }}
              </p>
              <p>
                <strong>Thương hiệu:</strong>
                {{ selectedCartItem?.brand || "N/A" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- IMEI Modal for Cart Item -->
      <div v-if="showCartIMEIModal" class="modal fade show d-block" tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 0.5rem;
            ">
            <div class="modal-header border-0 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark">
                IMEI của sản phẩm trong giỏ hàng
              </h5>
              <button class="btn btn-outline-secondary btn-close-custom" @click="closeCartIMEIModal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
                style="background: linear-gradient(135deg, #f8f9fa, #e9ecef)">
                <div class="row align-items-center">
                  <div class="col-md-4 text-center">
                    <img :src="selectedCartItem?.imageUrl ||
                      'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
                      " class="phone-img img-fluid rounded" :alt="selectedCartItem?.name" style="
                        max-height: 150px;
                        object-fit: contain;
                        transition: transform 0.3s ease;
                      " @mouseover="this.style.transform = 'scale(1.05)'"
                      @mouseout="this.style.transform = 'scale(1)'" />
                  </div>
                  <div class="col-md-8">
                    <h4 class="fw-bold text-dark mb-2">
                      {{ selectedCartItem?.name }}
                    </h4>
                    <div class="d-flex flex-wrap gap-3">
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{
                        selectedCartItem?.color }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{
                        selectedCartItem?.ram }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{
                        selectedCartItem?.storage }}</span>
                      <span class="badge teal text-white px-3 py-1">{{
                        formatPrice(selectedCartItem?.currentPrice)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imei-list-container">
                <h6 class="fw-semibold text-dark mb-3">
                  Danh sách IMEI đã chọn
                </h6>
                <div v-if="
                  !selectedCartItem?.imei ||
                  selectedCartItem.imei.split(', ').length === 0
                " class="text-center text-muted py-4 animate__animated animate__fadeIn">
                  <i class="bi bi-info-circle me-2"></i>Không có IMEI nào được
                  chọn.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div v-for="(imei, index) in selectedCartItem.imei.split(', ')" :key="imei"
                    class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp" style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    ">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <span class="fw-bold text-teal me-3" style="min-width: 30px">{{ index + 1 }}.</span>
                        <i class="bi bi-upc-scan me-3 text-teal" style="font-size: 1.2rem"></i>
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
              <button class="btn btn-light px-4 py-2 teal text-white" @click="closeCartIMEIModal">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- IMEI Modal for Product Selection -->
      <div v-if="showIMEIModal" class="modal fade show d-block" tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5); gap: 0">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 0.5rem;
            ">
            <div class="modal-header border-0 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark">
                Chọn IMEI cho sản phẩm
              </h5>
              <button class="btn btn-outline-secondary btn-close-custom" @click="closeIMEIModal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
                style="background: linear-gradient(135deg, #f8f9fa, #e9ecef)">
                <div class="row align-items-center">
                  <div class="col-md-4 text-center">
                    <img :src="selectedProduct?.imageUrl ||
                      'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
                      " class="phone-image img-fluid rounded" :alt="selectedProduct?.tenSanPham" style="
                        max-height: 150px;
                        object-fit: contain;
                        transition: transform 0.3s ease;
                      " @mouseover="this.style.transform = 'scale(1.05)'"
                      @mouseout="this.style.transform = 'scale(1)'" />
                  </div>
                  <div class="col-md-8">
                    <h4 class="fw-bold text-dark mb-2">
                      {{ selectedProduct?.tenSanPham }}
                    </h4>
                    <div class="d-flex flex-wrap gap-3">
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{
                        selectedProduct?.mauSac }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ selectedProduct?.ram
                      }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{
                        selectedProduct?.boNhoTrong }}</span>
                      <span class="badge teal text-white px-3 py-1">{{
                        formatPrice(selectedProduct?.giaBan)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imei-list-container">
                <h6 class="fw-semibold text-dark mb-3">
                  Danh sách IMEI khả dụng
                </h6>
                <div v-if="availableIMEIs.length === 0"
                  class="text-center text-muted py-4 animate__animated animate__fadeIn">
                  <i class="bi bi-info-circle me-2"></i>Không có IMEI nào khả
                  dụng.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div v-for="(imei, index) in availableIMEIs" :key="imei.id"
                    class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp" style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    ">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <input type="checkbox" :value="imei.imei" v-model="selectedIMEIs" class="form-check-input me-3"
                          style="border-color: #34d399" @change="handleIMEISelection" />
                        <span class="fw-bold text-teal me-3" style="min-width: 30px">{{ index + 1 }}.</span>
                        <i class="bi bi-upc-scan me-3 text-teal" style="font-size: 1.2rem"></i>
                        <span class="text-dark fw-medium">{{ imei.imei }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button class="btn btn-light px-4 py-2" @click="closeIMEIModal">
                Hủy
              </button>
              <button class="btn btn-light px-4 py-2 teal text-white" @click="addProductWithIMEIs"
                :disabled="selectedIMEIs.length === 0">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Modal -->
      <!-- Customer Modal -->
      <div v-if="isCustomerModalOpen" class="modal fade show d-block" tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 animate__animated animate__zoomIn"
            style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 0.5rem;">
            <!-- Header -->
            <div class="modal-header border-0 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark">
                Thêm khách hàng mới
              </h5>
              <button class="btn btn-outline-secondary btn-close-custom" @click="isCustomerModalOpen = false">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <div class="customer-form animate__animated animate__fadeIn" style="border-radius: 0.5rem">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label fw-medium text-dark mb-2">
                      Tên khách hàng <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-person text-teal"></i>
                      </span>
                      <input v-model="newCustomer.name" type="text" class="form-control search-input border-start-0"
                        placeholder="Nhập tên khách hàng"
                        style="border-radius: 0 0.5rem 0.5rem 0; transition: all 0.3s ease" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium text-dark mb-2">
                      Số điện thoại <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-telephone text-teal"></i>
                      </span>
                      <input v-model="newCustomer.phone" type="tel" class="form-control search-input border-start-0"
                        placeholder="Nhập số điện thoại"
                        style="border-radius: 0 0.5rem 0.5rem 0; transition: all 0.3s ease" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0">
              <button class="btn teal text-white mt-3 py-2 fw-medium add-customer-btn" @click="addNewCustomer">
                Thêm khách hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Address Selection Modal -->
      <div v-if="showAddressModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
            style="border-radius: 0.75rem">
            <!-- Header -->
            <div class="modal-header border-0 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark">
                <i class="bi bi-geo-alt-fill text-success me-2"></i>
                Chọn địa chỉ khách hàng
              </h5>
              <button class="btn btn-outline-secondary btn-close-custom" @click="closeAddressModal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body p-4 address-scroll">
              <div v-if="customerAddresses.length === 0" class="empty-cart-container py-4 text-muted">
                <div
                  class="empty-icon-container d-flex align-items-center justify-content-center mb-3 rounded-circle p-3"
                  style="width: 60px; height: 60px">
                  <i class="bi bi-info-circle text-white" style="font-size: 1.5rem"></i>
                </div>
                <p class="fw-medium">Không có địa chỉ nào được lưu</p>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(address, index) in customerAddresses" :key="address.id"
                  class="address-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                  :class="{ 'border border-2 border-success bg-light': selectedAddressId === address.id }"
                  style="cursor: pointer; transition: all 0.3s ease" @click="selectAddress(address)">
                  <div class="d-flex align-items-start">
                    <input type="radio" :value="address.id" v-model="selectedAddressId"
                      class="form-check-input me-3 mt-1" style="border-color: #34d399" />
                    <div>
                      <div class="fw-bold text-dark">
                        <i class="bi bi-house-door-fill text-success me-2"></i>
                        Địa chỉ {{ index + 1 }}
                      </div>
                      <div class="text-muted small">
                        {{ address.address }}, {{ address.ward }}, {{ address.district }}, {{ address.city }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0">
              <button class="btn btn-outline-teal px-4 py-2" @click="closeAddressModal">
                <i class="bi bi-x-circle me-2"></i> Hủy
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Modal -->
      <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
        :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel" />

      <!-- Toast Notification -->
      <ToastNotification ref="toastNotification" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import banHang from "../../store/modules/sales/banHang";
import { debounce } from "lodash";

export default defineComponent({
  name: "BanHang",
  ...banHang,
  data() {
    return {
      activeTab: "best",
      currentAlternativeIndex: 0,
      alternativeSearchQuery: "",
      products: [], // Danh sách sản phẩm từ API
      selectedProduct: null,
      selectedIMEIs: [],
      selectedDiscount: null,
      customer: {
        id: null,
        name: "",
        phone: "",
      },
    };
  },
  computed: {
    filteredAlternativeDiscountsComputed() {
      if (!this.alternativeSearchQuery) {
        return this.alternativeDiscounts || [];
      }
      const query = this.alternativeSearchQuery.toLowerCase();
      return (this.alternativeDiscounts || []).filter(
        (discount) =>
          discount.code.toLowerCase().includes(query) ||
          (discount.value && String(discount.value).includes(query)) ||
          (discount.percent && String(discount.percent).includes(query)) ||
          String(discount.minOrder).includes(query) ||
          discount.expiry.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    // Add this method to handle tab switching
    setActiveTab(tab) {
      this.activeTab = tab;
      this.currentAlternativeIndex = 0; // Reset carousel index when switching tabs
      console.log("Switched to tab:", tab);
    },

    // Existing methods
    async fetchProducts() {
      try {
        console.log("Dữ liệu sản phẩm từ API:", this.products);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    },

    debouncedAlternativeSearch: debounce(function (value) {
      this.alternativeSearchQuery = value;
      this.currentAlternativeIndex = 0;
    }, 300),

    selectDiscount(discount) {
      this.selectedDiscount = discount;
      this.activeTab = "best";
      this.currentAlternativeIndex = 0;

      const discountAmount = discount.percent
        ? (discount.percent / 100) * this.tongTien
        : discount.value;

      console.log("Áp dụng mã giảm giá:", { discount, discountAmount });
      this.$refs.toastNotification.showToast({
        message: `Đã áp dụng mã giảm giá ${discount.code}`,
        type: "success",
        duration: 3000,
      });
    },

    confirmPayment() {
      this.notificationType = "confirm";
      this.notificationMessage = `Bạn có chắc chắn muốn thanh toán ${this.formatPrice(
        this.totalPayment
      )} cho hóa đơn này không?`;
      this.notificationOnConfirm = () => {
        this.ThanhToan();
      };
      this.notificationOnCancel = () => { };
      this.$refs.notificationModal.openModal();
    },

    selectPayment(method) {
      const oldMethod = this.paymentMethod;
      this.paymentMethod = method;

      console.log("[banHang] selectPayment called:", {
        oldMethod,
        newMethod: method,
        activeInvoiceId: this.activeInvoiceId,
        hasCartItems: this.cartItems && this.cartItems.length > 0,
      });
    },

    updateShippingFee() {
      const finalShippingFee =
        this.isDelivery && this.tongTien < this.FREE_SHIP_THRESHOLD
          ? this.shippingFee
          : 0;

      console.log("Cập nhật phí vận chuyển:", finalShippingFee);
    },

    removeItem(item) {
      this.cartItems = this.cartItems.filter((i) => i.id !== item.id);

      console.log("Xóa sản phẩm khỏi giỏ:", item);
      this.$refs.toastNotification.showToast({
        message: `Đã xóa ${item.name} khỏi giỏ hàng`,
        type: "info",
        duration: 3000,
      });
    },
    totalQuantity(items) {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },
  },
  watch: {
    alternativeDiscounts: {
      handler() {
        this.currentAlternativeIndex = 0;
      },
      deep: true,
    },
    cartItems: {
      handler(newItems) {
        console.log("Cập nhật giỏ hàng:", newItems);
      },
      deep: true,
    },
    selectedDiscount: {
      handler(newDiscount) {
        if (newDiscount) {
          const discountAmount = newDiscount.percent
            ? (newDiscount.percent / 100) * this.tongTien
            : newDiscount.value;
          this.discount = discountAmount;
          console.log("Phiếu giảm giá thay đổi:", {
            newDiscount,
            discountAmount,
          });
        } else {
          this.discount = 0;
          console.log("Phiếu giảm giá bị hủy");
        }
      },
      deep: true,
    },
    paymentMethod: {
      handler(newMethod) {
        console.log("Phương thức thanh toán thay đổi:", newMethod);
      },
    },
    tongTien: {
      handler(newTotal) {
        if (this.selectedDiscount && this.selectedDiscount.percent) {
          const discountAmount =
            (this.selectedDiscount.percent / 100) * newTotal;
          this.discount = discountAmount;
        }
      },
    },
    customer: {
      handler(newCustomer) {
        console.log("Thông tin khách hàng thay đổi:", newCustomer);
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchProducts();
    this.currentAlternativeIndex = 0;
    console.log("Mounted banHang.vue, dữ liệu ban đầu:", {
      products: this.products,
      selectedProduct: this.selectedProduct,
      selectedIMEIs: this.selectedIMEIs,
      selectedDiscount: this.selectedDiscount,
    });
  },
});
</script>

<style scoped>
.teal {
  background: #34d399;
}

.gradient-custom-yellow {
  background: linear-gradient(135deg, #facc15, #f97316);
}

.gradient-custom-green {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.cursor-pointer {
  cursor: pointer;
}

.add-to-cart-btn:hover,
.add-customer-btn:hover {
  background-color: #16a34a;
  transition: all 0.3s ease;
}

.delete-invoice-btn:hover,
.btn-close-custom:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
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
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.btn-close-custom {
  border-radius: 0.5rem;
}

.imei-card:hover {
  background: rgba(52, 211, 153, 0.05);
}

.voucher-card:hover {
  background: rgba(52, 211, 153, 0.1);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.voucher-card.selected-voucher {
  background: rgba(52, 211, 153, 0.15);
  border: 2px solid #34d399;
}

.cart-items-container,
.voucher-carousel {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #34d399 #f1f1f1;
}

.cart-items-container::-webkit-scrollbar,
.voucher-carousel::-webkit-scrollbar {
  height: 8px;
}

.cart-items-container::-webkit-scrollbar-track,
.voucher-carousel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0.5rem;
}

.cart-items-container::-webkit-scrollbar-thumb,
.voucher-carousel::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 0.5rem;
  transition: 0.3s ease;
}

.cart-items-container::-webkit-scrollbar-thumb:hover,
.voucher-carousel::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

.cart-item-card {
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.cart-item-card:hover {
  box-shadow: 0 8px 20px rgba(52, 211, 153, 0.15) !important;
}

.cart-item-card img {
  transition: transform 0.3s ease;
}

.cart-item-card img:hover {
  transform: scale(1.05);
}

.btn-outline-teal {
  border-color: #34d399;
  color: #34d399;
  transition: all 0.3s ease;
}

.btn-outline-teal:hover {
  background-color: #34d399;
  color: white;
}

.badge {
  transition: all 0.3s ease;
}

.text-success {
  color: #16a34a !important;
  white-space: normal;
  word-break: break-word;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.carousel-control-prev,
.carousel-control-next {
  position: static;
  background: #34d399;
  border-radius: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  background: #16a34a;
}

.carousel-control-prev:disabled,
.carousel-control-next:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.carousel-control-prev i,
.carousel-control-next i {
  font-size: 1.2rem;
}

.text-muted {
  font-size: 0.9rem;
  font-weight: 500;
}

.pay-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(1.01);
  transition: all 0.3s ease;
}

.product-details-modal {
  position: fixed;
  z-index: 1050;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  min-width: 300px;
  padding: 1rem;
}

.scan-region {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px dashed #34d399;
  border-radius: 10px;
  background: rgba(52, 211, 153, 0.1);
  pointer-events: none;
}

.scan-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid #34d399;
  border-radius: 10px;
  animation: scanAnimation 2s infinite;
}

@keyframes scanAnimation {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }

  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.gradient-modal {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95),
      rgba(240, 253, 244, 0.95));
}

.select-btn {
  transition: all 0.3s ease;
}

.select-btn:hover {
  background-color: #34d399;
  color: white;
}

.empty-cart-container,
.empty-cart-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-container {
  background: #34d399;
}

.nav-tabs .nav-link.active {
  background-color: #34d399;
  color: white;
  border-color: #34d399;
}

.nav-tabs .nav-link {
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(52, 211, 153, 0.1);
}

.address-scroll {
  max-height: 400px;
  /* giới hạn chiều cao body */
  overflow-y: auto;
  /* bật cuộn dọc khi nội dung dài */
}

/* Custom scrollbar (chỉ hiệu lực trên Chrome, Edge, Safari) */
.address-scroll::-webkit-scrollbar {
  width: 6px;
}

.address-scroll::-webkit-scrollbar-thumb {
  background-color: #34d399;
  /* xanh lá */
  border-radius: 10px;
}

.address-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #2ca37c;
}

.address-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.qr-code-container {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .cart-item-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-item-card img {
    max-height: 100px;
  }

  .modal-dialog {
    max-width: 90%;
  }

  .voucher-card {
    min-width: 100%;
  }

  .carousel-controls {
    flex-direction: column;
  }
}
</style>