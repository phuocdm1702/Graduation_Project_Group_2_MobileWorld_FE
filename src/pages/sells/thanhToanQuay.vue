<template>
  <div class="container">
    <header class="header">
      <h1>Giỏ hàng của bạn</h1>
    </header>
    
    <main class="content">
      <section class="left-section">
        <DataTable
          :headers="headers"
          :data="cartItems"
          :pageSizeOptions="[5, 10, 15]"
        >
          <template v-slot:name="{ item }">
            {{ item.name }}
          </template>
          <template v-slot:imei="{ item }">
            {{ item.imei }}
          </template>
          <template v-slot:price="{ item }">
            {{ formatPrice(item.price) }}
          </template>
        </DataTable>
      </section>
      
      <aside class="right-section">
        <div class="qr-section">
          <div class="vietqr-logo">VIETQR</div>
          <div class="qr-code" ref="qrCodeContainer"></div>
          <div class="bank-logos">
            <span class="bank-logo napas">napas 24/7</span>
            <span class="bank-logo">VTPBank</span>
          </div>
        </div>
        
        <div class="summary-section">
          <div class="summary-row">
            <span>Tổng tiền:</span>
            <span>{{ formatPrice(totalAmount) }}</span>
          </div>
          <div class="summary-row discount">
            <span>Số tiền giảm giá:</span>
            <span>{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>Tổng tiền cần thanh toán:</span>
            <span>{{ formatPrice(finalAmount) }}</span>
          </div>
        </div>
        <button class="back-button" @click="$router.push('/banHang')">Quay lại màn hình bán hàng</button>
      </aside>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'

export default {
  name: 'CartComponent',
  components: {
    DataTable
  },
  setup() {
    const qrCodeContainer = ref(null)
    
    const cartItems = ref([
      {
        id: 1,
        name: 'Iphone XS Max 8 GB 128GB (Đen)',
        imei: 'IM00000071',
        price: 19000000
      },
      {
        id: 2,
        name: 'Iphone XS Max 8 GB 128GB (Đen)',
        imei: 'IM00000072',
        price: 19000000
      }
    ])

    const headers = [
      { text: 'STT', value: 'id' },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Giá bán', value: 'price' }
    ]
    
    const discountAmount = ref(500000)
    
    const totalAmount = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.price, 0)
    })
    
    const finalAmount = computed(() => {
      return totalAmount.value - discountAmount.value
    })
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price).replace('₫', 'đ')
    }
    
    const generateQRCode = () => {
      if (qrCodeContainer.value && window.qrcode) {
        const qr = window.qrcode(4, 'M')
        qr.addData(`Amount: ${finalAmount.value} VND`)
        qr.make()
        qrCodeContainer.value.innerHTML = qr.createImgTag(4, 8)
      }
    }
    
    onMounted(() => {
      setTimeout(generateQRCode, 100)
    })
    
    return {
      cartItems,
      headers,
      discountAmount,
      totalAmount,
      finalAmount,
      formatPrice,
      qrCodeContainer
    }
  }
}
</script>

<style scoped>
.container {
  padding: 0;
  border-radius: 0.5rem;
  max-width: 100%;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.header {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.025em;
}

.content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 1rem;
}

.right-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qr-section {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.vietqr-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #34d399;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.qr-code {
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  margin: 0 auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code img {
  max-width: 100%;
  max-height: 100%;
}

.bank-logos {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}

.bank-logo {
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  background: #16a34a;
  transition: transform 0.2s;
}

.bank-logo.napas {
  background: #34d399;
}

.bank-logo:hover {
  transform: translateY(-2px);
}

.summary-section {
  width: 100%;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 0.75rem 0;
  font-size: 1rem;
  color: #374151;
}

.summary-row.discount {
  color: #16a34a;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #34d399;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
}

.back-button {
  background: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
}

.back-button:hover {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>