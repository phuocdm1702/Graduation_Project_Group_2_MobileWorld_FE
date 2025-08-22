import apiService from "../../../../services/api";

// Lấy danh sách hỗ trợ công nghệ sạc với phân trang
export const fetchHoTroCongNgheSac = (page = 0, size = 10) => {
  return apiService.get('/api/ho-tro-cong-nghe-sac', { params: { page, size } });
};

// Lấy danh sách tất cả hỗ trợ công nghệ sạc
export const fetchAllHoTroCongNgheSac = () => {
  return apiService.get('/api/ho-tro-cong-nghe-sac/all');
};

// Tìm kiếm hỗ trợ công nghệ sạc
export const searchHoTroCongNgheSac = (params, page = 0, size = 10) => {
  return apiService.get('/api/ho-tro-cong-nghe-sac/search', { params: { ...params, page, size } });
};

// Thêm mới hỗ trợ công nghệ sạc
export const createHoTroCongNgheSac = (data) => {
  return apiService.post('/api/ho-tro-cong-nghe-sac', data);
};

// Cập nhật hỗ trợ công nghệ sạc
export const updateHoTroCongNgheSac = (id, data) => {
  return apiService.put(`/api/ho-tro-cong-nghe-sac/${id}`, data);
};

// Cập nhật trạng thái hỗ trợ công nghệ sạc
export const updateHoTroCongNgheSacStatus = (id, trangThai) => {
  return apiService.put(`/api/ho-tro-cong-nghe-sac/update-status/${id}`, { trangThai });
};

// Lấy chi tiết hỗ trợ công nghệ sạc
export const getHoTroCongNgheSacDetail = (id) => {
  return apiService.get(`/api/ho-tro-cong-nghe-sac/${id}`);
};

// Lấy danh sách sản phẩm theo hỗ trợ công nghệ sạc
export const getProductsByHoTroCongNgheSac = (id, page = 0, size = 10) => {
  return apiService.get(`/api/ho-tro-cong-nghe-sac/${id}/products`, { params: { page, size } });
};

// Xuất danh sách hỗ trợ công nghệ sạc
export const exportHoTroCongNgheSac = (format = 'excel') => {
  return apiService.get('/api/ho-tro-cong-nghe-sac/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách hỗ trợ công nghệ sạc
export const importHoTroCongNgheSac = (formData) => {
  return apiService.post('/api/ho-tro-cong-nghe-sac/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};