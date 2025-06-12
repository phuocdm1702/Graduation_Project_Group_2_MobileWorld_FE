import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchVouchers = (page = 0, size = 10) => {
  return apiClient.get('/data', { params: { page, size } });
};

export const searchVouchers = (keyword, page = 0, size = 10) => {
  return apiClient.get('/search', { params: { keyword, page, size } });
};

export const filterVouchers = (filters, page = 0, size = 10) => {
  return apiClient.get('/filter', { params: { ...filters, page, size } });
};

export const getVoucherDetail = (id) => {
  return apiClient.get(`/phieu-giam-gia/${id}`);
};

export const updateVoucher = (id, data) => {
  return apiClient.put(`/update-phieu-giam-gia/${id}`, data);
};

export const updateVoucherStatus = (id, trangThai) => {
  return apiClient.put(`/update-trang-thai/${id}`, { trangThai });
};

export const fetchCustomers = () => {
  return apiClient.get('/data-kh');
};

export const searchCustomers = (keyword) => {
  return apiClient.get('/search-kh', { params: { keyword } });
};

export const addVoucher = (data) => {
  return apiClient.post('/addPhieuGiamGia', data);
};

export const checkPublicDiscount = (ma) => {
  return apiClient.get('/check-public', { params: { ma } });
};

export default apiClient;

