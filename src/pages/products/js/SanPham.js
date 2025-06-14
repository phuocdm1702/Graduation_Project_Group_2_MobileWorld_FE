import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';

// Import API services
import {
  fetchProducts,
  searchProducts,
  searchProductsWithFilters,
  deleteProduct,
  getProductDetail,
  fetchNhaSanXuat,
  fetchHeDieuHanh,
  fetchCongNgheManHinh,
  fetchPin
} from '@/store/modules/products/sanPham'; 

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default {
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
    const viewMode = ref('table');
    const currentPage = ref(1);
    const itemsPerPage = ref(99999999);
    const isLoading = ref(false);
    const totalElements = ref(0);

    // Notification state
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});

    // State
    const keyword = ref('');
    const filters = ref({
      idNhaSanXuat: '',
      idHeDieuHanh: '',
      idCongNgheManHinh: '',
      idPin: '',
      stockStatus: '',
    });

    // Data from API
    const products = ref([]);
    const nhaSanXuatOptions = ref([]);
    const heDieuHanhOptions = ref([]);
    const congNgheManHinhOptions = ref([]);
    const pinOptions = ref([]);

    // Headers for DataTable
    const headers = ref([
      { text: 'STT', value: 'stt' },
      { text: 'Tên Sản Phẩm', value: 'tenSanPham' },
      { text: 'Hãng', value: 'nhaSanXuat' },
      { text: 'Hệ Điều Hành', value: 'heDieuHanh' },
      { text: 'Màn hình', value: 'congNgheManHinh' },
      { text: 'CPU', value: 'tenCpu' },
      { text: 'Pin', value: 'dungLuongPin' },
      { text: 'Số lượng', value: 'imeiCount' },
      { text: 'Khoảng giá', value: 'priceRange' },
      { text: 'Trạng Thái', value: 'stockStatus' },
      { text: 'Thao tác', value: 'actions' },
    ]);

    // API Methods
    const loadProducts = async () => {
      try {
        isLoading.value = true;
        
        // Build search parameters
        const searchParams = {};
        
        if (keyword.value) {
          searchParams.keyword = keyword.value;
        }
        if (filters.value.idNhaSanXuat) {
          searchParams.idNhaSanXuat = filters.value.idNhaSanXuat;
        }
        if (filters.value.idHeDieuHanh) {
          searchParams.idHeDieuHanh = filters.value.idHeDieuHanh;
        }
        if (filters.value.idCongNgheManHinh) {
          searchParams.idCongNgheManHinh = filters.value.idCongNgheManHinh;
        }
        if (filters.value.idPin) {
          searchParams.idPin = filters.value.idPin;
        }
        if (filters.value.stockStatus) {
          const inStock = filters.value.stockStatus === 'inStock';
          searchParams.inStock = inStock;
        }

        const page = currentPage.value - 1; // Spring uses 0-based pagination
        const size = itemsPerPage.value;

        let response;

        // Determine which API method to use
        const hasFilters = keyword.value || Object.values(filters.value).some(v => v);
        
        if (hasFilters) {
          response = await searchProductsWithFilters(searchParams, page, size);
        } else {
          response = await fetchProducts(page, size);
        }
        
        if (response.data) {
          products.value = response.data.content || [];
          totalElements.value = response.data.totalElements || 0;
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message),
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
        // Fetch filter options using the new API services
        const [nhaSanXuatRes, heDieuHanhRes, congNgheManHinhRes, pinRes] = await Promise.allSettled([
          fetchNhaSanXuat(),
          fetchHeDieuHanh(),
          fetchCongNgheManHinh(),
          fetchPin()
        ]);

        if (nhaSanXuatRes.status === 'fulfilled') {
          nhaSanXuatOptions.value = nhaSanXuatRes.value.data || [];
        }
        if (heDieuHanhRes.status === 'fulfilled') {
          heDieuHanhOptions.value = heDieuHanhRes.value.data || [];
        }
        if (congNgheManHinhRes.status === 'fulfilled') {
          congNgheManHinhOptions.value = congNgheManHinhRes.value.data || [];
        }
        if (pinRes.status === 'fulfilled') {
          pinOptions.value = pinRes.value.data || [];
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách bộ lọc: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
        
        // Set fallback options if API fails
        nhaSanXuatOptions.value = [
          { id: 1, nhaSanXuat: 'Apple' },
          { id: 2, nhaSanXuat: 'Samsung' },
          { id: 3, nhaSanXuat: 'Google' },
        ];
        heDieuHanhOptions.value = [
          { id: 1, heDieuHanh: 'iOS', phienBan: '16' },
          { id: 2, heDieuHanh: 'Android', phienBan: '13' },
        ];
        congNgheManHinhOptions.value = [
          { id: 1, chuanManHinh: 'OLED', congNgheManHinh: 'OLED' },
          { id: 2, chuanManHinh: 'AMOLED', congNgheManHinh: 'AMOLED' },
        ];
        pinOptions.value = [
          { id: 1, loaiPin: 'Li-Ion', dungLuongPin: '3200 mAh' },
          { id: 2, loaiPin: 'Li-Po', dungLuongPin: '5000 mAh' },
        ];
      }
    };

    // Computed properties
    const filteredProducts = computed(() => {
      // Since filtering is now handled by API, just return products
      return products.value || [];
    });

    const totalPages = computed(() => {
      return Math.ceil(totalElements.value / itemsPerPage.value);
    });

    const paginatedProducts = computed(() => {
      return (products.value || []).map((product, index) => ({
        ...product,
        stt: (currentPage.value - 1) * itemsPerPage.value + index + 1,
        stockStatus: product.imeiCount > 0 ? 'Còn hàng' : 'Hết hàng',
        priceRange: product.minPrice && product.maxPrice 
          ? `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`
          : 'Chưa có giá'
      }));
    });

    // Methods
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      loadProducts();
    }, 500);

    const searchProductsHandler = () => {
      currentPage.value = 1;
      loadProducts();
    };

    const resetFilters = () => {
      keyword.value = '';
      filters.value = {
        idNhaSanXuat: '',
        idHeDieuHanh: '',
        idCongNgheManHinh: '',
        idPin: '',
        stockStatus: '',
      };
      currentPage.value = 1;
      loadProducts();

      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã đặt lại tất cả bộ lọc',
        duration: 2000,
      });
    };

    const viewProduct = (item) => {
      router.push(`/san-pham/${item.id}`);
    };

    const editProduct = (item) => {
      router.push(`/san-pham/${item.id}/edit`);
    };

    const confirmDeleteProduct = (product) => {
      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${product.tenSanPham}?\nThao tác này không thể hoàn tác.`;
      notificationOnConfirm.value = () => handleDeleteProduct(product);
      notificationOnCancel.value = () => {};
      isNotificationLoading.value = false;
      notificationModal.value?.openModal();
    };

    const handleDeleteProduct = async (product) => {
      try {
        isNotificationLoading.value = true;
        
        await deleteProduct(product.id);
        
        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã xóa sản phẩm ${product.tenSanPham} thành công`,
          duration: 3000,
        });

        // Refresh the product list
        await loadProducts();
        
        resetNotification();
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Lỗi khi xóa sản phẩm: ${error.response?.data?.message || error.message}`,
          duration: 5000,
        });
        isNotificationLoading.value = false;
      }
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Còn hàng':
          return 'badge-completed';
        case 'Hết hàng':
          return 'badge-canceled';
        default:
          return 'badge-primary';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Còn hàng':
          return 'bi bi-check-circle';
        case 'Hết hàng':
          return 'bi bi-x-circle';
        default:
          return 'bi bi-circle';
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
    
    watch(filters, () => {
      currentPage.value = 1;
      loadProducts();
    }, { deep: true });

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadFilterOptions(),
        loadProducts()
      ]);
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
      itemsPerPage,
      isLoading,
      totalElements,
      filteredProducts,
      totalPages,
      paginatedProducts,
      formatPrice,
      debouncedSearch,
      searchProductsHandler,
      resetFilters,
      viewProduct,
      editProduct,
      confirmDeleteProduct,
      handleDeleteProduct,
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
};