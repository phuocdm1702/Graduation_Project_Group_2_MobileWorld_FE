// File: HoaDonChiTiet.js
import { ref, computed, onMounted } from 'vue';
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
    const timelineStatuses = ref([
      { title: 'Chờ xác nhận', time: 'Đang chờ', icon: 'bi bi-hourglass-split', completed: false, current: false },
      { title: 'Chờ giao hàng', time: 'Đang chờ', icon: 'bi bi-box-seam', completed: false, current: false },
      { title: 'Đang giao', time: 'Đang chờ', icon: 'bi bi-truck', completed: false, current: false },
      { title: 'Hoàn thành', time: 'Đang chờ', icon: 'bi bi-check-circle', completed: false, current: false }, // Mặc định là Hoàn thành
    ]);
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
          console.log('Invoice status:', invoice.value.trangThai);
          updateTimelineStatuses();
          console.log('Timeline statuses:', timelineStatuses.value);
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

    // Update timeline statuses based on invoice status
    const updateTimelineStatuses = () => {
      const status = invoice.value.trangThai;
      console.log('Updating timeline with status:', status);

      // Nếu trạng thái là "Đã hủy", thay trạng thái thứ 4 thành "Đã hủy"
      if (status === 'Đã hủy') {
        timelineStatuses.value[3] = {
          title: 'Đã hủy',
          time: invoice.value.ngayTao || 'Đang chờ',
          icon: 'bi bi-x-circle',
          completed: false,
          current: false
        };
      } else {
        // Nếu không phải "Đã hủy", đảm bảo trạng thái thứ 4 là "Hoàn thành"
        timelineStatuses.value[3] = {
          title: 'Hoàn thành',
          time: invoice.value.ngayTao || 'Đang chờ',
          icon: 'bi bi-check-circle',
          completed: false,
          current: false
        };
      }

      // Cập nhật trạng thái completed và current
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

      console.log('Updated timelineStatuses:', timelineStatuses.value);
    };

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const truncateIMEI = (imei) => {
      return imei.length > 10 ? `${ imei.slice(0, 10) }...` : imei;
    };

    const getTypeBadgeClass = (type) => {
      return {
        'Online': 'badge-info',
        'Tại quầy': 'badge-info',
      }[type] || 'badge-secondary';
    };

    const getTypeIcon = (type) => {
      return {
        'Online': 'bi bi-globe',
        'Tại quầy': 'bi bi-shop',
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
          message: `Đã xóa IMEI ${ imei } `,
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
          message: `Đã thêm sản phẩm ${ newProduct.value.name } `,
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
      toastNotification.value.addToast({
        type: 'success',
        message: 'Đã cập nhật thông tin',
        duration: 3000,
      });
      updateTimelineStatuses(); // Cập nhật timeline sau khi lưu
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
      notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${ item.name }?`;
      notificationOnConfirm.value = () => {
        isNotificationLoading.value = true;
        setTimeout(() => {
          products.value = products.value.filter((p) => p.id !== item.id);
          isNotificationLoading.value = false;
          toastNotification.value.addToast({
            type: 'success',
            message: `Đã xóa sản phẩm ${ item.name } `,
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
    };
  },
};