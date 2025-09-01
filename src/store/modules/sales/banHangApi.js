import apiService from "../../../services/api";
import axios from "axios";


// Tính phí vận chuyển
export const calculateGHNShippingFeeApi = async (shippingData) => {
  try {
    const response = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
      shippingData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': '284962ef-8363-11f0-9fb9-b62928d3d46c',
          'ShopId': '5977063'
        }
      }
    );
    return response.data.data; // Trả về { total, service_fee, ... }
  } catch (error) {
    console.error('Lỗi khi gọi API tính phí GHN:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi tính phí vận chuyển GHN');
  }
};

// Lấy danh sách dịch vụ giao hàng
export const getGHNAvailableServicesApi = async (fromDistrict, toDistrict) => {
  try {
    const response = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
      {
        shop_id: 5977063,
        from_district: fromDistrict,
        to_district: toDistrict
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': '284962ef-8363-11f0-9fb9-b62928d3d46c',
          'ShopId': '5977063'
        }
      }
    );
    return response.data.data; // Trả về [{ service_id, service_type_id, ... }, ...]
  } catch (error) {
    console.error('Lỗi khi lấy dịch vụ GHN:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy dịch vụ GHN');
  }
};

// Invoice-Related APIs
export const fetchPendingInvoicesApi = async () => {
  try {
    const response = await apiService.get("/api/hoa-don-cho");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tải hóa đơn chờ");
  }
};

export const createNewPendingInvoiceApi = async (khachHangId, idNhanVien) => {
  try {
    const requestBody = { khachHangId, idNhanVien };
    const response = await apiService.post("/api/add/tao-hd-cho", requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo hóa đơn mới");
  }
};

export const loadPendingInvoiceApi = async (invoiceId) => {
  try {
    const response = await apiService.get(`/api/gio-hang/data/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tải giỏ hàng");
  }
};

export const cancelInvoiceApi = async (invoiceId) => {
  try {
    await apiService.delete(`/api/xoa-hd-cho/${invoiceId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi hủy hóa đơn");
  }
};

// Product-Related APIs
export const fetchProductsApi = async (page = 0, size = 999999999, keyword = '') => {
  try {
    const params = { page, size };
    if (keyword) {
      params.keyword = keyword;
    }
    const response = await apiService.get("/api/san-pham", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách sản phẩm");
  }
};

export const removeItemApi = async (invoiceId, productId) => {
  try {
    const response = await apiService.delete(
      `/api/gio-hang/xoa?hdId=${invoiceId}&spId=${productId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
  }
};

// IMEI-Related APIs
export const fetchIMEIsApi = async (sanPhamId, mauSac, dungLuongRam, dungLuongBoNhoTrong) => {
  try {
    const response = await apiService.get(
      `/api/san-pham/${sanPhamId}/imeis?mauSac=${encodeURIComponent(mauSac)}&dungLuongRam=${encodeURIComponent(dungLuongRam)}&dungLuongBoNhoTrong=${encodeURIComponent(dungLuongBoNhoTrong)}`
    );
    return response.data.map((imei) => ({ id: imei, imei: imei }));
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách IMEI");
  }
};

export const getProductDetailsByIdApi = async (sanPhamId, mauSac, ram, boNhoTrong) => {
  try {
    const response = await apiService.get(
      `/api/chi-tiet-san-pham/id?sanPhamId=${sanPhamId}&mauSac=${encodeURIComponent(mauSac)}&dungLuongRam=${encodeURIComponent(ram)}&dungLuongBoNhoTrong=${encodeURIComponent(boNhoTrong)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không tìm thấy chi tiết sản phẩm hoặc IMEI khả dụng!");
  }
};

export const addProductToCartApi = async (invoiceId, chiTietGioHangDTO) => {
  try {
    const response = await apiService.post(
      `/api/add/gio-hang?idHD=${invoiceId}`,
      chiTietGioHangDTO
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng");
  }
};

export const deleteIMEIFromCartApi = async (invoiceId, chiTietGioHangDTO) => {
  try {
    const response = await apiService.post(
      `/api/add/gio-hang?idHD=${invoiceId}`,
      chiTietGioHangDTO
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi xóa IMEI");
  }
};

export const updateIMEIStatusApi = async (imei, deleted) => {
  try {
    await apiService.put(`/api/chi-tiet-san-pham/update-imei-status`, { imei, deleted });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái IMEI");
  }
};
// Trong banHangApi.js
export const getAllAddressesByKhachHangIdApi = async (idKhachHang) => {
  try {
    const response = await apiService.get(`/khach-hang/getByKhachHang/${idKhachHang}`);
    const validAddresses = response.data.filter(addr => !addr.deleted);
    console.log("API Response:", response.data); // Log toàn bộ dữ liệu trả về
    console.log("Valid addresses:", validAddresses); // Log danh sách đã lọc
    return { success: true, data: validAddresses };
  } catch (error) {
    console.error("Error fetching addresses:", error.response?.data || error.message);
    return {
      success: true,
      message: error.response?.data?.error || "Lỗi khi tải danh sách địa chỉ khách hàng"
    };
  }
};

// Customer-Related APIs
export const searchCustomersApi = async (query, hoaDonId) => {
  try {
    const response = await apiService.get("/khach-hang/searchKhachHangHD", {
      params: {
        query,  // ✅ để nguyên, axios sẽ encode 1 lần
        hoaDonId
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || "Không tìm thấy khách hàng hoặc hóa đơn không hợp lệ"
    };
  }
};


export const updatePhieuGiamGiaApi = async (hoaDonId, idPhieuGiamGia) => {
  try {
    const response = await apiService.put("/api/updatePhieuGiamGia", null, {
      params: {
        hoaDonId,
        idPhieuGiamGia
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || "Lỗi khi cập nhật phiếu giảm giá"
    };
  }
};

export const getKhachHangByIdApi = async (id) => {
  try {
    const response = await axios.get("/khach-hang/getById", {
      params: { id },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || "Không tìm thấy khách hàng",
    };
  }
};

export const addCustomerApi = async (customerData) => {
  try {
    const response = await apiService.post("/khach-hang/add-Bh", customerData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || "Lỗi không thêm đc khách hàng" };
  }
};

export const getPhieuGiamGiaByKhachHangApi = async (idKhachHang) => {
  try {
    const response = await apiService.get(`/api/by-khach-hang/${idKhachHang}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || "Không lấy được danh sách phiếu giảm giá" };
  }
};

// Location APIs
export const fetchProvincesApi = async () => {
  try {
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    return response.data.map((t) => ({ code: t.code, name: t.name }));
  } catch (error) {
    throw new Error("Lỗi khi tải danh sách tỉnh/thành phố");
  }
};

export const fetchDistrictsApi = async (provinceCode) => {
  try {
    const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    return response.data.districts.map((q) => ({ code: q.code, name: q.name }));
  } catch (error) {
    throw new Error("Lỗi khi tải danh sách quận/huyện");
  }
};

export const fetchWardsApi = async (districtCode) => {
  try {
    const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    return response.data.wards.map((p) => ({ code: p.code, name: p.name }));
  } catch (error) {
    throw new Error("Lỗi khi tải danh sách phường/xã");
  }
};

// Discount-Related APIs
export const fetchPGGApi = async () => {
  try {
    const response = await apiService.get("/api/PGG-all");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách mã giảm giá");
  }
};

export const validateDiscountApi = async (ma, totalPrice, khachHangId) => {
  try {
    const response = await apiService.get("/api/phieu-giam-gia/validate-at-checkout", {
      params: { ma, totalPrice, khachHangId },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi kiểm tra mã giảm giá" };
  }
};

// Payment-Related APIs
export const createPaymentApi = async (amount, orderInfo, returnUrl) => {
  try {
    const params = new URLSearchParams();
    params.append("amount", amount.toString());
    params.append("orderInfo", orderInfo);
    params.append("returnUrl", returnUrl);
    const response = await apiService.post("/api/payment/create", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán VNPay");
  }
};

export const completeOrderApi = async (invoiceId, requestBody) => {
  try {
    const response = await apiService.post(`/api/thanh-toan/${invoiceId}`, requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi hoàn tất đơn hàng");
  }
};

export const checkVNPayPaymentStatusApi = async (urlParams) => {
  try {
    const response = await apiService.get("/api/payment/vnpay-payment", { params: urlParams });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi kiểm tra trạng thái thanh toán VNPay");
  }
};

// Momo Payment APIs
export const createMomoPaymentApi = async (amount, orderInfo, returnUrl, notifyUrl) => {
  try {
    const params = new URLSearchParams();
    params.append("amount", amount.toString());
    params.append("orderInfo", orderInfo);
    params.append("returnUrl", returnUrl);
    params.append("notifyUrl", notifyUrl);
    const response = await apiService.post("/api/momo/create-payment", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán Momo");
  }
};

export const checkMomoPaymentStatusApi = async (urlParams) => {
  try {
    // Momo's return endpoint on backend returns a string, not JSON, so we handle it as text
    const response = await apiService.get("/api/payment/momo/return", { params: urlParams, responseType: 'text' });
    // Parse the string response to determine status
    if (response.data.includes("successful")) {
      return { status: "success", message: response.data };
    } else if (response.data.includes("failed")) {
      return { status: "failed", message: response.data };
    } else {
      return { status: "error", message: response.data };
    }
  } catch (error) {
    return { status: "error", message: error.response?.data || error.message || "Lỗi khi kiểm tra trạng thái thanh toán Momo" };
  }
};

// New API: Add product to cart by barcode/IMEI
export const addProductByBarcodeOrImeiApi = async (idHD, code) => {
  try {
    const response = await apiService.post(`/api/products/by-barcode-or-imei/add-to-cart?idHD=${idHD}&code=${code}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi thêm sản phẩm từ IMEI vào giỏ hàng");
  }
};