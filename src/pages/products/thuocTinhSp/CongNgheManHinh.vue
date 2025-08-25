<!-- CongNgheManHinh.vue - Fixed Version -->
<template>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEditMode ? 'Chỉnh Sửa Công Nghệ Màn Hình' : 'Thêm Công Nghệ Màn Hình Mới' }}
        </h5>
        <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm" id="congNgheManHinhForm">
          <div class="form-grid">
            <!-- Công nghệ màn hình -->
            <div class="form-group full-width">
              <label class="form-label">
                Công Nghệ Màn Hình <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.congNgheManHinh"
                placeholder="Ví dụ: OLED, LCD, AMOLED" :class="{ 'is-invalid': errors.congNgheManHinh }"
                @blur="validateCongNgheManHinhField" @input="clearFieldError('congNgheManHinh')" />
            </div>
            
            <!-- Chuẩn màn hình -->
            <div class="form-group">
              <label class="form-label">
                Chuẩn Màn Hình <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.chuanManHinh"
                placeholder="Ví dụ: HDR10+, DCI-P3" :class="{ 'is-invalid': errors.chuanManHinh }"
                @blur="validateChuanManHinhField" @input="clearFieldError('chuanManHinh')" />
            </div>

            <!-- Kích thước -->
            <div class="form-group">
              <label class="form-label">
                Kích Thước (inch) <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.kichThuoc"
                placeholder="Ví dụ: 6.7" :class="{ 'is-invalid': errors.kichThuoc }"
                @blur="validateKichThuocField" @input="clearFieldError('kichThuoc')" />
            </div>

            <!-- Độ phân giải -->
            <div class="form-group">
              <label class="form-label">
                Độ Phân Giải <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.doPhanGiai"
                placeholder="Ví dụ: 1080 x 2400" :class="{ 'is-invalid': errors.doPhanGiai }"
                @blur="validateDoPhanGiaiField" @input="clearFieldError('doPhanGiai')" />
            </div>

            <!-- Độ sáng tối đa -->
            <div class="form-group">
              <label class="form-label">
                Độ Sáng Tối Đa (nits) <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.doSangToiDa"
                placeholder="Ví dụ: 1200" :class="{ 'is-invalid': errors.doSangToiDa }"
                @blur="validateDoSangToiDaField" @input="clearFieldError('doSangToiDa')" />
            </div>

            <!-- Tần số quét -->
            <div class="form-group">
              <label class="form-label">
                Tần Số Quét (Hz) <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.tanSoQuet"
                placeholder="Ví dụ: 120" :class="{ 'is-invalid': errors.tanSoQuet }"
                @blur="validateTanSoQuetField" @input="clearFieldError('tanSoQuet')" />
            </div>

            <!-- Kiểu màn hình -->
            <div class="form-group">
              <label class="form-label">
                Kiểu Màn Hình <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.kieuManHinh"
                placeholder="Ví dụ: Cong, Phẳng, Notch" :class="{ 'is-invalid': errors.kieuManHinh }"
                @blur="validateKieuManHinhField" @input="clearFieldError('kieuManHinh')" />
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
        <button type="submit" form="congNgheManHinhForm" class="btn btn-action btn-primary-custom"
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
    <HeaderCard title="Quản Lý Công Nghệ Màn Hình" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                  placeholder="Tìm kiếm theo công nghệ màn hình..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>

          <!-- Filter for Công nghệ -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ</label>
              <select v-model="filters.congNghe" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in congNgheOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Chuẩn màn hình -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Chuẩn Màn Hình</label>
              <select v-model="filters.chuanManHinh" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in chuanManHinhOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Kích thước -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Kích Thước</label>
              <select v-model="filters.kichThuoc" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in kichThuocOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Độ phân giải -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Độ Phân Giải</label>
              <select v-model="filters.doPhanGiai" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in doPhanGiaiOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Độ sáng tối đa -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Độ Sáng (nits)</label>
              <select v-model="filters.doSangToiDa" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in doSangToiDaOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Tần số quét -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Tần Số Quét (Hz)</label>
              <select v-model="filters.tanSoQuet" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in tanSoQuetOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Kiểu màn hình -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Kiểu Màn Hình</label>
              <select v-model="filters.kieuManHinh" @change="searchCongNgheManHinh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in kieuManHinhOptions" :key="option.value" :value="option.value">
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
                  <span class="stat-label">Tổng số công nghệ màn hình:</span>
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
            <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm công nghệ màn hình mới">
              Thêm công nghệ màn hình
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Công Nghệ Màn Hình" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} công nghệ màn hình</span>
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
          <template #congNgheManHinh="{ item }">
            <div class="spec-text">{{ item.congNgheManHinh }}</div>
          </template>
          <template #chuanManHinh="{ item }">
            <div class="spec-text">{{ item.chuanManHinh }}</div>
          </template>
          <template #kichThuoc="{ item }">
            <div class="spec-text">{{ item.kichThuoc }}"</div>
          </template>
          <template #doPhanGiai="{ item }">
            <div class="spec-text">{{ item.doPhanGiai }}</div>
          </template>
          <template #doSangToiDa="{ item }">
            <div class="spec-text">{{ item.doSangToiDa }}</div>
          </template>
          <template #tanSoQuet="{ item }">
            <div class="spec-text">{{ item.tanSoQuet }}</div>
          </template>
          <template #kieuManHinh="{ item }">
            <div class="spec-text">{{ item.kieuManHinh }}</div>
          </template>
          <template #trangThai="{ item }">
            <span class="status-badge" :class="getStatusBadgeClass(item)">
              {{ getStatusText(item) }}
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
  fetchCongNgheManHinh,
  searchCongNgheManHinh as searchCongNgheManHinhAPI,
  createCongNgheManHinh,
  updateCongNgheManHinh,
} from "@/store/modules/products/thuocTinhSp/congNgheManHinh";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "CongNgheManHinhManagement",
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
      congNgheManHinh: "",
      chuanManHinh: "",
      kichThuoc: "",
      doPhanGiai: "",
      doSangToiDa: "",
      tanSoQuet: "",
      kieuManHinh: "",
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
      congNghe: "",
      chuanManHinh: "",
      kichThuoc: "",
      doPhanGiai: "",
      doSangToiDa: "",
      tanSoQuet: "",
      kieuManHinh: "",
    });

    // Data from API
    const congNgheManHinhList = ref([]);
    const congNgheOptions = ref([]);
    const chuanManHinhOptions = ref([]);
    const kichThuocOptions = ref([]);
    const doPhanGiaiOptions = ref([]);
    const doSangToiDaOptions = ref([]);
    const tanSoQuetOptions = ref([]);
    const kieuManHinhOptions = ref([]);

    const headers = ref([
      { text: "", value: "checkbox", isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Mã", value: "ma" },
      { text: "Công Nghệ", value: "congNgheManHinh" },
      { text: "Chuẩn", value: "chuanManHinh" },
      { text: "Kích Thước", value: "kichThuoc" },
      { text: "Độ Phân Giải", value: "doPhanGiai" },
      { text: "Độ Sáng", value: "doSangToiDa" },
      { text: "Tần Số", value: "tanSoQuet" },
      { text: "Kiểu", value: "kieuManHinh" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      let filtered = congNgheManHinhList.value || [];

      // Filter by công nghệ
      if (filters.value.congNghe) {
        filtered = filtered.filter(item =>
          item.congNgheManHinh === filters.value.congNghe
        );
      }

      // Filter by chuẩn màn hình
      if (filters.value.chuanManHinh) {
        filtered = filtered.filter(item =>
          item.chuanManHinh === filters.value.chuanManHinh
        );
      }

      // Filter by kích thước
      if (filters.value.kichThuoc) {
        filtered = filtered.filter(item =>
          item.kichThuoc === filters.value.kichThuoc
        );
      }

      // Filter by độ phân giải
      if (filters.value.doPhanGiai) {
        filtered = filtered.filter(item =>
          item.doPhanGiai === filters.value.doPhanGiai
        );
      }

      // Filter by độ sáng tối đa
      if (filters.value.doSangToiDa) {
        filtered = filtered.filter(item =>
          item.doSangToiDa === filters.value.doSangToiDa
        );
      }

      // Filter by tần số quét
      if (filters.value.tanSoQuet) {
        filtered = filtered.filter(item =>
          item.tanSoQuet === filters.value.tanSoQuet
        );
      }

      // Filter by kiểu màn hình
      if (filters.value.kieuManHinh) {
        filtered = filtered.filter(item =>
          item.kieuManHinh === filters.value.kieuManHinh
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

    // Validation methods
    const validateField = (fieldName) => {
      switch (fieldName) {
        case "congNgheManHinh":
          if (!formData.value.congNgheManHinh.trim()) {
            errors.value.congNgheManHinh = "Công nghệ màn hình không được để trống";
          } else if (formData.value.congNgheManHinh.trim().length < 2) {
            errors.value.congNgheManHinh = "Công nghệ màn hình phải có ít nhất 2 ký tự";
          } else if (formData.value.congNgheManHinh.trim().length > 100) {
            errors.value.congNgheManHinh = "Công nghệ màn hình không được vượt quá 100 ký tự";
          } else {
            delete errors.value.congNgheManHinh;
          }
          break;
        case "chuanManHinh":
          if (!formData.value.chuanManHinh.trim()) {
            errors.value.chuanManHinh = "Chuẩn màn hình không được để trống";
          } else if (formData.value.chuanManHinh.trim().length > 100) {
            errors.value.chuanManHinh = "Chuẩn màn hình không được vượt quá 100 ký tự";
          } else {
            delete errors.value.chuanManHinh;
          }
          break;
        case "kichThuoc":
          if (!formData.value.kichThuoc.trim()) {
            errors.value.kichThuoc = "Kích thước không được để trống";
          } else if (isNaN(parseFloat(formData.value.kichThuoc.trim()))) {
            errors.value.kichThuoc = "Kích thước phải là số";
          } else if (parseFloat(formData.value.kichThuoc.trim()) <= 0) {
            errors.value.kichThuoc = "Kích thước phải là số dương";
          } else if (parseFloat(formData.value.kichThuoc.trim()) > 100) {
            errors.value.kichThuoc = "Kích thước không được vượt quá 100 inch";
          } else {
            delete errors.value.kichThuoc;
          }
          break;
        case "doPhanGiai":
          if (!formData.value.doPhanGiai.trim()) {
            errors.value.doPhanGiai = "Độ phân giải không được để trống";
          } else if (formData.value.doPhanGiai.trim().length > 100) {
            errors.value.doPhanGiai = "Độ phân giải không được vượt quá 100 ký tự";
          } else {
            delete errors.value.doPhanGiai;
          }
          break;
        case "doSangToiDa":
          if (!formData.value.doSangToiDa.trim()) {
            errors.value.doSangToiDa = "Độ sáng tối đa không được để trống";
          } else if (isNaN(parseFloat(formData.value.doSangToiDa.trim()))) {
            errors.value.doSangToiDa = "Độ sáng tối đa phải là số";
          } else if (parseFloat(formData.value.doSangToiDa.trim()) <= 0) {
            errors.value.doSangToiDa = "Độ sáng tối đa phải là số dương";
          } else if (parseFloat(formData.value.doSangToiDa.trim()) > 10000) {
            errors.value.doSangToiDa = "Độ sáng tối đa không được vượt quá 10000 nits";
          } else {
            delete errors.value.doSangToiDa;
          }
          break;
        case "tanSoQuet":
          if (!formData.value.tanSoQuet.trim()) {
            errors.value.tanSoQuet = "Tần số quét không được để trống";
          } else if (isNaN(parseFloat(formData.value.tanSoQuet.trim()))) {
            errors.value.tanSoQuet = "Tần số quét phải là số";
          } else if (parseFloat(formData.value.tanSoQuet.trim()) <= 0) {
            errors.value.tanSoQuet = "Tần số quét phải là số dương";
          } else if (parseFloat(formData.value.tanSoQuet.trim()) > 1000) {
            errors.value.tanSoQuet = "Tần số quét không được vượt quá 1000 Hz";
          } else {
            delete errors.value.tanSoQuet;
          }
          break;
        case "kieuManHinh":
          if (!formData.value.kieuManHinh.trim()) {
            errors.value.kieuManHinh = "Kiểu màn hình không được để trống";
          } else if (formData.value.kieuManHinh.trim().length > 100) {
            errors.value.kieuManHinh = "Kiểu màn hình không được vượt quá 100 ký tự";
          } else {
            delete errors.value.kieuManHinh;
          }
          break;
      }
    };

    const validateCongNgheManHinhField = async () => {
      validateField('congNgheManHinh');
      if (errors.value.congNgheManHinh) return;

      const value = formData.value.congNgheManHinh.trim();
      if (value.includes('  ') || value !== value.trim()) {
        errors.value.congNgheManHinh = "Công nghệ màn hình không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Công nghệ màn hình không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const validateChuanManHinhField = async () => {
      validateField('chuanManHinh');
      if (errors.value.chuanManHinh) return;

      const value = formData.value.chuanManHinh.trim();
      if (value.includes('  ') || value !== value.trim()) {
        errors.value.chuanManHinh = "Chuẩn màn hình không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Chuẩn màn hình không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const validateKichThuocField = () => validateField('kichThuoc');
    const validateDoPhanGiaiField = () => validateField('doPhanGiai');
    const validateDoSangToiDaField = () => validateField('doSangToiDa');
    const validateTanSoQuetField = () => validateField('tanSoQuet');
    const validateKieuManHinhField = () => validateField('kieuManHinh');

    const clearFieldError = (fieldName) => {
      if (errors.value[fieldName]) {
        delete errors.value[fieldName];
      }
    };

    const validateForm = async () => {
      errors.value = {};
      
      // Validate all fields
      Object.keys(formData.value).forEach(field => {
        if (field !== 'id') {
          validateField(field);
        }
      });

      // Check for validation errors
      if (Object.keys(errors.value).length > 0) {
        const firstError = Object.values(errors.value)[0];
        toastNotification.value?.addToast({
          type: "warning",
          message: firstError,
          duration: 3000,
        });
        return false;
      }

      // Check for extra spaces
      const textFields = ['congNgheManHinh', 'chuanManHinh', 'doPhanGiai', 'kieuManHinh'];
      for (const field of textFields) {
        const value = formData.value[field].trim();
        if (value.includes('  ') || value !== value.trim()) {
          toastNotification.value?.addToast({
            type: "warning",
            message: `${field} không được chứa ký tự trống thừa`,
            duration: 3000,
          });
          return false;
        }
      }

      return true;
    };

    // API Methods
    const loadCongNgheManHinh = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;

        let response;
        const hasFilters = keyword.value;
        if (hasFilters) {
          response = await searchCongNgheManHinhAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchCongNgheManHinh(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          congNgheManHinhList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;
          generateFilterOptions();
        } else {
          congNgheManHinhList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching công nghệ màn hình:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách công nghệ màn hình: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        congNgheManHinhList.value = [];
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
      loadCongNgheManHinh();
    }, 500);

    const generateFilterOptions = () => {
      // Generate công nghệ options
      const congNgheSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.congNgheManHinh) {
          congNgheSet.add(item.congNgheManHinh);
        }
      });
      congNgheOptions.value = Array.from(congNgheSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate chuẩn màn hình options
      const chuanManHinhSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.chuanManHinh) {
          chuanManHinhSet.add(item.chuanManHinh);
        }
      });
      chuanManHinhOptions.value = Array.from(chuanManHinhSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate kích thước options
      const kichThuocSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.kichThuoc) {
          kichThuocSet.add(item.kichThuoc);
        }
      });
      kichThuocOptions.value = Array.from(kichThuocSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => {
        // Sort by numeric value for proper ordering
        const numA = parseFloat(a.value) || 0;
        const numB = parseFloat(b.value) || 0;
        return numA - numB;
      });

      // Generate độ phân giải options
      const doPhanGiaiSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.doPhanGiai) {
          doPhanGiaiSet.add(item.doPhanGiai);
        }
      });
      doPhanGiaiOptions.value = Array.from(doPhanGiaiSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate độ sáng tối đa options
      const doSangToiDaSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.doSangToiDa) {
          doSangToiDaSet.add(item.doSangToiDa);
        }
      });
      doSangToiDaOptions.value = Array.from(doSangToiDaSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => {
        // Sort by numeric value
        const numA = parseFloat(a.value) || 0;
        const numB = parseFloat(b.value) || 0;
        return numA - numB;
      });

      // Generate tần số quét options
      const tanSoQuetSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.tanSoQuet) {
          tanSoQuetSet.add(item.tanSoQuet);
        }
      });
      tanSoQuetOptions.value = Array.from(tanSoQuetSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => {
        // Sort by numeric value
        const numA = parseFloat(a.value) || 0;
        const numB = parseFloat(b.value) || 0;
        return numA - numB;
      });

      // Generate kiểu màn hình options
      const kieuManHinhSet = new Set();
      congNgheManHinhList.value.forEach(item => {
        if (item.kieuManHinh) {
          kieuManHinhSet.add(item.kieuManHinh);
        }
      });
      kieuManHinhOptions.value = Array.from(kieuManHinhSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));
    };

    const searchCongNgheManHinh = () => {
      currentPage.value = 1;
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        congNghe: "",
        chuanManHinh: "",
        kichThuoc: "",
        doPhanGiai: "",
        doSangToiDa: "",
        tanSoQuet: "",
        kieuManHinh: "",
      };
      currentPage.value = 1;
      selectedItems.value = [];
      loadCongNgheManHinh();

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
        congNgheManHinh: "",
        chuanManHinh: "",
        kichThuoc: "",
        doPhanGiai: "",
        doSangToiDa: "",
        tanSoQuet: "",
        kieuManHinh: "",
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
        congNgheManHinh: item.congNgheManHinh,
        chuanManHinh: item.chuanManHinh,
        kichThuoc: item.kichThuoc,
        doPhanGiai: item.doPhanGiai,
        doSangToiDa: item.doSangToiDa,
        tanSoQuet: item.tanSoQuet,
        kieuManHinh: item.kieuManHinh,
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
          congNgheManHinh: formData.value.congNgheManHinh.trim(),
          chuanManHinh: formData.value.chuanManHinh.trim(),
          kichThuoc: formData.value.kichThuoc.trim(),
          doPhanGiai: formData.value.doPhanGiai.trim(),
          doSangToiDa: formData.value.doSangToiDa.trim(),
          tanSoQuet: formData.value.tanSoQuet.trim(),
          kieuManHinh: formData.value.kieuManHinh.trim(),
        };

        // Khi edit, cần giữ nguyên mã cũ
        if (isEditMode.value) {
          const currentItem = congNgheManHinhList.value.find(item => item.id === formData.value.id);
          if (currentItem) {
            data.ma = currentItem.ma;
          }
        }

        if (isEditMode.value) {
          await updateCongNgheManHinh(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật công nghệ màn hình thành công",
            duration: 3000,
          });
        } else {
          await createCongNgheManHinh(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm công nghệ màn hình thành công",
            duration: 3000,
          });
        }

        closeModal();
        await loadCongNgheManHinh();
      } catch (error) {
        console.error("Error submitting form:", error);
        toastNotification.value?.addToast({
          type: "error",
          message:
            "Lỗi khi lưu công nghệ màn hình: " +
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
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
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
          message: "Vui lòng chọn ít nhất một công nghệ màn hình để tải danh sách Excel",
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = sharedFilteredItems.value.filter((item) => selectedItems.value.includes(item.id));
        const data = selectedData.map((item, index) => ({
          "STT": index + 1,
          "Mã": item.ma || "N/A",
          "Công Nghệ": item.congNgheManHinh || "N/A",
          "Chuẩn": item.chuanManHinh || "N/A",
          "Kích Thước": item.kichThuoc || "N/A",
          "Độ Phân Giải": item.doPhanGiai || "N/A",
          "Độ Sáng": item.doSangToiDa || "N/A",
          "Tần Số": item.tanSoQuet|| "N/A",
          "Kiểu": item.kieuManHinh || "N/A",
          "Ngày Tạo": formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Công Nghệ Màn Hình");

        worksheet["!cols"] = [
          { wch: 8 }, // STT
          { wch: 8 }, // Mã
          { wch: 15 }, // Công Nghệ
          { wch: 15 }, // Chuẩn
          { wch: 12 }, // Kích Thước
          { wch: 15 }, // Độ Phân Giải
          { wch: 12 }, // Độ Sáng
          { wch: 10 }, // Tần Số
          { wch: 12 }, // Kiểu
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "danh_sach_cong_nghe_man_hinh.xlsx");

        toastNotification.value?.addToast({
          type: "success",
          message: `Đã tải xuống danh sách ${selectedItems.value.length} công nghệ màn hình dưới dạng Excel`,
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

    const getStatusBadgeClass = (item) => {
      return "badge-completed";
    };

    const getStatusText = (item) => {
      return "Hoạt động";
    };

    // Watchers
    watch(keyword, debouncedSearch);

    watch(
      filters,
      () => {
        currentPage.value = 1;
      },
      { deep: true }
    );

    // Lifecycle
    onMounted(async () => {
      await loadCongNgheManHinh();
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      congNgheManHinhList,
      congNgheOptions,
      chuanManHinhOptions,
      kichThuocOptions,
      doPhanGiaiOptions,
      doSangToiDaOptions,
      tanSoQuetOptions,
      kieuManHinhOptions,
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
      searchCongNgheManHinh,
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
      validateCongNgheManHinhField,
      validateChuanManHinhField,
      validateKichThuocField,
      validateDoPhanGiaiField,
      validateDoSangToiDaField,
      validateTanSoQuetField,
      validateKieuManHinhField,
      clearFieldError,
      showModal,
      getStatusBadgeClass,
      getStatusText,
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
  max-width: 800px;
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

/* Existing styles */
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

.code-text {
  font-weight: 500;
  color: #34d399;
}

.spec-text {
  font-weight: 500;
  color: #1f3a44;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.badge-completed {
  background: #34d399;
  color: white;
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
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>