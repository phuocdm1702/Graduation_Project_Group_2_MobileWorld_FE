import apiService from "../../../../services/api";

// Lấy danh sách công nghệ màn hình với phân trang
export const fetchCongNgheManHinh = (page = 0, size = 10) => {
  return apiService.get('/api/cong-nghe-man-hinh', { params: { page, size } });
};

// Lấy danh sách tất cả công nghệ màn hình
export const fetchAllCongNgheManHinh = () => {
  return apiService.get('/api/cong-nghe-man-hinh/all');
};

// Tìm kiếm công nghệ màn hình
export const searchCongNgheManHinh = (params, page = 0, size = 10) => {
  return apiService.get('/api/cong-nghe-man-hinh/search', { params: { ...params, page, size } });
};

// Thêm mới công nghệ màn hình
export const createCongNgheManHinh = (data) => {
  return apiService.post('/api/cong-nghe-man-hinh', data);
};

// Cập nhật công nghệ màn hình
export const updateCongNgheManHinh = (id, data) => {
  return apiService.put(`/api/cong-nghe-man-hinh/${id}`, data);
};

// Cập nhật trạng thái công nghệ màn hình
export const updateCongNgheManHinhStatus = (id, trangThai) => {
  return apiService.put(`/api/cong-nghe-man-hinh/update-status/${id}`, { trangThai });
};

// Lấy chi tiết công nghệ màn hình
export const getCongNgheManHinhDetail = (id) => {
  return apiService.get(`/api/cong-nghe-man-hinh/${id}`);
};

// Lấy danh sách sản phẩm theo công nghệ màn hình
export const getProductsByCongNgheManHinh = (id, page = 0, size = 10) => {
  return apiService.get(`/api/cong-nghe-man-hinh/${id}/products`, { params: { page, size } });
};

// Xuất danh sách công nghệ màn hình
export const exportCongNgheManHinh = (format = 'excel') => {
  return apiService.get('/api/cong-nghe-man-hinh/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách công nghệ màn hình
export const importCongNgheManHinh = (formData) => {
  return apiService.post('/api/cong-nghe-man-hinh/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};