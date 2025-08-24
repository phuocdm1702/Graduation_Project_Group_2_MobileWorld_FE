import apiService from "../../../../services/api";

// Lấy danh sách GPU với phân trang
export const fetchGpu = (page = 0, size = 10) => {
  return apiService.get('/api/gpu', { params: { page, size } });
};

// Lấy danh sách tất cả GPU
export const fetchAllGpu = () => {
  return apiService.get('/api/gpu/all');
};

// Tìm kiếm GPU
export const searchGpu = (params, page = 0, size = 10) => {
  return apiService.get('/api/gpu/search', { params: { ...params, page, size } });
};

// Thêm mới GPU
export const createGpu = (data) => {
  return apiService.post('/api/gpu', data);
};

// Cập nhật GPU
export const updateGpu = (id, data) => {
  return apiService.put(`/api/gpu/${id}`, data);
};

// Cập nhật trạng thái GPU
export const updateGpuStatus = (id, trangThai) => {
  return apiService.put(`/api/gpu/update-status/${id}`, { trangThai });
};

// Lấy chi tiết GPU
export const getGpuDetail = (id) => {
  return apiService.get(`/api/gpu/${id}`);
};

// Lấy danh sách sản phẩm theo GPU
export const getProductsByGpu = (id, page = 0, size = 10) => {
  return apiService.get(`/api/gpu/${id}/products`, { params: { page, size } });
};

// Xuất danh sách GPU
export const exportGpu = (format = 'excel') => {
  return apiService.get('/api/gpu/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách GPU
export const importGpu = (formData) => {
  return apiService.post('/api/gpu/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};