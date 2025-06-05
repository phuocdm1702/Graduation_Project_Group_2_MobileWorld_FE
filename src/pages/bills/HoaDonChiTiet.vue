<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Hóa Đơn Chi Tiết"
      badgeText="Hệ Thống POS"
      titleColor="#002962"
      badgeClass="gradient-custom-blue"
      :backgroundOpacity="0.95"
    />

    <!-- Bảng Dữ liệu -->
    <div
      class="card shadow-lg bill-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);"
    >
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Danh sách chi tiết hóa đơn</h5>
        <DataTable
          title=""
          :headers="headers"
          :data="details"
          :pageSizeOptions="[5, 10, 20]"
        >
          <template #code="{ item }">
            <span class="fw-medium" style="color: #002962;">{{ item.code }}</span>
          </template>
          <template #invoice="{ item }">
            <span class="text-muted">{{ item.invoice }}</span>
          </template>
          <template #product="{ item }">
            <span class="text-muted">{{ item.product }}</span>
          </template>
          <template #imei="{ item }">
            <button
              class="btn btn-sm btn-view"
              @click="showIMEIModal(item)"
            >
              <i class="bi bi-eye"></i>
            </button>
          </template>
          <template #total="{ item }">
            <span class="fw-semibold" style="color: #28a745;">{{ formatPrice(item.total) }}</span>
          </template>
          <template #status="{ item }">
            <span class="text-muted">{{ item.status }}</span>
          </template>
          <template #note="{ item }">
            <span class="text-muted">{{ item.note }}</span>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- IMEI Modal -->
    <div v-if="showIMEIModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div
          class="modal-content shadow-lg p-2 gradient-modal"
          style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border-radius: 12px;"
        >
          <div class="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 class="modal-title fw-bold text-dark">
              IMEI của {{ selectedDetail?.product }}
            </h5>
            <button
              class="btn btn-outline-secondary btn-close-custom"
              @click="closeIMEIModal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body p-4">
            <div class="imei-list-container">
              <div
                v-for="imei in selectedDetail?.imei.split(', ')"
                :key="imei"
                class="d-flex justify-content-between align-items-center imei-card mb-3 p-3 bg-light rounded"
              >
                <div class="d-flex align-items-center">
                  <i class="bi bi-upc-scan me-3 text-primary" style="font-size: 1.2rem;"></i>
                  <span class="text-dark fw-medium">{{ imei }}</span>
                </div>
                <button
                  class="btn btn-danger btn-sm delete-imei-btn"
                  @click="deleteIMEI(imei)"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div v-if="!selectedDetail?.imei" class="text-center text-muted py-4">
                <i class="bi bi-info-circle me-2"></i>Không có IMEI nào được chọn.
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button
              class="btn btn-light px-4 py-2 gradient-custom-blue text-white"
              @click="closeIMEIModal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

// State
const details = ref([
  {
    id: 1,
    code: 'HDCT001',
    invoice: 'HD001',
    product: 'iPhone 14 Pro',
    imei: '123456789012345',
    total: 25000000,
    status: 'Đã thanh toán',
    note: 'Không có',
  },
]);
const selectedDetail = ref(null);
const toastNotification = ref(null);

// Headers
const headers = ref([
  { text: 'Mã', value: 'code' },
  { text: 'Hóa đơn', value: 'invoice' },
  { text: 'Sản phẩm', value: 'product' },
  { text: 'IMEI', value: 'imei' },
  { text: 'Tổng tiền', value: 'total' },
  { text: 'Trạng thái', value: 'status' },
  { text: 'Ghi chú', value: 'note' },
]);

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const showIMEIModal = (item) => {
  selectedDetail.value = item;
  showIMEIModal.value = true;
};

const closeIMEIModal = () => {
  showIMEIModal.value = false;
  selectedDetail.value = null;
};

const deleteIMEI = (imei) => {
  toastNotification.value.addToast({
    type: 'success',
    message: `Đã xóa IMEI ${imei}`,
    duration: 3000,
  });
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

.gradient-custom-blue {
  background: linear-gradient(135deg, #002962, #0052cc);
}

.bill-card {
  animation: slideInLeft 0.5s ease-out;
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

.btn-view {
  border-color: #002962;
  color: #002962;
}
.btn-view:hover {
  color: #ffffff;
  background-color: #002962;
}

.delete-imei-btn {
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
.delete-imei-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  box-shadow: 0 4px 8px rgba(255, 75, 75, 0.3);
  transform: translateY(-1px);
}
.delete-imei-btn .bi-x-lg {
  color: #dc3545;
  font-size: 1rem;
  transition: color 0.2s ease;
}
.delete-imei-btn:hover .bi-x-lg {
  color: #ffffff;
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

.text-dark {
  color: #002962 !important;
}
.text-success {
  color: #28a745 !important;
}
.text-muted {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .bill-card {
    animation: fadeInUp 0.4s ease-out;
  }
}
</style>