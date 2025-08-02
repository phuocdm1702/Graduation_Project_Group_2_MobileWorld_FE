<template>
  <div class="giao-ca-container">
    <HeaderCard title="Giao Ca" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" :backgroundOpacity="0.95" />

    <div v-if="!authStore.isAuthenticated" class="not-logged-in">
      <FilterTableSection title="Chưa Đăng Nhập" icon="bi bi-exclamation-circle">
        <div class="p-4 text-center">
          <p class="text-muted mb-4">Vui lòng đăng nhập để bắt đầu ca làm việc.</p>
          <router-link to="/auth/login" class="btn btn-primary">Đăng Nhập</router-link>
        </div>
      </FilterTableSection>
    </div>

    <div v-else>
      <div v-if="!giaoCaStore.activeShift" class="start-shift-section">
        <FilterTableSection title="Bắt Đầu Ca Làm Việc" icon="bi bi-play-circle">
          <div class="p-4">
            <p class="text-muted mb-4">Chào mừng bạn đến với ca làm việc mới. Vui lòng nhập số tiền mặt ban đầu tại quầy để bắt đầu ca.</p>
            <div class="mb-3">
              <label for="initialCash" class="form-label fw-bold">Số tiền mặt ban đầu (VND)</label>
              <input type="number" id="initialCash" v-model.number="localInitialCash" class="form-control" placeholder="Nhập số tiền mặt" min="0">
            </div>
            <button @click="startShift" class="btn btn-primary w-100">Bắt Đầu Ca</button>
          </div>
        </FilterTableSection>
      </div>

      <div v-else class="active-shift-section">
        <FilterTableSection title="Ca Làm Việc Hiện Tại" icon="bi bi-briefcase">
          <div class="p-4">
            <p class="text-muted">Ca làm việc của bạn đã bắt đầu lúc: <strong>{{ formatDateTime(giaoCaStore.activeShift.thoiGianBatDau) }}</strong></p>
            <p class="text-muted">Số tiền mặt ban đầu: <strong>{{ formatCurrency(giaoCaStore.activeShift.tienMatBanDau) }}</strong></p>
            
            <h5 class="mt-4 mb-3 fw-bold">Thông tin ca trước (Bàn giao)</h5>
            <div v-if="giaoCaStore.activeShift.tienMatCaTruoc !== null" class="previous-shift-info">
              <p>Tiền mặt cuối ca trước: <strong>{{ formatCurrency(giaoCaStore.activeShift.tienMatCaTruoc) }}</strong></p>
              <p>Số đơn hàng chờ xử lý: <strong>{{ giaoCaStore.activeShift.donHangChoXuLyCaTruoc }}</strong></p>
            </div>
            <div class="mt-4">
              <p class="text-muted">Số hóa đơn chờ xử lý hiện tại: <strong>{{ currentPendingOrdersCount }}</strong></p>
            </div>

            <button @click="showEndShiftModal = true" class="btn btn-danger w-100 mt-4">Kết Thúc Ca</button>
          </div>
        </FilterTableSection>
      </div>

      <!-- End Shift Modal -->
      <div v-if="showEndShiftModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Kết Thúc Ca</h5>
              <button type="button" class="btn-close" @click="showEndShiftModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="finalCash" class="form-label fw-bold">Số tiền mặt cuối ca (VND)</label>
                <input type="number" id="finalCash" v-model.number="localFinalCash" class="form-control" placeholder="Nhập số tiền mặt cuối ca" min="0">
              </div>
            </div>
            <div class="modal-footer">
              <button @click="endShift" class="btn btn-primary">Xác Nhận</button>
              <button @click="showEndShiftModal = false" class="btn btn-secondary">Hủy</button>
            </div>
          </div>
        </div>
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
              <p><strong>Nhân viên:</strong> {{ giaoCaStore.reportData.idNhanVien.ten }}</p>
              <p><strong>Thời gian bắt đầu:</strong> {{ formatDateTime(giaoCaStore.reportData.thoiGianBatDau) }}</p>
              <p><strong>Thời gian kết thúc:</strong> {{ formatDateTime(giaoCaStore.reportData.thoiGianKetThuc) }}</p>
              <p><strong>Tiền mặt ban đầu:</strong> {{ formatCurrency(giaoCaStore.reportData.tienMatBanDau) }}</p>
              <p><strong>Tiền mặt cuối ca:</strong> {{ formatCurrency(giaoCaStore.reportData.tienMatCuoiCa) }}</p>
              <p><strong>Tổng tiền mặt thu được:</strong> {{ formatCurrency(giaoCaStore.reportData.tongTienMat) }}</p>
              <p><strong>Tổng tiền chuyển khoản:</strong> {{ formatCurrency(giaoCaStore.reportData.tongTienChuyenKhoan) }}</p>
              <p><strong>Tổng doanh thu ca:</strong> {{ formatCurrency(giaoCaStore.reportData.tongDoanhThu) }}</p>
              
              <h6 class="mt-4">Hóa đơn đã hoàn thành trong ca:</h6>
              <ul v-if="giaoCaStore.reportData.completedOrders && giaoCaStore.reportData.completedOrders.length">
                <li v-for="order in giaoCaStore.reportData.completedOrders" :key="order.id">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { useGiaoCaStore } from '@/store/modules/giaoCa';
import { xuatExcel, getPendingOrdersCount } from '@/services/giaoCaService';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const authStore = useAuthStore();
const router = useRouter();
const giaoCaStore = useGiaoCaStore();
const localInitialCash = ref(0);
const localFinalCash = ref(0);
const showEndShiftModal = ref(false);
const showReportModal = ref(false);
const toastNotification = ref(null);
const currentPendingOrdersCount = ref(0);
let pollingInterval = null;

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 VND';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
};

const fetchPendingOrdersCount = async () => {
  try {
    const response = await getPendingOrdersCount();
    currentPendingOrdersCount.value = response.data;
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
  }
};

const startShift = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.idNhanVien) {
    toastNotification.value.addToast({ type: 'error', message: 'Vui lòng đăng nhập trước khi bắt đầu ca.', duration: 3000 });
    router.push('/auth/login');
    return;
  }
  try {
    await giaoCaStore.startShift(authStore.user.idNhanVien, localInitialCash.value);
    toastNotification.value.addToast({ type: 'success', message: 'Bắt đầu ca làm việc thành công!', duration: 3000 });
    // Start polling after shift begins
    pollingInterval = setInterval(fetchPendingOrdersCount, 100); // Poll every 5 seconds
  } catch (error) {
    toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi bắt đầu ca làm việc.', duration: 3000 });
  }
};

const endShift = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.idNhanVien) {
    toastNotification.value.addToast({ type: 'error', message: 'Vui lòng đăng nhập trước khi kết thúc ca.', duration: 3000 });
    router.push('/auth/login');
    return;
  }
  try {
    await giaoCaStore.endShift(authStore.user.idNhanVien, localFinalCash.value);
    showEndShiftModal.value = false;
    showReportModal.value = true;
    toastNotification.value.addToast({ type: 'success', message: 'Kết thúc ca làm việc thành công!', duration: 3000 });
    // Stop polling after shift ends
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  } catch (error) {
    toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi kết thúc ca làm việc.', duration: 3000 });
  }
};

const exportReport = async () => {
  try {
    const response = await xuatExcel(giaoCaStore.reportData);

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
  giaoCaStore.resetReportData();
};

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.user?.idNhanVien) {
    toastNotification.value.addToast({ type: 'error', message: 'Vui lòng đăng nhập để tiếp tục.', duration: 3000 });
    router.push('/auth/login');
  } else {
    giaoCaStore.checkActiveShift(authStore.user.idNhanVien).then(() => {
      if (giaoCaStore.activeShift) {
        // If there's an active shift on mount, start polling
        pollingInterval = setInterval(fetchPendingOrdersCount, 100); // Poll every 5 seconds
      }
    });
  }
});

watch(() => giaoCaStore.lastEndedShiftCash, (newVal) => {
  if (newVal !== 0) {
    localInitialCash.value = newVal;
  }
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
});
</script>

<style scoped>
.giao-ca-container {
  padding: 1rem;
}

.not-logged-in, .start-shift-section, .active-shift-section {
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
