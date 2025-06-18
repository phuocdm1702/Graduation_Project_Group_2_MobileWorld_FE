import apiService from "../../../services/api";

export const Search = async (query) => {
  try {
    const response = await apiService.get('/khach-hang/search', {
      params: { query },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy nhân viên',
    };a
  }
};

export const addBanHang = async (BanHangs) => {
  try {
    const response = await apiService.post('/khach-hang/add-Bh', BanHangs);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi thêm khách hàng:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Lỗi khi thêm khách hàng',
    };
  }
};

export const fetchPGG = async () => {
  try {
    const res = await apiService.get('/api/PGG-all');
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách PGG', error);
    return { content: [] };
  }
};



export const getPhieuGiamGiaByKhachHang = async (idKhachHang) => {
  try {
    const response = await apiService.get(`/api/by-khach-hang/${idKhachHang}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || 'Không lấy được danh sách phiếu giảm giá',
    };
  }
};

export const checkPhieuGiamGia = async (ma) => {
  try {
    const response = await apiService.get('/api/pgg/check', {
      params: { ma },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || 'Mã giảm giá không hợp lệ',
    };
  }
};
