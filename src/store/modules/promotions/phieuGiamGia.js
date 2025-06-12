import apiService from "../../../services/api";

export const fetchVouchers = (page = 0, size = 10) => {
  return apiService.get('/data', { params: { page, size } });
};

export const searchVouchers = (keyword, page = 0, size = 10) => {
  return apiService.get('/search', { params: { keyword, page, size } });
};

export const filterVouchers = (filters, page = 0, size = 10) => {
  return apiService.get('/filter', { params: { ...filters, page, size } });
};

export const getVoucherDetail = (id) => {
  return apiService.get(`/phieu-giam-gia/${id}`);
};

export const updateVoucher = (id, data) => {
  return apiService.put(`/update-phieu-giam-gia/${id}`, data);
};

export const updateVoucherStatus = (id, trangThai) => {
  return apiService.put(`/update-trang-thai/${id}`, { trangThai });
};

export const fetchCustomers = () => {
  return apiService.get('/data-kh');
};

export const searchCustomers = (keyword) => {
  return apiService.get('/search-kh', { params: { keyword } });
};

export const addVoucher = (data) => {
  return apiService.post('/addPhieuGiamGia', data);
};

export const checkPublicDiscount = (ma) => {
  return apiService.get('/check-public', { params: { ma } });
};

