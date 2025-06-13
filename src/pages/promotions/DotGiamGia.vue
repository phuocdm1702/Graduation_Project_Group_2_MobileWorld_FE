<template>
  <div class="container-fluid py-4 sale-management">
    <HeaderCard title="Quản Lý Đợt Giảm Giá" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-3 align-items-end flex-wrap">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm đợt giảm giá</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" class="form-control search-input" placeholder="Mã đợt, tên đợt..." v-model="searchQuery" @input="debouncedSearch($event.target.value)" />
              </div>
            </div>
          </div>

          <!-- Type Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại giảm giá</label>
              <select v-model="filterType" class="form-control date-input">
                <option value="">Tất cả loại giảm giá</option>
                <option value="Phần trăm">Phần trăm</option>
                <option value="Tiền mặt">Tiền mặt</option>
              </select>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng thái</label>
              <select v-model="filterStatus" class="form-control date-input">
                <option value="">Tất cả trạng thái</option>
                <option value="0">Đang diễn ra</option>
                <option value="1">Sắp diễn ra</option>
                <option value="deleted">Đã kết thúc</option>
              </select>
            </div>
          </div>

          <!-- Date Range Picker -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian</label>
              <div class="date-range-wrapper">
                <input type="date" v-model="startDate" class="form-control date-input" placeholder="Từ ngày" />
                <span class="date-separator">đến</span>
                <input type="date" v-model="endDate" class="form-control date-input" placeholder="Đến ngày" />
              </div>
            </div>
          </div>

          <!-- Sale Value Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Giá trị giảm (%)</label>
              <input
                  v-model="saleValue"
                  type="number"
                  class="form-control date-input"
                  placeholder="Nhập giá trị giảm (VD: 5.00)"
                  step="0.01"
              />
            </div>
          </div>

          <!-- Min Order Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Số tiền giảm tối đa (VND)</label>
              <input
                  v-model="formattedMinOrder"
                  type="text"
                  class="form-control date-input"
                  placeholder="Nhập số tiền (VD: 1.000.000)"
                  @input="formatMinOrder"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions mt-4 d-flex flex-wrap gap-2 justify-content-end">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i> Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i> Xuất Excel
            </button>
            <router-link to="/dotGiamGia/form" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i> Thêm Đợt Giảm Giá
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Đợt Giảm Giá" icon="bi bi-table">
      <DataTable
          :title="'Danh Sách Đợt Giảm Giá'"
          :headers="headers"
          :data="dataTable"
          :page-size-options="[5, 10, 15, 20]"
      >
        <template #stt="{ index }">
          {{ ((Number(currentPage.value) || 0) * (Number(pageSize.value) || 10)) + index + 1 }}
        </template>
        <template #tenDot="{ item }">
          {{ item.tenDotGiamGia }}
        </template>
        <template #giaTriGiamGia="{ item }">
          {{ item.giaTriGiamGia }}%
          <div v-if="item.soTienGiamToiDa" class="text-muted">Số tiền giảm tối đa: {{ formatPrice(item.soTienGiamToiDa) }}</div>
        </template>
        <template #loaiGiamGiaApDung="{ item }">
          <span class="badge" :class="item.loaiGiamGiaApDung === 'Tiền mặt' ? 'badge-cash' : 'badge-percent'">
            {{ item.loaiGiamGiaApDung }}
          </span>
        </template>
        <template #trangThaiFormatted="{ item }">
          <span class="status-badge" :class="getStatusBadgeClass(item.trangThaiFormatted)">
            <i :class="getStatusIcon(item.trangThaiFormatted)" class="me-1"></i>
            {{ item.trangThaiFormatted }}
          </span>
        </template>
        <template #ngayBatDau="{ item }">
          {{ item.ngayBatDau }}
        </template>
        <template #ngayKetThuc="{ item }">
          {{ item.ngayKetThuc }}
        </template>
        <template #actions="{ item }">
          <div class="action-buttons-cell d-flex gap-2">
            <button class="btn btn-success btn-sm btn-table" @click="viewUpdate(item)" title="Chỉnh sửa">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button
                class="btn btn-danger btn-sm btn-table"
                @click="showDeleteConfirm(item.id)"
                title="Xóa"
            >
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </FilterTableSection>

    <ToastNotification ref="toast" />
    <NotificationModal
        ref="notificationModal"
        :type="modalType"
        :message="confirmMessage"
        :confirmText="'Xác nhận'"
        :onConfirm="executeConfirmedAction"
        :onCancel="closeConfirmModal"
        :isLoading="isLoading"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from "@/components/common/NotificationModal.vue";
import { useDiscountManagement } from '@/store/modules/promotions/dotGiamGia.js';

const {
  confirmMessage,
  executeConfirmedAction,
  closeConfirmModal,
  currentPage,
  pageSize,
  totalPages,
  searchQuery,
  filterType,
  filterStatus,
  startDate,
  endDate,
  minOrder,
  saleValue,
  deleted,
  dataTable,
  fetchData,
  toggleSaleStatus,
  exportExcel,
  toast,
  deleteDotGiamGia,
  viewUpdate,
} = useDiscountManagement();

const notificationModal = ref(null);
const modalType = ref('confirm');
const isLoading = ref(false);

const headers = ref([
  { text: 'STT', value: 'stt' },
  { text: 'Tên đợt', value: 'tenDot' },
  { text: 'Giá Trị', value: 'giaTriGiamGia' },
  { text: 'Loại Phiếu', value: 'loaiGiamGiaApDung' },
  { text: 'Trạng Thái', value: 'trangThaiFormatted' },
  { text: 'Ngày Bắt Đầu', value: 'ngayBatDau' },
  { text: 'Ngày Kết Thúc', value: 'ngayKetThuc' },
  { text: 'Hành Động', value: 'actions' },
]);

// Format minOrder input
const formattedMinOrder = ref('');
const formatMinOrder = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '');
  minOrder.value = value ? parseInt(value) : null;
  formattedMinOrder.value = value ? new Intl.NumberFormat('vi-VN').format(value) : '';
};

// Initialize formattedMinOrder if minOrder has a value
watch(minOrder, (newValue) => {
  formattedMinOrder.value = newValue ? new Intl.NumberFormat('vi-VN').format(newValue) : '';
}, { immediate: true });

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const debouncedSearch = debounce((value) => {
  searchQuery.value = value;
  fetchData();
}, 300);

const resetFilters = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterStatus.value = '';
  startDate.value = '';
  endDate.value = '';
  saleValue.value = '';
  minOrder.value = null;
  formattedMinOrder.value = '';
  deleted.value = '';
  currentPage.value = 0;
  fetchData();
};

const showDeleteConfirm = (id) => {
  confirmMessage.value = 'Bạn có chắc chắn muốn xóa đợt giảm giá này?';
  modalType.value = 'confirm';
  executeConfirmedAction.value = async () => {
    isLoading.value = true;
    try {
      await deleteDotGiamGia(id);
      notificationModal.value.closeModal();
    } finally {
      isLoading.value = false;
    }
  };
  notificationModal.value.openModal();
};

const getStatusBadgeClass = (status) => {
  const statusText = status.replace(/<[^>]+>/g, '');
  switch (statusText) {
    case 'Đang diễn ra':
      return 'badge-active';
    case 'Sắp diễn ra':
      return 'badge-pending';
    case 'Đã kết thúc':
      return 'badge-inactive';
    default:
      return '';
  }
};

const getStatusIcon = (status) => {
  const statusText = status.replace(/<[^>]+>/g, '');
  switch (statusText) {
    case 'Đang diễn ra':
      return 'bi-check-circle';
    case 'Sắp diễn ra':
      return 'bi-hourglass-split';
    case 'Đã kết thúc':
      return 'bi-x-circle';
    default:
      return '';
  }
};

watch([searchQuery, filterType, filterStatus, startDate, endDate, saleValue, minOrder], () => {
  currentPage.value = 0;
  fetchData();
});
</script>

<style scoped>
.sale-management {
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

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-separator {
  color: #1f3a44;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
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
  background: #34d399;
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

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-cash {
  background: #34d399;
  color: white;
}

.badge-percent {
  background: #a3e4db;
  color: #1f3a44;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-active {
  background: #28a745;
  color: white;
}

.badge-pending {
  background: #17a2b8;
  color: white;
}

.badge-inactive {
  background: #dc3545;
  color: white;
}
</style>