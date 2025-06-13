import apiService from "../../../services/api";

export const fetchVouchers = (page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter', { params: { page, size } });
};

export const searchVouchers = (keyword, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter', { params: { keyword, page, size } });
};

export const filterByLoaiPhieu = (loaiPhieu, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter/loai-phieu', { params: { loaiPhieu, page, size } });
};

export const filterByTrangThai = (trangThai, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter/trang-thai', { params: { trangThai, page, size } });
};

export const filterByDateRange = (startDate, endDate, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter/date-range', { params: { startDate, endDate, page, size } });
};

export const filterByMinOrder = (minOrder, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter/min-order', { params: { minOrder, page, size } });
};

export const filterByValue = (valueFilter, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter/value', { params: { valueFilter, page, size } });
};

export const filterVouchers = (filters, page = 0, size = 10) => {
  return apiService.get('/phieu-giam-gia/filter', { params: { ...filters, page, size } });
};

export const getVoucherDetail = (id) => {
  return apiService.get(`/phieu-giam-gia/${id}`);
};

export const updateVoucher = (id, data) => {
  return apiService.put(`/phieu-giam-gia/update-phieu-giam-gia/${id}`, data);
};

export const updateVoucherStatus = (id, trangThai) => {
  return apiService.put(`/phieu-giam-gia/update-trang-thai/${id}`, { trangThai });
};

export const addVoucher = (data) => {
  return apiService.post('/phieu-giam-gia/addPhieuGiamGia', data);
};

export const checkPublicDiscount = (ma) => {
  return apiService.get('/phieu-giam-gia/check-public', { params: { ma } });
};
