// sanPham.js
import apiService from "../../../services/api";

// Lấy danh sách sản phẩm với phân trang
export const fetchProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham', { params: { page, size } });
};

// Lấy chi tiết sản phẩm
export const getProductDetail = (id) => {
  return apiService.get(`/san-pham/${id}`);
};

// Lấy biến thể sản phẩm
export const getProductVariants = (id) => {
  return apiService.get(`/api/chi-tiet-san-pham/san-pham/${id}`);
};

// Lấy danh sách màu sắc
export const fetchMauSac = () => {
  return apiService.get('/api/mau-sac/all');
};

// Lấy danh sách RAM
export const fetchRam = () => {
  return apiService.get('/api/ram/all');
};

// Lấy danh sách bộ nhớ trong
export const fetchBoNhoTrong = () => {
  return apiService.get('/api/bo-nho-trong/all');
};

// Lấy danh sách nhà sản xuất
export const fetchNhaSanXuat = () => {
  return apiService.get('/api/nha-san-xuat/all');
};

// Lấy danh sách hệ điều hành
export const fetchHeDieuHanh = () => {
  return apiService.get('/api/he-dieu-hanh/all');
};

// Lấy danh sách công nghệ màn hình
export const fetchCongNgheManHinh = () => {
  return apiService.get('/api/cong-nghe-man-hinh/all');
};

// Lấy danh sách pin
export const fetchPin = () => {
  return apiService.get('/api/pin/all');
};

// Lấy danh sách CPU
export const fetchCpu = () => {
  return apiService.get('/api/cpu/all');
};

// Lấy danh sách GPU
export const fetchGpu = () => {
  return apiService.get('/api/gpu/all');
};

// Lấy danh sách cụm camera
export const fetchCumCamera = () => {
  return apiService.get('/api/cum-camera/all');
};

// Lấy danh sách thiết kế
export const fetchThietKe = () => {
  return apiService.get('/api/thiet-ke/all');
};

// Lấy danh sách SIM
export const fetchSim = () => {
  return apiService.get('/api/sim/all');
};

// Lấy danh sách công nghệ mạng
export const fetchCongNgheMang = () => {
  return apiService.get('/api/cong-nghe-mang/all');
};

// Lấy danh sách chỉ số kháng bụi và nước
export const fetchChiSoKhangBuiVaNuoc = () => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc/all');
};

// Lấy danh sách hỗ trợ bộ nhớ ngoài
export const fetchHoTroBoNhoNgoai = () => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai/all');
};

// Lấy danh sách công nghệ sạc
export const fetchHoTroCongNgheSac = () => {
  return apiService.get('/api/ho-tro-cong-nghe-sac/all');
};

// Các hàm tìm kiếm và lọc
export const searchProducts = (keyword, page = 0, size = 10) => {
  return apiService.get('/san-pham/search', { params: { keyword, page, size } });
};

export const searchProductsWithFilters = (filters, page = 0, size = 10) => {
  const params = { ...filters, page, size };
  return apiService.get('/san-pham/search', { params });
};

export const filterByNhaSanXuat = (idNhaSanXuat, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/nha-san-xuat', { params: { idNhaSanXuat, page, size } });
};

export const filterByHeDieuHanh = (idHeDieuHanh, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/he-dieu-hanh', { params: { idHeDieuHanh, page, size } });
};

export const filterByCongNgheManHinh = (idCongNgheManHinh, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/cong-nghe-man-hinh', { params: { idCongNgheManHinh, page, size } });
};

export const filterByPin = (idPin, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/pin', { params: { idPin, page, size } });
};

export const filterByStockStatus = (inStock, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/stock-status', { params: { inStock, page, size } });
};

export const filterByPriceRange = (minPrice, maxPrice, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/price-range', { params: { minPrice, maxPrice, page, size } });
};

export const addProduct = (data) => {
  return apiService.post('/san-pham/add', data);
};

export const updateProduct = (id, data) => {
  return apiService.put(`/san-pham/${id}`, data);
};

export const deleteProduct = (id) => {
  return apiService.delete(`/san-pham/${id}`);
};

export const updateProductStatus = (id, trangThai) => {
  return apiService.put(`/san-pham/update-status/${id}`, { trangThai });
};

export const getProductsByCategory = (categoryId, page = 0, size = 10) => {
  return apiService.get(`/san-pham/category/${categoryId}`, { params: { page, size } });
};

export const getFeaturedProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/featured', { params: { page, size } });
};

export const getLatestProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/latest', { params: { page, size } });
};

export const getBestSellingProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/best-selling', { params: { page, size } });
};

export const checkProductStock = (id) => {
  return apiService.get(`/san-pham/${id}/stock`);
};

export const getProductImages = (id) => {
  return apiService.get(`/san-pham/${id}/images`);
};

export const uploadProductImage = (id, formData) => {
  return apiService.post(`/san-pham/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProductImage = (productId, imageId) => {
  return apiService.delete(`/san-pham/${productId}/images/${imageId}`);
};

export const getProductReviews = (id, page = 0, size = 10) => {
  return apiService.get(`/san-pham/${id}/reviews`, { params: { page, size } });
};

export const getProductStats = () => {
  return apiService.get('/san-pham/stats');
};

export const exportProducts = (format = 'excel') => {
  return apiService.get('/san-pham/export', { 
    params: { format },
    responseType: 'blob'
  });
};

export const importProducts = (formData) => {
  return apiService.post('/san-pham/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};