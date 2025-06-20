import { ref, computed, onMounted, nextTick } from "vue";
import apiService from "../../../services/api";
import HeaderCard from "@/components/common/HeaderCard.vue";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";

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
    const currentPage = ref(0);
    const totalPages = ref(1);

    // Sample data
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
      { text: "Đơn giá", value: "priceInfo" }, // Changed from "price"
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
        formatter: (value) => `${value.toLocaleString()} đ`,
      },
      { value: "actions", text: "Thao tác", cellSlot: "productActionsSlot" },
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
          (sum, item) => sum + Number(item.originalPrice) * item.quantity,
          0
      );
    });
    const totalPayment = computed(() => {
      return totalPrice.value - discount.value;
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

    // Utility Methods
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

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
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
          currentPrice: Number(item.giaBan), // Initially same as original
          quantity: item.soLuong,
        }));
        const index = pendingInvoices.value.findIndex(
            (inv) => inv.id === invoice.id
        );
        if (index !== -1) {
          pendingInvoices.value[index].items = cartItems.value;
        }
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
        const latestPrice = productResponse.data.content[0]?.giaBan || selectedProduct.value.giaBan;

        const chiTietGioHangDTO = {
          chiTietSanPhamId: chiTietSanPhamId,
          soLuong: selectedIMEIs.value.length,
          maImel: selectedIMEIs.value.join(", "),
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
        customer.value = { id: null, name: "", phone: "", city: "", district: "", ward: "", address: "" };
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
        } else {
          selectedCustomer.value = null;
          customer.value = { id: null, name: "", phone: "", city: "", district: "", ward: "", address: "" };
          privateDiscountCodes.value = [];
          setTimeout(() => {
            showToast("warning", "Không tìm thấy khách hàng");
          }, 3000);
        }
      } catch (error) {
        selectedCustomer.value = null;
        customer.value = { id: null, name: "", phone: "", city: "", district: "", ward: "", address: "" };
        privateDiscountCodes.value = [];
        showToast("error", "Đã xảy ra lỗi khi tìm kiếm khách hàng");
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

      if (!newCustomer.value.phone || !newCustomer.value.phone.trim()) {
        showToast("error", "Vui lòng nhập số điện thoại");
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newCustomer.value.phone.trim())) {
        showToast("error", "Số điện thoại phải có đúng 10 chữ số");
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
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        provinces.value = response.data.map((t) => ({
          code: t.code,
          name: t.name,
        }));
        showToast("success", "Đã tải danh sách tỉnh/thành phố");
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
        wards.value = []; // Reset wards khi chọn tỉnh mới
        showToast("success", "Đã tải danh sách quận/huyện");
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
        showToast("success", "Đã tải danh sách phường/xã");
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

    // Discount-Related Methods
    const fetchDiscountCodes = async () => {
      try {
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

    const fetchPGG = async () => {
      try {
        const response = await apiService.get("/api/PGG-all");
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Lỗi khi lấy danh sách PGG", error);
        showToast("error", "Lỗi khi tải danh sách mã giảm giá");
        return [];
      }
    };

    const applyPrivateDiscount = () => {
      if (selectedPrivateDiscount.value) {
        discount.value = selectedPrivateDiscount.value.value;
        showToast(
            "success",
            `Áp dụng mã giảm giá ${selectedPrivateDiscount.value.code} thành công`
        );
      }
    };

    const applyPublicDiscount = () => {
      if (selectedPublicDiscount.value) {
        discount.value = selectedPublicDiscount.value.value;
        showToast(
            "success",
            `Áp dụng mã giảm giá ${selectedPublicDiscount.value.code} thành công`
        );
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

    const ThanhToan = () => {
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
      createOrder();
    };

    const createOrder = async () => {
      isCreatingOrder.value = true;
      try {
        const hinhThucThanhToan = [];
        if (paymentMethod.value === "cash") {
          hinhThucThanhToan.push({
            phuongThucThanhToanId: 1,
            tienMat: totalPrice.value - discount.value,
            tienChuyenKhoan: 0,
          });
        } else if (paymentMethod.value === "transfer") {
          hinhThucThanhToan.push({
            phuongThucThanhToanId: 2,
            tienMat: 0,
            tienChuyenKhoan: totalPrice.value - discount.value,
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
              receiver.value && isDelivery.value
                  ? {
                    thanhPho: receiver.value.city,
                    quan: receiver.value.district,
                    phuong: receiver.value.ward,
                    diaChiCuThe: receiver.value.address,
                  }
                  : null,
          hinhThucThanhToan,
          idPhieuGiamGia:
              selectedPrivateDiscount.value?.id ||
              selectedPublicDiscount.value?.id ||
              null,
          giamGia: discount.value,
          phiVanChuyen: isDelivery.value ? 0 : null,
          loaiDon: isDelivery.value ? "online" : "trực tiếp",
          chiTietGioHang: cartItems.value.map(item => ({
            chiTietSanPhamId: item.id,
            soLuong: item.quantity,
            maImel: item.imei,
            giaBan: item.originalPrice, // Use originalPrice for order
          })),
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
        receiver.value = {
          name: "",
          phone: "",
          city: "",
          district: "",
          ward: "",
          address: "",
        };
        discount.value = 0;
        selectedPrivateDiscount.value = null;
        selectedPublicDiscount.value = null;
        showToast("success", "Thanh toán thành công");
        resetNotification();
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

    // Initialize data
    onMounted(async () => {
      try {
        const response = await fetchPGG();
        if (Array.isArray(response)) {
          publicDiscountCodes.value = response
              .filter(
                  (item) =>
                      item.riengTu === false && isValidDiscount(item.ngayKetThuc)
              )
              .map((item, index) => ({
                id: item.id || index + 1,
                code: item.ma || "Unknown",
                value: item.soTienGiamToiDa || 0,
                percent: item.phanTramGiamGia || 0,
                minOrder: item.hoaDonToiThieu || 0,
                expiry: formatDate(item.ngayKetThuc),
                rawExpiry: item.ngayKetThuc,
              }));
          if (publicDiscountCodes.value.length > 0) {
            showToast(
                "success",
                `Đã tải ${publicDiscountCodes.value.length} mã giảm giá công khai`
            );
          } else {
            showToast("warning", "Không có mã giảm giá công khai còn hiệu lực");
          }
        } else {
          showToast("error", "Dữ liệu mã giảm giá không đúng định dạng");
        }
      } catch (error) {
        showToast("error", "Lỗi khi tải danh sách mã giảm giá công khai");
      }
      fetchPendingInvoices();
      fetchProducts();
      fetchDiscountCodes();
      fetchLocations();
    });

    return {
      // State
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
      activeTab,
      qrCodeValue,
      qrCodeAmount,
      showQRCode,
      // Utility Methods
      showToast,
      showConfirm,
      resetNotification,
      formatPrice,
      formatDate,
      isValidDiscount,
      // Debounced Search
      debouncedInvoiceSearch,
      debouncedProductSearch,
      debouncedCustomerSearch,
      // Invoice-Related
      fetchPendingInvoices,
      createNewPendingInvoice,
      loadPendingInvoice,
      confirmCancelInvoice,
      cancelInvoice,
      // Product-Related
      fetchProducts,
      handleScroll,
      removeItem,
      // IMEI-Related
      showIMEIList,
      showIMEIModalForItem,
      closeIMEIModal,
      closeCartIMEIModal,
      handleIMEISelection,
      removeIMEI,
      addProductWithIMEIs,
      deleteIMEI,
      // Customer-Related
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
      // Discount-Related
      fetchDiscountCodes,
      fetchPGG,
      applyPrivateDiscount,
      applyPublicDiscount,
      // Payment-Related
      selectPayment,
      generateQRCode,
      scanQR,
      ThanhToan,
      createOrder,
    };
  },
};