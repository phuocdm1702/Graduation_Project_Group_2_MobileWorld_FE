<!-- NhaSanXuat.vue -->
<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Quản Lý Nhà Sản Xuất" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                  placeholder="Tìm kiếm theo tên nhà sản xuất..." class="form-control search-input"
                  style="padding-left: 2.5rem;" />
              </div>
            </div>
          </div>

          <!-- Filter for Status -->
          <div class="col-lg-6 col-md-4">
            <div class="filter-group">
              <label class="filter-label">Trạng Thái</label>
              <div class="status-radio-group">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.status" value="" id="statusAll"
                    @change="searchNhaSanXuat">
                  <label class="form-check-label" for="statusAll">Tất cả</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.status" value="active"
                    id="statusActive" @change="searchNhaSanXuat">
                  <label class="form-check-label" for="statusActive">Hoạt động</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.status" value="inactive"
                    id="statusInactive" @change="searchNhaSanXuat">
                  <label class="form-check-label" for="statusInactive">Không hoạt động</label>
                </div>
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
                  <span class="stat-label">Tổng số nhà sản xuất:</span>
                  <span class="stat-value" style="color: rgb(21, 128, 61); font-weight: bold;">{{
                    sharedFilteredItems.length }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-action" @click="downloadSelectedExcel"
              :disabled="selectedItems.length === 0" title="Tải danh sách Excel">
              Tải Excel
            </button>
            <button class="btn btn-action" @click="openAddModal" title="Thêm nhà sản xuất mới">
              Thêm nhà sản xuất
            </button>
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Nhà Sản Xuất" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} nhà sản xuất</span>
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
          <template #nhaSanXuat="{ item }">
            <div class="code-text">{{ item.nhaSanXuat }}</div>
          </template>
          <template #moTa="{ item }">
            <div class="description-text">{{ item.moTa || 'Không có mô tả' }}</div>
          </template>
          <template #trangThai="{ item }">
            <span class="status-badge" :class="getStatusBadgeClass(item)">
              {{ getStatusText(item) }}
            </span>
          </template>
          <template #actions="{ item }">
            <div class="action-buttons-cell">
              <button class="btn btn-sm btn-table" @click="viewItem(item)" title="Xem chi tiết">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button class="btn btn-sm btn-table" @click="editItem(item)" title="Chỉnh sửa">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-sm btn-table" @click="deleteItem(item)" title="Xóa">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </FilterTableSection>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="addEditModal" tabindex="-1" aria-labelledby="addEditModalLabel" aria-hidden="true"
      ref="addEditModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addEditModalLabel">
              {{ isEditMode ? 'Chỉnh Sửa Nhà Sản Xuất' : 'Thêm Nhà Sản Xuất Mới' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Mã Nhà Sản Xuất</label>
                  <input type="text" class="form-control" v-model="formData.ma" placeholder="Mã sẽ được tự động tạo" disabled />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Tên Nhà Sản Xuất <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="formData.nhaSanXuat" 
                    placeholder="Nhập tên nhà sản xuất"
                    :class="{ 'is-invalid': errors.nhaSanXuat }" />
                  <div v-if="errors.nhaSanXuat" class="invalid-feedback">{{ errors.nhaSanXuat }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Trạng Thái</label>
                  <select class="form-select" v-model="formData.trangThai">
                    <option :value="true">Hoạt động</option>
                    <option :value="false">Không hoạt động</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="submitForm" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

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

// Import API services (bạn cần tạo các service này)
import {
  fetchNhaSanXuat,
  searchNhaSanXuat as searchNhaSanXuatAPI,
  createNhaSanXuat,
  updateNhaSanXuat,
  deleteNhaSanXuat,
} from "@/store/modules/products/thuocTinhSp/nhaSanXuat";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "NhaSanXuatManagement",
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
    const addEditModal = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const isLoading = ref(false);
    const totalElements = ref(0);
    const selectedItems = ref([]);

    // Form state
    const isEditMode = ref(false);
    const isSubmitting = ref(false);
    const formData = ref({
      id: null,
      ma: "",
      nhaSanXuat: "",
      trangThai: true, // Đổi thành trangThai boolean
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
      status: "", // "" for all, "active" for trangThai=true, "inactive" for trangThai=false
    });

    // Data from API
    const nhaSanXuatList = ref([]);

    // Headers for DataTable
    const headers = ref([
      { text: '', value: 'checkbox', isSelectAll: true },
      { text: "STT", value: "stt" },
      { text: "Mã", value: "ma" },
      { text: "Tên Nhà Sản Xuất", value: "nhaSanXuat" },
      { text: "Trạng Thái", value: "trangThai" }, // Đổi value thành trangThai
      { text: "Thao Tác", value: "actions" },
    ]);

    // Computed properties
    const sharedFilteredItems = computed(() => {
      return nhaSanXuatList.value || [];
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return (nhaSanXuatList.value || []).slice(start, end).map((item, index) => ({
        ...item,
        stt: start + index + 1,
      }));
    });

    const isAllSelected = computed(() => {
      return paginatedItems.value.length > 0 &&
        paginatedItems.value.every(item => selectedItems.value.includes(item.id));
    });

    // API Methods
    const loadNhaSanXuat = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;
        if (filters.value.status) {
          // Sửa logic filter theo trangThai
          searchParams.trangThai = filters.value.status === "active" ? true : false;
        }

        let response;
        const hasFilters = keyword.value || filters.value.status;
        if (hasFilters) {
          response = await searchNhaSanXuatAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
        } else {
          response = await fetchNhaSanXuat(currentPage.value - 1, itemsPerPage.value);
        }

        if (response.data) {
          nhaSanXuatList.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;
        } else {
          nhaSanXuatList.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching nhà sản xuất:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách nhà sản xuất: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        nhaSanXuatList.value = [];
        totalElements.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // Methods
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('vi-VN');
      } catch (error) {
        return 'N/A';
      }
    };

    // Thêm function để lấy text trạng thái
    const getStatusText = (item) => {
      // Kiểm tra các thuộc tính có thể có
      if (item.hasOwnProperty('trangThai')) {
        return item.trangThai ? 'Không hoạt động' : 'Hoạt động';
      } else if (item.hasOwnProperty('deleted')) {
        return item.deleted === 0 ? 'Không hoạt động' : 'Hoạt động';
      }
      // Default fallback
      return 'Không xác định';
    };

    // Sửa function getStatusBadgeClass
    const getStatusBadgeClass = (item) => {
      let isActive = false;
      
      if (item.hasOwnProperty('trangThai')) {
        isActive = item.trangThai === true;
      } else if (item.hasOwnProperty('deleted')) {
        isActive = item.deleted === 0;
      }
      
      return isActive ? "badge-canceled" : "badge-completed";
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      loadNhaSanXuat();
    }, 500);

    const searchNhaSanXuat = () => {
      currentPage.value = 1;
      loadNhaSanXuat();
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        status: "",
      };
      currentPage.value = 1;
      selectedItems.value = [];
      loadNhaSanXuat();

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
        ma: "",
        nhaSanXuat: "",
        trangThai: true, // Mặc định là hoạt động
      };
      errors.value = {};
      const modal = new bootstrap.Modal(addEditModal.value);
      modal.show();
    };

    const viewItem = (item) => {
      // Implement view details functionality
      toastNotification.value?.addToast({
        type: "info",
        message: `Xem chi tiết: ${item.nhaSanXuat}`,
        duration: 2000,
      });
    };

    const editItem = (item) => {
      isEditMode.value = true;
      formData.value = {
        id: item.id,
        ma: item.ma,
        nhaSanXuat: item.nhaSanXuat,
        moTa: item.moTa || "",
        // Xử lý trạng thái từ API
        trangThai: item.hasOwnProperty('trangThai') 
          ? item.trangThai 
          : (item.hasOwnProperty('deleted') ? item.deleted === 0 : true)
      };
      errors.value = {};
      const modal = new bootstrap.Modal(addEditModal.value);
      modal.show();
    };

    const deleteItem = (item) => {
      notificationType.value = "confirm";
      notificationMessage.value = `Bạn có chắc chắn muốn xóa nhà sản xuất "${item.nhaSanXuat}"?`;
      notificationOnConfirm.value = async () => {
        try {
          isNotificationLoading.value = true;
          await deleteNhaSanXuat(item.id);
          await loadNhaSanXuat();
          toastNotification.value?.addToast({
            type: "success",
            message: "Xóa nhà sản xuất thành công",
            duration: 3000,
          });
          notificationModal.value?.close();
        } catch (error) {
          toastNotification.value?.addToast({
            type: "error",
            message: "Lỗi khi xóa nhà sản xuất: " + (error.response?.data?.message || error.message),
            duration: 5000,
          });
        } finally {
          isNotificationLoading.value = false;
        }
      };
      notificationOnCancel.value = () => {
        notificationModal.value?.close();
      };
      notificationModal.value?.show();
    };

    const validateForm = () => {
      errors.value = {};
      
      if (!formData.value.nhaSanXuat.trim()) {
        errors.value.nhaSanXuat = "Tên nhà sản xuất không được để trống";
      }

      return Object.keys(errors.value).length === 0;
    };

    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        isSubmitting.value = true;
        const data = {
          nhaSanXuat: formData.value.nhaSanXuat.trim(),
          trangThai: formData.value.trangThai, // Gửi trangThai thay vì deleted
        };

        if (isEditMode.value) {
          await updateNhaSanXuat(formData.value.id, data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Cập nhật nhà sản xuất thành công",
            duration: 3000,
          });
        } else {
          await createNhaSanXuat(data);
          toastNotification.value?.addToast({
            type: "success",
            message: "Thêm nhà sản xuất thành công",
            duration: 3000,
          });
        }

        const modal = bootstrap.Modal.getInstance(addEditModal.value);
        modal.hide();
        await loadNhaSanXuat();
      } catch (error) {
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi lưu nhà sản xuất: " + (error.response?.data?.message || error.message),
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
      loadNhaSanXuat();
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      loadNhaSanXuat();
    };

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = paginatedItems.value.map(item => item.id);
      }
    };

    const downloadSelectedExcel = async () => {
      if (selectedItems.value.length === 0) {
        toastNotification.value?.addToast({
          type: 'warning',
          message: 'Vui lòng chọn ít nhất một nhà sản xuất để tải danh sách Excel',
          duration: 2000,
        });
        return;
      }

      try {
        const selectedData = nhaSanXuatList.value.filter(item => selectedItems.value.includes(item.id));
        const data = selectedData.map(item => ({
          'Tên Nhà Sản Xuất': item.nhaSanXuat || 'N/A',
          'Mô Tả': item.moTa || 'Không có mô tả',
          'Trạng Thái': getStatusText(item), // Sử dụng function getStatusText
          'Ngày Tạo': formatDate(item.ngayTao),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhà Sản Xuất');

        // Đặt độ rộng cột
        worksheet['!cols'] = [
          { wch: 25 }, // Tên Nhà Sản Xuất
          { wch: 40 }, // Mô Tả
          { wch: 15 }, // Trạng Thái
          { wch: 15 }, // Ngày Tạo
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'danh_sach_nha_san_xuat.xlsx');

        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã tải xuống danh sách ${selectedItems.value.length} nhà sản xuất dưới dạng Excel`,
          duration: 2000,
        });
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải xuống danh sách Excel: ' + error.message,
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
        loadNhaSanXuat();
      },
      { deep: true }
    );

    // Lifecycle
    onMounted(async () => {
      await loadNhaSanXuat();
    });

    return {
      toastNotification,
      notificationModal,
      addEditModal,
      keyword,
      filters,
      nhaSanXuatList,
      headers,
      currentPage,
      itemsPerPage,
      isLoading,
      totalElements,
      sharedFilteredItems,
      paginatedItems,
      formatDate,
      getStatusText, // Export function
      getStatusBadgeClass,
      debouncedSearch,
      searchNhaSanXuat,
      resetFilters,
      openAddModal,
      viewItem,
      editItem,
      deleteItem,
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
    };
  },
});
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

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Filter Label and Inputs */
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

.status-radio-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  font-size: 0.9rem;
  color: #1f3a44;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  align-items: center;
}

.badge-completed {
  background: #34d399;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.badge-primary {
  background: #6c757d;
  color: white;
}

.code-text {
  font-weight: 500;
  color: #34d399;
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
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-table.btn-danger {
  color: #dc3545;
}

.btn-table.btn-danger:hover {
  color: #c82333;
  text-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
}

/* Modal Styles */
.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, #34d399 0%, #16a34a 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
}

.modal-title {
  font-weight: 600;
}

.btn-close {
  filter: invert(1);
}

.modal-body {
  padding: 2rem;
}

.form-label {
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
}

.text-danger {
  color: #dc3545 !important;
}

.modal-footer {
  padding: 1rem 2rem 2rem;
  border-top: none;
}

.btn-primary {
  background: #34d399;
  border-color: #34d399;
}

.btn-primary:hover {
  background: #16a34a;
  border-color: #16a34a;
}

.btn-secondary {
  background: #6c757d;
  border-color: #6c757d;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
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

  .status-badge {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .action-buttons-cell {
    flex-direction: row;
    gap: 0.3rem;
  }

  .status-radio-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .description-text {
    max-width: 150px;
  }

  .modal-dialog {
    margin: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .status-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
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