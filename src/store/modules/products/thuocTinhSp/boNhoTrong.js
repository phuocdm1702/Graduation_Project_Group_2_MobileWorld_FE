import apiService from "../../../../services/api";

// Lấy danh sách bộ nhớ trong với phân trang
export const fetchBoNhoTrong = (page = 0, size = 10) => {
  return apiService.get('/api/bo-nho-trong', { params: { page, size } });
};

// Lấy danh sách tất cả bộ nhớ trong
export const fetchAllBoNhoTrong = () => {
  return apiService.get('/api/bo-nho-trong/all');
};

// Tìm kiếm bộ nhớ trong
export const searchBoNhoTrong = (params, page = 0, size = 10) => {
  return apiService.get('/api/bo-nho-trong/search', { params: { ...params, page, size } });
};

// Thêm mới bộ nhớ trong
export const createBoNhoTrong = (data) => {
  return apiService.post('/api/bo-nho-trong', data);
};

// Cập nhật bộ nhớ trong
export const updateBoNhoTrong = (id, data) => {
  return apiService.put(`/api/bo-nho-trong/${id}`, data);
};

// Lấy chi tiết bộ nhớ trong
export const getBoNhoTrongDetail = (id) => {
  return apiService.get(`/api/bo-nho-trong/${id}`);
};