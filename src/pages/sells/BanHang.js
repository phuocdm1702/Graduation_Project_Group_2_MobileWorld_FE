import { ref, computed, onMounted } from "vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import {
  Search,
  addBanHang,
  fetchPGG,
  checkPhieuGiamGia,
  getPhieuGiamGiaByKhachHang,
} from "../../store/modules/sales/banHangTaiQuay";
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
    const pendingInvoices = ref([
      { id: 1, code: "HD001", status: "Chờ xử lý", items: [] },
      { id: 2, code: "HD002", status: "Chờ xử lý", items: [] },
    ]);
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
    const selectedCustomer = ref(false);
    const customer = ref({ tenKh: "", soDienThoai: "" });
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
      tenKh: "",
      soDienThoai: "",
      thanhPho: "",
      quan: "",
      phuong: "",
      diaChiCuThe: "",
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

    // Sample data
    const products = ref([
      {
        id: 1,
        name: "iPhone 13",
        code: "IP13",
        color: "Xanh",
        ram: "4GB",
        storage: "128GB",
        price: 15000000,
      },
      {
        id: 2,
        name: "Samsung Galaxy S21",
        code: "SGS21",
        color: "Đen",
        ram: "8GB",
        storage: "256GB",
        price: 18000000,
      },
      {
        id: 3,
        name: "Xiaomi 12 Pro",
        code: "XM12P",
        color: "Trắng",
        ram: "8GB",
        storage: "256GB",
        price: 20000000,
      },
      {
        id: 4,
        name: "Oppo Reno 7",
        code: "OPR7",
        color: "Cam",
        ram: "6GB",
        storage: "128GB",
        price: 12000000,
      },
      {
        id: 5,
        name: "Vivo V23",
        code: "VIV23",
        color: "Vàng",
        ram: "8GB",
        storage: "128GB",
        price: 11000000,
      },
      {
        id: 6,
        name: "iPhone 14 Pro",
        code: "IP14P",
        color: "Tím",
        ram: "6GB",
        storage: "256GB",
        price: 25000000,
      },
      {
        id: 7,
        name: "Samsung Galaxy Z Fold 4",
        code: "SGZF4",
        color: "Xám",
        ram: "12GB",
        storage: "512GB",
        price: 35000000,
      },
      {
        id: 8,
        name: "Realme 9 Pro",
        code: "RM9P",
        color: "Xanh dương",
        ram: "6GB",
        storage: "128GB",
        price: 9000000,
      },
      {
        id: 9,
        name: "Huawei P50",
        code: "HWP50",
        color: "Đen",
        ram: "8GB",
        storage: "256GB",
        price: 22000000,
      },
      {
        id: 10,
        name: "Nokia G50",
        code: "NKG50",
        color: "Xanh lam",
        ram: "4GB",
        storage: "64GB",
        price: 6000000,
      },
    ]);
    const availableIMEIs = ref([
      { id: 1, imei: "354827109876543" },
      { id: 2, imei: "987654321098765" },
      { id: 3, imei: "456789123456789" },
      { id: 4, imei: "321654987123456" },
      { id: 5, imei: "789123456789123" },
      { id: 6, imei: "654321987654321" },
      { id: 7, imei: "147258369012345" },
      { id: 8, imei: "258369147258369" },
      { id: 9, imei: "369147258369147" },
      { id: 10, imei: "741852963741852" },
      { id: 11, imei: "852963741852963" },
      { id: 12, imei: "963741852963741" },
      { id: 13, imei: "159753486201357" },
      { id: 14, imei: "753159486207531" },
      { id: 15, imei: "486207531594862" },
      { id: 16, imei: "624813579204681" },
      { id: 17, imei: "135792468013579" },
      { id: 18, imei: "246801357924680" },
      { id: 19, imei: "579246801357924" },
      { id: 20, imei: "802467913580246" },
    ]);
    const privateDiscountCodes = ref([]);

    const formatDate = (isoDate) => {
      if (!isoDate) return "N/A";
      const date = new Date(isoDate);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    

    const isValidDiscount = (ngayKetThuc) => {
      if (!ngayKetThuc) return false;
      const expiryDate = new Date(ngayKetThuc);
      const currentDate = new Date();
      // Đặt giờ của currentDate về 00:00:00 để so sánh chính xác theo ngày
      currentDate.setHours(0, 0, 0, 0);
      return expiryDate >= currentDate;
    };

    const publicDiscountCodes = ref([]);

    onMounted(async () => {
      try {
        const response = await fetchPGG();
        console.log("Dữ liệu PGG đã lấy:", response); // Ghi log dữ liệu API
        if (Array.isArray(response)) {
          // Lọc và ánh xạ dữ liệu API sang định dạng publicDiscountCodes
          publicDiscountCodes.value = response
            .filter(
              (item) =>
                item.riengTu === false && isValidDiscount(item.ngayKetThuc)
            ) // Lọc mã công khai và còn hiệu lực
            .map((item, index) => ({
              id: item.id || index + 1,
              code: item.ma || "Unknown",
              value: item.soTienGiamToiDa || 0,
              percent: item.phanTramGiamGia || 0,
              minOrder: item.hoaDonToiThieu || 0,
              expiry: formatDate(item.ngayKetThuc),
              rawExpiry: item.ngayKetThuc, // Lưu ngày gốc để kiểm tra sau
            }));
          console.log("Mã giảm giá công khai:", publicDiscountCodes.value); // Ghi log để kiểm tra
          if (publicDiscountCodes.value.length > 0) {
            showToast(
              "success",
              `Đã tải ${publicDiscountCodes.value.length} mã giảm giá công khai`
            );
          } else {
            showToast("warning", "Không có mã giảm giá công khai còn hiệu lực");
          }
        } else {
          console.warn("Dữ liệu PGG không hợp lệ:", response);
          showToast("error", "Dữ liệu mã giảm giá không đúng định dạng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy PGG:", error);
        showToast("error", "Lỗi khi tải danh sách mã giảm giá công khai");
      }
    });
    const provinces = ref([
      { code: "HN", name: "Hà Nội" },
      { code: "HCM", name: "TP Hồ Chí Minh" },
    ]);
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
      ...new Set(products.value.map((p) => p.color)),
    ]);
    const uniqueRams = computed(() => [
      ...new Set(products.value.map((p) => p.ram)),
    ]);
    const uniqueStorages = computed(() => [
      ...new Set(products.value.map((p) => p.storage)),
    ]);

    const filteredPendingInvoices = computed(() => {
      if (!invoiceSearchQuery.value) return pendingInvoices.value;
      const query = invoiceSearchQuery.value.toLowerCase();
      return pendingInvoices.value.filter((invoice) =>
        invoice.code.toLowerCase().includes(query)
      );
    });

    const filteredProducts = computed(() => {
      let filtered = products.value;
      if (productSearchQuery.value) {
        const query = productSearchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.color.toLowerCase().includes(query)
        );
      }
      if (filterColor.value) {
        filtered = filtered.filter((p) => p.color === filterColor.value);
      }
      if (filterRam.value) {
        filtered = filtered.filter((p) => p.ram === filterRam.value);
      }
      if (filterStorage.value) {
        filtered = filtered.filter((p) => p.storage === filterStorage.value);
      }
      return filtered;
    });

    const totalPrice = computed(() => {
      return cartItems.value.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    });

    const suggestAdditionalPurchase = computed(() => {
  if (!publicDiscountCodes.value.length && !privateDiscountCodes.value.length) {
    return {
      message: "",
      additionalAmount: 0,
      bestDiscount: null,
      canApplyNow: false,
    };
  }

  // Tính giá trị giảm thực tế của một mã giảm giá
  const calculateDiscountValue = (code) => {
    let discountValue = 0;
    if (code.percent) {
      // Tính giảm giá theo phần trăm
      discountValue = (totalPrice.value * code.percent) / 100;
      // Giới hạn bởi số tiền giảm tối đa
      if (code.value && discountValue > code.value) {
        discountValue = code.value;
      }
    } else if (code.value) {
      // Giảm giá cố định
      discountValue = code.value;
    }
    return discountValue;
  };

  // Tìm mã giảm giá tốt nhất
  let bestDiscount = null;
  let bestDiscountValue = discount.value; // So sánh với mã đang áp dụng

  // Kiểm tra mã công khai
  publicDiscountCodes.value.forEach((code) => {
    if (isValidDiscount(code.rawExpiry)) {
      const discountValue = calculateDiscountValue(code);
      if (
        discountValue > bestDiscountValue &&
        totalPrice.value >= code.minOrder
      ) {
        bestDiscount = { ...code, type: "public" };
        bestDiscountValue = discountValue;
      }
    }
  });

  // Kiểm tra mã riêng tư nếu có khách hàng
  if (selectedCustomer.value && privateDiscountCodes.value.length) {
    privateDiscountCodes.value.forEach((code) => {
      if (isValidDiscount(code.rawExpiry)) {
        const discountValue = calculateDiscountValue(code);
        if (discountValue > bestDiscountValue) {
          bestDiscount = { ...code, type: "private" };
          bestDiscountValue = discountValue;
        }
      }
    });
  }

  if (!bestDiscount) {
    return {
      message: "",
      additionalAmount: 0,
      bestDiscount: null,
      canApplyNow: false,
    };
  }

  // Kiểm tra xem mã có thể áp dụng ngay hay cần mua thêm
  const canApplyNow = totalPrice.value >= bestDiscount.minOrder;
  let message = "";
  let additionalAmount = 0;

  if (canApplyNow) {
    message = `Bạn có thể áp dụng mã ${bestDiscount.code} để được giảm ${formatPrice(
      calculateDiscountValue(bestDiscount)
    )} ngay bây giờ.`;
  } else {
    additionalAmount = bestDiscount.minOrder - totalPrice.value;
    message = `Mua thêm ${formatPrice(
      additionalAmount
    )} để áp dụng mã ${bestDiscount.code} và được giảm ${formatPrice(
      calculateDiscountValue(bestDiscount)
    )}.`;
  }

  return {
    message,
    additionalAmount,
    bestDiscount,
    canApplyNow,
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
      notificationModal.value.openModal();
    };

    const resetNotification = () => {
      notificationType.value = "confirm";
      notificationMessage.value = "";
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
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

    const createNewPendingInvoice = () => {
      if (pendingInvoices.value.length >= 5) {
        showToast("error", "Đã đạt giới hạn 5 hóa đơn chờ");
        return;
      }
      isCreatingInvoice.value = true;
      setTimeout(() => {
        const newInvoice = {
          id: pendingInvoices.value.length + 1,
          code: `HD${String(pendingInvoices.value.length + 1).padStart(
            3,
            "0"
          )}`,
          status: "Chờ xử lý",
          items: [],
        };
        pendingInvoices.value.push(newInvoice);
        activeInvoiceId.value = newInvoice.id;
        cartItems.value = [];
        isCreatingInvoice.value = false;
        showToast("success", `Tạo hóa đơn mới thành công: ${newInvoice.code}`);
      }, 500);
    };

    const loadPendingInvoice = (invoice) => {
      activeInvoiceId.value = invoice.id;
      cartItems.value = invoice.items;
      showToast("info", `Đã tải hóa đơn ${invoice.code}`);
    };

    const confirmCancelInvoice = (invoice) => {
      showConfirm(
        `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.code}?`,
        () => cancelInvoice(invoice),
        () => {}
      );
    };

    const cancelInvoice = (invoice) => {
      isNotificationLoading.value = true;
      setTimeout(() => {
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== invoice.id
        );
        if (activeInvoiceId.value === invoice.id) {
          activeInvoiceId.value = null;
          cartItems.value = [];
        }
        isNotificationLoading.value = false;
        showToast("success", `Đã hủy hóa đơn ${invoice.code}`);
        resetNotification();
      }, 500);
    };

    const scanQR = () => {
      showToast("warning", "Chức năng quét QR đang được phát triển");
    };

    const showIMEIList = (product) => {
      selectedProduct.value = product;
      showIMEIModal.value = true;
      selectedIMEIs.value = [];
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

    const addProductWithIMEIs = () => {
      if (selectedIMEIs.value.length === 0) return;
      const newItem = {
        id: cartItems.value.length + 1,
        name: selectedProduct.value.name,
        color: selectedProduct.value.color,
        ram: selectedProduct.value.ram,
        storage: selectedProduct.value.storage,
        imei: selectedIMEIs.value.join(", "),
        price: selectedProduct.value.price,
        quantity: selectedIMEIs.value.length,
      };
      cartItems.value.push(newItem);
      const invoice = pendingInvoices.value.find(
        (inv) => inv.id === activeInvoiceId.value
      );
      if (invoice) invoice.items = cartItems.value;
      closeIMEIModal();
      showToast("success", `Đã thêm sản phẩm ${newItem.name} vào giỏ hàng`);
    };

    const removeItem = (item) => {
      cartItems.value = cartItems.value.filter((i) => i.id !== item.id);
      const invoice = pendingInvoices.value.find(
        (inv) => inv.id === activeInvoiceId.value
      );
      if (invoice) invoice.items = cartItems.value;
      showToast("success", `Đã xóa sản phẩm ${item.name} khỏi giỏ hàng`);
    };

    const deleteIMEI = (imei) => {
      if (!selectedCartItem.value) return;

      const imeiArray = selectedCartItem.value.imei
        .split(", ")
        .filter((i) => i !== imei);
      selectedCartItem.value.imei = imeiArray.join(", ");
      selectedCartItem.value.quantity = imeiArray.length;

      if (imeiArray.length === 0) {
        cartItems.value = cartItems.value.filter(
          (item) => item.id !== selectedCartItem.value.id
        );
      }

      const invoice = pendingInvoices.value.find(
        (inv) => inv.id === activeInvoiceId.value
      );
      if (invoice) {
        invoice.items = cartItems.value;
      }

      if (imeiArray.length === 0) {
        closeCartIMEIModal();
      }

      showToast("success", `Đã xóa IMEI ${imei}`);
    };

    const searchCustomers = async () => {
  if (!searchCustomer.value) {
    selectedCustomer.value = false;
    customer.value = { name: "", phone: "", id: null };
    privateDiscountCodes.value = [];
    setTimeout(() => {
      showToast("warning", "Vui lòng nhập thông tin tìm kiếm");
    }, 3000);
    return;
  }

  try {
    // Gọi API tìm kiếm khách hàng
    const result = await Search(searchCustomer.value);

    if (result.success && result.data && result.data.length > 0) {
      const customerData = result.data[0];

      // Lấy idKhachHang (thử các trường có thể chứa ID)
      const customerId =
        customerData.id ||
        customerData.idKhachHang ||
        (customerData.idKhachHang && customerData.idKhachHang.id) ||
        null;

      // Cập nhật thông tin khách hàng
      selectedCustomer.value = true;
      customer.value = {
        name: customerData.ten || customerData.idKhachHang?.ten || "",
        phone:
          customerData.idTaiKhoan?.soDienThoai ||
          customerData.idKhachHang?.idTaiKhoan?.soDienThoai ||
          "",
        id: customerId,
      };

      // Gọi API lấy PGG cá nhân nếu có ID
      if (customer.value.id) {
        try {
          const pggResult = await getPhieuGiamGiaByKhachHang(customer.value.id);

          if (pggResult.success && pggResult.data && Array.isArray(pggResult.data)) {
            // Lọc và ánh xạ PGG cá nhân
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
              }));

            if (privateDiscountCodes.value.length > 0) {
              showToast(
                "success",
                `Tìm thấy khách hàng: ${customer.value.name || "Không có tên"} với ${privateDiscountCodes.value.length} mã giảm giá cá nhân`
              );
            } else {
              showToast(
                "warning",
                `Tìm thấy khách hàng: ${customer.value.name || "Không có tên"}, nhưng không có mã giảm giá cá nhân`
              );
            }
          } else {
            privateDiscountCodes.value = [];
            showToast(
              "warning",
              `Tìm thấy khách hàng: ${customer.value.name || "Không có tên"}, nhưng không có mã giảm giá cá nhân`
            );
          }
        } catch (pggError) {
          privateDiscountCodes.value = [];
          showToast("error", "Lỗi khi lấy danh sách mã giảm giá cá nhân");
        }
      } else {
        privateDiscountCodes.value = [];
        showToast(
          "warning",
          `Tìm thấy khách hàng: ${customer.value.name || "Không có tên"}, nhưng không có ID để lấy mã giảm giá`
        );
      }
    } else {
      selectedCustomer.value = false;
      customer.value = { name: "", phone: "", id: null };
      privateDiscountCodes.value = [];
      setTimeout(() => {
        showToast("warning", "Không tìm thấy khách hàng");
      }, 3000);
    }
  } catch (error) {
    selectedCustomer.value = false;
    customer.value = { name: "", phone: "", id: null };
    privateDiscountCodes.value = [];
    showToast("error", "Đã xảy ra lỗi khi tìm kiếm khách hàng");
  }
};


    const openCustomerModal = () => {
      newCustomer.value = {
        tenKh: "",
        soDienThoai: "",
        city: "",
        district: "",
        ward: "",
        diaChiCuThe: "",
      };
      isCustomerModalOpen.value = true;
    };

    const handleProvinceChange = () => {
      districts.value = [
        { code: "Q1", name: "Quận 1" },
        { code: "Q2", name: "Quận 2" },
      ];
      newCustomer.value.district = "";
      newCustomer.value.ward = "";
      wards.value = [];
    };

    const handleDistrictChange = () => {
      wards.value = [
        { code: "P1", name: "Phường 1" },
        { code: "P2", name: "Phường 2" },
      ];
      newCustomer.value.ward = "";
    };

    const handleReceiverProvinceChange = () => {
      districts.value = [
        { code: "Q1", name: "Quận 1" },
        { code: "Q2", name: "Quận 2" },
      ];
      receiver.value.district = "";
      receiver.value.ward = "";
      wards.value = [];
    };

    const handleReceiverDistrictChange = () => {
      wards.value = [
        { code: "P1", name: "Phường 1" },
        { code: "P2", name: "Phường 2" },
      ];
      receiver.value.ward = "";
    };

    const addNewCustomer = async () => {
      // Kiểm tra các trường bắt buộc
      if (!newCustomer.value.tenKh || !newCustomer.value.tenKh.trim()) {
        showToast("error", "Vui lòng nhập tên khách hàng");
        return;
      }

      if (
        !newCustomer.value.soDienThoai ||
        !newCustomer.value.soDienThoai.trim()
      ) {
        showToast("error", "Vui lòng nhập số điện thoại");
        return;
      }

      // Kiểm tra định dạng số điện thoại (10 chữ số)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newCustomer.value.soDienThoai.trim())) {
        showToast("error", "Số điện thoại phải có đúng 10 chữ số");
        return;
      }

      // Chuẩn bị payload theo định dạng API Postman
      const payload = {
        tenKH: newCustomer.value.tenKh.trim(), // Tên khách hàng
        soDienThoai: newCustomer.value.soDienThoai.trim(), // Ánh xạ soDienThoai thành soLuongsoDienThoai
        thanhPho: newCustomer.value.city?.trim() || "",
        quan: newCustomer.value.district?.trim() || "",
        phuong: newCustomer.value.ward?.trim() || "",
        diaChiCuThe: newCustomer.value.diaChiCuThe?.trim() || "",
      };

      try {
        console.log("Sending add customer payload:", payload); // Debug payload
        // Gọi API để thêm khách hàng
        const response = await addBanHang(payload);
        console.log("Add Customer Response:", response); // Debug phản hồi

        if (response.success) {
          // Cập nhật thông tin khách hàng
          customer.value = {
            name: payload.tenKH, // Cập nhật tên khách hàng
            phone: payload.soDienThoai, // Cập nhật số điện thoại
            city: payload.thanhPho,
            district: payload.quan,
            ward: payload.phuong,
            address: payload.diaChiCuThe,
          };
          selectedCustomer.value = true;
          isCustomerModalOpen.value = false;
          showToast(
            "success",
            `Thêm khách hàng thành công: ${customer.value.name}`
          );

          // Nếu đang ở chế độ giao hàng, cập nhật thông tin người nhận
          if (isDelivery.value) {
            receiver.value = { ...customer.value };
            isReceiverEditable.value = false;
          }
        } else {
          showToast("error", response.message || "Lỗi khi thêm khách hàng");
        }
      } catch (error) {
        console.error(
          "Add customer error:",
          error.response?.data || error.message
        );
        showToast(
          "error",
          `Lỗi khi thêm khách hàng: ${
            error.response?.data?.message || error.message
          }`
        );
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

    const createOrder = () => {
      isCreatingOrder.value = true;
      setTimeout(() => {
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== activeInvoiceId.value
        );
        cartItems.value = [];
        activeInvoiceId.value = null;
        selectedCustomer.value = false;
        customer.value = { name: "", phone: "" };
        discount.value = 0;
        selectedPrivateDiscount.value = null;
        selectedPublicDiscount.value = null;
        isCreatingOrder.value = false;
        showToast("success", "Thanh toán thành công");
        resetNotification();
      }, 500);
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    const handleScroll = () => {
      if (isLoadingMore.value) return;
      isLoadingMore.value = true;
      showToast("success", "Đang tải thêm sản phẩm...", true, 0);
      setTimeout(() => {
        products.value.push({
          id: products.value.length + 1,
          name: "Oppo Reno 6",
          code: "OPR6",
          color: "Bạc",
          ram: "8GB",
          storage: "128GB",
          price: 12000000,
        });
        isLoadingMore.value = false;
        showToast("success", "Đã tải thêm sản phẩm");
      }, 500);
    };

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
