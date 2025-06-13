import { defineComponent, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';

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
    const itemsPerPage = ref(5);

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

    // Sample data
    const products = ref([
      {
        id: 1,
        tenSanPham: 'iPhone 14 Pro',
        nhaSanXuat: 'Apple',
        idNhaSanXuat: 1,
        heDieuHanh: 'iOS',
        phienBan: '16',
        idHeDieuHanh: 1,
        congNgheManHinh: 'OLED',
        idCongNgheManHinh: 1,
        tenCpu: 'A16 Bionic',
        dungLuongPin: '3200 mAh',
        idPin: 1,
        imeiCount: 50,
        minPrice: 25000000,
        maxPrice: 30000000,
      },
      {
        id: 2,
        tenSanPham: 'Galaxy S23 Ultra',
        nhaSanXuat: 'Samsung',
        idNhaSanXuat: 2,
        heDieuHanh: 'Android',
        phienBan: '13',
        idHeDieuHanh: 2,
        congNgheManHinh: 'AMOLED',
        idCongNgheManHinh: 2,
        tenCpu: 'Snapdragon 8 Gen 2',
        dungLuongPin: '5000 mAh',
        idPin: 2,
        imeiCount: 0,
        minPrice: 20000000,
        maxPrice: 25000000,
      },
      {
        id: 3,
        tenSanPham: 'Pixel 7 Pro',
        nhaSanXuat: 'Google',
        idNhaSanXuat: 3,
        heDieuHanh: 'Android',
        phienBan: '13',
        idHeDieuHanh: 2,
        congNgheManHinh: 'AMOLED',
        idCongNgheManHinh: 2,
        tenCpu: 'Tensor G2',
        dungLuongPin: '5000 mAh',
        idPin: 2,
        imeiCount: 20,
        minPrice: 18000000,
        maxPrice: 22000000,
      },
    ]);

    // Filter options
    const nhaSanXuatOptions = ref([
      { id: 1, nhaSanXuat: 'Apple' },
      { id: 2, nhaSanXuat: 'Samsung' },
      { id: 3, nhaSanXuat: 'Google' },
    ]);

    const heDieuHanhOptions = ref([
      { id: 1, heDieuHanh: 'iOS', phienBan: '16' },
      { id: 2, heDieuHanh: 'Android', phienBan: '13' },
    ]);

    const congNgheManHinhOptions = ref([
      { id: 1, chuanManHinh: 'OLED', congNgheManHinh: 'OLED' },
      { id: 2, chuanManHinh: 'AMOLED', congNgheManHinh: 'AMOLED' },
    ]);

    const pinOptions = ref([
      { id: 1, loaiPin: 'Li-Ion', dungLuongPin: '3200 mAh' },
      { id: 2, loaiPin: 'Li-Po', dungLuongPin: '5000 mAh' },
    ]);

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

    // Computed properties
    const filteredProducts = computed(() => {
      let filtered = products.value;

      if (keyword.value) {
        const query = keyword.value.toLowerCase();
        filtered = filtered.filter((item) =>
          item.tenSanPham.toLowerCase().includes(query)
        );
      }

      if (filters.value.idNhaSanXuat) {
        filtered = filtered.filter(
          (item) => item.idNhaSanXuat === Number(filters.value.idNhaSanXuat)
        );
      }

      if (filters.value.idHeDieuHanh) {
        filtered = filtered.filter(
          (item) => item.idHeDieuHanh === Number(filters.value.idHeDieuHanh)
        );
      }

      if (filters.value.idCongNgheManHinh) {
        filtered = filtered.filter(
          (item) => item.idCongNgheManHinh === Number(filters.value.idCongNgheManHinh)
        );
      }

      if (filters.value.idPin) {
        filtered = filtered.filter(
          (item) => item.idPin === Number(filters.value.idPin)
        );
      }

      if (filters.value.stockStatus) {
        filtered = filtered.filter(
          (item) =>
            (filters.value.stockStatus === 'inStock' && item.imeiCount > 0) ||
            (filters.value.stockStatus === 'outOfStock' && item.imeiCount === 0)
        );
      }

      return filtered;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
    });

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredProducts.value.slice(start, end);
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
      searchProducts();
    }, 300);

    const searchProducts = () => {
      // Trigger filtering (already handled by computed property)
      currentPage.value = 1;
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
      notificationOnConfirm.value = () => deleteProduct(product);
      notificationOnCancel.value = () => {};
      isNotificationLoading.value = false;
      notificationModal.value?.openModal();
    };

    const deleteProduct = (product) => {
      isNotificationLoading.value = true;

      setTimeout(() => {
        products.value = products.value.filter((p) => p.id !== product.id);
        isNotificationLoading.value = false;

        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã xóa sản phẩm ${product.tenSanPham} thành công`,
          duration: 3000,
        });

        resetNotification();
      }, 1000);
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
      filteredProducts,
      totalPages,
      paginatedProducts,
      formatPrice,
      debouncedSearch,
      searchProducts,
      resetFilters,
      viewProduct,
      editProduct,
      confirmDeleteProduct,
      deleteProduct,
      resetNotification,
      getStatusBadgeClass,
      getStatusIcon,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
    };
  },
};