import apiService from "../../../../services/api";

// Lấy danh sách màu sắc với phân trang
export const fetchMauSac = (page = 0, size = 10) => {
  return apiService.get('/api/mau-sac', { params: { page, size } });
};

// Lấy danh sách tất cả màu sắc
export const fetchAllMauSac = () => {
  return apiService.get('/api/mau-sac/all');
};

// Tìm kiếm màu sắc
export const searchMauSac = (params, page = 0, size = 10) => {
  return apiService.get('/api/mau-sac/search', { params: { ...params, page, size } });
};

// Thêm mới màu sắc
export const createMauSac = (data) => {
  return apiService.post('/api/mau-sac', data);
};

// Cập nhật màu sắc
export const updateMauSac = (id, data) => {
  return apiService.put(`/api/mau-sac/${id}`, data);
};

// Cập nhật trạng thái màu sắc
export const updateMauSacStatus = (id, trangThai) => {
  return apiService.put(`/api/mau-sac/update-status/${id}`, { trangThai });
};

// Lấy chi tiết màu sắc
export const getMauSacDetail = (id) => {
  return apiService.get(`/api/mau-sac/${id}`);
};

// Lấy danh sách sản phẩm theo màu sắc
export const getProductsByMauSac = (id, page = 0, size = 10) => {
  return apiService.get(`/api/mau-sac/${id}/products`, { params: { page, size } });
};

// Xuất danh sách màu sắc
export const exportMauSac = (format = 'excel') => {
  return apiService.get('/api/mau-sac/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách màu sắc
export const importMauSac = (formData) => {
  return apiService.post('/api/mau-sac/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};