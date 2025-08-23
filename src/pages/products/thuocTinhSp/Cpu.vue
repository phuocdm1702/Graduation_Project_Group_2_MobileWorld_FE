<!-- Cpu.vue - Template updated for CPU management -->
<template>
    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    {{ isEditMode ? 'Chỉnh Sửa CPU' : 'Thêm CPU Mới' }}
                </h5>
                <button @click="closeModal" class="close-button" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitForm" id="cpuForm">
                    <div class="form-grid">
                        <!-- Tên CPU -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                Tên CPU <span class="required">*</span>
                            </label>
                            <input type="text" class="form-control" v-model="formData.tenCpu"
                                placeholder="Ví dụ: Intel Core i5-12400F" :class="{ 'is-invalid': errors.tenCpu }"
                                @blur="validateTenCpuField" @input="clearFieldError('tenCpu')" />
                        </div>
                        <!-- Số nhân -->
                        <div class="form-group full-width">
                            <label class="form-label">
                                Số Nhân <span class="required">*</span>
                            </label>
                            <input type="text" class="form-control" v-model="formData.soNhan"
                                placeholder="Ví dụ: 6" :class="{ 'is-invalid': errors.soNhan }"
                                @blur="validateSoNhanField" @input="clearFieldError('soNhan')" />
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-reset">Hủy</button>
                <button type="submit" form="cpuForm" class="btn btn-action btn-primary-custom" :disabled="isSubmitting">
                    {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm ml-2"></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Container chính -->
    <div class="container-fluid py-4">
        <!-- Header -->
        <HeaderCard title="Quản Lý CPU" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                                    placeholder="Tìm kiếm theo tên CPU hoặc số nhân..."
                                    class="form-control search-input" style="padding-left: 2.5rem;" />
                            </div>
                        </div>
                    </div>

                    <!-- Filter for Tên CPU -->
                    <div class="col-lg-4 col-md-6">
                        <div class="filter-group">
                            <label class="filter-label">Tên CPU</label>
                            <select v-model="filters.tenCpu" @change="searchCpu" class="form-select search-input">
                                <option value="">Tất cả</option>
                                <option v-for="option in tenCpuOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Filter for Số Nhân -->
                    <div class="col-lg-4 col-md-6">
                        <div class="filter-group">
                            <label class="filter-label">Số Nhân</label>
                            <select v-model="filters.soNhan" @change="searchCpu" class="form-select search-input">
                                <option value="">Tất cả</option>
                                <option v-for="option in soNhanOptions" :key="option.value" :value="option.value">
                                    {{ option.label }} nhân
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
                                    <span class="stat-label">Tổng số CPU:</span>
                                    <span class="stat-value" style="color: rgb(21, 128, 61); font-weight: bold;">
                                        {{ sharedFilteredItems.length }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-action" @click="downloadSelectedExcel"
                            :disabled="selectedItems.length === 0" title="Tải danh sách Excel">
                            Tải Excel
                        </button>
                        <button class="btn btn-action btn-primary-custom" @click="openAddModal" title="Thêm CPU mới">
                            Thêm CPU
                        </button>
                        <button class="btn btn-reset" @click="resetFilters">
                            Đặt lại bộ lọc
                        </button>
                    </div>
                </div>
            </div>
        </FilterTableSection>

        <!-- Table View -->
        <FilterTableSection title="Danh Sách CPU" icon="bi bi-table">
            <div class="table-header">
                <div class="table-title-wrapper">
                    <span class="table-count">{{ sharedFilteredItems.length }} CPU</span>
                </div>
            </div>
            <div class="table-body">
                <DataTable title="" :headers="headers" :data="paginatedItems"
                    :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]" @page-changed="handlePageChange"
                    @items-per-page-changed="handleItemsPerPageChange">
                    <template #checkbox="{ item, index }">
                        <input v-if="index !== -1" type="checkbox" v-model="selectedItems" :value="item.id" />
                        <input v-else type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                            title="Chọn tất cả" />
                    </template>
                    <template #stt="{ globalIndex }">
                        {{ globalIndex + 1 }}
                    </template>
                    <template #ma="{ item }">
                        <div class="code-text">{{ item.ma }}</div>
                    </template>
                    <template #tenCpu="{ item }">
                        <div class="spec-text">{{ item.tenCpu }}</div>
                    </template>
                    <template #soNhan="{ item }">
                        <div class="spec-text">{{ item.soNhan }} nhân</div>
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
    fetchCpu,
    searchCpu as searchCpuAPI,
    createCpu,
    updateCpu,
} from "@/store/modules/products/thuocTinhSp/cpu";

// Debounce utility
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default defineComponent({
    name: "CpuManagement",
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
            tenCpu: "",
            soNhan: "",
        });
        const errors = ref({});

        // Notification state
        const notificationType = ref("confirm");
        const notificationMessage = ref("");
        const isNotificationLoading = ref(false);
        const notificationOnConfirm = ref(() => {});
        const notificationOnCancel = ref(() => {});

        // State
        const keyword = ref("");
        const filters = ref({
            tenCpu: "",
            soNhan: "",
        });

        // Data from API
        const cpuList = ref([]);
        const tenCpuOptions = ref([]);
        const soNhanOptions = ref([]);

        // Headers for DataTable
        const headers = ref([
            { text: "", value: "checkbox", isSelectAll: true },
            { text: "STT", value: "stt" },
            { text: "Mã", value: "ma" },
            { text: "Tên CPU", value: "tenCpu" },
            { text: "Số Nhân", value: "soNhan" },
            { text: "Thao Tác", value: "actions" },
        ]);

        // Computed properties
        const sharedFilteredItems = computed(() => {
            let filtered = cpuList.value || [];

            // Filter by tên CPU
            if (filters.value.tenCpu) {
                filtered = filtered.filter(item =>
                    item.tenCpu &&
                    item.tenCpu.trim() === filters.value.tenCpu.trim()
                );
            }

            // Filter by số nhân
            if (filters.value.soNhan) {
                filtered = filtered.filter(item =>
                    item.soNhan &&
                    String(item.soNhan).trim().toLowerCase() === filters.value.soNhan.trim().toLowerCase()
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
                case "tenCpu":
                    if (!formData.value.tenCpu.trim()) {
                        errors.value.tenCpu = "Tên CPU không được để trống";
                    } else if (formData.value.tenCpu.trim().length < 2) {
                        errors.value.tenCpu = "Tên CPU phải có ít nhất 2 ký tự";
                    } else if (formData.value.tenCpu.trim().length > 100) {
                        errors.value.tenCpu = "Tên CPU không được vượt quá 100 ký tự";
                    } else {
                        delete errors.value.tenCpu;
                    }
                    break;
                case "soNhan":
                    if (!formData.value.soNhan.trim()) {
                        errors.value.soNhan = "Số nhân không được để trống";
                    } else if (formData.value.soNhan.trim().length < 2) {
                        errors.value.soNhan = "Số nhân phải có ít nhất 2 ký tự";
                    } else if (formData.value.soNhan.trim().length > 100) {
                        errors.value.soNhan = "Số nhân không được vượt quá 100 ký tự";
                    } else {
                        delete errors.value.soNhan;
                    }
                    break;
            }
        };

        const validateTenCpuField = async () => {
            validateField('tenCpu');

            if (errors.value.tenCpu) {
                return;
            }

            const value = formData.value.tenCpu.trim();

            if (value.includes('  ') || value !== value.trim()) {
                errors.value.tenCpu = "Tên CPU không được chứa ký tự trống thừa";
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Tên CPU không được chứa ký tự trống thừa",
                    duration: 3000,
                });
            }
        };

        const validateSoNhanField = async () => {
            validateField('soNhan');

            if (errors.value.soNhan) {
                return;
            }

            const value = formData.value.soNhan.trim();

            if (value.includes('  ') || value !== value.trim()) {
                errors.value.soNhan = "Số nhân không được chứa ký tự trống thừa";
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Số nhân không được chứa ký tự trống thừa",
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

            // Validate tên CPU
            if (!formData.value.tenCpu.trim()) {
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Tên CPU không được để trống",
                    duration: 3000,
                });
                return false;
            }

            // Validate số nhân
            if (!formData.value.soNhan.trim()) {
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Số nhân không được để trống",
                    duration: 3000,
                });
                return false;
            }

            // Kiểm tra ký tự trống
            const tenCpuValue = formData.value.tenCpu.trim();
            const soNhanValue = formData.value.soNhan.trim();

            if (tenCpuValue.includes('  ') || tenCpuValue !== tenCpuValue.trim()) {
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Tên CPU không được chứa ký tự trống thừa",
                    duration: 3000,
                });
                return false;
            }

            if (soNhanValue.includes('  ') || soNhanValue !== soNhanValue.trim()) {
                toastNotification.value?.addToast({
                    type: "warning",
                    message: "Số nhân không được chứa ký tự trống thừa",
                    duration: 3000,
                });
                return false;
            }

            return true;
        };

        // API Methods
        const loadCpu = async () => {
            try {
                isLoading.value = true;
                const searchParams = {};
                if (keyword.value) searchParams.keyword = keyword.value;

                let response;
                const hasFilters = keyword.value;
                if (hasFilters) {
                    response = await searchCpuAPI(searchParams, currentPage.value - 1, itemsPerPage.value);
                } else {
                    response = await fetchCpu(currentPage.value - 1, itemsPerPage.value);
                }

                if (response.data) {
                    console.log('CPU data received:', response.data);
                    // Normalize soNhan values to strings and trim them
                    cpuList.value = (response.data.content || []).map(item => ({
                        ...item,
                        soNhan: item.soNhan ? String(item.soNhan).trim() : "",
                        tenCpu: item.tenCpu ? String(item.tenCpu).trim() : ""
                    }));
                    totalElements.value = response.data.totalElements || 0;

                    // Generate filter options from normalized data
                    generateFilterOptions();
                    console.log('Generated options:', {
                        tenCpuOptions: tenCpuOptions.value,
                        soNhanOptions: soNhanOptions.value
                    });
                } else {
                    cpuList.value = [];
                    totalElements.value = 0;
                }
            } catch (error) {
                console.error("Error fetching CPU:", error);
                toastNotification.value?.addToast({
                    type: "error",
                    message: "Lỗi khi tải danh sách CPU: " + (error.response?.data?.message || error.message),
                    duration: 5000,
                });
                cpuList.value = [];
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
            loadCpu();
        }, 500);

        const debouncedFilterSearch = debounce(() => {
            currentPage.value = 1;
            // Không cần gọi API vì đã filter ở computed
        }, 300);

        const generateFilterOptions = () => {
            console.log('Generating filter options from CPU list:', cpuList.value);

            // Generate tên CPU options
            const tenCpuSet = new Set();
            cpuList.value.forEach(item => {
                if (item.tenCpu && typeof item.tenCpu === 'string' && item.tenCpu.trim()) {
                    tenCpuSet.add(item.tenCpu.trim());
                }
            });
            tenCpuOptions.value = Array.from(tenCpuSet).map(value => ({
                value: value,
                label: value
            })).sort((a, b) => {
                const labelA = String(a.label || '');
                const labelB = String(b.label || '');
                return labelA.localeCompare(labelB);
            });

            // Generate số nhân options
            const soNhanSet = new Set();
            cpuList.value.forEach(item => {
                if (item.soNhan && typeof item.soNhan === 'string' && item.soNhan.trim()) {
                    soNhanSet.add(item.soNhan.trim());
                }
            });

            console.log('Collected soNhan values:', Array.from(soNhanSet));

            soNhanOptions.value = Array.from(soNhanSet).map(value => ({
                value: value,
                label: value
            })).sort((a, b) => {
                const labelA = String(a.label || '');
                const labelB = String(b.label || '');
                return labelA.localeCompare(labelB);
            });
        };

        const searchCpu = () => {
            currentPage.value = 1;
            // Filter được xử lý trong computed property, không cần gọi API
        };

        const resetFilters = () => {
            keyword.value = "";
            filters.value = {
                tenCpu: "",
                soNhan: "",
            };
            currentPage.value = 1;
            selectedItems.value = [];
            loadCpu();

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
                tenCpu: "",
                soNhan: "",
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
                tenCpu: item.tenCpu,
                soNhan: item.soNhan,
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
                    tenCpu: formData.value.tenCpu.trim(),
                    soNhan: formData.value.soNhan.trim(),
                };

                // Khi edit, cần giữ nguyên mã cũ
                if (isEditMode.value) {
                    const currentItem = cpuList.value.find(item => item.id === formData.value.id);
                    if (currentItem) {
                        data.ma = currentItem.ma;
                    }
                }

                if (isEditMode.value) {
                    await updateCpu(formData.value.id, data);
                    toastNotification.value?.addToast({
                        type: "success",
                        message: "Cập nhật CPU thành công",
                        duration: 3000,
                    });
                } else {
                    await createCpu(data);
                    toastNotification.value?.addToast({
                        type: "success",
                        message: "Thêm CPU thành công",
                        duration: 3000,
                    });
                }

                closeModal();
                await loadCpu();
            } catch (error) {
                console.error("Error submitting form:", error);
                toastNotification.value?.addToast({
                    type: "error",
                    message:
                        "Lỗi khi lưu CPU: " +
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
            notificationOnConfirm.value = () => {};
            notificationOnCancel.value = () => {};
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
                    message: "Vui lòng chọn ít nhất một CPU để tải danh sách Excel",
                    duration: 2000,
                });
                return;
            }

            try {
                const selectedData = sharedFilteredItems.value.filter((item) => selectedItems.value.includes(item.id));
                const data = selectedData.map((item, index) => ({
                    "STT": index + 1,
                    "Mã": item.ma || "N/A",
                    "Tên CPU": item.tenCpu || "N/A",
                    "Số Nhân": item.soNhan || "N/A",
                    "Ngày Tạo": formatDate(item.ngayTao),
                }));

                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách CPU");

                worksheet["!cols"] = [
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 25 },
                    { wch: 40 },
                    { wch: 15 },
                ];

                const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                const blob = new Blob([excelBuffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(blob, "danh_sach_cpu.xlsx");

                toastNotification.value?.addToast({
                    type: "success",
                    message: `Đã tải xuống danh sách ${selectedItems.value.length} CPU dưới dạng Excel`,
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
            await loadCpu();
        });

        return {
            toastNotification,
            notificationModal,
            keyword,
            filters,
            cpuList,
            tenCpuOptions,
            soNhanOptions,
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
            searchCpu,
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
            validateTenCpuField,
            validateSoNhanField,
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