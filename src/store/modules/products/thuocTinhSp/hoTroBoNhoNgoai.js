import apiService from "../../../../services/api";

// Lấy danh sách bộ nhớ ngoài với phân trang
export const fetchHoTroBoNhoNgoai = (page = 0, size = 10) => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai', { params: { page, size } });
};

// Lấy danh sách tất cả bộ nhớ ngoài
export const fetchAllHoTroBoNhoNgoai = () => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai/all');
};

// Tìm kiếm bộ nhớ ngoài
export const searchHoTroBoNhoNgoai = (params, page = 0, size = 10) => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai/search', { params: { ...params, page, size } });
};

// Thêm mới bộ nhớ ngoài
export const createHoTroBoNhoNgoai = (data) => {
  return apiService.post('/api/ho-tro-bo-nho-ngoai', data);
};

// Cập nhật bộ nhớ ngoài
export const updateHoTroBoNhoNgoai = (id, data) => {
  return apiService.put(`/api/ho-tro-bo-nho-ngoai/${id}`, data);
};

// Cập nhật trạng thái bộ nhớ ngoài
export const updateHoTroBoNhoNgoaiStatus = (id, trangThai) => {
  return apiService.put(`/api/ho-tro-bo-nho-ngoai/update-status/${id}`, { trangThai });
};

// Lấy chi tiết bộ nhớ ngoài
export const getHoTroBoNhoNgoaiDetail = (id) => {
  return apiService.get(`/api/ho-tro-bo-nho-ngoai/${id}`);
};

// Lấy danh sách sản phẩm theo bộ nhớ ngoài
export const getProductsByHoTroBoNhoNgoai = (id, page = 0, size = 10) => {
  return apiService.get(`/api/ho-tro-bo-nho-ngoai/${id}/products`, { params: { page, size } });
};

// Xuất danh sách bộ nhớ ngoài
export const exportHoTroBoNhoNgoai = (format = 'excel') => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai/export', { 
    params: { format },
    responseType: 'blob'
  });
};

// Nhập danh sách bộ nhớ ngoài
export const importHoTroBoNhoNgoai = (formData) => {
  return apiService.post('/api/ho-tro-bo-nho-ngoai/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};