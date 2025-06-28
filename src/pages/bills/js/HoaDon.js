import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useHoaDonStore } from '@/store/modules/orders/hoaDon';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import jsQR from 'jsqr';
import QRCode from 'qrcode';

// Hàm debounce
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

    // State cho QR scanner
    const qrError = ref('');
    const qrMessage = ref('');
    const videoElement = ref(null);
    const canvasElement = ref(null);
    const stream = ref(null);
    const highlightedInvoiceId = ref(null); // Hóa đơn vừa quét
    let scanning = false;
    let lastScanTime = ref(0); // Thời gian lần quét cuối
    const scanInterval = ref(null); // Interval để kiểm soát tần suất quét

    // State
    const keyword = ref('');
    const rangeMin = ref(null);
    const rangeMax = ref(null);
    const startDate = ref('');
    const endDate = ref('');
    const viewMode = ref('table');
    const currentPage = ref(1);
    const itemsPerPage = ref(99999999);
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
          return startIndex + index + 1;
        },
      },
      { value: 'ma', text: 'Mã' },
      {
        value: 'maNhanVien',
        text: 'Nhân viên',
        formatter: (value, item) => item?.maNhanVien || 'N/A',
      },
      { value: 'tenKhachHang', text: 'Khách hàng' },
      {
        value: 'tongTienSauGiam',
        text: 'Tổng giá trị',
        formatter: (value) => (value ? `${value.toLocaleString()} VND` : '0 VND'),
      },
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

    // Computed properties
    const invoices = computed(() => hoaDonStore.getInvoices);
    const isLoading = computed(() => hoaDonStore.getIsLoading);
    const error = computed(() => hoaDonStore.getError);
    const totalElements = computed(() => hoaDonStore.getTotalElements);

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
      const range = max - min || 1;
      const left = ((rangeMin.value - min) / range) * 100;
      const width = ((rangeMax.value - rangeMin.value) / range) * 100;
      return {
        left: `${left}%`,
        width: `${width}%`,
      };
    });

    const filteredInvoices = computed(() => {
      let filtered = invoices.value;

      if (activeTab.value === 'in-store') {
        filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'trực tiếp');
      } else if (activeTab.value === 'online') {
        filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'online');
      }

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

      if (rangeMin.value !== null) {
        filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) >= rangeMin.value);
      }
      if (rangeMax.value !== null) {
        filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) <= rangeMax.value);
      }

      if (startDate.value) {
        filtered = filtered.filter((inv) => {
          const invDate = new Date(inv.ngayTao)
            .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            .split('/')
            .reverse()
            .join('-');
          return new Date(invDate) >= new Date(startDate.value);
        });
      }
      if (endDate.value) {
        filtered = filtered.filter((inv) => {
          const invDate = new Date(inv.ngayTao)
            .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            .split('/')
            .reverse()
            .join('-');
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
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
      highlightedInvoiceId.value = null;

      hoaDonStore.updateFilters({
        keyword: '',
        minAmount: null,
        maxAmount: null,
        startDate: null,
        endDate: null,
        trangThai: null,
        loaiDon: null, // Reset loaiDon
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

    const exportExcel = async () => {
      try {
        // Hiển thị thông báo đang xử lý
        toastNotification.value?.addToast({
          type: 'info',
          message: 'Đang xuất danh sách hóa đơn ra Excel...',
          duration: 0,
        });

        // Gọi action exportExcel từ store
        const result = await hoaDonStore.exportExcel();

        // Hiển thị thông báo kết quả
        toastNotification.value?.addToast({
          type: result.success ? 'success' : 'error',
          message: result.success
            ? `Đã xuất ${filteredInvoices.value.length} hóa đơn ra Excel`
            : result.message,
          duration: 3000,
        });
      } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: error.message || 'Lỗi khi xuất danh sách hóa đơn ra Excel',
          duration: 3000,
        });
      }
    };

    const scanQR = async () => {
      try {
        qrError.value = '';
        qrMessage.value = 'Đang khởi động camera...';
        scanning = true;

        const modalElement = document.getElementById('qrScannerModal');
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);

        videoElement.value = document.getElementById('qr-video');
        canvasElement.value = document.getElementById('qr-canvas');

        stream.value = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        videoElement.value.srcObject = stream.value;

        await new Promise((resolve) => {
          videoElement.value.onloadedmetadata = () => {
            videoElement.value.play();
            qrMessage.value = 'Đặt mã QR trước camera để quét';
            resolve();
          };
        });

        // Bắt đầu quét với interval kiểm soát
        startSmartScanning();
      } catch (err) {
        qrError.value = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.';
        qrMessage.value = '';
        stopCamera();
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi truy cập camera: ' + err.message,
          duration: 3000,
        });
      }
    };

    const startSmartScanning = () => {
      if (!scanning || !videoElement.value || !canvasElement.value) return;

      scanInterval.value = setInterval(() => {
        if (Date.now() - lastScanTime.value > 500) { // Chỉ quét lại sau 500ms nếu không có mã QR
          scanQRCode();
        }
      }, 100); // Kiểm tra mỗi 100ms
    };

    const scanQRCode = () => {
      if (!scanning || !videoElement.value || !canvasElement.value) return;

      if (videoElement.value.videoWidth === 0 || videoElement.value.videoHeight === 0) {
        requestAnimationFrame(scanQRCode);
        return;
      }

      const context = canvasElement.value.getContext('2d');
      canvasElement.value.width = videoElement.value.videoWidth;
      canvasElement.value.height = videoElement.value.videoHeight;

      context.drawImage(videoElement.value, 0, 0, canvasElement.value.width, canvasElement.value.height);
      const imageData = context.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        lastScanTime.value = Date.now(); // Cập nhật thời gian quét cuối
        handleQRCode(code.data);
      } else {
        qrMessage.value = 'Đang tìm mã QR...';
        requestAnimationFrame(scanQRCode); // Tiếp tục quét nếu chưa tìm thấy
      }
    };

    const handleQRCode = async (qrData) => {
      scanning = false;
      stopCamera();

      try {
        const invoiceMa = qrData.trim(); // Giả định mã QR chứa ma
        let invoice = invoices.value.find((inv) => inv.ma === invoiceMa);

        if (invoice) {
          keyword.value = invoice.ma;
          currentPage.value = 1;
          activeTab.value = invoice.loaiDon.toLowerCase() === 'trực tiếp' ? 'in-store' : 'online';
          highlightedInvoiceId.value = invoice.id;

          toastNotification.value?.addToast({
            type: 'success',
            message: `Đã tìm thấy hóa đơn ${invoice.ma}`,
            duration: 3000,
          });

          setTimeout(() => {
            highlightedInvoiceId.value = null;
          }, 5000);
        } else {
          const result = await hoaDonStore.fetchInvoiceById(invoiceMa);
          if (result.success) {
            invoice = result.data;
            keyword.value = invoice.ma;
            currentPage.value = 1;
            activeTab.value = invoice.loaiDon.toLowerCase() === 'trực tiếp' ? 'in-store' : 'online';
            highlightedInvoiceId.value = invoice.id;

            toastNotification.value?.addToast({
              type: 'success',
              message: `Đã tải hóa đơn ${invoice.ma}`,
              duration: 3000,
            });

            setTimeout(() => {
              highlightedInvoiceId.value = null;
            }, 5000);
          } else {
            throw new Error(result.message);
          }
        }
      } catch (err) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Không tìm thấy hóa đơn hoặc lỗi: ${err.message}`,
          duration: 3000,
        });
      }
    };

    const stopCamera = () => {
      scanning = false;
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
        stream.value = null;
      }
      if (scanInterval.value) {
        clearInterval(scanInterval.value);
        scanInterval.value = null;
      }
      qrError.value = '';
      qrMessage.value = '';

      const modalElement = document.getElementById('qrScannerModal');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
      }
    };

    const getRowClass = (item) => {
      return item.id === highlightedInvoiceId.value ? 'highlighted-row' : '';
    };

    const viewInvoice = (invoice) => {
      router.push(`/hoaDon/${invoice.id}/detail`);
    };

    const printInvoice = async (invoice) => {
      const result = await hoaDonStore.printInvoice(invoice.id);
      toastNotification.value?.addToast({
        type: result.success ? 'success' : 'error',
        message: result.message,
        duration: 3000,
      });
    };

    const downloadQrCode = async (invoice) => {
      try {
        const qrData = invoice.ma; // Sử dụng ma thay vì id
        const qrUrl = await QRCode.toDataURL(qrData);
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `QR_HoaDon_${invoice.ma}.png`;
        link.click();
        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã tải QR code cho hóa đơn ${invoice.ma}`,
          duration: 3000,
        });
      } catch (err) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Lỗi khi tạo QR code: ${err.message}`,
          duration: 3000,
        });
      }
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

    // const setActiveTab = (tab) => {
    //   activeTab.value = tab;
    //   currentPage.value = 1;
    //   highlightedInvoiceId.value = null;
    //   toastNotification.value?.addToast({
    //     type: 'info',
    //     message: `Đã chuyển sang tab ${tab === 'all' ? 'Tất cả hóa đơn' : tab === 'in-store' ? 'Hóa đơn tại quầy' : 'Hóa đơn online'
    //       }`,
    //     duration: 2000,
    //   });
    // };


    // Cập nhật hàm setActiveTab
    const setActiveTab = (tab) => {
      activeTab.value = tab;
      currentPage.value = 1;
      highlightedInvoiceId.value = null;

      let loaiDon = null;
      if (tab === 'in-store') {
        loaiDon = 'trực tiếp';
      } else if (tab === 'online') {
        loaiDon = 'online';
      }

      hoaDonStore.updateFilters({ loaiDon });

      toastNotification.value?.addToast({
        type: 'info',
        message: `Đã chuyển sang tab ${tab === 'all' ? 'Tất cả hóa đơn' : tab === 'in-store' ? 'Hóa đơn tại quầy' : 'Hóa đơn online'}`,
        duration: 2000,
      });
    };

    const setActiveTabByStatus = (status) => {
      const trangThaiNumber = hoaDonStore.mapStatusToNumber(status);
      hoaDonStore.updateFilters({ trangThai: trangThaiNumber });
      const statusInvoices = filteredInvoices.value.filter((inv) => inv.trangThaiFormatted === status);
      if (statusInvoices.length > 0) {
        const firstType = (statusInvoices[0].loaiDon || '').toLowerCase();
        activeTab.value = firstType === 'trực tiếp' ? 'in-store' : firstType === 'online' ? 'online' : 'all';
        highlightedInvoiceId.value = null;
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

    // Khởi tạo
    onMounted(() => {
      hoaDonStore.fetchInvoices({ page: 0, size: itemsPerPage.value });
    });

    watch(invoices, (newInvoices) => {
      if (newInvoices.length > 0) {
        const min = Math.min(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        const max = Math.max(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        if (rangeMin.value === null || rangeMin.value < min) rangeMin.value = min;
        if (rangeMax.value === null || rangeMax.value > max) rangeMax.value = max;
      }
    }, { immediate: true });

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
      stopCamera,
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
      getRowClass,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
      qrError,
      qrMessage,
      highlightedInvoiceId,
    };
  },
};