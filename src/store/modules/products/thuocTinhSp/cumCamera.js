import apiService from "../../../../services/api";

// Lấy danh sách cụm camera với phân trang
export const fetchCumCamera = (page = 0, size = 10) => {
  return apiService.get('/api/cum-camera', { params: { page, size } });
};

// Lấy danh sách tất cả cụm camera
export const fetchAllCumCamera = () => {
  return apiService.get('/api/cum-camera/all');
};

// Tìm kiếm cụm camera
export const searchCumCamera = (params, page = 0, size = 10) => {
  return apiService.get('/api/cum-camera/search', { params: { ...params, page, size } });
};

// Thêm mới cụm camera
export const createCumCamera = (data) => {
  return apiService.post('/api/cum-camera', data);
};

// Cập nhật cụm camera
export const updateCumCamera = (id, data) => {
  return apiService.put(`/api/cum-camera/${id}`, data);
};

// Cập nhật trạng thái cụm camera
export const updateCumCameraStatus = (id, trangThai) => {
  return apiService.put(`/api/cum-camera/update-status/${id}`, { trangThai });
};

// Lấy chi tiết cụm camera
export const getCumCameraDetail = (id) => {
  return apiService.get(`/api/cum-camera/${id}`);
};

// Lấy danh sách sản phẩm theo cụm camera
export const getProductsByCumCamera = (id, page = 0, size = 10) => {
  return apiService.get(`/api/cum-camera/${id}/products`, { params: { page, size } });
};

// Xuất danh sách cụm camera
export const exportCumCamera = (format = 'excel') => {
  return apiService.get('/api/cum-camera/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách cụm camera
export const importCumCamera = (formData) => {
  return apiService.post('/api/cum-camera/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};