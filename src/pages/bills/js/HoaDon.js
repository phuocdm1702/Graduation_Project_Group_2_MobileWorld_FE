import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useHoaDonStore } from '@/store/modules/orders/hoaDon';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';

// Hàm debounce để trì hoãn tìm kiếm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const invoiceManagementLogic = {
  components: {
    DataTable,
    NotificationModal,
    ToastNotification,
    HeaderCard,
    FilterTableSection,
  },

  setup() {
    const router = useRouter();
    const hoaDonStore = useHoaDonStore();

    // State
    const keyword = ref('');
    const rangeMin = ref(null); // Giá trị ban đầu là null để tránh lọc sai
    const rangeMax = ref(null); // Giá trị ban đầu là null để tránh lọc sai
    const startDate = ref('');
    const endDate = ref('');
    const viewMode = ref('table');
    const currentPage = ref(1);
    const itemsPerPage = ref(99999999); // Lấy toàn bộ dữ liệu ban đầu
    const activeTab = ref('all');

    // Notification state
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => { });
    const notificationOnCancel = ref(() => { });
    const notificationModal = ref(null);
    const toastNotification = ref(null);

    // Headers cho DataTable
    const headers = ref([
      {
        value: 'index',
        text: '#',
        formatter: (_, __, index) => {
          const startIndex = (currentPage.value - 1) * itemsPerPage.value;
          return startIndex + index + 1; // Tính STT dựa trên vị trí toàn cục
        },
      },
      { value: 'ma', text: 'Mã' },
      {
        value: 'maNhanVien',
        text: 'Nhân viên',
        formatter: (value, item) => item?.maNhanVien || 'N/A',
      },
      { value: 'tenKhachHang', text: 'Khách hàng' },
      // { value: 'soDienThoaiKhachHang', text: 'SDT' },
      {
        value: 'tongTienSauGiam',
        text: 'Tổng giá trị',
        formatter: (value) => (value ? `${value.toLocaleString()} VND` : '0 VND'),
      },
      // {
      //   value: 'idPhieuGiamGia.phanTramGiamGia',
      //   text: 'Tiền giảm',
      //   formatter: (phanTramGiamGia, item) => {
      //     if (!phanTramGiamGia || !item?.tongTien) return '0 VND';
      //     const giamGia = Math.round((item.tongTien * phanTramGiamGia) / 100 / 1000) * 1000;
      //     return `(${phanTramGiamGia}%) ~ ${giamGia.toLocaleString()}đ`;
      //   },
      // },
      {
        value: 'phiVanChuyen',
        text: 'Phí',
        formatter: (value) => (value ? `${value.toLocaleString()} VND` : '0 VND'),
      },
      {
        value: 'ngayTao',
        text: 'TG tạo',
        formatter: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'),
      },
      { value: 'loaiDon', text: 'Loại Đơn' },
      { value: 'trangThaiFormatted', text: 'Trạng thái', formatter: (value) => value || 'N/A' },
      {
        value: 'actions',
        text: 'Thao tác',
        formatter: (_, item) => ({
          viewUpdate: () => viewInvoice(item),
          printInvoice: () => printInvoice(item),
          downloadQrCode: () => downloadQrCode(item),
        }),
      },
    ]);

    // Lấy dữ liệu từ Pinia store
    const invoices = computed(() => hoaDonStore.getInvoices);
    const isLoading = computed(() => hoaDonStore.getIsLoading);
    const error = computed(() => hoaDonStore.getError);
    const totalElements = computed(() => hoaDonStore.getTotalElements);

    // Computed properties cho khoảng giá
    const minInvoiceTotal = computed(() => {
      return invoices.value.length
        ? Math.min(...invoices.value.map((inv) => inv.tongTienSauGiam || 0))
        : 0;
    });

    const maxInvoiceTotal = computed(() => {
      return invoices.value.length
        ? Math.max(...invoices.value.map((inv) => inv.tongTienSauGiam || 0))
        : 0;
    });

    const sliderRangeStyle = computed(() => {
      const min = minInvoiceTotal.value;
      const max = maxInvoiceTotal.value;
      const range = max - min || 1; // Tránh chia cho 0
      const left = ((rangeMin.value - min) / range) * 100;
      const width = ((rangeMax.value - rangeMin.value) / range) * 100;
      return {
        left: `${left}%`,
        width: `${width}%`,
      };
    });

    // Khởi tạo giá trị khi component được mount
    onMounted(() => {
      hoaDonStore.fetchInvoices({ page: 0, size: itemsPerPage.value });
    });

    // Cập nhật rangeMin và rangeMax khi dữ liệu invoices thay đổi
    watch(invoices, (newInvoices) => {
      if (newInvoices.length > 0) {
        const min = Math.min(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        const max = Math.max(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        if (rangeMin.value === null || rangeMin.value < min) rangeMin.value = min;
        if (rangeMax.value === null || rangeMax.value > max) rangeMax.value = max;
      }
    }, { immediate: true });

    // Computed properties cho lọc và phân trang
    const filteredInvoices = computed(() => {
      let filtered = invoices.value;

      // Lọc theo tab (loại đơn)
      if (activeTab.value === 'in-store') {
        filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'trực tiếp');
      } else if (activeTab.value === 'online') {
        filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'online');
      }

      // Lọc theo từ khóa
      if (keyword.value) {
        const query = keyword.value.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            (inv.ma || '').toLowerCase().includes(query) ||
            (inv.tenKhachHang || '').toLowerCase().includes(query) ||
            (inv.soDienThoaiKhachHang || '').toLowerCase().includes(query) ||
            (inv.maNhanVien || '').toLowerCase().includes(query)
        );
      }

      // Lọc theo khoảng giá
      if (rangeMin.value !== null) {
        filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) >= rangeMin.value);
      }
      if (rangeMax.value !== null) {
        filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) <= rangeMax.value);
      }

      // Lọc theo ngày
      if (startDate.value) {
        filtered = filtered.filter((inv) => {
          const invDate = new Date(inv.ngayTao).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).split('/').reverse().join('-');
          return new Date(invDate) >= new Date(startDate.value);
        });
      }
      if (endDate.value) {
        filtered = filtered.filter((inv) => {
          const invDate = new Date(inv.ngayTao).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).split('/').reverse().join('-');
          return new Date(invDate) <= new Date(endDate.value);
        });
      }

      return filtered;
    });

    const totalValue = computed(() => {
      return filteredInvoices.value.reduce((sum, inv) => sum + (inv.tongTienSauGiam || 0), 0);
    });

    const totalPages = computed(() => {
      return Math.ceil(totalElements.value / itemsPerPage.value);
    });

    const paginatedInvoices = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredInvoices.value.slice(start, end);
    });

    const statusCounts = computed(() => {
      return filteredInvoices.value.reduce((acc, inv) => {
        const status = inv.trangThaiFormatted || 'N/A';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    });

    // Methods
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const debouncedSearch = debounce((query) => {
      keyword.value = query;
      currentPage.value = 1;
      hoaDonStore.updateFilters({ keyword: query });
    }, 300);

    const resetFilters = () => {
      keyword.value = '';
      rangeMin.value = minInvoiceTotal.value;
      rangeMax.value = maxInvoiceTotal.value;
      startDate.value = '';
      endDate.value = '';
      activeTab.value = 'all';
      currentPage.value = 1;

      hoaDonStore.updateFilters({
        keyword: '',
        minAmount: null,
        maxAmount: null,
        startDate: null,
        endDate: null,
        trangThai: null,
      });

      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã đặt lại tất cả bộ lọc và tab',
        duration: 2000,
      });
    };

    const updateRangeMin = () => {
      if (rangeMin.value > rangeMax.value) {
        rangeMin.value = rangeMax.value;
      }
      hoaDonStore.updateFilters({
        minAmount: rangeMin.value,
        maxAmount: rangeMax.value,
      });
    };

    const updateRangeMax = () => {
      if (rangeMax.value < rangeMin.value) {
        rangeMax.value = rangeMin.value;
      }
      hoaDonStore.updateFilters({
        minAmount: rangeMin.value,
        maxAmount: rangeMax.value,
      });
    };

    const exportExcel = () => {
      toastNotification.value?.addToast({
        type: 'success',
        message: `Đã xuất ${filteredInvoices.value.length} hóa đơn ra Excel`,
        duration: 3000,
      });
    };

    const scanQR = () => {
      toastNotification.value?.addToast({
        type: 'warning',
        message: 'Chức năng quét QR đang được phát triển',
        duration: 3000,
      });
    };

    const viewInvoice = (invoice) => {
      router.push(`/hoaDon/${invoice.id}/detail`);
    };

    const printInvoice = (invoice) => {
      toastNotification.value?.addToast({
        type: 'info',
        message: `Đang in hóa đơn ${invoice.ma}`,
        duration: 3000,
      });
    };

    const downloadQrCode = (invoice) => {
      toastNotification.value?.addToast({
        type: 'info',
        message: `Đang tải QR code cho hóa đơn ${invoice.ma}`,
        duration: 3000,
      });
    };

    const confirmDeleteInvoice = (invoice) => {
      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn xóa hóa đơn ${invoice.ma}?\nThao tác này không thể hoàn tác.`;
      notificationOnConfirm.value = () => deleteInvoice(invoice);
      notificationOnCancel.value = () => { };
      isNotificationLoading.value = false;
      notificationModal.value?.openModal();
    };

    const deleteInvoice = (invoice) => {
      isNotificationLoading.value = true;
      setTimeout(() => {
        hoaDonStore.invoices = hoaDonStore.invoices.filter((inv) => inv.id !== invoice.id);
        hoaDonStore.totalElements -= 1;
        isNotificationLoading.value = false;
        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã xóa hóa đơn ${invoice.ma} thành công`,
          duration: 3000,
        });
        resetNotification();
      }, 1000);
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => { };
      notificationOnCancel.value = () => { };
    };

    const setActiveTab = (tab) => {
      activeTab.value = tab;
      currentPage.value = 1;
      toastNotification.value?.addToast({
        type: 'info',
        message: `Đã chuyển sang tab ${tab === 'all' ? 'Tất cả hóa đơn' : tab === 'in-store' ? 'Hóa đơn tại quầy' : 'Hóa đơn online'}`,
        duration: 2000,
      });
    };

    const setActiveTabByStatus = (status) => {
      hoaDonStore.updateFilters({ trangThai: status });
      const statusInvoices = filteredInvoices.value.filter((inv) => inv.trangThaiFormatted === status);
      if (statusInvoices.length > 0) {
        const firstType = (statusInvoices[0].loaiDon || '').toLowerCase();
        activeTab.value = firstType === 'trực tiếp' ? 'in-store' : firstType === 'online' ? 'online' : 'all';
        toastNotification.value?.addToast({
          type: 'info',
          message: `Đã lọc theo trạng thái ${status}`,
          duration: 2000,
        });
      }
      currentPage.value = 1;
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Chờ xác nhận':
        case 'Chờ giao hàng':
        case 'Đang giao':
          return 'badge-waiting';
        case 'Hoàn thành':
          return 'badge-completed';
        case 'Đã hủy':
          return 'badge-canceled';
        default:
          return 'badge-secondary';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Chờ xác nhận':
          return 'bi bi-clock';
        case 'Chờ giao hàng':
          return 'bi bi-truck';
        case 'Đang giao':
          return 'bi bi-arrow-left-right';
        case 'Hoàn thành':
          return 'bi bi-check-circle';
        case 'Đã hủy':
          return 'bi bi-x-circle';
        default:
          return 'bi bi-question-circle';
      }
    };

    const getTypeBadgeClass = (type) => {
      return ['online', 'trực tiếp'].includes((type || '').toLowerCase()) ? 'badge-info' : 'badge-info';
    };

    const getTypeIcon = (type) => {
      switch ((type || '').toLowerCase()) {
        case 'online':
          return 'bi bi-globe';
        case 'trực tiếp':
          return 'bi bi-shop';
        default:
          return 'bi bi-question-circle';
      }
    };

    return {
      keyword,
      rangeMin,
      rangeMax,
      startDate,
      endDate,
      viewMode,
      currentPage,
      itemsPerPage,
      activeTab,
      invoices,
      isLoading,
      error,
      totalElements,
      headers,
      minInvoiceTotal,
      maxInvoiceTotal,
      sliderRangeStyle,
      filteredInvoices,
      totalValue,
      totalPages,
      paginatedInvoices,
      statusCounts,
      formatPrice,
      debouncedSearch,
      resetFilters,
      updateRangeMin,
      updateRangeMax,
      exportExcel,
      scanQR,
      viewInvoice,
      printInvoice,
      downloadQrCode,
      confirmDeleteInvoice,
      deleteInvoice,
      resetNotification,
      setActiveTab,
      setActiveTabByStatus,
      getStatusBadgeClass,
      getStatusIcon,
      getTypeBadgeClass,
      getTypeIcon,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
    };
  },
};