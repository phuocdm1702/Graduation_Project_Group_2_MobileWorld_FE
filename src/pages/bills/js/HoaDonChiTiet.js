import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHoaDonStore } from '@/store/modules/orders/hoaDon';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

export default {
  name: 'InvoiceDetail',
  components: {
    HeaderCard,
    FilterTableSection,
    NotificationModal,
    ToastNotification,
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
    const isAddProductModalVisible = ref(false);
    const isUpdateModalVisible = ref(false);
    const isDivinationModalVisible = ref(false);
    const selectedProduct = ref(null);
    const newIMEI = ref('');
    const newProduct = ref({
      name: '',
      price: 0,
      quantity: 1,
      image: '',
      imei: ''
    });
    const activeTab = ref('order');
    const divinationResult = ref({
      title: 'Chưa có quẻ',
      description: 'Nhấn "Lấy Quẻ Mới" để nhận gợi ý.'
    });
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});
    const notificationModal = ref(null);
    const toastNotification = ref(null);

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

    // Methods
    const updateTimelineStatuses = () => {
      if (invoice.value.loaiDon === 'trực tiếp') {
        timelineStatuses.value = [
          { 
            title: 'Hoàn thành', 
            time: invoice.value.ngayTao || 'Đang chờ', 
            icon: 'bi bi-check-circle', 
            completed: true, 
            current: true 
          }
        ];
      } else {
        const status = invoice.value.trangThai;
        // Update timeline for "Đã hủy" case
        if (status === 'Đã hủy') {
          timelineStatuses.value[3] = {
            title: 'Đã hủy',
            time: invoice.value.ngayTao || 'Đang chờ',
            icon: 'bi bi-x-circle',
            completed: false,
            current: true
          };
        } else {
          timelineStatuses.value[3] = {
            title: 'Hoàn thành',
            time: invoice.value.ngayTao || 'Đang chờ',
            icon: 'bi bi-check-circle',
            completed: false,
            current: false
          };
        }

        // Update completed and current status
        timelineStatuses.value.forEach((item, index) => {
          item.completed = false;
          item.current = false;
          item.time = invoice.value.ngayTao || 'Đang chờ';
          if (item.title === status) {
            item.current = true;
            item.completed = true;
          } else if (status !== 'Đã hủy' && index < timelineStatuses.value.findIndex(s => s.title === status)) {
            item.completed = true;
          }
        });
      }
    };

    // Watch invoice.loaiDon to update timelineStatuses reactively
    watch(() => invoice.value.loaiDon, (newLoaiDon) => {
      if (newLoaiDon === 'trực tiếp') {
        timelineStatuses.value = [
          { 
            title: 'Hoàn thành', 
            time: invoice.value.ngayTao || 'Đang chờ', 
            icon: 'bi bi-check-circle', 
            completed: true, 
            current: true 
          }
        ];
      } else {
        timelineStatuses.value = [
          { title: 'Chờ xác nhận', time: 'Đang chờ', icon: 'bi bi-hourglass-split', completed: false, current: false },
          { title: 'Chờ giao hàng', time: 'Đang chờ', icon: 'bi bi-box-seam', completed: false, current: false },
          { title: 'Đang giao', time: 'Đang chờ', icon: 'bi bi-truck', completed: false, current: false },
          { title: 'Hoàn thành', time: 'Đang chờ', icon: 'bi bi-check-circle', completed: false, current: false },
        ];
        updateTimelineStatuses();
      }
    }, { immediate: true });

    // Fetch invoice detail on mount
    onMounted(async () => {
      if (invoiceId.value) {
        await hoaDonStore.fetchInvoiceDetail(invoiceId.value);
        if (hoaDonStore.getInvoiceDetail) {
          invoice.value = hoaDonStore.getInvoiceDetail;
          products.value = hoaDonStore.getInvoiceDetail.products;
          payments.value = hoaDonStore.getInvoiceDetail.payments;
          history.value = hoaDonStore.getInvoiceDetail.history;
          discount.value = totalPrice.value - invoice.value.tongTienSauGiam;
          // TimelineStatuses will be updated by the watch above
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

    // Methods
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
        'Đang giao': 'badge-waiting',
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

    const getBadgeClass = (key, value) => {
      if (key === 'loaiDon') return getTypeBadgeClass(value);
      if (key === 'trangThai') return getStatusBadgeClass(value);
      return '';
    };

    const getPaymentTime = (payment) => {
      return payment.timestamp ? payment.timestamp.split(' ')[1] : 'N/A';
    };

    const showIMEIModal = (item) => {
      selectedProduct.value = item;
      isIMEIModalVisible.value = true;
    };

    const closeIMEIModal = () => {
      isIMEIModalVisible.value = false;
      selectedProduct.value = null;
      newIMEI.value = '';
    };

    const addIMEI = () => {
      if (newIMEI.value && selectedProduct.value) {
        const currentIMEIs = selectedProduct.value.imei ? selectedProduct.value.imei.split(', ') : [];
        if (!currentIMEIs.includes(newIMEI.value)) {
          currentIMEIs.push(newIMEI.value);
          selectedProduct.value.imei = currentIMEIs.join(', ');
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

    const saveIMEIChanges = () => {
      toastNotification.value.addToast({
        type: 'success',
        message: 'Đã lưu thay đổi IMEI',
        duration: 3000,
      });
      closeIMEIModal();
    };

    const deleteIMEI = (imei) => {
      if (selectedProduct.value) {
        const currentIMEIs = selectedProduct.value.imei.split(', ').filter(i => i !== imei);
        selectedProduct.value.imei = currentIMEIs.join(', ');
        toastNotification.value.addToast({
          type: 'success',
          message: `Đã xóa IMEI ${imei}`,
          duration: 3000,
        });
      }
    };

    const showAddProductModal = () => {
      isAddProductModalVisible.value = true;
    };

    const closeAddProductModal = () => {
      isAddProductModalVisible.value = false;
      newProduct.value = { name: '', price: 0, quantity: 1, image: '', imei: '' };
    };

    const addProduct = () => {
      if (newProduct.value.name && newProduct.value.price) {
        products.value.push({
          id: products.value.length + 1,
          ...newProduct.value
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
          message: 'Vui lòng nhập đầy đủ thông tin sản phẩm',
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

    const saveUpdateChanges = () => {
      // Add to history if status changed
      if (history.value[history.value.length - 1]?.action !== `Cập nhật trạng thái: ${invoice.value.trangThai}`) {
        history.value.push({
          id: history.value.length + 1,
          action: `Cập nhật trạng thái: ${invoice.value.trangThai}`,
          employee: 'Hệ thống',
          timestamp: new Date().toLocaleString('vi-VN'),
          status: 'completed'
        });
      }
      
      // Update timeline
      updateTimelineStatuses();
      
      toastNotification.value.addToast({
        type: 'success',
        message: 'Đã cập nhật thông tin hóa đơn thành công',
        duration: 3000,
      });
      
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
          description: 'Chức Năng Đang Phát Triển!'
        }
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
          isNotificationLoading.value = false;
          toastNotification.value.addToast({
            type: 'success',
            message: `Đã xóa sản phẩm ${item.name}`,
            duration: 3000,
          });
          resetNotification();
        }, 500);
      };
      notificationOnCancel.value = () => {};
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

    const changeStatus = (status) => {
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

      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn thay đổi trạng thái thành "${status}"?`;
      notificationOnConfirm.value = () => {
        isNotificationLoading.value = true;
        setTimeout(() => {
          invoice.value.trangThai = status;
          updateTimelineStatuses();
          history.value.push({
            id: history.value.length + 1,
            action: `Cập nhật trạng thái: ${status}`,
            employee: 'Hệ thống',
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'completed'
          });
          toastNotification.value.addToast({
            type: 'success',
            message: `Cập nhật trạng thái thành công: ${status}`,
            duration: 3000,
          });
          isNotificationLoading.value = false;
          resetNotification();
        }, 500);
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
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
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
      isAddProductModalVisible,
      isUpdateModalVisible,
      isDivinationModalVisible,
      selectedProduct,
      newIMEI,
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
      formatPrice,
      truncateIMEI,
      getTypeBadgeClass,
      getTypeIcon,
      getStatusBadgeClass,
      getStatusIcon,
      getBadgeClass,
      getPaymentTime,
      showIMEIModal,
      closeIMEIModal,
      addIMEI,
      saveIMEIChanges,
      deleteIMEI,
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
      changeStatus
    };
  },
};