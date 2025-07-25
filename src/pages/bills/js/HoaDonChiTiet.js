import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHoaDonStore } from '@/store/modules/orders/hoaDon';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import DataTable from '@/components/common/DataTable.vue';

export default {
  name: 'InvoiceDetail',
  components: {
    HeaderCard,
    FilterTableSection,
    NotificationModal,
    ToastNotification,
    DataTable,
  },
  setup() {
    const route = useRoute();
    const hoaDonStore = useHoaDonStore();
    const invoiceId = computed(() => route.params.id);

    // State
    const invoice = ref({});
    const products = ref([]);
    const payments = ref([]);
    const history = ref([]);
    const timelineStatuses = ref([]);
    const totalPrice = computed(() =>
      products.value.reduce((sum, product) => sum + product.price * (product.quantity || 1), 0)
    );
    const discount = ref(0);
    const isIMEIModalVisible = ref(false);
    const isConfirmIMEIModalVisible = ref(false);
    const isAddProductModalVisible = ref(false);
    const isUpdateModalVisible = ref(false);
    const isDivinationModalVisible = ref(false);
    const selectedProduct = ref(null);
    const newIMEI = ref('');
    const searchIMEI = ref('');
    const newProduct = ref({
      name: '',
      price: 0,
      quantity: 1,
      image: '',
      imei: '',
      ram: '',
      capacity: '',
      color: '',
    });
    const activeTab = ref('order');
    const divinationResult = ref({
      title: 'Chưa có quẻ',
      description: 'Nhấn "Lấy Quẻ Mới" để nhận gợi ý.',
    });
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => { });
    const notificationOnCancel = ref(() => { });
    const notificationModal = ref(null);
    const toastNotification = ref(null);

    // State cho phân trang IMEI
    const imeiCurrentPage = ref(1);
    const imeiItemsPerPage = ref(99999999);
    const imeiPageSizeOptions = ref([5, 10, 15, 20, 50]);

    // Computed properties
    const orderInfo = computed(() => [
      { label: 'Mã đơn hàng:', value: invoice.value.ma || 'N/A', key: 'ma' },
      { label: 'Loại đơn:', value: invoice.value.loaiDon || 'N/A', key: 'loaiDon', icon: getTypeIcon(invoice.value.loaiDon) },
      { label: 'Trạng thái:', value: invoice.value.trangThai || 'N/A', key: 'trangThai', icon: getStatusIcon(invoice.value.trangThai) },
      { label: 'Phiếu giảm giá:', value: invoice.value.idPhieuGiamGia?.ma || 'Không có', key: 'idPhieuGiamGia' },
      { label: 'Ngày đặt:', value: invoice.value.ngayTao || 'N/A', key: 'ngayTao' },
    ]);

    const customerInfo = computed(() => [
      { label: 'Tên khách hàng:', value: invoice.value.idKhachHang?.ten || 'N/A', icon: 'bi bi-person', key: 'ten' },
      { label: 'Số điện thoại:', value: invoice.value.soDienThoaiKhachHang || 'N/A', icon: 'bi bi-telephone', key: 'soDienThoai' },
      { label: 'Địa chỉ:', value: invoice.value.diaChiKhachHang || 'N/A', icon: 'bi bi-geo-alt', key: 'diaChi' },
      { label: 'Email:', value: invoice.value.idKhachHang?.email || 'N/A', icon: 'bi bi-envelope', key: 'email' },
      { label: 'Ghi chú:', value: invoice.value.ghiChu || 'Không có', icon: 'bi bi-sticky', key: 'ghiChu' },
    ]);

    const filteredIMEIs = computed(() => {
      const imeiList = hoaDonStore.getImelList;
      if (!searchIMEI.value) return imeiList;
      return imeiList.filter(imeiObj =>
        imeiObj.imei ? imeiObj.imei.toLowerCase().includes(searchIMEI.value.toLowerCase()) : false
      );
    });

    const totalIMEIPages = computed(() => {
      return Math.ceil(filteredIMEIs.value.length / imeiItemsPerPage.value);
    });

    const paginatedIMEIs = computed(() => {
      const start = (imeiCurrentPage.value - 1) * imeiItemsPerPage.value;
      const end = start + imeiItemsPerPage.value;
      return filteredIMEIs.value.slice(start, end);
    });

    const imeiHeaders = ref([
      { text: 'STT', value: 'stt' },
      { text: 'Mã IMEI', value: 'maImel' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Trạng thái', value: 'status', formatter: (value) => value || 'N/A' },
      { text: 'Thao tác', value: 'actions' },
    ]);

    // Methods
    const updateTimelineStatuses = () => {
      if (invoice.value.loaiDon === 'trực tiếp') {
        timelineStatuses.value = [
          {
            title: 'Hoàn thành',
            time: invoice.value.ngayTao || 'Đang chờ',
            icon: 'bi bi-check-circle',
            completed: true,
            current: true,
          },
        ];
      } else {
        timelineStatuses.value = [
          { title: 'Chờ xác nhận', time: 'Đang chờ', icon: 'bi bi-hourglass-split', completed: false, current: false },
          { title: 'Chờ giao hàng', time: 'Đang chờ', icon: 'bi bi-box-seam', completed: false, current: false },
          { title: 'Đang giao', time: 'Đang chờ', icon: 'bi bi-truck', completed: false, current: false },
          { title: 'Hoàn thành', time: 'Đang chờ', icon: 'bi bi-check-circle', completed: false, current: false },
        ];

        const status = invoice.value.trangThai;
        if (status === 'Đã hủy') {
          timelineStatuses.value = [
            {
              title: 'Đã hủy',
              time: invoice.value.ngayTao || 'Đang chờ',
              icon: 'bi bi-x-circle',
              completed: false,
              current: true,
            },
          ];
        } else {
          timelineStatuses.value.forEach((item, index) => {
            item.completed = false;
            item.current = false;
            item.time = invoice.value.ngayTao || 'Đang chờ';
            if (item.title === status) {
              item.current = true;
              item.completed = true;
            } else if (index < timelineStatuses.value.findIndex(s => s.title === status)) {
              item.completed = true;
            }
          });
        }
      }
    };

    watch(() => invoice.value.loaiDon, (newLoaiDon) => {
      updateTimelineStatuses();
    }, { immediate: true });

    watch(() => invoice.value.trangThai, () => {
      updateTimelineStatuses();
    });

    watch(() => hoaDonStore.getImelList, (newImelList) => {
      console.log('ImelList updated:', newImelList);
      products.value = products.value.map(product => ({
        ...product,
        imeiList: product.imei ? product.imei.split(', ').map(imei => ({
          imei,
          status: newImelList.find(i => i.imei === imei)?.status || 'pending',
        })) : [],
      }));
    }, { deep: true });

    onMounted(async () => {
      if (invoiceId.value) {
        await hoaDonStore.fetchInvoiceDetail(invoiceId.value);
        if (hoaDonStore.getInvoiceDetail) {
          invoice.value = hoaDonStore.getInvoiceDetail;
          products.value = hoaDonStore.getInvoiceDetail.products.map(product => ({
            ...product,
            imeiList: product.imei ? product.imei.split(', ').map(imei => ({
              imei,
              status: hoaDonStore.getImelList.find(i => i.imei === imei)?.status || 'pending',
            })) : [],
          }));
          payments.value = hoaDonStore.getInvoiceDetail.payments;
          history.value = hoaDonStore.getInvoiceDetail.history;
          discount.value = totalPrice.value - invoice.value.tongTienSauGiam;
          updateTimelineStatuses();
        }
        if (hoaDonStore.getError) {
          toastNotification.value.addToast({
            type: 'error',
            message: hoaDonStore.getError,
            duration: 5000,
          });
        }
      }
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const truncateIMEI = (imei) => {
      return imei.length > 10 ? `${imei.slice(0, 10)}...` : imei;
    };

    const getTypeBadgeClass = (type) => {
      return {
        'Online': 'badge-info',
        'trực tiếp': 'badge-info',
      }[type] || 'badge-secondary';
    };

    const getTypeIcon = (type) => {
      return {
        'Online': 'bi bi-globe',
        'trực tiếp': 'bi bi-shop',
      }[type] || 'bi bi-receipt';
    };

    const getStatusBadgeClass = (status) => {
      return {
        'Chờ xác nhận': 'badge-waiting',
        'Chờ giao hàng': 'badge-waiting',
        'Đang giao': 'badge-delivering',
        'Hoàn thành': 'badge-completed',
        'Đã hủy': 'badge-canceled',
      }[status] || 'badge-secondary';
    };

    const getStatusIcon = (status) => {
      return {
        'Chờ xác nhận': 'bi bi-hourglass-split',
        'Chờ giao hàng': 'bi bi-box-seam',
        'Đang giao': 'bi bi-truck',
        'Hoàn thành': 'bi bi-check-circle',
        'Đã hủy': 'bi bi-x-circle',
      }[status] || 'bi bi-info-circle';
    };

    const getIMEIStatusClass = (status) => {
      return {
        'Còn hàng': 'imei-status-valid',
        'Đã bán': 'imei-status-invalid',
        'pending': 'imei-status-pending',
      }[status] || 'imei-status-pending';
    };

    const getIMEIStatusIcon = (status) => {
      return {
        'Còn hàng': 'bi bi-check-circle-fill',
        'Đã bán': 'bi bi-x-circle-fill',
        'pending': 'bi bi-hourglass-split',
      }[status] || 'bi bi-hourglass-split';
    };

    const getBadgeClass = (key, value) => {
      if (key === 'loaiDon') return getTypeBadgeClass(value);
      if (key === 'trangThai') return getStatusBadgeClass(value);
      return '';
    };

    const getPaymentTime = (payment) => {
      return payment.timestamp ? payment.timestamp.split(' ')[1] : 'N/A';
    };

    const showIMEIModal = (item) => {
      selectedProduct.value = { ...item };
      isIMEIModalVisible.value = true;
    };

    const closeIMEIModal = () => {
      isIMEIModalVisible.value = false;
      selectedProduct.value = null;
      newIMEI.value = '';
    };

    const addIMEI = () => {
      if (newIMEI.value && selectedProduct.value) {
        const currentIMEIs = selectedProduct.value.imeiList || [];
        if (!currentIMEIs.some(i => i.imei === newIMEI.value)) {
          const status = hoaDonStore.getImelList.find(i => i.imei === newIMEI.value)?.status || 'pending';
          currentIMEIs.push({ imei: newIMEI.value, status });
          selectedProduct.value.imeiList = currentIMEIs;
          selectedProduct.value.imei = currentIMEIs.map(i => i.imei).join(', ');
          newIMEI.value = '';
          toastNotification.value.addToast({
            type: 'success',
            message: 'Đã thêm IMEI mới',
            duration: 3000,
          });
        } else {
          toastNotification.value.addToast({
            type: 'warning',
            message: 'IMEI đã tồn tại',
            duration: 3000,
          });
        }
      }
    };

    const saveIMEIChanges = async () => {
      const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id);
      if (productIndex !== -1) {
        products.value[productIndex].imei = selectedProduct.value.imeiList.map(i => i.imei).join(', ');
        products.value[productIndex].imeiList = [...selectedProduct.value.imeiList];
        history.value.push({
          id: Date.now(),
          action: `Cập nhật IMEI cho sản phẩm ${selectedProduct.value.name}`,
          employee: 'Hệ thống',
          timestamp: new Date().toLocaleString('vi-VN'),
          status: 'completed',
        });
        toastNotification.value.addToast({
          type: 'success',
          message: 'Đã lưu thay đổi IMEI',
          duration: 3000,
        });
      }
      closeIMEIModal();
    };

    const deleteIMEI = (imei) => {
      if (selectedProduct.value) {
        selectedProduct.value.imeiList = selectedProduct.value.imeiList.filter(i => i.imei !== imei);
        selectedProduct.value.imei = selectedProduct.value.imeiList.map(i => i.imei).join(', ');
        toastNotification.value.addToast({
          type: 'success',
          message: `Đã xóa IMEI ${imei}`,
          duration: 3000,
        });
      }
    };

    const scanQRForIMEI = async () => {
      try {
        const scannedIMEI = '123456789012345';
        newIMEI.value = scannedIMEI;
        searchIMEI.value = scannedIMEI;
        await hoaDonStore.fetchImelList({ page: 0, size: 999999 });
        const imeiStatus = hoaDonStore.getImelList.find(i => i.imei === scannedIMEI)?.status;
        if (imeiStatus === 'Còn hàng') {
          addIMEI();
        } else {
          toastNotification.value.addToast({
            type: 'warning',
            message: `IMEI ${scannedIMEI} không khả dụng`,
            duration: 3000,
          });
        }
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi quét QR code',
          duration: 3000,
        });
      }
    };

    const showConfirmIMEIModal = async (item) => {
      selectedProduct.value = { ...item };
      isConfirmIMEIModalVisible.value = true;
      searchIMEI.value = '';
      imeiCurrentPage.value = 1; // Reset về trang đầu tiên
      await hoaDonStore.fetchImelList({ page: 0, size: 999999 });
      if (hoaDonStore.getError) {
        toastNotification.value.addToast({
          type: 'error',
          message: hoaDonStore.getError,
          duration: 5000,
        });
      } else if (hoaDonStore.getImelList.length === 0) {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Không có IMEI nào khả dụng cho sản phẩm này',
          duration: 5000,
        });
      }
    };

    const closeConfirmIMEIModal = () => {
      isConfirmIMEIModalVisible.value = false;
      selectedProduct.value = null;
      searchIMEI.value = '';
      imeiCurrentPage.value = 1; // Reset trang
    };

    const selectIMEI = (imei) => {
      if (selectedProduct.value) {
        const status = hoaDonStore.getImelList.find(i => i.imei === imei)?.status || 'pending';
        if (status === 'Còn hàng') {
          selectedProduct.value.imei = imei;
          selectedProduct.value.imeiList = [{ imei, status }];
          const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id);
          if (productIndex !== -1) {
            products.value[productIndex] = { ...selectedProduct.value };
          }
          toastNotification.value.addToast({
            type: 'success',
            message: `Đã chọn IMEI ${imei} cho sản phẩm ${selectedProduct.value.name}`,
            duration: 3000,
          });
          closeConfirmIMEIModal();
        } else {
          toastNotification.value.addToast({
            type: 'warning',
            message: `IMEI ${imei} không khả dụng`,
            duration: 3000,
          });
        }
      }
    };

    const showAddProductModal = () => {
      isAddProductModalVisible.value = true;
      newProduct.value = { name: '', price: 0, quantity: 1, image: '', imei: '', ram: '', capacity: '', color: '' };
    };

    const closeAddProductModal = () => {
      isAddProductModalVisible.value = false;
      newProduct.value = { name: '', price: 0, quantity: 1, image: '', imei: '', ram: '', capacity: '', color: '' };
    };

    const addProduct = () => {
      if (newProduct.value.name && newProduct.value.price && newProduct.value.ram && newProduct.value.capacity && newProduct.value.color) {
        const newProductData = {
          id: Date.now(),
          ...newProduct.value,
          imeiList: newProduct.value.imei ? [{ imei: newProduct.value.imei, status: 'pending' }] : [],
        };
        products.value.push(newProductData);
        history.value.push({
          id: Date.now(),
          action: `Thêm sản phẩm ${newProduct.value.name}`,
          employee: 'Hệ thống',
          timestamp: new Date().toLocaleString('vi-VN'),
          status: 'completed',
        });
        toastNotification.value.addToast({
          type: 'success',
          message: `Đã thêm sản phẩm ${newProduct.value.name}`,
          duration: 3000,
        });
        closeAddProductModal();
      } else {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Vui lòng nhập đầy đủ thông tin sản phẩm (Tên, Giá, RAM, Dung lượng, Màu sắc)',
          duration: 3000,
        });
      }
    };

    const showUpdateModal = () => {
      isUpdateModalVisible.value = true;
      activeTab.value = 'order';
    };

    const closeUpdateModal = () => {
      isUpdateModalVisible.value = false;
    };

    const saveUpdateChanges = async () => {
      if (invoice.value.trangThai !== history.value[history.value.length - 1]?.action?.split(': ')[1]) {
        const trangThaiNumber = hoaDonStore.mapStatusToNumber(invoice.value.trangThai);
        const result = await hoaDonStore.updateInvoiceStatus(
          invoice.value.id,
          trangThaiNumber,
          null
        );
        if (result.success) {
          history.value.push({
            id: Date.now(),
            action: `Cập nhật trạng thái: ${invoice.value.trangThai}`,
            employee: 'Hệ thống',
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'completed',
          });
          toastNotification.value.addToast({
            type: 'success',
            message: 'Đã cập nhật thông tin hóa đơn thành công',
            duration: 3000,
          });
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: result.message,
            duration: 3000,
          });
        }
      }
      updateTimelineStatuses();
      closeUpdateModal();
    };

    const showDivinationModal = () => {
      isDivinationModalVisible.value = true;
      generateDivination();
    };

    const closeDivinationModal = () => {
      isDivinationModalVisible.value = false;
    };

    const generateDivination = () => {
      const divinations = [
        {
          title: 'Quét QR',
          description: 'Chức Năng Đang Phát Triển!',
        },
      ];
      divinationResult.value = divinations[Math.floor(Math.random() * divinations.length)];
    };

    const removeProduct = (item) => {
      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${item.name}?`;
      notificationOnConfirm.value = () => {
        isNotificationLoading.value = true;
        setTimeout(() => {
          products.value = products.value.filter((p) => p.id !== item.id);
          history.value.push({
            id: Date.now(),
            action: `Xóa sản phẩm ${item.name}`,
            employee: 'Hệ thống',
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'completed',
          });
          isNotificationLoading.value = false;
          toastNotification.value.addToast({
            type: 'success',
            message: `Đã xóa sản phẩm ${item.name}`,
            duration: 3000,
          });
          resetNotification();
        }, 500);
      };
      notificationOnCancel.value = () => {
        resetNotification();
      };
      isNotificationLoading.value = false;
      notificationModal.value.openModal();
    };

    const printInvoice = async () => {
      const result = await hoaDonStore.printInvoice(invoiceId.value);
      toastNotification.value?.addToast({
        type: result.success ? 'success' : 'error',
        message: result.message,
        duration: 3000,
      });
    };

    const checkAllProductsHaveIMEI = () => {
      return products.value.every(product => product.imei && product.imei.trim() !== '' && product.imeiList.every(i => i.status === 'Còn hàng'));
    };

    const changeStatus = async (status) => {
      if (invoice.value.loaiDon === 'trực tiếp') {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể thay đổi trạng thái cho đơn trực tiếp',
          duration: 3000,
        });
        return;
      }
      if (invoice.value.trangThai === 'Hoàn thành' || invoice.value.trangThai === 'Đã hủy') {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể thay đổi trạng thái từ trạng thái hiện tại',
          duration: 3000,
        });
        return;
      }
      if (status === 'Chờ giao hàng' && !checkAllProductsHaveIMEI()) {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Vui lòng chọn và xác nhận IMEI hợp lệ cho tất cả sản phẩm trước khi chuyển sang trạng thái "Chờ giao hàng"',
          duration: 5000,
        });
        return;
      }

      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn thay đổi trạng thái thành "${status}"?`;
      notificationOnConfirm.value = async () => {
        isNotificationLoading.value = true;
        try {
          const trangThaiNumber = hoaDonStore.mapStatusToNumber(status);
          const result = await hoaDonStore.updateInvoiceStatus(
            invoice.value.id,
            trangThaiNumber,
            null
          );
          if (result.success) {
            invoice.value.trangThai = status;
            updateTimelineStatuses();
            history.value.push({
              id: Date.now(),
              action: `Cập nhật trạng thái: ${status}`,
              employee: 'Hệ thống',
              timestamp: new Date().toLocaleString('vi-VN'),
              status: 'completed',
            });
            toastNotification.value.addToast({
              type: 'success',
              message: `Cập nhật trạng thái thành công: ${status}`,
              duration: 3000,
            });
          } else {
            toastNotification.value.addToast({
              type: 'error',
              message: result.message,
              duration: 3000,
            });
          }
        } catch (error) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Lỗi khi cập nhật trạng thái',
            duration: 3000,
          });
        } finally {
          isNotificationLoading.value = false;
          resetNotification();
        }
      };
      notificationOnCancel.value = () => {
        resetNotification();
      };
      isNotificationLoading.value = false;
      notificationModal.value.openModal();
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => { };
      notificationOnCancel.value = () => { };
    };

    const resetIMEIFilters = () => {
      searchIMEI.value = '';
      imeiCurrentPage.value = 1;
    };

    const debouncedSearchIMEI = (value) => {
      searchIMEI.value = value;
      imeiCurrentPage.value = 1;
    };

    const getRowClass = (item) => {
      return item.status === 'Còn hàng' ? 'table-row-valid' : 'table-row-invalid';
    };

    const updateIMEIPage = (page) => {
      imeiCurrentPage.value = page;
    };

    const updateIMEIItemsPerPage = (value) => {
      imeiItemsPerPage.value = value;
      imeiCurrentPage.value = 1; // Reset về trang đầu tiên
    };

    return {
      invoice,
      products,
      payments,
      history,
      timelineStatuses,
      totalPrice,
      discount,
      isIMEIModalVisible,
      isConfirmIMEIModalVisible,
      isAddProductModalVisible,
      isUpdateModalVisible,
      isDivinationModalVisible,
      selectedProduct,
      newIMEI,
      searchIMEI,
      filteredIMEIs,
      paginatedIMEIs,
      newProduct,
      activeTab,
      divinationResult,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
      orderInfo,
      customerInfo,
      imeiHeaders,
      imeiCurrentPage,
      imeiItemsPerPage,
      imeiPageSizeOptions,
      totalIMEIPages,
      formatPrice,
      truncateIMEI,
      getTypeBadgeClass,
      getTypeIcon,
      getStatusBadgeClass,
      getStatusIcon,
      getIMEIStatusClass,
      getIMEIStatusIcon,
      getBadgeClass,
      getPaymentTime,
      showIMEIModal,
      closeIMEIModal,
      addIMEI,
      saveIMEIChanges,
      deleteIMEI,
      scanQRForIMEI,
      showConfirmIMEIModal,
      closeConfirmIMEIModal,
      selectIMEI,
      showAddProductModal,
      closeAddProductModal,
      addProduct,
      showUpdateModal,
      closeUpdateModal,
      saveUpdateChanges,
      showDivinationModal,
      closeDivinationModal,
      generateDivination,
      removeProduct,
      printInvoice,
      resetNotification,
      updateTimelineStatuses,
      changeStatus,
      resetIMEIFilters,
      debouncedSearchIMEI,
      getRowClass,
      updateIMEIPage,
      updateIMEIItemsPerPage,
    };
  },
};