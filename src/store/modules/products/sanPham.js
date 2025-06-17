import apiService from "../../../services/api";

// Lấy danh sách sản phẩm với phân trang
export const fetchProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham', { params: { page, size } });
};

// Tìm kiếm sản phẩm với từ khóa
export const searchProducts = (keyword, page = 0, size = 10) => {
  return apiService.get('/san-pham/search', { params: { keyword, page, size } });
};

// Tìm kiếm sản phẩm với nhiều bộ lọc
export const searchProductsWithFilters = (filters, page = 0, size = 10) => {
  const params = { ...filters, page, size };
  return apiService.get('/san-pham/search', { params });
};

// Lọc sản phẩm theo nhà sản xuất
export const filterByNhaSanXuat = (idNhaSanXuat, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/nha-san-xuat', { params: { idNhaSanXuat, page, size } });
};

// Lọc sản phẩm theo hệ điều hành
export const filterByHeDieuHanh = (idHeDieuHanh, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/he-dieu-hanh', { params: { idHeDieuHanh, page, size } });
};

// Lọc sản phẩm theo công nghệ màn hình
export const filterByCongNgheManHinh = (idCongNgheManHinh, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/cong-nghe-man-hinh', { params: { idCongNgheManHinh, page, size } });
};

// Lọc sản phẩm theo pin
export const filterByPin = (idPin, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/pin', { params: { idPin, page, size } });
};

// Lọc sản phẩm theo trạng thái tồn kho
export const filterByStockStatus = (inStock, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/stock-status', { params: { inStock, page, size } });
};

// Lọc sản phẩm theo khoảng giá
export const filterByPriceRange = (minPrice, maxPrice, page = 0, size = 10) => {
  return apiService.get('/san-pham/filter/price-range', { params: { minPrice, maxPrice, page, size } });
};

// Lấy chi tiết sản phẩm
export const getProductDetail = (id) => {
  return apiService.get(`/san-pham/${id}`);
};

// Thêm sản phẩm mới
export const addProduct = (data) => {
  return apiService.post('/san-pham/add', data);
};

// Cập nhật sản phẩm
export const updateProduct = (id, data) => {
  return apiService.put(`/san-pham/update/${id}`, data);
};

// Xóa sản phẩm
export const deleteProduct = (id) => {
  return apiService.delete(`/san-pham/${id}`);
};

// Cập nhật trạng thái sản phẩm
export const updateProductStatus = (id, trangThai) => {
  return apiService.put(`/san-pham/update-status/${id}`, { trangThai });
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

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = (categoryId, page = 0, size = 10) => {
  return apiService.get(`/san-pham/category/${categoryId}`, { params: { page, size } });
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/featured', { params: { page, size } });
};

// Lấy sản phẩm mới nhất
export const getLatestProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/latest', { params: { page, size } });
};

// Lấy sản phẩm bán chạy
export const getBestSellingProducts = (page = 0, size = 10) => {
  return apiService.get('/san-pham/best-selling', { params: { page, size } });
};

// Kiểm tra tồn kho sản phẩm
export const checkProductStock = (id) => {
  return apiService.get(`/san-pham/${id}/stock`);
};

// Lấy biến thể sản phẩm
export const getProductVariants = (id) => {
  return apiService.get(`/san-pham/${id}/variants`);
};

// Lấy hình ảnh sản phẩm
export const getProductImages = (id) => {
  return apiService.get(`/san-pham/${id}/images`);
};

// Upload hình ảnh sản phẩm
export const uploadProductImage = (id, formData) => {
  return apiService.post(`/san-pham/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Xóa hình ảnh sản phẩm
export const deleteProductImage = (productId, imageId) => {
  return apiService.delete(`/san-pham/${productId}/images/${imageId}`);
};

// Lấy đánh giá sản phẩm
export const getProductReviews = (id, page = 0, size = 10) => {
  return apiService.get(`/san-pham/${id}/reviews`, { params: { page, size } });
};

// Lấy thống kê sản phẩm
export const getProductStats = () => {
  return apiService.get('/san-pham/stats');
};

// Xuất danh sách sản phẩm
export const exportProducts = (format = 'excel') => {
  return apiService.get('/san-pham/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách sản phẩm
export const importProducts = (formData) => {
  return apiService.post('/san-pham/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};