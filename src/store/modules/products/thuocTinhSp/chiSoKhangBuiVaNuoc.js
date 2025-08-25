import apiService from "../../../../services/api";

// Lấy danh sách chỉ số kháng bụi và nước với phân trang
export const fetchChiSoKhangBuiVaNuoc = (page = 0, size = 10) => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc', { params: { page, size } });
};

// Lấy danh sách tất cả chỉ số kháng bụi và nước
export const fetchAllChiSoKhangBuiVaNuoc = () => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc/all');
};

// Tìm kiếm chỉ số kháng bụi và nước
export const searchChiSoKhangBuiVaNuoc = (params, page = 0, size = 10) => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc/search', { params: { ...params, page, size } });
};

// Thêm mới chỉ số kháng bụi và nước
export const createChiSoKhangBuiVaNuoc = (data) => {
  return apiService.post('/api/chi-so-khang-bui-va-nuoc', data);
};

// Cập nhật chỉ số kháng bụi và nước
export const updateChiSoKhangBuiVaNuoc = (id, data) => {
  return apiService.put(`/api/chi-so-khang-bui-va-nuoc/${id}`, data);
};

// Cập nhật trạng thái chỉ số kháng bụi và nước
export const updateChiSoKhangBuiVaNuocStatus = (id, trangThai) => {
  return apiService.put(`/api/chi-so-khang-bui-va-nuoc/update-status/${id}`, { trangThai });
};

// Lấy chi tiết chỉ số kháng bụi và nước
export const getChiSoKhangBuiVaNuocDetail = (id) => {
  return apiService.get(`/api/chi-so-khang-bui-va-nuoc/${id}`);
};

// Lấy danh sách sản phẩm theo chỉ số kháng bụi và nước
export const getProductsByChiSoKhangBuiVaNuoc = (id, page = 0, size = 10) => {
  return apiService.get(`/api/chi-so-khang-bui-va-nuoc/${id}/products`, { params: { page, size } });
};

// Xuất danh sách chỉ số kháng bụi và nước
export const exportChiSoKhangBuiVaNuoc = (format = 'excel') => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách chỉ số kháng bụi và nước
export const importChiSoKhangBuiVaNuoc = (formData) => {
  return apiService.post('/api/chi-so-khang-bui-va-nuoc/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};