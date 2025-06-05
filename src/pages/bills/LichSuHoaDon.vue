<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Lịch Sử Hóa Đơn"
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
        <h5 class="card-title mb-4 fw-bold text-dark">Danh sách lịch sử hóa đơn</h5>
        <DataTable
          title=""
          :headers="headers"
          :data="history"
          :pageSizeOptions="[5, 10, 20]"
        >
          <template #code="{ item }">
            <span class="fw-medium" style="color: #002962;">{{ item.code }}</span>
          </template>
          <template #invoice="{ item }">
            <span class="text-muted">{{ item.invoice }}</span>
          </template>
          <template #employee="{ item }">
            <span class="text-muted">{{ item.employee }}</span>
          </template>
          <template #action="{ item }">
            <span class="text-muted">{{ item.action }}</span>
          </template>
          <template #timestamp="{ item }">
            <span class="text-muted">{{ item.timestamp }}</span>
          </template>
        </DataTable>
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
const history = ref([
  {
    id: 1,
    code: 'LSHD001',
    invoice: 'HD001',
    employee: 'NV001',
    action: 'Tạo hóa đơn',
    timestamp: '22/01/2024 15:45:11',
  },
]);
const toastNotification = ref(null);

// Headers
const headers = ref([
  { text: 'Mã', value: 'code' },
  { text: 'Hóa đơn', value: 'invoice' },
  { text: 'Nhân viên', value: 'employee' },
  { text: 'Hành động', value: 'action' },
  { text: 'Thời gian', value: 'timestamp' },
]);
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

.gradient-custom-blue {
  background: linear-gradient(135deg, #002962, #0052cc);
}

.bill-card {
  animation: slideInLeft 0.5s ease-out;
}

.text-dark {
  color: #002962 !important;
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