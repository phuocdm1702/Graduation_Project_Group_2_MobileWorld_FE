import apiService from "../../../../services/api";

// Lấy danh sách CPU với phân trang
export const fetchCpu = (page = 0, size = 10) => {
  return apiService.get('/api/cpu', { params: { page, size } });
};

// Lấy danh sách tất cả CPU
export const fetchAllCpu = () => {
  return apiService.get('/api/cpu/all');
};

// Tìm kiếm CPU
export const searchCpu = (params, page = 0, size = 10) => {
  return apiService.get('/api/cpu/search', { params: { ...params, page, size } });
};

// Thêm mới CPU
export const createCpu = (data) => {
  return apiService.post('/api/cpu', data);
};

// Cập nhật CPU
export const updateCpu = (id, data) => {
  return apiService.put(`/api/cpu/${id}`, data);
};

// Cập nhật trạng thái CPU
export const updateCpuStatus = (id, trangThai) => {
  return apiService.put(`/api/cpu/update-status/${id}`, { trangThai });
};

// Lấy chi tiết CPU
export const getCpuDetail = (id) => {
  return apiService.get(`/api/cpu/${id}`);
};

// Lấy danh sách sản phẩm theo CPU
export const getProductsByCpu = (id, page = 0, size = 10) => {
  return apiService.get(`/api/cpu/${id}/products`, { params: { page, size } });
};

// Xuất danh sách CPU
export const exportCpu = (format = 'excel') => {
  return apiService.get('/api/cpu/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách CPU
export const importCpu = (formData) => {
  return apiService.post('/api/cpu/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};