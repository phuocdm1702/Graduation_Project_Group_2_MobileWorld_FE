import apiService from "../../../../services/api";

// Lấy danh sách pin với phân trang
export const fetchPin = (page = 0, size = 10) => {
  return apiService.get('/api/pin', { params: { page, size } });
};

// Lấy danh sách tất cả pin
export const fetchAllPin = () => {
  return apiService.get('/api/pin/all');
};

// Tìm kiếm pin
export const searchPin = (params, page = 0, size = 10) => {
  return apiService.get('/api/pin/search', { params: { ...params, page, size } });
};

// Thêm mới pin
export const createPin = (data) => {
  return apiService.post('/api/pin', data);
};

// Cập nhật pin
export const updatePin = (id, data) => {
  return apiService.put(`/api/pin/${id}`, data);
};

// Cập nhật trạng thái pin
export const updatePinStatus = (id, trangThai) => {
  return apiService.put(`/api/pin/update-status/${id}`, { trangThai });
};

// Lấy chi tiết pin
export const getPinDetail = (id) => {
  return apiService.get(`/api/pin/${id}`);
};

// Lấy danh sách sản phẩm theo pin
export const getProductsByPin = (id, page = 0, size = 10) => {
  return apiService.get(`/api/pin/${id}/products`, { params: { page, size } });
};

// Xuất danh sách pin
export const exportPin = (format = 'excel') => {
  return apiService.get('/api/pin/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách pin
export const importPin = (formData) => {
  return apiService.post('/api/pin/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};