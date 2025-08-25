import apiService from "../../../../services/api";

// Lấy danh sách công nghệ mạng với phân trang
export const fetchCongNgheMang = (page = 0, size = 10) => {
  return apiService.get('/api/cong-nghe-mang', { params: { page, size } });
};

// Lấy danh sách tất cả công nghệ mạng
export const fetchAllCongNgheMang = () => {
  return apiService.get('/api/cong-nghe-mang/all');
};

// Tìm kiếm công nghệ mạng
export const searchCongNgheMang = (params, page = 0, size = 10) => {
  return apiService.get('/api/cong-nghe-mang/search', { params: { ...params, page, size } });
};

// Thêm mới công nghệ mạng
export const createCongNgheMang = (data) => {
  return apiService.post('/api/cong-nghe-mang', data);
};

// Cập nhật công nghệ mạng
export const updateCongNgheMang = (id, data) => {
  return apiService.put(`/api/cong-nghe-mang/${id}`, data);
};

// Cập nhật trạng thái công nghệ mạng
export const updateCongNgheMangStatus = (id, trangThai) => {
  return apiService.put(`/api/cong-nghe-mang/update-status/${id}`, { trangThai });
};

// Lấy chi tiết công nghệ mạng
export const getCongNgheMangDetail = (id) => {
  return apiService.get(`/api/cong-nghe-mang/${id}`);
};

// Lấy danh sách sản phẩm theo công nghệ mạng
export const getProductsByCongNgheMang = (id, page = 0, size = 10) => {
  return apiService.get(`/api/cong-nghe-mang/${id}/products`, { params: { page, size } });
};

// Xuất danh sách công nghệ mạng
export const exportCongNgheMang = (format = 'excel') => {
  return apiService.get('/api/cong-nghe-mang/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách công nghệ mạng
export const importCongNgheMang = (formData) => {
  return apiService.post('/api/cong-nghe-mang/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};