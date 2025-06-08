import { ref, computed } from 'vue';
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
    // State
    const invoice = ref({
      ma: 'HD001',
      loaiDon: 'Online',
      trangThai: 'Đang giao',
      idPhieuGiamGia: { ma: 'PGG001' },
      ngayTao: '22/01/2024 15:45:11',
      idKhachHang: { ten: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
      soDienThoaiKhachHang: '0123456789',
      diaChiKhachHang: '123 Đường Láng, Hà Nội',
    });

    const products = ref([
      {
        id: 1,
        name: 'iPhone 14 Pro',
        imei: '123456789012345',
        price: 25000000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/x/media/catalog/product/t/_/t_m_18_1_3_2.png',
      },
      {
        id: 2,
        name: 'Samsung Galaxy S23',
        imei: '234567890123456',
        price: 18000000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-s23_1.png',
      },
    ]);

    const payments = ref([
      {
        id: 1,
        code: 'TT001',
        method: 'Tiền mặt',
        amount: 10000000,
        note: 'N/A',
        confirmedBy: 'NV001',
        status: 'completed',
        timestamp: '22/01/2024 15:50:11',
      },
      {
        id: 2,
        code: 'TT002',
        method: 'Chuyển khoản',
        amount: 15000000,
        note: 'N/A',
        confirmedBy: 'NV001',
        status: 'completed',
        timestamp: '22/01/2024 16:00:00',
      },
    ]);

    const history = ref([
      {
        id: 1,
        code: 'LSHD001',
        invoice: 'HD001',
        employee: 'NV001',
        action: 'Tạo hóa đơn',
        timestamp: '22/01/2024 15:45:11',
        status: 'completed',
      },
      {
        id: 2,
        code: 'LSHD002',
        invoice: 'HD001',
        employee: 'NV001',
        action: 'Cập nhật trạng thái',
        timestamp: '22/01/2024 16:30:00',
        status: 'completed',
      },
    ]);

    const timelineStatuses = ref([
      {
        title: 'Đặt Hàng',
        time: '15:45:11 - 22/01/2024',
        icon: 'bi bi-check2',
        completed: true,
      },
      {
        title: 'Chờ Xác Nhận',
        time: '15:45:11 - 22/01/2024',
        icon: 'bi bi-hourglass-split',
        completed: true,
      },
      {
        title: 'Đang Giao',
        time: 'Đang chờ',
        icon: 'bi bi-truck',
        current: true,
      },
      {
        title: 'Hoàn Thành',
        time: 'Đang chờ',
        icon: 'bi bi-check-circle',
        completed: false,
      },
    ]);

    const totalPrice = computed(() => 
      products.value.reduce((sum, product) => sum + product.price * (product.quantity || 1), 0)
    );
    const discount = ref(2500000);
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
      { label: 'Mã đơn hàng:', value: invoice.value.ma, key: 'ma' },
      { label: 'Loại đơn:', value: invoice.value.loaiDon, key: 'loaiDon', icon: getTypeIcon(invoice.value.loaiDon) },
      { label: 'Trạng thái:', value: invoice.value.trangThai, key: 'trangThai', icon: getStatusIcon(invoice.value.trangThai) },
      { label: 'Phiếu giảm giá:', value: invoice.value.idPhieuGiamGia?.ma || 'Không có', key: 'idPhieuGiamGia' },
      { label: 'Ngày đặt:', value: invoice.value.ngayTao, key: 'ngayTao' },
    ]);

    const customerInfo = computed(() => [
      { label: 'Tên khách hàng:', value: invoice.value.idKhachHang?.ten, icon: 'bi bi-person', key: 'ten' },
      { label: 'Số điện thoại:', value: invoice.value.soDienThoaiKhachHang, icon: 'bi bi-telephone', key: 'soDienThoai' },
      { label: 'Địa chỉ:', value: invoice.value.diaChiKhachHang, icon: 'bi bi-geo-alt', key: 'diaChi' },
      { label: 'Email:', value: invoice.value.idKhachHang?.email, icon: 'bi bi-envelope', key: 'email' },
      { label: 'Ghi chú:', value: invoice.value.ghiChu || 'Không có', icon: 'bi bi-sticky', key: 'ghiChu' },
    ]);

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
      toastNotification.value.addToast({
        type: 'success',
        message: 'Đã cập nhật thông tin',
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

    const printInvoice = () => {
      toastNotification.value.addToast({
        type: 'success',
        message: 'Hóa đơn đang được in...',
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