import apiService from "../../../services/api";

export const fetchKhachHang = async () => {
  try {
    const res = await apiService.get('/khach-hang/home');
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    return { content: [] };
  }
};

export const trangThai = async (id) => {
  try {
    const response = await apiService.put(`/khach-hang/trang-thai/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi update trạng thái nhân viên:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy nhân viên',
    };
  }
};

export const addKhanhHang = async (KhachHangData) => {
  try {
    const response = await apiService.post('/khach-hang/add', KhachHangData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi thêm khach hang:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Lỗi khi thêm nhân viên',
    };
  }
};

export const getKhachHangDetail = async (id) => {
  try {
    const response = await apiService.get(`/khach-hang/detail/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khach hang:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy khach hang',
    };
  }
};

export const UpdateKhachHang = async (id, KhachHangData) => {
  try {
    const response = await apiService.put(`/khach-hang/update/${id}`, KhachHangData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi update khach hang:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy khach hang',
    };
  }
};

export const UpdateKhachHangDiaChi = async (id, diaChiData) => {
  try {
    const response = await apiService.put(`/khach-hang/updateDchi/${id}`, diaChiData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi update khach hang:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy khach hang',
    };
  }
};

export const Search = async (keyword) => {
  try {
    const response = await apiService.get('/khach-hang/search', {
      params: { keyword },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy khach hang',
    };
  }
};

export const GetKhachHangDiaChiList = async (customerId) => {
  try {
    const response = await apiService.get(`/khach-hang/getByKhachHang/${customerId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi khi lấy danh sách địa chỉ",
    };
  }
};

export const DeleteKhachHangDiaChi = async (diaChiId) => {
  try {
    const response = await apiService.put(`/khach-hang/deleteDCKH/${diaChiId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi khi xóa địa chỉ",
    };
  }
};

export const SetMacDinhDiaChi = async (diaChiId, macDinh) => {
  try {
    const response = await apiService.put(`/khach-hang/setDefault/${diaChiId}`, { macDinh });
    return { success: true, data: response.data || "Cập nhật mặc định thành công!" };
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
    return {
      success: false,
      message: error.response?.data || "Lỗi khi cập nhật địa chỉ mặc định",
    };
  }
};

export const importKhachHang = async (khachhangs) => {
  try {
    const response = await apiService.post('/khach-hang/import', khachhangs);
    return { success: true, message: response.data };
  } catch (error) {
    console.error('Lỗi khi nhập nhân viên từ Excel:', error);
    return {
      success: false,
      message: error.response?.data || 'Lỗi khi nhập khách hàng từ Excel',
    };
  }
};