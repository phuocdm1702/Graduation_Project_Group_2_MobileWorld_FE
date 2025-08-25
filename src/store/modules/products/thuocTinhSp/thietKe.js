import apiService from "../../../../services/api";

// Lấy danh sách thiết kế với phân trang
export const fetchThietKe = (page = 0, size = 10) => {
  return apiService.get('/api/thiet-ke', { params: { page, size } });
};

// Lấy danh sách tất cả thiết kế
export const fetchAllThietKe = () => {
  return apiService.get('/api/thiet-ke/all');
};

// Tìm kiếm thiết kế
export const searchThietKe = (params, page = 0, size = 10) => {
  return apiService.get('/api/thiet-ke/search', { params: { ...params, page, size } });
};

// Thêm mới thiết kế
export const createThietKe = (data) => {
  return apiService.post('/api/thiet-ke', data);
};

// Cập nhật thiết kế
export const updateThietKe = (id, data) => {
  return apiService.put(`/api/thiet-ke/${id}`, data);
};

// Cập nhật trạng thái thiết kế
export const updateThietKeStatus = (id, trangThai) => {
  return apiService.put(`/api/thiet-ke/update-status/${id}`, { trangThai });
};

// Lấy chi tiết thiết kế
export const getThietKeDetail = (id) => {
  return apiService.get(`/api/thiet-ke/${id}`);
};

// Lấy danh sách sản phẩm theo thiết kế
export const getProductsByThietKe = (id, page = 0, size = 10) => {
  return apiService.get(`/api/thiet-ke/${id}/products`, { params: { page, size } });
};

// Xuất danh sách thiết kế
export const exportThietKe = (format = 'excel') => {
  return apiService.get('/api/thiet-ke/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách thiết kế
export const importThietKe = (formData) => {
  return apiService.post('/api/thiet-ke/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};