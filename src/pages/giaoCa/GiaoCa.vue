<template>
  <div class="giao-ca-container">
    <HeaderCard title="Giao Ca" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" :backgroundOpacity="0.95" />

    <div v-if="!shiftStarted" class="start-shift-section">
      <FilterTableSection title="Bắt Đầu Ca Làm Việc" icon="bi bi-play-circle">
        <div class="p-4">
          <p class="text-muted mb-4">Chào mừng bạn đến với ca làm việc mới. Vui lòng nhập số tiền mặt ban đầu tại quầy để bắt đầu ca.</p>
          <div class="mb-3">
            <label for="initialCash" class="form-label fw-bold">Số tiền mặt ban đầu (VND)</label>
            <input type="number" id="initialCash" v-model.number="initialCash" class="form-control" placeholder="Nhập số tiền mặt" min="0">
          </div>
          <button @click="startShift" class="btn btn-primary w-100">Bắt Đầu Ca</button>
        </div>
      </FilterTableSection>
    </div>

    <div v-else class="active-shift-section">
      <FilterTableSection title="Ca Làm Việc Hiện Tại" icon="bi bi-briefcase">
        <div class="p-4">
          <p class="text-muted">Ca làm việc của bạn đã bắt đầu lúc: <strong>{{ formatDateTime(shiftStartTime) }}</strong></p>
          <p class="text-muted">Số tiền mặt ban đầu: <strong>{{ formatCurrency(initialCash) }}</strong></p>
          
          <h5 class="mt-4 mb-3 fw-bold">Thông tin ca trước (Bàn giao)</h5>
          <div v-if="previousShiftData" class="previous-shift-info">
            <p>Tiền mặt cuối ca trước: <strong>{{ formatCurrency(previousShiftData.tienMatCuoiCaTruoc) }}</strong></p>
            <p>Số đơn hàng chờ xử lý: <strong>{{ previousShiftData.donHangChoXuLy }}</strong></p>
            <!-- Add more previous shift data as needed -->
          </div>
          <div v-else>
            <p class="text-muted">Không có dữ liệu ca trước để bàn giao.</p>
          </div>

          <button @click="endShift" class="btn btn-danger w-100 mt-4">Kết Thúc Ca</button>
        </div>
      </FilterTableSection>
    </div>

    <!-- End Shift Report Modal -->
    <div v-if="showReportModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Biên Bản Giao Ca</h5>
            <button type="button" class="btn-close" @click="closeReportModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Nhân viên:</strong> {{ reportData.nhanVienId }}</p>
            <p><strong>Thời gian bắt đầu:</strong> {{ formatDateTime(reportData.thoiGianBatDau) }}</p>
            <p><strong>Thời gian kết thúc:</strong> {{ formatDateTime(reportData.thoiGianKetThuc) }}</p>
            <p><strong>Tiền mặt ban đầu:</strong> {{ formatCurrency(reportData.tienMatBanDau) }}</p>
            <p><strong>Tiền mặt cuối ca:</strong> {{ formatCurrency(reportData.tienMatCuoiCa) }}</p>
            <p><strong>Tổng tiền mặt thu được:</strong> {{ formatCurrency(reportData.tongTienMat) }}</p>
            <p><strong>Tổng tiền chuyển khoản:</strong> {{ formatCurrency(reportData.tongTienChuyenKhoan) }}</p>
            <p><strong>Tổng doanh thu ca:</strong> {{ formatCurrency(reportData.tongDoanhThu) }}</p>
            
            <h6 class="mt-4">Hóa đơn đã hoàn thành trong ca:</h6>
            <ul v-if="reportData.completedOrders && reportData.completedOrders.length">
              <li v-for="order in reportData.completedOrders" :key="order.id">
                Mã HD: {{ order.ma }}, Tổng tiền: {{ formatCurrency(order.tongTienSauGiam) }}
              </li>
            </ul>
            <p v-else>Không có hóa đơn nào được hoàn thành trong ca này.</p>
          </div>
          <div class="modal-footer">
            <button @click="exportReport" class="btn btn-success">Xuất ra Excel</button>
            <button @click="closeReportModal" class="btn btn-secondary">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const shiftStarted = ref(false);
const shiftStartTime = ref(null);
const initialCash = ref(0);
const previousShiftData = ref(null);
const showReportModal = ref(false);
const reportData = ref({});
const toastNotification = ref(null);

// Mock user ID for now, replace with actual user ID from auth store
const currentNhanVienId = 1; 

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 VND';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
};

const startShift = async () => {
  try {
    const response = await axios.post(`/api/giao-ca/bat-dau?nhanVienId=${currentNhanVienId}`);
    shiftStartTime.value = new Date(); // Set client-side start time
    previousShiftData.value = response.data;
    shiftStarted.value = true;
    toastNotification.value.addToast({ type: 'success', message: 'Bắt đầu ca làm việc thành công!', duration: 3000 });
  } catch (error) {
    console.error('Error starting shift:', error);
    toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi bắt đầu ca làm việc.', duration: 3000 });
  }
};

const endShift = async () => {
  try {
    const response = await axios.post(`/api/giao-ca/ket-thuc?nhanVienId=${currentNhanVienId}&tienMatCuoiCa=${initialCash.value}&tienMatBanDau=${initialCash.value}`);
    reportData.value = response.data;
    showReportModal.value = true;
    shiftStarted.value = false; // Reset shift status after ending
    initialCash.value = 0; // Reset initial cash
    toastNotification.value.addToast({ type: 'success', message: 'Kết thúc ca làm việc thành công!', duration: 3000 });
  } catch (error) {
    console.error('Error ending shift:', error);
    toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi kết thúc ca làm việc.', duration: 3000 });
  }
};

const exportReport = async () => {
  try {
    const response = await axios.post('/api/giao-ca/xuat-excel', reportData.value, {
      responseType: 'blob', // Important for file downloads
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BienBanGiaoCa.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toastNotification.value.addToast({ type: 'success', message: 'Xuất báo cáo Excel thành công!', duration: 3000 });
  } catch (error) {
    console.error('Error exporting report:', error);
    toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi xuất báo cáo Excel.', duration: 3000 });
  }
};

const closeReportModal = () => {
  showReportModal.value = false;
  // Optionally redirect to login or home after closing report
  // router.push('/auth/login'); 
};

onMounted(() => {
  // Check if a shift is already active (e.g., from local storage or a server check)
  // For this example, we'll assume no active shift on mount.
});
</script>

<style scoped>
.giao-ca-container {
  padding: 1rem;
}

.start-shift-section, .active-shift-section {
  max-width: 600px;
  margin: 2rem auto;
}

.form-control {
  margin-bottom: 1rem;
}

.btn-primary {
  background-color: #34d399;
  border-color: #34d399;
}

.btn-primary:hover {
  background-color: #2cb888;
  border-color: #2cb888;
}

.btn-danger {
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

.modal-content {
  border-radius: 0.5rem;
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
}

.modal-footer {
  border-top: 1px solid #e5e7eb;
}

.previous-shift-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
</style>
