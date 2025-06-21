<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard
      title="Quản Lý Bán Hàng"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Invoice and Customer Cluster -->
    <div class="row g-4 d-flex align-items-stretch">
      <div class="col-lg-8 d-flex flex-column">
        <!-- Invoice Search and Pending Invoices -->
        <div
          class="card shadow-sm mb-4 flex-fill"
          style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: none;
          "
        >
          <div class="card-body p-3">
            <!-- Invoice Search -->
            <div
              class="search-card mb-4"
              style="
                background: linear-gradient(135deg, #60a5fa, #34d399);
                border-radius: 10px;
              "
            >
              <div class="card-body p-3">
                <div class="d-flex gap-3 align-items-center flex-wrap">
                  <div class="flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text bg-white">
                        <i class="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control shadow-none"
                        placeholder="Tìm kiếm hóa đơn..."
                        :value="invoiceSearchQuery"
                        @input="debouncedInvoiceSearch($event.target.value)"
                        style="background: rgba(255, 255, 255, 0.95)"
                      />
                    </div>
                  </div>
                  <button
                    class="btn btn-light px-4 py-2 fw-semibold add-bill-btn text-dark"
                    @click="createNewPendingInvoice"
                    :disabled="isCreatingInvoice || pendingInvoices.length >= 5"
                  >
                    Tạo hóa đơn
                  </button>
                </div>
              </div>
            </div>

            <!-- Pending Invoices -->
            <FilterTableSection title="Hóa đơn chờ" icon="bi bi-receipt-cutoff">
              <div
                class="bill-card"
                style="
                  border-bottom-right-radius: 12px;
                  border-bottom-left-radius: 12px;
                "
              >
                <div class="card-body p-4">
                  <div class="d-flex gap-3 overflow-x-auto pb-2">
                    <!-- Trong thẻ bill-card, thay đổi phần hiển thị -->
                    <div
                      v-for="invoice in filteredPendingInvoices"
                      :key="invoice.id"
                      @click="loadPendingInvoice(invoice)"
                      class="card shadow-sm bill-card p-2 cursor-pointer min-w-[160px] flex-shrink-0"
                      :style="{
                        background:
                          activeInvoiceId === invoice.id
                            ? 'rgba(52, 211, 153, 0.05)'
                            : 'rgba(255, 255, 255, 0.9)',
                        border:
                          activeInvoiceId === invoice.id
                            ? '2px solid #34d399'
                            : 'none',
                      }"
                    >
                      <div
                        class="card-body p-2"
                        style="
                          border-bottom-right-radius: 12px;
                          border-bottom-left-radius: 12px;
                        "
                      >
                        <div
                          class="d-flex gap-3 justify-content-between align-items-center mb-2"
                        >
                          <span class="fw-bold text-dark">{{
                            invoice.ma
                          }}</span>
                          <span
                            class="badge gradient-custom-yellow text-white px-3 py-1"
                            >{{ invoice.status }}</span
                          >
                        </div>
                        <div
                          class="d-flex align-items-center justify-content-between mt-2"
                        >
                          <small class="text-muted"
                            >{{ invoice.items.length }} sản phẩm</small
                          >
                          <button
                            class="btn btn-sm btn-outline-danger delete-invoice-btn"
                            @click.stop="confirmCancelInvoice(invoice)"
                          >
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
        <FilterTableSection
          title="Khách Hàng"
          icon="bi bi-people"
          class="flex-fill"
        >
          <div
            class="customer-card bg-white rounded-3 shadow-sm animate__animated animate__fadeIn flex-fill"
          >
            <div class="card-body p-4 d-flex flex-column h-100">
              <div class="mb-4">
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-search text-teal"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control shadow-none border-start-0"
                    placeholder="Tìm kiếm khách hàng,sdt..."
                    v-model="searchCustomer"
                    @input="debouncedCustomerSearch($event.target.value)"
                    style="
                      border-radius: 0 10px 10px 0;
                      transition: all 0.3s ease;
                    "
                    @focus="this.classList.add('border-teal')"
                    @blur="this.classList.remove('border-teal')"
                  />
                </div>
              </div>
              <div class="row g-4 flex-grow-1">
                <div class="col-md-6">
                  <label
                    class="form-label fw-medium text-dark mb-2"
                    style="font-size: 0.95rem"
                  >
                    Tên khách hàng <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-person text-teal"></i>
                    </span>
                    <input
                      v-model="customer.name"
                      type="text"
                      class="form-control shadow-none border-start-0"
                      placeholder="Tên khách hàng"
                      disabled
                      style="
                        border-radius: 0 8px 8px 0;
                        transition: all 0.3s ease;
                      "
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <label
                    class="form-label fw-medium text-dark mb-2"
                    style="font-size: 0.95rem"
                  >
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-telephone text-teal"></i>
                    </span>
                    <input
                      v-model="customer.phone"
                      type="tel"
                      class="form-control shadow-none border-start-0"
                      placeholder="Số điện thoại"
                      disabled
                      style="
                        border-radius: 0 8px 8px 0;
                        transition: all 0.3s ease;
                      "
                    />
                  </div>
                </div>
              </div>
              <button
                class="btn gradient-custom-teal text-white w-100 mt-3 py-2 fw-medium add-customer-btn"
                @click="openCustomerModal"
                style="
                  border-radius: 10px;
                  transition: all 0.3s ease;
                  font-size: 1rem;
                "
                @mouseover="this.style.transform = 'scale(1.02)'"
                @mouseout="this.style.transform = 'scale(1)'"
              >
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
          <div
            class="shadow-sm product-card"
            style="
              border-bottom-right-radius: 12px;
              border-bottom-left-radius: 12px;
            "
          >
            <div class="d-flex justify-content-end">
              <button
                class="btn add-to-cart-btn gradient-custom-teal text-white"
                style="width: 120px; margin-top: 1rem; margin-right: 1rem"
                @click="scanQR"
                :disabled="!activeInvoiceId"
              >
                Quét QR
              </button>
            </div>
            <div class="card-body p-2">
              <DataTable
                title=""
                :headers="cartHeaders"
                :data="cartItems"
                :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
              >
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
                  <button
                    class="btn btn-sm btn-view"
                    @click="showIMEIModalForItem(item)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </template>
                <template #price="{ item }">
                  <span>{{ formatPrice(item.currentPrice) }}</span>
                  <small v-if="item.priceChangeText" class="text-muted d-block">
                    {{ item.priceChangeText }}
                  </small>
                </template>
                <template #quantity="{ item }">
                  <span>{{ item.quantity }}</span>
                </template>
                <template #total="{ item }">
                  <span>{{
                    formatPrice(item.currentPrice * item.quantity)
                  }}</span>
                </template>
                <template #actions="{ item }">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeItem(item)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </template>
              </DataTable>
              <div
                v-if="cartItems.length === 0"
                class="empty-cart-container text-center py-5"
              >
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-teal"
                  style="width: 80px; height: 80px"
                >
                  <i
                    class="bi bi-cart-x text-white"
                    style="font-size: 2.5rem"
                  ></i>
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
                <input
                  :value="productSearchQuery"
                  type="text"
                  class="form-control shadow-none"
                  placeholder="Tìm kiếm sản phẩm..."
                  @input="debouncedProductSearch($event.target.value)"
                  style="background: rgba(255, 255, 255, 0.95)"
                />
              </div>
              <div class="col-md-3">
                <select v-model="filterColor" class="form-select shadow-none">
                  <option value="">Tất cả màu</option>
                  <option
                    v-for="color in uniqueColors"
                    :key="color"
                    :value="color"
                  >
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
                  <option
                    v-for="storage in uniqueStorages"
                    :key="storage"
                    :value="storage"
                  >
                    {{ storage }}
                  </option>
                </select>
              </div>
            </div>
            <DataTable
              title=""
              :headers="productHeaders"
              :data="filteredProducts"
              :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
              @scroll="handleScroll"
            >
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
                <button
                  class="btn btn-sm px-4 py-2 add-to-cart-btn gradient-custom-teal text-white"
                  @click="showIMEIList(item)"
                  :disabled="!activeInvoiceId"
                >
                  <i class="bi bi-cart-plus-fill"></i>
                </button>
              </template>
            </DataTable>
          </div>
        </FilterTableSection>
      </div>

      <!-- Order Info Section -->
      <div class="col-lg-4 d-flex flex-column">
        <FilterTableSection
          title="Thông tin đơn"
          icon="bi bi-info-circle"
          class="flex-fill"
        >
          <div class="order-card h-100">
            <div
              class="form-check form-switch m-3 d-flex justify-content-end gap-2"
            >
              <input
                class="form-check-input"
                type="checkbox"
                v-model="isDelivery"
                @change="toggleDelivery"
                style="border-color: #34d399"
              />
              <label class="form-check-label text-muted">Bán giao hàng</label>
            </div>
            <div class="card-body p-3 pt-0 d-flex flex-column">
              <!-- Hiển thị placeholder khi giỏ hàng trống -->
              <div
                v-if="cartItems.length === 0"
                class="empty-cart-message text-center py-4"
              >
                <div
                  class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center gradient-custom-teal"
                  style="width: 60px; height: 60px"
                >
                  <i
                    class="bi bi-info-circle text-white"
                    style="font-size: 2rem"
                  ></i>
                </div>
                <p class="text-muted mb-0 fw-medium">
                  Chưa có sản phẩm trong đơn hàng
                </p>
              </div>
              <!-- Nội dung thông tin đơn khi có sản phẩm -->
              <div v-else class="d-flex flex-column flex-grow-1">
                <div v-if="isDelivery" class="mb-5">
                  <h6
                    class="fw-bold text-dark mb-3"
                    style="font-size: 1.3rem; letter-spacing: 0.5px"
                  >
                    Thông tin người nhận
                  </h6>
                  <div
                    class="receiver-form bg-white p-3 rounded-3 shadow-sm animate__animated animate__fadeIn"
                    style="
                      border: 1px solid rgba(52, 211, 153, 0.1);
                      backdrop-filter: blur(5px);
                    "
                  >
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Tên người nhận <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-person text-teal"></i>
                          </span>
                          <input
                            v-model="customer.name"
                            type="text"
                            class="form-control shadow-none border-start-0"
                            placeholder="Nhập tên người nhận"
                            :disabled="!isReceiverEditable"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Số điện thoại <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-telephone text-teal"></i>
                          </span>
                          <input
                            v-model="customer.phone"
                            type="tel"
                            class="form-control shadow-none border-start-0"
                            placeholder="Nhập số điện thoại"
                            :disabled="!isReceiverEditable"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Tỉnh/Thành phố <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-alt text-teal"></i>
                          </span>
                          <select
                            v-model="customer.city"
                            class="form-select shadow-none border-start-0"
                            @change="handleCustomerProvinceChange"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          >
                            <option value="" disabled>
                              Chọn tỉnh/thành phố
                            </option>
                            <option
                              v-for="province in provinces"
                              :key="province.code"
                              :value="province.name"
                            >
                              {{ province.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Quận/Huyện <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo text-teal"></i>
                          </span>
                          <select
                            v-model="customer.district"
                            class="form-select shadow-none border-start-0"
                            @change="handleCustomerDistrictChange"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          >
                            <option value="" disabled>Chọn quận/huyện</option>
                            <option
                              v-for="district in districts"
                              :key="district.code"
                              :value="district.name"
                            >
                              {{ district.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Phường/Xã <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-geo-fill text-teal"></i>
                          </span>
                          <select
                            v-model="customer.ward"
                            class="form-select shadow-none border-start-0"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          >
                            <option value="">Chọn phường/xã</option>
                            <option
                              v-for="ward in wards"
                              :key="ward.code"
                              :value="ward.name"
                            >
                              {{ ward.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Địa chỉ cụ thể <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-house-door text-teal"></i>
                          </span>
                          <input
                            v-model="customer.address"
                            type="text"
                            class="form-control shadow-none border-start-0"
                            placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường,...)"
                            :disabled="!isReceiverEditable"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          />
                        </div>
                      </div>

                      <!-- Chọn đơn vị vận chuyển -->
                      <div class="col-12">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Đơn vị vận chuyển <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-truck text-teal"></i>
                          </span>
                          <select
                            v-model="selectedShippingUnit"
                            class="form-select shadow-none border-start-0"
                            @change="updateShippingFee"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          >
                            <option value="" disabled>
                              Chọn đơn vị vận chuyển
                            </option>
                            <option
                              v-for="unit in shippingUnits"
                              :key="unit.id"
                              :value="unit"
                            >
                              {{ unit.name }}
                            </option>
                          </select>
                        </div>
                        <!-- Hiển thị logo đơn vị vận chuyển -->
                        <div
                          v-if="selectedShippingUnit"
                          class="mt-3 d-flex justify-content-center"
                        >
                          <div
                            class="p-3 border rounded shadow-sm bg-white"
                            style="
                              max-width: 200px;
                              width: 100%;
                              text-align: center;
                            "
                          >
                            <img
                              :src="selectedShippingUnit.logo"
                              :alt="selectedShippingUnit.name"
                              style="
                                max-height: 90px;
                                object-fit: contain;
                                width: 100%;
                              "
                            />
                            <p
                              class="mt-2 mb-0 fw-semibold text-dark"
                              style="font-size: 0.9rem"
                            >
                              {{ selectedShippingUnit.name }}
                            </p>
                          </div>
                        </div>
                      </div>
                      <!-- Ô input phí vận chuyển -->
                      <div class="col-12">
                        <label
                          class="form-label fw-medium text-dark mb-2"
                          style="font-size: 0.95rem"
                        >
                          Phí vận chuyển
                        </label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-currency-dollar text-teal"></i>
                          </span>
                          <input
                            v-model.number="shippingFee"
                            type="number"
                            class="form-control shadow-none border-start-0"
                            placeholder="Nhập phí vận chuyển"
                            :disabled="totalPrice >= FREE_SHIP_THRESHOLD"
                            min="0"
                            style="
                              border-radius: 0 8px 8px 0;
                              transition: all 0.3s ease;
                            "
                          />
                        </div>
                        <div
                          v-if="totalPrice >= FREE_SHIP_THRESHOLD"
                          class="text-success mt-2"
                        >
                          Miễn phí vận chuyển cho đơn hàng từ 20,000,000 VNĐ trở
                          lên
                        </div>
                      </div>

                      <div class="mt-4 text-end" v-if="!isReceiverEditable">
                        <button
                          class="btn btn-outline-teal btn-sm px-4 py-2"
                          @click="isReceiverEditable = true"
                          style="border-radius: 8px; transition: all 0.3s ease"
                        >
                          <i class="bi bi-pencil-square me-2"></i>Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voucher Section -->
                <div class="voucher-section mb-5">
                  <h6
                    class="fw-bold text-dark mb-2"
                    style="font-size: 1.3rem; letter-spacing: 0.5px"
                  >
                    Mã Giảm Giá
                  </h6>
                  <div
                    class="voucher-container bg-white p-3 rounded-3 shadow-sm animate__animated animate__fadeIn"
                    style="
                      border: 1px solid rgba(52, 211, 153, 0.1);
                      backdrop-filter: blur(5px);
                    "
                  >
                    <button
                      class="btn gradient-custom-teal text-white w-100 py-3 fw-medium btn-voucher"
                      @click="showDiscountModal = true"
                      style="
                        border-radius: 10px;
                        transition: all 0.3s ease;
                        font-size: 1rem;
                      "
                      @mouseover="this.style.transform = 'scale(1.02)'"
                      @mouseout="this.style.transform = 'scale(1)'"
                    >
                      Chọn mã giảm giá
                    </button>
                    <div
                      class="price-info mt-4 p-3 rounded-2 bg-light shadow-sm animate__animated animate__fadeInUp"
                      style="border-left: 4px solid #34d399"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center mb-2"
                      >
                        <span
                          class="fw-medium text-dark"
                          style="font-size: 0.95rem"
                          >Tổng tiền hàng:</span
                        >
                        <span class="fw-bold text-dark">{{
                          formatPrice(totalPrice)
                        }}</span>
                      </div>
                      <div
                        class="d-flex justify-content-between align-items-center mb-2"
                      >
                        <span
                          class="fw-medium text-dark"
                          style="font-size: 0.95rem"
                          >Giảm giá:</span
                        >
                        <span class="fw-bold text-danger"
                          >−{{ formatPrice(discount) }}</span
                        >
                      </div>
                      <div
                        v-if="isDelivery"
                        class="d-flex justify-content-between align-items-center mb-2"
                      >
                        <span
                          class="fw-medium text-dark"
                          style="font-size: 0.95rem"
                          >Phí vận chuyển:</span
                        >
                        <span class="fw-bold text-dark">{{
                          totalPrice >= FREE_SHIP_THRESHOLD
                            ? "Miễn phí"
                            : formatPrice(shippingFee)
                        }}</span>
                      </div>
                      <hr
                        class="my-2"
                        style="border-color: rgba(52, 211, 153, 0.2)"
                      />
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span
                          class="fw-bold text-dark"
                          style="font-size: 1.1rem"
                          >Tổng thanh toán:</span
                        >
                        <span class="fw-bold fs-4 text-success">{{
                          formatPrice(totalPayment)
                        }}</span>
                      </div>
                    </div>
                    <div
                      v-if="suggestAdditionalPurchase.message"
                      class="suggestion-alert mt-3 p-3 rounded-2 animate__animated animate__bounceIn"
                      style="
                        background: linear-gradient(135deg, #fff3e0, #ffe8cc);
                        border: 1px solid #ff9800;
                      "
                    >
                      <p
                        class="fw-medium text-dark mb-0"
                        style="color: #e65100; font-size: 0.95rem"
                      >
                        <i class="bi bi-info-circle-fill me-2"></i
                        >{{ suggestAdditionalPurchase.message }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Payment Methods -->
                <div>
                  <h6 class="fw-semibold text-dark">Phương thức thanh toán</h6>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <button
                      class="btn px-4 py-2 select-btn"
                      @click="selectPayment('transfer')"
                      :class="{
                        'gradient-custom-teal text-white':
                          paymentMethod === 'transfer',
                        border: paymentMethod !== 'transfer',
                      }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)"
                    >
                      Chuyển khoản
                    </button>
                    <button
                      class="btn px-4 py-2 select-btn"
                      @click="selectPayment('cash')"
                      :class="{
                        'gradient-custom-teal text-white':
                          paymentMethod === 'cash',
                        border: paymentMethod !== 'cash',
                      }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)"
                    >
                      Tiền mặt
                    </button>
                    <button
                      class="btn px-4 py-2 select-btn"
                      @click="selectPayment('both')"
                      :class="{
                        'gradient-custom-teal text-white':
                          paymentMethod === 'both',
                        border: paymentMethod !== 'both',
                      }"
                      style="border: 1px solid rgba(52, 211, 153, 0.2)"
                    >
                      Cả hai
                    </button>
                  </div>
                  <div v-if="paymentMethod === 'both'" class="row g-3 mt-3">
                    <div class="col-md-6">
                      <label class="form-label fw-medium text-dark"
                        >Tiền chuyển khoản</label
                      >
                      <input
                        v-model.number="tienChuyenKhoan"
                        type="number"
                        class="form-control shadow-none"
                        placeholder="Nhập số tiền chuyển khoản"
                        min="0"
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium text-dark"
                        >Tiền mặt</label
                      >
                      <input
                        v-model.number="tienMat"
                        type="number"
                        class="form-control shadow-none"
                        placeholder="Nhập số tiền mặt"
                        min="0"
                      />
                    </div>
                  </div>
                  <div
                    v-if="showQRCode"
                    class="mt-3 text-center qr-code-container"
                  >
                    <h6 class="fw-bold text-dark">Quét mã QR để thanh toán</h6>
                    <qrcode :value="qrCodeValue" :size="200" level="H" />
                    <p class="text-muted mt-2">
                      Số tiền: {{ formatPrice(qrCodeAmount) }}
                    </p>
                  </div>
                </div>

                <!-- Pay Button -->
                <button
                  class="btn w-100 py-3 pay-btn gradient-custom-green text-white"
                  :disabled="
                    !activeInvoiceId ||
                    cartItems.length === 0 ||
                    isCreatingOrder
                  "
                  @click="ThanhToan"
                >
                  <i class="bi bi-credit-card me-2"></i>
                  <span class="fw-semibold">Thanh toán</span>
                </button>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>

      <!-- IMEI Modal for Cart Item -->
      <div
        v-if="showCartIMEIModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div
            class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
            style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
            "
          >
            <div
              class="modal-header border-0 d-flex justify-content-between align-items-center"
            >
              <h5 class="modal-title fw-bold text-dark">
                IMEI của sản phẩm trong giỏ hàng
              </h5>
              <button
                class="btn btn-outline-secondary btn-close-custom"
                @click="closeCartIMEIModal"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div
                class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
                style="background: linear-gradient(135deg, #f8f9fa, #e9ecef)"
              >
                <div class="row align-items-center">
                  <div class="col-md-4 text-center">
                    <img
                      :src="
                        selectedCartItem?.image ||
                        'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
                      "
                      class="phone-img img-fluid rounded"
                      :alt="selectedCartItem?.name"
                      style="
                        max-height: 150px;
                        object-fit: contain;
                        transition: transform 0.3s ease;
                      "
                      @mouseover="this.style.transform = 'scale(1.05)'"
                      @mouseout="this.style.transform = 'scale(1)'"
                    />
                  </div>
                  <div class="col-md-8">
                    <h4 class="fw-bold text-dark mb-2">
                      {{ selectedCartItem?.name }}
                    </h4>
                    <div class="d-flex flex-wrap gap-3">
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedCartItem?.color }}</span
                      >
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedCartItem?.ram }}</span
                      >
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedCartItem?.storage }}</span
                      >
                      <span
                        class="badge gradient-custom-teal text-white px-3 py-1"
                        >{{ formatPrice(selectedCartItem?.price) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="imei-list-container">
                <h6 class="fw-semibold text-dark mb-3">
                  Danh sách IMEI đã chọn
                </h6>
                <div
                  v-if="
                    !selectedCartItem?.imei ||
                    selectedCartItem.imei.split(', ').length === 0
                  "
                  class="text-center text-muted py-4 animate__animated animate__fadeIn"
                >
                  <i class="bi bi-info-circle me-2"></i>Không có IMEI nào được
                  chọn.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="(imei, index) in selectedCartItem.imei.split(', ')"
                    :key="imei"
                    class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                    style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    "
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div class="d-flex align-items-center">
                        <span
                          class="fw-bold text-teal me-3"
                          style="min-width: 30px"
                          >{{ index + 1 }}.</span
                        >
                        <i
                          class="bi bi-upc-scan me-3 text-teal"
                          style="font-size: 1.2rem"
                        ></i>
                        <span class="text-dark fw-medium">{{ imei }}</span>
                      </div>
                      <button
                        class="btn btn-danger btn-sm delete-imei-btn animate__animated animate__bounceIn"
                        @click="deleteIMEI(imei)"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button
                class="btn btn-light px-4 py-2 gradient-custom-teal text-white"
                @click="closeCartIMEIModal"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- IMEI Modal for Product Selection -->
      <div
        v-if="showIMEIModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div
            class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
            style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
            "
          >
            <div
              class="modal-header border-0 d-flex justify-content-between align-items-center"
            >
              <h5 class="modal-title fw-bold text-dark">
                Chọn IMEI cho sản phẩm
              </h5>
              <button
                class="btn btn-outline-secondary btn-close-custom"
                @click="closeIMEIModal"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div
                class="product-info-card mb-4 p-3 rounded shadow-sm animate__animated animate__fadeInDown"
                style="background: linear-gradient(135deg, #f8f9fa, #e9ecef)"
              >
                <div class="row align-items-center">
                  <div class="col-md-4 text-center">
                    <img
                      :src="
                        selectedProduct?.image ||
                        'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
                      "
                      class="phone-image img-fluid rounded"
                      :alt="selectedProduct?.tenSanPham"
                      style="
                        max-height: 150px;
                        object-fit: contain;
                        transition: transform 0.3s ease;
                      "
                      @mouseover="this.style.transform = 'scale(1.05)'"
                      @mouseout="this.style.transform = 'scale(1)'"
                    />
                  </div>
                  <div class="col-md-8">
                    <h4 class="fw-bold text-dark mb-2">
                      {{ selectedProduct?.tenSanPham }}
                    </h4>
                    <div class="d-flex flex-wrap gap-3">
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedProduct?.mauSac }}</span
                      >
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedProduct?.ram }}</span
                      >
                      <span
                        class="badge text-white px-3 py-1"
                        style="background-color: #1f3a44"
                        >{{ selectedProduct?.boNhoTrong }}</span
                      >
                      <span
                        class="badge gradient-custom-teal text-white px-3 py-1"
                        >{{ formatPrice(selectedProduct?.giaBan) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="imei-list-container">
                <h6 class="fw-semibold text-dark mb-3">
                  Danh sách IMEI khả dụng
                </h6>
                <div
                  v-if="availableIMEIs.length === 0"
                  class="text-center text-muted py-4 animate__animated animate__fadeIn"
                >
                  <i class="bi bi-info-circle me-2"></i>Không có IMEI nào khả
                  dụng.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="(imei, index) in availableIMEIs"
                    :key="imei.id"
                    class="imei-card p-3 rounded shadow-sm animate__animated animate__fadeInUp"
                    style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    "
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div class="d-flex align-items-center">
                        <input
                          type="checkbox"
                          :value="imei.imei"
                          v-model="selectedIMEIs"
                          class="form-check-input me-3"
                          style="border-color: #34d399"
                          @change="handleIMEISelection"
                        />
                        <span
                          class="fw-bold text-teal me-3"
                          style="min-width: 30px"
                          >{{ index + 1 }}.</span
                        >
                        <i
                          class="bi bi-upc-scan me-3 text-teal"
                          style="font-size: 1.2rem"
                        ></i>
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
              <button
                class="btn btn-light px-4 py-2 gradient-custom-teal text-white"
                @click="addProductWithIMEIs"
                :disabled="selectedIMEIs.length === 0"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Discount Modal -->
      <div
        v-if="showDiscountModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div
            class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
            style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
            "
          >
            <div
              class="modal-header border-0 d-flex justify-content-between align-items-center"
            >
              <h5 class="modal-title fw-bold text-dark">Chọn mã giảm giá</h5>
              <button
                class="btn btn-outline-secondary btn-close-custom"
                @click="showDiscountModal = false"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                  <button
                    class="nav-link"
                    :class="{ active: activeTab === 'private' }"
                    @click="activeTab = 'private'"
                  >
                    Mã cá nhân
                  </button>
                </li>
                <li class="nav-item">
                  <button
                    class="nav-link"
                    :class="{ active: activeTab === 'public' }"
                    @click="activeTab = 'public'"
                  >
                    Mã công khai
                  </button>
                </li>
              </ul>
              <div v-if="activeTab === 'private'">
                <div
                  v-if="privateDiscountCodes.length === 0"
                  class="text-center text-muted py-4"
                >
                  <i class="bi bi-info-circle me-2"></i>Không có mã giảm giá cá
                  nhân nào.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="code in privateDiscountCodes"
                    :key="code.id"
                    class="discount-card p-3 rounded shadow-sm"
                    style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    "
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 class="fw-bold text-dark mb-1">{{ code.code }}</h6>
                        <p class="text-muted mb-0">
                          Giảm: {{ formatPrice(code.value) }}
                        </p>
                         <p class="text-muted mb-0">
                          Hết hạn:
                          {{ code.expiry }}
                        </p>
                      </div>
                      <button
                        class="btn btn-sm gradient-custom-teal text-white"
                        @click="
                          selectedPrivateDiscount = code;
                          applyPrivateDiscount();
                        "
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="activeTab === 'public'">
                <div
                  v-if="publicDiscountCodes.length === 0"
                  class="text-center text-muted py-4"
                >
                  <i class="bi bi-info-circle me-2"></i>Không có mã giảm giá
                  công khai nào.
                </div>
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="code in publicDiscountCodes"
                    :key="code.id"
                    class="discount-card p-3 rounded shadow-sm"
                    style="
                      background: #fff;
                      border: 1px solid rgba(52, 211, 153, 0.1);
                    "
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 class="fw-bold text-dark mb-1">{{ code.code }}</h6>
                        <p class="text-muted mb-0">
                          Giảm: {{ formatPrice(code.value) }} (Đơn tối thiểu:
                          {{ formatPrice(code.minOrder) }})
                        </p>
                        <p class="text-muted mb-0">
                          Hết hạn:
                          {{ code.expiry }}
                        </p>
                      </div>
                      <button
                        class="btn btn-sm gradient-custom-teal text-white"
                        @click="
                          selectedPublicDiscount = code;
                          applyPublicDiscount();
                        "
                        :disabled="totalPrice < code.minOrder"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button
                class="btn btn-light px-4 py-2"
                @click="showDiscountModal = false"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Modal -->
      <div
        v-if="isCustomerModalOpen"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div
            class="modal-content shadow-lg p-3 gradient-modal animate__animated animate__zoomIn"
            style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(15px);
              border-radius: 16px;
            "
          >
            <div
              class="modal-header border-0 d-flex justify-content-between align-items-center"
            >
              <h5 class="modal-title fw-bold text-dark">Thêm khách hàng mới</h5>
              <button
                class="btn btn-outline-secondary btn-close-custom"
                @click="isCustomerModalOpen = false"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-4">
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2">
                    Tên khách hàng <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="newCustomer.name"
                    type="text"
                    class="form-control shadow-none"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium text-dark mb-2">
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="newCustomer.phone"
                    type="tel"
                    class="form-control shadow-none"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button
                class="btn btn-light px-4 py-2"
                @click="isCustomerModalOpen = false"
              >
                Hủy
              </button>
              <button
                class="btn btn-light px-4 py-2 gradient-custom-teal text-white"
                @click="addNewCustomer"
              >
                Thêm khách hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Modal -->
      <NotificationModal
        ref="notificationModal"
        :type="notificationType"
        :message="notificationMessage"
        :isLoading="isNotificationLoading"
        :onConfirm="notificationOnConfirm"
        :onCancel="notificationOnCancel"
      />

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
});
</script>

<style scoped>
.container-fluid {
  max-width: 1600px;
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #60a5fa);
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

.delete-invoice-btn:hover {
  background: #ef4444;
  color: white;
}

.btn-close-custom {
  border-radius: 50%;
  padding: 8px;
}

.phone-image:hover {
  transform: scale(1.05);
}

.imei-card:hover {
  background: rgba(52, 211, 153, 0.05);
}

.discount-card:hover {
  background: rgba(52, 211, 153, 0.05);
}

.pay-btn:hover {
  transform: scale(1.02);
}
</style>
