import apiService from '../../../services/api';

// Lấy danh sách hệ điều hành
export const getHeDieuHanh = () => {
  return apiService.get('/api/he-dieu-hanh/all');
};

// Thêm hệ điều hành mới
export const addHeDieuHanh = (data) => {
  return apiService.post('/api/he-dieu-hanh', data);
};

// Lấy danh sách công nghệ màn hình
export const getCongNgheManHinh = () => {
  return apiService.get('/api/cong-nghe-man-hinh/all');
};

// Thêm công nghệ màn hình mới
export const addCongNgheManHinh = (data) => {
  return apiService.post('/api/cong-nghe-man-hinh', data);
};

// Lấy danh sách nhà sản xuất
export const getNhaSanXuat = () => {
  return apiService.get('/api/nha-san-xuat/all');
};

// Thêm nhà sản xuất mới
export const addNhaSanXuat = (data) => {
  return apiService.post('/api/nha-san-xuat', data);
};

// Lấy danh sách cụm camera
export const getCumCamera = () => {
  return apiService.get('/api/cum-camera/all');
};

// Thêm cụm camera mới
export const addCumCamera = (data) => {
  return apiService.post('/api/cum-camera', data);
};

// Lấy danh sách SIM
export const getSim = () => {
  return apiService.get('/api/sim/all');
};

// Thêm SIM mới
export const addSim = (data) => {
  return apiService.post('/api/sim', data);
};

// Lấy danh sách thiết kế
export const getThietKe = () => {
  return apiService.get('/api/thiet-ke/all');
};

// Thêm thiết kế mới
export const addThietKe = (data) => {
  return apiService.post('/api/thiet-ke', data);
};

// Lấy danh sách pin
export const getPin = () => {
  return apiService.get('/api/pin/all');
};

// Thêm pin mới
export const addPin = (data) => {
  return apiService.post('/api/pin', data);
};

// Lấy danh sách CPU
export const getCpu = () => {
  return apiService.get('/api/cpu/all');
};

// Thêm CPU mới
export const addCpu = (data) => {
  return apiService.post('/api/cpu', data);
};

// Lấy danh sách GPU
export const getGpu = () => {
  return apiService.get('/api/gpu/all');
};

// Thêm GPU mới
export const addGpu = (data) => {
  return apiService.post('/api/gpu', data);
};

// Lấy danh sách công nghệ mạng
export const getCongNgheMang = () => {
  return apiService.get('/api/cong-nghe-mang/all');
};

// Thêm công nghệ mạng mới
export const addCongNgheMang = (data) => {
  return apiService.post('/api/cong-nghe-mang', data);
};

// Lấy danh sách công nghệ sạc
export const getHoTroCongNgheSac = () => {
  return apiService.get('/api/ho-tro-cong-nghe-sac/all');
};

// Thêm công nghệ sạc mới
export const addHoTroCongNgheSac = (data) => {
  return apiService.post('/api/ho-tro-cong-nghe-sac', data);
};

// Lấy danh sách chỉ số kháng bụi và nước
export const getChiSoKhangBuiVaNuoc = () => {
  return apiService.get('/api/chi-so-khang-bui-va-nuoc/all');
};

// Thêm chỉ số kháng bụi và nước mới
export const addChiSoKhangBuiVaNuoc = (data) => {
  return apiService.post('/api/chi-so-khang-bui-va-nuoc', data);
};

// Lấy danh sách RAM
export const getRam = () => {
  return apiService.get('/api/ram/all');
};

// Thêm RAM mới
export const addRam = (data) => {
  return apiService.post('/api/ram', data);
};

// Lấy danh sách bộ nhớ trong
export const getBoNhoTrong = () => {
  return apiService.get('/api/bo-nho-trong/all');
};

// Thêm bộ nhớ trong mới
export const addBoNhoTrong = (data) => {
  return apiService.post('/api/bo-nho-trong', data);
};

// Lấy danh sách màu sắc
export const getMauSac = () => {
  return apiService.get('/api/mau-sac/all');
};

// Thêm màu sắc mới
export const addMauSac = (data) => {
  return apiService.post('/api/mau-sac', data);
};

// Lấy danh sách bộ nhớ ngoài
export const getHoTroBoNhoNgoai = () => {
  return apiService.get('/api/ho-tro-bo-nho-ngoai/all');
};

// Thêm bộ nhớ ngoài mới
export const addHoTroBoNhoNgoai = (data) => {
  return apiService.post('/api/ho-tro-bo-nho-ngoai', data);
};

// Lấy danh sách sản phẩm
export const getProducts = () => {
  return apiService.get('/san-pham/all');
};

// Lấy chi tiết sản phẩm theo ID sản phẩm
export const getChiTietSanPhamBySanPhamId = (id) => {
  return apiService.get(`/api/chi-tiet-san-pham/${id}`);
};

// Kiểm tra IMEI có tồn tại không
export const checkImelExists = (imei) => {
  return apiService.get(`/api/imel/check?imei=${imei}`);
};

// Thêm chi tiết sản phẩm
export const addChiTietSanPham = async (data, images, existingImageUrls = []) => {
  try {
    const formData = new FormData();

    // Validate input data
    if (!data.tenSanPham || !data.tenSanPham.trim()) {
      throw new Error('Tên sản phẩm không được để trống');
    }
    if (!data.variants || !Array.isArray(data.variants) || data.variants.length === 0) {
      throw new Error('Danh sách biến thể không được để trống');
    }

    // Validate and add images
    if (images && images.length > 0) {
      for (const image of images) {
        if (!(image instanceof File)) {
          console.warn('Invalid image object:', image);
          throw new Error('File ảnh không hợp lệ');
        }
        if (!image.type.startsWith('image/')) {
          console.warn('Invalid image type:', image.type);
          throw new Error('File ảnh không hợp lệ - chỉ chấp nhận file ảnh');
        }
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`File ảnh ${image.name} vượt quá kích thước tối đa 10MB`);
        }
        formData.append('images', image);
      }
    }

    // Add existing image URLs if any
    if (existingImageUrls && existingImageUrls.length > 0) {
      existingImageUrls.forEach((url, index) => {
        formData.append(`existingImageUrls[${index}]`, url);
      });
    }

    // Thêm các trường cấp cao
    formData.append('tenSanPham', data.tenSanPham);
    formData.append('idNhaSanXuat', data.idNhaSanXuat || '');
    formData.append('idPin', data.idPin || '');
    formData.append('idCongNgheManHinh', data.idCongNgheManHinh || '');
    formData.append('idHoTroBoNhoNgoai', data.idHoTroBoNhoNgoai || '');
    formData.append('idCpu', data.idCpu || '');
    formData.append('idGpu', data.idGpu || '');
    formData.append('idCumCamera', data.idCumCamera || '');
    formData.append('idHeDieuHanh', data.idHeDieuHanh || '');
    formData.append('idChiSoKhangBuiVaNuoc', data.idChiSoKhangBuiVaNuoc || '');
    formData.append('idThietKe', data.idThietKe || '');
    formData.append('idSim', data.idSim || '');
    formData.append('idHoTroCongNgheSac', data.idHoTroCongNgheSac || '');
    formData.append('idCongNgheMang', data.idCongNgheMang || '');
    formData.append('ghiChu', data.ghiChu || '');

    // Thêm các trường trong mảng variants
    data.variants.forEach((variant, index) => {
      if (!variant.idMauSac || !variant.idRam || !variant.idBoNhoTrong || !variant.donGia) {
        throw new Error(`Biến thể ${index + 1} không hợp lệ: Thiếu thông tin bắt buộc`);
      }
      if (!variant.imeiList || !Array.isArray(variant.imeiList) || variant.imeiList.length === 0) {
        throw new Error(`Biến thể ${index + 1} không hợp lệ: Thiếu danh sách IMEI`);
      }
      
      formData.append(`variants[${index}].idMauSac`, variant.idMauSac);
      formData.append(`variants[${index}].idRam`, variant.idRam);
      formData.append(`variants[${index}].idBoNhoTrong`, variant.idBoNhoTrong);
      formData.append(`variants[${index}].donGia`, variant.donGia);
      
      variant.imeiList.forEach((imei, imeiIndex) => {
        if (!imei || typeof imei !== 'string' || imei.length !== 15 || !/^\d{15}$/.test(imei)) {
          throw new Error(`IMEI "${imei}" tại biến thể ${index + 1} không hợp lệ - phải là 15 chữ số`);
        }
        formData.append(`variants[${index}].imeiList[${imeiIndex}]`, imei);
      });
    });

    // Log FormData entries for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }
    }

    // Gửi yêu cầu
    const response = await apiService.post('/api/chi-tiet-san-pham', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    return response;
  } catch (error) {
    console.error('Error in addChiTietSanPham:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.response?.status === 500) {
      throw new Error(`Lỗi server: ${error.response?.data?.message || 'Có lỗi xảy ra trên server'}`);
    } else if (error.response?.status === 400) {
      throw new Error(`Dữ liệu không hợp lệ: ${error.response?.data?.message || 'Kiểm tra lại thông tin đã nhập'}`);
    } else if (error.message.includes('Network Error')) {
      throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
    } else {
      throw new Error(`Lỗi khi thêm chi tiết sản phẩm: ${error.message}`);
    }
  }
};

export const updateChiTietSanPham = async (id, data, images, existingImageUrls = []) => {
  try {
    const formData = new FormData();

    // Validate input data
    if (!id || id <= 0) {
      throw new Error('ID chi tiết sản phẩm không hợp lệ');
    }
    if (!data.variants || !Array.isArray(data.variants) || data.variants.length !== 1) {
      throw new Error('Chỉ được cung cấp một biến thể để cập nhật chi tiết sản phẩm');
    }

    // Validate and add images
    if (images && images.length > 0) {
      for (const image of images) {
        if (!(image instanceof File)) {
          console.warn('Invalid image object:', image);
          throw new Error('File ảnh không hợp lệ');
        }
        if (!image.type.startsWith('image/')) {
          console.warn('Invalid image type:', image.type);
          throw new Error('File ảnh không hợp lệ - chỉ chấp nhận file ảnh');
        }
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`File ảnh ${image.name} vượt quá kích thước tối đa 10MB`);
        }
        formData.append('images', image);
      }
    }

    // Add existing image URLs if any
    if (existingImageUrls && existingImageUrls.length > 0) {
      existingImageUrls.forEach((url, index) => {
        formData.append(`existingImageUrls[${index}]`, url);
      });
    }

    // Thêm các trường cấp cao
    formData.append('id', id);
    formData.append('ghiChu', data.ghiChu || '');

    // Thêm các trường trong biến thể
    const variant = data.variants[0];
    if (!variant.idMauSac || !variant.idRam || !variant.idBoNhoTrong || !variant.donGia) {
      throw new Error('Biến thể không hợp lệ: Thiếu thông tin bắt buộc');
    }
    if (!variant.imeiList || !Array.isArray(variant.imeiList) || variant.imeiList.length !== 1) {
      throw new Error('Biến thể không hợp lệ: Chỉ được cung cấp một IMEI');
    }

    const imei = variant.imeiList[0];
    if (!imei || typeof imei !== 'string' || imei.length !== 15 || !/^\d{15}$/.test(imei)) {
      throw new Error(`IMEI "${imei}" không hợp lệ - phải là 15 chữ số`);
    }
    formData.append('variants[0].idMauSac', variant.idMauSac);
    formData.append('variants[0].idRam', variant.idRam);
    formData.append('variants[0].idBoNhoTrong', variant.idBoNhoTrong);
    formData.append('variants[0].donGia', variant.donGia);
    formData.append('variants[0].imeiList[0]', imei);

    // Log FormData entries for debugging
    console.log('FormData entries for update:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
    }

    // Gửi yêu cầu
    const response = await apiService.put(`/api/chi-tiet-san-pham/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return response;
  } catch (error) {
    console.error('Error in updateChiTietSanPham:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });

    // Provide more specific error messages
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || 'Kiểm tra lại thông tin đã nhập';
      throw new Error(`Dữ liệu không hợp lệ: ${message}`);
    } else if (error.response?.status === 404) {
      throw new Error('Không tìm thấy chi tiết sản phẩm để cập nhật');
    } else if (error.message.includes('Network Error')) {
      throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
    } else {
      throw new Error(`Lỗi khi cập nhật chi tiết sản phẩm: ${error.message}`);
    }
  }
};