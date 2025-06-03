<template>
  <div class="container-fluid py-4">
    <div>
      <!-- Sử dụng HeaderCard component với các props -->
      <HeaderCard title="Quản Lý Bán Hàng" badgeText="Hệ Thống POS" titleColor="#002962"
        badgeClass="bg-gradient-to-r from-blue-600 to-indigo-600" :backgroundOpacity="0.95" />

      <!-- Search and Add Bill -->
      <div class="card shadow-sm border-0 mb-4 search-card"
        style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
        <div class="card-body p-3" style="background: linear-gradient(135deg, #002962, #0052cc);">
          <div class="d-flex gap-3 align-items-center">
            <div class="flex-grow-1">
              <div class="input-group">
                <span class="input-group-text bg-white border-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input type="text" class="form-control border-0 shadow-none" placeholder="Tìm kiếm điện thoại..."
                  v-model="searchQuery" style="background: rgba(255, 255, 255, 0.95);" />
              </div>
            </div>
            <button class="btn btn-light px-4 py-2 fw-semibold add-bill-btn" style="color: #002962;"
              @click="createNewBill">
              <i class="bi bi-plus-circle me-2"></i>Tạo hóa đơn mới
            </button>
          </div>
        </div>
      </div>

      <!-- Bills Stats -->
      <div class="row g-3 mb-4">
        <div class="col-md-4" v-for="(bill, index) in bills" :key="index">
          <div class="card border-0 shadow-sm h-100 bill-card"
            style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-1 fw-bold" style="color: #002962;">Hóa đơn chờ</h5>
                <div class="icon-container rounded-2 d-flex align-items-center justify-content-center"
                  style="width: 32px; height: 32px; background: linear-gradient(135deg, #002962, #0052cc);">
                  <i class="bi bi-receipt text-white small"></i>
                </div>
              </div>
              <p class="card-text text-muted mb-2">{{ bill.products }}</p>
              <div class="d-flex align-items-center">
                <div class="bg-warning rounded-circle me-2 pulse-dot" style="width: 6px; height: 6px;"></div>
                <small class="text-muted">{{ bill.timeLeft }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row g-4">
        <!-- Product List -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm product-card"
            style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold" style="color: #002962;">Giỏ Hàng</h5>
            </div>
            <div class="card-body p-0">
              <!-- Cart Section -->
              <div class="p-4 border-bottom">
                <div v-if="cart.length === 0" class="empty-cart-container text-center py-4">
                  <div
                    class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(0, 41, 98, 0.1), rgba(0, 82, 204, 0.1));">
                    <span class="empty-icon" style="font-size: 2.5rem;">📤</span>
                  </div>
                  <p class="text-muted mb-0">Giỏ hàng trống</p>
                </div>
                <div v-else>
                  <div v-for="(item, index) in cart" :key="index" class="cart-item p-2 mb-2 rounded"
                    style="background: rgba(0, 41, 98, 0.05);">
                    <div class="d-flex justify-content-between align-items-center">
                      <span>{{ item.name }}</span>
                      <button class="btn btn-sm btn-danger" @click="removeFromCart(index)">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Filters -->
              <div class="p-4 border-bottom">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label fw-medium" style="color: #002962;">Màu sắc</label>
                    <select class="form-select filter-select" v-model="filters.color">
                      <option value="">Tất cả màu sắc</option>
                      <option>Đen</option>
                      <option>Trắng</option>
                      <option>Xám</option>
                      <option>Vàng</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-medium" style="color: #002962;">Dung lượng</label>
                    <select class="form-select filter-select" v-model="filters.storage">
                      <option value="">Tất cả dung lượng</option>
                      <option>128GB</option>
                      <option>256GB</option>
                      <option>512GB</option>
                      <option>1TB</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-medium" style="color: #002962;">Thương hiệu</label>
                    <select class="form-select filter-select" v-model="filters.brand">
                      <option value="">Tất cả thương hiệu</option>
                      <option>Apple</option>
                      <option>Samsung</option>
                      <option>Xiaomi</option>
                      <option>Oppo</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-medium" style="color: #002962;">Hệ điều hành</label>
                    <select class="form-select filter-select" v-model="filters.os">
                      <option value="">Tất cả hệ điều hành</option>
                      <option>iOS</option>
                      <option>Android</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Products Table -->
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead style="background: rgba(0, 41, 98, 0.05);">
                    <tr>
                      <th class="fw-semibold text-center" style="color: #002962;">STT</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Mã sản phẩm</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Tên sản phẩm</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Màu</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Dung lượng</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Có sẵn</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Tổng số lượng</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Giảm giá</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Giá bán</th>
                      <th class="fw-semibold text-center" style="color: #002962;">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(product, index) in filteredProducts" :key="index" class="product-row">
                      <td class="text-muted text-center">{{ index + 1 }}</td> <!-- Corrected STT column -->
                      <td class="text-muted text-center">{{ product.code }}</td>
                      <td class="fw-medium text-center" style="color: #002962;">{{ product.name }}</td>
                      <td class="text-muted text-center">{{ product.color }}</td>
                      <td class="text-muted text-center">{{ product.storage }}</td>
                      <td>
                        <span class="badge bg-success-subtle text-success px-2 py-1 text-center">{{ product.available
                          }}</span>
                      </td>
                      <td class="text-muted text-center">{{ product.quantity }}</td>
                      <td>
                        <span class="badge bg-warning-subtle text-warning px-2 py-1 text-center">{{ product.discount
                          }}</span>
                      </td>
                      <td class="fw-semibold text-center" style="color: #28a745;">{{ product.salePrice }}</td>
                      <td class="text-center">
                        <button class="btn btn-sm px-3 py-1 add-to-cart-btn"
                          style="background: linear-gradient(135deg, #002962, #0052cc); color: white;"
                          @click="addToCart(product)">
                          <i class="bi bi-cart-plus-fill"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="col-lg-4">
          <!-- Customer Info -->
          <div class="card border-0 shadow-sm mb-4 customer-card"
            style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0">
              <h5 class="mb-0 fw-bold" style="color: #002962;">Khách hàng</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="input-group">
                  <span class="input-group-text bg-light border-0">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input type="text" class="form-control border-0 shadow-none" placeholder="Tìm kiếm khách hàng..."
                    v-model="customerName" />
                </div>
              </div>
              <button class="btn w-100 mb-3 add-customer-btn"
                style="background: rgba(0, 41, 98, 0.1); color: #002962; border: 1px solid rgba(0, 41, 98, 0.2);"
                @click="addNewCustomer">
                <i class="bi bi-person-plus me-2"></i>Thêm khách hàng mới
              </button>
              <select class="form-select" v-model="customerType">
                <option value="retail">Khách lẻ</option>
                <option value="wholesale">Khách sỉ</option>
              </select>
            </div>
          </div>

          <!-- Order Info -->
          <div class="card border-0 shadow-sm order-card"
            style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0">
              <h5 class="mb-0 fw-bold" style="color: #002962;">Thông tin đơn</h5>
            </div>
            <div class="card-body">
              <div class="order-summary mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Tổng tiền:</span>
                  <span class="fw-bold fs-5" style="color: #002962;">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>

              <div class="voucher-section mb-4">
                <button class="btn w-100 voucher-btn" @click="openVoucherModal"
                  style="background: linear-gradient(135deg, #002962, #0052cc); color: white;">
                  <i class="bi bi-ticket-detailed me-2"></i>Chọn voucher
                </button>
                <small class="text-muted d-block mt-1 text-center">(Click để mở modal chọn voucher)</small>
                <div v-if="selectedVoucher" class="selected-voucher mt-2 p-2 rounded"
                  style="background: rgba(40, 167, 69, 0.1);">
                  <small class="text-success fw-medium">✓ Đã chọn: {{ selectedVoucher.name }}</small>
                </div>
              </div>

              <div class="payment-summary mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-medium">Khách phải trả:</span>
                  <span class="fw-bold fs-4" style="color: #28a745;">{{ formatPrice(finalPrice) }}</span>
                </div>
              </div>

              <div class="mb-4">
                <select class="form-select" v-model="paymentMethod">
                  <option value="">Phương thức thanh toán</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="cash">Tiền mặt</option>
                </select>
              </div>

              <button class="btn w-100 py-3 pay-btn"
                style="background: linear-gradient(135deg, #28a745, #1e7e34); color: white;" @click="processPayment">
                <i class="bi bi-credit-card me-2"></i>
                <span class="fw-semibold">Thanh toán</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Voucher Modal -->
      <div v-if="showVoucherModal" class="modal-overlay">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg p-4"
            style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);">
            <div class="modal-header border-0 mb-2">
              <h5 class="modal-title fw-bold" style="color: #002962;">Chọn phiếu giảm giá</h5>
              <button type="button" class="btn-close" @click="closeVoucherModal"></button>
            </div>
            <div class="modal-body">
              <div class="voucher-list">
                <div v-for="(voucher, index) in vouchers" :key="index" class="voucher-item p-3 mb-2 rounded border"
                  :style="`animation-delay: ${index * 0.1}s;`" @click="selectVoucher(voucher)">
                  <div class="d-flex align-items-center">
                    <div class="voucher-icon rounded-2 d-flex align-items-center justify-content-center me-3"
                      style="width: 40px; height: 40px; background: linear-gradient(135deg, #002962, #0052cc);">
                      <i class="bi bi-ticket text-white"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-semibold" style="color: #002962;">{{ voucher.name }}</h6>
                      <small class="text-muted">{{ voucher.description }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-secondary" @click="closeVoucherModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderCard from '@/components/common/HeaderCard.vue';

export default {
  name: 'Sale',
  components: {
    HeaderCard,
  },
  data() {
    return {
      showVoucherModal: false,
      searchQuery: 'iPhone', // Từ khóa tìm kiếm mặc định
      customerName: 'Nguyễn Văn A', // Tên khách hàng mặc định
      customerType: 'retail', // Loại khách hàng mặc định
      paymentMethod: 'transfer', // Phương thức thanh toán mặc định
      cart: [], // Giỏ hàng rỗng ban đầu
      selectedVoucher: null, // Voucher được chọn
      filters: {
        color: '', // Bộ lọc màu sắc
        storage: '', // Bộ lọc dung lượng
        brand: '', // Bộ lọc thương hiệu
        os: '', // Bộ lọc hệ điều hành
      },
      bills: [
        {
          id: 'BILL001',
          products: '2 sản phẩm',
          timeLeft: 'Còn lại: 29 phút 46 giây',
        },
        {
          id: 'BILL002',
          products: '1 sản phẩm',
          timeLeft: 'Còn lại: 15 phút 30 giây',
        },
      ],
      products: [
        {
          code: 'DT001',
          name: 'iPhone 14 Pro',
          color: 'Đen',
          storage: '256GB',
          available: 'Có sẵn',
          quantity: 10,
          originalPrice: 25990000, // Giá gốc dạng số
          discount: 10, // Phần trăm giảm giá
          salePrice: 23391000, // Giá bán dạng số
          os: 'iOS',
          brand: 'Apple',
        },
        {
          code: 'DT002',
          name: 'Samsung Galaxy S23',
          color: 'Trắng',
          storage: '128GB',
          available: 'Có sẵn',
          quantity: 15,
          originalPrice: 19990000,
          discount: 15,
          salePrice: 16991500,
          os: 'Android',
          brand: 'Samsung',
        },
        {
          code: 'DT003',
          name: 'Xiaomi 13 Lite',
          color: 'Xám',
          storage: '256GB',
          available: 'Có sẵn',
          quantity: 20,
          originalPrice: 9990000,
          discount: 5,
          salePrice: 9490500,
          os: 'Android',
          brand: 'Xiaomi',
        },
      ],
      vouchers: [
        {
          name: 'Voucher 5%',
          description: 'Giảm 5% tổng đơn hàng',
          discount: 0.05,
        },
        {
          name: 'Voucher 10%',
          description: 'Giảm 10% tổng đơn hàng',
          discount: 0.1,
        },
        {
          name: 'Voucher 15%',
          description: 'Giảm 15% tổng đơn hàng',
          discount: 0.15,
        },
        {
          name: 'Không sử dụng',
          description: 'Không áp dụng voucher nào',
          discount: 0,
        },
      ],
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        return (
          (this.filters.color === '' || product.color === this.filters.color) &&
          (this.filters.storage === '' || product.storage === this.filters.storage) &&
          (this.filters.brand === '' || product.brand === this.filters.brand) &&
          (this.filters.os === '' || product.os === this.filters.os) &&
          (this.searchQuery === '' ||
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(this.searchQuery.toLowerCase()))
        );
      });
    },
    totalPrice() {
      return this.cart.reduce((total, item) => total + item.salePrice, 0);
    },
    finalPrice() {
      const discount = this.selectedVoucher ? this.selectedVoucher.discount : 0;
      return this.totalPrice * (1 - discount);
    },
  },
  methods: {
    openVoucherModal() {
      this.showVoucherModal = true;
    },
    closeVoucherModal() {
      this.showVoucherModal = false;
    },
    selectVoucher(voucher) {
      this.selectedVoucher = voucher;
      this.closeVoucherModal();
    },
    addToCart(product) {
      this.cart.push({ ...product });
    },
    removeFromCart(index) {
      this.cart.splice(index, 1);
    },
    createNewBill() {
      if (this.cart.length === 0) {
        alert('Giỏ hàng trống, vui lòng thêm sản phẩm trước khi tạo hóa đơn.');
        return;
      }
      const newBill = {
        id: `BILL${this.bills.length + 1}`.padStart(7, '0'),
        products: `${this.cart.length} sản phẩm`,
        timeLeft: 'Còn lại: 30 phút 00 giây',
      };
      this.bills.push(newBill);
      this.cart = []; // Reset giỏ hàng sau khi tạo hóa đơn
      alert('Hóa đơn mới đã được tạo!');
    },
    addNewCustomer() {
      if (!this.customerName) {
        alert('Vui lòng nhập tên khách hàng.');
        return;
      }
      alert(`Khách hàng mới "${this.customerName}" đã được thêm!`);
    },
    processPayment() {
      if (!this.paymentMethod) {
        alert('Vui lòng chọn phương thức thanh toán.');
        return;
      }
      if (this.cart.length === 0) {
        alert('Giỏ hàng trống, vui lòng thêm sản phẩm.');
        return;
      }
      alert(`Thanh toán thành công với phương thức: ${this.paymentMethod}. Tổng tiền: ${this.formatPrice(this.finalPrice)}`);
      this.cart = []; // Reset giỏ hàng sau khi thanh toán
      this.selectedVoucher = null; // Reset voucher
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    },
  },
};
</script>

<style scoped>
/* Import animations from Home.vue */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes smoothPulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

@keyframes gentleGlow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(0, 94, 226, 0.3);
  }

  50% {
    box-shadow: 0 0 20px rgba(0, 94, 226, 0.5);
  }
}

.search-card {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.bill-card {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bill-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 25px rgba(0, 94, 226, 0.15) !important;
}

.product-card,
.customer-card,
.order-card {
  animation: slideInLeft 0.8s ease-out;
}

.add-bill-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-bill-btn:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 4px 12px rgba(0, 41, 98, 0.3);
}

.add-to-cart-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-to-cart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 41, 98, 0.3);
}

.add-customer-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-customer-btn:hover {
  background: rgba(0, 41, 98, 0.15) !important;
  transform: translateX(5px);
}

.voucher-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.voucher-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 41, 98, 0.3);
}

.pay-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pay-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
}

.product-row {
  transition: all 0.3s ease;
}

.product-row:hover {
  background: rgba(0, 41, 98, 0.03) !important;
}

.icon-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bill-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
}

.empty-icon-container {
  transition: all 0.3s ease;
}

.empty-icon-container:hover {
  transform: scale(1.1);
  animation: gentleGlow 2s infinite;
}

.pulse-dot {
  animation: smoothPulse 2s infinite ease-in-out;
}

.filter-select,
.form-select,
.form-control {
  transition: all 0.3s ease;
  border-color: rgba(0, 41, 98, 0.2);
}

.filter-select:focus,
.form-select:focus,
.form-control:focus {
  border-color: #0052cc;
  box-shadow: 0 0 0 0.2rem rgba(0, 94, 226, 0.25);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeInUp 0.3s ease-out;
}

.modal-content {
  animation: fadeInUp 0.4s ease-out;
}

.voucher-item {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
  background: rgba(248, 249, 250, 0.5);
  cursor: pointer;
}

.voucher-item:hover {
  background: rgba(0, 41, 98, 0.05) !important;
  transform: translateX(5px);
  border-color: rgba(0, 94, 226, 0.3) !important;
}

.voucher-icon {
  transition: all 0.3s ease;
}

.voucher-item:hover .voucher-icon {
  transform: scale(1.1);
}

.selected-voucher {
  animation: fadeInUp 0.5s ease-out;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.table thead th {
  white-space: nowrap;
  /* Prevent text wrapping in table headers */
}

@media (max-width: 768px) {
  .bill-card:hover {
    transform: translateY(-4px) scale(1.01);
  }

  .add-to-cart-btn:hover {
    transform: scale(1.05);
  }

  .add-customer-btn:hover {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>