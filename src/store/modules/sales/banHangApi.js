import apiService from "../../../services/api";
import axios from "axios";

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

// Customer-Related APIs
export const searchCustomersApi = async (query, hoaDonId) => {
  try {
    const response = await apiService.get("/khach-hang/searchKhachHangHD", {
      params: {
        query: encodeURIComponent(query),
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

export const addCustomerApi = async (customerData) => {
  try {
    const response = await apiService.post("/khach-hang/add-Bh", customerData);
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi thêm khách hàng");
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
export const createPaymentApi = async (amount, orderInfo) => {
  try {
    const params = new URLSearchParams();
    params.append("amount", amount.toString());
    params.append("orderInfo", orderInfo);
    params.append("returnUrl", "http://localhost:5173/banHang");
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
