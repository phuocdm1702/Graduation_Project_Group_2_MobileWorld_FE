<!-- HoTroCongNgheSac.vue - Template updated for charging technology support -->
<template>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEditMode ? 'Chỉnh Sửa Hỗ Trợ Công Nghệ Sạc' : 'Thêm Hỗ Trợ Công Nghệ Sạc Mới' }}
        </h5>
        <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm" id="chargingTechForm">
          <div class="form-grid">
            <!-- Cổng sạc -->
            <div class="form-group">
              <label class="form-label">
                Cổng Sạc <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.congSac"
                placeholder="Ví dụ: USB-C, Lightning, Micro USB" :class="{ 'is-invalid': errors.congSac }"
                @blur="validateCongSacField" @input="clearFieldError('congSac')" />
              <small class="form-hint">Nhập loại cổng sạc của thiết bị</small>
            </div>

            <!-- Công nghệ hỗ trợ -->
            <div class="form-group">
              <label class="form-label">
                Công Nghệ Hỗ Trợ <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.congNgheHoTro"
                placeholder="Ví dụ: Quick Charge 4.0, Fast Charging, Wireless Charging"
                :class="{ 'is-invalid': errors.congNgheHoTro }" @blur="validateCongNgheHoTroField"
                @input="clearFieldError('congNgheHoTro')" />
              <small class="form-hint">Nhập tên công nghệ sạc mà thiết bị hỗ trợ</small>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
        <button type="submit" form="chargingTechForm" class="btn btn-action btn-primary-custom"
          :disabled="isSubmitting">
          {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm ml-2"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Container chính -->
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Quản Lý Hỗ Trợ Công Nghệ Sạc" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input v-model.trim="keyword" @input="debouncedSearch" type="text"
                  placeholder="Tìm kiếm theo cổng sạc hoặc công nghệ hỗ trợ..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>

          <!-- Filter for Charging Port -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại Cổng Sạc</label>
              <select v-model="filters.congSacType" @change="searchHoTroCongNgheSac" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in congSacTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Charging Technology -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại Công Nghệ</label>
              <select v-model="filters.congNgheType" @change="searchHoTroCongNgheSac" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in congNgheTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Charging Speed -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Tốc Độ Sạc</label>
              <select v-model="filters.chargingSpeed" @change="searchHoTroCongNgheSac" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in chargingSpeedOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số công nghệ sạc:</span>
                  <span class="stat-value" style="color: rgb(21, 128, 61); font-weight: bold;">
                    {{ sharedFilteredItems.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-action" @click="downloadSelectedExcel" :disabled="selectedItems.length === 0"
              title="Tải danh sách Excel">
              Tải Excel
            </button>
            <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm công nghệ sạc mới">
              Thêm công nghệ sạc
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Hỗ Trợ Công Nghệ Sạc" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} công nghệ sạc</span>
        </div>
      </div>
      <div class="table-body">
        <DataTable title="" :headers="headers" :data="paginatedItems" :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
          @page-changed="handlePageChange" @items-per-page-changed="handleItemsPerPageChange">
          <template #checkbox="{ item, index }">
            <input v-if="index !== -1" type="checkbox" v-model="selectedItems" :value="item.id" />
            <input v-else type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" title="Chọn tất cả" />
          </template>
          <template #stt="{ globalIndex }">
            {{ globalIndex + 1 }}
          </template>
          <template #ma="{ item }">
            <div class="code-text">{{ item.ma }}</div>
          </template>
          <template #congSac="{ item }">
            <div class="port-badge" :class="getChargingPortClass(item)">
              <i :class="getChargingPortIcon(item)" class="me-1"></i>
              {{ item.congSac }}
            </div>
          </template>
          <template #congNgheHoTro="{ item }">
            <div class="tech-text">{{ item.congNgheHoTro }}</div>
          </template>
          <template #chargingCategory="{ item }">
            <span class="category-badge" :class="getChargingCategoryClass(item)">
              {{ getChargingCategory(item) }}
            </span>
          </template>
          <template #chargingSpeed="{ item }">
            <span class="speed-badge" :class="getChargingSpeedClass(item)">
              {{ getChargingSpeed(item) }}
            </span>
          </template>
          <template #actions="{ item }">
            <div class="action-buttons-cell">
              <button class="btn btn-sm btn-table btn-edit" @click="editItem(item)" title="Chỉnh sửa">
                <i class="bi bi-pencil-fill"></i>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </FilterTableSection>

    <!-- Modals -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<!-- Phần script cập nhật của HoTroCongNgheSac.vue -->
<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Import API services
import {
  fetchHoTroCongNgheSac,
  searchHoTroCongNgheSac as searchHoTroCongNgheSacAPI,
  createHoTroCongNgheSac,
  updateHoTroCongNgheSac,
} from "@/store/modules/products/thuocTinhSp/hoTroCongNgheSac";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "HoTroCongNgheSacManagement",
  components: {
    DataTable,
    NotificationModal,
    ToastNotification,
    HeaderCard,
    FilterTableSection,
  },
  setup() {
    const toastNotification = ref(null);
    const notificationModal = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(99999);
    const isLoading = ref(false);
    const totalElements = ref(0);
    const selectedItems = ref([]);
    const showModal = ref(false);

    // Form state
    const isEditMode = ref(false);
    const isSubmitting = ref(false);
    const formData = ref({
      id: null,
      congSac: "",
      congNgheHoTro: "",
    });
    const errors = ref({});

    // Notification state
    const notificationType = ref("confirm");
    const notificationMessage = ref("");
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => { });
    const notificationOnCancel = ref(() => { });

    // State
    const keyword = ref("");
    const filters = ref({
      congSacType: "",
      congNgheType: "",
      chargingSpeed: "",
    });

    // Data from API
    const hoTroCongNgheSacList = ref([]);
    const congSacTypeOptions = ref([]);
    const congNgheTypeOptions = ref([]);
    const chargingSpeedOptions = ref([]);

    // Headers for DataTable
    const headers = ref([
      { text: "", value: "checkbox", isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Mã", value: "ma" },
      { text: "Cổng Sạc", value: "congSac" },
      { text: "Công Nghệ Hỗ Trợ", value: "congNgheHoTro" },
      { text: "Loại", value: "chargingCategory" },
      { text: "Tốc Độ", value: "chargingSpeed" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      let filtered = hoTroCongNgheSacList.value || [];

      // Filter by charging port type
      if (filters.value.congSacType) {
        filtered = filtered.filter(item =>
          item.congSac === filters.value.congSacType
        );
      }

      // Filter by charging technology type
      if (filters.value.congNgheType) {
        filtered = filtered.filter(item =>
          getChargingCategory(item) === filters.value.congNgheType
        );
      }

      // Filter by charging speed
      if (filters.value.chargingSpeed) {
        filtered = filtered.filter(item =>
          getChargingSpeed(item) === filters.value.chargingSpeed
        );
      }

      return filtered;
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return sharedFilteredItems.value
        .slice(start, end)
        .map((item, index) => ({
          ...item,
          stt: start + index + 1,
        }));
    });

    const isAllSelected = computed(() => {
      return (
        paginatedItems.value.length > 0 &&
        paginatedItems.value.every((item) => selectedItems.value.includes(item.id))
      );
    });

    // Charging port categorization functions
    const getChargingPortIcon = (item) => {
      const port = item.congSac.toLowerCase();
      if (port.includes('usb-c') || port.includes('type-c')) return 'bi bi-usb-c';
      if (port.includes('lightning')) return 'bi bi-lightning-charge';
      if (port.includes('micro') || port.includes('micro-usb')) return 'bi bi-usb-micro';
      if (port.includes('wireless') || port.includes('không dây')) return 'bi bi-wifi';
      return 'bi bi-usb-plug';
    };

    const getChargingPortClass = (item) => {
      const port = item.congSac.toLowerCase();
      if (port.includes('usb-c') || port.includes('type-c')) return 'port-usbc';
      if (port.includes('lightning')) return 'port-lightning';
      if (port.includes('micro') || port.includes('micro-usb')) return 'port-micro';
      if (port.includes('wireless') || port.includes('không dây')) return 'port-wireless';
      return 'port-default';
    };

    // Charging technology categorization functions
    const getChargingCategory = (item) => {
      const tech = item.congNgheHoTro.toLowerCase();
      if (tech.includes('wireless') || tech.includes('không dây')) return 'Sạc không dây';
      if (tech.includes('fast') || tech.includes('quick') || tech.includes('nhanh')) return 'Sạc nhanh';
      if (tech.includes('super') || tech.includes('siêu')) return 'Sạc siêu nhanh';
      if (tech.includes('turbo') || tech.includes('tăng tốc')) return 'Sạc tăng tốc';
      return 'Sạc thường';
    };

    const getChargingSpeed = (item) => {
      const tech = item.congNgheHoTro.toLowerCase();
      if (tech.includes('120w') || tech.includes('100w') || tech.includes('siêu')) return 'Siêu nhanh (100W+)';
      if (tech.includes('67w') || tech.includes('65w') || tech.includes('50w')) return 'Rất nhanh (50-100W)';
      if (tech.includes('33w') || tech.includes('30w') || tech.includes('25w')) return 'Nhanh (25-50W)';
      if (tech.includes('18w') || tech.includes('15w') || tech.includes('quick')) return 'Trung bình (15-25W)';
      return 'Thường (<15W)';
    };

    const getChargingCategoryClass = (item) => {
      const category = getChargingCategory(item);
      switch (category) {
        case 'Sạc không dây': return 'category-wireless';
        case 'Sạc siêu nhanh': return 'category-super-fast';
        case 'Sạc nhanh': return 'category-fast';
        case 'Sạc tăng tốc': return 'category-turbo';
        default: return 'category-normal';
      }
    };

    const getChargingSpeedClass = (item) => {
      const speed = getChargingSpeed(item);
      if (speed.includes('Siêu nhanh')) return 'speed-ultra';
      if (speed.includes('Rất nhanh')) return 'speed-very-fast';
      if (speed.includes('Nhanh')) return 'speed-fast';
      if (speed.includes('Trung bình')) return 'speed-medium';
      return 'speed-normal';
    };

    // Validation methods
    const validateField = (fieldName) => {
      switch (fieldName) {
        case "congSac":
          if (!formData.value.congSac.trim()) {
            errors.value.congSac = "Cổng sạc không được để trống";
          } else if (formData.value.congSac.trim().length < 2) {
            errors.value.congSac = "Cổng sạc phải có ít nhất 2 ký tự";
          } else if (formData.value.congSac.trim().length > 50) {
            errors.value.congSac = "Cổng sạc không được vượt quá 50 ký tự";
          } else {
            delete errors.value.congSac;
          }
          break;
        case "congNgheHoTro":
          if (!formData.value.congNgheHoTro.trim()) {
            errors.value.congNgheHoTro = "Công nghệ hỗ trợ không được để trống";
          } else if (formData.value.congNgheHoTro.trim().length < 2) {
            errors.value.congNgheHoTro = "Công nghệ hỗ trợ phải có ít nhất 2 ký tự";
          } else if (formData.value.congNgheHoTro.trim().length > 100) {
            errors.value.congNgheHoTro = "Công nghệ hỗ trợ không được vượt quá 100 ký tự";
          } else {
            delete errors.value.congNgheHoTro;
          }
          break;
      }
    };

    const validateCongSacField = async () => {
      validateField('congSac');

      if (errors.value.congSac) {
        return;
      }

      const value = formData.value.congSac.trim();

      if (value.includes('  ') || value !== value.trim()) {
        errors.value.congSac = "Cổng sạc không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Cổng sạc không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const validateCongNgheHoTroField = async () => {
      validateField('congNgheHoTro');

      if (errors.value.congNgheHoTro) {
        return;
      }

      const value = formData.value.congNgheHoTro.trim();

      if (value.includes('  ') || value !== value.trim()) {
        errors.value.congNgheHoTro = "Công nghệ hỗ trợ không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ hỗ trợ không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const clearFieldError = (fieldName) => {
      if (errors.value[fieldName]) {
        delete errors.value[fieldName];
      }
    };

    const validateForm = async () => {
      errors.value = {};

      // Validate cổng sạc
      if (!formData.value.congSac.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Cổng sạc không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.congSac.trim().length < 2) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Cổng sạc phải có ít nhất 2 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.congSac.trim().length > 50) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Cổng sạc không được vượt quá 50 ký tự",
          duration: 3000,
        });
        return false;
      }

      // Validate công nghệ hỗ trợ
      if (!formData.value.congNgheHoTro.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ hỗ trợ không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.congNgheHoTro.trim().length < 2) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ hỗ trợ phải có ít nhất 2 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.congNgheHoTro.trim().length > 100) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ hỗ trợ không được vượt quá 100 ký tự",
          duration: 3000,
        });
        return false;
      }

      // Kiểm tra ký tự trống cho cổng sạc
      const congSacValue = formData.value.congSac.trim();
      if (congSacValue.includes('  ') || congSacValue !== congSacValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Cổng sạc không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      // Kiểm tra ký tự trống cho công nghệ hỗ trợ
      const congNgheHoTroValue = formData.value.congNgheHoTro.trim();
      if (congNgheHoTroValue.includes('  ') || congNgheHoTroValue !== congNgheHoTroValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ hỗ trợ không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      return true;
    };

    // API Methods
    const loadHoTroCongNgheSac = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;

        let response;
        const hasFilters = keyword.value;
        if (hasFilters) {
          response = await searchHoTroCongNgheSacAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchHoTroCongNgheSac(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          hoTroCongNgheSacList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;

          // Generate filter options from data
          generateFilterOptions();
        } else {
          hoTroCongNgheSacList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching hỗ trợ công nghệ sạc:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách hỗ trợ công nghệ sạc: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        hoTroCongNgheSacList.value = [];
        totalElements.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // Methods
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString("vi-VN");
      } catch (error) {
        return "N/A";
      }
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      loadHoTroCongNgheSac();
    }, 500);

    const generateFilterOptions = () => {
      // Generate charging port options
      const portSet = new Set();
      hoTroCongNgheSacList.value.forEach(item => {
        portSet.add(item.congSac);
      });
      congSacTypeOptions.value = Array.from(portSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate charging category options
      const categorySet = new Set();
      hoTroCongNgheSacList.value.forEach(item => {
        categorySet.add(getChargingCategory(item));
      });
      congNgheTypeOptions.value = Array.from(categorySet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate charging speed options
      const speedSet = new Set();
      hoTroCongNgheSacList.value.forEach(item => {
        speedSet.add(getChargingSpeed(item));
      });
      chargingSpeedOptions.value = Array.from(speedSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));
    };

    const searchHoTroCongNgheSac = () => {
      currentPage.value = 1;
      // Filter được xử lý trong computed property, không cần gọi API
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        congSacType: "",
        congNgheType: "",
        chargingSpeed: "",
      };
      currentPage.value = 1;
      selectedItems.value = [];
      loadHoTroCongNgheSac();

      toastNotification.value?.addToast({
        type: "info",
        message: "Đã đặt lại tất cả bộ lọc",
        duration: 2000,
      });
    };

    const openAddModal = () => {
      isEditMode.value = false;
      formData.value = {
        id: null,
        congSac: "",
        congNgheHoTro: "",
      };
      errors.value = {};
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const editItem = (item) => {
      isEditMode.value = true;
      formData.value = {
        id: item.id,
        congSac: item.congSac,
        congNgheHoTro: item.congNgheHoTro,
      };
      errors.value = {};
      showModal.value = true;
    };

    const submitForm = async () => {
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      try {
        isSubmitting.value = true;
        const data = {
          congSac: formData.value.congSac.trim(),
          congNgheHoTro: formData.value.congNgheHoTro.trim(),
        };

        // Khi edit, cần giữ nguyên mã cũ
        if (isEditMode.value) {
          const currentItem = hoTroCongNgheSacList.value.find(item => item.id === formData.value.id);
          if (currentItem) {
            data.ma = currentItem.ma;
          }
        }

        if (isEditMode.value) {
          await updateHoTroCongNgheSac(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật hỗ trợ công nghệ sạc thành công",
            duration: 3000,
          });
        } else {
          await createHoTroCongNgheSac(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm hỗ trợ công nghệ sạc thành công",
            duration: 3000,
          });
        }

        closeModal();
        await loadHoTroCongNgheSac();
      } catch (error) {
        console.error("Error submitting form:", error);
        toastNotification.value?.addToast({
          type: "error",
          message:
            "Lỗi khi lưu hỗ trợ công nghệ sạc: " +
            (error.response?.data?.error || error.response?.data?.message || error.message),
          duration: 5000,
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    const resetNotification = () => {
      notificationType.value = "confirm";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => { };
      notificationOnCancel.value = () => { };
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      // Không cần gọi loadHoTroCongNgheSac() vì pagination hoạt động trên client-side với filtered data
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      // Không cần gọi loadHoTroCongNgheSac() vì pagination hoạt động trên client-side với filtered data
    };

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = paginatedItems.value.map((item) => item.id);
      }
    };

    const downloadSelectedExcel = async () => {
      if (selectedItems.value.length === 0) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Vui lòng chọn ít nhất một hỗ trợ công nghệ sạc để tải danh sách Excel",
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = sharedFilteredItems.value.filter((item) => selectedItems.value.includes(item.id));
        const data = selectedData.map((item, index) => ({
          "STT": index + 1,
          "Mã": item.ma || "N/A",
          "Cổng Sạc": item.congSac || "N/A",
          "Công Nghệ Hỗ Trợ": item.congNgheHoTro || "N/A",
          "Loại": getChargingCategory(item),
          "Tốc Độ Sạc": getChargingSpeed(item),
          "Ngày Tạo": formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hỗ Trợ Công Nghệ Sạc");

        // Sửa lại độ rộng cột
        worksheet["!cols"] = [
          { wch: 8 }, // STT
          { wch: 8 }, // Mã
          { wch: 20 }, // Cổng Sạc
          { wch: 30 }, // Công Nghệ Hỗ Trợ
          { wch: 20 }, // Loại
          { wch: 20 }, // Tốc Độ Sạc
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "danh_sach_ho_tro_cong_nghe_sac.xlsx");

        toastNotification.value?.addToast({
          type: "success",
          message: `Đã tải xuống danh sách ${selectedItems.value.length} hỗ trợ công nghệ sạc dưới dạng Excel`,
          duration: 2000,
        });
      } catch (error) {
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải xuống danh sách Excel: " + error.message,
          duration: 3000,
        });
      }
    };

    // Watchers
    watch(keyword, debouncedSearch);

    watch(
      filters,
      () => {
        currentPage.value = 1;
        // Filter được xử lý trong computed property, không cần gọi API
      },
      { deep: true }
    );

    // Lifecycle
    onMounted(async () => {
      await loadHoTroCongNgheSac();
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      hoTroCongNgheSacList,
      congSacTypeOptions,
      congNgheTypeOptions,
      chargingSpeedOptions,
      headers,
      currentPage,
      itemsPerPage,
      isLoading,
      totalElements,
      sharedFilteredItems,
      paginatedItems,
      formatDate,
      debouncedSearch,
      generateFilterOptions,
      searchHoTroCongNgheSac,
      resetFilters,
      openAddModal,
      closeModal,
      editItem,
      submitForm,
      resetNotification,
      handlePageChange,
      handleItemsPerPageChange,
      selectedItems,
      isAllSelected,
      toggleSelectAll,
      downloadSelectedExcel,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      isEditMode,
      isSubmitting,
      formData,
      errors,
      validateForm,
      validateField,
      validateCongSacField,
      validateCongNgheHoTroField,
      clearFieldError,
      showModal,
      getChargingCategory,
      getChargingSpeed,
      getChargingCategoryClass,
      getChargingSpeedClass,
      getChargingPortIcon,
      getChargingPortClass,
    };
  },
});
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a3c34;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #1a3c34;
}

.modal-body {
  padding: 24px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a3c34;
  margin-bottom: 8px;
  display: block;
}

.required {
  color: #ef4444;
}

.form-control {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.form-control:focus,
.form-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
  outline: none;
}

.form-control.is-invalid {
  border-color: #ef4444;
  animation: shake 0.3s ease-in-out;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.form-hint {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #34d399, #059669);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #1a3c34;
  border: none;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Charging port specific badges */
.port-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.port-usbc {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.port-lightning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.port-micro {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.port-wireless {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.port-default {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

/* Charging technology specific badges */
.tech-text {
  font-weight: 500;
  color: #1f3a44;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.category-wireless {
  background: #8b5cf6;
  color: white;
}

.category-super-fast {
  background: #ef4444;
  color: white;
}

.category-fast {
  background: #f59e0b;
  color: white;
}

.category-turbo {
  background: #10b981;
  color: white;
}

.category-normal {
  background: #6b7280;
  color: white;
}

.speed-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.speed-ultra {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.speed-very-fast {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.speed-fast {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.speed-medium {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.speed-normal {
  background: #6b7280;
  color: white;
}

/* Existing styles (unchanged) */
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

.gradient-custom-teal {
  background: #34d399;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-group,
.filter-group {
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

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset,
.btn-action {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  text-decoration: none;
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
}

.btn-primary-custom {
  background: #34d399;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-primary-custom:hover {
  background: #16a34a;
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
}

.btn-action:disabled {
  background: #6c757d;
  cursor: not-allowed;
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

.date-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.code-text {
    font-weight: 500;
    color: #34d399;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.btn-table {
  color: #1f3a44;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  color: #16a34a;
  background: rgba(52, 211, 153, 0.1);
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 16px;
    max-width: calc(100% - 32px);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .filter-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .modal-content {
    padding: 16px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .form-control,
  .form-select {
    padding: 10px;
    font-size: 0.85rem;
  }

  .btn {
    padding: 10px 20px;
    font-size: 0.85rem;
  }

  .status-badge,
  .category-badge,
  .speed-badge,
  .port-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .btn-table {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
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