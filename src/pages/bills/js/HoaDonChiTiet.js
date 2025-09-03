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
    const isViewIMEIModalVisible = ref(false);
    const isAddProductModalVisible = ref(false);
    const isIMEISelectionModalVisible = ref(false);
    const isUpdateModalVisible = ref(false);
    const isDivinationModalVisible = ref(false);
    const selectedProduct = ref(null);
    const selectedProductForIMEI = ref(null);
    const selectedIMEIsForProduct = ref([]);
    const availableIMEIsForProduct = ref([]);
    const imeiSearchQuery = ref('');
    const isAddingProduct = ref(false);
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
    const isConfirmingIMEI = ref(false); // Trạng thái loading cho confirmSelectedIMEIs
    const isLoadingViewIMEI = ref(false); // Trạng thái loading cho viewIMEI
    const viewIMEIData = ref([]);
    const viewIMEICurrentPage = ref(1);
    const viewIMEIPageSize = ref(10);
    const viewIMEITotalPages = ref(0);

    // State cho thanh toán
    const paymentData = ref({
      chuyenKhoan: 0,
      tienMat: 0
    });
    const totalPaid = computed(() => {
      return (paymentData.value.chuyenKhoan || 0) + (paymentData.value.tienMat || 0);
    });
    const remainingAmount = computed(() => {
      return Math.max(0, (totalPrice.value - discount.value) - totalPaid.value);
    });

    // State cho phân trang IMEI
    const imeiCurrentPage = ref(1);
    const imeiItemsPerPage = ref(100);
    const imeiPageSizeOptions = ref([5, 10, 15, 20, 50]);
    // Thêm state cho phân trang sản phẩm
    const productCurrentPage = ref(1);
    const productItemsPerPage = ref(4);  // Mặc định 4 sản phẩm/trang
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
    // State mới cho IMEI đã chọn - cải thiện để hỗ trợ nhiều IMEI cho sản phẩm gộp
    const selectedIMEIs = ref(new Map()); // Key: groupKey, Value: Array of selected IMEIs
    const productGroupKeys = ref(new Map()); // Key: chiTietSanPhamId, Value: groupKey

    // Bulk IMEI Confirmation State
    const isBulkConfirmIMEIModalVisible = ref(false);
    const bulkConfirmProducts = ref([]);
    const currentBulkProductIndex = ref(0);
    const bulkSelectedIMEIs = ref(new Map()); // Key: productGroupKey, Value: Array of selected IMEIs
    const bulkAvailableIMEIs = ref([]);
    const bulkSearchIMEI = ref('');
    const isConfirmingBulkIMEI = ref(false);
    const isLoadingBulkIMEI = ref(false);

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

    // Thêm computed property để gộp sản phẩm
    const groupedProducts = computed(() => {
      const grouped = {};
      productGroupKeys.value.clear(); // Reset mapping


      products.value.forEach(product => {
        // Sử dụng cấu trúc dữ liệu từ API response
        const key = `${product.tenSanPham || product.name}-${product.mauSac || product.color}-${product.dungLuongRam || product.ram}-${product.dungLuongBoNhoTrong || product.capacity}`;

        // Lưu mapping từ chiTietSanPhamId -> groupKey
        productGroupKeys.value.set(product.chiTietSanPhamId || product.id, key);

        if (!grouped[key]) {
          grouped[key] = {
            id: product.chiTietSanPhamId || product.id,
            groupKey: key, // Thêm groupKey để tracking
            chiTietSanPhamId: product.chiTietSanPhamId || product.id,
            chiTietSanPhamIds: [], // Lưu tất cả IDs trong group
            idSanPham: product.idSanPham,
            name: product.tenSanPham || product.name,
            tenSanPham: product.tenSanPham || product.name,
            color: product.mauSac || product.color,
            mauSac: product.mauSac || product.color,
            ram: product.dungLuongRam || product.ram,
            dungLuongRam: product.dungLuongRam || product.ram,
            capacity: product.dungLuongBoNhoTrong || product.capacity,
            dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
            price: product.giaBan || product.price,
            giaBan: product.giaBan || product.price,
            image: product.duongDan || product.image,
            duongDan: product.duongDan || product.image,
            ma: product.ma,
            imeis: [],
            quantity: 0,
            needsIMEI: 0, // Số lượng IMEI cần xác nhận
          };
        }

        // Thêm chiTietSanPhamId vào danh sách
        grouped[key].chiTietSanPhamIds.push(product.chiTietSanPhamId || product.id);

        // Cập nhật idSanPham nếu chưa có hoặc hiện tại là null
        if (!grouped[key].idSanPham && product.idSanPham) {
          grouped[key].idSanPham = product.idSanPham;
        }

        if (product.imei) {
          grouped[key].imeis.push(product.imei);
        } else {
          // Nếu chưa có IMEI thì cần xác nhận - mỗi sản phẩm cần 1 IMEI
          grouped[key].needsIMEI += 1;
        }
        grouped[key].quantity += 1;
      });
      return Object.values(grouped);
    });

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

    // Hàm để kiểm tra IMEI đã được chọn
    const isIMEISelected = (imei, groupKey) => {
      // Sử dụng cùng logic key như selectIMEI
      const key = selectedProduct.value?.chiTietSanPhamId?.toString() || groupKey;
      const currentIMEIs = selectedIMEIs.value.get(key) || [];
      return currentIMEIs.includes(imei);
    };

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

    // New computed properties for IMEI modal
    const filteredAvailableIMEIs = computed(() => {
      if (!imeiSearchQuery.value) return availableIMEIsForProduct.value;
      return availableIMEIsForProduct.value.filter(imei =>
        imei.imei && imei.imei.toLowerCase().includes(imeiSearchQuery.value.toLowerCase())
      );
    });

    const totalIMEIPagesForProduct = computed(() => {
      return Math.ceil(filteredAvailableIMEIs.value.length / imeiItemsPerPage.value);
    });

    const paginatedAvailableIMEIs = computed(() => {
      const start = (imeiCurrentPage.value - 1) * imeiItemsPerPage.value;
      const end = start + imeiItemsPerPage.value;
      return filteredAvailableIMEIs.value.slice(start, end);
    });

    // Debounced IMEI search for new modal
    const debouncedSearchIMEIForProduct = debounce((value) => {
      imeiSearchQuery.value = value;
      imeiCurrentPage.value = 1;
    }, 300);

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

    // View IMEI Modal Headers
    const viewIMEIHeaders = ref([
      { text: 'STT', value: 'stt' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Sản phẩm', value: 'tenSanPham' },
      // { text: 'Thương hiệu', value: 'thuongHieu' },
      { text: 'RAM', value: 'ram' },
      { text: 'Bộ nhớ', value: 'dungLuongBoNhoTrong' },
      { text: 'Màu sắc', value: 'mauSac' },
      { text: 'Giá bán', value: 'giaBan' },
      { text: 'Ngày bán', value: 'ngayBan' },
      // { text: 'Ghi chú', value: 'ghiChu' },
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

    // New method for selecting product and opening IMEI modal
    const selectProductForIMEI = async (product) => {
      selectedProductForIMEI.value = product;
      selectedIMEIsForProduct.value = [];
      imeiSearchQuery.value = '';
      imeiCurrentPage.value = 1;

      try {
        availableIMEIsForProduct.value = await fetchIMEIsApi(
          product.sanPhamId || product.idSanPham,
          product.mauSac,
          product.dungLuongRam,
          product.dungLuongBoNhoTrong
        );
        isAddProductModalVisible.value = false;
        isIMEISelectionModalVisible.value = true;
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: error.message || 'Lỗi khi tải danh sách IMEI',
          duration: 3000,
        });
      }
    };

    // Close IMEI selection modal
    const closeIMEISelectionModal = () => {
      isIMEISelectionModalVisible.value = false;
      selectedProductForIMEI.value = null;
      selectedIMEIsForProduct.value = [];
      availableIMEIsForProduct.value = [];
      imeiSearchQuery.value = '';
    };

    // Toggle IMEI selection
    const toggleIMEISelection = (imei) => {
      const index = selectedIMEIsForProduct.value.indexOf(imei);
      if (index > -1) {
        selectedIMEIsForProduct.value.splice(index, 1);
      } else {
        selectedIMEIsForProduct.value.push(imei);
      }
    };

    // Toggle select all IMEIs
    const toggleSelectAllIMEIs = () => {
      if (selectedIMEIsForProduct.value.length === filteredAvailableIMEIs.value.length) {
        // If all are selected, deselect all
        selectedIMEIsForProduct.value = [];
      } else {
        // If not all are selected, select all
        selectedIMEIsForProduct.value = filteredAvailableIMEIs.value.map(imei => imei.imei);
      }
    };

    // Toggle select all IMEIs for Confirm Modal
    const toggleSelectAllConfirmIMEIs = () => {
      const currentSelectedCount = getSelectedIMEICount();
      if (currentSelectedCount === filteredIMEIs.value.length) {
        // If all are selected, deselect all
        selectedIMEIs.value.clear();
      } else {
        // If not all are selected, select all
        filteredIMEIs.value.forEach(imei => {
          if (imei.status === 'Còn hàng') {
            selectedIMEIs.value.set(imei.imei, true);
          }
        });
      }
    };

    // Update IMEI page for new modal
    const updateIMEIPageForProduct = (page) => {
      imeiCurrentPage.value = page;
    };

    // Confirm add product with selected IMEIs
    const confirmAddProductWithIMEI = async () => {
      if (!selectedProductForIMEI.value || selectedIMEIsForProduct.value.length === 0) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng chọn ít nhất một IMEI',
          duration: 3000,
        });
        return;
      }

      isAddingProduct.value = true;

      try {
        const imelMap = {};
        selectedIMEIsForProduct.value.forEach(imei => {
          imelMap[selectedProductForIMEI.value.chiTietSanPhamId] = imei;
        });

        await apiService.post(`/api/hoa-don/${invoiceId.value}/add-product-to-detail`, imelMap);

        toastNotification.value.addToast({
          type: 'success',
          message: 'Thêm sản phẩm và gán IMEI thành công',
          duration: 3000,
        });

        closeIMEISelectionModal();
        await hoaDonStore.fetchInvoiceDetail(invoiceId.value);

      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: error.response?.data?.message || 'Lỗi khi thêm sản phẩm',
          duration: 3000,
        });
      } finally {
        isAddingProduct.value = false;
      }
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
          // Xử lý products từ API response với cấu trúc đúng
          if (hoaDonStore.getInvoiceDetail.products) {
            products.value = hoaDonStore.getInvoiceDetail.products.map(product => {
              const groupKey = `${product.tenSanPham || product.name}-${product.mauSac || product.color}-${product.dungLuongRam || product.ram}-${product.dungLuongBoNhoTrong || product.capacity}`;
              return {
                ...product,
                groupKey,
                // Đảm bảo mapping đúng các trường từ API
                chiTietSanPhamId: product.chiTietSanPhamId || product.id,
                idSanPham: product.idSanPham,
                tenSanPham: product.tenSanPham || product.name,
                name: product.tenSanPham || product.name,
                mauSac: product.mauSac || product.color,
                color: product.mauSac || product.color,
                dungLuongRam: product.dungLuongRam || product.ram,
                ram: product.dungLuongRam || product.ram,
                dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
                capacity: product.dungLuongBoNhoTrong || product.capacity,
                giaBan: product.giaBan || product.price,
                price: product.giaBan || product.price,
                duongDan: product.duongDan || product.image,
                image: product.duongDan || product.image,
                imeiList: product.imei ? product.imei.split(', ').map(imei => ({
                  imei,
                  status: hoaDonStore.getImelList.find(i => i.imei === imei)?.status || 'pending',
                })) : [],
              };
            });
          } else {
            products.value = [];
          }
          payments.value = hoaDonStore.getInvoiceDetail.payments || [];
          history.value = hoaDonStore.getInvoiceDetail.history || [];
          discount.value = totalPrice.value - (invoice.value.tongTienSauGiam || 0);
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

    const formatDate = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return null;
      }
    };

    const truncateIMEI = (imei) => {
      if (!imei || imei === null) return '';
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

    // Hàm để hiển thị modal xem IMEI đã có trong hóa đơn
    const showViewIMEIModal = async (groupedProduct) => {
      try {
        isLoadingViewIMEI.value = true;
        selectedProduct.value = groupedProduct;
        isViewIMEIModalVisible.value = true;

        // Reset pagination
        viewIMEICurrentPage.value = 1;
        viewIMEIPageSize.value = 10;

        // Gọi API để lấy danh sách IMEI của hóa đơn
        await fetchViewIMEIData();

      } catch (error) {
        console.error('Error in showViewIMEIModal:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách IMEI',
          duration: 3000,
        });
      } finally {
        isLoadingViewIMEI.value = false;
      }
    };

    // Hàm gọi API để lấy danh sách IMEI của hóa đơn chi tiết cụ thể hoặc nhóm sản phẩm cùng thuộc tính
    const fetchViewIMEIData = async () => {
      try {
        isLoadingViewIMEI.value = true;

        // Tạo params cơ bản
        const params = {
          page: viewIMEICurrentPage.value - 1,
          size: viewIMEIPageSize.value
        };

        // Kiểm tra xem có phải là grouped product không (có nhiều chiTietSanPhamIds)
        if (selectedProduct.value && selectedProduct.value.chiTietSanPhamIds && selectedProduct.value.chiTietSanPhamIds.length > 1) {
          // Sử dụng chiTietSanPhamIds để lấy IMEI của tất cả sản phẩm cùng thuộc tính
          params.chiTietSanPhamIds = selectedProduct.value.chiTietSanPhamIds.join(',');
          console.log('Fetching IMEI for grouped products with IDs:', selectedProduct.value.chiTietSanPhamIds);
        } else if (selectedProduct.value && selectedProduct.value.chiTietSanPhamId) {
          // Fallback cho single product
          params.chiTietSanPhamId = selectedProduct.value.chiTietSanPhamId;
          console.log('Fetching IMEI for single product with ID:', selectedProduct.value.chiTietSanPhamId);
        }

        const response = await apiService.get(`/api/hoa-don/${invoiceId.value}/imei`, {
          params: params
        });

        if (response.data) {
          viewIMEIData.value = response.data.content || response.data;
          // Debug: Log the first item to see the actual data structure
          if (viewIMEIData.value.length > 0) {
            console.log('IMEI Data Structure:', viewIMEIData.value[0]);
            console.log('Available fields:', Object.keys(viewIMEIData.value[0]));
            console.log('Filtered by:', params.chiTietSanPhamIds ? `chiTietSanPhamIds: ${params.chiTietSanPhamIds}` : `chiTietSanPhamId: ${params.chiTietSanPhamId}`);
          }
          viewIMEITotalPages.value = response.data.totalPages || Math.ceil((response.data.totalElements || viewIMEIData.value.length) / viewIMEIPageSize.value);
        } else {
          viewIMEIData.value = [];
          viewIMEITotalPages.value = 0;
        }

      } catch (error) {
        console.error('Error fetching view IMEI data:', error);
        viewIMEIData.value = [];
        viewIMEITotalPages.value = 0;
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể tải danh sách IMEI cho sản phẩm này',
          duration: 3000,
        });
      } finally {
        isLoadingViewIMEI.value = false;
      }
    };

    // Hàm đóng modal xem IMEI
    const closeViewIMEIModal = () => {
      isViewIMEIModalVisible.value = false;
      selectedProduct.value = null;
      viewIMEIData.value = [];
      viewIMEICurrentPage.value = 1;
    };

    // Hàm thay đổi trang cho modal xem IMEI
    const changeViewIMEIPage = (page) => {
      viewIMEICurrentPage.value = page;
      fetchViewIMEIData();
    };


    // Hàm thay đổi kích thước trang cho modal xem IMEI
    const changeViewIMEIPageSize = (size) => {
      viewIMEIPageSize.value = size;
      viewIMEICurrentPage.value = 1;
      fetchViewIMEIData();
    };

    // Hàm để hiển thị modal IMEI (cho việc chọn IMEI mới)
    const showIMEIModal = async (groupedProduct) => {
      selectedProduct.value = groupedProduct;
      isIMEIModalVisible.value = true;

      // Reset danh sách IMEI đã chọn cho sản phẩm này
      selectedIMEIs.value.set(groupedProduct.groupKey || groupedProduct.chiTietSanPhamId, []);

      // Kiểm tra idSanPham trước khi gọi API
      if (!groupedProduct.idSanPham) {
        console.error('idSanPham is null for product:', groupedProduct);

        // Thử lấy idSanPham từ API chi tiết sản phẩm
        try {
          console.log('Trying to fetch idSanPham from API for chiTietSanPhamId:', groupedProduct.chiTietSanPhamId);
          const response = await apiService.get(`/api/chi-tiet-san-pham/${groupedProduct.chiTietSanPhamId}/id-san-pham`);
          const fetchedIdSanPham = response.data;

          if (fetchedIdSanPham) {
            console.log('Fetched idSanPham:', fetchedIdSanPham);
            // Cập nhật idSanPham cho groupedProduct
            groupedProduct.idSanPham = fetchedIdSanPham;
            selectedProduct.value.idSanPham = fetchedIdSanPham;
          } else {
            throw new Error('idSanPham not found');
          }
        } catch (error) {
          console.error('Failed to fetch idSanPham:', error);
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy ID sản phẩm để load IMEI',
            duration: 3000,
          });
          availableIMEIsNew.value = [];
          return;
        }
      }

      // Load danh sách IMEI từ store với fallback
      const loadIMEIs = async (idSanPham, filters) => {
        try {
          console.log('Fetching IMEIs with filters:', filters);

          // Sử dụng store method thay vì API trực tiếp
          if (groupedProduct.chiTietSanPhamId) {
            console.log('Using store fetchImelList method');
            await hoaDonStore.fetchImelList({
              page: 0,
              size: 100,
              idSanPham: idSanPham,
              chiTietSanPhamId: groupedProduct.chiTietSanPhamId
            });

            // Lấy danh sách IMEI từ store
            const storeIMEIs = hoaDonStore.getImelList || [];
            console.log('Store IMEIs:', storeIMEIs);

            // Filter theo thuộc tính nếu có
            let filteredIMEIs = storeIMEIs;
            if (filters.color || filters.ram || filters.storage) {
              filteredIMEIs = storeIMEIs.filter(imei => {
                const matchColor = !filters.color || imei.color === filters.color;
                const matchRam = !filters.ram || imei.ram === filters.ram;
                const matchStorage = !filters.storage || imei.capacity === filters.storage;
                return matchColor && matchRam && matchStorage;
              });
            }

            // Chỉ lấy IMEI còn hàng
            const availableIMEIs = filteredIMEIs.filter(imei => imei.status === 'Còn hàng');
            availableIMEIsNew.value = availableIMEIs;
            console.log('Final IMEI list:', availableIMEIs);

          } else {
            console.warn('No chiTietSanPhamId available for IMEI fetching');
            availableIMEIsNew.value = [];
          }

        } catch (error) {
          console.error('Error fetching IMEIs:', error);
          availableIMEIsNew.value = [];
        }
      };

      // Gọi hàm load IMEI với logging
      console.log('Loading IMEIs for product:', {
        idSanPham: groupedProduct.idSanPham,
        chiTietSanPhamId: groupedProduct.chiTietSanPhamId,
        filters: {
          color: groupedProduct.color,
          ram: groupedProduct.ram,
          storage: groupedProduct.capacity,
        }
      });

      loadIMEIs(groupedProduct.idSanPham, {
        color: groupedProduct.color,
        ram: groupedProduct.ram,
        storage: groupedProduct.capacity,
      });
    };

    const closeIMEIModal = () => {
      isIMEIModalVisible.value = false;
      selectedProduct.value = null;
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

    // Hàm lưu các IMEI đã chọn
    const saveIMEIChanges = async () => {
      try {
        isNotificationLoading.value = true;
        const imelMap = {};
        selectedIMEIs.value.forEach((imeiList, chiTietSanPhamId) => {
          imeiList.forEach(imei => {
            imelMap[chiTietSanPhamId] = imei; // Tạo Map theo định dạng { chiTietSanPhamId: imei }
          });
        });

        const result = await apiService.post(`/api/hoa-don/xac-nhan-imei/${invoiceId.value}`, imelMap);
        if (result.data) {
          toastNotification.value.addToast({
            type: 'success',
            message: 'Gán IMEI thành công!',
            duration: 3000,
          });
          // Cập nhật lại danh sách sản phẩm hoặc giỏ hàng
          await fetchInvoiceDetails();
          selectedIMEIs.value.clear(); // Xóa danh sách đã chọn
          closeIMEIModal();
        }
      } catch (error) {
        console.error('Error saving IMEI changes:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: error.response?.data?.message || 'Lỗi khi gán IMEI',
          duration: 3000,
        });
      } finally {
        isNotificationLoading.value = false;
      }
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
      // // Hiển thị modal xác nhận trước
      // notificationType.value = 'confirm';
      // notificationMessage.value = `Bạn có chắc chắn muốn xác nhận IMEI cho sản phẩm ${item.tenSanPham || item.name}?`;
      // notificationOnConfirm.value = async () => {
      try {
        selectedProduct.value = { ...item };

        // Kiểm tra các trường cần thiết
        const chiTietSanPhamId = selectedProduct.value.chiTietSanPhamId || selectedProduct.value.id;
        const idSanPham = selectedProduct.value.idSanPham;

        if (!chiTietSanPhamId) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy ID chi tiết sản phẩm cho sản phẩm này',
            duration: 5000,
          });
          resetNotification();
          return;
        }

        // Nếu chưa có idSanPham, lấy từ API
        if (!idSanPham) {
          try {
            const response = await apiService.get(`/api/chi-tiet-san-pham/${chiTietSanPhamId}/id-san-pham`);
            const fetchedIdSanPham = response.data;
            if (!fetchedIdSanPham) {
              toastNotification.value.addToast({
                type: 'error',
                message: 'Không tìm thấy ID sản phẩm cho chi tiết sản phẩm này',
                duration: 5000,
              });
              resetNotification();
              return;
            }
            selectedProduct.value.idSanPham = fetchedIdSanPham;
          } catch (error) {
            console.error('Error fetching idSanPham:', error);
            toastNotification.value.addToast({
              type: 'error',
              message: `Lỗi khi lấy ID sản phẩm: ${error.message}`,
              duration: 5000,
            });
            resetNotification();
            return;
          }
        }

        // Mở modal và fetch IMEI list
        isConfirmIMEIModalVisible.value = true;
        searchIMEI.value = '';
        imeiCurrentPage.value = 1;

        await hoaDonStore.fetchImelList({
          page: 0,
          size: 100,
          idSanPham: selectedProduct.value.idSanPham,
          chiTietSanPhamId: chiTietSanPhamId,
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

      } catch (error) {
        console.error('Error in showConfirmIMEIModal:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: `Lỗi không xác định: ${error.message}`,
          duration: 5000,
        });
      } finally {
        resetNotification();
        // }
      };

      notificationOnCancel.value = () => {
        resetNotification();
      };

      notificationModal.value.openModal();
    };

    const closeConfirmIMEIModal = () => {
      isConfirmIMEIModalVisible.value = false;
      selectedProduct.value = null;
      searchIMEI.value = '';
      imeiCurrentPage.value = 1;
    };

    // Hàm để chọn IMEI
    const selectIMEI = (imei, groupKey) => {
      // Sử dụng groupKey nếu có nhiều chiTietSanPhamIds, ngược lại dùng chiTietSanPhamId
      let key;
      if (selectedProduct.value?.chiTietSanPhamIds && selectedProduct.value.chiTietSanPhamIds.length > 1) {
        // Trường hợp grouped products - sử dụng groupKey
        key = selectedProduct.value.groupKey || groupKey;
      } else {
        // Trường hợp single product - sử dụng chiTietSanPhamId
        key = selectedProduct.value?.chiTietSanPhamId?.toString() || groupKey;
      }

      console.log('selectIMEI called with:', {
        imei,
        groupKey,
        key,
        selectedProduct: selectedProduct.value,
        isGrouped: selectedProduct.value?.chiTietSanPhamIds?.length > 1
      });

      const currentIMEIs = selectedIMEIs.value.get(key) || [];
      if (currentIMEIs.includes(imei)) {
        // Bỏ chọn IMEI
        const newIMEIs = currentIMEIs.filter((i) => i !== imei);
        selectedIMEIs.value.set(key, newIMEIs);
        console.log('Removed IMEI:', imei, 'New list:', newIMEIs);

        toastNotification.value.addToast({
          type: 'info',
          message: `Đã bỏ chọn IMEI ${imei}`,
          duration: 2000,
        });
      } else {
        // Thêm IMEI, kiểm tra giới hạn số lượng
        const maxIMEIs = selectedProduct.value?.needsIMEI || selectedProduct.value?.quantity || 1;
        if (currentIMEIs.length < maxIMEIs) {
          currentIMEIs.push(imei);
          selectedIMEIs.value.set(key, currentIMEIs);
          console.log('Added IMEI:', imei, 'New list:', currentIMEIs, 'Max allowed:', maxIMEIs);

          toastNotification.value.addToast({
            type: 'success',
            message: `Đã chọn IMEI ${imei} (${currentIMEIs.length}/${maxIMEIs})`,
            duration: 2000,
          });
        } else {
          toastNotification.value.addToast({
            type: 'warning',
            message: `Bạn chỉ có thể chọn tối đa ${maxIMEIs} IMEI`,
            duration: 3000,
          });
        }
      }

      console.log('selectedIMEIs after update:', selectedIMEIs.value);
    };

    // Hàm lấy số lượng IMEI đã chọn cho sản phẩm hiện tại
    const getSelectedIMEICount = () => {
      if (!selectedProduct.value) return 0;

      // Sử dụng cùng logic key như selectIMEI
      let key;
      if (selectedProduct.value?.chiTietSanPhamIds && selectedProduct.value.chiTietSanPhamIds.length > 1) {
        // Trường hợp grouped products - sử dụng groupKey
        key = selectedProduct.value.groupKey;
      } else {
        // Trường hợp single product - sử dụng chiTietSanPhamId
        key = selectedProduct.value.chiTietSanPhamId?.toString();
      }

      const selectedList = selectedIMEIs.value.get(key) || [];
      return selectedList.length;
    };

    // Hàm để xác nhận IMEI
    const confirmSelectedIMEIs = async () => {
      isConfirmingIMEI.value = true;
      try {
        const imelMap = {};
        const usedHoaDonChiTietIds = new Set();

        groupedProducts.value.forEach(group => {
          const selectedImeisForGroup = selectedIMEIs.value.get(group.groupKey);

          if (selectedImeisForGroup && selectedImeisForGroup.length > 0) {
            let imeiIndex = 0;

            const productsToAssign = products.value.filter(p => {
              const pGroupKey = productGroupKeys.value.get(p.chiTietSanPhamId) || productGroupKeys.value.get(p.id);
              return pGroupKey === group.groupKey && !p.imei && !usedHoaDonChiTietIds.has(p.id);
            });

            productsToAssign.forEach(productDetail => {
              if (imeiIndex < selectedImeisForGroup.length) {
                imelMap[productDetail.id] = selectedImeisForGroup[imeiIndex];
                usedHoaDonChiTietIds.add(productDetail.id);
                imeiIndex++;
              }
            });
          }
        });

        console.log('Final imelMap:', imelMap);

        if (Object.keys(imelMap).length === 0) {
          throw new Error('Vui lòng chọn ít nhất một IMEI để xác nhận');
        }

        // Gọi API xác nhận IMEI
        let result;
        try {
          result = await hoaDonStore.confirmAndAssignIMEI(invoice.value.id, imelMap);

          if (result && !result.success && result.requiresManualSelection) {
            let detailMessage = result.message || 'Cần chọn IMEI cho tất cả sản phẩm có thuộc tính khác nhau';
            if (result.missingProducts && result.missingProducts.length > 0) {
              const productDetails = result.missingProducts.map(p =>
                `${p.name} (${p.ram}, ${p.capacity}, ${p.color})`
              ).join(', ');
              detailMessage += `\n\nSản phẩm cần chọn IMEI: ${productDetails}`;
            }
            toastNotification.value.addToast({
              type: 'warning',
              message: detailMessage,
              duration: 8000,
            });
            return;
          }
        } catch (primaryError) {
          console.log('Primary endpoint failed, trying fallback:', primaryError);
          try {
            const response = await apiService.post(`/api/hoa-don/xac-nhan-imei/${invoice.value.id}`, imelMap);
            result = response.data;
          } catch (fallbackError) {
            throw new Error(fallbackError.response?.data?.message || 'Không thể xác nhận IMEI');
          }
        }

        if (result) {
          toastNotification.value.addToast({
            type: 'success',
            message: 'Xác nhận IMEI thành công',
            duration: 3000,
          });

          // Reload invoice data từ server để đảm bảo đồng bộ
          await hoaDonStore.fetchInvoiceDetail(invoice.value.id);
          if (hoaDonStore.getInvoiceDetail?.products) {
            products.value = hoaDonStore.getInvoiceDetail.products.map(product => ({
              ...product,
              chiTietSanPhamId: product.chiTietSanPhamId || product.id,
              idSanPham: product.idSanPham,
              tenSanPham: product.tenSanPham || product.name,
              name: product.tenSanPham || product.name,
              mauSac: product.mauSac || product.color,
              color: product.mauSac || product.color,
              dungLuongRam: product.dungLuongRam || product.ram,
              ram: product.dungLuongRam || product.ram,
              dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
              capacity: product.dungLuongBoNhoTrong || product.capacity,
              giaBan: product.giaBan || product.price,
              price: product.giaBan || product.price,
              duongDan: product.duongDan || product.image,
              image: product.duongDan || product.image,
              imeiList: product.imei ? product.imei.split(', ').map(imei => ({
                imei,
                status: hoaDonStore.getImelList.find(i => i.imei === imei)?.status || 'Còn hàng',
              })) : [],
              imei: product.imei || '', // Đảm bảo imei luôn được set
            }));
          }

          closeConfirmIMEIModal();
          selectedIMEIs.value.clear();
        } else {
          throw new Error('Không có phản hồi từ server');
        }
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: error.message || 'Lỗi khi xác nhận IMEI',
          duration: 3000,
        });
      } finally {
        isConfirmingIMEI.value = false;
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
      return products.value.every((product, index) => {
        // Kiểm tra xem sản phẩm có IMEI hay không
        const hasIMEI = product.imei && product.imei.trim() !== '';

        // Nếu sản phẩm có imeiList, kiểm tra trạng thái của các IMEI
        const imeiListValid = !product.imeiList || product.imeiList.every(i => {
          const isValid = i.status === 'Còn hàng' || i.trangThai === 'Còn hàng';
          console.log(`Product ${index + 1}: IMEI ${i.imei}, Status: ${i.status || i.trangThai}, Valid: ${isValid}`);
          return isValid;
        });

        // Log chi tiết để debug
        console.log(`Checking product ${index + 1}:`, {
          name: product.tenSanPham || product.name,
          chiTietSanPhamId: product.chiTietSanPhamId,
          hasIMEI,
          imei: product.imei,
          imeiList: product.imeiList,
          imeiListValid,
        });

        // Trả về true nếu sản phẩm có IMEI hợp lệ hoặc không yêu cầu IMEI
        return hasIMEI && imeiListValid;
      });
    };

    const isActionButtonsDisabled = computed(() => {
      return invoice.value.trangThai === 'Hoàn thành' || invoice.value.trangThai === 'Đã hủy';
    });

    // Bulk IMEI Confirmation Computed Properties
    const hasProductsNeedingIMEI = computed(() => {
      return groupedProducts.value.some(product => product.needsIMEI > 0);
    });

    const currentBulkProduct = computed(() => {
      return bulkConfirmProducts.value[currentBulkProductIndex.value] || null;
    });

    const filteredBulkIMEIs = computed(() => {
      if (!bulkSearchIMEI.value) return bulkAvailableIMEIs.value;
      return bulkAvailableIMEIs.value.filter(imei =>
        imei.imei.toLowerCase().includes(bulkSearchIMEI.value.toLowerCase())
      );
    });

    const canConfirmBulkIMEIs = computed(() => {
      if (!currentBulkProduct.value) return false;
      const selectedCount = getBulkSelectedIMEICount();
      return selectedCount === currentBulkProduct.value.needsIMEI;
    });

    const isLastBulkProduct = computed(() => {
      return currentBulkProductIndex.value === bulkConfirmProducts.value.length - 1;
    });

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

      const currentStatusNumber = hoaDonStore.mapStatusToNumber(invoice.value.trangThai);
      const targetStatusNumber = hoaDonStore.mapStatusToNumber(status);

      if (Math.abs(targetStatusNumber - currentStatusNumber) > 1) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Chỉ có thể chuyển trạng thái tuần tự (Chờ xác nhận -> Chờ giao hàng -> Đang giao -> Hoàn thành hoặc ngược lại)',
          duration: 3000,
        });
        return;
      }

      // Reload dữ liệu hóa đơn trước khi kiểm tra IMEI
      if (status === 'Chờ giao hàng') {
        try {
          await hoaDonStore.fetchInvoiceDetail(invoice.value.id);
          if (hoaDonStore.getInvoiceDetail?.products) {
            products.value = hoaDonStore.getInvoiceDetail.products.map(product => ({
              ...product,
              chiTietSanPhamId: product.chiTietSanPhamId || product.id,
              idSanPham: product.idSanPham,
              tenSanPham: product.tenSanPham || product.name,
              name: product.tenSanPham || product.name,
              mauSac: product.mauSac || product.color,
              color: product.mauSac || product.color,
              dungLuongRam: product.dungLuongRam || product.ram,
              ram: product.dungLuongRam || product.ram,
              dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
              capacity: product.dungLuongBoNhoTrong || product.capacity,
              giaBan: product.giaBan || product.price,
              price: product.giaBan || product.price,
              duongDan: product.duongDan || product.image,
              image: product.duongDan || product.image,
              imeiList: product.imei ? product.imei.split(', ').map(imei => ({
                imei,
                status: hoaDonStore.getImelList.find(i => i.imei === imei)?.status || 'Còn hàng',
              })) : [],
              imei: product.imei || '',
            }));
          }
        } catch (error) {
          console.error('Error reloading invoice data:', error);
          toastNotification.value.addToast({
            type: 'error',
            message: 'Lỗi khi tải lại dữ liệu hóa đơn',
            duration: 3000,
          });
          return;
        }

        if (!checkAllProductsHaveIMEI()) {
          console.log('Products failing IMEI check:', products.value.filter(p => !p.imei || p.imei.trim() === '' || (p.imeiList && p.imeiList.some(i => i.status !== 'Còn hàng'))));
          toastNotification.value.addToast({
            type: 'warning',
            message: 'Vui lòng chọn và xác nhận IMEI hợp lệ cho tất cả sản phẩm trước khi chuyển sang trạng thái "Chờ giao hàng"',
            duration: 5000,
          });
          return;
        }
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
              time: new Date().toLocaleString('vi-VN'),
              employee: 'Hệ thống'
            });

            // Gửi email thông báo cho khách hàng
            try {
              await hoaDonStore.sendStatusUpdateEmail(invoice.value.id, status, invoice.value.khachHang?.email);

              toastNotification.value.addToast({
                type: 'success',
                message: `Đã cập nhật trạng thái thành "${status}". Email thông báo đã được gửi tới ${invoice.value.khachHang?.email || 'khách hàng'}.`,
                duration: 5000
              });
            } catch (emailError) {
              console.error('Lỗi khi gửi email thông báo:', emailError);
              toastNotification.value.addToast({
                type: 'warning',
                message: `Đã cập nhật trạng thái thành "${status}" nhưng không thể gửi email thông báo.`,
                duration: 5000
              });
            }

            await hoaDonStore.fetchInvoiceDetail(invoice.value.id); // Reload lại dữ liệu hóa đơn
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

    // Methods cho thanh toán
    const calculateRemainingAmount = () => {
      // Tự động tính toán thông qua computed properties
    };

    const confirmPayment = async () => {
      if (remainingAmount.value > 0) {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Vui lòng thanh toán đủ số tiền trước khi xác nhận',
          duration: 3000,
        });
        return;
      }

      if (totalPaid.value === 0) {
        toastNotification.value.addToast({
          type: 'warning',
          message: 'Vui lòng nhập số tiền thanh toán',
          duration: 3000,
        });
        return;
      }

      notificationType.value = 'confirm';
      notificationMessage.value = `Xác nhận thanh toán ${formatPrice(totalPaid.value)} cho hóa đơn này?`;
      notificationOnConfirm.value = async () => {
        try {
          isNotificationLoading.value = true;

          const paymentPayload = {
            hoaDonId: invoiceId.value,
            tienChuyenKhoan: paymentData.value.chuyenKhoan || 0,
            tienMat: paymentData.value.tienMat || 0,
            tongTien: totalPaid.value
          };

          const response = await apiService.post(`/api/hoa-don/${invoiceId.value}/thanh-toan`, paymentPayload);

          if (response.data) {
            toastNotification.value.addToast({
              type: 'success',
              message: 'Xác nhận thanh toán thành công!',
              duration: 3000,
            });

            // Reset form thanh toán
            paymentData.value.chuyenKhoan = 0;
            paymentData.value.tienMat = 0;

            // Reload invoice data
            await hoaDonStore.fetchInvoiceDetail(invoiceId.value);
            if (hoaDonStore.getInvoiceDetail) {
              invoice.value = hoaDonStore.getInvoiceDetail;
              payments.value = hoaDonStore.getInvoiceDetail.payments || [];
              history.value = hoaDonStore.getInvoiceDetail.history || [];
              updateTimelineStatuses();
            }
          }
        } catch (error) {
          console.error('Payment error:', error);
          toastNotification.value.addToast({
            type: 'error',
            message: error.response?.data?.message || 'Lỗi khi xác nhận thanh toán',
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

    const updateIMEIPage = (page) => {
      imeiCurrentPage.value = page;
    };

    const updateIMEIItemsPerPage = (value) => {
      imeiItemsPerPage.value = value;
      imeiCurrentPage.value = 1;
    };

    // Bulk IMEI Confirmation Methods
    const showBulkConfirmIMEIModal = () => {
      // Filter products that need IMEI confirmation
      const productsNeedingIMEI = groupedProducts.value.filter(product => product.needsIMEI > 0);

      if (productsNeedingIMEI.length === 0) {
        toastNotification.value.addToast({
          type: 'info',
          message: 'Không có sản phẩm nào cần xác nhận IMEI',
          duration: 3000,
        });
        return;
      }

      bulkConfirmProducts.value = productsNeedingIMEI;
      currentBulkProductIndex.value = 0;
      bulkSelectedIMEIs.value.clear();
      bulkSearchIMEI.value = '';
      isBulkConfirmIMEIModalVisible.value = true;

      // Load IMEI for first product
      loadIMEIForBulkProduct();
    };

    const closeBulkConfirmIMEIModal = () => {
      isBulkConfirmIMEIModalVisible.value = false;
      bulkConfirmProducts.value = [];
      currentBulkProductIndex.value = 0;
      bulkSelectedIMEIs.value.clear();
      bulkAvailableIMEIs.value = [];
      bulkSearchIMEI.value = '';
      isLoadingBulkIMEI.value = false;
    };

    const loadIMEIForBulkProduct = async () => {
      const product = currentBulkProduct.value;
      if (!product) return;

      try {
        isLoadingBulkIMEI.value = true;

        // Clear previous IMEI data immediately when switching products
        bulkAvailableIMEIs.value = [];

        // Also clear store data to ensure fresh fetch
        hoaDonStore.imelList = [];
        console.log('Cleared both component and store IMEI data for new product');

        console.log('Loading IMEIs for product:', product);

        // Ensure we have idSanPham
        if (!product.idSanPham) {
          console.log('Fetching idSanPham for chiTietSanPhamId:', product.chiTietSanPhamId);
          const response = await apiService.get(`/api/chi-tiet-san-pham/${product.chiTietSanPhamId}/id-san-pham`);
          product.idSanPham = response.data;
          console.log('Got idSanPham:', product.idSanPham);
        }

        // Use the same method as the working IMEI modal
        console.log('Calling fetchImelList with params:', {
          page: 0,
          size: 100,
          idSanPham: product.idSanPham,
          chiTietSanPhamId: product.chiTietSanPhamId,
          clearPrevious: true
        });

        await hoaDonStore.fetchImelList({
          page: 0,
          size: 100,
          idSanPham: product.idSanPham,
          chiTietSanPhamId: product.chiTietSanPhamId,
          clearPrevious: true
        });

        const storeIMEIs = hoaDonStore.getImelList || [];
        console.log('Store IMEIs received:', storeIMEIs.length, storeIMEIs);

        // Log the first IMEI to see its structure
        if (storeIMEIs.length > 0) {
          console.log('First IMEI structure:', storeIMEIs[0]);
          console.log('Available fields:', Object.keys(storeIMEIs[0]));
        }

        // First, filter by availability status
        const availableIMEIs = storeIMEIs.filter(imei => {
          const isAvailable = imei.status === 'Còn hàng' || imei.trangThai === 'Còn hàng';
          console.log('IMEI:', imei.imei, 'Status:', imei.status || imei.trangThai, 'Available:', isAvailable);
          return isAvailable;
        });

        console.log('Available IMEIs before product filtering:', availableIMEIs.length, availableIMEIs);

        // Debug: Log detailed IMEI structure
        if (availableIMEIs.length > 0) {
          console.log('Sample IMEI structure:', availableIMEIs[0]);
          console.log('All IMEI fields:', Object.keys(availableIMEIs[0]));
        }

        // Apply strict product-specific filtering
        let filteredIMEIs = availableIMEIs;

        console.log('Product attributes for filtering:', {
          color: product.color,
          ram: product.ram,
          capacity: product.capacity,
          chiTietSanPhamId: product.chiTietSanPhamId
        });

        // Temporarily disable strict filtering to debug data mismatch
        console.log('DEBUG: Checking if filtering is the issue...');

        // Show all available IMEIs first to debug
        console.log('All available IMEIs (no filtering):', availableIMEIs.map(imei => ({
          imei: imei.imei,
          color: imei.mauSac || imei.color,
          ram: imei.dungLuongRam || imei.ram,
          storage: imei.dungLuongBoNhoTrong || imei.capacity || imei.dungLuongBoNho,
          status: imei.status || imei.trangThai
        })));

        // For now, show all available IMEIs to verify data exists
        filteredIMEIs = availableIMEIs;

        // Optional: Apply lenient filtering if product has attributes
        if (product.color || product.ram || product.capacity) {
          console.log('Product filtering criteria:', {
            productColor: product.color,
            productRam: product.ram,
            productCapacity: product.capacity
          });

          // Try lenient filtering - match any one attribute instead of all
          const lenientFiltered = availableIMEIs.filter(imei => {
            const imeiColor = imei.mauSac || imei.color;
            const imeiRam = imei.dungLuongRam || imei.ram;
            const imeiStorage = imei.dungLuongBoNhoTrong || imei.capacity || imei.dungLuongBoNho;

            const matchColor = !product.color || (imeiColor === product.color);
            const matchRam = !product.ram || (imeiRam === product.ram);
            const matchStorage = !product.capacity || (imeiStorage === product.capacity);

            // Lenient: match if at least one attribute matches or no attributes specified
            const hasMatch = matchColor || matchRam || matchStorage;

            console.log('Lenient IMEI filtering:', {
              imei: imei.imei,
              imeiColor,
              imeiRam,
              imeiStorage,
              matchColor,
              matchRam,
              matchStorage,
              hasMatch
            });

            return hasMatch;
          });

          console.log('Lenient filtered IMEIs:', lenientFiltered.length, lenientFiltered);
          // Use lenient filtering if it finds results, otherwise use all
          if (lenientFiltered.length > 0) {
            filteredIMEIs = lenientFiltered;
          }
        }

        console.log('Final filtered IMEIs for product:', filteredIMEIs.length, filteredIMEIs);
        bulkAvailableIMEIs.value = filteredIMEIs;

      } catch (error) {
        console.error('Error loading IMEIs for bulk confirmation:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách IMEI: ' + (error.message || 'Unknown error'),
          duration: 3000,
        });
        bulkAvailableIMEIs.value = [];
      } finally {
        isLoadingBulkIMEI.value = false;
      }
    };

    const nextBulkProduct = () => {
      if (currentBulkProductIndex.value < bulkConfirmProducts.value.length - 1) {
        // Force clear all IMEI data before switching
        bulkAvailableIMEIs.value = [];
        hoaDonStore.imelList = [];
        console.log('Force cleared data before next product');

        currentBulkProductIndex.value++;
        bulkSearchIMEI.value = '';

        // Add small delay to ensure state is cleared
        setTimeout(() => {
          loadIMEIForBulkProduct();
        }, 100);
      }
    };

    const previousBulkProduct = () => {
      if (currentBulkProductIndex.value > 0) {
        // Force clear all IMEI data before switching
        bulkAvailableIMEIs.value = [];
        hoaDonStore.imelList = [];
        console.log('Force cleared data before previous product');

        currentBulkProductIndex.value--;
        bulkSearchIMEI.value = '';

        // Add small delay to ensure state is cleared
        setTimeout(() => {
          loadIMEIForBulkProduct();
        }, 100);
      }
    };

    const getBulkSelectedIMEICount = () => {
      const product = currentBulkProduct.value;
      if (!product) return 0;
      const selectedIMEIs = bulkSelectedIMEIs.value.get(product.groupKey) || [];
      return selectedIMEIs.length;
    };

    const isBulkIMEISelected = (imei) => {
      const product = currentBulkProduct.value;
      if (!product) return false;
      const selectedIMEIs = bulkSelectedIMEIs.value.get(product.groupKey) || [];
      return selectedIMEIs.includes(imei);
    };

    const toggleBulkIMEISelection = (imei) => {
      const product = currentBulkProduct.value;
      if (!product) return;

      const currentSelected = bulkSelectedIMEIs.value.get(product.groupKey) || [];
      const isSelected = currentSelected.includes(imei);

      if (isSelected) {
        const newSelected = currentSelected.filter(selectedImei => selectedImei !== imei);
        bulkSelectedIMEIs.value.set(product.groupKey, newSelected);
      } else {
        if (currentSelected.length < product.needsIMEI) {
          const newSelected = [...currentSelected, imei];
          bulkSelectedIMEIs.value.set(product.groupKey, newSelected);
        } else {
          toastNotification.value.addToast({
            type: 'warning',
            message: `Chỉ có thể chọn tối đa ${product.needsIMEI} IMEI cho sản phẩm này`,
            duration: 3000,
          });
        }
      }
    };

    const confirmAllBulkIMEIs = async () => {
      isConfirmingBulkIMEI.value = true;
      const imelMap = {};
      let errorOccurred = false;

      try {
        const productInstancesNeedingIMEI = products.value.filter(p => !p.imei);

        bulkSelectedIMEIs.value.forEach((selectedImeis, groupKey) => {
          if (errorOccurred) return;

          const instancesInGroup = productInstancesNeedingIMEI.filter(p => p.groupKey === groupKey);

          if (selectedImeis.length > instancesInGroup.length) {
            console.warn(`Số lượng IMEI đã chọn (${selectedImeis.length}) nhiều hơn số lượng sản phẩm cần IMEI (${instancesInGroup.length}) cho nhóm ${groupKey}. Chỉ lấy đủ số lượng.`);
          }

          for (let i = 0; i < selectedImeis.length; i++) {
            if (i < instancesInGroup.length) {
              const imei = selectedImeis[i];
              const productInstance = instancesInGroup[i];
              imelMap[productInstance.chiTietSanPhamId] = imei;
            } else {
              break;
            }
          }
        });

        if (Object.keys(imelMap).length === 0) {
          toastNotification.value.addToast({
            type: 'warning',
            message: 'Không có IMEI nào được chọn để xác nhận.',
            duration: 3000,
          });
          isConfirmingBulkIMEI.value = false;
          return;
        }

        console.log('Final imelMap to be sent:', imelMap);

        await hoaDonStore.confirmAndAssignIMEI(invoiceId.value, imelMap);

        toastNotification.value.addToast({
          type: 'success',
          message: 'Xác nhận và gán IMEI thành công!',
          duration: 3000,
        });

        closeBulkConfirmIMEIModal();
        await hoaDonStore.fetchInvoiceDetail(invoiceId.value);

        // Cập nhật lại danh sách sản phẩm local để UI re-render
        if (hoaDonStore.getInvoiceDetail?.products) {
          products.value = hoaDonStore.getInvoiceDetail.products.map(product => ({
            ...product,
            chiTietSanPhamId: product.chiTietSanPhamId || product.id,
            idSanPham: product.idSanPham,
            tenSanPham: product.tenSanPham || product.name,
            name: product.tenSanPham || product.name,
            mauSac: product.mauSac || product.color,
            color: product.mauSac || product.color,
            dungLuongRam: product.dungLuongRam || product.ram,
            ram: product.dungLuongRam || product.ram,
            dungLuongBoNhoTrong: product.dungLuongBoNhoTrong || product.capacity,
            capacity: product.dungLuongBoNhoTrong || product.capacity,
            giaBan: product.giaBan || product.price,
            price: product.giaBan || product.price,
            duongDan: product.duongDan || product.image,
            image: product.duongDan || product.image,
          }));
        }

      } catch (error) {
        console.error('Lỗi khi xác nhận IMEI hàng loạt:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình xác nhận IMEI.',
          duration: 5000,
        });
      } finally {
        isConfirmingBulkIMEI.value = false;
      }
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
      viewIMEIHeaders,
      imeiCurrentPage,
      imeiItemsPerPage,
      imeiPageSizeOptions,
      totalIMEIPages,
      formatPrice,
      formatDate,
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
      confirmSelectedIMEIs,
      isIMEISelected,
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
      paymentData,
      totalPaid,
      remainingAmount,
      calculateRemainingAmount,
      confirmPayment,
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
      groupedProducts,
      getSelectedIMEICount,
      isConfirmingIMEI,
      isViewIMEIModalVisible,
      showViewIMEIModal,
      closeViewIMEIModal,
      fetchViewIMEIData,
      viewIMEIData,
      viewIMEICurrentPage,
      viewIMEIPageSize,
      viewIMEITotalPages,
      changeViewIMEIPage,
      changeViewIMEIPageSize,
      isLoadingViewIMEI,
      isBulkConfirmIMEIModalVisible,
      bulkConfirmProducts,
      currentBulkProductIndex,
      bulkSelectedIMEIs,
      bulkAvailableIMEIs,
      bulkSearchIMEI,
      isConfirmingBulkIMEI,
      isLoadingBulkIMEI,
      hasProductsNeedingIMEI,
      currentBulkProduct,
      filteredBulkIMEIs,
      canConfirmBulkIMEIs,
      isLastBulkProduct,
      showBulkConfirmIMEIModal,
      isActionButtonsDisabled,
      closeBulkConfirmIMEIModal,
      loadIMEIForBulkProduct,
      nextBulkProduct,
      previousBulkProduct,
      getBulkSelectedIMEICount,
      isBulkIMEISelected,
      toggleBulkIMEISelection,
      confirmAllBulkIMEIs,
      isIMEISelectionModalVisible,
      selectedProductForIMEI,
      selectedIMEIsForProduct,
      availableIMEIsForProduct,
      imeiSearchQuery,
      isAddingProduct,
      selectProductForIMEI,
      closeIMEISelectionModal,
      toggleIMEISelection,
      toggleSelectAllIMEIs,
      toggleSelectAllConfirmIMEIs,
      updateIMEIPageForProduct,
      confirmAddProductWithIMEI,
      filteredAvailableIMEIs,
      totalIMEIPagesForProduct,
      paginatedAvailableIMEIs,
      debouncedSearchIMEIForProduct,
    };
  }
};