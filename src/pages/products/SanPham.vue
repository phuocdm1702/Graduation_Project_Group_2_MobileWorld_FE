<!-- SanPham.vue -->
<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Quản Lý Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
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
                  placeholder="Tìm kiếm theo tên sản phẩm..." class="form-control search-input" />
              </div>
            </div>
          </div>

          <!-- Filter for Manufacturer -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hãng</label>
              <select v-model="filters.idNhaSanXuat" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                  {{ option.nhaSanXuat }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for OS -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <select v-model="filters.idHeDieuHanh" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                  {{ option.heDieuHanh }} {{ option.phienBan }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Screen Technology -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công nghệ màn hình</label>
              <select v-model="filters.idCongNgheManHinh" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                  {{ option.chuanManHinh }} {{ option.congNgheManHinh }}
                  {{ option.doPhanGiai }} {{ option.tanSoQuet }}
                  {{ option.doSangToiDa }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Battery -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Pin</label>
              <select v-model="filters.idPin" @change="searchProducts" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                  {{ option.loaiPin }} {{ option.dungLuongPin }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter for Stock Status -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng Thái Tồn Kho</label>
              <div class="status-radio-group">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.stockStatus" value="" id="statusAll"
                    @change="searchProducts">
                  <label class="form-check-label" for="statusAll">Tất cả</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.stockStatus" value="inStock"
                    id="statusInStock" @change="searchProducts">
                  <label class="form-check-label" for="statusInStock">Còn hàng</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="filters.stockStatus" value="outOfStock"
                    id="statusOutOfStock" @change="searchProducts">
                  <label class="form-check-label" for="statusOutOfStock">Hết hàng</label>
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
                <div class="stat-item me-4">
                  <span class="stat-label">Tổng số sản phẩm:</span>
                  <span class="stat-value">{{ sharedFilteredItems.length }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
            <router-link to="/themChiTietSanPham" class="btn btn-action">
              Thêm chi tiết sản phẩm
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View -->
    <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ sharedFilteredItems.length }} sản phẩm</span>
        </div>
      </div>
      <div class="table-body">
        <DataTable title="" :headers="headers" :data="paginatedProducts"
          :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]">
          <template #stt="{ globalIndex }">
            {{ globalIndex + 1 }}
          </template>
          <template #tenSanPham="{ item }">
            <div class="code-text">{{ item.tenSanPham }}</div>
          </template>
          <template #tenNhaSanXuat="{ item }">
            <div class="employee-name">{{ item.tenNhaSanXuat }}</div>
          </template>
          <template #heDieuHanh="{ item }">
            <div class="customer-name">{{ item.heDieuHanh }} {{ item.phienBan }}</div>
          </template>
          <template #congNgheManHinh="{ item }">
            <div class="customer-name">{{ item.congNgheManHinh }}</div>
          </template>
          <template #tenCpu="{ item }">
            <div class="customer-name">{{ item.tenCpu }}</div>
          </template>
          <template #dungLuongPin="{ item }">
            <div class="customer-name">{{ item.dungLuongPin }}</div>
          </template>
          <template #imeiCount="{ item }">
            <div class="amount-cell">{{ item.imeiCount || '0' }}</div>
          </template>
          <template #priceRange="{ item }">
            <div class="amount-cell">
              <div class="total-amount">
                {{ item.priceRange }}
              </div>
            </div>
          </template>
          <template #stockStatus="{ item }">
            <span class="status-badge" :class="getStatusBadgeClass(item.stockStatus)">
              {{ item.stockStatus }}
            </span>
          </template>
          <template #actions="{ item }">
            <div class="action-buttons-cell">
              <button class="btn btn-sm btn-table" @click="viewProduct(item)" title="Xem chi tiết">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button class="btn btn-sm btn-table" @click="editProduct(item)" title="Chỉnh sửa">
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

// Import API services
import {
  fetchProducts,
  searchProductsWithFilters,
  fetchNhaSanXuat,
  fetchHeDieuHanh,
  fetchCongNgheManHinh,
  fetchPin,
} from "@/store/modules/products/sanPham";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default defineComponent({
  name: "ProductManagement",
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
    const viewMode = ref("table");
    const currentPage = ref(1);
    const sharedCurrentPage = ref(1); // For card view pagination
    const itemsPerPage = ref(99999); // For DataTable
    const sharedPageSize = ref(10); // For card view, updated to 12 items per page
    const isLoading = ref(false);
    const totalElements = ref(0);

    // Notification state
    const notificationType = ref("confirm");
    const notificationMessage = ref("");
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});

    // State
    const keyword = ref("");
    const filters = ref({
      idNhaSanXuat: "",
      idHeDieuHanh: "",
      idCongNgheManHinh: "",
      idPin: "",
      stockStatus: "",
    });

    // Data from API
    const products = ref([]);
    const nhaSanXuatOptions = ref([]);
    const heDieuHanhOptions = ref([]);
    const congNgheManHinhOptions = ref([]);
    const pinOptions = ref([]);

    // Headers for DataTable
    const headers = ref([
      { text: "STT", value: "stt" },
      { text: "Tên Sản Phẩm", value: "tenSanPham" },
      { text: "Hãng", value: "tenNhaSanXuat" },
      { text: "Hệ Điều Hành", value: "heDieuHanh" },
      { text: "Màn Hình", value: "congNgheManHinh" },
      { text: "Pin", value: "dungLuongPin" },
      { text: "Số Lượng", value: "imeiCount" },
      { text: "Khoảng Giá", value: "priceRange" },
      { text: "Trạng Thái", value: "stockStatus" },
      { text: "Thao Tác", value: "actions" },
    ]);

    // API Methods
    const loadProducts = async () => {
      try {
        isLoading.value = true;
        const searchParams = {};
        if (keyword.value) searchParams.keyword = keyword.value;
        if (filters.value.idNhaSanXuat) searchParams.idNhaSanXuat = filters.value.idNhaSanXuat;
        if (filters.value.idHeDieuHanh) searchParams.idHeDieuHanh = filters.value.idHeDieuHanh;
        if (filters.value.idCongNgheManHinh) searchParams.idCongNgheManHinh = filters.value.idCongNgheManHinh;
        if (filters.value.idPin) searchParams.idPin = filters.value.idPin;
        if (filters.value.stockStatus) {
          if (filters.value.stockStatus === "inStock") {
            searchParams.inStock = true;
          } else if (filters.value.stockStatus === "outOfStock") {
            searchParams.inStock = false;
          } else if (filters.value.stockStatus === "inactive") {
            searchParams.isActive = false;
          }
        }

        const page = viewMode.value === 'table' ? currentPage.value - 1 : sharedCurrentPage.value - 1;
        const size = viewMode.value === 'table' ? itemsPerPage.value : sharedPageSize.value;

        let response;
        const hasFilters = keyword.value || Object.values(filters.value).some((v) => v);
        if (hasFilters) {
          response = await searchProductsWithFilters(searchParams, page, size);
        } else {
          response = await fetchProducts(page, size);
        }

        if (response.data) {
          products.value = (response.data.content || []).map((product) => ({
            ...product,
          }));
          totalElements.value = response.data.totalElements || 0;
        } else {
          products.value = [];
          totalElements.value = 0;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách sản phẩm: " + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        products.value = [];
        totalElements.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadFilterOptions = async () => {
      try {
        const [nhaSanXuatRes, heDieuHanhRes, congNgheManHinhRes, pinRes] = await Promise.allSettled([
          fetchNhaSanXuat(),
          fetchHeDieuHanh(),
          fetchCongNgheManHinh(),
          fetchPin(),
        ]);

        if (nhaSanXuatRes.status === "fulfilled") {
          nhaSanXuatOptions.value = nhaSanXuatRes.value.data || [];
        }
        if (heDieuHanhRes.status === "fulfilled") {
          heDieuHanhOptions.value = heDieuHanhRes.value.data || [];
        }
        if (congNgheManHinhRes.status === "fulfilled") {
          congNgheManHinhOptions.value = congNgheManHinhRes.value.data || [];
        }
        if (pinRes.status === "fulfilled") {
          pinOptions.value = pinRes.value.data || [];
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
        toastNotification.value?.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách bộ lọc: " + (error.response?.data?.message || error.message),
          duration: 3000,
        });

        // Fallback data
        nhaSanXuatOptions.value = [
          { id: 1, nhaSanXuat: "Apple" },
          { id: 2, nhaSanXuat: "Samsung" },
          { id: 3, nhaSanXuat: "Google" },
        ];
        heDieuHanhOptions.value = [
          { id: 1, heDieuHanh: "iOS", phienBan: "16" },
          { id: 2, heDieuHanh: "Android", phienBan: "13" },
        ];
        congNgheManHinhOptions.value = [
          { id: 1, chuanManHinh: "OLED", congNgheManHinh: "OLED" },
          { id: 2, chuanManHinh: "AMOLED", congNgheManHinh: "AMOLED" },
        ];
        pinOptions.value = [
          { id: 1, loaiPin: "Li-Ion", dungLuongPin: "3200 mAh" },
          { id: 2, loaiPin: "Li-Po", dungLuongPin: "5000 mAh" },
        ];
      }
    };

    // Computed properties
    const sharedFilteredItems = computed(() => {
      return products.value || [];
    });

    const sharedPaginatedItems = computed(() => {
      const start = (sharedCurrentPage.value - 1) * sharedPageSize.value;
      const end = start + sharedPageSize.value;
      return sharedFilteredItems.value.slice(start, end).map((product, index) => ({
        ...product,
        stt: start + index + 1,
        stockStatus: product.imeiCount > 0 ? "Còn hàng" : "Hết hàng",
        priceRange: product.minPrice && product.maxPrice
          ? `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`
          : "Chưa có giá",
      }));
    });

    const sharedTotalPages = computed(() =>
      Math.ceil(sharedFilteredItems.value.length / sharedPageSize.value)
    );

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return (products.value || []).slice(start, end).map((product, index) => ({
        ...product,
        stt: start + index + 1,
        stockStatus: product.imeiCount > 0 ? "Còn hàng" : "Hết hàng",
        priceRange: product.minPrice && product.maxPrice
          ? `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`
          : "Chưa có giá",
      }));
    });

    // Methods
    const formatPrice = (price) => {
      if (price === null || price === undefined) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
      loadProducts();
    }, 500);

    const searchProductsHandler = () => {
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
      loadProducts();
    };

    const resetFilters = () => {
      keyword.value = "";
      filters.value = {
        idNhaSanXuat: "",
        idHeDieuHanh: "",
        idCongNgheManHinh: "",
        idPin: "",
        stockStatus: "",
      };
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
      loadProducts();

      toastNotification.value?.addToast({
        type: "info",
        message: "Đã đặt lại tất cả bộ lọc",
        duration: 2000,
      });
    };

    const viewProduct = (item) => {
      router.push(`/chiTietSanPham/${item.id}`);
    };

    const editProduct = (item) => {
      router.push(`/editSanPham/${item.id}`);
    };

    const resetNotification = () => {
      notificationType.value = "confirm";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "Còn hàng":
          return "badge-completed";
        case "Hết hàng":
          return "badge-canceled";
        default:
          return "badge-primary";
      }
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      loadProducts();
    };

    const handleItemsPerPageChange = (size) => {
      itemsPerPage.value = size;
      currentPage.value = 1;
      loadProducts();
    };

    // Watchers
    watch(keyword, debouncedSearch);

    watch(
      filters,
      () => {
        currentPage.value = 1;
        sharedCurrentPage.value = 1;
        loadProducts();
      },
      { deep: true }
    );

    watch(() => viewMode.value, () => {
      sharedCurrentPage.value = 1; // Reset shared pagination when view mode changes
    });

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadFilterOptions(), loadProducts()]);
    });

    return {
      toastNotification,
      notificationModal,
      keyword,
      filters,
      products,
      nhaSanXuatOptions,
      heDieuHanhOptions,
      congNgheManHinhOptions,
      pinOptions,
      headers,
      viewMode,
      currentPage,
      sharedCurrentPage,
      itemsPerPage,
      sharedPageSize,
      isLoading,
      totalElements,
      sharedFilteredItems,
      sharedPaginatedItems,
      sharedTotalPages,
      paginatedProducts,
      formatPrice,
      debouncedSearch,
      searchProducts: searchProductsHandler,
      resetFilters,
      viewProduct,
      editProduct,
      resetNotification,
      getStatusBadgeClass,
      handlePageChange,
      handleItemsPerPageChange,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
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
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
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

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f3a44;
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

.amount-cell {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.total-amount {
  font-weight: 600;
  color: #16a34a !important;
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
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
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
}

@media (max-width: 576px) {
  .status-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
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