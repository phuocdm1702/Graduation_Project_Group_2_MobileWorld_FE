<template>
  <div class="pos-container">
    <!-- Header with branding and slider -->
    <header class="pos-header">
      <div class="slider-container">
        <div class="slider" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="(image, index) in bannerImages" :key="index" class="slide">
            <img :src="image" alt="Banner slide" class="banner-image">
          </div>
        </div>
        <div class="slider-overlay">
          <span class="tagline">Chất Lượng Hàng Đầu - Dịch Vụ Tuyệt Vời</span>
        </div>
        <div class="slider-controls">
          <button v-for="(image, index) in bannerImages" :key="index" 
                  @click="currentSlide = index" 
                  :class="{ active: currentSlide === index }" 
                  class="slider-dot"></button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="pos-content">
      <div class="content-wrapper">
        <!-- Product section -->
        <section class="product-section">
          <div class="section-header">
            <h2 class="section-title">Sản Phẩm</h2>
            <div class="product-count">
              Tổng số lượng: <span class="count-value">{{ totalQuantity }}</span> sản phẩm
            </div>
          </div>
          <div class="product-list">
            <div v-if="!cartItems || cartItems.length === 0" class="empty-cart-container text-center py-5">
              <div class="empty-icon-container rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <i class="bi bi-cart-x text-white" style="font-size: 2.5rem"></i>
              </div>
              <p class="text-muted mb-0 fw-medium">Không có sản phẩm trong giỏ hàng</p>
            </div>
            <div v-else class="product-table">
              <div class="table-header">
                <span class="header-item stt">STT</span>
                <span class="header-item image">Hình ảnh</span>
                <span class="header-item name">Tên sản phẩm</span>
                <span class="header-item details">Thông tin</span>
                <span class="header-item quantity">Số lượng</span>
                <span class="header-item price">Thành tiền</span>
              </div>
              <div v-for="(item, index) in cartItems" :key="item.id" class="product-item">
                <span class="item-stt">{{ index + 1 }}</span>
                <div class="item-image">
                  <img :src="getPhoneImage(item)" :alt="item.name" class="phone-product-image">
                </div>
                <div class="item-info">
                  <h3 class="product-name">{{ item.name }}</h3>
                </div>
                <div class="item-details">
                  <div class="detail-item">
                    <span class="detail-label">Màu sắc:</span>
                    <span class="detail-value">{{ item.color || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Bộ nhớ:</span>
                    <span class="detail-value">{{ item.storage || 'N/A' }}</span>
                  </div>
                </div>
                <div class="item-quantity">
                  <span class="quantity-value">{{ item.quantity }}</span>
                </div>
                <div class="item-price">
                  <span class="price-value">{{ formatPrice(item.currentPrice * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sidebar with merged payment information -->
        <aside class="sidebar">
          <section class="payment-info-section">
            <h2 class="section-title">Thông Tin Thanh Toán</h2>
            <div class="payment-info">
              <!-- Invoice Details -->
              <div class="info-group">
                <h3 class="info-group-title">Chi Tiết Hóa Đơn</h3>
                <div class="info-row">
                  <span class="info-label">Mã hóa đơn:</span>
                  <span class="info-value">{{ invoiceCode }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày giờ:</span>
                  <span class="info-value">{{ currentDateTime }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Trạng thái:</span>
                  <span class="info-value">{{ orderStatus }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phương thức:</span>
                  <span class="info-value">{{ paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'transfer' && selectedPaymentProvider === 'vnpay' ? 'Chuyển khoản VNPAY' : 'N/A' }}</span>
                </div>
              </div>

              <!-- Customer Information -->
              <div class="info-group">
                <h3 class="info-group-title">Thông Tin Khách Hàng</h3>
                <div class="info-row">
                  <span class="info-label">Tên:</span>
                  <span class="info-value">{{ customer.name || 'Khách lẻ' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Số điện thoại:</span>
                  <span class="info-value">{{ customer.phone || 'N/A' }}</span>
                </div>
                <div class="info-row" v-if="isDelivery && customer.address">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value">{{ formatAddress }}</span>
                </div>
              </div>

              <!-- Total Amount -->
              <div class="info-group">
                <h3 class="info-group-title">Tổng Hợp</h3>
                <div class="info-row">
                  <span class="info-label">Tổng tiền hàng:</span>
                  <span class="info-value">{{ formatPrice(totalAmount) }}</span>
                </div>
                <div class="info-row" v-if="discount > 0">
                  <span class="info-label">Giảm giá:</span>
                  <span class="info-value text-danger">−{{ formatPrice(discount) }}</span>
                </div>
                <div class="info-row" v-if="isDelivery && shippingFee > 0">
                  <span class="info-label">Phí vận chuyển:</span>
                  <span class="info-value">{{ formatPrice(shippingFee) }}</span>
                </div>
                <div class="info-row final-amount">
                  <span class="info-label">TỔNG THANH TOÁN:</span>
                  <span class="info-value text-success">{{ formatPrice(finalAmount) }}</span>
                </div>
              </div>

              <!-- QR Code for VNPAY -->
              <div v-if="paymentMethod === 'transfer' && selectedPaymentProvider === 'vnpay'" class="qr-code-container text-center mt-4">
                <div class="qr-code-wrapper">
                  <img src="/src/assets/img/Logo-VNPAY-QR-1.jpg" alt="VNPAY Logo" class="vnpay-logo">
                  <h6 class="fw-bold text-dark">Quét mã QR để thanh toán</h6>
                  <qrcode :value="qrCodeValue" :size="180" level="H" class="qr-code" />
                  <p class="text-muted mt-2">Số tiền: <span class="fw-bold text-dark">{{ formatPrice(finalAmount) }}</span></p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <!-- Thank you message -->
      <section class="text-center">
        <p class="thank-you-message">Cảm ơn quý khách đã mua sắm tại Mobile World!</p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="pos-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/public/images/logos/logo3.png" alt="Mobile World Logo" class="footer-logo-img">
        </div>
        <p class="footer-contact">Hotline: 1800 1060 | Website: www.mobileworld.com.vn | Email: support@mobileworld.com.vn</p>
        <p class="footer-copyright">© 2025 Mobile World. All rights reserved.</p>
        <div class="footer-social">
          <a href="https://facebook.com/mobileworld" target="_blank" class="social-link">
            <i class="bi bi-facebook"></i>
          </a>
          <a href="https://instagram.com/mobileworld" target="_blank" class="social-link">
            <i class="bi bi-instagram"></i>
          </a>
          <a href="https://youtube.com/mobileworld" target="_blank" class="social-link">
            <i class="bi bi-youtube"></i>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import QRCodeVue3 from 'qrcode-vue3'

export default {
  name: 'POSPaymentDisplay',
  components: {
    qrcode: QRCodeVue3
  },
  setup() {
    const route = useRoute()
    const currentSlide = ref(0)
    const currentDateTime = ref('')
    const invoiceCode = ref('')
    const orderStatus = ref('Đang xử lý')

    // Banner images
    const bannerImages = ref([
      '/src/assets/img/banner-1.jpg',
      '/src/assets/img/banner-2.jpg',
      '/src/assets/img/banner-3.jpg'
    ])

    // Retrieve data from route query
    const cartItems = ref(route.query.cartItems ? JSON.parse(route.query.cartItems) : [])
    const discount = ref(Number(route.query.discount) || 0)
    const shippingFee = ref(Number(route.query.shippingFee) || 0)
    const isDelivery = ref(route.query.isDelivery === 'true')
    const customer = ref({
      name: route.query.customerName || '',
      phone: route.query.customerPhone || '',
      city: route.query.customerCity || '',
      district: route.query.customerDistrict || '',
      ward: route.query.customerWard || '',
      address: route.query.customerAddress || ''
    })
    const selectedDiscount = ref(route.query.selectedDiscount ? JSON.parse(route.query.selectedDiscount) : null)
    const paymentMethod = ref(route.query.paymentMethod || 'cash')
    const selectedPaymentProvider = ref(route.query.selectedPaymentProvider || '')

    // QR Code for VNPAY
    const qrCodeValue = computed(() => {
      if (paymentMethod.value === 'transfer' && selectedPaymentProvider.value === 'vnpay') {
        return `vnpay://payment?amount=${finalAmount.value}&description=Thanh%20toán%20đơn%20hàng%20${invoiceCode.value}`
      }
      return ''
    })

    // Computed properties
    const totalQuantity = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    const totalAmount = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0)
    })

    const finalAmount = computed(() => {
      let discountAmount = 0
      if (selectedDiscount.value) {
        discountAmount = selectedDiscount.value.percent 
          ? (selectedDiscount.value.percent / 100) * totalAmount.value 
          : selectedDiscount.value.value || 0
      }
      return totalAmount.value - discountAmount + (isDelivery.value ? shippingFee.value : 0)
    })

    const formatAddress = computed(() => {
      return `${customer.value.address}, ${customer.value.ward}, ${customer.value.district}, ${customer.value.city}`
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
    }

    const getPhoneImage = (item) => {
      return item.image || 'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png'
    }

    const generateInvoiceCode = () => {
      return route.params.invoiceId || 'HD' + Date.now().toString().slice(-8)
    }

    const updateDateTime = () => {
      const now = new Date()
      currentDateTime.value = now.toLocaleString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const startSlider = () => {
      setInterval(() => {
        currentSlide.value = (currentSlide.value + 1) % bannerImages.value.length
      }, 5000)
    }

    onMounted(() => {
      updateDateTime()
      setInterval(updateDateTime, 1000)
      invoiceCode.value = generateInvoiceCode()
      startSlider()
    })

    onUnmounted(() => {
      clearInterval(updateDateTime)
      clearInterval(startSlider)
    })

    return {
      cartItems,
      discount,
      shippingFee,
      isDelivery,
      customer,
      totalAmount,
      totalQuantity,
      finalAmount,
      formatPrice,
      getPhoneImage,
      currentDateTime,
      invoiceCode,
      bannerImages,
      currentSlide,
      selectedDiscount,
      formatAddress,
      paymentMethod,
      selectedPaymentProvider,
      qrCodeValue,
      orderStatus
    }
  }
}
</script>

<style scoped>
/* Base styles */
.pos-container {
  margin: 1rem auto;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header with branding and slider */
.pos-header {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #16a34a, #34d399);
}

.slider-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slider {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: brightness(0.85);
}

.slider-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2rem;
}

.tagline {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.5px;
}

.slider-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.slider-dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: 0.3s ease;
}

.slider-dot.active {
  background: #ffffff;
}

.slider-dot:hover {
  background: #ffffff;
}

/* Main content */
.pos-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

/* Product section */
.product-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a2e44;
  position: relative;
  padding-left: 1rem;
}

.section-title::before {
  content: '';
  height: 28px;
  width: 6px;
  background: #16a34a;
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 2px;
}

.product-count {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.count-value {
  font-weight: 700;
  color: #16a34a;
}

.product-list {
  border-radius: 8px;
  overflow: hidden;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 100px 1fr 200px 100px 200px;
  background: #f1f5f9;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.header-item {
  padding: 0.5rem;
  font-size: 0.95rem;
}

.header-item.stt {
  text-align: center;
}

.header-item.quantity,
.header-item.price {
  text-align: center;
}

.product-item {
  display: grid;
  grid-template-columns: 50px 100px 1fr 200px 100px 200px;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.product-item:hover {
  background: #f9fafb;
}

.product-item:last-child {
  border-bottom: none;
}

.item-stt {
  font-size: 1rem;
  font-weight: 600;
  color: #1a2e44;
  text-align: center;
}

.item-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.phone-product-image:hover {
  transform: scale(1.05);
}

.item-info {
  padding-right: 1rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a2e44;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  font-size: 0.95rem;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  margin-right: 0.5rem;
}

.detail-value {
  font-weight: 600;
  color: #1f3a44;
}

.item-quantity {
  text-align: center;
}

.quantity-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a2e44;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

.item-price {
  text-align: center;
}

.price-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #16a34a;
}

/* Empty cart */
.empty-cart-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 3rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.empty-icon-container {
  background: linear-gradient(135deg, #16a34a, #34d399);
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Payment info section */
.payment-info-section {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.payment-info {
  display: grid;
  gap: 2rem;
}

.info-group {
    margin-top: 1rem;
  display: grid;
  gap: 1rem;
}

.info-group-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a2e44;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
}

.info-row.final-amount {
  border-top: 1px solid #d1d5db;
  padding-top: 1.25rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #1f3a44;
}

.info-value.text-danger {
  color: #e02424;
}

.info-value.text-success {
  font-size: 1.7rem;
}

.qr-code-container {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vnpay-logo {
  width: 120px;
  height: auto;
  margin-bottom: 1rem;
}

.qr-code {
  padding: 1rem;
  background: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.thank-you-message {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a2e44;
}

/* Footer */
.pos-footer {
  background: #1a2e44;
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.footer-content {
  color: #ffffff;
}

.footer-logo {
  margin-bottom: 1rem;
}

.footer-logo-img {
  width: 60px;
  height: auto;
}

.footer-contact {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.footer-copyright {
  font-size: 0.9rem;
  opacity: 0.8;
}

.footer-social {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.social-link {
  color: #ffffff;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #34d399;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    margin-top: 2rem;
  }

  .pos-header {
    height: 240px;
  }

  .product-table {
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: none;
  }

  .product-item {
    grid-template-columns: 50px 80px 1fr;
    grid-template-rows: auto auto auto;
    gap: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .item-stt {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .item-image {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }

  .item-info {
    grid-column: 1 / 4;
    grid-row: 2 / 3;
  }

  .item-details {
    grid-column: 1 / 4;
    grid-row: 3 / 4;
    flex-direction: row;
    gap: 1.5rem;
  }

  .item-quantity {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    text-align: right;
  }

  .item-price {
    grid-column: 1 / 4;
    grid-row: 4 / 5;
    text-align: left;
    font-size: 1.1rem;
  }

  .phone-product-image {
    width: 60px;
    height: 60px;
  }

  .product-name {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .pos-container {
    margin: 0;
    border-radius: 0;
  }

  .pos-header {
    height: 200px;
  }

  .tagline {
    font-size: 1.2rem;
  }

  .product-section {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .product-count {
    font-size: 0.9rem;
  }

  .product-item {
    padding: 1rem;
  }

  .item-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .phone-product-image {
    width: 50px;
    height: 50px;
  }

  .product-name {
    font-size: 1rem;
  }

  .quantity-value,
  .price-value {
    font-size: 1rem;
  }

  .info-value.text-success {
    font-size: 1.6rem;
  }

  .qr-code {
    width: 160px;
    height: 160px;
  }

  .pos-footer {
    padding: 1.5rem;
  }

  .footer-logo-img {
    width: 50px;
  }

  .footer-contact {
    font-size: 0.9rem;
  }

  .footer-social {
    gap: 1rem;
  }

  .social-link {
    font-size: 1.3rem;
  }
}
</style>