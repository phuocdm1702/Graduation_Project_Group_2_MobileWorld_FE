import { ref, computed } from "vue";
import apiService from "../../services/api";// Axios instance
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import QrcodeVue from "qrcode.vue";

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

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
    // State
    const isCreatingInvoice = ref(false);
    const isCreatingOrder = ref(false);
    const activeInvoiceId = ref(null);
    const invoiceSearchQuery = ref("");
    const pendingInvoices = ref([]);
    const cartItems = ref([]);
    const showIMEIModal = ref(false);
    const showCartIMEIModal = ref(false);
    const showDiscountModal = ref(false);
    const selectedCartItem = ref(null);
    const isCustomerModalOpen = ref(false);
    const isLoadingMore = ref(false);
    const productSearchQuery = ref("");
    const filterColor = ref("");
    const filterRam = ref("");
    const filterStorage = ref("");
    const selectedProduct = ref(null);
    const selectedIMEIs = ref([]);
    const searchCustomer = ref("");
    const selectedCustomer = ref(null);
    const customer = ref({ id: null, name: "", phone: "" });
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
    const selectedPrivateDiscount = ref(null);
    const selectedPublicDiscount = ref(null);
    const discount = ref(0);
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
    const notificationType = ref("confirm");
    const notificationMessage = ref("");
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});
    const notificationModal = ref(null);
    const toastNotification = ref(null);
    const activeTab = ref("private");
    const qrCodeValue = ref("");
    const qrCodeAmount = ref(0);

    // Sample data (will be replaced by API calls)
    const products = ref([]);
    const availableIMEIs = ref([]);
    const privateDiscountCodes = ref([]);
    const publicDiscountCodes = ref([]);
    const provinces = ref([]);
    const districts = ref([]);
    const wards = ref([]);

    // DataTable headers
    const cartHeaders = ref([
      { text: "STT", value: "stt" },
      { text: "Tên sản phẩm", value: "name" },
      { text: "Màu sắc", value: "color" },
      { text: "RAM", value: "ram" },
      { text: "Bộ nhớ", value: "storage" },
      { text: "IMEI", value: "imei" },
      { text: "Đơn giá", value: "price" },
      { text: "Số lượng", value: "quantity" },
      { text: "Thành tiền", value: "total" },
      { text: "Hành động", value: "actions" },
    ]);

    const productHeaders = ref([
      { text: "STT", value: "stt" },
      { text: "Mã sản phẩm", value: "code" },
      { text: "Tên sản phẩm", value: "name" },
      { text: "Màu", value: "color" },
      { text: "RAM", value: "ram" },
      { text: "Bộ nhớ", value: "storage" },
      { text: "Giá", value: "price" },
      { text: "Hành động", value: "actions" },
    ]);

    // Computed
    const uniqueColors = computed(() => [
      ...new Set(products.value.map((p) => p.mauSac)),
    ]);
    const uniqueRams = computed(() => [
      ...new Set(products.value.map((p) => p.ram)),
    ]);
    const uniqueStorages = computed(() => [
      ...new Set(products.value.map((p) => p.boNhoTrong)),
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
        filtered = filtered.filter((p) => p.ram === filterRam.value);
      }
      if (filterStorage.value) {
        filtered = filtered.filter((p) => p.boNhoTrong === filterStorage.value);
      }
      return filtered;
    });

    const totalPrice = computed(() => {
      return cartItems.value.reduce(
        (sum, item) => sum + Number(item.giaBan) * item.soLuong,
        0
      );
    });

    const suggestAdditionalPurchase = computed(() => {
      if (!publicDiscountCodes.value.length) {
        return {
          message: "Không có mã giảm giá công khai nào khả dụng.",
          additionalAmount: 0,
          bestDiscount: null,
        };
      }

      const bestDiscount = publicDiscountCodes.value.reduce((best, code) => {
        if (totalPrice.value >= code.minOrder) {
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

      if (totalPrice.value >= bestDiscount.minOrder) {
        return {
          message: `Bạn có thể áp dụng mã ${
            bestDiscount.code
          } để được giảm ${formatPrice(bestDiscount.value)}.`,
          additionalAmount: 0,
          bestDiscount,
        };
      }

      const additionalAmount = bestDiscount.minOrder - totalPrice.value;
      return {
        message: `Mua thêm ${formatPrice(additionalAmount)} để sử dụng mã ${
          bestDiscount.code
        } và được giảm ${formatPrice(bestDiscount.value)}.`,
        additionalAmount,
        bestDiscount,
      };
    });

    const showQRCode = computed(() => {
      if (paymentMethod.value === "transfer") {
        qrCodeAmount.value = totalPrice.value - discount.value;
        generateQRCode(qrCodeAmount.value);
        return true;
      } else if (paymentMethod.value === "both" && tienChuyenKhoan.value > 0) {
        qrCodeAmount.value = tienChuyenKhoan.value;
        generateQRCode(tienChuyenKhoan.value);
        return true;
      }
      return false;
    });

    // Methods
    const showToast = (type, message, isLoading = false, duration = 3000) => {
      toastNotification.value.addToast({ type, message, isLoading, duration });
    };

    const showConfirm = (message, onConfirm, onCancel = () => {}) => {
      notificationType.value = "confirm";
      notificationMessage.value = message;
      notificationOnConfirm.value = onConfirm;
      notificationOnCancel.value = onCancel;
      isNotificationLoading.value = false;
      notificationModal.value.show();
    };

    const resetNotification = () => {
      notificationType.value = "confirm";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    // API Calls
    const fetchPendingInvoices = async () => {
      try {
        const response = await apiService.get("/api/hoa-don-cho");
        pendingInvoices.value = response.data.map((hd) => ({
          id: hd.id,
          ma: hd.ma,
          status: hd.trangThai === 0 ? "Chờ xử lý" : "Khác",
          items: [], // Will be fetched when loading invoice
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải hóa đơn chờ");
      }
    };

    const fetchProducts = async () => {
      try {
        // Giả định có endpoint /api/san-pham
        const response = await apiService.get("/api/san-pham");
        products.value = response.data.map((sp) => ({
          id: sp.id,
          maSanPham: sp.maSanPham,
          tenSanPham: sp.tenSanPham,
          mauSac: sp.mauSac,
          ram: sp.ram,
          boNhoTrong: sp.boNhoTrong,
          giaBan: sp.giaBan,
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách sản phẩm");
      }
    };

    const fetchDiscountCodes = async () => {
      try {
        // Giả định có endpoint /api/phieu-giam-gia
        const response = await apiService.get("/api/phieu-giam-gia");
        privateDiscountCodes.value = response.data
          .filter((pgg) => pgg.type === "private")
          .map((pgg) => ({
            id: pgg.id,
            code: pgg.ma,
            value: pgg.giaTri,
          }));
        publicDiscountCodes.value = response.data
          .filter((pgg) => pgg.type === "public")
          .map((pgg) => ({
            id: pgg.id,
            code: pgg.ma,
            value: pgg.giaTri,
            percent: pgg.phanTram,
            minOrder: pgg.donToiThieu,
            expiry: pgg.ngayHetHan,
          }));
      } catch (error) {
        showToast("error", "Lỗi khi tải mã giảm giá");
      }
    };

    const fetchLocations = async () => {
      try {
        // Giả định có endpoint /api/dia-chi
        const response = await apiService.get("/api/dia-chi/tinh");
        provinces.value = response.data.map((t) => ({
          code: t.ma,
          name: t.ten,
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách tỉnh/thành");
      }
    };

    const fetchDistricts = async (provinceName) => {
      try {
        const response = await apiService.get(
          `/api/dia-chi/quan?province=${provinceName}`
        );
        districts.value = response.data.map((q) => ({
          code: q.ma,
          name: q.ten,
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách quận/huyện");
      }
    };

    const fetchWards = async (districtName) => {
      try {
        const response = await apiService.get(
          `/api/dia-chi/phuong?district=${districtName}`
        );
        wards.value = response.data.map((p) => ({
          code: p.ma,
          name: p.ten,
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách phường/xã");
      }
    };

    // Debounced search functions
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

    const createNewPendingInvoice = async () => {
      if (pendingInvoices.value.length >= 5) {
        showToast("error", "Đã đạt giới hạn 5 hóa đơn chờ");
        return;
      }
      isCreatingInvoice.value = true;
      try {
        const response = await apiService.post("/api/add/tao-hd-cho", {
          khachHangId: customer.value.id || null,
        });
        const newInvoice = {
          id: response.data.id,
          ma: response.data.ma,
          status: "Chờ xử lý",
          items: [],
        };
        pendingInvoices.value.push(newInvoice);
        activeInvoiceId.value = newInvoice.id;
        cartItems.value = [];
        showToast("success", `Tạo hóa đơn mới thành công: ${newInvoice.ma}`);
      } catch (error) {
        showToast("error", "Lỗi khi tạo hóa đơn mới");
      } finally {
        isCreatingInvoice.value = false;
      }
    };

    const loadPendingInvoice = async (invoice) => {
      activeInvoiceId.value = invoice.id;
      try {
        const response = await apiService.get(
          `/api/gio-hang/data/${invoice.id}`
        );
        cartItems.value = response.data.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          price: Number(item.giaBan),
          quantity: item.soLuong,
        }));
        showToast("info", `Đã tải hóa đơn ${invoice.ma}`);
      } catch (error) {
        showToast("error", "Lỗi khi tải giỏ hàng");
      }
    };

    const confirmCancelInvoice = (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.ma}?`,
        () => cancelInvoice(invoice),
        () => {}
      );
    };

    const cancelInvoice = async (invoice) => {
      isNotificationLoading.value = true;
      try {
        await apiService.delete(`/api/xoa-hd-cho/${invoice.id}`);
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== invoice.id
        );
        if (activeInvoiceId.value === invoice.id) {
          activeInvoiceId.value = null;
          cartItems.value = [];
        }
        showToast("success", `Đã hủy hóa đơn ${invoice.ma}`);
        resetNotification();
      } catch (error) {
        showToast("error", "Lỗi khi hủy hóa đơn");
      } finally {
        isNotificationLoading.value = false;
      }
    };

    const scanQR = () => {
      showToast("warning", "Chức năng quét QR đang được phát triển");
    };

    const showIMEIList = async (product) => {
      selectedProduct.value = product;
      showIMEIModal.value = true;
      try {
        // Giả định có endpoint /api/imei?productId
        const response = await apiService.get(
          `/api/imei?productId=${product.id}`
        );
        availableIMEIs.value = response.data.map((imei) => ({
          id: imei.id,
          imei: imei.ma,
        }));
        selectedIMEIs.value = [];
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách IMEI");
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
      if (selectedIMEIs.value.length === 0) return;
      try {
        const chiTietGioHangDTO = {
          chiTietSanPhamId: selectedProduct.value.id,
          soLuong: selectedIMEIs.value.length,
          maImel: selectedIMEIs.value.join(", "),
        };
        const response = await apiService.post(
          `/api/add/gio-hang?idHD=${activeInvoiceId.value}`,
          chiTietGioHangDTO
        );
        cartItems.value = response.data.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          price: Number(item.giaBan),
          quantity: item.soLuong,
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        closeIMEIModal();
        showToast(
          "success",
          `Đã thêm sản phẩm ${selectedProduct.value.tenSanPham} vào giỏ hàng`
        );
      } catch (error) {
        showToast("error", "Lỗi khi thêm sản phẩm vào giỏ hàng");
      }
    };

    const removeItem = async (item) => {
      try {
        // Giả định có endpoint để xóa sản phẩm khỏi giỏ hàng
        await apiService.delete(
          `/api/gio-hang/xoa?hdId=${activeInvoiceId.value}&spId=${item.id}`
        );
        cartItems.value = cartItems.value.filter((i) => i.id !== item.id);
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        showToast("success", `Đã xóa sản phẩm ${item.name} khỏi giỏ hàng`);
      } catch (error) {
        showToast("error", "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
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
        const response = await apiService.post(
          `/api/add/gio-hang?idHD=${activeInvoiceId.value}`,
          chiTietGioHangDTO
        );
        cartItems.value = response.data.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          price: Number(item.giaBan),
          quantity: item.soLuong,
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        if (imeiArray.length === 0) {
          closeCartIMEIModal();
        }
        showToast("success", `Đã xóa IMEI ${imei}`);
      } catch (error) {
        showToast("error", "Lỗi khi xóa IMEI");
      }
    };

    const searchCustomers = async () => {
      if (!searchCustomer.value) {
        selectedCustomer.value = null;
        customer.value = { id: null, name: "", phone: "" };
        return;
      }
      try {
        const response = await apiService.get(
          `/api/khach-hang?query=${searchCustomer.value}`
        );
        if (response.data.length > 0) {
          selectedCustomer.value = response.data[0];
          customer.value = {
            id: response.data[0].id,
            name: response.data[0].tenKhachHang,
            phone: response.data[0].soDienThoai,
          };
          showToast("info", `Tìm thấy khách hàng: ${customer.value.name}`);
        } else {
          selectedCustomer.value = null;
          customer.value = { id: null, name: "", phone: "" };
          showToast("warning", "Không tìm thấy khách hàng");
        }
      } catch (error) {
        showToast("error", "Lỗi khi tìm kiếm khách hàng");
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
      wards.value = [];
    };

    const handleDistrictChange = () => {
      fetchWards(newCustomer.value.district);
      newCustomer.value.ward = "";
    };

    const handleReceiverProvinceChange = () => {
      fetchDistricts(receiver.value.city);
      receiver.value.district = "";
      receiver.value.ward = "";
      wards.value = [];
    };

    const handleReceiverDistrictChange = () => {
      fetchWards(receiver.value.district);
      receiver.value.ward = "";
    };

    const addNewCustomer = async () => {
      if (!newCustomer.value.name || !newCustomer.value.phone) {
        showToast("error", "Vui lòng điền đầy đủ thông tin khách hàng");
        return;
      }
      try {
        const response = await apiService.post("/api/khach-hang", {
          tenKhachHang: newCustomer.value.name,
          soDienThoai: newCustomer.value.phone,
          diaChi: `${newCustomer.value.address}, ${newCustomer.value.ward}, ${newCustomer.value.district}, ${newCustomer.value.city}`,
        });
        customer.value = {
          id: response.data.id,
          name: response.data.tenKhachHang,
          phone: response.data.soDienThoai,
        };
        selectedCustomer.value = response.data;
        isCustomerModalOpen.value = false;
        showToast(
          "success",
          `Thêm khách hàng thành công: ${customer.value.name}`
        );
      } catch (error) {
        showToast("error", "Lỗi khi thêm khách hàng mới");
      }
    };

    const toggleDelivery = () => {
      if (isDelivery.value && selectedCustomer.value) {
        receiver.value = {
          ...customer.value,
          city: "",
          district: "",
          ward: "",
          address: "",
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
    };

    const applyPrivateDiscount = () => {
      if (selectedPrivateDiscount.value) {
        discount.value = selectedPrivateDiscount.value.value;
        showToast(
          "success",
          `Áp dụng mã giảm giá ${selectedPrivateDiscount.value.code} thành công`
        );
        selectedPrivateDiscount.value = null;
        showDiscountModal.value = false;
      }
    };

    const applyPublicDiscount = () => {
      if (selectedPublicDiscount.value) {
        discount.value = selectedPublicDiscount.value.value;
        showToast(
          "success",
          `Áp dụng mã giảm giá ${selectedPublicDiscount.value.code} thành công`
        );
        selectedPublicDiscount.value = null;
        showDiscountModal.value = false;
      }
    };

    const selectPayment = (method) => {
      paymentMethod.value = method;
      tienChuyenKhoan.value = 0;
      tienMat.value = 0;
      qrCodeValue.value = "";
    };

    const generateQRCode = (amount) => {
      const bankInfo = {
        bankName: "YourBank",
        accountNumber: "1234567890",
        accountHolder: "Your Company Name",
        amount: amount,
        description: `Thanh toán hóa đơn ${activeInvoiceId.value || "HDXXX"}`,
      };
      qrCodeValue.value = `Bank: ${bankInfo.bankName}, Account: ${bankInfo.accountNumber}, Holder: ${bankInfo.accountHolder}, Amount: ${bankInfo.amount}, Description: ${bankInfo.description}`;
    };

    const ThanhToan = () => {
      if (!selectedCustomer.value) {
        showToast("error", "Vui lòng chọn hoặc thêm khách hàng");
        return;
      }
      if (cartItems.value.length === 0) {
        showToast("error", "Giỏ hàng trống");
        return;
      }
      const totalPayment = totalPrice.value - discount.value;
      if (paymentMethod.value === "both") {
        const totalInput = (tienChuyenKhoan.value || 0) + (tienMat.value || 0);
        if (totalInput !== totalPayment) {
          showToast(
            "error",
            `Số tiền thanh toán (${formatPrice(
              totalInput
            )}) không khớp với tổng thanh toán (${formatPrice(totalPayment)})`
          );
          return;
        }
        if (tienChuyenKhoan.value < 0 || tienMat.value < 0) {
          showToast("error", "Số tiền thanh toán không được âm");
          return;
        }
      } else if (paymentMethod.value === "transfer") {
        if (!qrCodeValue.value) {
          showToast("error", "Không thể tạo mã QR. Vui lòng thử lại.");
          return;
        }
      }
      showConfirm("Bạn có chắc chắn muốn thanh toán?", createOrder);
    };

    const createOrder = async () => {
      isCreatingOrder.value = true;
      try {
        const hinhThucThanhToan = [];
        if (paymentMethod.value === "cash") {
          hinhThucThanhToan.push({
            phuongThucThanhToan: { id: 1 }, // Giả định id 1 là tiền mặt
            tienMat: totalPrice.value - discount.value,
            tienChuyenKhoan: 0,
          });
        } else if (paymentMethod.value === "transfer") {
          hinhThucThanhToan.push({
            phuongThucThanhToan: { id: 2 }, // Giả định id 2 là chuyển khoản
            tienMat: 0,
            tienChuyenKhoan: totalPrice.value - discount.value,
          });
        } else if (paymentMethod.value === "both") {
          hinhThucThanhToan.push({
            phuongThucThanhToan: { id: 3 }, // Giả định id 3 là cả hai
            tienMat: tienMat.value,
            tienChuyenKhoan: tienChuyenKhoan.value,
          });
        }

        const hoaDonRequest = {
          idKhachHang: customer.value.id,
          tenKhachHang: receiver.value.name || customer.value.name,
          soDienThoaiKhachHang: receiver.value.phone || customer.value.phone,
          diaChiKhachHang: isDelivery.value
            ? `${receiver.value.address}, ${receiver.value.ward}, ${receiver.value.district}, ${receiver.value.city}`
            : "N/A",
          hinhThucThanhToan,
          idPhieuGiamGia:
            selectedPrivateDiscount.value?.id ||
            selectedPublicDiscount.value?.id ||
            null,
        };

        await apiService.post(
          `/api/thanh-toan/${activeInvoiceId.value}`,
          hoaDonRequest
        );
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== activeInvoiceId.value
        );
        cartItems.value = [];
        activeInvoiceId.value = null;
        selectedCustomer.value = null;
        customer.value = { id: null, name: "", phone: "" };
        discount.value = 0;
        selectedPrivateDiscount.value = null;
        selectedPublicDiscount.value = null;
        showToast("success", "Thanh toán thành công");
        resetNotification();
      } catch (error) {
        showToast("error", "Lỗi khi thanh toán");
      } finally {
        isCreatingOrder.value = false;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    const handleScroll = async () => {
      if (isLoadingMore.value) return;
      isLoadingMore.value = true;
      showToast("success", "Đang tải thêm sản phẩm...", true, 0);
      try {
        // Giả định có endpoint phân trang
        const response = await apiService.get(
          `/api/san-pham?page=${Math.ceil(products.value.length / 10) + 1}`
        );
        products.value.push(
          ...response.data.map((sp) => ({
            id: sp.id,
            maSanPham: sp.maSanPham,
            tenSanPham: sp.tenSanPham,
            mauSac: sp.mauSac,
            ram: sp.ram,
            boNhoTrong: sp.boNhoTrong,
            giaBan: sp.giaBan,
          }))
        );
        showToast("success", "Đã tải thêm sản phẩm");
      } catch (error) {
        showToast("error", "Lỗi khi tải thêm sản phẩm");
      } finally {
        isLoadingMore.value = false;
      }
    };

    // Initialize data
    fetchPendingInvoices();
    fetchProducts();
    fetchDiscountCodes();
    fetchLocations();

    return {
      isCreatingInvoice,
      isCreatingOrder,
      activeInvoiceId,
      invoiceSearchQuery,
      pendingInvoices,
      filteredPendingInvoices,
      cartItems,
      showIMEIModal,
      showCartIMEIModal,
      showDiscountModal,
      selectedCartItem,
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
      selectedPrivateDiscount,
      selectedPublicDiscount,
      discount,
      suggestAdditionalPurchase,
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
      privateDiscountCodes,
      publicDiscountCodes,
      provinces,
      districts,
      wards,
      totalPrice,
      cartHeaders,
      productHeaders,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      notificationModal,
      toastNotification,
      activeTab,
      qrCodeValue,
      qrCodeAmount,
      showQRCode,
      createNewPendingInvoice,
      loadPendingInvoice,
      confirmCancelInvoice,
      cancelInvoice,
      scanQR,
      showIMEIList,
      showIMEIModalForItem,
      closeIMEIModal,
      closeCartIMEIModal,
      handleIMEISelection,
      removeIMEI,
      addProductWithIMEIs,
      removeItem,
      deleteIMEI,
      searchCustomers,
      openCustomerModal,
      handleProvinceChange,
      handleDistrictChange,
      handleReceiverProvinceChange,
      handleReceiverDistrictChange,
      addNewCustomer,
      toggleDelivery,
      applyPrivateDiscount,
      applyPublicDiscount,
      selectPayment,
      generateQRCode,
      ThanhToan,
      createOrder,
      formatPrice,
      handleScroll,
      showToast,
      showConfirm,
      resetNotification,
      debouncedInvoiceSearch,
      debouncedProductSearch,
      debouncedCustomerSearch,
    };
  },
};