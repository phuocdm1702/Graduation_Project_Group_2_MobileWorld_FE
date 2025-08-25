import apiService from "../../../../services/api";

// Lấy danh sách hệ điều hành với phân trang
export const fetchHeDieuHanh = (page = 0, size = 10) => {
  return apiService.get('/api/he-dieu-hanh', { params: { page, size } });
};

// Lấy danh sách tất cả hệ điều hành
export const fetchAllHeDieuHanh = () => {
  return apiService.get('/api/he-dieu-hanh/all');
};

// Tìm kiếm hệ điều hành
export const searchHeDieuHanh = (params, page = 0, size = 10) => {
  return apiService.get('/api/he-dieu-hanh/search', { params: { ...params, page, size } });
};

// Thêm mới hệ điều hành
export const createHeDieuHanh = (data) => {
  return apiService.post('/api/he-dieu-hanh', data);
};

// Cập nhật hệ điều hành
export const updateHeDieuHanh = (id, data) => {
  return apiService.put(`/api/he-dieu-hanh/${id}`, data);
};

// Cập nhật trạng thái hệ điều hành
export const updateHeDieuHanhStatus = (id, trangThai) => {
  return apiService.put(`/api/he-dieu-hanh/update-status/${id}`, { trangThai });
};

// Lấy chi tiết hệ điều hành
export const getHeDieuHanhDetail = (id) => {
  return apiService.get(`/api/he-dieu-hanh/${id}`);
};

// Lấy danh sách sản phẩm theo hệ điều hành
export const getProductsByHeDieuHanh = (id, page = 0, size = 10) => {
  return apiService.get(`/api/he-dieu-hanh/${id}/products`, { params: { page, size } });
};

// Xuất danh sách hệ điều hành
export const exportHeDieuHanh = (format = 'excel') => {
  return apiService.get('/api/he-dieu-hanh/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách hệ điều hành
export const importHeDieuHanh = (formData) => {
  return apiService.post('/api/he-dieu-hanh/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};