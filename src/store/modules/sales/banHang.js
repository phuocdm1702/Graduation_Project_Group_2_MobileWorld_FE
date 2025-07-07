import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import apiService from "../../../services/api";
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

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
    const codeReader = ref(null);
    const isCameraActive = ref(false);
    const showScanModal = ref(false);
    const scannedCode = ref("");
    const isScanning = ref(false);
    const scanError = ref("");
    // Thêm biến để lưu trữ phần tử video và canvas cho vùng quét
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
    //PGG
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
      let total = tongTien.value; // Tổng tiền ban đầu
      total -= discount.value; // Trừ giảm giá
      if (isDelivery.value && tongTien.value < FREE_SHIP_THRESHOLD) {
        total += shippingFee.value; // Cộng phí vận chuyển nếu áp dụng
      }
      return total > 0 ? total : 0; // Đảm bảo tổng không âm
    });

    const priceChangeInfo = computed(() => {
      return cartItems.value.map((item) => ({
        ...item,
        priceChangeText: item.ghiChuGia || null, // Sử dụng ghiChuGia từ server
        displayPrice: Number(item.currentPrice), // Hiển thị giá sau giảm
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

    // Shipping Fee
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
          selectedDiscount.value = {
            id: discount.id,
            code: discount.code,
            value: discount.value,
            percent: discount.percent || 0,
            minOrder: discount.minOrder || 0,
            expiry: discount.expiry,
            rawExpiry: discount.rawExpiry,
            type: discount.type,
          }; // Lưu bản sao đầy đủ thông tin
          manualDiscountSelected.value = true;
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
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "", // Thêm ghiChuGia
        }));
        const index = pendingInvoices.value.findIndex(
          (inv) => inv.id === invoice.id
        );
        if (index !== -1) {
          pendingInvoices.value[index].items = cartItems.value;
        }
        // Hiển thị thông báo giá thay đổi (Nếu đổi giá Maybe thôi)
        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });
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
          soLuong: sp.soLuong || 0, // Số lượng từ API
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
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "", // Thêm ghiChuGia
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
        // Hiển thị thông báo giá thay đổi nếu có
        cartItems.value.forEach((item) => {
          if (item.ghiChuGia) {
            showToast("warning", item.ghiChuGia);
          }
        });
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
      if (selectedIMEIs.value.length === 0) {
        showToast("error", "Vui lòng chọn ít nhất một IMEI!");
        return;
      }
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
        if (!response.data) {
          showToast(
              "error",
              "Không tìm thấy chi tiết sản phẩm hoặc IMEI khả dụng!"
          );
          return;
        }
        const chiTietSanPhamId = response.data;

        const productResponse = await apiService.get(
            `/api/san-pham?page=0&size=1&keyword=${encodeURIComponent(
                selectedProduct.value.maSanPham
            )}`
        );
        if (!productResponse.data.content[0]) {
          showToast("error", "Không tìm thấy thông tin sản phẩm!");
          return;
        }
        const productData = productResponse.data.content[0];
        const latestPrice =
          Number(productData.giaBan) || selectedProduct.value.giaBan;
        const latestOriginalPrice =
          Number(productData.giaBanGoc) || latestPrice;
        const latestInitialPrice =
          Number(productData.giaBanBanDau) || latestPrice;
        const latestPrice = Number(productData.giaBan) || selectedProduct.value.giaBan;
        const latestOriginalPrice = Number(productData.giaBanGoc) || latestPrice;
        const latestInitialPrice = Number(productData.giaBanBanDau) || latestPrice;

        // Kiểm tra thay đổi giá so với giá ban đầu
        if (latestInitialPrice !== selectedProduct.value.giaBan) {
          const ghiChuGia = `Giá sản phẩm ${
              selectedProduct.value.tenSanPham
          } đã thay đổi thành ${formatPrice(
            latestPrice
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
        };

        const postResponse = await apiService.post(
            `/api/add/gio-hang?idHD=${activeInvoiceId.value}`,
            chiTietGioHangDTO
        );

        if (
            !postResponse.data ||
            !postResponse.data.chiTietGioHangDTOS ||
            !postResponse.data.gioHangId
        ) {
          showToast("error", "Dữ liệu phản hồi từ server không hợp lệ!");
          return;
        }

        const existingItems = cartItems.value.filter(
            (item) => !selectedIMEIs.value.includes(item.imei.split(", ")[0])
        );
        const newItems = postResponse.data.chiTietGioHangDTOS
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
            }));

        cartItems.value = [...existingItems, ...newItems];

        const invoiceId = parseInt(
            postResponse.data.gioHangId.replace("GH_", "")
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

        const invoice = pendingInvoices.value.find(
            (inv) => inv.id === activeInvoiceId.value
        );
        if (!invoice) {
          const newInvoice = {
            id: activeInvoiceId.value,
            ma: `HD${activeInvoiceId.value}`,
            status: "Chờ",
            items: [],
          };
          pendingInvoices.value.push(newInvoice);
        }
        invoice.items = cartItems.value;

        closeIMEIModal();
        showToast(
            "success",
            `Đã thêm sản phẩm ${selectedProduct.value.tenSanPham} vào giỏ hàng`
        );
        await applyBestDiscount();
        await fetchProducts(); // Làm mới danh sách sản phẩm
      } catch (error) {
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
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
        }));
        const invoice = pendingInvoices.value.find(
          (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;
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
        await fetchProducts(); // Làm mới danh sách sản phẩm
      } catch (error) {
        showToast("error", error.response?.data?.message || "Lỗi khi xóa IMEI");
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
      isHomeDelivery.value = false; // Reset khi thay đổi chế độ giao hàng
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
            percent: Number(item.phanTramGiamGia) || 0, // Thêm percent
            minOrder: Number(item.hoaDonToiThieu) || 0, // Thêm minOrder
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
        manualDiscountSelected.value = false;
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
              .filter((item) => {
                const pgg = item.idPhieuGiamGia || {};
                const isPrivate = pgg.riengTu === true;
                const isValid = isValidDiscount(
                  pgg.ngayKetThuc || item.ngayHetHan
                );
                console.log(
                  "PGG Item:",
                  item,
                  "Is Private:",
                  isPrivate,
                  "Is Valid:",
                  isValid
                );
                return isPrivate && isValid;
              })
              .map((item, index) => ({
                id: item.id || index + 1,
                code: item.idPhieuGiamGia?.ma || item.ma || "Unknown",
                tenPhieuGiamGia:
                  item.idPhieuGiamGia?.tenPhieuGiamGia || "Unknown",
                value: item.idPhieuGiamGia?.soTienGiamToiDa || 0,
                percent: item.idPhieuGiamGia?.phanTramGiamGia || 0, // Thêm percent
                expiry: formatDate(
                  item.idPhieuGiamGia?.ngayKetThuc || item.ngayHetHan
                ),
                rawExpiry: item.idPhieuGiamGia?.ngayKetThuc || item.ngayHetHan,
                minOrder: item.idPhieuGiamGia?.hoaDonToiThieu || 0, // Thêm minOrder
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
                bestDiscount = { ...code, value: actualDiscount }; // Cập nhật value thực tế
              }
            }
          }
        }

        if (bestDiscount) {
          selectedDiscount.value = { ...bestDiscount };
          const discountText = bestDiscount.percent
            ? `${bestDiscount.percent}% (${formatPrice(bestDiscount.value)})`
            : formatPrice(bestDiscount.value);
          showToast(
            "success",
            `Đã áp dụng mã giảm giá ${
              bestDiscount.tenPhieuGiamGia || bestDiscount.code
            } (-${discountText})`
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

    const bankInfo = ref({
      description: `Thanh toán hóa đơn ${
        activeInvoiceId.value || "HDXXX"
      } qua VietQR`,
    });

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

    const startZXingScan = async () => {
      const videoEl = document.querySelector("#barcode-scanner-video");
      if (!videoEl) {
        console.error("Phần tử video không tồn tại!");
        showToast(
          "error",
          "Không tìm thấy phần tử video để quét. Vui lòng làm mới trang."
        );
        return;
      }
      videoElement.value = videoEl;

      const scanRegionEl = document.querySelector("#scan-region");
      if (!scanRegionEl) {
        console.error("Phần tử scan-region không tồn tại!");
        showToast("error", "Không tìm thấy vùng quét. Vui lòng kiểm tra HTML.");
        return;
      }
      scanRegion.value = scanRegionEl;

      codeReader.value = new BrowserMultiFormatReader();
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { min: 640 },
            height: { min: 480 },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.value.srcObject = stream;
        videoElement.value.play();

        isCameraActive.value = true;
        showToast(
          "info",
          "Camera đã sẵn sàng, hãy đặt barcode vào vùng quét..."
        );

        codeReader.value.decodeFromVideoDevice(
          undefined,
          videoElement.value,
          (result, error) => {
            if (result) {
              const scanRect = scanRegion.value.getBoundingClientRect();
              const videoRect = videoElement.value.getBoundingClientRect();
              const resultPoints = result.getResultPoints();

              // Kiểm tra xem barcode có nằm trong vùng quét không
              const isInScanRegion = resultPoints.some((point) => {
                const x =
                  (point.getX() / videoRect.width) * videoRect.width +
                  videoRect.left;
                const y =
                  (point.getY() / videoRect.height) * videoRect.height +
                  videoRect.top;
                return (
                  x >= scanRect.left &&
                  x <= scanRect.right &&
                  y >= scanRect.top &&
                  y <= scanRect.bottom
                );
              });

              if (isInScanRegion) {
                scannedCode.value = result.getText();
                console.log("Mã quét thành công:", scannedCode.value);
                handleScan(scannedCode.value);
                cleanupZXing();
              }
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error("Lỗi quét:", error);
              showToast("error", `Lỗi quét: ${error.message}`);
              cleanupZXing();
            }
          }
        );
      } catch (err) {
        console.error("Lỗi khi truy cập camera:", err);
        scanError.value = err.message || "Không thể truy cập camera";
        showToast("error", scanError.value);
        cleanupZXing();
      }
    };

    const closeScanModal = () => {
      showScanModal.value = false;
      cleanupZXing();
    };

    const cleanupZXing = () => {
      if (isCameraActive.value && codeReader.value) {
        console.log("Dừng quét và giải phóng camera...");
        codeReader.value.reset();
        isCameraActive.value = false;
        if (videoElement.value && videoElement.value.srcObject) {
          const stream = videoElement.value.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          videoElement.value.srcObject = null;
        }
      }
    };

    const handleScan = async (code) => {
      if (!code || isScanning.value) {
        console.warn("Mã không hợp lệ hoặc đang quét:", code);
        return;
      }

      isScanning.value = true;
      scanError.value = "";
      try {
        console.log("Gửi yêu cầu API với mã:", code);
        const response = await apiService.get(
            `/api/products/by-barcode-or-imei?code=${encodeURIComponent(code)}`
        );
        console.log("API Response:", response.data);
        const product = response.data;

        if (!product || !product.chiTietSanPhamId) {
          throw new Error(
              "Dữ liệu từ API không hợp lệ hoặc thiếu chiTietSanPhamId"
          );
        }

        const productResponse = await apiService.get(
            `/api/chi-tiet-san-pham/id?sanPhamId=${
                product.chiTietSanPhamId
            }&mauSac=${encodeURIComponent(
                product.mauSac || ""
            )}&dungLuongRam=${encodeURIComponent(
                product.ram || ""
            )}&dungLuongBoNhoTrong=${encodeURIComponent(
                product.boNhoTrong || ""
            )}`
        );
        const chiTietSanPhamId = productResponse.data;

        // Kiểm tra thay đổi giá
        if (product.giaBanBanDau !== product.giaBan) {

          const ghiChuGia = `Giá sản phẩm ${
            product.tenSanPham
          } đã thay đổi thành ${formatPrice(
            product.giaBan

          const ghiChuGia = `Giá sản phẩm ${product.tenSanPham} đã thay đổi thành ${formatPrice(
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
          originalPrice: Number(item.giaBanGoc) || Number(item.giaBan) || 0,
          currentPrice: Number(item.giaBan) || 0,
          quantity: item.soLuong,
          ghiChuGia: item.ghiChuGia || "",
        }));

        const invoice = pendingInvoices.value.find(
            (inv) => inv.id === activeInvoiceId.value
        );
        if (invoice) invoice.items = cartItems.value;

        await apiService.put(`/api/chi-tiet-san-pham/update-imei-status`, {
          imei: product.maImel,
          deleted: true,
        });

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
        console.error("Lỗi chi tiết:", error);
        scanError.value =
            error.response?.status === 404
                ? "Không tìm thấy sản phẩm hoặc IMEI tương ứng với mã quét"
                : error.response?.data?.message || "Lỗi khi quét barcode/IMEI";
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
      tienChuyenKhoan.value = 0;
      tienMat.value = 0;

      if (method === "transfer" || method === "both") {
        showPaymentProviderModal.value = true;
      } else {
        showPaymentProviderModal.value = false;
        selectedPaymentProvider.value = null;
        qrCodeValue.value = "";
        showQRCode.value = false;
      }

      console.log("Payment Method:", paymentMethod.value);
      console.log("Selected Provider:", selectedPaymentProvider.value);
      console.log("QR Value:", qrCodeValue.value);
    };

    const selectPaymentProvider = (provider) => {
      selectedPaymentProvider.value = provider;
      showPaymentProviderModal.value = false;

      const amount =
        paymentMethod.value === "transfer"
          ? totalPayment.value || 0
          : tienChuyenKhoan.value || 0;
      qrCodeAmount.value = amount;

      if (provider === "vietqr") {
        bankInfo.value = {
          bankName: "VietQR",
          accountNumber: "1234567890",
          accountHolder: "Your Company Name",
          amount: amount,
          description: `Thanh toán hóa đơn ${
            activeInvoiceId.value || "HDXXX"
          } qua VietQR`,
        };
        qrCodeValue.value = `vietqr://pay?account=${
          bankInfo.value.accountNumber
        }&amount=${bankInfo.value.amount}&desc=${encodeURIComponent(
          bankInfo.value.description
        )}`;
        showQRCode.value = true;
      } else {
        qrCodeValue.value = ""; // Không tạo QR cho VNPAY
        showQRCode.value = false;
      }
      console.log("Calculated Amount:", amount); // Debug giá trị amount
    };

    const closePaymentProviderModal = () => {
      showPaymentProviderModal.value = false;
      selectedPaymentProvider.value = null;
      qrCodeValue.value = "";
      showQRCode.value = false;
    };

    // Trong hàm ThanhToan
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
        // Logic kiểm tra giá sản phẩm và mã giảm giá (giữ nguyên)
        const priceChangeMessages = [];
        const priceCheckErrors = [];
        for (const item of cartItems.value) {
          try {
            const productResponse = await apiService.get(
                `/api/san-pham?page=0&size=1&keyword=${encodeURIComponent(
                    item.name
                )}`
            );
            const productData = productResponse.data.content[0];
            if (productData && productData.giaBanBanDau !== item.currentPrice) {
              priceChangeMessages.push(
                `Giá sản phẩm ${item.name} đã thay đổi thành ${formatPrice(
                  productData.giaBan
                )} từ giá ban đầu ${formatPrice(productData.giaBanBanDau)}`
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

        // Logic kiểm tra và áp dụng mã giảm giá (giữ nguyên)
        await fetchPGG();
        if (customer.value?.id) {
          const pggResult = await getPhieuGiamGiaByKhachHang(customer.value.id);
          if (pggResult.success && Array.isArray(pggResult.data)) {
            privateDiscountCodes.value = pggResult.data
                .filter(
                    (item) =>
                        item.idPhieuGiamGia?.riengTu === true &&
                        item.idPhieuGiamGia?.trangThai === true &&
                        isValidDiscount(item.idPhieuGiamGia?.ngayKetThuc)
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
                }));
          }
        }

        if (selectedDiscount.value) {
          const result = await validateDiscount(
              selectedDiscount.value.code,
              customer.value?.id || null
          );
          if (
              !result.success ||
              !result.data ||
              !isValidDiscount(result.data.ngayKetThuc) ||
              result.data.trangThai === false
          ) {
            showToast(
                "error",
                `Mã giảm giá ${selectedDiscount.value.code} đã hết hiệu lực hoặc không còn hoạt động. Vui lòng chọn mã khác hoặc tiếp tục thanh toán mà không sử dụng mã giảm giá.`
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
                  )}) của mã giảm giá ${
                      selectedDiscount.value.code
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
          const result = await validateDiscount(
              code.code,
              customer.value?.id || null
          );
          if (
              result.success &&
              result.data &&
              result.data.trangThai === true &&
              isValidDiscount(result.data.ngayKetThuc)
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
            const orderInfo = `Thanh toán hóa đơn ${
                activeInvoiceId.value || "HDXXX"
            }`;
            const amountToSend = totalPayment.value || 100000;
            console.log("Sending amount:", amountToSend);

            // Tạo hoaDonRequest để lưu tạm
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
                  phuongThucThanhToanId: 2, // VNPay
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

            // Lưu thông tin hóa đơn vào localStorage
            localStorage.setItem(
              "pendingHoaDon",
              JSON.stringify({
                idHD: activeInvoiceId.value,
                hoaDonRequest,
              })
            );

            const amountToSend = Math.round(totalPayment.value) || 100000;
            console.log("Sending amount:", amountToSend);
            const params = new URLSearchParams();
            params.append("amount", amountToSend.toString());
            params.append("orderInfo", orderInfo);

            const response = await apiService.post(
                "/api/payment/create",
                params.toString(),
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
            );
            window.location.href = response.data; // Chuyển hướng tới VNPay
            window.location.href = response.data;
          } catch (error) {
            showToast(
                "error",
                `Lỗi khi tạo thanh toán VNPay: ${error.message}`
            );
            console.error("Error details:", error);
          }
        } else {
          await createOrder();
        }
      } catch (error) {
        showToast(
            "error",
            `Lỗi khi thanh toán: ${
                error.response?.data?.message || error.message
            }`
        );
        console.error("Error details:", error);
      }
    };

    const createOrder = async (
      idHD = activeInvoiceId.value,
      hoaDonRequest = null
    ) => {

    const createOrder = async () => {
      isCreatingOrder.value = true;
      try {
        // Nếu không có hoaDonRequest (trường hợp thông thường), tạo mới từ trạng thái hiện tại
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
            return hinhThucThanhToan;
          })(),
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
          hinhThucThanhToan,
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
            giaBan: item.currentPrice, // Sử dụng currentPrice
            ghiChuGia: item.ghiChuGia || "",
          })),
        };

        console.log("hoaDonRequest:", JSON.stringify(requestBody, null, 2));
        const response = await apiService.post(
          `/api/thanh-toan/${idHD}`,
          requestBody
            `/api/thanh-toan/${activeInvoiceId.value}`,
            hoaDonRequest
        );
        const invoiceId = response.data.id || idHD;

        // Cập nhật trạng thái giao diện
        pendingInvoices.value = pendingInvoices.value.filter(
          (inv) => inv.id !== idHD
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

        // Hiển thị thông báo thành công
        showToast(
            "success",
            "Thanh toán thành công, chuẩn bị hiện hóa đơn chi tiết sau vài giây"
        );
        resetNotification();

        // Chuyển hướng đến trang chi tiết hóa đơn
        setTimeout(() => {
          router.push(`/hoaDon/${invoiceId}/detail`);
        }, 1000);
      } catch (error) {
        // Xử lý lỗi
        const errorMessage = error.response?.data?.message || error.message;
        showToast("error", `Lỗi khi thanh toán: ${errorMessage}`);
        console.error("Error details:", error);
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

    // Trong phần updateShippingFee (thay thế hàm hiện có)
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
        // Giữ giá trị phí vận chuyển từ input
        showToast(
          "success",
          `Đã cập nhật phí vận chuyển: ${formatPrice(shippingFee.value)}`
        );
      } catch (error) {
        console.error("Lỗi khi tính phí vận chuyển:", error);
        shippingFee.value = 0;
        showToast("error", "Lỗi khi tính phí vận chuyển");
      }
    };

    // Initialize data
    onMounted(async () => {
      try {
        // Giữ nguyên logic khởi tạo dữ liệu hiện có
        await fetchPGG();
        fetchPendingInvoices();
        fetchProducts();
        fetchLocations();
        await applyBestDiscount(); // Áp dụng PGG tốt nhất khi khởi tạo

        // Xử lý kết quả trả về từ VNPay
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("vnp_TransactionStatus")) {
          try {
            // Gọi endpoint để kiểm tra trạng thái giao dịch VNPay
            const response = await apiService.get(
              "/api/payment/vnpay-payment",
              {
                params: urlParams,
              }
            );

            if (response.data === "Transaction Successful") {
              // Lấy thông tin hóa đơn từ localStorage
              const pendingHoaDon = JSON.parse(
                localStorage.getItem("pendingHoaDon")
              );
              if (
                pendingHoaDon &&
                pendingHoaDon.idHD &&
                pendingHoaDon.hoaDonRequest
              ) {
                // Gọi createOrder để hoàn tất hóa đơn
                await createOrder(
                  pendingHoaDon.idHD,
                  pendingHoaDon.hoaDonRequest
                );
                localStorage.removeItem("pendingHoaDon"); // Xóa dữ liệu tạm
                // Xóa query parameters khỏi URL để tránh xử lý lại
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
                response.data || "Thanh toán VNPay không thành công"
              );
            }
          } catch (error) {
            showToast(
              "error",
              `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`
            );
            console.error("Error details:", error);
          }
        }
      } catch (error) {
        showToast("error", "Lỗi khi khởi tạo dữ liệu hoặc xử lý thanh toán");
        console.error("Error details:", error);
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
      //confirmPayment,
    };
  },
};
