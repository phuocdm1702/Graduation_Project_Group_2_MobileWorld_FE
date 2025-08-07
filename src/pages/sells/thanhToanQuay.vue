<template>
  <div class="checkout-display">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="invoice-header">
          <div class="invoice-title">
            <h2>THANH TOÁN QUẦY</h2>
            <div class="title-decoration"></div>
          </div>
          <div class="invoice-meta">
            <div class="meta-item">
              <span class="meta-label">Hệ thống:</span>
              <span class="meta-value">POS System</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Thời gian:</span>
              <div class="current-time">
                <i class="fas fa-clock"></i>
                <span>{{ currentTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content wrapper -->
    <div class="main-wrapper">
      <!-- Content grid -->
      <div class="content-grid">
        <!-- Thông tin hóa đơn -->
        <section class="invoice-section">
          <div class="section-title">
            <div class="title-header">
              <div class="title-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <h3>THÔNG TIN HÓA ĐƠN</h3>
            </div>
          </div>

          <div class="invoice-content">
            <div v-if="!invoice" class="no-invoice">
              <div class="no-invoice-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <p>Không có hóa đơn nào được chọn.</p>
            </div>
            
            <div v-else class="invoice-details">
              <!-- Thông tin cơ bản - New Card Style -->
              <div class="invoice-summary-card">
                <div class="card-header">
                  <div class="invoice-number">
                    <span class="label">Mã hóa đơn</span>
                    <span class="number">{{ invoice.invoiceNumber }}</span>
                  </div>
                  <div class="invoice-cashier">
                    <i class="fas fa-user-circle"></i>
                    <span>{{ invoice.cashier }}</span>
                  </div>
                </div>
                
                <div class="card-body">
                  <div class="payment-info">
                    <div class="payment-method">
                      <i class="fas fa-credit-card"></i>
                      <span class="method-text">{{ paymentMethodText }}</span>
                    </div>
                    <div class="total-amount-display">
                      <span class="amount-value">{{ formatPrice(totalPayment) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Danh sách sản phẩm -->
              <div class="products-section">
                <div class="products-header">
                  <h4>Danh sách sản phẩm</h4>
                  <span class="item-count">{{ invoice.items.length }} sản phẩm</span>
                </div>
                
                <div class="products-list">
                  <div v-for="(item, index) in invoice.items" :key="item.id" class="product-item">
                    <div class="product-index">{{ index + 1 }}</div>
                    <div class="product-image">
                      <img :src="getProductImage(item)" :alt="item.name" @error="handleImageError">
                    </div>
                    <div class="product-info">
                      <h5 class="product-name">{{ item.name }}</h5>
                      <div class="product-specs">
                        <span v-if="item.color && item.color !== 'N/A'" class="spec-tag color-tag">{{ item.color }}</span>
                        <span v-if="item.ram && item.ram !== 'N/A'" class="spec-tag ram-tag">{{ item.ram }}</span>
                        <span v-if="item.storage && item.storage !== 'N/A'" class="spec-tag storage-tag">{{ item.storage }}</span>
                      </div>
                      <div v-if="item.imei && item.imei !== 'N/A'" class="product-imei">
                        <i class="fas fa-barcode"></i>
                        <span>{{ item.imei }}</span>
                      </div>
                    </div>
                    <div class="product-price">
                      <div class="unit-price">{{ formatPrice(item.price) }}</div>
                      <div class="quantity">x{{ item.quantity }}</div>
                      <div class="total-price">{{ formatPrice(item.total) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sidebar thanh toán -->
        <aside class="payment-sidebar">
          <!-- Tóm tắt thanh toán -->
          <div class="payment-summary">
            <div class="summary-header">
              <div class="header-icon">
                <i class="fas fa-calculator"></i>
              </div>
              <h4>Tóm Tắt Thanh Toán</h4>
            </div>
            
            <div class="summary-content">
              <div v-if="!invoice" class="no-invoice-summary">
                <i class="fas fa-info-circle"></i>
                <p>Không có thông tin hóa đơn.</p>
              </div>
              
              <div v-else>
                <div class="summary-row">
                  <span class="summary-label">
                    <i class="fas fa-list"></i>
                    Tổng tiền hàng
                  </span>
                  <span class="summary-value">{{ formatPrice(totalItemsPrice) }}</span>
                </div>
                
                <div class="summary-row discount">
                  <span class="summary-label">
                    <i class="fas fa-tags"></i>
                    Giảm giá
                    <span v-if="discountInfo" class="discount-code-small">({{ discountInfo.code }})</span>
                  </span>
                  <span class="summary-value">-{{ formatPrice(invoiceStore.discountAmount) }}</span>
                </div>
                
                <div v-if="invoiceStore.shippingFee > 0" class="summary-row">
                  <span class="summary-label">
                    <i class="fas fa-truck"></i>
                    Phí vận chuyển
                  </span>
                  <span class="summary-value">{{ formatPrice(invoiceStore.shippingFee) }}</span>
                </div>
                
                <div class="total-row">
                  <span class="total-label">TỔNG THANH TOÁN:</span>
                  <span class="total-amount">{{ formatPrice(totalPayment) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VNPay QR Code Section -->
          <div v-if="shouldShowQRCode" class="qr-code-section">
            <div class="summary-header">
              <div class="header-icon">
                <i class="fas fa-qrcode"></i>
              </div>
              <h4>Thanh toán {{ paymentMethodText }}</h4>
            </div>
            
            <div class="qr-content">
              <div class="qr-code-container">
                <div class="qr-code-wrapper">
                  <qrcode 
                    :value="qrCodeValue" 
                    :size="200" 
                    level="H" 
                    :color="{ dark: '#1e40af', light: '#ffffff' }"
                    class="qr-code-image"
                  />
                  <div class="qr-overlay">
                    <div class="vnpay-logo">
                      <img src="/src/assets/img/Logo-VNPAY-QR-1.jpg" alt="VNPay" @error="handleImageError">
                    </div>
                  </div>
                </div>
                
                <div class="qr-info">
                  <div class="qr-amount">
                    <span class="amount-label">Số tiền:</span>
                    <span style="color: #059669; font-weight: 700;">{{ formatPrice(totalPayment) }}</span>
                  </div>
                  
                  <div class="qr-description">
                    <span class="desc-label">Nội dung: </span>
                    <span class="desc-value">{{ qrDescription }}</span>
                  </div>
                </div>
              </div>
              
              <div class="qr-instructions">
                <div class="instruction-step">
                  <div class="step-number">1</div>
                  <div class="step-text">Mở ứng dụng ngân hàng hoặc VNPay</div>
                </div>
                <div class="instruction-step">
                  <div class="step-number">2</div>
                  <div class="step-text">Chọn chức năng quét mã QR</div>
                </div>
                <div class="instruction-step">
                  <div class="step-number">3</div>
                  <div class="step-text">Quét mã và xác nhận thanh toán</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-logo">
            <img src="/public/images/logos/logo3.png" alt="">
          </div>
          <div class="footer-info">
            <p class="footer-highlight">MobileWorld - Hệ thống thanh toán hiện đại và chuyên nghiệp!</p>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>1800-1060</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// Chỉ phần script setup được sửa lại, template giữ nguyên
import { defineComponent, ref, computed, onMounted, onUnmounted, reactive, watch, nextTick } from "vue";
import { useInvoiceStore } from "../../store/modules/sales/invoiceStore";
import QRCode from "qrcode-vue3";

export default defineComponent({
  name: "ThanhToanQuay",
  components: {
    qrcode: QRCode,
  },
  setup() {
    const invoiceStore = useInvoiceStore();
    const currentTime = ref('');
    const timeInterval = ref(null);
    const eventListeners = ref([]);
    const isInitialized = ref(false);

    // Enhanced realtime state với reactive
    const realtimeData = reactive({
      invoice: null,
      totalItemsPrice: 0,
      totalPayment: 0,
      shouldShowQRCode: false,
      discountInfo: null,
      discountAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'waiting',
      shippingFee: 0,
      hasValidInvoice: false,
      lastUpdate: 0
    });

    // Computed properties với fallback và kiểm tra initialized
    const invoice = computed(() => {
      if (!isInitialized.value) return null;
      return realtimeData.invoice || invoiceStore.currentInvoice;
    });

    const totalItemsPrice = computed(() => {
      if (!isInitialized.value) return 0;
      return realtimeData.totalItemsPrice || invoiceStore.totalItemsPrice;
    });

    const totalPayment = computed(() => {
      if (!isInitialized.value) return 0;
      return realtimeData.totalPayment || invoiceStore.totalPayment;
    });

    const shouldShowQRCode = computed(() => {
      if (!isInitialized.value) return false;
      const hasValidInvoice = realtimeData.hasValidInvoice || invoiceStore.hasValidInvoice;
      const currentShouldShow = realtimeData.shouldShowQRCode !== undefined ? 
        realtimeData.shouldShowQRCode : invoiceStore.shouldShowQRCode;
      
      console.log('[ThanhToanQuay] shouldShowQRCode computed:', {
        hasValidInvoice,
        paymentMethod: paymentMethod.value,
        paymentStatus: paymentStatus.value,
        currentShouldShow,
        result: hasValidInvoice && currentShouldShow
      });
      
      return hasValidInvoice && currentShouldShow;
    });

    const discountInfo = computed(() => {
      if (!isInitialized.value) return null;
      return realtimeData.discountInfo || invoiceStore.discountInfo;
    });

    const discountAmount = computed(() => {
      if (!isInitialized.value) return 0;
      return realtimeData.discountAmount || invoiceStore.discountAmount;
    });

    const paymentMethod = computed(() => {
      if (!isInitialized.value) return 'cash';
      return realtimeData.paymentMethod || invoiceStore.paymentMethod;
    });

    const paymentStatus = computed(() => {
      if (!isInitialized.value) return 'waiting';
      return realtimeData.paymentStatus || invoiceStore.paymentStatus;
    });

    const shippingFee = computed(() => {
      if (!isInitialized.value) return 0;
      return realtimeData.shippingFee || invoiceStore.shippingFee;
    });

    const hasValidInvoice = computed(() => {
      if (!isInitialized.value) return false;
      return realtimeData.hasValidInvoice !== undefined ? 
        realtimeData.hasValidInvoice : invoiceStore.hasValidInvoice;
    });

    // Hiển thị text phương thức thanh toán
    const paymentMethodText = computed(() => {
      const method = paymentMethod.value;
      switch(method) {
        case 'transfer': return 'Chuyển khoản';
        case 'both': return 'Tiền mặt + Chuyển khoản';
        case 'cash':
        default: return 'Tiền mặt';
      }
    });

    // QR description
    const qrDescription = computed(() => {
      if (!invoice.value) return '';
      return `Thanh toan hoa don ${invoice.value.invoiceNumber}`;
    });

    // QR code value
    const qrCodeValue = computed(() => {
      if (!shouldShowQRCode.value) return '';
      const amount = totalPayment.value;
      const description = qrDescription.value;
      return `${amount}|${description}|VNPAY`;
    });

    // Format giá
    const formatPrice = (value) => {
      if (!value) return "0 VNĐ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    // Lấy hình ảnh sản phẩm
    const getProductImage = (item) => {
      if (item.image && item.image !== 'N/A') return item.image;
      const images = {
        'iPhone 15 Pro Max': 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg',
        'iPhone 15 Pro': 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg',
        'iPhone 15': 'https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-plus-512gb-040923-0951131.jpg',
        'AirPods Pro': 'https://cdn.tgdd.vn/Products/Images/54/289780/airpods-pro-2nd-gen-usb-c-apple-1-1.jpg',
        'MacBook': 'https://cdn.tgdd.vn/Products/Images/44/309016/macbook-air-13-inch-m3-2024-070624-105310.jpg',
      };
      
      for (const [key, image] of Object.entries(images)) {
        if (item.name && item.name.toLowerCase().includes(key.toLowerCase())) {
          return image;
        }
      }
      
      return 'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png';
    };

    const handleImageError = (event) => {
      event.target.src = 'https://bachlongstore.vn/vnt_upload/product/04_2024/Untitled_2.png';
    };

    // Enhanced update function với validation
    const updateRealtimeData = (detail = null, source = 'store') => {
      const src = detail || invoiceStore;
      const timestamp = detail?.timestamp || Date.now();
      
      // Chỉ update nếu data mới hơn hoặc chưa initialized
      if (timestamp > realtimeData.lastUpdate || !isInitialized.value) {
        realtimeData.invoice = src.currentInvoice ? { ...src.currentInvoice } : null;
        realtimeData.totalItemsPrice = src.totalItemsPrice || 0;
        realtimeData.totalPayment = src.totalPayment || 0;
        realtimeData.shouldShowQRCode = src.shouldShowQR !== undefined ? 
          src.shouldShowQR : (src.shouldShowQRCode || false);
        realtimeData.discountInfo = src.discountInfo ? { ...src.discountInfo } : null;
        realtimeData.discountAmount = src.discountAmount || 0;
        realtimeData.paymentMethod = src.paymentMethod || 'cash';
        realtimeData.paymentStatus = src.paymentStatus || 'waiting';
        realtimeData.shippingFee = src.shippingFee || 0;
        realtimeData.hasValidInvoice = src.hasValidInvoice !== undefined ? 
          src.hasValidInvoice : (src.currentInvoice && src.currentInvoice.items && src.currentInvoice.items.length > 0);
        realtimeData.lastUpdate = timestamp;
        
        // Đặt initialized = true sau khi cập nhật lần đầu
        if (!isInitialized.value) {
          isInitialized.value = true;
        }
        
        console.log(`[ThanhToanQuay] Updated from ${source}:`, {
          invoice: realtimeData.invoice?.invoiceNumber,
          totalPayment: realtimeData.totalPayment,
          paymentMethod: realtimeData.paymentMethod,
          paymentStatus: realtimeData.paymentStatus,
          discountAmount: realtimeData.discountAmount,
          discountInfo: realtimeData.discountInfo,
          shouldShowQRCode: realtimeData.shouldShowQRCode,
          hasValidInvoice: realtimeData.hasValidInvoice,
          timestamp
        });

        // Force reactive update
        nextTick(() => {
          console.log('[ThanhToanQuay] Reactive update completed');
        });
      }
    };

    // Event handlers với logging
    const handleStoreUpdate = (event) => {
      console.log(`[ThanhToanQuay] Received event: ${event.type} at ${Date.now()}`, event.detail);
      updateRealtimeData(event.detail, `event-${event.type}`);
    };

    // Setup event listeners
    const setupEventListeners = () => {
      const events = [
        'invoiceUpdated', 
        'paymentMethodUpdated', 
        'paymentMethodChanged',
        'paymentStatusUpdated',
        'paymentStatusChanged',
        'discountUpdated', 
        'discountChanged',
        'discountRemoved', 
        'itemAdded', 
        'itemRemoved', 
        'itemUpdated',
        'invoiceCleared', 
        'storeUpdated', 
        'storeSynced', 
        'storeInitialized', 
        'shippingUpdated',
        'shippingChanged',
        'forceUpdate'
      ];

      events.forEach((eventName) => {
        const handler = (event) => {
          handleStoreUpdate(event);
        };
        window.addEventListener(eventName, handler);
        eventListeners.value.push({ name: eventName, handler });
        console.log(`[ThanhToanQuay] Listening to event: ${eventName}`);
      });

      // Setup storage listener
      const cleanupStorage = invoiceStore.setupStorageListener();
      if (cleanupStorage) {
        eventListeners.value.push({ name: 'storage', handler: cleanupStorage });
      }
    };

    const removeEventListeners = () => {
      eventListeners.value.forEach(({ name, handler }) => {
        if (name === 'storage' && typeof handler === 'function') {
          handler(); // cleanup function
        } else {
          window.removeEventListener(name, handler);
        }
        console.log(`[ThanhToanQuay] Removed listener: ${name}`);
      });
      eventListeners.value = [];
    };

    // Force refresh data từ store
    const refreshData = () => {
      console.log('[ThanhToanQuay] Force refreshing data...');
      invoiceStore.forceUpdate();
      updateRealtimeData({
        currentInvoice: invoiceStore.currentInvoice,
        totalItemsPrice: invoiceStore.totalItemsPrice,
        totalPayment: invoiceStore.totalPayment,
        shouldShowQRCode: invoiceStore.shouldShowQRCode,
        discountInfo: invoiceStore.discountInfo,
        discountAmount: invoiceStore.discountAmount,
        paymentMethod: invoiceStore.paymentMethod,
        paymentStatus: invoiceStore.paymentStatus,
        shippingFee: invoiceStore.shippingFee,
        hasValidInvoice: invoiceStore.hasValidInvoice,
        timestamp: Date.now()
      }, 'force-refresh');
    };

    // Đồng hồ
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    // Watch với kiểm tra thay đổi
    watch(() => invoiceStore.paymentMethod, (newMethod, oldMethod) => {
      if (newMethod !== oldMethod && isInitialized.value) {
        console.log('[ThanhToanQuay] Store paymentMethod changed:', newMethod);
        realtimeData.paymentMethod = newMethod;
        
        // Cập nhật shouldShowQRCode ngay lập tức
        nextTick(() => {
          realtimeData.shouldShowQRCode = invoiceStore.shouldShowQRCode;
        });
      }
    });

    watch(() => invoiceStore.paymentStatus, (newStatus, oldStatus) => {
      if (newStatus !== oldStatus && isInitialized.value) {
        console.log('[ThanhToanQuay] Store paymentStatus changed:', newStatus);
        realtimeData.paymentStatus = newStatus;
        
        // Cập nhật shouldShowQRCode ngay lập tức
        nextTick(() => {
          realtimeData.shouldShowQRCode = invoiceStore.shouldShowQRCode;
        });
      }
    });

    watch(() => invoiceStore.discountInfo, (newInfo, oldInfo) => {
      if (JSON.stringify(newInfo) !== JSON.stringify(oldInfo) && isInitialized.value) {
        console.log('[ThanhToanQuay] Store discountInfo changed:', newInfo);
        realtimeData.discountInfo = newInfo;
      }
    });

    watch(() => invoiceStore.discountAmount, (newAmount, oldAmount) => {
      if (newAmount !== oldAmount && isInitialized.value) {
        console.log('[ThanhToanQuay] Store discountAmount changed:', newAmount);
        realtimeData.discountAmount = newAmount;
      }
    });

    watch(() => invoiceStore.totalPayment, (newTotal, oldTotal) => {
      if (newTotal !== oldTotal && isInitialized.value) {
        console.log('[ThanhToanQuay] Store totalPayment changed:', newTotal);
        realtimeData.totalPayment = newTotal;
      }
    });

    watch(() => invoiceStore.shouldShowQRCode, (newValue, oldValue) => {
      if (newValue !== oldValue && isInitialized.value) {
        console.log('[ThanhToanQuay] Store shouldShowQRCode changed:', newValue);
        realtimeData.shouldShowQRCode = newValue;
      }
    });

    watch(() => invoiceStore.hasValidInvoice, (newValue, oldValue) => {
      if (newValue !== oldValue && isInitialized.value) {
        console.log('[ThanhToanQuay] Store hasValidInvoice changed:', newValue);
        realtimeData.hasValidInvoice = newValue;
      }
    });

    // Lifecycle
    onMounted(() => {
      console.log('[ThanhToanQuay] Component mounted');
      
      // Initialize store
      invoiceStore.initializeFromStorage();
      
      // Wait a bit for store to initialize
      setTimeout(() => {
        // Initial data update
        updateRealtimeData({
          currentInvoice: invoiceStore.currentInvoice,
          totalItemsPrice: invoiceStore.totalItemsPrice,
          totalPayment: invoiceStore.totalPayment,
          shouldShowQRCode: invoiceStore.shouldShowQRCode,
          discountInfo: invoiceStore.discountInfo,
          discountAmount: invoiceStore.discountAmount,
          paymentMethod: invoiceStore.paymentMethod,
          paymentStatus: invoiceStore.paymentStatus,
          shippingFee: invoiceStore.shippingFee,
          hasValidInvoice: invoiceStore.hasValidInvoice,
          timestamp: Date.now()
        }, 'initial');
        
        // Setup time
        updateTime();
        timeInterval.value = setInterval(updateTime, 1000);
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('[ThanhToanQuay] Initial state:', {
          invoice: invoice.value,
          paymentMethod: paymentMethod.value,
          paymentStatus: paymentStatus.value,
          discountInfo: discountInfo.value,
          totalPayment: totalPayment.value,
          shouldShowQRCode: shouldShowQRCode.value,
          hasValidInvoice: hasValidInvoice.value,
          isInitialized: isInitialized.value
        });
      }, 100);
    });

    onUnmounted(() => {
      console.log('[ThanhToanQuay] Component unmounted');
      if (timeInterval.value) clearInterval(timeInterval.value);
      removeEventListeners();
    });

    return {
      invoiceStore,
      currentTime,
      invoice,
      totalItemsPrice,
      totalPayment,
      shouldShowQRCode,
      discountInfo,
      discountAmount,
      paymentMethod,
      paymentStatus,
      shippingFee,
      hasValidInvoice,
      paymentMethodText,
      qrDescription,
      qrCodeValue,
      formatPrice,
      getProductImage,
      handleImageError,
      refreshData,
      realtimeData, // Expose để debug
      isInitialized, // Expose để debug
    };
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.checkout-display {
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.08);
}

/* Header */
.header {
  background: #1e293b;
  color: white;
  padding: 1rem 1rem 2rem;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
}

.header-content {
  position: relative;
  z-index: 1;
}

.invoice-header {
  text-align: center;
}

.invoice-title {
  position: relative;
  margin-bottom: 2rem;
}

.invoice-title h2 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
}

.title-decoration {
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  margin: 0 auto;
  border-radius: 2px;
}

.invoice-meta {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.meta-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fbbf24;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.current-time i {
  font-size: 1.1rem;
  color: #fbbf24;
}

/* Main wrapper */
.main-wrapper {
  padding: 1.5rem;
  background: #f8fafc;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Section titles */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.title-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.section-title h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

/* Invoice section */
.invoice-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.invoice-section .section-title {
  padding: 2rem 2rem 0;
  margin-bottom: 2rem;
}

.invoice-content {
  padding: 0 2rem 2rem;
}

.no-invoice {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.no-invoice-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.no-invoice p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* New Invoice Summary Card */
.invoice-summary-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-number {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-number .label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.invoice-number .number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
  font-family: 'Courier New', monospace;
}

.invoice-cashier {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.invoice-cashier i {
  font-size: 1.5rem;
  color: #22c55e;
}

.card-body {
  padding: 1.5rem;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border: 2px solid #16a34a;
  flex: 1;
}

.payment-method i {
  font-size: 1.25rem;
  color: #16a34a;
}

.method-text {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.total-amount-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 900;
  color: #059669;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border: 2px solid #16a34a;
}

/* Products section */
.products-section {
  margin-top: 1rem;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.products-header h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.item-count {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-index {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.product-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.product-specs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.spec-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.color-tag {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.ram-tag {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.storage-tag {
  background: linear-gradient(135deg, #10b981, #059669);
}

.product-imei {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #059669;
  font-weight: 600;
}

.product-imei i {
  color: #059669;
}

.product-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  text-align: right;
}

.unit-price {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.quantity {
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: 700;
}

.total-price {
  font-size: 1rem;
  font-weight: 800;
  color: #059669;
}

/* Payment sidebar */
.payment-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.payment-summary {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.summary-header {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.summary-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #16a34a, #22c55e, #34d399);
}

.header-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.summary-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.summary-content {
  padding: 0rem 2rem;
}

.no-invoice-summary {
  text-align: center;
  color: #64748b;
  padding: 2rem 0;
}

.no-invoice-summary i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #94a3b8;
}

.no-invoice-summary p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-label i {
  color: #16a34a;
  font-size: 0.9rem;
  width: 16px;
}

.discount-code-small {
  font-size: 0.8rem;
  color: #dc2626;
  font-weight: 700;
}

.summary-value {
  font-weight: 700;
  color: #1e293b;
}

.summary-row.discount .summary-value {
  color: #dc2626;
  font-weight: 800;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  margin-top: 1rem;
  border-top: 3px solid #16a34a;
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  margin-left: -2rem;
  margin-right: -2rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.total-label {
  color: #1e293b;
  font-size: 1rem;
}

.total-amount {
  color: #059669;
  font-size: 1.2rem;
  font-weight: 900;
}

/* VNPay QR Code Section */
.qr-code-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.qr-header {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.qr-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #16a34a, #22c55e, #34d399);
}

.qr-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.qr-content {
  padding: 1rem;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.qr-code-wrapper {
  position: relative;
  background: white;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: 3px solid #059669;
}

.qr-code-image {
  display: block;
  border-radius: 10px;
}

.qr-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  pointer-events: none;
}

.vnpay-logo {
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.vnpay-logo img {
  width: 100px;
  height: auto;
}

.qr-info {
  width: 100%;
  text-align: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid #3b82f6;
}

.qr-amount,
.qr-description {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.qr-amount:last-child,
.qr-description:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.amount-label,
.desc-label {
  font-weight: 600;
  color: #1e40af;
  font-size: 0.9rem;
}

.amount-value {
  font-weight: 800;
  color: #059669;
  font-size: 1.1rem;
}

.desc-value {
  font-weight: 700;
  color: #1e293b;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.qr-instructions {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.instruction-step:last-child {
  border-bottom: none;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-text {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
}

/* Footer */
.footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
  color: white;
  padding: 3rem 2rem 2rem;
  margin-top: 3rem;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E") repeat;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.footer-main {
  display: flex;
  align-items: flex-start;
  gap: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
}

.footer-logo img {
  width: 130px;
}

.footer-logo i {
  font-size: 2rem;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-highlight {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.contact-item i {
  color: #16a34a;
  font-size: 1rem;
  width: 20px;
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.product-item {
  animation: slideInUp 0.5s ease-out forwards;
  opacity: 0;
  animation-fill-mode: both;
}

.product-item:nth-child(1) {
  animation-delay: 0.1s;
}

.product-item:nth-child(2) {
  animation-delay: 0.2s;
}

.product-item:nth-child(3) {
  animation-delay: 0.3s;
}

.product-item:nth-child(4) {
  animation-delay: 0.4s;
}

.invoice-summary-card {
  animation: fadeInScale 0.6s ease-out forwards;
  opacity: 0;
  animation-fill-mode: both;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .payment-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .checkout-display {
    margin: 0;
    border-radius: 0;
  }

  .header {
    padding: 1.5rem 1rem 2rem;
  }

  .invoice-title h2 {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .title-decoration {
    width: 150px;
  }

  .invoice-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .main-wrapper {
    padding: 1rem;
  }

  /* Mobile invoice summary card */
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .payment-info {
    flex-direction: column;
    gap: 1rem;
  }

  .payment-method {
    justify-content: center;
  }

  .total-amount-display {
    align-items: center;
  }

  /* Mobile product items */
  .product-item {
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
  }

  .product-image {
    order: -1;
  }

  .product-info {
    order: 0;
  }

  .product-price {
    order: 1;
    align-items: center;
  }

  .product-index {
    order: -2;
  }

  /* Mobile QR code */
  .qr-code-wrapper {
    padding: 0.75rem;
  }

  .qr-code-image {
    width: 180px !important;
    height: 180px !important;
  }

  .qr-info {
    padding: 1rem;
  }

  .qr-amount,
  .qr-description {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .instruction-step {
    gap: 0.75rem;
  }

  .step-text {
    font-size: 0.85rem;
  }

  /* Mobile footer */
  .footer {
    padding: 2rem 1rem 1.5rem;
  }

  .footer-main {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .footer-logo {
    font-size: 1.3rem;
  }

  .footer-logo i {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .invoice-title h2 {
    font-size: 1.8rem;
  }

  .section-title h3 {
    font-size: 1.1rem;
  }

  .summary-header,
  .qr-header,
  .invoice-section .section-title {
    padding: 1rem;
  }

  .summary-content,
  .qr-content,
  .invoice-content {
    padding: 1rem;
  }

  .total-amount {
    font-size: 1.1rem;
  }

  .amount-value {
    font-size: 1.2rem;
  }

  .invoice-number .number {
    font-size: 1.2rem;
  }

  .qr-code-image {
    width: 160px !important;
    height: 160px !important;
  }

  .products-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

/* Print Styles */
@media print {
  .checkout-display {
    box-shadow: none;
    max-width: none;
  }

  .qr-code-section {
    display: none;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}

/* Loading states */
.product-item.loading {
  opacity: 0.6;
  pointer-events: none;
}

.invoice-summary-card.loading {
  opacity: 0.6;
}

/* Hover effects */
.invoice-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.qr-code-wrapper:hover {
  transform: scale(1.02);
  transition: all 0.3s ease;
}
</style>