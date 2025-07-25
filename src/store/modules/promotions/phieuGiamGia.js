import apiService from "../../../services/api";

const baseURL = "/api/phieu-giam-gia"

export const fetchVouchers = (page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter`, { params: { page, size } });
};

export const searchVouchers = (keyword, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/filter`, { params: { keyword, page, size } });
};

export const filterByLoaiPhieu = (loaiPhieu, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/loai-phieu`, { params: { loaiPhieu, page, size } });
};

export const filterByTrangThai = (trangThai, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/trang-thai`, { params: { trangThai, page, size } });
};

export const filterByDateRange = (startDate, endDate, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/date-range`, { params: { startDate, endDate, page, size } });
};

export const filterByMinOrder = (minOrder, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/min-order`, { params: { minOrder, page, size } });
};

export const filterByValue = (valueFilter, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter/value`, { params: { valueFilter, page, size } });
};

export const filterVouchers = (filters, page = 0, size = 10) => {
  return apiService.get(`${baseURL}/filter`, { params: { ...filters, page, size } });
};

export const filterCustomersByGioiTinh = (gioiTinh) => {
  return apiService.get(`${baseURL}/filter-kh-by-gioitinh`, {
    params: { gioiTinh: gioiTinh === "" ? null : gioiTinh },
  });
};

export const getVoucherDetail = (id) => {
  return apiService.get(`${baseURL}/${id}`);
};

export const updateVoucher = (id, data) => {
  return apiService.put(`${baseURL}/update-phieu-giam-gia/${id}`, data);
};

export const updateVoucherStatus = (id, trangThai) => {
  return apiService.put(`${baseURL}/update-trang-thai/${id}`, { trangThai });
};

export const addVoucher = (data) => {
  return apiService.post(`${baseURL}/addPhieuGiamGia`, data);
};

export const checkPublicDiscount = (ma) => {
  return apiService.get(`${baseURL}/check-public`, { params: { ma } });
};

export const fetchCustomers = () => {
  return apiService.get(`${baseURL}/data-kh`);
};

export const searchCustomers = (keyword) => {
  return apiService.get(`${baseURL}/search-kh`, { params: { keyword } });
};
