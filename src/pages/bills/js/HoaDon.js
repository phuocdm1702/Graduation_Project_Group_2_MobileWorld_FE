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
    const rangeMinDisplay = ref('');
    const rangeMaxDisplay = ref('');
    const rangeError = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const viewMode = ref('table');
    const currentPage = ref(1);
    const itemsPerPage = ref(99999999);
    const activeTab = ref('all');
    const activeStatus = ref('all');  // Track selected status filter
    const sortBy = ref('id');  // Mới
    const sortDir = ref('DESC');  // Mới

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
      { text: "STT", value: "stt" },
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
        text: 'Thời gian tạo',
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

    const groupedProducts = computed(() => {
      const grouped = {};
      products.value.forEach(product => {
        const key = `${product.name}-${product.color}-${product.ram}-${product.capacity}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: product.id,
            name: product.name,
            color: product.color,
            ram: product.ram,
            capacity: product.capacity,
            price: product.price,
            image: product.image,
            imeis: [],
            quantity: 0,
          };
        }
        grouped[key].imeis.push(product.imei);
        grouped[key].quantity += 1;
      });
      return Object.values(grouped);
    });

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
    const filteredInvoices = computed(() => invoices.value);
    const totalValue = computed(() => filteredInvoices.value.reduce((sum, inv) => sum + (inv.tongTienSauGiam || 0), 0));
    const totalPages = computed(() => Math.ceil(totalElements.value / itemsPerPage.value));
    const paginatedInvoices = computed(() => filteredInvoices.value);  // Data đã paginated từ server

    // const filteredInvoices = computed(() => {
    //   let filtered = invoices.value;

    //   if (activeTab.value === 'in-store') {
    //     filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'trực tiếp');
    //   } else if (activeTab.value === 'online') {
    //     filtered = filtered.filter((inv) => inv.loaiDon?.toLowerCase() === 'online');
    //   }

    //   if (keyword.value) {
    //     const query = keyword.value.toLowerCase();
    //     filtered = filtered.filter(
    //       (inv) =>
    //         (inv.ma || '').toLowerCase().includes(query) ||
    //         (inv.tenKhachHang || '').toLowerCase().includes(query) ||
    //         (inv.soDienThoaiKhachHang || '').toLowerCase().includes(query) ||
    //         (inv.maNhanVien || '').toLowerCase().includes(query)
    //     );
    //   }

    //   if (rangeMin.value !== null) {
    //     filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) >= rangeMin.value);
    //   }
    //   if (rangeMax.value !== null) {
    //     filtered = filtered.filter((inv) => (inv.tongTienSauGiam || 0) <= rangeMax.value);
    //   }

    //   if (startDate.value) {
    //     filtered = filtered.filter((inv) => {
    //       const invDate = new Date(inv.ngayTao)
    //         .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    //         .split('/')
    //         .reverse()
    //         .join('-');
    //       return new Date(invDate) >= new Date(startDate.value);
    //     });
    //   }
    //   if (endDate.value) {
    //     filtered = filtered.filter((inv) => {
    //       const invDate = new Date(inv.ngayTao)
    //         .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    //         .split('/')
    //         .reverse()
    //         .join('-');
    //       return new Date(invDate) <= new Date(endDate.value);
    //     });
    //   }

    //   return filtered;
    // });

    // const totalValue = computed(() => {
    //   return filteredInvoices.value.reduce((sum, inv) => sum + (inv.tongTienSauGiam || 0), 0);
    // });

    // const totalPages = computed(() => {
    //   return Math.ceil(totalElements.value / itemsPerPage.value);
    // });

    // const paginatedInvoices = computed(() => {
    //   const start = (currentPage.value - 1) * itemsPerPage.value;
    //   const end = start + itemsPerPage.value;
    //   return filteredInvoices.value.slice(start, end);
    // });

    const statusCounts = computed(() => {
      // Always count from all invoices, not filtered ones
      // This gives users a complete overview of all statuses
      return invoices.value.reduce((acc, inv) => {
        const status = inv.trangThaiFormatted || 'N/A';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    });

    // Hàm confirm dùng chung
    const showConfirm = (message, onConfirm, onCancel = () => { }) => {
      notificationType.value = 'confirm';
      notificationMessage.value = message;
      notificationOnConfirm.value = async () => {
        isNotificationLoading.value = true;
        try {
          await onConfirm();
        } catch (error) {
          toastNotification.value?.addToast({
            type: 'error',
            message: error.message || 'Đã có lỗi xảy ra',
            duration: 3000,
          });
        } finally {
          isNotificationLoading.value = false;
          resetNotification();
        }
      };
      notificationOnCancel.value = () => {
        onCancel();
        resetNotification();
      };
      notificationModal.value?.openModal();
    };

    // Methods
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Currency formatting functions
    const formatCurrency = (value) => {
      if (!value && value !== 0) return '';
      return new Intl.NumberFormat('vi-VN').format(value);
    };

    const parseCurrency = (value) => {
      if (!value) return null;
      // Remove all non-digit characters except decimal separator
      const cleanValue = value.toString().replace(/[^\d,]/g, '').replace(/,/g, '');
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const validateRange = (min, max) => {
      if (min !== null && max !== null && min > max) {
        return 'Giá tối thiểu không được lớn hơn giá tối đa';
      }
      if (min !== null && min < 0) {
        return 'Giá không được âm';
      }
      if (max !== null && max < 0) {
        return 'Giá không được âm';
      }
      return '';
    };

    const debouncedSearch = debounce((query) => {
      keyword.value = query;
      currentPage.value = 1;
      hoaDonStore.updateFilters({ keyword: query });
    }, 300);

    const resetFilters = () => {
      keyword.value = '';
      rangeMin.value = null;
      rangeMax.value = null;
      rangeMinDisplay.value = '';
      rangeMaxDisplay.value = '';
      rangeError.value = '';
      startDate.value = '';
      endDate.value = '';
      activeStatus.value = 'all';  // Reset status filter
      sortBy.value = 'id';
      sortDir.value = 'DESC';
      hoaDonStore.updateFilters({
        keyword: '',
        minAmount: null,
        maxAmount: null,
        startDate: null,
        endDate: null,
        trangThai: null,
        loaiDon: null,
        sortBy: 'id',
        sortDir: 'DESC',
      });
      currentPage.value = 1;  // Reset UI page
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã đặt lại bộ lọc',
        duration: 2000,
      });
    };

    const updateRangeMin = () => {
      const parsed = parseCurrency(rangeMinDisplay.value);
      rangeMin.value = parsed;

      if (rangeMin.value !== null && rangeMax.value !== null && rangeMin.value > rangeMax.value) {
        rangeMin.value = rangeMax.value;
        rangeMinDisplay.value = formatCurrency(rangeMin.value);
      }

      rangeError.value = validateRange(rangeMin.value, rangeMax.value);

      if (!rangeError.value) {
        hoaDonStore.updateFilters({
          minAmount: rangeMin.value,
          maxAmount: rangeMax.value,
        });
      }
    };

    const updateRangeMax = () => {
      const parsed = parseCurrency(rangeMaxDisplay.value);
      rangeMax.value = parsed;

      if (rangeMin.value !== null && rangeMax.value !== null && rangeMax.value < rangeMin.value) {
        rangeMax.value = rangeMin.value;
        rangeMaxDisplay.value = formatCurrency(rangeMax.value);
      }

      rangeError.value = validateRange(rangeMin.value, rangeMax.value);

      if (!rangeError.value) {
        hoaDonStore.updateFilters({
          minAmount: rangeMin.value,
          maxAmount: rangeMax.value,
        });
      }
    };

    // Debounced range handlers (slower timing for better UX)
    const debouncedRangeMin = debounce(() => {
      updateRangeMin();
    }, 1200);

    const debouncedRangeMax = debounce(() => {
      updateRangeMax();
    }, 1200);

    // Handle input formatting on blur
    const handleRangeMinBlur = () => {
      if (rangeMinDisplay.value) {
        const parsed = parseCurrency(rangeMinDisplay.value);
        if (parsed !== null) {
          rangeMinDisplay.value = formatCurrency(parsed);
        }
      }
    };

    const handleRangeMaxBlur = () => {
      if (rangeMaxDisplay.value) {
        const parsed = parseCurrency(rangeMaxDisplay.value);
        if (parsed !== null) {
          rangeMaxDisplay.value = formatCurrency(parsed);
        }
      }
    };

    const exportExcel = async () => {
      showConfirm(
        'Bạn có chắc chắn muốn xuất danh sách hóa đơn ra Excel?',
        async () => {
          toastNotification.value?.addToast({
            type: 'info',
            message: 'Đang xuất danh sách hóa đơn ra Excel...',
            duration: 0,
          });

          const result = await hoaDonStore.exportExcel();

          toastNotification.value?.addToast({
            type: result.success ? 'success' : 'error',
            message: result.success
              ? `Đã xuất ${filteredInvoices.value.length} hóa đơn ra Excel`
              : result.message,
            duration: 3000,
          });
        }
      );
    };

    const scanQR = async () => {
      showConfirm(
        'Bạn có muốn khởi động camera để quét mã QR?',
        async () => {
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

          startSmartScanning();
        }
      );
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
      return highlightedInvoiceId.value === item.id ? 'table-row-highlighted' : '';
    };

    const startDrag = (type, event) => {
      const slider = event.target.closest('.slider-container');
      const updatePrice = (e) => {
        const rect = slider.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const value = Math.round(minInvoiceTotal.value + pos * (maxInvoiceTotal.value - minInvoiceTotal.value));

        if (type === 'min') {
          rangeMin.value = Math.max(minInvoiceTotal.value, Math.min(value, rangeMax.value || maxInvoiceTotal.value));
          debouncedRangeMin();
        } else {
          rangeMax.value = Math.min(maxInvoiceTotal.value, Math.max(value, rangeMin.value || minInvoiceTotal.value));
          debouncedRangeMax();
        }
      };

      const handleMouseMove = (e) => {
        e.preventDefault();
        updatePrice(e);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      event.preventDefault();
    };

    const viewInvoice = (invoice) => {
      router.push(`/hoaDon/${invoice.id}/detail`);
    };

    const printInvoice = async (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn in hóa đơn ${invoice.ma}?`,
        async () => {
          const result = await hoaDonStore.printInvoice(invoice.id);
          toastNotification.value?.addToast({
            type: result.success ? 'success' : 'error',
            message: result.message,
            duration: 3000,
          });
        }
      );
    };

    const downloadQrCode = async (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn tải QR code cho hóa đơn ${invoice.ma}?`,
        async () => {
          const qrData = invoice.ma;
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
        }
      );
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
      currentPage.value = 1;
      highlightedInvoiceId.value = null;
      activeStatus.value = status;  // Track selected status

      if (status === 'all') {
        // "Tất cả" - Reset tất cả filters trạng thái, giữ nguyên các filter khác
        hoaDonStore.updateFilters({
          keyword: keyword.value,
          minAmount: rangeMin.value,
          maxAmount: rangeMax.value,
          startDate: startDate.value,
          endDate: endDate.value,
          trangThai: null,  // Reset trạng thái để lấy tất cả
          loaiDon: hoaDonStore.filters.loaiDon,  // Giữ nguyên loại đơn hiện tại
          sortBy: sortBy.value,
          sortDir: sortDir.value
        });

        toastNotification.value?.addToast({
          type: 'info',
          message: 'Đã hiển thị tất cả trạng thái hóa đơn',
          duration: 2000,
        });
      } else {
        // Lọc theo trạng thái cụ thể - chính xác theo mapping
        console.log(`Original status: "${status}", length: ${status.length}`);
        const cleanStatus = status.trim(); // Remove any whitespace
        console.log(`Cleaned status: "${cleanStatus}", length: ${cleanStatus.length}`);
        const trangThaiNumber = hoaDonStore.mapStatusToNumber(cleanStatus);
        console.log(`Filtering by status "${cleanStatus}" -> number: ${trangThaiNumber}`);

        if (trangThaiNumber !== null) {
          hoaDonStore.updateFilters({
            keyword: keyword.value,
            minAmount: rangeMin.value,
            maxAmount: rangeMax.value,
            startDate: startDate.value,
            endDate: endDate.value,
            trangThai: trangThaiNumber,  // Lọc chính xác theo số trạng thái
            loaiDon: hoaDonStore.filters.loaiDon,  // Giữ nguyên loại đơn hiện tại
            sortBy: sortBy.value,
            sortDir: sortDir.value
          });

          toastNotification.value?.addToast({
            type: 'info',
            message: `Đã lọc theo trạng thái: ${status}`,
            duration: 2000,
          });
        } else {
          toastNotification.value?.addToast({
            type: 'error',
            message: `Không tìm thấy mapping cho trạng thái: ${status}`,
            duration: 3000,
          });
        }
      }
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

    const getTypeBadgeClass = (type) => {
      return ['online', 'trực tiếp'].includes((type || '').toLowerCase()) ? 'badge-info' : 'badge-info';
    };

    // Khởi tạo
    onMounted(() => {
      hoaDonStore.fetchInvoices({ page: 0, size: itemsPerPage.value });
    });

    // Watch invoices để update range nếu null
    watch(invoices, (newInvoices) => {
      if (newInvoices.length > 0) {
        const min = Math.min(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        const max = Math.max(...newInvoices.map((inv) => inv.tongTienSauGiam || 0));
        if (rangeMin.value === null) {
          rangeMin.value = min;
          rangeMinDisplay.value = formatCurrency(min);
        }
        if (rangeMax.value === null) {
          rangeMax.value = max;
          rangeMaxDisplay.value = formatCurrency(max);
        }
      }
    }, { immediate: true });

    // Watch tất cả filter để update store và fetch (đồng bộ)
    watch([keyword, rangeMin, rangeMax, startDate, endDate, sortBy, sortDir], () => {
      hoaDonStore.updateFilters({
        keyword: keyword.value,
        minAmount: rangeMin.value,
        maxAmount: rangeMax.value,
        startDate: startDate.value,
        endDate: endDate.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
      });
      currentPage.value = 1;  // Reset UI page
    }, { deep: true });

    // Watch currentPage để fetch page mới (0-based cho API)
    watch(currentPage, (newPage) => {
      hoaDonStore.fetchInvoices({ page: newPage - 1, size: itemsPerPage.value });
    });

    return {
      keyword,
      rangeMin,
      rangeMax,
      rangeMinDisplay,
      rangeMaxDisplay,
      rangeError,
      startDate,
      endDate,
      viewMode,
      currentPage,
      itemsPerPage,
      activeTab,
      activeStatus,  // Track selected status filter
      sortBy,  // Mới
      sortDir,  // Mới
      invoices,
      isLoading,
      error,
      totalElements,
      headers,
      minInvoiceTotal,
      maxInvoiceTotal,
      // sliderRangeStyle,  // Giữ nếu cần, nhưng không dùng client filter
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
      debouncedRangeMin,
      debouncedRangeMax,
      handleRangeMinBlur,
      handleRangeMaxBlur,
      formatCurrency,
      parseCurrency,
      exportExcel,
      scanQR,
      stopCamera,
      viewInvoice,
      printInvoice,
      downloadQrCode,
      confirmDeleteInvoice,
      deleteInvoice,
      // resetNotification,
      setActiveTab,
      setActiveTabByStatus,
      getStatusBadgeClass,
      getTypeBadgeClass,
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
      groupedProducts,
    };
  },
};
