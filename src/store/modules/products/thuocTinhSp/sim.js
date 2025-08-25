import apiService from "../../../../services/api";

// Lấy danh sách SIM với phân trang
export const fetchSim = (page = 0, size = 10) => {
  return apiService.get('/api/sim', { params: { page, size } });
};

// Lấy danh sách tất cả SIM
export const fetchAllSim = () => {
  return apiService.get('/api/sim/all');
};

// Tìm kiếm SIM
export const searchSim = (params, page = 0, size = 10) => {
  return apiService.get('/api/sim/search', { params: { ...params, page, size } });
};

// Thêm mới SIM
export const createSim = (data) => {
  return apiService.post('/api/sim', data);
};

// Cập nhật SIM
export const updateSim = (id, data) => {
  return apiService.put(`/api/sim/${id}`, data);
};

// Cập nhật trạng thái SIM
export const updateSimStatus = (id, trangThai) => {
  return apiService.put(`/api/sim/update-status/${id}`, { trangThai });
};

// Lấy chi tiết SIM
export const getSimDetail = (id) => {
  return apiService.get(`/api/sim/${id}`);
};

// Lấy danh sách sản phẩm theo SIM
export const getProductsBySim = (id, page = 0, size = 10) => {
  return apiService.get(`/api/sim/${id}/products`, { params: { page, size } });
};

// Xuất danh sách SIM
export const exportSim = (format = 'excel') => {
  return apiService.get('/api/sim/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách SIM
export const importSim = (formData) => {
  return apiService.post('/api/sim/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};