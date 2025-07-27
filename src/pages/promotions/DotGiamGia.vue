<template>
  <div class="container-fluid py-4">
    <HeaderCard title="Quản Lý Đợt Giảm Giá" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

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
                <input type="text" class="form-control search-input" style="padding-left: 2.5rem;"
                  placeholder="Mã đợt, tên đợt..." v-model="searchQuery"
                  @input="debouncedSearch($event.target.value)" />
              </div>
            </div>
          </div>

          <!-- Type Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại giảm giá</label>
              <select v-model="filterType" class="form-select search-input">
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
              <select v-model="filterStatus" class="form-select search-input">
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

          <!-- Sale Value Range Slider -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Giá trị giảm (%)</label>
              <div class="slider-container">
                <div class="slider-track"></div>
                <div class="slider-range" :style="{
                  left: `${(saleValueMin / maxGiaTriGiamGia) * 100}%`,
                  width: `${((saleValueMax - saleValueMin) / maxGiaTriGiamGia) * 100}%`
                }"></div>
                <div class="slider-thumb" :style="{ left: `${(saleValueMin / maxGiaTriGiamGia) * 100}%` }"
                  @mousedown="(e) => startDrag('saleValueMin', e)"></div>
                <div class="slider-thumb" :style="{ left: `${(saleValueMax / maxGiaTriGiamGia) * 100}%` }"
                  @mousedown="(e) => startDrag('saleValueMax', e)"></div>
                <input type="range" v-model.number="saleValueMin" :min="0" :max="saleValueMax"
                  class="absolute opacity-0 w-full h-full" />
                <input type="range" v-model.number="saleValueMax" :min="saleValueMin" :max="maxGiaTriGiamGia"
                  class="absolute opacity-0 w-full h-full" />
              </div>
              <div class="d-flex justify-content-between text-sm text-gray-600 mt-1">
                <span>{{ saleValueMin }}%</span>
                <span>{{ saleValueMax }}%</span>
              </div>
            </div>
          </div>

          <!-- Min Order Range Slider -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Số tiền giảm tối đa (VND)</label>
              <div class="slider-container">
                <div class="slider-track"></div>
                <div class="slider-range" :style="{
                  left: `${(minOrderMin / maxSoTienGiamToiDa) * 100}%`,
                  width: `${((minOrderMax - minOrderMin) / maxSoTienGiamToiDa) * 100}%`
                }"></div>
                <div class="slider-thumb" :style="{ left: `${(minOrderMin / maxSoTienGiamToiDa) * 100}%` }"
                  @mousedown="(e) => startDrag('minOrderMin', e)"></div>
                <div class="slider-thumb" :style="{ left: `${(minOrderMax / maxSoTienGiamToiDa) * 100}%` }"
                  @mousedown="(e) => startDrag('minOrderMax', e)"></div>
                <input type="range" v-model.number="minOrderMin" :min="0" :max="minOrderMax"
                  class="absolute opacity-0 w-full h-full" @change="fetchMaxValues" />
                <input type="range" v-model.number="minOrderMax" :min="minOrderMin" :max="maxSoTienGiamToiDa"
                  class="absolute opacity-0 w-full h-full" @change="fetchMaxValues" />
              </div>
              <div class="d-flex justify-content-between text-sm text-gray-600 mt-1">
                <span>{{ formatPrice(minOrderMin) }}</span>
                <span>{{ formatPrice(minOrderMax) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions mt-4 d-flex flex-wrap gap-2 justify-content-end">
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportExcel">
              Xuất Excel
            </button>
            <router-link to="/dotGiamGia/form" class="btn btn-action">
              Thêm Đợt Giảm Giá
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Đợt Giảm Giá" icon="bi bi-table">
      <DataTable :headers="headers" :data="dataTable" :page-size-options="[5, 10, 15, 20]">
        <template #stt="{ globalIndex }">
          {{ globalIndex + 1 }}
        </template>
        <template #ma="{ item }">
          {{ item.ma }}
        </template>
        <template #tenDot="{ item }">
          {{ item.tenDotGiamGia }}
        </template>
        <template #giaTriGiamGia="{ item }">
          {{ item.giaTriGiamGia }}%
          <div v-if="item.soTienGiamToiDa" class="text-muted">Số tiền giảm tối đa: {{ formatPrice(item.soTienGiamToiDa)
            }}</div>
        </template>
        <template #loaiGiamGiaApDung="{ item }">
          <span class="status-badge" :class="item.loaiGiamGiaApDung === 'Tiền mặt' ? 'badge-cash' : 'badge-percent'">
            {{ item.loaiGiamGiaApDung }}
          </span>
        </template>
        <template #trangThaiFormatted="{ item }">
          <span class="status-badge" :class="getStatusBadgeClass(item.trangThaiFormatted)">
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
          <div class="action-buttons-cell d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-table" @click="viewUpdate(item)" title="Chỉnh sửa">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-sm btn-table" @click="showDeleteConfirm(item.id)" title="Xóa">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </FilterTableSection>

    <ToastNotification ref="toast" />
    <NotificationModal ref="notificationModal" :type="modalType" :message="confirmMessage" :confirmText="'Xác nhận'"
      :onConfirm="executeConfirmedAction" :onCancel="closeConfirmModal" :isLoading="isLoading" />
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
  maxGiaTriGiamGia,
  maxSoTienGiamToiDa,
  saleValueMin,
  saleValueMax,
  minOrderMin,
  minOrderMax,
  isDraggingMinOrder
} = useDiscountManagement();

const notificationModal = ref(null);
const modalType = ref('confirm');
const isLoading = ref(false);

const headers = ref([
  { text: 'STT', value: 'stt' },
  { text: 'Mã đợt', value: 'ma' },
  { text: 'Tên đợt', value: 'tenDot' },
  { text: 'Giá Trị', value: 'giaTriGiamGia' },
  { text: 'Loại Phiếu', value: 'loaiGiamGiaApDung' },
  { text: 'Trạng Thái', value: 'trangThaiFormatted' },
  { text: 'Ngày Bắt Đầu', value: 'ngayBatDau' },
  { text: 'Ngày Kết Thúc', value: 'ngayKetThuc' },
  { text: 'Hành Động', value: 'actions' },
]);

// Hàm xử lý kéo thả cho thanh trượt
const startDrag = (type, event) => {
  const slider = event.target.closest('.slider-container');
  const updateValue = (e) => {
    const rect = slider.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;

    if (type === 'saleValueMin') {
      const newValue = Math.round(pos * maxGiaTriGiamGia.value);
      if (newValue < saleValueMax.value) {
        saleValueMin.value = Math.max(0, newValue);
      }
      updateSaleValueMin();
    } else if (type === 'saleValueMax') {
      const newValue = Math.round(pos * maxGiaTriGiamGia.value);
      if (newValue > saleValueMin.value) {
        saleValueMax.value = Math.min(maxGiaTriGiamGia.value, newValue);
      }
      updateSaleValueMax();
    } else if (type === 'minOrderMin') {
      const newValue = Math.round(pos * maxSoTienGiamToiDa.value);
      if (newValue < minOrderMax.value) {
        minOrderMin.value = Math.max(0, newValue);
      }
      updateMinOrderMin();
    } else if (type === 'minOrderMax') {
      const newValue = Math.round(pos * maxSoTienGiamToiDa.value);
      if (newValue > minOrderMin.value) {
        minOrderMax.value = Math.min(maxSoTienGiamToiDa.value, newValue);
      }
      updateMinOrderMax();
    }
  };

  const stopDrag = () => {
    document.removeEventListener('mousemove', updateValue);
    document.removeEventListener('mouseup', stopDrag);
    if (type.includes('minOrder')) {
      isDraggingMinOrder.value = false;
      fetchData();
    }
  };

  document.addEventListener('mousemove', updateValue);
  document.addEventListener('mouseup', stopDrag);
};

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
  saleValue.value = null;
  saleValueMin.value = 0;
  saleValueMax.value = maxGiaTriGiamGia.value;
  minOrder.value = null;
  minOrderMin.value = 0;
  minOrderMax.value = maxSoTienGiamToiDa.value;
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

.search-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.date-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
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
  justify-content: center;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.badge-cash {
  border: 1px solid #34d399;
  color: #34d399;
  background: transparent;
}

.badge-percent {
  border: 1px solid #059669;
  color: #059669;
  background: transparent;
}

.badge-active {
  background: #28a745;
  border: 1px solid #28a745;
  color: white;
}

.badge-pending {
  background: #f59e0b;
  border: 1px solid #f59e0b;
  color: white;
}

.badge-inactive {
  background: #dc3545;
  border: 1px solid #dc3545;
  color: white;
}

/* Range Slider Styles */
.slider-container {
  position: relative;
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
}

.slider-track {
  height: 4px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: absolute;
}

.slider-range {
  height: 4px;
  background-color: #34d399;
  border-radius: 2px;
  position: absolute;
}

.slider-thumb {
  width: 18px;
  height: 18px;
  background-color: #34d399;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.action-buttons-cell {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>