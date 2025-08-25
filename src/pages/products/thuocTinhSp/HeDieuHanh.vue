<!-- HeDieuHanh.vue - Template updated without Ma field -->
<template>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEditMode ? 'Chỉnh Sửa Hệ Điều Hành' : 'Thêm Hệ Điều Hành Mới' }}
        </h5>
        <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm" id="operatingSystemForm">
          <div class="form-grid">
            <!-- Tên hệ điều hành -->
            <div class="form-group full-width">
              <label class="form-label">
                Tên Hệ Điều Hành <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.heDieuHanh"
                placeholder="Ví dụ: Android, iOS, Windows" :class="{ 'is-invalid': errors.heDieuHanh }"
                @blur="validateHeDieuHanhField" @input="clearFieldError('heDieuHanh')" />
            </div>
            <!-- Phiên bản -->
            <div class="form-group full-width">
              <label class="form-label">
                Phiên Bản <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.phienBan" placeholder="Ví dụ: 13.0, 14.0"
                :class="{ 'is-invalid': errors.phienBan }" @blur="validatePhienBanField"
                @input="clearFieldError('phienBan')" />
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
        <button type="submit" form="operatingSystemForm" class="btn btn-action btn-primary-custom"
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
    <HeaderCard title="Quản Lý Hệ Điều Hành" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                  placeholder="Tìm kiếm theo tên hệ điều hành hoặc phiên bản..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>

          <!-- Filter for Operating System -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <select v-model="filters.heDieuHanh" @change="searchHeDieuHanh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in heDieuHanhOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Version -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Phiên Bản</label>
              <select v-model="filters.phienBan" @change="searchHeDieuHanh" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in phienBanOptions" :key="option.value" :value="option.value">
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
                  <span class="stat-label">Tổng số hệ điều hành:</span>
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
            <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm hệ điều hành mới">
              Thêm hệ điều hành
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Hệ Điều Hành" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} hệ điều hành</span>
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
          <template #heDieuHanh="{ item }">
            <div class="spec-text">{{ item.heDieuHanh }}</div>
          </template>
          <template #phienBan="{ item }">
            <div class="spec-text">{{ item.phienBan }}</div>
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

<!-- Phần script cập nhật của HeDieuHanh.vue -->
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
  fetchHeDieuHanh,
  searchHeDieuHanh as searchHeDieuHanhAPI,
  createHeDieuHanh,
  updateHeDieuHanh,
} from "@/store/modules/products/thuocTinhSp/heDieuHanh";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "HeDieuHanhManagement",
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
      heDieuHanh: "",
      phienBan: "",
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
      heDieuHanh: "",
      phienBan: "",
    });

    // Data from API
    const heDieuHanhList = ref([]);
    const heDieuHanhOptions = ref([]);
    const phienBanOptions = ref([]);

    const headers = ref([
      { text: "", value: "checkbox", isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Mã", value: "ma" },
      { text: "Hệ Điều Hành", value: "heDieuHanh" },
      { text: "Phiên Bản", value: "phienBan" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      let filtered = heDieuHanhList.value || [];

      // Filter by operating system
      if (filters.value.heDieuHanh) {
        filtered = filtered.filter(item =>
          item.heDieuHanh === filters.value.heDieuHanh
        );
      }

      // Filter by version
      if (filters.value.phienBan) {
        filtered = filtered.filter(item =>
          item.phienBan === filters.value.phienBan
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
        case "heDieuHanh":
          if (!formData.value.heDieuHanh.trim()) {
            errors.value.heDieuHanh = "Tên hệ điều hành không được để trống";
          } else if (formData.value.heDieuHanh.trim().length < 2) {
            errors.value.heDieuHanh = "Tên hệ điều hành phải có ít nhất 2 ký tự";
          } else if (formData.value.heDieuHanh.trim().length > 50) {
            errors.value.heDieuHanh = "Tên hệ điều hành không được vượt quá 50 ký tự";
          } else {
            delete errors.value.heDieuHanh;
          }
          break;
        case "phienBan":
          if (!formData.value.phienBan.trim()) {
            errors.value.phienBan = "Phiên bản không được để trống";
          } else if (formData.value.phienBan.trim().length < 1) {
            errors.value.phienBan = "Phiên bản phải có ít nhất 1 ký tự";
          } else if (formData.value.phienBan.trim().length > 20) {
            errors.value.phienBan = "Phiên bản không được vượt quá 20 ký tự";
          } else {
            delete errors.value.phienBan;
          }
          break;
      }
    };

    const validateHeDieuHanhField = async () => {
      validateField('heDieuHanh');

      if (errors.value.heDieuHanh) {
        return;
      }

      const value = formData.value.heDieuHanh.trim();

      if (value.includes('  ') || value !== value.trim()) {
        errors.value.heDieuHanh = "Tên hệ điều hành không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Tên hệ điều hành không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const validatePhienBanField = async () => {
      validateField('phienBan');

      if (errors.value.phienBan) {
        return;
      }

      const value = formData.value.phienBan.trim();

      if (value.includes('  ') || value !== value.trim()) {
        errors.value.phienBan = "Phiên bản không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Phiên bản không được chứa ký tự trống thừa",
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

      // Validate hệ điều hành
      if (!formData.value.heDieuHanh.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Tên hệ điều hành không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.heDieuHanh.trim().length < 2) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Tên hệ điều hành phải có ít nhất 2 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.heDieuHanh.trim().length > 50) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Tên hệ điều hành không được vượt quá 50 ký tự",
          duration: 3000,
        });
        return false;
      }

      // Validate phiên bản
      if (!formData.value.phienBan.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Phiên bản không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.phienBan.trim().length < 1) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Phiên bản phải có ít nhất 1 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.phienBan.trim().length > 20) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Phiên bản không được vượt quá 20 ký tự",
          duration: 3000,
        });
        return false;
      }

      // Kiểm tra ký tự trống
      const heDieuHanhValue = formData.value.heDieuHanh.trim();
      const phienBanValue = formData.value.phienBan.trim();

      if (heDieuHanhValue.includes('  ') || heDieuHanhValue !== heDieuHanhValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Tên hệ điều hành không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      if (phienBanValue.includes('  ') || phienBanValue !== phienBanValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Phiên bản không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      return true;
    };

    // API Methods
    const loadHeDieuHanh = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;

        let response;
        const hasFilters = keyword.value;
        if (hasFilters) {
          response = await searchHeDieuHanhAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchHeDieuHanh(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          heDieuHanhList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;

          // Generate filter options from data
          generateFilterOptions();
        } else {
          heDieuHanhList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching hệ điều hành:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách hệ điều hành: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        heDieuHanhList.value = [];
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
      loadHeDieuHanh();
    }, 500);

    const debouncedFilterSearch = debounce(() => {
      currentPage.value = 1;
      // Không cần gọi API vì đã filter ở computed
    }, 300);

    const generateFilterOptions = () => {
      // Generate hệ điều hành options
      const heDieuHanhSet = new Set();
      heDieuHanhList.value.forEach(item => {
        if (item.heDieuHanh) {
          heDieuHanhSet.add(item.heDieuHanh);
        }
      });
      heDieuHanhOptions.value = Array.from(heDieuHanhSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate phiên bản options
      const phienBanSet = new Set();
      heDieuHanhList.value.forEach(item => {
        if (item.phienBan) {
          phienBanSet.add(item.phienBan);
        }
      });
      phienBanOptions.value = Array.from(phienBanSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));
    };

    const searchHeDieuHanh = () => {
      currentPage.value = 1;
      // Filter được xử lý trong computed property, không cần gọi API
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        heDieuHanh: "",
        phienBan: "",
      };
      currentPage.value = 1;
      selectedItems.value = [];
      loadHeDieuHanh();

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
        heDieuHanh: "",
        phienBan: "",
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
        heDieuHanh: item.heDieuHanh,
        phienBan: item.phienBan,
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
          heDieuHanh: formData.value.heDieuHanh.trim(),
          phienBan: formData.value.phienBan.trim(),
        };

        // Khi edit, cần giữ nguyên mã cũ
        if (isEditMode.value) {
          const currentItem = heDieuHanhList.value.find(item => item.id === formData.value.id);
          if (currentItem) {
            data.ma = currentItem.ma;
          }
        }

        if (isEditMode.value) {
          await updateHeDieuHanh(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật hệ điều hành thành công",
            duration: 3000,
          });
        } else {
          await createHeDieuHanh(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm hệ điều hành thành công",
            duration: 3000,
          });
        }

        closeModal();
        await loadHeDieuHanh();
      } catch (error) {
        console.error("Error submitting form:", error);
        toastNotification.value?.addToast({
          type: "error",
          message:
            "Lỗi khi lưu hệ điều hành: " +
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
      // Không cần gọi loadHeDieuHanh() vì pagination hoạt động trên client-side với filtered data
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      // Không cần gọi loadHeDieuHanh() vì pagination hoạt động trên client-side với filtered data
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
          message: "Vui lòng chọn ít nhất một hệ điều hành để tải danh sách Excel",
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = sharedFilteredItems.value.filter((item) => selectedItems.value.includes(item.id));
        const data = selectedData.map((item, index) => ({
          "STT": index + 1,
          "Mã": item.ma || "N/A",
          "Hệ Điều Hành": item.heDieuHanh || "N/A",
          "Phiên Bản": item.phienBan || "N/A",
          "Ngày Tạo": formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hệ Điều Hành");

        // Sửa lại độ rộng cột
        worksheet["!cols"] = [
          { wch: 8 }, // STT
          { wch: 8 }, // Mã
          { wch: 20 }, // Hệ Điều Hành
          { wch: 15 }, // Phiên Bản
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "danh_sach_he_dieu_hanh.xlsx");

        toastNotification.value?.addToast({
          type: "success",
          message: `Đã tải xuống danh sách ${selectedItems.value.length} hệ điều hành dưới dạng Excel`,
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
      // Placeholder for status logic
      return "badge-completed";
    };

    const getStatusText = (item) => {
      // Placeholder for status text
      return "Hoạt động";
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
      await loadHeDieuHanh();
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      heDieuHanhList,
      heDieuHanhOptions,
      phienBanOptions,
      headers,
      currentPage,
      itemsPerPage,
      isLoading,
      totalElements,
      sharedFilteredItems,
      paginatedItems,
      formatDate,
      debouncedSearch,
      debouncedFilterSearch,
      generateFilterOptions,
      searchHeDieuHanh,
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
      validateHeDieuHanhField,
      validatePhienBanField,
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
  max-width: 600px;
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

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
}

.alert h6 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.alert ul {
  font-size: 0.85rem;
  margin: 0;
  padding-left: 20px;
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

.code-text {
  font-weight: 500;
  color: #34d399;
}

.spec-text {
  font-weight: 500;
  color: #1f3a44;
}

.description-text {
  color: #6c757d;
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-text {
  font-size: 0.9rem;
  color: #6c757d;
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

.badge-canceled {
  background: #dc3545;
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

  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .description-text {
    max-width: 150px;
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

  .status-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .description-text {
    max-width: 120px;
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