<template>
  <div class="py-4">
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
                border-radius: 10px;
              ">
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
              <div class="bill-card" style="
                  border-bottom-right-radius: 12px;
                  border-bottom-left-radius: 12px;
                ">
                <div class="card-body p-4">
                  <div class="d-flex gap-3 overflow-x-auto pb-2">
                    <!-- Trong chỉnh sửa hiển thị hóa đơn chờ -->
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
                         placeholder="Tìm kiếm khách hàng, sdt..." v-model="searchCustomer"
                         @input="debouncedCustomerSearch($event.target.value)" style="
                      border-radius: 0 10px 10px 0;
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
                    <input v-model="customer.name" type="text" class="form-control shadow-none border-start-0"
                           placeholder="Tên khách hàng" disabled style="
                        border-radius: 0 8px 8px 0;
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
                    <input v-model="customer.phone" type="tel" class="form-control shadow-none border-start-0"
                           placeholder="Số điện thoại" disabled style="
                        border-radius: 0 8px 8px 0;
                        transition: all 0.3s ease;
                      " />
                  </div>
                </div>
              </div>
              <button class="btn teal text-white w-100 mt-3 py-2 fw-medium add-customer-btn" @click="openCustomerModal"
                      style="
                  border-radius: 10px;
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

    <!-- Scan QR Modal -->
    <div v-if="showScanModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 16px;
          ">
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">Quét Barcode/QR</h5>
            <button class="btn btn-outline-secondary btn-close-custom" @click="closeScanModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div id="barcode-scanner" style="position: relative;">
              <video id="barcode-scanner-video" style="width: 100%; height: auto;"></video>
              <div v-if="isScanning" class="text-center mt-2">
                <span class="spinner-border spinner-border-sm text-teal" role="status"></span>
                <span class="text-muted ms-2">Đang quét...</span>
              </div>
              <div v-if="scanError" class="text-danger text-center mt-2">{{ scanError }}</div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button @click="closeScanModal" class="btn btn-secondary me-2">Đóng</button>
            <button @click="startQuagga" class="btn btn-success" :disabled="isCameraActive">Bắt đầu quét</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart and Product List Cluster -->
    <div class="row">
      <div class="col-lg-8">
        <!-- Cart Section -->
        <FilterTableSection title="Sản Phẩm Trong Giỏ hàng" icon="bi bi-basket">
          <div class="shadow-sm product-card" style="
              border-bottom-right-radius: 12px;
              border-bottom-left-radius: 8px;
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
                <div class="col-md-3">
                  <input v-model="cartSearchQuery" type="text" class="form-control shadow-none"
                         placeholder="Tìm sản phẩm, IMEI..." @input="debouncedCartSearch($event.target.value)"
                         style="background: rgba(255, 255, 255, 0.95)" />
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterColor" class="form-select shadow-none">
                    <option value="">Tất cả màu</option>
                    <option v-for="color in uniqueCartColors" :key="color" :value="color">
                      {{ color }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterRam" class="form-select shadow-none">
                    <option value="">Tất cả RAM</option>
                    <option v-for="ram in uniqueCartRams" :key="ram" :value="ram">
                      {{ ram }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="cartFilterStorage" class="form-select shadow-none">
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
                  max-height: 400px;
                  overflow-y: auto;
                  overflow-x: hidden;
                  padding-right: 10px;
                ">
                <div v-for="(item, index) in filteredCartItems" :key="item.id" class="mb-4">
                  <div class="cart-item-card shadow-sm p-4 rounded-3 animate__animated animate__fadeInUp" style="
                      background: rgba(255, 255, 255, 0.95);
                      border: 1px solid rgba(52, 211, 153, 0.1);
                      transition: all 0.3s ease;
                    ">
                    <div class="row align-items-center">
                      <!-- Số thứ tự -->
                      <div class="col-md-1 text-center">
                        <span class="fw-bold text-dark">{{ index + 1 }}</span>
                      </div>
                      <!-- Hình ảnh sản phẩm -->
                      <div class="col-md-3 text-center">
                        <img :src="item.image ||
                          'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
                          " class="img-fluid rounded" :alt="item.name" style="
                            max-height: 120px;
                            object-fit: contain;
                            transition: transform 0.3s ease;
                          " />
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
                            <i class="bi bi-eye"></i> Xem IMEI
                          </button>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <span class="text-muted">Số lượng:</span>
                          <span class="fw-semibold">{{ item.quantity }}</span>
                        </div>
                        <div v-if="item.ghiChuGia" class="text-warning small mb-2">
                          {{ item.ghiChuGia }}
                        </div>
                        <div v-if="selectedDiscount" class="d-flex align-items-center gap-2">
                          <span class="text-muted">Mã giảm giá:</span>
                          <span class="badge bg-success text-white px-3 py-1">
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
                          <i class="bi bi-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Product Details Modal -->
        <div v-if="showProductDetails" class="product-details-modal shadow-lg p-3 animate__animated animate__fadeIn"
             :style="{
            top: modalPosition.top + 'px',
            left: modalPosition.left + 'px',
          }">
          <div class="modal-content bg-white rounded-3 p-4">
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
                <p>
                  <strong>Số lượng:</strong> {{ selectedCartItem?.quantity }}
                </p>
                <p>
                  <strong>IMEI:</strong> {{ selectedCartItem?.imei || "N/A" }}
                </p>
                <p>
                  <strong>Thương hiệu:</strong>
                  {{ selectedCartItem?.brand || "N/A" }}
                </p>
                <!-- Thêm hiển thị ghiChuGia -->
                <p v-if="selectedCartItem?.ghiChuGia" class="text-warning">
                  <strong>Thông báo giá:</strong> {{ selectedCartItem?.ghiChuGia }}
                </p>
              </div>
            </div>
          </div>
        </div>

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
              <template #stt="{ index }">
                {{ index + 1 }}
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
          <div class="order-card h-100">
            <div
                class="card-header p-3 d-flex justify-content-end align-items-center border-bottom bg-white rounded-top">
              <div class="form-check form-switch d-flex align-items-center gap-2">
                <input class="form-check-input" type="checkbox" v-model="isDelivery" @change="toggleDelivery"
                       style="border-color: #34d399" />
                <label class="form-check-label text-muted mb-0">Bán giao hàng</label>
              </div>
            </div>

            <div class="card-body p-3 pt-0 d-flex flex-column">
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
                  <h6 class="fw-bold text-dark mb-3 mt-3" style="font-size: 1.3rem; letter-spacing: 0.5px">
                    Thông tin người nhận
                  </h6>
                  <div class="receiver-form bg-white p-3 rounded-3 shadow-sm animate__animated animate__fadeIn" style="
                      border: 1px solid rgba(52, 211, 153, 0.1);
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
                          <input v-model="customer.name" type="text" class="form-control shadow-none border-start-0"
                                 placeholder="Nhập tên người nhận" :disabled="!isReceiverEditable" style="
                              border-radius: 0 8px 8px 0;
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
                          <input v-model="customer.phone" type="tel" class="form-control shadow-none border-start-0"
                                 placeholder="Nhập số điện thoại" :disabled="!isReceiverEditable" style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            " />
                        </div>
                      </div>
                      <!-- Trong phần thông tin khách hàng -->
                      <div class="col-md-6">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem">
                          Tỉnh/Thành phố <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-alt text-teal"></i>
                          </span>
                          <select v-model="customer.city" class="form-select shadow-none border-start-0"
                                  @change="handleCustomerProvinceChange" style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            ">
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
                          <select v-model="customer.district" class="form-select shadow-none border-start-0"
                                  @change="handleCustomerDistrictChange" style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            ">
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
                          <select v-model="customer.ward" class="form-select shadow-none border-start-0" style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            ">
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
                          <input v-model="customer.address" type="text" class="form-control shadow-none border-start-0"
                                 placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường,...)" :disabled="!isReceiverEditable"
                                 style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            " />
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2 mt-2">
                        <label class="form-label fw-medium text-dark mb-2" style="font-size: 0.95rem; margin-top: 10px">
                          Giao hàng tận nhà <span class="text-danger"></span>
                        </label>
                        <input type="checkbox" class="form-check-input" v-model="isHomeDelivery"
                               :disabled="!isReceiverEditable" style="
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
                                 class="form-control shadow-none border-start-0" placeholder="Nhập phí vận chuyển (VND)"
                                 min="0" :disabled="!isReceiverEditable" style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            " />
                        </div>
                      </div>

                      <div class="mt-4 text-end" v-if="!isReceiverEditable">
                        <button class="btn btn-outline-teal btn-sm px-4 py-2" @click="isReceiverEditable = true"
                                style="border-radius: 8px; transition: all 0.3s ease">
                          <i class="bi bi-pencil-square me-2"></i>Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voucher Section -->
                <div style="margin-top: 20px" class="voucher-section mb-5">
                  <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2"
                      style="font-size: 1.3rem; letter-spacing: 0.5px">
                    Mã Giảm Giá
                  </h6>
                  <!-- PGG tốt nhất -->
                  <div class="position-relative p-4 rounded-4 shadow-sm animate__animated animate__fadeIn mb-4"
                       style="border: 2px solid #34d399; background-color: #ecfdf5">
                    <!-- Ribbon -->
                    <div class="position-absolute top-0 end-0 bg-success text-white px-3 py-1" style="
                        font-size: 0.8rem;
                        font-weight: bold;
                        border-bottom-left-radius: 1rem 0.5rem;
                        transform: translate(10%, -10%);
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                      ">
                      PGG tốt nhất
                    </div>

                    <div v-if="selectedDiscount" class="d-flex justify-content-between align-items-center">
                      <div class="text-dark">
                        <div class="fw-semibold mb-2 d-flex align-items-center gap-2" style="font-size: 1rem">
                          Mã giảm giá tự động:
                        </div>
                        <div class="badge bg-success text-white px-3 py-2 fs-5" style="letter-spacing: 0.5px">
                          {{ selectedDiscount.code }}
                        </div>
                      </div>
                      <div class="text-danger fw-bold fs-4">
                        −{{
                          selectedDiscount.percent
                              ? `${selectedDiscount.percent}% (${formatPrice(
                                  discount
                              )})`
                              : formatPrice(discount)
                        }}
                      </div>
                    </div>

                    <div v-else
                         class="text-secondary text-center d-flex align-items-center justify-content-center gap-2 py-2 fs-5">
                      Không có mã giảm giá khả dụng
                    </div>
                  </div>

                  <!-- Tiêu đề -->
                  <h6 class="fw-semibold text-dark mb-2 d-flex align-items-center gap-2 fs-5">
                    Mã giảm giá thay thế
                  </h6>

                  <!-- Mã giảm giá thay thế -->
                  <div class="position-relative p-4 rounded-3 shadow-sm animate__animated animate__fadeIn"
                       style="border: 2px solid #a7f3d0; background-color: #ecfdf5">
                    <div v-if="alternativeDiscounts.length > 0" class="d-flex flex-column gap-3"
                         style="max-height: 220px; overflow-y: auto">
                      <div v-for="discount in alternativeDiscounts" :key="discount.id" @click="selectDiscount(discount)"
                           class="p-3 rounded-3 shadow-sm" :style="{
                          backgroundColor: 'transparent',
                          border:
                            selectedDiscount &&
                              selectedDiscount.id === discount.id
                              ? '2px solid #34d399'
                              : '1px solid #a7f3d0',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }">
                        <div class="fw-bold d-flex align-items-center gap-1 mb-2" style="font-size: 1rem">
                          {{ discount.code }}
                          <span v-if="
                            selectedDiscount &&
                            selectedDiscount.id === discount.id
                          " class="badge bg-success ms-2">Đã chọn</span>
                        </div>
                        <div class="text-secondary mb-1" style="font-size: 0.95rem">
                          Giảm:
                          <strong>{{
                              discount.percent
                                  ? `${discount.percent}% (ước tính ${formatPrice(
                                      (discount.percent / 100) * tongTien
                                  )})`
                                  : formatPrice(discount.value)
                            }}</strong>
                          || Đơn tối thiểu: {{ formatPrice(discount.minOrder) }}
                        </div>
                        <div class="text-secondary" style="font-size: 0.95rem">
                          Hết hạn: {{ discount.expiry }}
                        </div>
                      </div>
                    </div>

                    <div v-else
                         class="text-secondary text-center d-flex align-items-center justify-content-center gap-2 mt-3 fs-5">
                      Không có mã giảm giá thay thế khả dụng
                    </div>
                  </div>

                  <!-- Tiêu đề -->
                  <h6 style="margin-top: 20px" class="fw-semibold text-dark mb-2 d-flex align-items-center gap-2 fs-5">
                    Gợi ý
                  </h6>

                  <!-- Mã giảm giá gợi ý -->
                  <div class="position-relative p-4 rounded-3 shadow-sm animate__animated animate__fadeIn"
                       style="border: 2px solid #ffe58f; background-color: #fffbe6">
                    <div v-if="suggestedDiscounts.length > 0" class="d-flex flex-column gap-3"
                         style="max-height: 200px; overflow-y: auto">
                      <div v-for="discount in suggestedDiscounts" :key="discount.id" class="p-3 rounded-3 shadow-sm"
                           style="
                          background-color: transparent;
                          border: 1px solid #ffe58f;
                        ">
                        <div class="fw-bold mb-1 d-flex align-items-center gap-1" style="font-size: 1rem">
                          {{ discount.code }}
                        </div>
                        <div class="text-secondary" style="font-size: 0.95rem">
                          Giảm:
                          <strong>{{
                              discount.percent
                                  ? `${discount.percent}% (ước tính ${formatPrice(
                                      (discount.percent / 100) * tongTien
                                  )})`
                                  : formatPrice(discount.value)
                            }}</strong>
                          | Đơn tối thiểu:
                          {{ formatPrice(discount.minOrder) }} | Hết hạn:
                          {{ discount.expiry }}
                        </div>
                        <div class="text-warning fw-semibold mt-1" style="font-size: 0.95rem">
                          Còn thiếu:
                          {{ formatPrice(discount.missingAmount) }} để áp dụng
                        </div>
                      </div>
                    </div>

                    <div v-else
                         class="text-secondary text-center d-flex align-items-center justify-content-center gap-2 mt-3 fs-5">
                      Không có mã giảm giá gợi ý khả dụng
                    </div>
                  </div>

                  <!-- Thông tin thanh toán -->
                  <div class="price-info p-4 rounded-3 bg-light shadow-sm animate__animated animate__fadeInUp"
                       style="border-left: 5px solid #34d399; margin-top: 20px">
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
                      <span class="fw-bold text-dark" style="font-size: 1.1rem">Tổng thanh toán:</span>
                      <span class="fw-bold fs-4 text-success">{{
                          formatPrice(totalPayment)
                        }}</span>
                    </div>
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
                    <h6 class="fw-bold text-dark">Quét mã QR để thanh toán</h6>
                    <qrcode :value="qrCodeValue" :size="200" level="H" />
                    <p class="text-muted mt-2">
                      Số tiền: {{ formatPrice(qrCodeAmount) }}
                    </p>
                  </div>
                </div>

                <!-- Pay Button -->
                <button class="btn w-100 py-3 pay-btn gradient-custom-green text-white mt-3" :disabled="!activeInvoiceId ||
                  !cartItems ||
                  cartItems.length === 0 ||
                  isCreatingOrder
                  " @click="ThanhToan">
                  <span class="fw-semibold">Thanh toán</span>
                </button>
                <!-- Customer Payment Button -->
                <button class="btn w-100 py-3 mt-2" style="background: linear-gradient(135deg, #facc15, #f97316); color: white;" :disabled="!activeInvoiceId ||
                  !cartItems ||
                  cartItems.length === 0 ||
                  isCreatingOrder
                  " @click="goToCustomerPayment">
                  <span class="fw-semibold">Thanh toán tại quầy (Khách hàng)</span>
                </button>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>

      <!-- IMEI Modal for Cart Item -->
      <div v-if="showCartIMEIModal" class="modal fade show d-block" tabindex="-1"
           style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
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
                    <img :src="selectedCartItem?.image ||
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
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ selectedCartItem?.color }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ selectedCartItem?.ram }}</span>
                      <span class="badge text-white px-3 py-1" style="background-color: #1f3a44">{{ selectedCartItem?.storage }}</span>
                      <span class="badge teal text-white px-3 py-1">{{ formatPrice(selectedCartItem?.currentPrice) }}</span>
                    </div>
                    <!-- Thêm hiển thị ghiChuGia -->
                    <p v-if="selectedCartItem?.ghiChuGia" class="text-warning mt-2">
                      <strong>Thông báo giá:</strong> {{ selectedCartItem?.ghiChuGia }}
                    </p>
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
              border-radius: 16px;
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
                    <img :src="selectedProduct?.image ||
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
      <div v-if="isCustomerModalOpen" class="modal fade show d-block" tabindex="-1"
           style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn" style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
            ">
            <div class="modal-header border-0 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark">Thêm khách hàng mới</h5>
              <button class="btn btn-outline-secondary btn-close-custom" @click="isCustomerModalOpen = false">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-auto">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2">
                    Tên khách hàng <span class="text-danger">*</span>
                  </label>
                  <input v-model="newCustomer.name" type="text" class="form-control shadow-none"
                         placeholder="Nhập tên khách hàng" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2">
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <input v-model="newCustomer.phone" type="tel" class="form-control shadow-none"
                         placeholder="Nhập số điện thoại" />
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button class="btn btn-light px-4 py-2" @click="isCustomerModalOpen = false">
                Hủy
              </button>
              <button class="btn btn-light px-4 py-2 teal text-white" @click="addNewCustomer">
                Thêm khách hàng
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

export default defineComponent({
  name: "BanHang",
  ...banHang,
  methods: {
    goToCustomerPayment() {
      this.router.push({
        name: 'ThanhToanQuay',
        params: {
          invoiceId: this.activeInvoiceId,
        },
        query: {
          totalAmount: this.tongTien,
          discount: this.discount,
          shippingFee: this.shippingFee,
        }
      });
    }
  }
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

.add-to-cart-btn:hover {
  transform: scale(1.05);
}

.delete-invoice-btn:hover,
.btn-close-custom:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-close-custom {
  border-radius: 10%;
}

.imei-card:hover {
  background: rgba(52, 211, 153, 0.05);
}

.discount-card:hover {
  background: rgba(52, 211, 153, 0.05);
}

.cart-items-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
  width: 100%;
}

.cart-items-container::-webkit-scrollbar {
  width: 8px;
}

.cart-items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cart-items-container::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 10px;
}

.cart-items-container::-webkit-scrollbar-thumb:hover {
  background: #34d399;
}

/* Đảm bảo card không tràn ra ngoài */
.cart-item-card {
  width: 100%;
  box-sizing: border-box;
  /* Bao gồm padding và border trong chiều rộng */
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
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.text-success {
  color: #16a34a !important;
}

.text-muted {
  font-size: 0.9rem;
}

.pay-btn:hover {
  box-shadow: 0 4px 10px rgba(52, 211, 153, 0.3);
}

/* Modal thông số sản phẩm */
.product-details-modal {
  position: fixed;
  z-index: 1000;
  width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-details-modal .modal-content {
  font-size: 0.9rem;
}

.product-details-modal p {
  margin-bottom: 8px;
}

.product-details-modal strong {
  color: #1f3a44;
}

/* Icon thông tin */
.info-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-icon:hover {
  transform: scale(1.2);
  color: #34d399 !important;
}
</style>