<!-- CumCamera.vue - Template updated without Ma field -->
<template>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEditMode ? 'Chỉnh Sửa Cụm Camera' : 'Thêm Cụm Camera Mới' }}
        </h5>
        <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm" id="cameraClusterForm">
          <div class="form-grid">
            <!-- Thông số camera sau -->
            <div class="form-group full-width">
              <label class="form-label">
                Thông Số Camera Sau <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.thongSoCameraSau" 
                     placeholder="Ví dụ: 108MP + 12MP + 12MP"
                     :class="{ 'is-invalid': errors.thongSoCameraSau }" 
                     @blur="validateThongSoCameraSauField"
                     @input="clearFieldError('thongSoCameraSau')" />
            </div>
            <!-- Thông số camera trước -->
            <div class="form-group full-width">
              <label class="form-label">
                Thông Số Camera Trước <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.thongSoCameraTruoc" 
                     placeholder="Ví dụ: 32MP"
                     :class="{ 'is-invalid': errors.thongSoCameraTruoc }" 
                     @blur="validateThongSoCameraTruocField"
                     @input="clearFieldError('thongSoCameraTruoc')" />
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
        <button type="submit" form="cameraClusterForm" class="btn btn-action btn-primary-custom"
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
    <HeaderCard title="Quản Lý Cụm Camera" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                  placeholder="Tìm kiếm theo thông số camera..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>

          <!-- Filter for Camera Sau -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Camera Sau</label>
              <select v-model="filters.cameraSau" @change="searchCumCamera" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in cameraSauOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Camera Truoc -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Camera Trước</label>
              <select v-model="filters.cameraTruoc" @change="searchCumCamera" class="form-select search-input">
                <option value="">Tất cả</option>
                <option v-for="option in cameraTruocOptions" :key="option.value" :value="option.value">
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
                  <span class="stat-label">Tổng số cụm camera:</span>
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
            <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm cụm camera mới">
              Thêm cụm camera
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Cụm Camera" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} cụm camera</span>
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
          <template #thongSoCameraSau="{ item }">
            <div class="spec-text">{{ item.thongSoCameraSau }}</div>
          </template>
          <template #thongSoCameraTruoc="{ item }">
            <div class="spec-text">{{ item.thongSoCameraTruoc }}</div>
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

<!-- Phần script cập nhật của CumCamera.vue -->
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
  fetchCumCamera,
  searchCumCamera as searchCumCameraAPI,
  createCumCamera,
  updateCumCamera,
} from "@/store/modules/products/thuocTinhSp/cumCamera";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "CumCameraManagement",
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
      thongSoCameraSau: "",
      thongSoCameraTruoc: "",
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
      cameraSau: "",
      cameraTruoc: "",
    });

    // Data from API
    const cumCameraList = ref([]);
    const cameraSauOptions = ref([]);
    const cameraTruocOptions = ref([]);

    // Headers for DataTable (bỏ cột mã)
    const headers = ref([
      { text: "", value: "checkbox", isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Camera Sau", value: "thongSoCameraSau" },
      { text: "Camera Trước", value: "thongSoCameraTruoc" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      let filtered = cumCameraList.value || [];
      
      // Filter by camera sau
      if (filters.value.cameraSau) {
        filtered = filtered.filter(item => 
          item.thongSoCameraSau === filters.value.cameraSau
        );
      }
      
      // Filter by camera truoc
      if (filters.value.cameraTruoc) {
        filtered = filtered.filter(item => 
          item.thongSoCameraTruoc === filters.value.cameraTruoc
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

    // Validation methods (không còn validation mã)
    const validateField = (fieldName) => {
      switch (fieldName) {
        case "thongSoCameraSau":
          if (!formData.value.thongSoCameraSau.trim()) {
            errors.value.thongSoCameraSau = "Thông số camera sau không được để trống";
          } else if (formData.value.thongSoCameraSau.trim().length < 2) {
            errors.value.thongSoCameraSau = "Thông số camera sau phải có ít nhất 2 ký tự";
          } else if (formData.value.thongSoCameraSau.trim().length > 100) {
            errors.value.thongSoCameraSau = "Thông số camera sau không được vượt quá 100 ký tự";
          } else {
            delete errors.value.thongSoCameraSau;
          }
          break;
        case "thongSoCameraTruoc":
          if (!formData.value.thongSoCameraTruoc.trim()) {
            errors.value.thongSoCameraTruoc = "Thông số camera trước không được để trống";
          } else if (formData.value.thongSoCameraTruoc.trim().length < 2) {
            errors.value.thongSoCameraTruoc = "Thông số camera trước phải có ít nhất 2 ký tự";
          } else if (formData.value.thongSoCameraTruoc.trim().length > 100) {
            errors.value.thongSoCameraTruoc = "Thông số camera trước không được vượt quá 100 ký tự";
          } else {
            delete errors.value.thongSoCameraTruoc;
          }
          break;
      }
    };

    const validateThongSoCameraSauField = async () => {
      validateField('thongSoCameraSau');
      
      if (errors.value.thongSoCameraSau) {
        return;
      }

      const value = formData.value.thongSoCameraSau.trim();
      
      if (value.includes('  ') || value !== value.trim()) {
        errors.value.thongSoCameraSau = "Thông số camera sau không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera sau không được chứa ký tự trống thừa",
          duration: 3000,
        });
      }
    };

    const validateThongSoCameraTruocField = async () => {
      validateField('thongSoCameraTruoc');
      
      if (errors.value.thongSoCameraTruoc) {
        return;
      }

      const value = formData.value.thongSoCameraTruoc.trim();
      
      if (value.includes('  ') || value !== value.trim()) {
        errors.value.thongSoCameraTruoc = "Thông số camera trước không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera trước không được chứa ký tự trống thừa",
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
      
      // Validate thông số camera sau
      if (!formData.value.thongSoCameraSau.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera sau không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.thongSoCameraSau.trim().length < 2) {
        toastNotification.value?.addToast({
          type: "warning", 
          message: "Thông số camera sau phải có ít nhất 2 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.thongSoCameraSau.trim().length > 100) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera sau không được vượt quá 100 ký tự", 
          duration: 3000,
        });
        return false;
      }

      // Validate thông số camera trước
      if (!formData.value.thongSoCameraTruoc.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera trước không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.thongSoCameraTruoc.trim().length < 2) {
        toastNotification.value?.addToast({
          type: "warning", 
          message: "Thông số camera trước phải có ít nhất 2 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.thongSoCameraTruoc.trim().length > 100) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera trước không được vượt quá 100 ký tự", 
          duration: 3000,
        });
        return false;
      }

      // Kiểm tra ký tự trống
      const cameraSauValue = formData.value.thongSoCameraSau.trim();
      const cameraTruocValue = formData.value.thongSoCameraTruoc.trim();

      if (cameraSauValue.includes('  ') || cameraSauValue !== cameraSauValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera sau không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      if (cameraTruocValue.includes('  ') || cameraTruocValue !== cameraTruocValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Thông số camera trước không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      return true;
    };

    // API Methods
    const loadCumCamera = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;

        let response;
        const hasFilters = keyword.value;
        if (hasFilters) {
          response = await searchCumCameraAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchCumCamera(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          cumCameraList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;
          
          // Generate filter options from data
          generateFilterOptions();
        } else {
          cumCameraList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching cụm camera:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách cụm camera: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        cumCameraList.value = [];
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
      loadCumCamera();
    }, 500);

    const debouncedFilterSearch = debounce(() => {
      currentPage.value = 1;
      // Không cần gọi API vì đã filter ở computed
    }, 300);

    const generateFilterOptions = () => {
      // Generate camera sau options
      const cameraSauSet = new Set();
      cumCameraList.value.forEach(item => {
        if (item.thongSoCameraSau) {
          cameraSauSet.add(item.thongSoCameraSau);
        }
      });
      cameraSauOptions.value = Array.from(cameraSauSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Generate camera truoc options
      const cameraTruocSet = new Set();
      cumCameraList.value.forEach(item => {
        if (item.thongSoCameraTruoc) {
          cameraTruocSet.add(item.thongSoCameraTruoc);
        }
      });
      cameraTruocOptions.value = Array.from(cameraTruocSet).map(value => ({
        value: value,
        label: value
      })).sort((a, b) => a.label.localeCompare(b.label));
    };

    const searchCumCamera = () => {
      currentPage.value = 1;
      // Filter được xử lý trong computed property, không cần gọi API
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        cameraSau: "",
        cameraTruoc: "",
      };
      currentPage.value = 1;
      selectedItems.value = [];
      loadCumCamera();

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
        thongSoCameraSau: "",
        thongSoCameraTruoc: "",
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
        thongSoCameraSau: item.thongSoCameraSau,
        thongSoCameraTruoc: item.thongSoCameraTruoc,
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
          thongSoCameraSau: formData.value.thongSoCameraSau.trim(),
          thongSoCameraTruoc: formData.value.thongSoCameraTruoc.trim(),
        };

        if (isEditMode.value) {
          await updateCumCamera(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật cụm camera thành công",
            duration: 3000,
          });
        } else {
          await createCumCamera(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm cụm camera thành công",
            duration: 3000,
          });
        }

        closeModal();
        await loadCumCamera();
      } catch (error) {
        console.error("Error submitting form:", error);
        toastNotification.value?.addToast({
          type: "error",
          message:
            "Lỗi khi lưu cụm camera: " +
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
      // Không cần gọi loadCumCamera() vì pagination hoạt động trên client-side với filtered data
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      // Không cần gọi loadCumCamera() vì pagination hoạt động trên client-side với filtered data
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
          message: "Vui lòng chọn ít nhất một cụm camera để tải danh sách Excel",
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = sharedFilteredItems.value.filter((item) => selectedItems.value.includes(item.id));
        const data = selectedData.map((item, index) => ({
          "STT": index + 1,
          "Camera Sau": item.thongSoCameraSau || "N/A",
          "Camera Trước": item.thongSoCameraTruoc || "N/A",
          "Ngày Tạo": formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cụm Camera");

        // Sửa lại độ rộng cột (bỏ cột mã)
        worksheet["!cols"] = [
          { wch: 8 }, // STT
          { wch: 25 }, // Camera Sau
          { wch: 25 }, // Camera Trước
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "danh_sach_cum_camera.xlsx");

        toastNotification.value?.addToast({
          type: "success",
          message: `Đã tải xuống danh sách ${selectedItems.value.length} cụm camera dưới dạng Excel`,
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
      await loadCumCamera();
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      cumCameraList,
      cameraSauOptions,
      cameraTruocOptions,
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
      searchCumCamera,
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
      validateThongSoCameraSauField,
      validateThongSoCameraTruocField,
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