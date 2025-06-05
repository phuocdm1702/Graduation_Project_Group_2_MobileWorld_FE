<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Chi Tiết Hóa Đơn"
      badgeText="Hệ Thống POS"
      titleColor="#002962"
      badgeClass="gradient-custom-blue"
      :backgroundOpacity="0.95"
    />

    <!-- Breadcrumb -->
    <nav class="text-gray-600 mb-4 fade-in-up">
      <ol class="d-flex gap-2">
        <li><router-link to="/hoa-don" class="hover:underline text-dark">Quản lý hóa đơn</router-link></li>
        <li>/</li>
        <li>Chi tiết</li>
      </ol>
    </nav>

    <!-- Timeline Trạng thái -->
    <div
      class="card shadow-lg mb-4 bill-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);"
    >
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Trạng thái hóa đơn</h5>
        <div class="d-flex justify-content-between align-items-center">
          <div class="flex-1 text-center">
            <div
              class="w-10 h-10 rounded-circle mx-auto gradient-custom-green text-white d-flex align-items-center justify-content-center"
            >
              1
            </div>
            <p class="mt-2 text-sm fw-medium text-dark">Đặt Hàng Thành Công</p>
            <p class="text-xs text-muted">15:45:11 - 22/01/2024</p>
          </div>
          <div class="flex-1 text-center">
            <div
              class="w-10 h-10 rounded-circle mx-auto gradient-custom-green text-white d-flex align-items-center justify-content-center"
            >
              2
            </div>
            <p class="mt-2 text-sm fw-medium text-dark">Chờ Xác Nhận</p>
            <p class="text-xs text-muted">15:45:11 - 22/01/2024</p>
          </div>
          <div class="flex-1 text-center">
            <div
              class="w-10 h-10 rounded-circle mx-auto bg-light text-muted d-flex align-items-center justify-content-center"
            >
              3
            </div>
            <p class="mt-2 text-sm fw-medium text-dark">Đang Giao</p>
            <p class="text-xs text-muted">N/A</p>
          </div>
          <div class="flex-1 text-center">
            <div
              class="w-10 h-10 rounded-circle mx-auto bg-light text-muted d-flex align-items-center justify-content-center"
            >
              4
            </div>
            <p class="mt-2 text-sm fw-medium text-dark">Hoàn Thành</p>
            <p class="text-xs text-muted">N/A</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Thông tin Đơn hàng -->
    <div
      class="card shadow-sm mb-4 customer-card"
      style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);"
    >
      <div class="card-header bg-transparent p-4">
        <h5 class="mb-0 fw-bold text-dark">Thông tin đơn hàng</h5>
      </div>
      <div class="card-body p-4">
        <div class="row g-3">
          <div class="col-md-6">
            <p><strong class="text-dark">Mã đơn:</strong> {{ invoice.ma }}</p>
            <p><strong class="text-dark">Loại đơn:</strong> {{ invoice.loaiDon }}</p>
            <p><strong class="text-dark">Trạng thái:</strong> {{ invoice.trangThai }}</p>
            <p><strong class="text-dark">Giảm giá:</strong> {{ invoice.idPhieuGiamGia?.ma }}</p>
          </div>
          <div class="col-md-6">
            <p><strong class="text-dark">Ngày đặt hàng:</strong> {{ invoice.ngayTao }}</p>
            <p><strong class="text-dark">Khách hàng:</strong> {{ invoice.idKhachHang?.ten }}</p>
            <p><strong class="text-dark">SĐT:</strong> {{ invoice.soDienThoaiKhachHang }}</p>
            <p><strong class="text-dark">Địa chỉ:</strong> {{ invoice.diaChiKhachHang }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lịch sử Thanh toán -->
    <div
      class="card shadow-sm mb-4 bill-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);"
    >
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Lịch sử thanh toán</h5>
        <DataTable
          title=""
          :headers="paymentHeaders"
          :data="payments"
          :pageSizeOptions="[5, 10]"
        >
          <template #code="{ item }">
            <span class="text-muted">{{ item.code }}</span>
          </template>
          <template #method="{ item }">
            <span class="text-muted">{{ item.method }}</span>
          </template>
          <template #amount="{ item }">
            <span class="fw-semibold" style="color: #28a745;">{{ formatPrice(item.amount) }}</span>
          </template>
          <template #note="{ item }">
            <span class="text-muted">{{ item.note }}</span>
          </template>
          <template #confirmedBy="{ item }">
            <span class="text-muted">{{ item.confirmedBy }}</span>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Danh sách Sản phẩm -->
    <div
      class="card shadow-sm mb-4 bill-card"
      style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);"
    >
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Danh sách sản phẩm</h5>
        <DataTable
          title=""
          :headers="productHeaders"
          :data="products"
          :pageSizeOptions="[5, 10]"
        >
          <template #name="{ item }">
            <span class="fw-medium" style="color: #002962;">{{ item.name }}</span>
          </template>
          <template #imei="{ item }">
            <button
              class="btn btn-sm btn-view"
              @click="showIMEIModal(item)"
            >
              <i class="bi bi-eye"></i>
            </button>
          </template>
          <template #price="{ item }">
            <span class="fw-semibold" style="color: #28a745;">{{ formatPrice(item.price) }}</span>
          </template>
          <template #actions="{ item }">
            <button
              class="btn btn-sm btn-outline-danger delete-invoice-btn"
              @click="removeProduct(item)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Tổng tiền -->
    <div
      class="card shadow-sm order-card"
      style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);"
    >
      <div class="card-body p-4">
        <h5 class="card-title mb-4 fw-bold text-dark">Tổng tiền</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <p><strong class="text-dark">Tổng tiền hàng:</strong> {{ formatPrice(totalPrice) }}</p>
            <p><strong class="text-dark">Giảm giá:</strong> {{ formatPrice(discount) }}</p>
          </div>
          <div class="col-md-6">
            <p><strong class="text-dark">Tiền phải thanh toán:</strong> {{ formatPrice(totalPrice - discount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Nút Quay lại -->
    <div class="text-end mt-4">
      <router-link
        to="/hoa-don"
        class="btn btn-light px-4 py-2 fw-semibold gradient-custom-blue text-white"
      >
        Quay lại
      </router-link>
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
              IMEI của {{ selectedProduct?.name }}
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
                v-for="imei in selectedProduct?.imei.split(', ')"
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
              <div v-if="!selectedProduct?.imei" class="text-center text-muted py-4">
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

    <NotificationModal
      ref="notificationModal"
      :type="notificationType"
      :message="notificationMessage"
      :isLoading="isNotificationLoading"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      @close="resetNotification"
    />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

// State
const invoice = ref({
  ma: 'HD001',
  loaiDon: 'Online',
  trangThai: 'Chờ xác nhận',
  idPhieuGiamGia: { ma: 'PGG001' },
  ngayTao: '22/01/2024 15:45:11',
  idKhachHang: { ten: 'Nguyễn Văn A' },
  soDienThoaiKhachHang: '0123456789',
  diaChiKhachHang: '123 Đường Láng, Hà Nội',
});
const payments = ref([
  {
    id: 1,
    code: 'TT001',
    method: 'Tiền mặt',
    amount: 10000000,
    note: 'N/A',
    confirmedBy: 'NV001',
  },
]);
const products = ref([
  {
    id: 1,
    name: 'iPhone 14 Pro',
    imei: '123456789012345',
    price: 25000000,
  },
]);
const totalPrice = ref(25000000);
const discount = ref(2500000);
// const showIMEIModal = ref(false);
const selectedProduct = ref(null);
const notificationType = ref('confirm');
const notificationMessage = ref('');
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(() => {});
const notificationOnCancel = ref(() => {});
const notificationModal = ref(null);
const toastNotification = ref(null);

// Headers
const paymentHeaders = ref([
  { text: 'Mã thanh toán', value: 'code' },
  { text: 'Phương thức', value: 'method' },
  { text: 'Số tiền', value: 'amount' },
  { text: 'Ghi chú', value: 'note' },
  { text: 'Người xác nhận', value: 'confirmedBy' },
]);
const productHeaders = ref([
  { text: 'Sản phẩm', value: 'name' },
  { text: 'IMEI', value: 'imei' },
  { text: 'Đơn giá', value: 'price' },
  { text: 'Thao tác', value: 'actions' },
]);

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const showIMEIModal = (item) => {
  selectedProduct.value = item;
  showIMEIModal.value = true;
};

const closeIMEIModal = () => {
  showIMEIModal.value = false;
  selectedProduct.value = null;
};

const deleteIMEI = (imei) => {
  toastNotification.value.addToast({
    type: 'success',
    message: `Đã xóa IMEI ${imei}`,
    duration: 3000,
  });
};

const removeProduct = (item) => {
  notificationType.value = 'confirm';
  notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${item.name}?`;
  notificationOnConfirm.value = () => {
    isNotificationLoading.value = true;
    setTimeout(() => {
      products.value = products.value.filter((p) => p.id !== item.id);
      isNotificationLoading.value = false;
      toastNotification.value.addToast({
        type: 'success',
        message: `Đã xóa sản phẩm ${item.name}`,
        duration: 3000,
      });
      resetNotification();
    }, 500);
  };
  notificationOnCancel.value = () => {};
  isNotificationLoading.value = false;
  notificationModal.value.openModal();
};

const resetNotification = () => {
  notificationType.value = 'confirm';
  notificationMessage.value = '';
  isNotificationLoading.value = false;
  notificationOnConfirm.value = () => {};
  notificationOnCancel.value = () => {};
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
.gradient-custom-green {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}
.gradient-custom-yellow {
  background: linear-gradient(135deg, #FFA000, #FFB300);
}

.bill-card,
.customer-card,
.order-card {
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

.delete-invoice-btn,
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
.delete-invoice-btn:hover,
.delete-imei-btn:hover {
  background: linear-gradient(135deg, #ff4d4f, #e63946);
  box-shadow: 0 4px 8px rgba(255, 75, 75, 0.3);
  transform: translateY(-1px);
}
.delete-invoice-btn .bi-trash,
.delete-imei-btn .bi-x-lg {
  color: #dc3545;
  font-size: 1rem;
  transition: color 0.2s ease;
}
.delete-invoice-btn:hover .bi-trash,
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
  .bill-card,
  .customer-card,
  .order-card {
    animation: fadeInUp 0.4s ease-out;
  }
}
</style>