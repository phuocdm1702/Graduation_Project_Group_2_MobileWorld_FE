import apiService from "../../../services/api";

export const fetchNhanVien = async () => {
  try {
    const res = await apiService.get('/nhan-vien/home');
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    return { content: [] };
  }
};

export const addNhanVien = async (formData) => {
  try {
    const response = await apiService.post('/nhan-vien/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi thêm nhân viên:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Lỗi khi thêm nhân viên',
    };
  }
};

export const getNhanVienDetail = async (id) => {
  try {
    const response = await apiService.get(`/nhan-vien/detail/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhân viên:', error);
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy nhân viên',
    };
  }
};

export const UpdateNhanVien = async (id, formData) => {
  try {
    const response = await apiService.post(`/nhan-vien/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    const errorMessage = error.response?.data?.message || error.response?.data || 'Lỗi khi cập nhật nhân viên';
    console.log('Phản hồi từ server:', error.response?.data);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const Search = async (keyword) => {
  try {
    const response = await apiService.get('/nhan-vien/search', {
      params: { keyword },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || 'Không tìm thấy nhân viên',
    };
  }
};

export const trangThai = async (id) => {
  try {
    const response = await apiService.put(`/nhan-vien/trang-thai/${id}`);
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

export const importNhanVien = async (nhanViens) => {
  try {
    const response = await apiService.post('/nhan-vien/import', nhanViens);
    return { success: true, message: response.data };
  } catch (error) {
    console.error('Lỗi khi nhập nhân viên từ Excel:', error);
    return {
      success: false,
      message: error.response?.data || 'Lỗi khi nhập nhân viên từ Excel',
    };
  }
};