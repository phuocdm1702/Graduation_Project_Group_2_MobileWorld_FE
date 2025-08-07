import apiService from "../../../../services/api";

// Lấy danh sách nhà sản xuất với phân trang
export const fetchNhaSanXuat = (page = 0, size = 10) => {
  return apiService.get('/api/nha-san-xuat', { params: { page, size } });
};

// Lấy danh sách tất cả nhà sản xuất
export const fetchAllNhaSanXuat = () => {
  return apiService.get('/api/nha-san-xuat/all');
};

// Tìm kiếm nhà sản xuất
export const searchNhaSanXuat = (params, page = 0, size = 10) => {
  return apiService.get('/api/nha-san-xuat/search', { params: { ...params, page, size } });
};

// Thêm mới nhà sản xuất
export const createNhaSanXuat = (data) => {
  return apiService.post('/api/nha-san-xuat', data);
};

// Cập nhật nhà sản xuất
export const updateNhaSanXuat = (id, data) => {
  return apiService.put(`/api/nha-san-xuat/${id}`, data);
};

// Xóa nhà sản xuất
export const deleteNhaSanXuat = (id) => {
  return apiService.delete(`/api/nha-san-xuat/${id}`);
};

// Cập nhật trạng thái nhà sản xuất
export const updateNhaSanXuatStatus = (id, trangThai) => {
  return apiService.put(`/api/nha-san-xuat/update-status/${id}`, { trangThai });
};

// Lấy chi tiết nhà sản xuất
export const getNhaSanXuatDetail = (id) => {
  return apiService.get(`/api/nha-san-xuat/${id}`);
};

// Lấy danh sách sản phẩm theo nhà sản xuất
export const getProductsByNhaSanXuat = (id, page = 0, size = 10) => {
  return apiService.get(`/api/nha-san-xuat/${id}/products`, { params: { page, size } });
};

// Xuất danh sách nhà sản xuất
export const exportNhaSanXuat = (format = 'excel') => {
  return apiService.get('/api/nha-san-xuat/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách nhà sản xuất
export const importNhaSanXuat = (formData) => {
  return apiService.post('/api/nha-san-xuat/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};