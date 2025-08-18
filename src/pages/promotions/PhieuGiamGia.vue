<template>
  <div class="container-fluid py-4 voucher-management">
    <HeaderCard
      title="Quản Lý Phiếu Giảm Giá"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-3 align-items-end flex-wrap">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm phiếu</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  style="padding-left: 2.5rem"
                  placeholder="Mã phiếu, tên phiếu..."
                  v-model="searchQuery"
                  @input="debouncedSearch($event.target.value)"
                />
              </div>
            </div>
          </div>

          <!-- Type Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại phiếu</label>
              <select v-model="filterType" class="form-select search-input">
                <option value="">Tất cả loại phiếu</option>
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
                <option value="Hoạt động">Đang diễn ra</option>
                <option value="Không hoạt động">Không hoạt động</option>
                <option value="Chưa diễn ra">Chưa diễn ra</option>
              </select>
            </div>
          </div>

          <!-- Date Range Picker -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian</label>
              <div class="date-range-wrapper">
                <input
                  type="date"
                  v-model="startDate"
                  class="form-control date-input"
                  placeholder="Từ ngày"
                />
                <span class="date-separator">đến</span>
                <input
                  type="date"
                  v-model="endDate"
                  class="form-control date-input"
                  placeholder="Đến ngày"
                />
              </div>
            </div>
          </div>

          <!-- Value Range Slider -->
          <div class="col-lg-8 col-md-6">
            <div class="filter-group">
              <div class="price-range-container">
                <label class="filter-label">Giá trị phiếu</label>
                <div class="dual-range-slider">
                  <div class="slider-track">
                    <div class="slider-range" :style="sliderRangeStyle"></div>
                  </div>
                  <input
                    type="range"
                    v-model.number="rangeMin"
                    :min="minVoucherValue"
                    :max="maxVoucherValue"
                    class="range-slider"
                    style="z-index: 2"
                    @input="updateRangeMax"
                  />
                  <input
                    type="range"
                    v-model.number="rangeMax"
                    :min="minVoucherValue"
                    :max="maxVoucherValue"
                    class="range-slider"
                    style="z-index: 1"
                    @input="updateRangeMin"
                  />
                </div>
                <div class="range-labels d-flex justify-content-between">
                  <span>{{ formatPrice(rangeMin) }}</span>
                  <span>{{ formatPrice(rangeMax) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="filter-actions mt-4 d-flex flex-wrap gap-2 justify-content-end"
        >
          <button class="btn btn-reset" @click="resetFilters">
            Đặt lại bộ lọc
          </button>
          <button class="btn btn-action" @click="exportExcel">
            Xuất Excel
          </button>
          <router-link to="/phieuGiamGia/form" class="btn btn-action">
            Thêm Phiếu Giảm Giá
          </router-link>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Phiếu Giảm Giá" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count"
            >{{ filteredVouchers.length }} phiếu giảm giá</span
          >
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <DataTable
          :headers="headers"
          :data="filteredVouchers"
          :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
        >
          <template #stt="{ globalIndex }">
            {{ globalIndex + 1 }}
          </template>
          <template #code="{ item }">
            <div class="code-cell">
              <span class="code-text">{{ item.code }}</span>
              <small class="code-date">{{ item.startDate }}</small>
            </div>
          </template>
          <template #value="{ item }">
            <div class="amount-cell">
              <div class="total-amount">
                {{
                  item.type === "Phần trăm"
                    ? `${item.value}%`
                    : formatPrice(item.value)
                }}
              </div>
              <div class="discount-info" v-if="item.minOrder > 0">
                <small class="text-muted"
                  >Đơn tối thiểu: {{ formatPrice(item.minOrder) }}</small
                >
              </div>
            </div>
          </template>
          <template #type="{ item }">
            <span class="type-badge" :class="getTypeBadgeClass(item.type)">
              {{ item.type }}
            </span>
          </template>
          <template #status="{ item }">
            <span
              class="status-badge"
              :class="getStatusBadgeClass(item.status)"
            >
              {{ item.status }}
            </span>
          </template>
          <template #count="{ item }">
            <span>{{ item.count }}</span>
          </template>
          <template #startDate="{ item }">
            <span>{{ item.startDate }}</span>
          </template>
          <template #expiryDate="{ item }">
            <span>{{ item.expiryDate }}</span>
          </template>
          <template #actions="{ item }">
            <div class="action-buttons-cell d-flex gap-2">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="item.status === 'Đang diễn ra'"
                  @change="toggleVoucherStatus(item)"
                />
                <span class="slider round"></span>
              </label>
              <button
                class="btn btn-sm btn-table"
                @click="editVoucher(item)"
                title="Chỉnh sửa"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </FilterTableSection>

    <!-- Modals -->
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

<script>
import { ref, computed, watch } from "vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import {
  fetchVouchers,
  searchVouchers,
  filterByLoaiPhieu,
  filterByTrangThai,
  filterByDateRange,
  filterByMinOrder,
  filterByValue,
  filterVouchers,
  updateVoucherStatus,
} from "../../store/modules/promotions/phieuGiamGia";

export default {
  name: "VoucherManagement",
  components: {
    HeaderCard,
    FilterTableSection,
    DataTable,
    NotificationModal,
    ToastNotification,
  },
  setup() {
    const router = useRouter();

    // Data
    const vouchers = ref([]);
    const searchQuery = ref("");
    const filterType = ref("");
    const filterStatus = ref("");
    const startDate = ref("");
    const endDate = ref("");
    const rangeMin = ref(0);
    const rangeMax = ref(5000000);
    const minVoucherValue = 0;
    const maxVoucherValue = 5000000;
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);

    // Computed
    const filteredVouchers = computed(() => {
      return vouchers.value.map((voucher) => ({
        id: voucher.id,
        code: voucher.ma,
        value:
          voucher.loaiPhieuGiamGia === "Phần trăm"
            ? voucher.phanTramGiamGia
            : voucher.soTienGiamToiDa,
        minOrder: voucher.hoaDonToiThieu,
        type: voucher.loaiPhieuGiamGia,
        status: getStatus(voucher),
        startDate: formatDate(voucher.ngayBatDau),
        expiryDate: formatDate(voucher.ngayKetThuc),
        count: voucher.soLuongDung,
      }));
    });

    const sliderRangeStyle = computed(() => {
      const percent1 =
        ((rangeMin.value - minVoucherValue) /
          (maxVoucherValue - minVoucherValue)) *
        100;
      const percent2 =
        ((rangeMax.value - minVoucherValue) /
          (maxVoucherValue - minVoucherValue)) *
        100;
      return {
        left: `${percent1}%`,
        width: `${percent2 - percent1}%`,
      };
    });

    const headers = [
      { text: "STT", value: "stt" },
      { text: "Mã Phiếu", value: "code" },
      { text: "Giá Trị", value: "value" },
      { text: "Số lượng", value: "count" },
      { text: "Loại Phiếu", value: "type" },
      { text: "Trạng Thái", value: "status" },
      { text: "Ngày Bắt Đầu", value: "startDate" },
      { text: "Ngày Kết Thúc", value: "expiryDate" },
      { text: "Hành Động", value: "actions" },
    ];

    // Methods
    const formatPrice = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const getStatus = (voucher) => {
      const now = new Date();
      const startDate = new Date(voucher.ngayBatDau);
      const endDate = new Date(voucher.ngayKetThuc);

      if (!voucher.trangThai) {
        return "Không hoạt động";
      }
      if (startDate > now) {
        return "Chưa diễn ra";
      }
      if (endDate < now) {
        return "Không hoạt động";
      }
      return "Đang diễn ra";
    };

    const loadVouchers = async () => {
      try {
        const response = await fetchVouchers(
          currentPage.value - 1,
          pageSize.value
        );
        vouchers.value = response.data.content;
        totalItems.value = response.data.totalElements;
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách phiếu giảm giá!",
        });
      }
    };

    const debouncedSearch = debounce(async (value) => {
      searchQuery.value = value;
      if (value.trim()) {
        try {
          const response = await searchVouchers(
            value,
            currentPage.value - 1,
            pageSize.value
          );
          vouchers.value = response.data.content;
          totalItems.value = response.data.totalElements;
        } catch (error) {
          toastNotification.value.addToast({
            type: "error",
            message: "Lỗi khi tìm kiếm phiếu giảm giá!",
          });
        }
      } else {
        loadVouchers();
      }
    }, 300);

    const applyFilters = async () => {
      try {
        let response;
        const filters = {
          loaiPhieuGiamGia: filterType.value,
          trangThai: filterStatus.value,
          startDate: startDate.value,
          endDate: endDate.value,
          minOrder: rangeMin.value,
          valueFilter: rangeMax.value,
        };

        // Nếu không có bộ lọc nào được áp dụng, gọi API lấy tất cả
        if (
          !filterType.value &&
          !filterStatus.value &&
          !startDate.value &&
          !endDate.value &&
          rangeMin.value === minVoucherValue &&
          rangeMax.value === maxVoucherValue
        ) {
          response = await fetchVouchers(currentPage.value - 1, pageSize.value);
        } else if (filterStatus.value) {
          response = await filterByTrangThai(
            filterStatus.value,
            currentPage.value - 1,
            pageSize.value
          );
        } else if (filterType.value) {
          response = await filterByLoaiPhieu(
            filterType.value,
            currentPage.value - 1,
            pageSize.value
          );
        } else if (startDate.value || endDate.value) {
          response = await filterByDateRange(
            startDate.value,
            endDate.value,
            currentPage.value - 1,
            pageSize.value
          );
        } else if (rangeMin.value !== minVoucherValue) {
          response = await filterByMinOrder(
            rangeMin.value,
            currentPage.value - 1,
            pageSize.value
          );
        } else if (rangeMax.value !== maxVoucherValue) {
          response = await filterByValue(
            rangeMax.value,
            currentPage.value - 1,
            pageSize.value
          );
        } else {
          response = await filterVouchers(
            filters,
            currentPage.value - 1,
            pageSize.value
          );
        }

        vouchers.value = response.data.content;
        totalItems.value = response.data.totalElements;
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: `Lỗi khi lọc phiếu giảm giá: ${
            error.response?.data || error.message
          }`,
        });
      }
    };

    const resetFilters = () => {
      searchQuery.value = "";
      filterType.value = "";
      filterStatus.value = "";
      startDate.value = "";
      endDate.value = "";
      rangeMin.value = minVoucherValue;
      rangeMax.value = maxVoucherValue;
      currentPage.value = 1;
      loadVouchers(); // Gọi hàm tải tất cả phiếu giảm giá
    };

    const exportExcel = () => {
      toastNotification.value.addToast({
        type: "success",
        message: "Xuất Excel thành công!",
      });
    };

    const editVoucher = (voucher) => {
      router.push(`/phieuGiamGia/form/${voucher.id}`);
    };

    const toggleVoucherStatus = async (voucher) => {
      const newStatus = voucher.status === "Đang diễn ra" ? false : true;
      try {
        await updateVoucherStatus(voucher.id, newStatus);
        toastNotification.value.addToast({
          type: "info",
          message: `Phiếu ${voucher.code} đã được ${
            newStatus ? "kích hoạt" : "tắt"
          }`,
        });
        loadVouchers();
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: "Lỗi khi cập nhật trạng thái!",
        });
      }
    };

    const updateRangeMin = () => {
      if (rangeMin.value > rangeMax.value) {
        rangeMin.value = rangeMax.value;
      }
    };

    const updateRangeMax = () => {
      if (rangeMax.value < rangeMin.value) {
        rangeMax.value = rangeMin.value;
      }
    };

    const notificationModal = ref(null);
    const toastNotification = ref(null);
    const notificationType = ref("");
    const notificationMessage = ref("");
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => resetNotification());

    const resetNotification = () => {
      notificationType.value = "";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => resetNotification();
    };

    const getTypeBadgeClass = (type) => {
      return "badge-info";
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "Đang diễn ra":
          return "badge-completed";
        case "Chưa diễn ra":
          return "badge-waiting";
        default:
          return "badge-canceled";
      }
    };

    // Watchers
    watch(
      [
        searchQuery,
        filterType,
        filterStatus,
        startDate,
        endDate,
        rangeMin,
        rangeMax,
      ],
      () => {
        currentPage.value = 1;
        applyFilters();
      }
    );

    watch(currentPage, () => {
      if (searchQuery.value.trim()) {
        debouncedSearch(searchQuery.value);
      } else {
        applyFilters();
      }
    });

    // Initial load
    loadVouchers();

    return {
      vouchers,
      searchQuery,
      filterType,
      filterStatus,
      startDate,
      endDate,
      rangeMin,
      rangeMax,
      minVoucherValue,
      maxVoucherValue,
      currentPage,
      pageSize,
      filteredVouchers,
      sliderRangeStyle,
      headers,
      formatPrice,
      debouncedSearch,
      updateRangeMin,
      updateRangeMax,
      resetFilters,
      exportExcel,
      editVoucher,
      toggleVoucherStatus,
      notificationModal,
      toastNotification,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      resetNotification,
      getTypeBadgeClass,
      getStatusBadgeClass,
    };
  },
};
</script>

<style scoped>
/* Removed card view and table-controls related styles */
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
  0%,
  100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.voucher-management {
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

.price-range-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0.5rem;
}

.dual-range-slider {
  position: relative;
  width: 100%;
  height: 20px;
  margin: 0.5rem 0;
}

.slider-track {
  position: absolute;
  top: 7px;
  width: 100%;
  max-width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
}

.slider-range {
  position: absolute;
  height: 6px;
  background: #34d399;
  border-radius: 3px;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  top: 7px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #34d399;
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.range-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #34d399;
  cursor: pointer;
  pointer-events: auto;
  border: none;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
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

.date-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  flex: 1;
  min-width: 0;
}

.search-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
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

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #34d399;
}

.code-date {
  font-size: 0.75rem;
  color: #6c757d;
}

.amount-cell {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.total-amount {
  font-weight: 600;
  color: #16a34a !important;
}

.discount-info {
  font-size: 0.75rem;
  color: #6c757d;
}

.type-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  align-items: center;
}

.badge-info {
  background: #f8f9fa;
  color: #1f3a44;
  border: 1px solid #34d399;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.badge-completed {
  background: #16a34a;
  color: white;
}

.badge-waiting {
  background: #34d399;
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

/* Responsive */
.row.g-3 {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.row.g-3 > [class*="col-"] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (max-width: 992px) {
  .date-range-wrapper {
    flex-direction: column;
    gap: 0.75rem;
  }

  .date-separator {
    display: none;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .row.g-3 {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }

  .row.g-3 > [class*="col-"] {
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

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
