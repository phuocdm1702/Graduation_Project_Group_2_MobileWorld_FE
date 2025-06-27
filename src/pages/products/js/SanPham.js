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
      { text: "CPU", value: "tenCpu" },
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

    const getStatusIcon = (status) => {
      switch (status) {
        case "Còn hàng":
          return "bi bi-check-circle";
        case "Hết hàng":
          return "bi bi-x-circle";
        default:
          return "bi bi-circle";
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
      getStatusIcon,
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