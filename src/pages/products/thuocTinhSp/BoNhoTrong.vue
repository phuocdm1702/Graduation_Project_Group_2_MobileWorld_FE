<!-- BoNhoTrong.vue -->
<template>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEditMode ? 'Chỉnh Sửa Bộ Nhớ Trong' : 'Thêm Bộ Nhớ Trong Mới' }}
        </h5>
        <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm" id="storageForm">
          <div class="form-grid">
            <!-- Dung lượng bộ nhớ trong -->
            <div class="form-group full-width">
              <label class="form-label">
                Dung Lượng Bộ Nhớ Trong <span class="required">*</span>
              </label>
              <input type="text" class="form-control" v-model="formData.dungLuongBoNhoTrong" 
                     placeholder="Nhập dung lượng bộ nhớ trong"
                     :class="{ 'is-invalid': errors.dungLuongBoNhoTrong }" 
                     @blur="validateDungLuongField"
                     @input="clearFieldError('dungLuongBoNhoTrong')" />
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
        <button type="submit" form="storageForm" class="btn btn-action btn-primary-custom"
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
    <HeaderCard title="Quản Lý Bộ Nhớ Trong" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Search Input -->
          <div class="col-lg-6 col-md-8">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input v-model.trim="keyword" @input="debouncedSearch" type="text"
                  placeholder="Tìm kiếm theo dung lượng bộ nhớ trong..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số bộ nhớ trong:</span>
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
            <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm bộ nhớ trong mới">
              Thêm bộ nhớ trong
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Bộ Nhớ Trong" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} bộ nhớ trong</span>
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
          <template #dungLuongBoNhoTrong="{ item }">
            <div class="name-text">{{ item.dungLuongBoNhoTrong }}</div>
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
import { useRoute, useRouter } from "vue-router";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Import API services
import {
  fetchBoNhoTrong,
  searchBoNhoTrong as searchBoNhoTrongAPI,
  createBoNhoTrong,
  updateBoNhoTrong,
} from "@/store/modules/products/thuocTinhSp/boNhoTrong";

// Import API service để check trùng dung lượng
import apiService from "@/services/api";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "BoNhoTrongManagement",
  components: {
    DataTable,
    NotificationModal,
    ToastNotification,
    HeaderCard,
    FilterTableSection,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
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
      dungLuongBoNhoTrong: "",
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
    const filters = ref({});

    // Data from API
    const boNhoTrongList = ref([]);

    // Headers for DataTable
    const headers = ref([
      { text: "", value: "checkbox", isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Mã", value: "ma" },
      { text: "Dung Lượng Bộ Nhớ Trong", value: "dungLuongBoNhoTrong" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      return boNhoTrongList.value || [];
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return (boNhoTrongList.value || [])
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

    // API method để check trùng dung lượng bộ nhớ trong
    const checkDungLuongExists = async (dungLuongBoNhoTrong, excludeId = null) => {
      try {
        const params = { dungLuongBoNhoTrong };
        if (excludeId) {
          params.excludeId = excludeId;
        }
        const response = await apiService.get('/api/bo-nho-trong/exists/dung-luong', { params });
        return response.data;
      } catch (error) {
        console.error('Error checking dungLuongBoNhoTrong exists:', error);
        return false;
      }
    };

    // Validation methods
    const validateField = (fieldName) => {
      switch (fieldName) {
        case "dungLuongBoNhoTrong":
          if (!formData.value.dungLuongBoNhoTrong.trim()) {
            errors.value.dungLuongBoNhoTrong = "Dung lượng bộ nhớ trong không được để trống";
          } else if (formData.value.dungLuongBoNhoTrong.trim().length < 1) {
            errors.value.dungLuongBoNhoTrong = "Dung lượng bộ nhớ trong phải có ít nhất 1 ký tự";
          } else if (formData.value.dungLuongBoNhoTrong.trim().length > 50) {
            errors.value.dungLuongBoNhoTrong = "Dung lượng bộ nhớ trong không được vượt quá 50 ký tự";
          } else {
            delete errors.value.dungLuongBoNhoTrong;
          }
          break;
      }
    };

    // Validate dung lượng field với check trùng
    const validateDungLuongField = async () => {
      // Kiểm tra validation cơ bản trước
      validateField('dungLuongBoNhoTrong');
      
      // Nếu có lỗi validation cơ bản thì không check trùng
      if (errors.value.dungLuongBoNhoTrong) {
        return;
      }

      const dungLuongValue = formData.value.dungLuongBoNhoTrong.trim();
      
      // Kiểm tra ký tự trống
      if (dungLuongValue.includes('  ') || dungLuongValue !== dungLuongValue.trim()) {
        errors.value.dungLuongBoNhoTrong = "Dung lượng bộ nhớ trong không được chứa ký tự trống thừa";
        toastNotification.value?.addToast({
          type: "warning",
          message: "Dung lượng bộ nhớ trong không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return;
      }

      // Check trùng dung lượng (không check khi edit với cùng dung lượng)
      if (dungLuongValue) {
        const excludeId = isEditMode.value ? formData.value.id : null;
        const exists = await checkDungLuongExists(dungLuongValue, excludeId);
        
        if (exists) {
          errors.value.dungLuongBoNhoTrong = "Dung lượng bộ nhớ trong đã tồn tại";
          toastNotification.value?.addToast({
            type: "warning", 
            message: "Dung lượng bộ nhớ trong đã tồn tại trong hệ thống",
            duration: 3000,
          });
        }
      }
    };

    const clearFieldError = (fieldName) => {
      if (errors.value[fieldName]) {
        delete errors.value[fieldName];
      }
    };

    const validateForm = async () => {
      errors.value = {};
      
      // Validate dung lượng bộ nhớ trong
      if (!formData.value.dungLuongBoNhoTrong.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Dung lượng bộ nhớ trong không được để trống",
          duration: 3000,
        });
        return false;
      } else if (formData.value.dungLuongBoNhoTrong.trim().length < 1) {
        toastNotification.value?.addToast({
          type: "warning", 
          message: "Dung lượng bộ nhớ trong phải có ít nhất 1 ký tự",
          duration: 3000,
        });
        return false;
      } else if (formData.value.dungLuongBoNhoTrong.trim().length > 50) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Dung lượng bộ nhớ trong không được vượt quá 50 ký tự", 
          duration: 3000,
        });
        return false;
      }

      const dungLuongValue = formData.value.dungLuongBoNhoTrong.trim();
      
      // Kiểm tra ký tự trống
      if (dungLuongValue.includes('  ') || dungLuongValue !== dungLuongValue.trim()) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Dung lượng bộ nhớ trong không được chứa ký tự trống thừa",
          duration: 3000,
        });
        return false;
      }

      // Check trùng dung lượng trước khi submit
      const excludeId = isEditMode.value ? formData.value.id : null;
      const exists = await checkDungLuongExists(dungLuongValue, excludeId);
      
      if (exists) {
        toastNotification.value?.addToast({
          type: "warning",
          message: "Dung lượng bộ nhớ trong đã tồn tại trong hệ thống",
          duration: 3000,
        });
        return false;
      }

      return true;
    };

    // API Methods
    const loadBoNhoTrong = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;

        let response;
        const hasFilters = keyword.value || filters.value.status;
        if (hasFilters) {
          response = await searchBoNhoTrongAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchBoNhoTrong(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          boNhoTrongList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;
        } else {
          boNhoTrongList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching bộ nhớ trong:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách bộ nhớ trong: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        boNhoTrongList.value = [];
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
      loadBoNhoTrong();
    }, 500);

    const searchBoNhoTrong = () => {
      currentPage.value = 1;
      loadBoNhoTrong();
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {};
      currentPage.value = 1;
      selectedItems.value = [];
      loadBoNhoTrong();

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
        dungLuongBoNhoTrong: "",
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
        dungLuongBoNhoTrong: item.dungLuongBoNhoTrong,
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
          dungLuongBoNhoTrong: formData.value.dungLuongBoNhoTrong.trim(),
        };

        // Khi edit, cần giữ nguyên mã cũ
        if (isEditMode.value) {
          // Tìm item hiện tại để lấy mã
          const currentItem = boNhoTrongList.value.find(item => item.id === formData.value.id);
          if (currentItem) {
            data.ma = currentItem.ma; // Giữ nguyên mã cũ
          }
        }

        if (isEditMode.value) {
          await updateBoNhoTrong(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật bộ nhớ trong thành công",
            duration: 3000,
          });
        } else {
          await createBoNhoTrong(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm bộ nhớ trong thành công",
            duration: 3000,
          });
        }

        closeModal();
        await loadBoNhoTrong();
      } catch (error) {
        console.error("Error submitting form:", error);
        toastNotification.value?.addToast({
          type: "error",
          message:
            "Lỗi khi lưu bộ nhớ trong: " +
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
      loadBoNhoTrong();
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      loadBoNhoTrong();
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
          message: "Vui lòng chọn ít nhất một bộ nhớ trong để tải danh sách Excel",
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = boNhoTrongList.value.filter((item) => selectedItems.value.includes(item.id));
        const data = selectedData.map((item) => ({
          Mã: item.ma || "N/A",
          "Dung Lượng Bộ Nhớ Trong": item.dungLuongBoNhoTrong || "N/A",
          "Mô Tả": item.moTa || "Không có mô tả",
          "Ngày Tạo": formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bộ Nhớ Trong");

        // Sửa lại độ rộng cột
        worksheet["!cols"] = [
          { wch: 15 }, // Mã
          { wch: 30 }, // Dung Lượng Bộ Nhớ Trong
          { wch: 40 }, // Mô Tả
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "danh_sach_bo_nho_trong.xlsx");

        toastNotification.value?.addToast({
          type: "success",
          message: `Đã tải xuống danh sách ${selectedItems.value.length} bộ nhớ trong dưới dạng Excel`,
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
        loadBoNhoTrong();
      },
      { deep: true }
    );

    // Lifecycle
    onMounted(async () => {
      await loadBoNhoTrong();
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      boNhoTrongList,
      headers,
      currentPage,
      itemsPerPage,
      isLoading,
      totalElements,
      sharedFilteredItems,
      paginatedItems,
      formatDate,
      debouncedSearch,
      searchBoNhoTrong,
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
      validateDungLuongField,
      clearFieldError,
      showModal,
      checkDungLuongExists,
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

.form-control,
.form-select {
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

.name-text {
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