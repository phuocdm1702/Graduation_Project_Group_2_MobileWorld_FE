import { ref, computed, onMounted, nextTick } from "vue";
import apiService from "../../../services/api";
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";
import { useRouter } from "vue-router";

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
    const selectedDiscount = ref(null); // PGG được chọn tự động
    const privateDiscountCodes = ref([]); // Danh sách PGG riêng tư
    const publicDiscountCodes = ref([]); // Danh sách PGG công khai
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
    const manualDiscountSelected = ref(false); // Cờ để kiểm soát chọn PGG thủ công

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
    filtered = filtered.filter((item) => item.color === cartFilterColor.value);
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

// Thêm debounced search cho giỏ hàng
const debouncedCartSearch = debounce((query) => {
  cartSearchQuery.value = query;
}, 300);

    // DataTable headers
    const cartHeaders = ref([
      { text: "STT", value: "stt" },
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
    // Thêm computed để đồng bộ discount với selectedDiscount
    // Thêm computed để đồng bộ discount với selectedDiscount
    const discount = computed({
      get: () => (selectedDiscount.value ? selectedDiscount.value.value : 0),
      set: (newValue) => {
        // Nếu cần, có thể thêm logic để cập nhật selectedDiscount.value
        if (selectedDiscount.value) {
          selectedDiscount.value.value = newValue;
        }
      },
    });
    const suggestedDiscounts = computed(() => {
      return publicDiscountCodes.value
        .filter((discount) => {
          // Chỉ lấy PGG công khai không đủ điều kiện (tongTien < minOrder) và còn hạn
          return (
            tongTien.value < discount.minOrder &&
            isValidDiscount(discount.rawExpiry)
          );
        })
        .map((discount) => ({
          ...discount,
          missingAmount: discount.minOrder - tongTien.value, // Tính số tiền còn thiếu
        }))
        .sort((a, b) => b.value - a.value); // Sắp xếp theo giá trị giảm giá giảm dần
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

      // Lọc các PGG khả dụng, ngoại trừ PGG tốt nhất (nếu có)
      return allDiscounts
        .filter((discount) => {
          if (
            discount.type === "public" &&
            tongTien.value < discount.minOrder
          ) {
            return false; // Loại bỏ PGG công khai nếu tổng tiền chưa đạt yêu cầu
          }
          return (
            isValidDiscount(discount.rawExpiry) &&
            (!selectedDiscount.value ||
              discount.id !== selectedDiscount.value.id)
          ); // Loại bỏ PGG tốt nhất
        })
        .sort((a, b) => b.value - a.value); // Sắp xếp theo giá trị giảm giá giảm dần
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

    const totalPayment = computed(() => {
      let total = tongTien.value - discount.value;
      if (isDelivery.value && tongTien.value < FREE_SHIP_THRESHOLD) {
        total += shippingFee.value;
      }
      return total > 0 ? total : 0;
    });

    const priceChangeInfo = computed(() => {
      return cartItems.value.map((item) => {
        const product = products.value.find(
          (p) =>
            p.id === item.id &&
            p.mauSac === item.color &&
            p.dungLuongRam === item.ram &&
            p.dungLuongBoNhoTrong === item.storage
        );
        const currentPrice = product ? product.giaBan : item.originalPrice;
        return {
          ...item,
          currentPrice,
          priceChangeText:
            currentPrice !== item.originalPrice
              ? `Tăng từ ${formatPrice(item.originalPrice)} lên ${formatPrice(
                  currentPrice
                )}`
              : null,
        };
      });
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
          message: `Bạn có thể áp dụng mã ${
            bestDiscount.code
          } để được giảm ${formatPrice(bestDiscount.value)}.`,
          additionalAmount: 0,
          bestDiscount,
        };
      }

      const additionalAmount = bestDiscount.minOrder - tongTien.value;
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
        qrCodeAmount.value = totalPayment.value;
        generateQRCode(qrCodeAmount.value);
        return true;
      } else if (paymentMethod.value === "both" && tienChuyenKhoan.value > 0) {
        qrCodeAmount.value = tienChuyenKhoan.value;
        generateQRCode(tienChuyenKhoan.value);
        return true;
      }
      return false;
    });

    // Shipping Fee
    const shippingFee = ref(0);
    const selectedShippingUnit = ref(null);
    const shippingUnits = ref([
      { id: 1, name: "Giao Hàng Nhanh", logo: "/src/assets/Logo/logoGHN.png" },
      {
        id: 2,
        name: "Giao Hàng Tiết Kiệm",
        logo: "/src/assets/Logo/LogoGHTK.png",
      },
    ]);
    const FREE_SHIP_THRESHOLD = 50000000;

    // Utility Methods
    const showProductDetailsModal = (item, event) => {
  selectedCartItem.value = item;
  modalPosition.value = {
    top: event.clientY + 10, // Điều chỉnh vị trí modal theo con trỏ chuột
    left: event.clientX + 10,
  };
  showProductDetails.value = true;
};

const hideProductDetailsModal = () => {
  showProductDetails.value = false;
  selectedCartItem.value = null;
};

    const selectDiscount = async (discount) => {
      try {
        const result = await validateDiscount(
          discount.code,
          customer.value?.id || null
        );
        if (result.success && result.data) {
          selectedDiscount.value = { ...discount }; // Gán bản sao mới
          manualDiscountSelected.value = true; // Đánh dấu đã chọn thủ công
          showToast(
            "success",
            `Đã áp dụng mã giảm giá ${discount.code} (-${formatPrice(
              discount.value
            )})`
          );
        } else {
          showToast(
            "error",
            result.message || "Không thể áp dụng mã giảm giá này"
          );
        }
      } catch (error) {
        showToast("error", "Lỗi khi áp dụng mã giảm giá");
      }
    };

    const showToast = (type, message, isLoading = false, duration = 3000) => {
      toastNotification.value.addToast({ type, message, isLoading, duration });
    };

    const showConfirm = (message, onConfirm, onCancel = () => {}) => {
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
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      })
        .format(price)
        .replace("₫", "VND");
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    };

    const isValidDiscount = (expiryDate) => {
      if (!expiryDate) return false;
      const now = new Date();
      const expiry = new Date(expiryDate);
      return expiry >= now;
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
        const response = await apiService.get("/api/hoa-don-cho");
        pendingInvoices.value = response.data.map((hd) => ({
          id: hd.id,
          ma: hd.ma,
          status: hd.trangThai === 0 ? "Chờ xử lý" : "Khác",
          items: [],
        }));
      } catch (error) {
        showToast("error", "Lỗi khi tải hóa đơn chờ");
      }
    };

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
          originalPrice: Number(item.giaBan),
          currentPrice: Number(item.giaBan),
          quantity: item.soLuong,
        }));
        const index = pendingInvoices.value.findIndex(
          (inv) => inv.id === invoice.id
        );
        if (index !== -1) {
          pendingInvoices.value[index].items = cartItems.value;
        }
        showToast("info", `Đã tải hóa đơn ${invoice.ma}`);
        await applyBestDiscount(); // Áp dụng PGG tốt nhất
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

    // Product-Related Methods
    const fetchProducts = async () => {
      try {
        const response = await apiService.get(
          "/api/san-pham?page=0&size=999999999"
        );
        products.value = response.data.content.map((sp) => ({
          id: sp.id,
          sanPhamId: sp.idSanPham,
          tenSanPham: sp.tenSanPham,
          maSanPham: sp.ma,
          mauSac: sp.mauSac || "N/A",
          dungLuongRam: sp.dungLuongRam || "N/A",
          dungLuongBoNhoTrong: sp.dungLuongBoNhoTrong || "N/A",
          soLuong: sp.soLuong || 0,
          giaBan: sp.giaBan || 0,
        }));
      } catch (error) {
        const message =
          error.response?.data?.message || "Lỗi khi tải danh sách sản phẩm";
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
        const response = await apiService.get(`/api/san-pham?page=0&size=10`);
        products.value.push(
          ...response.data.content.map((sp) => ({
            id: sp.id,
            sanPhamId: sp.idSanPham,
            tenSanPham: sp.tenSanPham,
            maSanPham: sp.ma,
            mauSac: sp.mauSac || "N/A",
            dungLuongRam: sp.dungLuongRam || "N/A",
            dungLuongBoNhoTrong: sp.dungLuongBoNhoTrong || "N/A",
            soLuong: sp.soLuong || 0,
            giaBan: sp.giaBan || 0,
          }))
        );
        totalPages.value = response.data.totalPages;
        showToast("success", "Đã tải thêm sản phẩm");
      } catch (error) {
        const message =
          error.response?.data?.message || "Lỗi khi tải thêm sản phẩm";
        showToast("error", message);
      } finally {
        isLoadingMore.value = false;
      }
    };

    const removeItem = async (item) => {
      try {
        const response = await apiService.delete(
          `/api/gio-hang/xoa?hdId=${activeInvoiceId.value}&spId=${item.id}`
        );
        cartItems.value = response.data.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBan),
          currentPrice: Number(item.giaBan),
          quantity: item.soLuong,
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        showToast("success", `Đã xóa sản phẩm ${item.name} khỏi giỏ hàng`);
        await applyBestDiscount(); // Áp dụng PGG tốt nhất
      } catch (error) {
        showToast("error", "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
      }
    };

    // IMEI-Related Methods
    const showIMEIList = async (product) => {
      selectedProduct.value = product;
      showIMEIModal.value = true;
      try {
        const response = await apiService.get(
          `/api/san-pham/${product.sanPhamId}/imeis?mauSac=${encodeURIComponent(
            product.mauSac
          )}&dungLuongRam=${encodeURIComponent(
            product.dungLuongRam
          )}&dungLuongBoNhoTrong=${encodeURIComponent(
            product.dungLuongBoNhoTrong
          )}`
        );
        availableIMEIs.value = response.data.map((imei) => ({
          id: imei,
          imei: imei,
        }));
        selectedIMEIs.value = [];
      } catch (error) {
        console.error("Lỗi chi tiết:", error.response?.data || error.message);
        showToast(
          "error",
          error.response?.data?.message || "Lỗi khi tải danh sách IMEI"
        );
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
      if (!selectedProduct.value?.sanPhamId) {
        showToast("error", "Vui lòng chọn một sản phẩm hợp lệ!");
        return;
      }

      try {
        const response = await apiService.get(
          `/api/chi-tiet-san-pham/id?sanPhamId=${
            selectedProduct.value.sanPhamId
          }&mauSac=${encodeURIComponent(
            selectedProduct.value.mauSac
          )}&dungLuongRam=${encodeURIComponent(
            selectedProduct.value.dungLuongRam
          )}&dungLuongBoNhoTrong=${encodeURIComponent(
            selectedProduct.value.dungLuongBoNhoTrong
          )}`
        );
        const chiTietSanPhamId = response.data;

        // Fetch latest product price
        const productResponse = await apiService.get(
          `/api/san-pham?page=0&size=1&keyword=${encodeURIComponent(
            selectedProduct.value.maSanPham
          )}`
        );
        const latestPrice =
          productResponse.data.content[0]?.giaBan ||
          selectedProduct.value.giaBan;

        const chiTietGioHangDTO = {
          chiTietSanPhamId: chiTietSanPhamId,
          soLuong: selectedIMEIs.value.length,
          maImel: selectedIMEIs.value.join(", "),
          idPhieuGiamGia: selectedDiscount.value?.id || null,
        };

        const postResponse = await apiService.post(
          `/api/add/gio-hang?idHD=${activeInvoiceId.value}`,
          chiTietGioHangDTO
        );
        cartItems.value = postResponse.data.chiTietGioHangDTOS.map((item) => ({
          id: item.chiTietSanPhamId,
          name: item.tenSanPham,
          color: item.mauSac,
          ram: item.ram,
          storage: item.boNhoTrong,
          imei: item.maImel,
          originalPrice: Number(item.giaBan),
          currentPrice: latestPrice,
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
        await applyBestDiscount(); // Áp dụng PGG tốt nhất
      } catch (error) {
        console.error("Lỗi chi tiết:", error.response?.data || error.message);
        showToast(
          "error",
          error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng"
        );
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
          originalPrice: Number(item.giaBan),
          currentPrice: Number(item.giaBan),
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
        await applyBestDiscount(); // Áp dụng PGG tốt nhất
      } catch (error) {
        showToast("error", "Lỗi khi xóa IMEI");
      }
    };

    // Customer-Related Methods
    const Search = async (query) => {
      try {
        const response = await apiService.get("/khach-hang/search", {
          params: { query },
        });
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data || "Không tìm thấy khách hàng",
        };
      }
    };

    const searchCustomers = async () => {
  if (!searchCustomer.value) {
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
    privateDiscountCodes.value = [];
    setTimeout(() => {
      showToast("warning", "Vui lòng nhập thông tin tìm kiếm");
    }, 3000);
    return;
  }

  try {
    const result = await Search(searchCustomer.value);

    if (result.success && result.data && result.data.length > 0) {
      const customerData = result.data[0];
      const customerId =
        customerData.id ||
        customerData.idKhachHang ||
        (customerData.idKhachHang && customerData.idKhachHang.id) ||
        null;

      selectedCustomer.value = customerData;
      customer.value = {
        id: customerId,
        name: customerData.ten || customerData.idKhachHang?.ten || "",
        phone:
          customerData.idTaiKhoan?.soDienThoai ||
          customerData.idKhachHang?.idTaiKhoan?.soDienThoai ||
          "",
        city: customerData.idDiaChiKhachHang?.thanhPho || "",
        district: customerData.idDiaChiKhachHang?.quan || "",
        ward: customerData.idDiaChiKhachHang?.phuong || "",
        address: customerData.idDiaChiKhachHang?.diaChiCuThe || "",
      };

      // Điền quận và phường nếu có thành phố và quận
      if (customer.value.city) {
        await fetchDistricts(customer.value.city);
        if (customer.value.district) {
          await fetchWards(customer.value.district);
        }
      }

      if (customerId) {
        const pggResult = await getPhieuGiamGiaByKhachHang(customerId);
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
          showToast(
            "success",
            `Tìm thấy khách hàng: ${customer.value.name} với ${privateDiscountCodes.value.length} mã giảm giá cá nhân`
          );
        } else {
          privateDiscountCodes.value = [];
          showToast(
            "warning",
            `Tìm thấy khách hàng: ${customer.value.name}, nhưng không có mã giảm giá cá nhân`
          );
        }
      } else {
        privateDiscountCodes.value = [];
        showToast(
          "warning",
          `Tìm thấy khách hàng: ${customer.value.name}, nhưng không có ID để lấy mã giảm giá`
        );
      }
      await applyBestDiscount();
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
      privateDiscountCodes.value = [];
      setTimeout(() => {
        showToast("warning", "Không tìm thấy khách hàng");
      }, 3000);
      await applyBestDiscount();
    }
  } catch (error) {
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
    privateDiscountCodes.value = [];
    showToast("error", "Đã xảy ra lỗi khi tìm kiếm khách hàng");
    await applyBestDiscount();
  }
};

    const addBanHang = async (customerData) => {
      try {
        const response = await apiService.post(
          "/khach-hang/add-Bh",
          customerData
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Lỗi khi thêm khách hàng:", error);
        return {
          success: false,
          message: error.response?.data || "Lỗi khi thêm khách hàng",
        };
      }
    };

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
        const response = await addBanHang(payload);
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
          await applyBestDiscount(); // Áp dụng PGG tốt nhất
        } else {
          showToast("error", response.message || "Lỗi khi thêm khách hàng");
        }
      } catch (error) {
        showToast(
          "error",
          `Lỗi khi thêm khách hàng: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    const getPhieuGiamGiaByKhachHang = async (idKhachHang) => {
      try {
        const response = await apiService.get(
          `/api/by-khach-hang/${idKhachHang}`
        );
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data || "Không lấy được danh sách phiếu giảm giá",
        };
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        provinces.value = response.data.map((t) => ({
          code: t.code,
          name: t.name,
        }));
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
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
        );
        districts.value = response.data.districts.map((q) => ({
          code: q.code,
          name: q.name,
        }));
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
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
        );
        wards.value = response.data.wards.map((p) => ({
          code: p.code,
          name: p.name,
        }));
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
        const response = await apiService.get("/api/PGG-all");
        publicDiscountCodes.value = response.data
          .filter(
            (item) =>
              item.riengTu === false &&
              item.trangThai === true &&
              isValidDiscount(item.ngayKetThuc)
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
          }));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách PGG", error);
        showToast("error", "Lỗi khi tải danh sách mã giảm giá");
      }
    };

    const validateDiscount = async (ma, khachHangId) => {
      try {
        const response = await apiService.get(
          "/api/phieu-giam-gia/validate-at-checkout",
          {
            params: {
              ma,
              totalPrice: tongTien.value,
              khachHangId: khachHangId || null,
            },
          }
        );
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data || "Lỗi khi kiểm tra mã giảm giá",
        };
      }
    };

    const applyBestDiscount = async () => {
      if (!cartItems.value.length || tongTien.value <= 0) {
        selectedDiscount.value = null;
        manualDiscountSelected.value = false; // Reset cờ khi giỏ hàng trống
        return;
      }

      if (manualDiscountSelected.value) {
        const result = await validateDiscount(
          selectedDiscount.value.code,
          customer.value?.id || null
        );
        if (!result.success || !result.data) {
          selectedDiscount.value = null;
          manualDiscountSelected.value = false;
          showToast("info", "Mã giảm giá đã chọn không còn hợp lệ");
        }
        return;
      }

      try {
        await fetchPGG();

        if (customer.value?.id) {
          const pggResult = await getPhieuGiamGiaByKhachHang(customer.value.id);
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
          const result = await validateDiscount(
            code.code,
            customer.value?.id || null
          );
          if (result.success && result.data) {
            const discountValue = code.value;
            if (
              (code.type === "public" && tongTien.value >= code.minOrder) ||
              code.type === "private"
            ) {
              if (!bestDiscount || discountValue > bestDiscount.value) {
                bestDiscount = code;
              }
            }
          }
        }

        if (bestDiscount) {
          selectedDiscount.value = { ...bestDiscount };
          showToast(
            "success",
            `Đã áp dụng mã giảm giá ${bestDiscount.code} (-${formatPrice(
              bestDiscount.value
            )})`
          );
        } else {
          selectedDiscount.value = null;
          showToast("info", "Không có mã giảm giá nào khả dụng");
        }
      } catch (error) {
        console.error("Lỗi khi áp dụng mã giảm giá:", error);
        selectedDiscount.value = null;
        manualDiscountSelected.value = false;
        showToast("error", "Lỗi khi tìm mã giảm giá tốt nhất");
      }
    };

    // Payment-Related Methods
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

    const scanQR = () => {
      showToast("warning", "Chức năng quét QR đang được phát triển");
    };

    const ThanhToan = async () => {
      if (cartItems.value.length === 0) {
        showToast("error", "Giỏ hàng trống");
        return;
      }

      const totalPaymentValue = totalPayment.value;
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
      } else if (paymentMethod.value === "transfer") {
        if (!qrCodeValue.value) {
          showToast("error", "Không thể tạo mã QR. Vui lòng thử lại.");
          return;
        }
      }

      await applyBestDiscount(); // Áp dụng PGG tốt nhất trước khi thanh toán
      createOrder();
    };

    const createOrder = async () => {
      isCreatingOrder.value = true;
      try {
        const hinhThucThanhToan = [];
        if (paymentMethod.value === "cash") {
          hinhThucThanhToan.push({
            phuongThucThanhToanId: 1,
            tienMat: totalPayment.value,
            tienChuyenKhoan: 0,
          });
        } else if (paymentMethod.value === "transfer") {
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
              : null,
          hinhThucThanhToan,
          idPhieuGiamGia: selectedDiscount.value?.id || null,
          giamGia: discount.value,
          phiVanChuyen: isDelivery.value ? shippingFee.value : 0,
          loaiDon: isDelivery.value ? "online" : "trực tiếp",
          tongTien: tongTien.value,
          chiTietGioHang: cartItems.value.map((item) => ({
            chiTietSanPhamId: item.id,
            soLuong: item.quantity,
            maImel: item.imei,
            giaBan: item.originalPrice,
          })),
        };

        const response = await apiService.post(
          `/api/thanh-toan/${activeInvoiceId.value}`,
          hoaDonRequest
        );
        const invoiceId = response.data.id || activeInvoiceId.value;
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== activeInvoiceId.value
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
        }, 8000);
      } catch (error) {
        showToast(
          "error",
          `Lỗi khi thanh toán: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        isCreatingOrder.value = false;
      }
    };

    // Shipping Fee Method
    const updateShippingFee = async () => {
      if (!isDelivery.value || !selectedShippingUnit.value) {
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
        if (selectedShippingUnit.value.name === "Giao Hàng Nhanh") {
          shippingFee.value = 100000;
        } else if (selectedShippingUnit.value.name === "Giao Hàng Tiết Kiệm") {
          shippingFee.value = 30000;
        } else {
          shippingFee.value = 30000;
        }
        showToast(
          "success",
          `Đã cập nhật phí vận chuyển cho ${selectedShippingUnit.value.name}`
        );
      } catch (error) {
        console.error("Lỗi khi tính phí vận chuyển:", error);
        shippingFee.value = 30000;
        showToast("error", "Lỗi khi tính phí vận chuyển");
      }
    };

    // Initialize data
    onMounted(async () => {
      try {
        await fetchPGG();
        fetchPendingInvoices();
        fetchProducts();
        fetchLocations();
        await applyBestDiscount(); // Áp dụng PGG tốt nhất khi khởi tạo
      } catch (error) {
        showToast("error", "Lỗi khi khởi tạo dữ liệu");
      }
    });

    // Trong phần setup của component
const handleCustomerProvinceChange = () => {
  // Reset các trường liên quan khi thay đổi tỉnh/thành phố
  customer.value.district = "";
  customer.value.ward = "";
  customer.value.address = "";
  districts.value = [];
  wards.value = [];
  
  // Gọi API để lấy danh sách quận/huyện nếu có tỉnh/thành phố được chọn
  if (customer.value.city) {
    fetchDistricts(customer.value.city);
  }
};

const handleCustomerDistrictChange = () => {
  // Reset các trường liên quan khi thay đổi quận/huyện
  customer.value.ward = "";
  customer.value.address = "";
  wards.value = [];
  
  // Gọi API để lấy danh sách phường/xã nếu có quận/huyện được chọn
  if (customer.value.district) {
    fetchWards(customer.value.district);
  }
};

    return {
  // Các biến và hàm hiện có
  handleCustomerProvinceChange,
  handleCustomerDistrictChange,
  selectDiscount,
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
  Search,
  searchCustomers,
  addBanHang,
  addNewCustomer,
  getPhieuGiamGiaByKhachHang,
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
  validateDiscount,
  applyBestDiscount,
  selectPayment,
  generateQRCode,
  scanQR,
  ThanhToan,
  createOrder,
  // Thêm các biến và hàm mới cho giỏ hàng
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
};
  },
};
