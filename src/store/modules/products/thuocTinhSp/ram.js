import apiService from "../../../../services/api";

// Lấy danh sách RAM với phân trang
export const fetchRam = (page = 0, size = 10) => {
  return apiService.get('/api/ram', { params: { page, size } });
};

// Lấy danh sách tất cả RAM
export const fetchAllRam = () => {
  return apiService.get('/api/ram/all');
};

// Tìm kiếm RAM
export const searchRam = (params, page = 0, size = 10) => {
  return apiService.get('/api/ram/search', { params: { ...params, page, size } });
};

// Thêm mới RAM
export const createRam = (data) => {
  return apiService.post('/api/ram', data);
};

// Cập nhật RAM
export const updateRam = (id, data) => {
  return apiService.put(`/api/ram/${id}`, data);
};

// Cập nhật trạng thái RAM
export const updateRamStatus = (id, trangThai) => {
  return apiService.put(`/api/ram/update-status/${id}`, { trangThai });
};

// Lấy chi tiết RAM
export const getRamDetail = (id) => {
  return apiService.get(`/api/ram/${id}`);
};

// Lấy danh sách sản phẩm theo RAM
export const getProductsByRam = (id, page = 0, size = 10) => {
  return apiService.get(`/api/ram/${id}/products`, { params: { page, size } });
};

// Xuất danh sách RAM
export const exportRam = (format = 'excel') => {
  return apiService.get('/api/ram/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách RAM
export const importRam = (formData) => {
  return apiService.post('/api/ram/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};