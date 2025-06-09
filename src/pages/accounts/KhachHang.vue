<template>
  <div class="container-fluid py-4 customer-management">
    <HeaderCard title="Quản Lý Khách Hàng" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3 animate__animated animate__fadeInUp">
        <div class="row g-4 align-items-end">
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" class="form-control search-input" placeholder="Mã, tên, email, SĐT..."
                  :value="keyword" @input="debouncedSearch($event.target.value)" />
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Giới tính</label>
              <select class="form-control date-input" v-model="genderFilter">
                <option value="tat-ca">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng thái</label>
              <select class="form-control date-input" v-model="statusFilter">
                <option value="tat-ca">Tất cả</option>
                <option value="Kích hoạt">Kích hoạt</option>
                <option value="Hủy kích hoạt">Hủy kích hoạt</option>
              </select>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12" style="display: flex; align-items: center;">
              <div class="filter-stats">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số khách hàng:</span>
                  <span class="stat-value" style="color: #15803d; font-weight: bold;">{{ filteredCustomers.length
                    }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <router-link to="/khachHang/form" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i>
              Thêm Khách Hàng
            </router-link>
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất Excel
            </button>
            <label for="import-excel" class="btn btn-action cursor-pointer">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Nhập từ Excel
              <input id="import-excel" type="file" accept=".xlsx, .xls" class="d-none" @change="handleExcelUpload" />
            </label>
            <button class="btn btn-action" @click="downloadTemplate">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Tải mẫu Excel
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Khách Hàng" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredCustomers.length }} khách hàng</span>
        </div>
        <div class="table-controls">
          <div class="view-toggle">
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'table', 'btn-outline-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'">
              <i class="bi bi-table"></i>
            </button>
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'card', 'btn-outline-secondary': viewMode !== 'card' }"
              @click="viewMode = 'card'">
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="animate__animated animate__zoomIn">
          <DataTable :headers="headers" :data="filteredCustomers" :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]">
            <template #stt="{ item, index }">
              {{ index + 1 }}
            </template>
            <template #ma="{ item }">
              <div class="code-cell">
                <span class="code-text">{{ item.ma }}</span>
              </div>
            </template>
            <template #ten="{ item }">
              <div class="customer-cell">
                <div class="customer-name">{{ item.ten }}</div>
                <div class="customer-phone">{{ item.soDienThoai }}</div>
              </div>
            </template>
            <template #trangThai="{ item }">
              <span class="status-badge" :class="getStatusBadgeClass(item.trangThai)">
                <i :class="getStatusIcon(item.trangThai)" class="me-1"></i>
                {{ item.trangThai }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="action-buttons-cell d-flex gap-2">
                <label class="switch">
                  <input type="checkbox" :checked="item.trangThai === 'Kích hoạt'"
                    @change="toggleCustomerStatus(item)" />
                  <span class="slider round"></span>
                </label>
                <button class="btn btn-sm btn-table" @click="editCustomer(item)" title="Chỉnh sửa">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="confirmDeleteCustomer(item)" title="Xóa">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else class="card-grid animate__animated animate__zoomIn">
          <div v-for="customer in paginatedCustomers" :key="customer.ma" class="customer-card">
            <div class="invoice-card-header">
              <div class="invoice-code">{{ customer.ma }}</div>
              <span class="status-badge" :class="getStatusBadgeClass(customer.trangThai)">
                {{ customer.trangThai }}
              </span>
            </div>
            <div class="invoice-card-body">
              <div class="customer-info">
                <div class="customer-name">{{ customer.ten }}</div>
                <div class="customer-phone">{{ customer.soDienThoai }}</div>
              </div>
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ customer.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ngày sinh:</span>
                  <span class="detail-value">{{ customer.ngaySinh }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Giới tính:</span>
                  <span class="detail-value">{{ customer.gioiTinh }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Địa chỉ:</span>
                  <span class="detail-value">{{ customer.diaChi }}</span>
                </div>
              </div>
            </div>
            <div class="invoice-card-actions">
              <label class="switch">
                <input type="checkbox" :checked="customer.trangThai === 'Kích hoạt'"
                  @change="toggleCustomerStatus(customer)" />
                <span class="slider round"></span>
              </label>
              <button class="btn btn-sm btn-table" @click="editCustomer(customer)">
                <i class="bi bi-pen-fill me-1"></i> Sửa
              </button>
              <button class="btn btn-sm btn-table" @click="confirmDeleteCustomer(customer)">
                <i class="bi bi-trash-fill me-1"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination for Card View -->
        <div v-if="viewMode === 'card'" class="card-pagination">
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </FilterTableSection>

    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash';
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";

const router = useRouter();
const keyword = ref('');
const genderFilter = ref('tat-ca');
const statusFilter = ref('tat-ca');
const viewMode = ref('table');
const currentPage = ref(1);
const pageSize = ref(10);
const notificationType = ref('');
const notificationMessage = ref('');
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(null);
const notificationOnCancel = ref(null);
const notificationModal = ref(null);
const toastNotification = ref(null);

const customers = ref([
  { ma: 'KH001', ten: 'Nguyễn Thị C', email: 'ntc@example.com', soDienThoai: '0123456789', ngaySinh: '1992-03-03', gioiTinh: 'Nữ', diaChi: 'Hà Nội', trangThai: 'Kích hoạt' },
  { ma: 'KH002', ten: 'Trần Văn D', email: 'tvd@example.com', soDienThoai: '0987654321', ngaySinh: '1990-04-04', gioiTinh: 'Nam', diaChi: 'TP.HCM', trangThai: 'Hủy kích hoạt' },
]);

const filteredCustomers = computed(() => {
  return customers.value.filter(customer => {
    const searchText = keyword.value.toLowerCase();
    const matchesSearch = (
      customer.ma.toLowerCase().includes(searchText) ||
      customer.ten.toLowerCase().includes(searchText) ||
      customer.email.toLowerCase().includes(searchText) ||
      customer.soDienThoai.includes(searchText)
    );
    const matchesStatus = statusFilter.value === 'tat-ca' || customer.trangThai === statusFilter.value;
    const matchesGender = genderFilter.value === 'tat-ca' || customer.gioiTinh === genderFilter.value;
    return matchesSearch && matchesStatus && matchesGender;
  });
});

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value));

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCustomers.value.slice(start, start + pageSize.value);
});

const headers = [
  { value: 'stt', text: 'STT' },
  { value: 'ma', text: 'Mã Khách Hàng' },
  { value: 'ten', text: 'Tên Khách Hàng' },
  { value: 'email', text: 'Email' },
  { value: 'soDienThoai', text: 'Số Điện Thoại' },
  { value: 'ngaySinh', text: 'Ngày Sinh' },
  { value: 'gioiTinh', text: 'Giới Tính' },
  { value: 'diaChi', text: 'Địa Chỉ' },
  { value: 'trangThai', text: 'Trạng Thái' },
  { value: 'actions', text: 'Hành Động' },
];

const debouncedSearch = debounce((value) => {
  keyword.value = value;
  currentPage.value = 1;
}, 300);

const resetFilters = () => {
  keyword.value = '';
  genderFilter.value = 'tat-ca';
  statusFilter.value = 'tat-ca';
  currentPage.value = 1;
};

const getStatusBadgeClass = (status) => {
  return {
    'badge-waiting': status === 'Kích hoạt',
    'badge-canceled': status === 'Hủy kích hoạt',
  };
};

const getStatusIcon = (status) => {
  return {
    'bi bi-check-circle': status === 'Kích hoạt',
    'bi bi-x-circle': status === 'Hủy kích hoạt',
  };
};

const editCustomer = (customer) => {
  router.push(`/khachHang/form/${customer.id}`);
};

const confirmDeleteCustomer = (customer) => {
  notificationMessage.value = `Bạn có chắc chắn muốn xóa khách hàng ${customer.ten}?`;
  notificationType.value = 'confirm';
  notificationOnConfirm.value = () => deleteCustomer(customer);
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const deleteCustomer = (customer) => {
  customers.value = customers.value.filter(c => c.ma !== customer.ma);
  toastNotification.value.addToast({
    type: 'success',
    message: 'Xóa khách hàng thành công!',
  });
  resetNotification();
};

const toggleCustomerStatus = (customer) => {
  const newStatus = customer.trangThai === 'Kích hoạt' ? 'Hủy kích hoạt' : 'Kích hoạt';
  customers.value = customers.value.map(c =>
    c.ma === customer.ma ? { ...c, trangThai: newStatus } : c
  );
  toastNotification.value.addToast({
    type: 'info',
    message: `Khách hàng ${customer.ten} đã được ${newStatus === 'Kích hoạt' ? 'kích hoạt' : 'hủy kích hoạt'}`,
  });
};

const resetNotification = () => {
  notificationMessage.value = '';
  notificationType.value = '';
  notificationOnConfirm.value = null;
  notificationOnCancel.value = null;
};

const exportExcel = () => {
  toastNotification.value.addToast({
    type: 'success',
    message: 'Xuất Excel thành công!',
  });
};

const downloadTemplate = () => {
  toastNotification.value.addToast({
    type: 'success',
    message: 'Tải template Excel thành công!',
  });
};

const handleExcelUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    toastNotification.value.addToast({
      type: 'success',
      message: 'Nhập dữ liệu từ Excel thành công!',
    });
  }
};
</script>

<style scoped>
/* Animations */
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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gentleGlow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }

  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
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

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.customer-management {
  min-height: 100vh;
  padding: 1rem;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-group {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-input,
.date-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
  flex: 1;
  min-width: 0;
}

.search-input:focus,
.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: space-between;
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-reset,
.btn-action {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background:  #34d399;
  color: white;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(45, 212, 191, 0.1);
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-count {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.view-toggle .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-toggle .btn-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border: none;
}

.view-toggle .btn-primary:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.view-toggle .btn-outline-secondary {
  border: 1px solid rgba(45, 212, 191, 0.2);
  color: #1f3a44;
}

.view-toggle .btn-outline-secondary:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #34d399;
}

.customer-cell {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.75rem;
  color: #6c757d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  width: 130px;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  align-items: center;
}

.badge-waiting {
  background: #34d399;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.card-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.customer-card {
  background: #f8f9fa;
  border: 1px solid rgba(45, 212, 191, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.customer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(45, 212, 191, 0.2);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(45, 212, 191, 0.1);
}

.invoice-code {
  font-weight: 600;
  color: #34d399;
}

.invoice-card-body {
  padding: 1rem;
}

.customer-info {
  margin-bottom: 1rem;
}

.customer-name {
  font-weight: 600;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.875rem;
  color: #6c757d;
}

.invoice-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
  color: #1f3a44;
}

.invoice-card-actions {
  padding: 1rem;
  border-top: 1px solid rgba(45, 212, 191, 0.1);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.card-pagination {
  padding: 1.5rem;
}

.page-item .page-link {
  border-radius: 8px;
  margin: 0 0.25rem;
  color: #1f3a44;
  border: 1px solid rgba(45, 212, 191, 0.2);
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-color: #34d399;
  color: white;
}

.page-item:not(.disabled) .page-link:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  border-color: #16a34a;
  color: white;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: rgba(52, 211, 153, 0.2);
  color: #6c757d;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #34d399;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

@media (max-width: 992px) {
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .row.g-4 {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }

  .row.g-4>[class*="col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .filter-label {
    font-size: 0.8rem;
  }

  .search-input,
  .date-input {
    font-size: 0.85rem;
    padding: 0.5rem 0.5rem 0.5rem 2rem;
  }

  .search-icon {
    left: 0.75rem;
  }
}

@media (max-width: 576px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>