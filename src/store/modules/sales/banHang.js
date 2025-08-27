import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import QrcodeVue from "qrcode.vue";
import { useRouter } from "vue-router";
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useGiaoCaStore } from "@/store/modules/giaoCa";

// Import utility and API functions
import {
  debounce,
  formatPrice,
  formatDate,
  isValidDiscount,
} from "./banHangUtils";
import {
  fetchPendingInvoicesApi,
  createNewPendingInvoiceApi,
  loadPendingInvoiceApi,
  cancelInvoiceApi,
  fetchProductsApi,
  getAllAddressesByKhachHangIdApi,
  removeItemApi,
  fetchIMEIsApi,
  getProductDetailsByIdApi,
  addProductToCartApi,
  updateIMEIStatusApi,
  deleteIMEIFromCartApi,
  searchCustomersApi,
  updatePhieuGiamGiaApi,
  addCustomerApi,
  getPhieuGiamGiaByKhachHangApi,
  fetchProvincesApi,
  fetchDistrictsApi,
  fetchWardsApi,
  fetchPGGApi,
  validateDiscountApi,
  createPaymentApi,
  completeOrderApi,
  checkVNPayPaymentStatusApi,
  addProductByBarcodeOrImeiApi,
} from "./banHangApi";

export default {
  components: {
    HeaderCard,
    DataTable,
    NotificationModal,
    ToastNotification,
    FilterTableSection,
    QrcodeVue,
  },
  setup() {
    const selectedDeviceId = ref(null);
    const codeReader = ref(null);
    const isCameraActive = ref(false);
    const showScanModal = ref(false);
    const scannedCode = ref("");
    const isScanning = ref(false);
    const scanError = ref("");
    const videoElement = ref(null);
    const scanRegion = ref(null);

    // State
    const isCreatingInvoice = ref(false);
    const isCreatingOrder = ref(false);
    const activeInvoiceId = ref(null);
    const invoiceSearchQuery = ref("");
    const pendingInvoices = ref([]);
    const cartItems = ref([]);
    const showIMEIModal = ref(false);
    const showCartIMEIModal = ref(false);
    const isCustomerModalOpen = ref(false);
    const isLoadingMore = ref(false);
    const showPaymentProviderModal = ref(false);
    const selectedPaymentProvider = ref(null);
    const productSearchQuery = ref("");
    const filterColor = ref("");
    const filterRam = ref("");
    const filterStorage = ref("");
    const selectedProduct = ref(null);
    const selectedIMEIs = ref([]);
    const searchCustomer = ref("");
    const selectedCustomer = ref(null);
    const isSearching = ref(false);
    const customer = ref({
      id: null,
      name: "",
      phone: "",
      city: "",
      district: "",
      ward: "",
      address: "",
    });
    const receiver = ref({
      name: "",
      phone: "",
      city: "",
      district: "",
      ward: "",
      address: "",
    });
    const isReceiverEditable = ref(true);
    const isDelivery = ref(false);
    const selectedDiscount = ref(null);
    const privateDiscountCodes = ref([]);
    const publicDiscountCodes = ref([]);
    const paymentMethod = ref("cash");
    const tienChuyenKhoan = ref(0);
    const tienMat = ref(0);
    const newCustomer = ref({
      name: "",
      phone: "",
      city: "",
      district: "",
      ward: "",
      address: "",
    });
    const showAddressModal = ref(false); // Kiểm soát hiển thị modal chọn địa chỉ
    const customerAddresses = ref([]); // Lưu danh sách địa chỉ của khách hàng
    const notificationType = ref("confirm");
    const notificationMessage = ref("");
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => { });
    const notificationOnCancel = ref(() => { });
    const notificationModal = ref(null);
    const toastNotification = ref(null);
    const qrCodeValue = ref("");
    const qrCodeAmount = ref(0);
    const currentPage = ref(0);
    const totalPages = ref(1);

    // Sample data
    const products = ref([]);
    const availableIMEIs = ref([]);
    const provinces = ref([]);
    const districts = ref([]);
    const wards = ref([]);
    const router = useRouter();
    const manualDiscountSelected = ref(false);

    const cartSearchQuery = ref("");
    const cartFilterColor = ref("");
    const cartFilterRam = ref("");
    const cartFilterStorage = ref("");
    const showProductDetails = ref(false);
    const selectedCartItem = ref(null);
    const modalPosition = ref({ top: 0, left: 0 });

    const uniqueCartColors = computed(() => [
      ...new Set(cartItems.value.map((item) => item.color)),
    ]);
    const uniqueCartRams = computed(() => [
      ...new Set(cartItems.value.map((item) => item.ram)),
    ]);
    const uniqueCartStorages = computed(() => [
      ...new Set(cartItems.value.map((item) => item.storage)),
    ]);

    const filteredCartItems = computed(() => {
      let filtered = cartItems.value;
      if (cartSearchQuery.value) {
        const query = cartSearchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.imei.toLowerCase().includes(query) ||
            item.color.toLowerCase().includes(query)
        );
      }
      if (cartFilterColor.value) {
        filtered = filtered.filter(
          (item) => item.color === cartFilterColor.value
        );
      }
      if (cartFilterRam.value) {
        filtered = filtered.filter((item) => item.ram === cartFilterRam.value);
      }
      if (cartFilterStorage.value) {
        filtered = filtered.filter(
          (item) => item.storage === cartFilterStorage.value
        );
      }
      return filtered;
    });

    const debouncedCartSearch = debounce((query) => {
      cartSearchQuery.value = query;
    }, 300);

    // DataTable headers
    // const cartHeaders = ref([
    //   { text: "STT", value: "stt" },
    //   { text: "Ảnh", value: "imageUrl", width: "100px" },
    //   { text: "Tên sản phẩm", value: "name" },
    //   { text: "Màu sắc", value: "color" },
    //   { text: "RAM", value: "ram" },
    //   { text: "Bộ nhớ", value: "storage" },
    //   { text: "IMEI", value: "imei" },
    //   { text: "Đơn giá", value: "currentPrice" },
    //   { text: "Số lượng", value: "quantity" },
    //   { text: "Thành tiền", value: "total" },
    //   { text: "Hành động", value: "actions" },
    // ]);

    const cartHeaders = ref([
      { text: "STT", value: "stt" },
      { text: "Ảnh", value: "imageUrl", width: "100px" },
      { text: "Tên sản phẩm", value: "name" },
      { text: "Màu sắc", value: "color" },
      { text: "RAM", value: "ram" },
      { text: "Bộ nhớ", value: "storage" },
      { text: "IMEI", value: "imei" },
      { text: "Đơn giá", value: "currentPrice" },
      { text: "Số lượng", value: "quantity" },
      { text: "Thành tiền", value: "total" },
      { text: "Hành động", value: "actions" },
    ]);

    const productHeaders = ref([
      { value: "stt", formatter: (_, __, index) => index + 1, text: "#" },
      { text: "Ảnh", value: "imageUrl", width: "100px" },
      { value: "tenSanPham", text: "Tên sản phẩm" },
      { value: "maSanPham", text: "Mã" },
      { value: "mauSac", text: "Màu", formatter: (value) => value || "N/A" },
      {
        value: "dungLuongRam",
        text: "Ram",
        formatter: (value) => value || "N/A",
      },
      {
        value: "dungLuongBoNhoTrong",
        text: "Bộ nhớ trong",
        formatter: (value) => value || "N/A",
      },
      { value: "soLuong", text: "Số lượng", formatter: (value) => value || 0 },
      {
        value: "giaBan",
        text: "Giá",
        formatter: (value) => formatPrice(value),
      },
      { value: "actions", text: "Thao tác", cellSlot: "productActionsSlot" },
    ]);

    // Computed
    const discount = computed({
      get: () => {
        if (!selectedDiscount.value) return 0;
        const fixedDiscount = selectedDiscount.value.value || 0;
        const percentDiscount = selectedDiscount.value.percent
          ? Math.min(
            (selectedDiscount.value.percent / 100) * tongTien.value,
            selectedDiscount.value.value || Infinity
          )
          : 0;
        return Math.max(fixedDiscount, percentDiscount);
      },
      set: (newValue) => {
        if (selectedDiscount.value) {
          selectedDiscount.value.value = newValue;
        }
      },
    });
    const suggestedDiscounts = computed(() => {
      return publicDiscountCodes.value
        .filter((discount) => {
          return (
            tongTien.value < discount.minOrder &&
            isValidDiscount(discount.rawExpiry)
          );
        })
        .map((discount) => ({
          ...discount,
          missingAmount: discount.minOrder - tongTien.value,
        }))
        .sort((a, b) => b.value - a.value);
    });
    const alternativeDiscounts = computed(() => {
      const allDiscounts = [
        ...publicDiscountCodes.value.map((code) => ({
          ...code,
          type: "public",
        })),
        ...privateDiscountCodes.value.map((code) => ({
          ...code,
          type: "private",
        })),
      ];

      return allDiscounts
        .filter((discount) => {
          if (
            discount.type === "public" &&
            tongTien.value < discount.minOrder
          ) {
            return false;
          }
          return (
            isValidDiscount(discount.rawExpiry) &&
            (!selectedDiscount.value ||
              discount.id !== selectedDiscount.value.id)
          );
        })
        .sort((a, b) => b.value - a.value);
    });
    const uniqueColors = computed(() => [
      ...new Set(products.value.map((p) => p.mauSac)),
    ]);
    const uniqueRams = computed(() => [
      ...new Set(products.value.map((p) => p.dungLuongRam)),
    ]);
    const uniqueStorages = computed(() => [
      ...new Set(products.value.map((p) => p.dungLuongBoNhoTrong)),
    ]);

    const filteredPendingInvoices = computed(() => {
      if (!invoiceSearchQuery.value) return pendingInvoices.value;
      const query = invoiceSearchQuery.value.toLowerCase();
      return pendingInvoices.value.filter((invoice) =>
        invoice.ma.toLowerCase().includes(query)
      );
    });

    const filteredProducts = computed(() => {
      let filtered = products.value;
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

    const tongTien = computed(() => {
      return cartItems.value.reduce(
        (sum, item) => sum + Number(item.originalPrice) * item.quantity,
        0
      );
    });

    const FREE_SHIP_THRESHOLD = 50000000;
    const shippingFee = ref(0);
    const selectedShippingUnit = ref(null);
    const isHomeDelivery = ref(false);
    const shippingUnits = ref([
      { id: 1, name: "Giao Hàng Nhanh", logo: "/src/assets/Logo/logoGHN.png" },
      {
        id: 2,
        name: "Giao Hàng Tiết Kiệm",
        logo: "/src/assets/Logo/LogoGHTK.png",
      },
    ]);

    const totalPayment = computed(() => {
      let total = tongTien.value;
      total -= discount.value;
      if (isDelivery.value && tongTien.value < FREE_SHIP_THRESHOLD) {
        total += shippingFee.value;
      }
      return total > 0 ? total : 0;
    });

    const priceChangeInfo = computed(() => {
      return cartItems.value.map((item) => ({
        ...item,
        priceChangeText: item.ghiChuGia || null,
        displayPrice: Number(item.currentPrice),
      }));
    });

    const suggestAdditionalPurchase = computed(() => {
      if (!publicDiscountCodes.value.length || selectedDiscount.value) {
        return {
          message: selectedDiscount.value
            ? `Đã áp dụng mã giảm giá ${selectedDiscount.value.code}.`
            : "Không có mã giảm giá công khai nào khả dụng.",
          additionalAmount: 0,
          bestDiscount: null,
        };
      }

      const bestDiscount = publicDiscountCodes.value.reduce((best, code) => {
        if (tongTien.value >= code.minOrder) {
          return code.value > (best?.value || 0) ? code : best;
        }
        return code.value > (best?.value || 0) &&
          (!best || code.minOrder < best.minOrder)
          ? code
          : best;
      }, null);

      if (!bestDiscount) {
        return {
          message: "Không có mã giảm giá phù hợp.",
          additionalAmount: 0,
          bestDiscount: null,
        };
      }

      if (tongTien.value >= bestDiscount.minOrder) {
        return {
          message: `Bạn có thể áp dụng mã ${bestDiscount.code
            } để được giảm ${formatPrice(bestDiscount.value)}.`,
          additionalAmount: 0,
          bestDiscount,
        };
      }

      const additionalAmount = bestDiscount.minOrder - tongTien.value;
      return {
        message: `Mua thêm ${formatPrice(additionalAmount)} để sử dụng mã ${bestDiscount.code
          } và được giảm ${formatPrice(bestDiscount.value)}.`,
        additionalAmount,
        bestDiscount,
      };
    });

    // Utility Methods
    const showProductDetailsModal = (item, event) => {
      selectedCartItem.value = item;
      modalPosition.value = {
        top: event.clientY + 10,
        left: event.clientX + 10,
      };
      showProductDetails.value = true;
    };

    const hideProductDetailsModal = () => {
      showProductDetails.value = false;
      selectedCartItem.value = null;
    };

    const showToast = (type, message, isLoading = false, duration = 3000) => {
      toastNotification.value.addToast({ type, message, isLoading, duration });
    };

    const showConfirm = (message, onConfirm, onCancel = () => { }) => {
      notificationType.value = "confirm";
      notificationMessage.value = message;
      notificationOnConfirm.value = onConfirm;
      notificationOnCancel.value = onCancel;
      isNotificationLoading.value = false;
      if (notificationModal.value) {
        notificationModal.value.openModal();
      } else {
        console.error("notificationModal is not defined");
        showToast("error", "Không thể hiển thị thông báo xác nhận");
      }
    };

    const resetNotification = () => {
      notificationType.value = "confirm";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => { };
      notificationOnCancel.value = () => { };
    };

    // Debounced Search Functions
    const debouncedInvoiceSearch = debounce((query) => {
      invoiceSearchQuery.value = query;
    }, 300);

    const debouncedProductSearch = debounce((query) => {
      productSearchQuery.value = query;
    }, 300);

    const debouncedCustomerSearch = debounce((query) => {
      searchCustomer.value = query;
      searchCustomers();
    }, 300);

    // Invoice-Related Methods
    const fetchPendingInvoices = async () => {
      try {
        const data = await fetchPendingInvoicesApi();
        // Chỉ lấy thông tin cơ bản của hóa đơn, không load chi tiết giỏ hàng
        pendingInvoices.value = data.map((hd) => ({
          id: hd.id,
          ma: hd.ma,
          status: hd.trangThai === 0 ? "Chờ xử lý" : "Khác",
          items: [], // Khởi tạo items rỗng, sẽ load khi người dùng chọn
          customer: null, // Khởi tạo customer null, sẽ load khi người dùng chọn
          isLoaded: false, // Thêm flag để biết hóa đơn đã được load chi tiết chưa
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải hóa đơn chờ");
      }
    };

    // Trong hàm createNewPendingInvoice
    const createNewPendingInvoice = async () => {
      const giaoCaStore = useGiaoCaStore();
      await giaoCaStore.checkActiveShift(
        JSON.parse(localStorage.getItem("auth")).user.idNhanVien
      );

      if (!giaoCaStore.activeShift) {
        showToast(
          "error",
          giaoCaStore.error ||
          "Nhân viên chưa bắt đầu ca làm việc. Vui lòng bắt đầu ca làm việc trước khi tạo hóa đơn."
        );
        return;
      }

      if (pendingInvoices.value.length >= 5) {
        showToast("error", "Đã đạt giới hạn 5 hóa đơn chờ");
        return;
      }
      isCreatingInvoice.value = true;
      try {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        const nhanVienId = auth?.user?.idNhanVien;
        if (!nhanVienId) {
          showToast(
            "error",
            "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại."
          );
          router.push("/auth/login");
          return;
        }
        const newInvoiceData = await createNewPendingInvoiceApi(
          customer.value.id,
          nhanVienId
        );
        const newInvoice = {
          id: newInvoiceData.id,
          ma: newInvoiceData.ma,
          status: "Chờ xử lý",
          items: [],
          customer: null, // Khởi tạo customer là null
        };
        pendingInvoices.value.push(newInvoice);
        activeInvoiceId.value = newInvoice.id;
        cartItems.value = [];
        selectedCustomer.value = null;
        customer.value = {
          id: null,
          name: "",
          phone: "",
          city: "",
          district: "",
          ward: "",
          address: "",
        };
        searchCustomer.value = ""; // Reset ô tìm kiếm khách hàng
        privateDiscountCodes.value = [];
        selectedDiscount.value = null;
        showToast("success", `Tạo hóa đơn mới thành công: ${newInvoice.ma}`);
      } catch (error) {
        showToast("error", `Lỗi khi tạo hóa đơn mới: ${error.message}`);
      } finally {
        isCreatingInvoice.value = false;
      }
    };

    // Trong hàm loadPendingInvoice
    const loadPendingInvoice = async (invoice) => {
      activeInvoiceId.value = invoice.id;
      try {
        const responseData = await loadPendingInvoiceApi(invoice.id);
        cartItems.value = responseData.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
          imageUrl: item.image || '/assets/images/placeholder.jpg',
        }));
        const index = pendingInvoices.value.findIndex(
          (inv) => inv.id === invoice.id
        );
        if (index !== -1) {
          pendingInvoices.value[index].items = cartItems.value;
          // Khôi phục thông tin khách hàng
          if (invoice.customer) {
            selectedCustomer.value = invoice.customer;
            customer.value = { ...invoice.customer };
            searchCustomer.value =
              invoice.customer.name || invoice.customer.phone || "";
            if (customer.value.city) {
              await fetchDistricts(customer.value.city);
              if (customer.value.district) {
                await fetchWards(customer.value.district);
              }
            }
            // Lấy lại mã giảm giá cá nhân
            const pggResult = await getPhieuGiamGiaByKhachHangApi(
              customer.value.id
            );
            if (pggResult.success && Array.isArray(pggResult.data)) {
              privateDiscountCodes.value = pggResult.data
                .filter(
                  (item) =>
                    item.idPhieuGiamGia?.riengTu === true &&
                    isValidDiscount(item.idPhieuGiamGia?.ngayKetThuc)
                )
                .map((item, index) => ({
                  id: item.id || index + 1,
                  code: item.ma || "Unknown",
                  value: item.idPhieuGiamGia?.soTienGiamToiDa || 0,
                  expiry: formatDate(item.idPhieuGiamGia?.ngayKetThuc),
                  rawExpiry: item.idPhieuGiamGia?.ngayKetThuc,
                  type: "private",
                }));
            } else {
              privateDiscountCodes.value = [];
            }
          } else {
            selectedCustomer.value = null;
            customer.value = {
              id: null,
              name: "",
              phone: "",
              city: "",
              district: "",
              ward: "",
              address: "",
            };
            searchCustomer.value = "";
            privateDiscountCodes.value = [];
          }
        }
        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });
        showToast("info", `Đã tải hóa đơn ${invoice.ma}`);
        await applyBestDiscount();
      } catch (error) {
        showToast("error", "Lỗi khi tải giỏ hàng");
      }
    };

    const closeAddressModal = () => {
      showAddressModal.value = false;
      selectedAddressId.value = null; // Reset any related state
      console.log('Modal closed'); // Optional debug log
    };

    // Cập nhật hàm searchCustomers
    const searchCustomers = async () => {
      if (!activeInvoiceId.value) {
        showToast("error", "Vui lòng chọn hoặc tạo một hóa đơn trước khi tìm kiếm khách hàng");
        return;
      }

      isSearching.value = true; // Bắt đầu loading
      try {
        const keyword = searchCustomer.value || "";
        const result = await searchCustomersApi(keyword, activeInvoiceId.value);

        if (result.success && result.data) {
          const customerData = {
            id: result.data.idKhachHang?.id || 1,
            ten: searchCustomer.value ? result.data.tenKhachHang || "" : "",
            soDienThoai: result.data.soDienThoaiKhachHang || "",
            diaChi: result.data.diaChiKhachHang || "",
            email: result.data.email || "",
          };

          selectedCustomer.value = customerData;
          customer.value = {
            id: customerData.id,
            name: customerData.ten,
            phone: customerData.soDienThoai,
            city: result.data.diaChiKhachHang?.thanhPho || "",
            district: result.data.diaChiKhachHang?.quan || "",
            ward: result.data.diaChiKhachHang?.phuong || "",
            address: result.data.diaChiKhachHang?.diaChiCuThe || "",
          };

          // Lấy danh sách địa chỉ khách hàng
          if (customerData.id) {
            const addressResult = await getAllAddressesByKhachHangIdApi(customerData.id);
            customerAddresses.value = addressResult.success && Array.isArray(addressResult.data)
              ? addressResult.data.map((addr, index) => ({
                id: addr.id || index + 1,
                city: addr.thanhPho || "",
                district: addr.quan || "",
                ward: addr.phuong || "",
                address: addr.diaChiCuThe || "",
              }))
              : [];
          }

          // Gắn vào hóa đơn
          const invoiceIndex = pendingInvoices.value.findIndex((inv) => inv.id === activeInvoiceId.value);
          if (invoiceIndex !== -1) {
            pendingInvoices.value[invoiceIndex].customer = {
              ...customer.value,
              idKhachHang: customerData.id,
              tenKhachHang: customerData.ten,
              soDienThoaiKhachHang: customerData.soDienThoai,
            };
          }

          await applyBestDiscount();
        } else {
          selectedCustomer.value = null;
          customer.value = { id: null, name: "", phone: "", city: "", district: "", ward: "", address: "" };
          customerAddresses.value = [];
          privateDiscountCodes.value = [];
          showToast("warning", result.message || "Không tìm thấy khách hàng");
          await applyBestDiscount();
        }
      } catch (error) {
        selectedCustomer.value = null;
        customer.value = { id: null, name: "", phone: "", city: "", district: "", ward: "", address: "" };
        customerAddresses.value = [];
        privateDiscountCodes.value = [];
        showToast("error", `Lỗi khi tìm kiếm khách hàng: ${error.response?.data || error.message}`);
        await applyBestDiscount();
      } finally {
        isSearching.value = false; // Kết thúc loading
      }
    };


    const selectAddress = async (address) => {
      customer.value = {
        ...customer.value,
        city: address.city,
        district: address.district,
        ward: address.ward,
        address: address.address,
      };
      if (isDelivery.value) {
        receiver.value = { ...customer.value };
        isReceiverEditable.value = false;
      }
      // Cập nhật thông tin khách hàng vào hóa đơn
      const invoiceIndex = pendingInvoices.value.findIndex(
        (inv) => inv.id === activeInvoiceId.value
      );
      if (invoiceIndex !== -1) {
        pendingInvoices.value[invoiceIndex].customer = {
          ...customer.value,
          idKhachHang: customer.value.id,
          tenKhachHang: customer.value.name,
          soDienThoaiKhachHang: customer.value.phone,
        };
      }
      showAddressModal.value = false;
      showToast(
        "success",
        `Đã chọn địa chỉ: ${address.address}, ${address.ward}, ${address.district}, ${address.city}`
      );
      if (customer.value.city) {
        await fetchDistricts(customer.value.city);
        if (customer.value.district) {
          await fetchWards(customer.value.district);
        }
      }
    };

    const applySelectedAddress = async () => {
      const selectedAddress = customerAddresses.value.find(
        (addr) => addr.id === selectedAddressId.value
      );
      if (selectedAddress) {
        await selectAddress(selectedAddress);
        showToast(
          "success",
          `Đã chọn địa chỉ: ${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`
        );
      }
      showAddressModal.value = false;
    };


    const openAddressModal = () => {
      if (!selectedCustomer.value || !selectedCustomer.value.id) {
        showToast("error", "Vui lòng chọn khách hàng trước khi chọn địa chỉ");
        return;
      }
      console.log("Customer addresses:", customerAddresses.value); // Log để kiểm tra
      if (customerAddresses.value.length === 0) {
        showToast("warning", "Khách hàng này chưa có địa chỉ nào");
        return;
      }
      showAddressModal.value = true;
    };
    const confirmCancelInvoice = (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.ma}?`,
        () => cancelInvoice(invoice),
        () => { }
      );
    };

    const cancelInvoice = async (invoice) => {
      isNotificationLoading.value = true;
      try {
        await cancelInvoiceApi(invoice.id);
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== invoice.id
        );
        if (activeInvoiceId.value === invoice.id) {
          activeInvoiceId.value = null;
          cartItems.value = [];
          selectedDiscount.value = null;
          discount.value = 0;
        }
        showToast("success", `Đã hủy hóa đơn ${invoice.ma}`);
        resetNotification();
      } catch (error) {
        showToast("error", "Lỗi khi hủy hóa đơn");
      } finally {
        isNotificationLoading.value = false;
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetchProductsApi(0, 999999999);
        products.value = response.content.map((sp) => ({
          id: sp.id,
          sanPhamId: sp.idSanPham,
          tenSanPham: sp.tenSanPham,
          maSanPham: sp.ma,
          mauSac: sp.mauSac || "N/A",
          dungLuongRam: sp.dungLuongRam || "N/A",
          dungLuongBoNhoTrong: sp.dungLuongBoNhoTrong || "N/A",
          soLuong: sp.soLuong || 0,
          giaBan: sp.giaBan || 0,
          imageUrl: sp.duongDan || '/assets/images/placeholder.jpg',
        }));
      } catch (error) {
        const message = error.message || "Lỗi khi tải danh sách sản phẩm";
        showToast("error", message);
      }
    };

    const handleScroll = async () => {
      if (isLoadingMore.value || currentPage.value + 1 >= totalPages.value)
        return;
      isLoadingMore.value = true;
      currentPage.value += 1;
      showToast("success", "Đang tải thêm sản phẩm...", true, 0);
      try {
        const response = await fetchProductsApi(currentPage.value, 10);
        products.value.push(
          ...response.content.map((sp) => ({
            id: sp.id,
            sanPhamId: sp.idSanPham,
            tenSanPham: sp.tenSanPham,
            maSanPham: sp.ma,
            mauSac: sp.mauSac || "N/A",
            dungLuongRam: sp.dungLuongRam || "N/A",
            dungLuongBoNhoTrong: sp.dungLuongBoNhoTrong || "N/A",
            soLuong: sp.soLuong || 0,
            giaBan: sp.giaBan || 0,
            imageUrl: sp.image || '/assets/images/placeholder.jpg',
          }))
        );
        totalPages.value = response.totalPages;
        showToast("success", "Đã tải thêm sản phẩm");
      } catch (error) {
        const message = error.message || "Lỗi khi tải thêm sản phẩm";
        showToast("error", message);
      } finally {
        isLoadingMore.value = false;
      }
    };

    const removeItem = async (item) => {
      try {
        const responseData = await removeItemApi(
          activeInvoiceId.value,
          item.id
        );
        cartItems.value = responseData.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
          imageUrl: item.image || '/assets/images/placeholder.jpg',
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });
        showToast("success", `Đã xóa sản phẩm ${item.name} khỏi giỏ hàng`);
        await applyBestDiscount();
      } catch (error) {
        showToast("error", "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
      }
    };

    // IMEI-Related Methods
    const showIMEIList = async (product) => {
      selectedProduct.value = product;
      showIMEIModal.value = true;
      try {
        availableIMEIs.value = await fetchIMEIsApi(
          product.sanPhamId,
          product.mauSac,
          product.dungLuongRam,
          product.dungLuongBoNhoTrong,
          product.duongDan
        );
        selectedIMEIs.value = [];
      } catch (error) {
        showToast("error", error.message || "Lỗi khi tải danh sách IMEI");
      }
    };

    const showIMEIModalForItem = (item) => {
      selectedCartItem.value = item;
      showCartIMEIModal.value = true;
    };

    const closeIMEIModal = () => {
      showIMEIModal.value = false;
      selectedProduct.value = null;
      selectedIMEIs.value = [];
    };

    const closeCartIMEIModal = () => {
      showCartIMEIModal.value = false;
      selectedCartItem.value = null;
    };

    const handleIMEISelection = () => {
      // Update selected IMEIs
    };

    const removeIMEI = (imei) => {
      selectedIMEIs.value = selectedIMEIs.value.filter(
        (selected) => selected !== imei
      );
    };

    const addProductWithIMEIs = async () => {
      if (selectedIMEIs.value.length === 0) {
        showToast("error", "Vui lòng chọn ít nhất một IMEI!");
        return;
      }
      if (!selectedProduct.value?.sanPhamId) {
        showToast("error", "Vui lòng chọn một sản phẩm hợp lệ!");
        return;
      }

      try {
        const chiTietSanPhamId = await getProductDetailsByIdApi(
          selectedProduct.value.sanPhamId,
          selectedProduct.value.mauSac,
          selectedProduct.value.dungLuongRam,
          selectedProduct.value.dungLuongBoNhoTrong,
          selectedProduct.value.duongDan
        );

        const productData = (
          await fetchProductsApi(0, 1, selectedProduct.value.maSanPham)
        ).content[0];
        if (!productData) {
          showToast("error", "Không tìm thấy thông tin sản phẩm!");
          return;
        }
        const latestPrice =
          Number(productData.giaBan) || selectedProduct.value.giaBan;
        const latestInitialPrice =
          Number(productData.giaBanBanDau) || latestPrice;

        if (latestInitialPrice !== selectedProduct.value.giaBan) {
          const ghiChuGia = `Giá sản phẩm ${selectedProduct.value.tenSanPham
            } đã thay đổi thành ${formatPrice(
              latestPrice
            )} từ giá ban đầu ${formatPrice(latestInitialPrice)}`;
          showToast("warning", ghiChuGia);
        }

        const chiTietGioHangDTO = {
          chiTietSanPhamId: chiTietSanPhamId,
          soLuong: selectedIMEIs.value.length,
          maImel: selectedIMEIs.value.join(", "),
          idPhieuGiamGia: selectedDiscount.value?.id || null,
          giaBan: latestPrice,
          imageUrl: selectedProduct.value.duongDan || '/assets/images/placeholder.jpg',

        };

        const postResponseData = await addProductToCartApi(
          activeInvoiceId.value,
          chiTietGioHangDTO
        );

        const existingItems = cartItems.value.filter(
          (item) => !selectedIMEIs.value.includes(item.imei.split(", ")[0])
        );
        const newItems = postResponseData.chiTietGioHangDTOS
          .filter((item) => selectedIMEIs.value.includes(item.maImel))
          .map((item) => ({
            id: item.chiTietSanPhamId,
            name: item.tenSanPham,
            color: item.mauSac,
            ram: item.ram,
            storage: item.boNhoTrong,
            imei: item.maImel,
            originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
            currentPrice: Number(item.giaBan) || 0,
            quantity: Number(item.soLuong) || 1,
            ghiChuGia: item.ghiChuGia || "",
            imageUrl: item.image || '/assets/images/placeholder.jpg',
          }));

        cartItems.value = [...existingItems, ...newItems];

        const invoiceId = parseInt(
          postResponseData.gioHangId.replace("GH_", "")
        );
        if (isNaN(invoiceId)) {
          return;
        }
        activeInvoiceId.value = invoiceId;

        newItems.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });

        const invoiceIndex = pendingInvoices.value.findIndex(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoiceIndex === -1) {
          const newInvoice = {
            id: activeInvoiceId.value,
            ma: `HD${activeInvoiceId.value}`,
            status: "Chờ xử lý",
            items: cartItems.value,
          };
          pendingInvoices.value.push(newInvoice);
        } else {
          pendingInvoices.value[invoiceIndex].items = cartItems.value;
        }

        await applyBestDiscount();
        await fetchProducts();
      } catch (error) {
        showToast(
          "error",
          error.message || "Lỗi khi thêm sản phẩm vào giỏ hàng"
        );
      } finally {
        showToast(
          "success",
          `Đã thêm sản phẩm ${selectedProduct.value.tenSanPham} vào giỏ hàng`
        );
        closeIMEIModal();
      }
    };

    const deleteIMEI = async (imei) => {
      if (!selectedCartItem.value) return;
      try {
        const imeiArray = selectedCartItem.value.imei
          .split(", ")
          .filter((i) => i !== imei);
        const chiTietGioHangDTO = {
          chiTietSanPhamId: selectedCartItem.value.id,
          soLuong: imeiArray.length,
          maImel: imeiArray.join(", "),
        };
        const responseData = await deleteIMEIFromCartApi(
          activeInvoiceId.value,
          chiTietGioHangDTO
        );
        cartItems.value = responseData.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
          imageUrl: item.image || '/assets/images/placeholder.jpg',
        }));
        const invoiceIndex = pendingInvoices.value.findIndex(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoiceIndex !== -1) {
          pendingInvoices.value[invoiceIndex].items = cartItems.value;
        }
        if (imeiArray.length === 0) {
          closeCartIMEIModal();
        }
        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });
        showToast("success", `Đã xóa IMEI ${imei}`);
        await applyBestDiscount();
        await fetchProducts();
      } catch (error) {
        showToast("error", error.message || "Lỗi khi xóa IMEI");
      }
    };

    // Customer-Related Methods

    const addNewCustomer = async () => {
      if (!newCustomer.value.name || !newCustomer.value.name.trim()) {
        showToast("error", "Vui lòng nhập tên khách hàng");
        return;
      }
      if (newCustomer.value.name.length > 30) {
        showToast("error", "Tên khách hàng không được vượt quá 30 ký tự");
        return;
      }
      const nameRegex = /^[a-zA-ZÀ-ỹ\s'.-]+$/u;
      if (!nameRegex.test(newCustomer.value.name.trim())) {
        showToast(
          "error",
          "Tên khách hàng chỉ được chứa chữ cái và khoảng trắng"
        );
        return;
      }

      if (!newCustomer.value.phone || !newCustomer.value.phone.trim()) {
        showToast("error", "Vui lòng nhập số điện thoại");
        return;
      }

      const phone = newCustomer.value.phone.trim();
      const phoneRegex = /^(0|\+84)[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        showToast(
          "error",
          "Số điện thoại phải đúng định dạng Việt Nam (bắt đầu bằng 0 hoặc +84 và đủ 10 chữ số)"
        );
        return;
      }

      const payload = {
        tenKH: newCustomer.value.name.trim(),
        soDienThoai: newCustomer.value.phone.trim(),
        thanhPho: newCustomer.value.city?.trim() || "",
        quan: newCustomer.value.district?.trim() || "",
        phuong: newCustomer.value.ward?.trim() || "",
        diaChiCuThe: newCustomer.value.address?.trim() || "",
      };

      try {
        const response = await addCustomerApi(payload);
        if (response.success) {
          customer.value = {
            id: response.data.id,
            name: payload.tenKH,
            phone: payload.soDienThoai,
            city: payload.thanhPho,
            district: payload.quan,
            ward: payload.phuong,
            address: payload.diaChiCuThe,
          };
          selectedCustomer.value = response.data;
          isCustomerModalOpen.value = false;
          showToast(
            "success",
            `Thêm khách hàng thành công: ${customer.value.name}`
          );

          if (isDelivery.value) {
            receiver.value = { ...customer.value };
            isReceiverEditable.value = false;
          }
          await applyBestDiscount();
        } else {
          showToast("error", response.message || "Lỗi khi thêm khách hàng");
        }
      } catch (error) {
        showToast("error", `Lỗi khi thêm khách hàng: ${error.message}`);
      }
    };

    const fetchLocations = async () => {
      try {
        provinces.value = await fetchProvincesApi();
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách tỉnh/thành phố");
      }
    };

    const fetchDistricts = async (provinceName) => {
      try {
        const province = provinces.value.find((p) => p.name === provinceName);
        if (!province) {
          showToast("error", "Không tìm thấy tỉnh/thành phố");
          return;
        }
        districts.value = await fetchDistrictsApi(province.code);
        wards.value = [];
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách quận/huyện");
      }
    };

    const fetchWards = async (districtName) => {
      try {
        const district = districts.value.find((d) => d.name === districtName);
        if (!district) {
          showToast("error", "Không tìm thấy quận/huyện");
          return;
        }
        wards.value = await fetchWardsApi(district.code);
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách phường/xã");
      }
    };

    const openCustomerModal = () => {
      newCustomer.value = {
        name: "",
        phone: "",
        city: "",
        district: "",
        ward: "",
        address: "",
      };
      isCustomerModalOpen.value = true;
    };

    const handleProvinceChange = () => {
      fetchDistricts(newCustomer.value.city);
      newCustomer.value.district = "";
      newCustomer.value.ward = "";
      districts.value = [];
      wards.value = [];
    };

    const handleDistrictChange = () => {
      fetchWards(newCustomer.value.district);
      newCustomer.value.ward = "";
      wards.value = [];
    };

    const handleReceiverProvinceChange = () => {
      fetchDistricts(receiver.value.city);
      receiver.value.district = "";
      receiver.value.ward = "";
      districts.value = [];
      wards.value = [];
    };

    const handleReceiverDistrictChange = () => {
      fetchWards(receiver.value.district);
      receiver.value.ward = "";
      wards.value = [];
    };

    const toggleDelivery = () => {
      isHomeDelivery.value = false;
      if (isDelivery.value && selectedCustomer.value) {
        receiver.value = {
          ...customer.value,
          city: customer.value.city || "",
          district: customer.value.district || "",
          ward: customer.value.ward || "",
          address: customer.value.address || "",
        };
      } else {
        receiver.value = {
          name: "",
          phone: "",
          city: "",
          district: "",
          ward: "",
          address: "",
        };
      }
      updateShippingFee();
    };

    // Discount-Related Methods
    const fetchPGG = async () => {
      try {
        const data = await fetchPGGApi();
        publicDiscountCodes.value = data
          .filter(
            (item) =>
              item.riengTu === false &&
              item.trangThai === true &&
              isValidDiscount(item.ngayKetThuc) &&
              Number(item.soLuongDung) > 0
          )
          .map((item, index) => ({
            id: item.id || index + 1,
            code: item.ma || "Unknown",
            value: Number(item.soTienGiamToiDa) || 0,
            percent: Number(item.phanTramGiamGia) || 0,
            minOrder: Number(item.hoaDonToiThieu) || 0,
            expiry: formatDate(item.ngayKetThuc),
            rawExpiry: item.ngayKetThuc,
            type: "public",
            soLuongDung: Number(item.soLuongDung) || 0,
          }));
      } catch (error) {
        console.error("Lỗi khi tải PGG:", error); // Kiểm tra lỗi
        showToast("error", "Lỗi khi tải danh sách mã giảm giá");
      }
    };

    const selectDiscount = async (discountItem) => {
      if (!activeInvoiceId.value) {
        showToast(
          "error",
          "Vui lòng chọn hoặc tạo một hóa đơn trước khi áp dụng mã giảm giá"
        );
        return;
      }

      try {
        const result = await validateDiscountApi(
          discountItem.code,
          tongTien.value,
          customer.value?.id || null
        );
        if (
          result.success &&
          result.data &&
          Number(result.data.soLuongDung) > 0
        ) {
          selectedDiscount.value = {
            id: discountItem.id,
            code: discountItem.code,
            value: discountItem.value,
            percent: discountItem.percent || 0,
            minOrder: discountItem.minOrder || 0,
            expiry: discountItem.expiry,
            rawExpiry: discountItem.rawExpiry,
            type: discountItem.type,
            soLuongDung: Number(result.data.soLuongDung) || 0,
          };
          manualDiscountSelected.value = true;

          // Gọi API để cập nhật id_phieu_giam_gia vào hóa đơn
          const updateResult = await updatePhieuGiamGiaApi(
            activeInvoiceId.value,
            discountItem.id
          );
          if (updateResult.success) {
            showToast(
              "success",
              `Đã áp dụng mã giảm giá ${discountItem.code} (-${formatPrice(
                discountItem.value
              )}) và lưu vào hóa đơn`
            );
          } else {
            showToast(
              "error",
              updateResult.message || "Lỗi khi lưu mã giảm giá vào hóa đơn"
            );
            selectedDiscount.value = null;
            manualDiscountSelected.value = false;
          }
        } else {
          showToast(
            "error",
            result.message || "Mã giảm giá đã hết số lượng hoặc không hợp lệ"
          );
        }
      } catch (error) {
        showToast("error", `Lỗi khi áp dụng mã giảm giá: ${error.message}`);
      }
    };

    const removeDiscount = () => {
      selectedDiscount.value = null;
      manualDiscountSelected.value = false;
      showToast("info", "Đã hủy mã giảm giá");
    };

    const applyBestDiscount = async () => {
      if (!cartItems.value.length || tongTien.value <= 0) {
        selectedDiscount.value = null;
        manualDiscountSelected.value = false;
        // Xóa id_phieu_giam_gia khỏi hóa đơn nếu không có giỏ hàng
        if (activeInvoiceId.value) {
          try {
            const updateResult = await updatePhieuGiamGiaApi(
              activeInvoiceId.value,
              null
            );
            if (updateResult.success) {
              showToast(
                "info",
                "Đã xóa mã giảm giá khỏi hóa đơn do giỏ hàng trống"
              );
            } else {
              showToast(
                "error",
                updateResult.message || "Lỗi khi xóa mã giảm giá khỏi hóa đơn"
              );
            }
          } catch (error) {
            showToast("error", `Lỗi khi xóa mã giảm giá: ${error.message}`);
          }
        }
        return;
      }

      if (manualDiscountSelected.value) {
        const result = await validateDiscountApi(
          selectedDiscount.value.code,
          tongTien.value,
          customer.value?.id || null
        );
        if (
          !result.success ||
          !result.data ||
          Number(result.data.soLuongDung) <= 0
        ) {
          selectedDiscount.value = null;
          manualDiscountSelected.value = false;
          // Xóa id_phieu_giam_gia khỏi hóa đơn nếu mã không hợp lệ
          if (activeInvoiceId.value) {
            try {
              const updateResult = await updatePhieuGiamGiaApi(
                activeInvoiceId.value,
                null
              );
              if (updateResult.success) {
                showToast(
                  "info",
                  "Mã giảm giá đã chọn không còn hợp lệ và đã được xóa khỏi hóa đơn"
                );
              } else {
                showToast(
                  "error",
                  updateResult.message || "Lỗi khi xóa mã giảm giá khỏi hóa đơn"
                );
              }
            } catch (error) {
              showToast("error", `Lỗi khi xóa mã giảm giá: ${error.message}`);
            }
          }
          showToast(
            "info",
            "Mã giảm giá đã chọn không còn hợp lệ hoặc đã hết số lượng"
          );
        }
        return;
      }

      if (!activeInvoiceId.value) {
        showToast(
          "error",
          "Vui lòng chọn hoặc tạo một hóa đơn trước khi áp dụng mã giảm giá"
        );
        return;
      }

      try {
        await fetchPGG();

        if (customer.value?.id) {
          const pggResult = await getPhieuGiamGiaByKhachHangApi(
            customer.value.id
          );
          if (pggResult.success && Array.isArray(pggResult.data)) {
            privateDiscountCodes.value = pggResult.data
              .filter((item) => {
                const pgg = item.idPhieuGiamGia || {};
                const isPrivate = pgg.riengTu === true;
                const isValid = isValidDiscount(
                  pgg.ngayKetThuc || item.ngayHetHan
                );
                const hasQuantity =
                  Number(pgg.soLuongDung || item.soLuongDung) > 0;
                return isPrivate && isValid && hasQuantity;
              })
              .map((item, index) => ({
                id: item.id || index + 1,
                code: item.idPhieuGiamGia?.ma || item.ma || "Unknown",
                tenPhieuGiamGia:
                  item.idPhieuGiamGia?.tenPhieuGiamGia || "Unknown",
                value: item.idPhieuGiamGia?.soTienGiamToiDa || 0,
                percent: item.idPhieuGiamGia?.phanTramGiamGia || 0,
                expiry: formatDate(
                  item.idPhieuGiamGia?.ngayKetThuc || item.ngayHetHan
                ),
                rawExpiry: item.idPhieuGiamGia?.ngayKetThuc || item.ngayHetHan,
                minOrder: item.idPhieuGiamGia?.hoaDonToiThieu || 0,
                soLuongDung:
                  Number(
                    item.idPhieuGiamGia?.soLuongDung || item.soLuongDung
                  ) || 0,
                type: "private",
              }));
          }
        }

        const allDiscounts = [
          ...publicDiscountCodes.value.map((code) => ({
            ...code,
            type: "public",
          })),
          ...privateDiscountCodes.value,
        ];

        let bestDiscount = null;
        for (const code of allDiscounts) {
          const result = await validateDiscountApi(
            code.code,
            tongTien.value,
            customer.value?.id || null
          );
          if (
            result.success &&
            result.data &&
            Number(result.data.soLuongDung) > 0
          ) {
            const fixedDiscount = code.value || 0;
            const percentDiscount = code.percent
              ? Math.min(
                (code.percent / 100) * tongTien.value,
                code.value || Infinity
              )
              : 0;
            const actualDiscount = Math.max(fixedDiscount, percentDiscount);

            if (
              (code.type === "public" && tongTien.value >= code.minOrder) ||
              code.type === "private"
            ) {
              if (!bestDiscount || actualDiscount > bestDiscount.value) {
                bestDiscount = { ...code, value: actualDiscount };
              }
            }
          }
        }

        if (bestDiscount) {
          selectedDiscount.value = { ...bestDiscount };
          const discountText = bestDiscount.percent
            ? `${bestDiscount.percent}% (${formatPrice(bestDiscount.value)})`
            : formatPrice(bestDiscount.value);

          // Gọi API để lưu id_phieu_giam_gia vào hóa đơn
          const updateResult = await updatePhieuGiamGiaApi(
            activeInvoiceId.value,
            bestDiscount.id
          );
          if (updateResult.success) {
            showToast(
              "success",
              `Đã áp dụng mã giảm giá ${bestDiscount.tenPhieuGiamGia || bestDiscount.code
              } (-${discountText}) và lưu vào hóa đơn`
            );
          } else {
            selectedDiscount.value = null;
            showToast(
              "error",
              updateResult.message || "Lỗi khi lưu mã giảm giá vào hóa đơn"
            );
          }
        } else {
          selectedDiscount.value = null;
          // Xóa id_phieu_giam_gia khỏi hóa đơn nếu không có mã hợp lệ
          try {
            const updateResult = await updatePhieuGiamGiaApi(
              activeInvoiceId.value,
              null
            );
            if (updateResult.success) {
              showToast(
                "info",
                "Không có mã giảm giá nào khả dụng, đã xóa mã giảm giá khỏi hóa đơn"
              );
            } else {
              showToast(
                "error",
                updateResult.message || "Lỗi khi xóa mã giảm giá khỏi hóa đơn"
              );
            }
          } catch (error) {
            showToast("error", `Lỗi khi xóa mã giảm giá: ${error.message}`);
          }
          showToast("info", "Không có mã giảm giá nào khả dụng");
        }
      } catch (error) {
        selectedDiscount.value = null;
        manualDiscountSelected.value = false;
        // Xóa id_phieu_giam_gia khỏi hóa đơn nếu có lỗi
        if (activeInvoiceId.value) {
          try {
            const updateResult = await updatePhieuGiamGiaApi(
              activeInvoiceId.value,
              null
            );
            if (updateResult.success) {
              showToast("info", "Đã xóa mã giảm giá khỏi hóa đơn do lỗi");
            } else {
              showToast(
                "error",
                updateResult.message || "Lỗi khi xóa mã giảm giá khỏi hóa đơn"
              );
            }
          } catch (error) {
            showToast("error", `Lỗi khi xóa mã giảm giá: ${error.message}`);
          }
        }
        showToast(
          "error",
          `Lỗi khi tìm mã giảm giá tốt nhất: ${error.message}`
        );
      }
    };

    const scanQR = () => {
      if (!activeInvoiceId.value) {
        showToast(
          "error",
          "Vui lòng chọn hoặc tạo một hóa đơn trước khi quét!"
        );
        return;
      }
      showScanModal.value = true;
      scanError.value = "";
      nextTick(() => {
        if (!isCameraActive.value) {
          startZXingScan();
        }
      });
    };

    // // Hàm quét mã và thêm sản phẩm vào giỏ hàng
    const startZXingScan = async () => {
      codeReader.value = new BrowserMultiFormatReader();

      // Hints cho CODE128 (giữ nguyên)
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.QR_CODE,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      codeReader.value.hints = hints;

      isScanning.value = true;
      scanError.value = "";
      scannedCode.value = "";

      try {
        // Liệt kê tất cả camera devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          throw new Error('Không tìm thấy camera trên thiết bị.');
        }

        // Ưu tiên chọn camera rear (thường có label chứa 'back' hoặc 'rear')
        const rearCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        ) || videoDevices[0]; // Fallback về camera đầu tiên nếu không tìm thấy rear

        selectedDeviceId.value = rearCamera.deviceId;
        console.log('Camera được chọn:', rearCamera.label);

        // Decode với deviceId cụ thể và ID của video element
        await codeReader.value.decodeFromVideoDevice(
          selectedDeviceId.value,  // Device ID (null để dùng default, nhưng dùng cụ thể để chọn rear)
          'videoScan',  // ID string của <video>
          (result, err) => {
            if (result) {
              scannedCode.value = result.text;
              isScanning.value = false;
              addScannedProductToCart(scannedCode.value);
              setTimeout(() => closeScanModal(), 1000);
            } else if (err && !(err instanceof NotFoundException)) {
              scanError.value = `Lỗi quét: ${err.message}. Hãy thử lại hoặc kiểm tra quyền camera.`;
              console.error("ZXing Error:", err);
            }
          }
        );
        isCameraActive.value = true;
      } catch (error) {
        scanError.value = `Lỗi khởi động camera: ${error.message}. Vui lòng cấp quyền camera và thử lại.`;
        console.error("ZXing Init Error:", error);
        // Nếu permission denied, prompt user
        if (error.name === 'NotAllowedError') {
          showToast('error', 'Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.');
        }
      }
    };


    const addScannedProductToCart = async () => {
      if (!scannedCode.value || !activeInvoiceId.value) {
        showToast("error", "Vui lòng chọn hóa đơn và quét mã hợp lệ");
        return;
      }

      try {
        const response = await addProductByBarcodeOrImeiApi(activeInvoiceId.value, scannedCode.value);

        // Ánh xạ dữ liệu từ response sang cấu trúc phù hợp với cartHeaders
        const product = response;
        cartItems.value.push({
          id: product.chiTietSanPhamId,
          name: product.tenSanPham,
          color: product.mauSac,
          ram: product.ram,
          storage: product.boNhoTrong,
          quantity: product.stock || 1,
          currentPrice: product.giaBan,
          imei: product.maImel,
          imageUrl: product.image || 'default-image.png', // Ánh xạ image, dùng giá trị mặc định nếu null
          originalPrice: product.tongTien || product.giaBan * 1, // Ánh xạ tổng tiền
          actions: "Xóa"
        });

        // Cập nhật tổng tiền
        tongTien.value = cartItems.value.reduce(
          (sum, item) => sum + Number(item.currentPrice) * item.quantity,
          0
        );

        showToast("success", `Đã thêm sản phẩm ${product.tenSanPham} vào giỏ hàng`);
        closeScanModal();
      } catch (error) {
        showToast("error", error.message || "Lỗi khi thêm sản phẩm vào giỏ hàng");
      }
    };

    // Hàm mở modal quét
    const openScanModal = async () => {
      if (!activeInvoiceId.value) {
        showToast("error", "Vui lòng chọn hoặc tạo hóa đơn chờ trước khi quét mã");
        return;
      }
      showScanModal.value = true;
      await nextTick(); // Đợi DOM render
      if (!videoElement.value) {
        scanError.value = "Không tìm thấy phần tử video.";
        showToast("error", "Không tìm thấy phần tử video trong modal.");
        showScanModal.value = false;
        return;
      }
      startZXingScan();
    };

    const closeScanModal = () => {
      showScanModal.value = false;
      cleanupZXing();
    };

    // Cập nhật cleanupZXing để reset device
    const cleanupZXing = () => {
      if (codeReader.value) {
        codeReader.value.reset();
        codeReader.value = null;
      }
      selectedDeviceId.value = null;
      isCameraActive.value = false;
      isScanning.value = false;
      scannedCode.value = "";
      scanError.value = "";
    };

    const handleScan = async (code) => {
      if (!code || isScanning.value) {
        return;
      }

      isScanning.value = true;
      scanError.value = "";
      try {
        const product = await getProductDetailsByIdApi(code);

        if (!product || !product.chiTietSanPhamId) {
          throw new Error(
            "Dữ liệu từ API không hợp lệ hoặc thiếu chiTietSanPhamId"
          );
        }

        const chiTietSanPhamId = await getProductDetailsByIdApi(
          product.chiTietSanPhamId,
          product.mauSac || "",
          product.ram || "",
          product.boNhoTrong || ""
        );

        if (product.giaBanBanDau !== product.giaBan) {
          const ghiChuGia = `Giá sản phẩm ${product.tenSanPham
            } đã thay đổi thành ${formatPrice(
              product.giaBan
            )} từ giá ban đầu ${formatPrice(product.giaBanBanDau)}`;
          showToast("warning", ghiChuGia);
        }

        const chiTietGioHangDTO = {
          chiTietSanPhamId: chiTietSanPhamId,
          soLuong: 1,
          maImel: product.maImel,
          idPhieuGiamGia: selectedDiscount.value?.id || null,
        };

        const postResponseData = await addProductToCartApi(
          activeInvoiceId.value,
          chiTietGioHangDTO
        );

        cartItems.value = postResponseData.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
        }));

        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;

        await updateIMEIStatusApi(product.maImel, true);

        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });

        showToast(
          "success",
          `Đã thêm sản phẩm ${product.tenSanPham} (IMEI: ${product.maImel}) vào giỏ hàng và đánh dấu IMEI là đã sử dụng`
        );
        await applyBestDiscount();
      } catch (error) {
        scanError.value =
          error.response?.status === 404
            ? "Không tìm thấy sản phẩm hoặc IMEI tương ứng với mã quét"
            : error.message || "Lỗi khi quét barcode/IMEI";
        showToast("error", scanError.value);
      } finally {
        isScanning.value = false;
        closeScanModal();
      }
    };

    const showQRCode = computed(() => {
      if (
        (paymentMethod.value === "transfer" ||
          paymentMethod.value === "both") &&
        selectedPaymentProvider.value &&
        qrCodeValue.value
      ) {
        return true;
      }
      return false;
    });

    // Payment-Related Methods
    const selectPayment = (method) => {
      paymentMethod.value = method;
      tienChuyenKhoan.value = method === "transfer" ? totalPayment.value : 0;
      tienMat.value = method === "cash" ? totalPayment.value : 0;

      if (method === "transfer" || method === "both") {
        showPaymentProviderModal.value = true;
      } else {
        showPaymentProviderModal.value = false;
        selectedPaymentProvider.value = null;
        qrCodeValue.value = "";
        showQRCode.value = false;
      }
    };

    const selectPaymentProvider = (provider) => {
      selectedPaymentProvider.value = provider;
      showPaymentProviderModal.value = false;

      const amount =
        paymentMethod.value === "transfer"
          ? totalPayment.value || 0
          : tienChuyenKhoan.value || 0;
      qrCodeAmount.value = amount;
    };

    const closePaymentProviderModal = () => {
      showPaymentProviderModal.value = false;
      selectedPaymentProvider.value = null;
      qrCodeValue.value = "";
      showQRCode.value = false;
    };

    const ThanhToan = async () => {
      if (cartItems.value.length === 0) {
        showToast("error", "Giỏ hàng trống");
        return;
      }

      const totalPaymentValue = totalPayment.value || 0;
      if (paymentMethod.value === "both") {
        const totalInput = (tienChuyenKhoan.value || 0) + (tienMat.value || 0);
        if (totalInput !== totalPaymentValue) {
          showToast(
            "error",
            `Số tiền thanh toán (${formatPrice(
              totalInput
            )}) không khớp với tổng thanh toán (${formatPrice(
              totalPaymentValue
            )})`
          );
          return;
        }
        if (tienChuyenKhoan.value < 0 || tienMat.value < 0) {
          showToast("error", "Số tiền thanh toán không được âm");
          return;
        }
      } else if (
        paymentMethod.value === "transfer" &&
        selectedPaymentProvider.value !== "vnpay" &&
        !qrCodeValue.value
      ) {
        showToast("error", "Không thể tạo mã QR. Vui lòng thử lại.");
        return;
      }

      try {
        const priceChangeMessages = [];
        const priceCheckErrors = [];
        for (const item of cartItems.value) {
          try {
            const productData = (await fetchProductsApi(0, 1, item.name))
              .content[0];
            if (productData && productData.giaBanBanDau !== item.currentPrice) {
              priceChangeMessages.push(
                `Giá sản phẩm ${item.name} đã thay đổi thành ${formatPrice(
                  productData.giaBan
                )} từ giá ban đầu ${formatPrice(productData.giaBanBanDau)}`
              );
            }
          } catch (error) {
            priceCheckErrors.push(
              `Lỗi khi kiểm tra giá sản phẩm ${item.name}: ${error.message}`
            );
          }
        }

        if (priceChangeMessages.length > 0) {
          showToast("warning", priceChangeMessages.join("; "));
        }
        if (priceCheckErrors.length > 0) {
          showToast("error", priceCheckErrors.join("; "));
          return;
        }

        await fetchPGG();
        if (customer.value?.id) {
          const pggResult = await getPhieuGiamGiaByKhachHangApi(
            customer.value.id
          );
          if (pggResult.success && Array.isArray(pggResult.data)) {
            privateDiscountCodes.value = pggResult.data
              .filter(
                (item) =>
                  item.idPhieuGiamGia?.riengTu === true &&
                  item.idPhieuGiamGia?.trangThai === true &&
                  isValidDiscount(item.idPhieuGiamGia?.ngayKetThuc) &&
                  Number(item.idPhieuGiamGia?.soLuongDung || item.soLuongDung) >
                  0 // Thêm điều kiện soLuongDung > 0
              )
              .map((item, index) => ({
                id: item.id || index + 1,
                code: item.ma || "Unknown",
                value: item.idPhieuGiamGia?.soTienGiamToiDa || 0,
                percent: item.idPhieuGiamGia?.phanTramGiamGia || 0,
                expiry: formatDate(item.idPhieuGiamGia?.ngayKetThuc),
                rawExpiry: item.idPhieuGiamGia?.ngayKetThuc,
                minOrder: item.idPhieuGiamGia?.hoaDonToiThieu || 0,
                type: "private",
                soLuongDung:
                  Number(
                    item.idPhieuGiamGia?.soLuongDung || item.soLuongDung
                  ) || 0, // Lưu soLuongDung
              }));
          }
        }

        if (selectedDiscount.value) {
          const result = await validateDiscountApi(
            selectedDiscount.value.code,
            tongTien.value,
            customer.value?.id || null
          );
          if (
            !result.success ||
            !result.data ||
            !isValidDiscount(result.data.ngayKetThuc) ||
            result.data.trangThai === false ||
            Number(result.data.soLuongDung) <= 0 // Thêm điều kiện soLuongDung > 0
          ) {
            showToast(
              "error",
              `Mã giảm giá ${selectedDiscount.value.code} đã hết hiệu lực, không còn hoạt động hoặc đã hết số lượng. Vui lòng chọn mã khác hoặc tiếp tục thanh toán mà không sử dụng mã giảm giá.`
            );
            selectedDiscount.value = null;
            manualDiscountSelected.value = false;
            return;
          } else {
            const updatedDiscount = result.data;
            selectedDiscount.value = {
              ...selectedDiscount.value,
              minOrder:
                updatedDiscount.hoaDonToiThieu ||
                selectedDiscount.value.minOrder,
              value:
                updatedDiscount.soTienGiamToiDa || selectedDiscount.value.value,
              percent:
                updatedDiscount.phanTramGiamGia ||
                selectedDiscount.value.percent,
              rawExpiry:
                updatedDiscount.ngayKetThuc || selectedDiscount.value.rawExpiry,
              expiry: formatDate(updatedDiscount.ngayKetThuc),
              soLuongDung: Number(updatedDiscount.soLuongDung) || 0, // Lưu soLuongDung
            };

            if (
              selectedDiscount.value.type === "public" &&
              tongTien.value < selectedDiscount.value.minOrder
            ) {
              showToast(
                "error",
                `Tổng tiền đơn hàng (${formatPrice(
                  tongTien.value
                )}) nhỏ hơn giá trị đơn tối thiểu yêu cầu (${formatPrice(
                  selectedDiscount.value.minOrder
                )}) của mã giảm giá ${selectedDiscount.value.code
                }. Vui lòng chọn mã khác hoặc tiếp tục thanh toán mà không sử dụng mã giảm giá.`
              );
              selectedDiscount.value = null;
              manualDiscountSelected.value = false;
              return;
            }
          }
        }

        const allDiscounts = [
          ...publicDiscountCodes.value.map((code) => ({
            ...code,
            type: "public",
          })),
          ...privateDiscountCodes.value,
        ];

        let bestDiscount = null;
        let currentDiscountValue = selectedDiscount.value ? discount.value : 0;

        for (const code of allDiscounts) {
          const result = await validateDiscountApi(
            code.code,
            tongTien.value,
            customer.value?.id || null
          );
          if (
            result.success &&
            result.data &&
            result.data.trangThai === true &&
            isValidDiscount(result.data.ngayKetThuc) &&
            Number(result.data.soLuongDung) > 0 // Thêm điều kiện soLuongDung > 0
          ) {
            const fixedDiscount = code.value || 0;
            const percentDiscount = code.percent
              ? Math.min(
                (code.percent / 100) * tongTien.value,
                code.value || Infinity
              )
              : 0;
            const actualDiscountValue = Math.max(
              fixedDiscount,
              percentDiscount
            );

            if (
              (code.type === "public" && tongTien.value >= code.minOrder) ||
              code.type === "private"
            ) {
              if (!bestDiscount || actualDiscountValue > bestDiscount.value) {
                bestDiscount = { ...code, value: actualDiscountValue };
              }
            }
          }
        }

        if (
          bestDiscount &&
          (!selectedDiscount.value ||
            (bestDiscount.value > currentDiscountValue &&
              bestDiscount.id !== selectedDiscount.value?.id))
        ) {
          const savingsDifference = bestDiscount.value - currentDiscountValue;
          showConfirm(
            `Có mã giảm giá tốt hơn: ${bestDiscount.code} giảm ${formatPrice(
              bestDiscount.value
            )} (tiết kiệm thêm ${formatPrice(
              savingsDifference
            )} so với mã hiện tại giảm ${formatPrice(
              currentDiscountValue
            )}). Bạn có muốn áp dụng mã này không?`,
            async () => {
              await selectDiscount(bestDiscount);
              await createOrder();
            },
            async () => {
              await createOrder();
            }
          );
          return;
        }

        if (selectedPaymentProvider.value === "vnpay") {
          try {
            const orderInfo = `Thanh toán hóa đơn ${activeInvoiceId.value || "HDXXX"
              }`;
            const amountToSend = totalPayment.value || 100000;

            const hoaDonRequest = {
              idKhachHang: customer.value?.id || null,
              tenKhachHang: customer.value?.name || "Khách vãng lai",
              soDienThoaiKhachHang: customer.value?.phone || null,
              diaChiKhachHang:
                customer.value && isDelivery.value
                  ? {
                    thanhPho: customer.value.city,
                    quan: customer.value.district,
                    phuong: customer.value.ward,
                    diaChiCuThe: customer.value.address,
                  }
                  : { thanhPho: "", quan: "", phuong: "", diaChiCuThe: "" },
              hinhThucThanhToan: [
                {
                  phuongThucThanhToanId: 2,
                  tienMat: 0,
                  tienChuyenKhoan: totalPayment.value,
                },
              ],
              idPhieuGiamGia: selectedDiscount.value?.id || null,
              giamGia: selectedDiscount.value?.value || 0,
              phiVanChuyen: isDelivery.value ? shippingFee.value : 0,
              loaiDon: isDelivery.value ? "online" : "trực tiếp",
              tongTien: tongTien.value,
              tongTienSauGiam: totalPayment.value,
              chiTietGioHang: cartItems.value.map((item) => ({
                chiTietSanPhamId: item.id,
                soLuong: item.quantity,
                maImel: item.imei,
                giaBan: item.currentPrice,
                ghiChuGia: item.ghiChuGia || "",
              })),
            };

            localStorage.setItem(
              "pendingHoaDon",
              JSON.stringify({
                idHD: activeInvoiceId.value,
                hoaDonRequest,
              })
            );

            const returnUrl = "http://localhost:5173/banHang";
            const vnpayUrl = await createPaymentApi(
              amountToSend,
              orderInfo,
              returnUrl
            );
            window.location.href = vnpayUrl;
          } catch (error) {
            showToast(
              "error",
              `Lỗi khi tạo thanh toán VNPay: ${error.message}`
            );
          }
        } else {
          await createOrder();
        }
      } catch (error) {
        showToast("error", `Lỗi khi thanh toán: ${error.message}`);
      }
    };

    const createOrder = async (
      idHD = activeInvoiceId.value,
      hoaDonRequest = null
    ) => {
      isCreatingOrder.value = true;
      try {
        const requestBody = hoaDonRequest || {
          idKhachHang: customer.value?.id || null,
          tenKhachHang: customer.value?.name || "Khách vãng lai",
          soDienThoaiKhachHang: customer.value?.phone || null,
          diaChiKhachHang:
            customer.value && isDelivery.value
              ? {
                thanhPho: customer.value.city,
                quan: customer.value.district,
                phuong: customer.value.ward,
                diaChiCuThe: customer.value.address,
              }
              : {
                thanhPho: "",
                quan: "",
                phuong: "",
                diaChiCuThe: "",
              },
          hinhThucThanhToan: (() => {
            const hinhThucThanhToan = [];
            if (paymentMethod.value === "cash") {
              hinhThucThanhToan.push({
                phuongThucThanhToanId: 1,
                tienMat: totalPayment.value,
                tienChuyenKhoan: 0,
              });
            } else if (paymentMethod.value === "transfer" || (selectedPaymentProvider.value === 'vnpay' && !selectedDiscount.value)) {
              hinhThucThanhToan.push({
                phuongThucThanhToanId: 2,
                tienMat: 0,
                tienChuyenKhoan: totalPayment.value,
              });
            } else if (paymentMethod.value === "both") {
              hinhThucThanhToan.push({
                phuongThucThanhToanId: 3,
                tienMat: tienMat.value,
                tienChuyenKhoan: tienChuyenKhoan.value,
              });
            }
            return hinhThucThanhToan;
          })(),
          idPhieuGiamGia: selectedDiscount.value?.id || null,
          giamGia: selectedDiscount.value?.value || 0,
          phiVanChuyen: isDelivery.value ? shippingFee.value : 0,
          loaiDon: isDelivery.value ? "online" : "trực tiếp",
          tongTien: tongTien.value,
          tongTienSauGiam: totalPayment.value,
          chiTietGioHang: cartItems.value.map((item) => ({
            chiTietSanPhamId: item.id,
            soLuong: item.quantity,
            maImel: item.imei,
            giaBan: item.currentPrice,
            ghiChuGia: item.ghiChuGia || "",
          })),
        };

        const response = await completeOrderApi(idHD, requestBody);
        const invoiceId = response.id || idHD;

        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== idHD
        );
        cartItems.value = [];
        activeInvoiceId.value = null;
        selectedCustomer.value = null;
        customer.value = {
          id: null,
          name: "",
          phone: "",
          city: "",
          district: "",
          ward: "",
          address: "",
        };
        receiver.value = {
          name: "",
          phone: "",
          city: "",
          district: "",
          ward: "",
          address: "",
        };
        discount.value = 0;
        selectedDiscount.value = null;

        showToast(
          "success",
          "Thanh toán thành công, chuẩn bị hiện hóa đơn chi tiết sau vài giây"
        );
        resetNotification();

        setTimeout(() => {
          router.push(`/hoaDon/${invoiceId}/detail`);
        }, 1000);
      } catch (error) {
        const errorMessage = error.message;
        showToast("error", `Lỗi khi thanh toán: ${errorMessage}`);
      } finally {
        isCreatingOrder.value = false;
      }
    };

    const updateShippingFee = async () => {
      if (!isDelivery.value || !isHomeDelivery.value) {
        shippingFee.value = 0;
        return;
      }
      if (tongTien.value >= FREE_SHIP_THRESHOLD) {
        shippingFee.value = 0;
        showToast(
          "success",
          "Miễn phí vận chuyển cho đơn hàng từ 50,000,000 VNĐ trở lên"
        );
        return;
      }
      try {
        showToast(
          "success",
          `Đã cập nhật phí vận chuyển: ${formatPrice(shippingFee.value)}`
        );
      } catch (error) {
        shippingFee.value = 0;
        showToast("error", "Lỗi khi tính phí vận chuyển");
      }
    };

    const handleCustomerProvinceChange = () => {
      customer.value.district = "";
      customer.value.ward = "";
      customer.value.address = "";
      districts.value = [];
      wards.value = [];

      if (customer.value.city) {
        fetchDistricts(customer.value.city);
      }
    };

    const handleCustomerDistrictChange = () => {
      customer.value.ward = "";
      customer.value.address = "";
      wards.value = [];

      if (customer.value.district) {
        fetchWards(customer.value.district);
      }
    };

    onMounted(async () => {
      try {
        await fetchPGG();
        fetchPendingInvoices();
        fetchProducts();
        fetchLocations();
        await applyBestDiscount();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("vnp_TransactionStatus")) {
          try {
            const response = await checkVNPayPaymentStatusApi(urlParams);

            if (response === "success") {
              const pendingHoaDon = JSON.parse(
                localStorage.getItem("pendingHoaDon")
              );
              if (
                pendingHoaDon &&
                pendingHoaDon.idHD &&
                pendingHoaDon.hoaDonRequest
              ) {
                await createOrder(
                  pendingHoaDon.idHD,
                  pendingHoaDon.hoaDonRequest
                );
                localStorage.removeItem("pendingHoaDon");
                router.replace({ query: {} });
              } else {
                showToast(
                  "error",
                  "Không tìm thấy thông tin hóa đơn để hoàn tất thanh toán"
                );
              }
            } else {
              showToast(
                "error",
                response || "Thanh toán VNPay không thành công"
              );
            }
          } catch (error) {
            showToast(
              "error",
              `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`
            );
          }
        }
      } catch (error) {
        showToast("error", "Lỗi khi khởi tạo dữ liệu hoặc xử lý thanh toán");
      }
    });

    onUnmounted(() => {
      // Cleanup camera nếu đang hoạt động
      if (isCameraActive.value) {
        cleanupZXing();
      }
    });

    return {
      handleCustomerProvinceChange,
      handleCustomerDistrictChange,
      selectDiscount,
      removeDiscount,
      suggestedDiscounts,
      alternativeDiscounts,
      shippingFee,
      selectedShippingUnit,
      shippingUnits,
      updateShippingFee,
      router,
      isCreatingInvoice,
      isCreatingOrder,
      activeInvoiceId,
      invoiceSearchQuery,
      pendingInvoices,
      filteredPendingInvoices,
      cartItems,
      showIMEIModal,
      showCartIMEIModal,
      isCustomerModalOpen,
      isLoadingMore,
      productSearchQuery,
      filterColor,
      filterRam,
      filterStorage,
      selectedProduct,
      selectedIMEIs,
      searchCustomer,
      selectedCustomer,
      customer,
      receiver,
      isReceiverEditable,
      isDelivery,
      selectedDiscount,
      discount,
      privateDiscountCodes,
      publicDiscountCodes,
      paymentMethod,
      tienChuyenKhoan,
      tienMat,
      newCustomer,
      products,
      filteredProducts,
      uniqueColors,
      uniqueRams,
      uniqueStorages,
      availableIMEIs,
      provinces,
      districts,
      wards,
      tongTien,
      totalPayment,
      priceChangeInfo,
      cartHeaders,
      productHeaders,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
      qrCodeValue,
      qrCodeAmount,
      showQRCode,
      showToast,
      showConfirm,
      resetNotification,
      formatPrice,
      formatDate,
      isValidDiscount,
      debouncedInvoiceSearch,
      debouncedProductSearch,
      debouncedCustomerSearch,
      fetchPendingInvoices,
      createNewPendingInvoice,
      loadPendingInvoice,
      confirmCancelInvoice,
      cancelInvoice,
      fetchProducts,
      handleScroll,
      removeItem,
      showIMEIList,
      showIMEIModalForItem,
      closeIMEIModal,
      closeCartIMEIModal,
      handleIMEISelection,
      removeIMEI,
      addProductWithIMEIs,
      deleteIMEI,
      searchCustomers,
      addNewCustomer,
      fetchLocations,
      fetchDistricts,
      fetchWards,
      openCustomerModal,
      handleProvinceChange,
      handleDistrictChange,
      handleReceiverProvinceChange,
      handleReceiverDistrictChange,
      toggleDelivery,
      fetchPGG,
      applyBestDiscount,
      scanQR,
      ThanhToan,
      createOrder,
      cartSearchQuery,
      cartFilterColor,
      cartFilterRam,
      cartFilterStorage,
      uniqueCartColors,
      uniqueCartRams,
      uniqueCartStorages,
      filteredCartItems,
      debouncedCartSearch,
      showProductDetails,
      selectedCartItem,
      modalPosition,
      showProductDetailsModal,
      hideProductDetailsModal,
      isHomeDelivery,
      showScanModal,
      scannedCode,
      isScanning,
      scanError,
      startZXingScan,
      closeScanModal,
      cleanupZXing,
      isCameraActive,
      selectPayment,
      showPaymentProviderModal,
      selectedPaymentProvider,
      selectPaymentProvider,
      closePaymentProviderModal,
      showAddressModal,
      customerAddresses,
      openAddressModal,
      selectAddress,
      applySelectedAddress,
      closeAddressModal,
      openScanModal,
      addScannedProductToCart,
      videoElement,
    };
  },
};