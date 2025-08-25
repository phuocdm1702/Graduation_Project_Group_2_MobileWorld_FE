import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHoaDonStore } from '@/store/modules/orders/hoaDon';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import DataTable from '@/components/common/DataTable.vue';
import { apiService } from '@/services/api';
import { debounce } from 'lodash';
import {
  fetchProductsApi,
  fetchIMEIsApi,
  getProductDetailsByIdApi,
} from '@/store/modules/sales/banHangApi';

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
    const isLoadingIMEI = ref(false); // Trạng thái loading cho selectIMEI

    // State cho phân trang IMEI
    const imeiCurrentPage = ref(1);
    const imeiItemsPerPage = ref(100);
    const imeiPageSizeOptions = ref([5, 10, 15, 20, 50]);
    // Thêm state cho phân trang sản phẩm
    const productCurrentPage = ref(1);
    const productItemsPerPage = ref(5);  // Mặc định 10 sản phẩm/trang
    const productPageSizeOptions = ref([5, 10, 15, 20, 50]);

    // Thêm state mới cho hiển thị sản phẩm và IMEI (không trùng với IMEI hiện có)
    const productList = ref([]);  // Danh sách sản phẩm từ API
    const availableIMEIsNew = ref([]);  // IMEI mới
    const selectedIMEIsNew = ref([]);
    const showNewIMEIModal = ref(false);  // Modal IMEI mới
    const productSearchQuery = ref('');
    const filterColor = ref('');
    const filterRam = ref('');
    const filterStorage = ref('');
    const selectedNewProduct = ref(null);

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

    // Cập nhật productHeaders
    const productHeaders = ref([
      { text: 'STT', value: 'stt' },
      // { text: 'Hình ảnh', value: 'image', formatter: (value) => `<img src="${value || '/assets/placeholder-product.png'}" alt="Product Image" style="max-height: 50px;" />` },
      { text: 'Tên sản phẩm', value: 'tenSanPham' },
      { text: 'Màu sắc', value: 'mauSac' },
      { text: 'RAM', value: 'dungLuongRam' },
      { text: 'Bộ nhớ', value: 'dungLuongBoNhoTrong' },
      { text: 'Giá', value: 'giaBan', formatter: (value) => formatPrice(value) },
      { text: 'Thao tác', value: 'actions' },
    ]);

    // Thêm computed mới cho lọc sản phẩm
    const uniqueColors = computed(() => [...new Set(productList.value.map((p) => p.mauSac))]);
    const uniqueRams = computed(() => [...new Set(productList.value.map((p) => p.dungLuongRam))]);
    const uniqueStorages = computed(() => [...new Set(productList.value.map((p) => p.dungLuongBoNhoTrong))]);

    const filteredProducts = computed(() => {
      let filtered = productList.value;
      if (productSearchQuery.value) {
        const query = productSearchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.tenSanPham.toLowerCase().includes(query) ||
            p.maSanPham.toLowerCase().includes(query) ||
            p.mauSac.toLowerCase().includes(query)
        );
      }
      if (filterColor.value) {
        filtered = filtered.filter((p) => p.mauSac === filterColor.value);
      }
      if (filterRam.value) {
        filtered = filtered.filter((p) => p.dungLuongRam === filterRam.value);
      }
      if (filterStorage.value) {
        filtered = filtered.filter(
          (p) => p.dungLuongBoNhoTrong === filterStorage.value
        );
      }
      return filtered;
    });

    const filteredIMEIs = computed(() => {
      const imeiList = hoaDonStore.getImelList;
      if (!searchIMEI.value) return imeiList;
      return imeiList.filter(imeiObj =>
        imeiObj.imei ? imeiObj.imei.toLowerCase().includes(searchIMEI.value.toLowerCase()) : false
      );
    });

    // Thêm hàm debouncedSearchProduct
    const debouncedSearchProduct = debounce((value) => {
      productSearchQuery.value = value;
      productCurrentPage.value = 1;
    }, 300);

    // Thêm hàm resetProductFilters
    const resetProductFilters = () => {
      productSearchQuery.value = '';
      filterColor.value = '';
      filterRam.value = '';
      filterStorage.value = '';
      productCurrentPage.value = 1;
    };

    const totalIMEIPages = computed(() => {
      return Math.ceil(filteredIMEIs.value.length / imeiItemsPerPage.value);
    });

    const totalProductPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / productItemsPerPage.value);
    });

    const paginatedIMEIs = computed(() => {
      const start = (imeiCurrentPage.value - 1) * imeiItemsPerPage.value;
      const end = start + imeiItemsPerPage.value;
      return filteredIMEIs.value.slice(start, end);
    });

    const paginatedProducts = computed(() => {
      const start = (productCurrentPage.value - 1) * productItemsPerPage.value;
      const end = start + productItemsPerPage.value;
      return filteredProducts.value.slice(start, end);
    });

    const imeiHeaders = ref([
      { text: 'STT', value: 'stt' },
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

    const fetchProductsNew = async () => {
      try {
        const data = await fetchProductsApi();
        productList.value = (data.content || data).map(product => ({
          ...product,
          image: product.duongDan || product.anhSanPham || '/assets/placeholder-product.png',
          tenSanPham: product.tenSanPham || product.name,
          mauSac: product.mauSac || product.color,
          dungLuongRam: product.dungLuongRam || product.ram,
          dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
          giaBan: product.giaBan || product.price,
          trangThai: product.trangThai || 'Còn hàng', // Đảm bảo có trường trạng thái
        }));
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách sản phẩm',
          duration: 3000,
        });
      }
    };

    // Thêm methods cho phân trang sản phẩm
    const updateProductPage = (page) => {
      productCurrentPage.value = page;
    };

    const updateProductItemsPerPage = (value) => {
      productItemsPerPage.value = value;
      productCurrentPage.value = 1;
    };

    const showNewIMEIList = async (product) => {
      selectedNewProduct.value = product;
      try {
        availableIMEIsNew.value = await fetchIMEIsApi(
          product.sanPhamId || product.idSanPham,
          product.mauSac,
          product.dungLuongRam,
          product.dungLuongBoNhoTrong
        );
        showNewIMEIModal.value = true;
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: error.message,
          duration: 3000,
        });
      }
    };

    const closeNewIMEIModal = () => {
      showNewIMEIModal.value = false;
      selectedIMEIsNew.value = [];
      selectedNewProduct.value = null;
      availableIMEIsNew.value = [];
    };

    const addProductWithIMEIsNew = async () => {
      if (!selectedNewProduct.value || !selectedIMEIsNew.value.length) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng chọn sản phẩm và ít nhất một IMEI',
          duration: 3000,
        });
        return;
      }

      isNotificationLoading.value = true;
      notificationType.value = 'confirm';
      notificationMessage.value = `Xác nhận gán ${selectedIMEIsNew.value.length} IMEI cho sản phẩm ${selectedNewProduct.value.tenSanPham} vào hóa đơn?`;
      notificationOnConfirm.value = async () => {
        try {
          const imelMap = {};
          selectedIMEIsNew.value.forEach(imei => {
            imelMap[selectedNewProduct.value.chiTietSanPhamId] = imei; // Gửi một hoặc nhiều IMEI
          });
          const response = await apiService.post(`/api/hoa-don/${invoiceId.value}/add-product-to-detail`, imelMap);
          toastNotification.value.addToast({
            type: 'success',
            message: 'Thêm sản phẩm và gán IMEI thành công',
            duration: 3000,
          });
          closeNewIMEIModal();
          resetProductFilters();
          await hoaDonStore.fetchInvoiceDetail(invoiceId.value);
        } catch (error) {
          toastNotification.value.addToast({
            type: 'error',
            message: error.response?.data?.message || 'Lỗi khi thêm sản phẩm',
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
      notificationModal.value.openModal();
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
      await fetchProductsNew();
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
        'online': 'badge-info',
        'trực tiếp': 'badge-info',
      }[type] || 'badge-secondary';
    };

    const getTypeIcon = (type) => {
      return {
        'online': 'bi bi-globe',
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

    const getBadgeClass = (key, value) => {
      if (key === 'loaiDon') return getTypeBadgeClass(value);
      if (key === 'trangThai') return getStatusBadgeClass(value);
      return '';
    };

    const getPaymentTime = (payment) => {
      return payment.timestamp ? payment.timestamp.split(' ')[1] : 'N/A';
    };

    // Cập nhật phương thức showIMEIModal để thêm confirm
    const showIMEIModal = (item) => {
      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn xem IMEI của sản phẩm ${item.name}?`;
      notificationOnConfirm.value = () => {
        selectedProduct.value = { ...item };
        isIMEIModalVisible.value = true;
        resetNotification();
      };
      notificationOnCancel.value = () => {
        resetNotification();
      };
      notificationModal.value.openModal();
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
        const scannedIMEI = '123456789012345'; // Replace with actual QR scan logic
        newIMEI.value = scannedIMEI;
        searchIMEI.value = scannedIMEI;
        if (!selectedProduct.value.idSanPham) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy ID sản phẩm để quét IMEI',
            duration: 5000,
          });
          return;
        }
        await hoaDonStore.fetchImelList({ page: 0, size: 100, idSanPham: selectedProduct.value.idSanPham, chiTietSanPhamId: selectedProduct.value.chiTietSanPhamId });
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

    // Cập nhật phương thức showConfirmIMEIModal để thêm confirm
    const showConfirmIMEIModal = async (item) => {

      selectedProduct.value = { ...item };
      if (!selectedProduct.value.chiTietSanPhamId) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không tìm thấy ID chi tiết sản phẩm cho sản phẩm này',
          duration: 5000,
        });
        resetNotification();
        return;
      }
      try {
        const response = await apiService.get(`/api/chi-tiet-san-pham/${selectedProduct.value.chiTietSanPhamId}/id-san-pham`);
        const idSanPham = response.data;
        if (!idSanPham) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy ID sản phẩm cho chi tiết sản phẩm này',
            duration: 5000,
          });
          resetNotification();
          return;
        }
        selectedProduct.value.idSanPham = idSanPham;
        isConfirmIMEIModalVisible.value = true;
        searchIMEI.value = '';
        imeiCurrentPage.value = 1;
        await hoaDonStore.fetchImelList({
          page: 0,
          size: 100,
          idSanPham: selectedProduct.value.idSanPham,
          chiTietSanPhamId: selectedProduct.value.chiTietSanPhamId,
        });
        if (hoaDonStore.getError) {
          toastNotification.value.addToast({
            type: 'error',
            message: `${hoaDonStore.getError}${hoaDonStore.getError.response?.data?.message ? `: ${hoaDonStore.getError.response.data.message}` : ''}`,
            duration: 5000,
          });
        } else if (hoaDonStore.getImelList.length === 0) {
          toastNotification.value.addToast({
            type: 'warning',
            message: 'Không có IMEI nào khả dụng cho sản phẩm này',
            duration: 5000,
          });
        }
        resetNotification();
      } catch (error) {
        console.error('Error in showConfirmIMEIModal:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: `Lỗi khi lấy ID sản phẩm: ${error.message}`,
          duration: 5000,
        });
        resetNotification();
      }

    };

    const closeConfirmIMEIModal = () => {
      isConfirmIMEIModalVisible.value = false;
      selectedProduct.value = null;
      searchIMEI.value = '';
      imeiCurrentPage.value = 1;
    };

    const selectIMEI = async (imei) => {
      isLoadingIMEI.value = true;
      try {
        console.log('Selecting IMEI:', imei, 'for product:', selectedProduct.value);
        const result = await hoaDonStore.selectIMEI({
          imei,
          selectedProduct: selectedProduct.value,
          invoiceId: invoice.value.id,
          products: products.value,
        });

        if (result.success) {
          const productIndex = products.value.findIndex(p => p.chiTietSanPhamId === selectedProduct.value.chiTietSanPhamId);
          if (productIndex !== -1) {
            products.value[productIndex] = result.updatedProduct;
            history.value.push({
              id: Date.now(),
              action: `Thay thế sản phẩm ${selectedProduct.value.name} bằng ${result.updatedProduct.name} với IMEI ${imei}`,
              employee: 'Hệ thống',
              timestamp: new Date().toLocaleString('vi-VN'),
              status: 'completed',
            });
            toastNotification.value.addToast({
              type: 'success',
              message: result.message,
              duration: 3000,
            });
            closeConfirmIMEIModal();
          }
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: `Lỗi khi thay thế sản phẩm: ${result.message}`,
            duration: 5000,
          });
          if (result.message.includes('không tồn tại') || result.message.includes('đã được bán')) {
            toastNotification.value.addToast({
              type: 'warning',
              message: `Vui lòng kiểm tra lại dữ liệu: ${result.message}`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error in selectIMEI:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: `Lỗi không xác định khi chọn IMEI`,
          duration: 5000,
        });
      } finally {
        isLoadingIMEI.value = false;
      }
    };

    // Cập nhật phương thức showAddProductModal để thêm confirm
    const showAddProductModal = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = 'Bạn có chắc chắn muốn thêm sản phẩm mới?';
      notificationOnConfirm.value = () => {
        isAddProductModalVisible.value = true;
        newProduct.value = { name: '', price: 0, quantity: 1, image: '', imei: '', ram: '', capacity: '', color: '' };
        resetNotification();
      };
      notificationOnCancel.value = () => {
        resetNotification();
      };
      notificationModal.value.openModal();
    };

    const closeAddProductModal = () => {
      isAddProductModalVisible.value = false;
      newProduct.value = { name: '', price: 0, quantity: 1, image: '', imei: '', ram: '', capacity: '', color: '' };
    };

    // const addProduct = () => {
    //   if (newProduct.value.name && newProduct.value.price && newProduct.value.ram && newProduct.value.capacity && newProduct.value.color) {
    //     const newProductData = {
    //       id: Date.now(),
    //       ...newProduct.value,
    //       imeiList: newProduct.value.imei ? [{ imei: newProduct.value.imei, status: 'pending' }] : [],
    //     };
    //     products.value.push(newProductData);
    //     history.value.push({
    //       id: Date.now(),
    //       action: `Thêm sản phẩm ${newProduct.value.name}`,
    //       employee: 'Hệ thống',
    //       timestamp: new Date().toLocaleString('vi-VN'),
    //       status: 'completed',
    //     });
    //     toastNotification.value.addToast({
    //       type: 'success',
    //       message: `Đã thêm sản phẩm ${newProduct.value.name}`,
    //       duration: 3000,
    //     });
    //     closeAddProductModal();
    //   } else {
    //     toastNotification.value.addToast({
    //       type: 'warning',
    //       message: 'Vui lòng nhập đầy đủ thông tin sản phẩm (Tên, Giá, RAM, Dung lượng, Màu sắc)',
    //       duration: 3000,
    //     });
    //   }
    // };

    const showUpdateModal = () => {
      isUpdateModalVisible.value = true;
      activeTab.value = 'order';
    };

    const closeUpdateModal = () => {
      isUpdateModalVisible.value = false;
    };

    const saveUpdateChanges = async () => {
      if (activeTab.value === 'order') {
        if (invoice.value.ma !== history.value[history.value.length - 1]?.action?.split(': ')[1] || invoice.value.loaiDon !== history.value[history.value.length - 1]?.action?.split(': ')[1]) {
          const result = await hoaDonStore.updateHoaDon(
            invoice.value.id,
            invoice.value.ma,
            invoice.value.loaiDon
          );
          if (result.success) {
            history.value.push({
              id: Date.now(),
              action: `Cập nhật thông tin hóa đơn: ${invoice.value.ma}`,
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
      } else if (activeTab.value === 'customer') {
        const result = await updateCustomerInfo(
          invoice.value.id,
          invoice.value.idKhachHang.ten,
          invoice.value.soDienThoaiKhachHang,
          invoice.value.diaChiKhachHang,
          invoice.value.idKhachHang.email
        );
        if (result.success) {
          toastNotification.value.addToast({
            type: 'success',
            message: 'Đã cập nhật thông tin khách hàng thành công',
            duration: 3000,
          });
          customerInfo.value = [
            { label: 'Tên khách hàng:', value: invoice.value.idKhachHang.ten, icon: 'bi bi-person', key: 'ten' },
            { label: 'Số điện thoại:', value: invoice.value.soDienThoaiKhachHang, icon: 'bi bi-telephone', key: 'soDienThoai' },
            { label: 'Địa chỉ:', value: invoice.value.diaChiKhachHang, icon: 'bi bi-geo-alt', key: 'diaChi' },
            { label: 'Email:', value: invoice.value.idKhachHang.email, icon: 'bi bi-envelope', key: 'email' },
            { label: 'Ghi chú:', value: invoice.value.ghiChu || 'Không có', icon: 'bi bi-sticky', key: 'ghiChu' },
          ];
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: result.message,
            duration: 3000,
          });
        }
      }
      closeUpdateModal();
    };

    const updateCustomerInfo = async (id, tenKhachHang, soDienThoai, diaChi, email) => {
      try {
        const params = { tenKhachHang, soDienThoai, diaChi, email };
        const response = await hoaDonStore.updateCustomerInfo(id, tenKhachHang, soDienThoai, diaChi, email);
        if (response.success) {
          invoice.value.idKhachHang.ten = tenKhachHang;
          invoice.value.soDienThoaiKhachHang = soDienThoai;
          invoice.value.diaChiKhachHang = diaChi;
          invoice.value.idKhachHang.email = email;
          history.value.push({
            id: Date.now(),
            action: `Cập nhật thông tin khách hàng: ${tenKhachHang}`,
            employee: 'Hệ thống',
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'completed',
          });
        }
        return response;
      } catch (error) {
        return { success: false, message: error.message || 'Không thể cập nhật thông tin khách hàng' };
      }
    };

    // Cập nhật phương thức showDivinationModal để thêm confirm
    const showDivinationModal = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = 'Bạn có chắc chắn muốn quét QR để thêm IMEI?';
      notificationOnConfirm.value = () => {
        isDivinationModalVisible.value = true;
        generateDivination();
        resetNotification();
      };
      notificationOnCancel.value = () => {
        resetNotification();
      };
      notificationModal.value.openModal();
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

    // const addProduct = async (product) => {
    //   if (!product.chiTietSanPhamId || !selectedIMEIsNew.value.length) {
    //     toastNotification.value.addToast({
    //       type: 'error',
    //       message: 'Vui lòng chọn sản phẩm và ít nhất một IMEI hợp lệ',
    //       duration: 3000,
    //     });
    //     return;
    //   }

    //   isNotificationLoading.value = true;
    //   try {
    //     const result = await hoaDonStore.addProductToInvoiceDetail(
    //       invoiceId.value,
    //       product.chiTietSanPhamId,
    //       selectedIMEIsNew.value[0] // Giả sử chỉ chọn 1 IMEI
    //     );

    //     if (result.success) {
    //       products.value = result.data.sanPhamChiTietInfos.map(p => ({
    //         ...p,
    //         id: p.chiTietSanPhamId,
    //         name: p.tenSanPham,
    //         imei: p.imel,
    //         ram: p.dungLuongRam,
    //         capacity: p.dungLuongBoNhoTrong,
    //         color: p.mauSac,
    //         price: p.giaBan,
    //         quantity: 1,
    //         image: p.duongDan,
    //       }));
    //       history.value.push({
    //         id: Date.now(),
    //         action: `Thêm sản phẩm ${product.tenSanPham} với IMEI ${selectedIMEIsNew.value[0]}`,
    //         employee: 'Hệ thống',
    //         timestamp: new Date().toLocaleString('vi-VN'),
    //         status: 'completed',
    //       });
    //       toastNotification.value.addToast({
    //         type: 'success',
    //         message: `Đã thêm sản phẩm ${product.tenSanPham}`,
    //         duration: 3000,
    //       });
    //       isAddProductModalVisible.value = false;
    //       resetProductFilters();
    //       selectedIMEIsNew.value = [];
    //     } else {
    //       toastNotification.value.addToast({
    //         type: 'error',
    //         message: result.message,
    //         duration: 3000,
    //       });
    //     }
    //   } catch (error) {
    //     toastNotification.value.addToast({
    //       type: 'error',
    //       message: 'Lỗi khi thêm sản phẩm',
    //       duration: 3000,
    //     });
    //   } finally {
    //     isNotificationLoading.value = false;
    //   }
    // };

    const addProduct = async () => {
      if (!selectedNewProduct.value || selectedIMEIsNew.value.length === 0) {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Vui lòng chọn sản phẩm và ít nhất một IMEI hợp lệ',
          duration: 3000,
        });
        return;
      }

      // Kiểm tra trạng thái hóa đơn
      if (invoice.value.trangThai !== 'Chờ xác nhận' || invoice.value.loaiDon !== 'online') {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Chỉ có thể thêm sản phẩm vào hóa đơn online ở trạng thái "Chờ xác nhận"',
          duration: 3000,
        });
        return;
      }

      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn thêm sản phẩm ${selectedNewProduct.value.tenSanPham} vào hóa đơn?`;
      notificationOnConfirm.value = async () => {
        isNotificationLoading.value = true;
        try {
          // Gọi API để thêm sản phẩm vào hóa đơn chi tiết
          const response = await apiService.post(`/api/hoa-don/${invoiceId.value}/add-product-to-detail`, {
            chiTietSanPhamId: selectedNewProduct.value.chiTietSanPhamId,
            imei: selectedIMEIsNew.value[0], // Giả sử chỉ thêm một IMEI mỗi lần
          });

          if (response.data) {
            // Cập nhật danh sách sản phẩm
            const newProduct = response.data.sanPhamChiTietInfos[response.data.sanPhamChiTietInfos.length - 1];
            products.value.push({
              chiTietSanPhamId: newProduct.chiTietSanPhamId,
              idSanPham: newProduct.idSanPham,
              id: newProduct.chiTietSanPhamId,
              maSanPham: newProduct.maSanPham,
              name: newProduct.tenSanPham,
              imei: newProduct.imel,
              ram: newProduct.dungLuongRam,
              capacity: newProduct.dungLuongBoNhoTrong,
              color: newProduct.mauSac,
              price: newProduct.giaBan,
              quantity: 1,
              image: newProduct.duongDan,
            });

            // Cập nhật lịch sử hóa đơn
            history.value.push({
              id: `LSHD_${Date.now()}`,
              code: `LSHD_${Date.now()}`,
              invoice: response.data.maHoaDon,
              employee: response.data.maNhanVien || 'Hệ thống',
              action: `Thêm sản phẩm ${newProduct.tenSanPham} với IMEI: ${newProduct.imel}`,
              timestamp: new Date().toLocaleString('vi-VN'),
              status: 'completed',
            });

            // Cập nhật tổng tiền
            invoice.value.tongTienSauGiam = response.data.tongTienSauGiam;

            toastNotification.value.addToast({
              type: 'success',
              message: `Đã thêm sản phẩm ${newProduct.tenSanPham} thành công`,
              duration: 3000,
            });

            // Đóng modal và reset state
            isAddProductModalVisible.value = false;
            selectedNewProduct.value = null;
            selectedIMEIsNew.value = [];
            productSearchQuery.value = '';
            filterColor.value = '';
            filterRam.value = '';
            filterStorage.value = '';
          }
        } catch (error) {
          toastNotification.value.addToast({
            type: 'error',
            message: error.response?.data?.message || 'Lỗi khi thêm sản phẩm vào hóa đơn',
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

    const removeProduct = (item) => {
      notificationType.value = 'confirm';
      notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${item.name}?`;
      notificationOnConfirm.value = async () => {
        isNotificationLoading.value = true;
        try {
          // Gọi API để xóa sản phẩm khỏi hóa đơn chi tiết
          const response = await apiService.delete(`/api/hoa-don/${invoiceId.value}/delete-product-from-detail/${item.chiTietSanPhamId}`);

          if (response.data) {
            // Cập nhật danh sách sản phẩm
            products.value = products.value.filter((p) => p.chiTietSanPhamId !== item.chiTietSanPhamId);

            // Cập nhật lịch sử
            history.value.push({
              id: Date.now(),
              action: `Xóa sản phẩm ${item.name}`,
              employee: 'Hệ thống',
              timestamp: new Date().toLocaleString('vi-VN'),
              status: 'completed',
            });

            toastNotification.value.addToast({
              type: 'success',
              message: `Đã xóa sản phẩm ${item.name} thành công`,
              duration: 3000,
            });
          }
        } catch (error) {
          toastNotification.value.addToast({
            type: 'error',
            message: error.response?.data?.message || 'Lỗi khi xóa sản phẩm',
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

    // const removeProduct = (item) => {
    //   notificationType.value = 'confirm';
    //   notificationMessage.value = `Bạn có chắc chắn muốn xóa sản phẩm ${item.name}?`;
    //   notificationOnConfirm.value = () => {
    //     isNotificationLoading.value = true;
    //     setTimeout(() => {
    //       products.value = products.value.filter((p) => p.id !== item.id);
    //       history.value.push({
    //         id: Date.now(),
    //         action: `Xóa sản phẩm ${item.name}`,
    //         employee: 'Hệ thống',
    //         timestamp: new Date().toLocaleString('vi-VN'),
    //         status: 'completed',
    //       });
    //       isNotificationLoading.value = false;
    //       toastNotification.value.addToast({
    //         type: 'success',
    //         message: `Đã xóa sản phẩm ${item.name}`,
    //         duration: 3000,
    //       });
    //       resetNotification();
    //     }, 500);
    //   };
    //   notificationOnCancel.value = () => {
    //     resetNotification();
    //   };
    //   isNotificationLoading.value = false;
    //   notificationModal.value.openModal();
    // };

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

    // Cập nhật phương thức changeStatus để thêm confirm in hóa đơn khi chuyển sang "Chờ giao hàng"
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

      const currentStatusNumber = hoaDonStore.mapStatusToNumber(invoice.value.trangThai);
      const targetStatusNumber = hoaDonStore.mapStatusToNumber(status);

      // Kiểm tra chuyển trạng thái tuần tự
      if (Math.abs(targetStatusNumber - currentStatusNumber) > 1) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Chỉ có thể chuyển trạng thái tuần tự (Chờ xác nhận -> Chờ giao hàng -> Đang giao -> Hoàn thành hoặc ngược lại)',
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

            if (status === 'Chờ giao hàng') {
              notificationType.value = 'confirm';
              notificationMessage.value = 'Bạn có muốn in hóa đơn ngay bây giờ?';
              notificationOnConfirm.value = async () => {
                await printInvoice();
                resetNotification();
              };
              notificationOnCancel.value = () => {
                resetNotification();
              };
              notificationModal.value.openModal();
            }
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

    const getProductRowClass = (item) => {
      return item.trangThai === 'Còn hàng' ? 'table-row-valid' : 'table-row-invalid';
    };

    const updateIMEIPage = (page) => {
      imeiCurrentPage.value = page;
    };

    const updateIMEIItemsPerPage = (value) => {
      imeiItemsPerPage.value = value;
      imeiCurrentPage.value = 1;
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
      isLoadingIMEI,
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
      productList,
      availableIMEIsNew,
      selectedIMEIsNew,
      showNewIMEIModal,
      productSearchQuery,
      filterColor,
      filterRam,
      filterStorage,
      filteredProducts,
      uniqueColors,
      uniqueRams,
      uniqueStorages,
      selectedNewProduct,
      fetchProductsNew,
      showNewIMEIList,
      closeNewIMEIModal,
      addProductWithIMEIsNew,
      productCurrentPage,
      productItemsPerPage,
      productPageSizeOptions,
      totalProductPages,
      paginatedProducts,
      updateProductPage,
      updateProductItemsPerPage,
      getProductRowClass,
      productHeaders,
      debouncedSearchProduct,
      resetProductFilters,
    };
  },
};