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

export const getChiTietSanPhamBySanPhamId = (id) => {
  return apiService.get(`/api/chi-tiet-san-pham/${id}`);
};

// Kiểm tra ảnh đã tồn tại
export const checkExistingImages = async (productGroupKey, imageHashes) => {
  try {
    const response = await apiService.post('/api/anh-san-pham/check', {
      productGroupKey,
      hashes: imageHashes,
    });
    return response.data; // Expected: { hash: imageUrl } for existing images
  } catch (error) {
    console.error('Error checking existing images:', error);
    throw error;
  }
};

// Tính MD5 hash của ảnh
const generateImageHash = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const msgUint8 = new Uint8Array(buffer);
    const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error generating image hash:', error);
    throw error;
  }
};

// Thêm chi tiết sản phẩm với tối ưu hóa ảnh
export const addChiTietSanPham = async (data, images) => {
  try {
    const formData = new FormData();

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
    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach((variant, index) => {
        formData.append(`variants[${index}].idMauSac`, variant.idMauSac || '');
        formData.append(`variants[${index}].idRam`, variant.idRam || '');
        formData.append(`variants[${index}].idBoNhoTrong`, variant.idBoNhoTrong || '');
        formData.append(`variants[${index}].donGia`, variant.donGia || '');
        if (variant.imeiList && Array.isArray(variant.imeiList)) {
          variant.imeiList.forEach((imei, imeiIndex) => {
            formData.append(`variants[${index}].imeiList[${imeiIndex}]`, imei || '');
          });
        }
      });
    }

    // Nén và tính hash cho ảnh
    const imageData = [];
    const imageHashes = [];
    const compressionOptions = {
      maxSizeMB: 0.2, // Giới hạn kích thước ảnh ở 200KB
      maxWidthOrHeight: 800, // Giới hạn chiều rộng/cao
      useWebWorker: true,
    };

    for (const image of images) {
      if (image instanceof File && image.type.startsWith('image/')) {
        const compressedImage = await imageCompression(image, compressionOptions);
        const hash = await generateImageHash(compressedImage);
        imageData.push({ file: compressedImage, hash });
        imageHashes.push(hash);
      } else {
        console.warn('Invalid image file:', image);
      }
    }

    // Kiểm tra ảnh đã tồn tại
    let productGroupKey = `SP${data.tenSanPham.replace(/\s+/g, '_')}`; // Tạm thời tạo productGroupKey
    const existingImages = await checkExistingImages(productGroupKey, imageHashes);

    // Thêm ảnh và hash vào FormData
    imageData.forEach((img, index) => {
      if (!existingImages[img.hash]) {
        formData.append('images', img.file);
        formData.append(`imageHashes[${index}]`, img.hash);
      } else {
        formData.append(`existingImageUrls[${index}]`, existingImages[img.hash]);
        formData.append(`imageHashes[${index}]`, img.hash);
      }
    });

    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value instanceof File ? value.name : value);
    }

    // Gửi yêu cầu
    const response = await apiService.post('/api/chi-tiet-san-pham', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error in addChiTietSanPham:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const updateChiTietSanPham = async (id, data, images) => {
  try {
    const formData = new FormData();

    // Thêm ID sản phẩm
    formData.append('id', id);

    // Thêm các trường cấp cao
    formData.append('tenSanPham', data.tenSanPham || '');
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
    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach((variant, index) => {
        formData.append(`variants[${index}].idMauSac`, variant.idMauSac || '');
        formData.append(`variants[${index}].idRam`, variant.idRam || '');
        formData.append(`variants[${index}].idBoNhoTrong`, variant.idBoNhoTrong || '');
        formData.append(`variants[${index}].donGia`, variant.donGia || '');
        if (variant.imeiList && Array.isArray(variant.imeiList)) {
          variant.imeiList.forEach((imei, imeiIndex) => {
            formData.append(`variants[${index}].imeiList[${imeiIndex}]`, imei || '');
          });
        }
      });
    }

    // Nén và tính hash cho ảnh
    const imageData = [];
    const imageHashes = [];
    const compressionOptions = {
      maxSizeMB: 0.2, // Giới hạn kích thước ảnh ở 200KB
      maxWidthOrHeight: 800, // Giới hạn chiều rộng/cao
      useWebWorker: true,
    };

    for (const image of images || []) {
      if (image instanceof File && image.type.startsWith('image/')) {
        const compressedImage = await imageCompression(image, compressionOptions);
        const hash = await generateImageHash(compressedImage);
        imageData.push({ file: compressedImage, hash });
        imageHashes.push(hash);
      } else {
        console.warn('Invalid image file:', image);
      }
    }

    // Kiểm tra ảnh đã tồn tại
    let productGroupKey = `SP${data.tenSanPham.replace(/\s+/g, '_')}`;
    const existingImages = await checkExistingImages(productGroupKey, imageHashes);

    // Thêm ảnh và hash vào FormData
    imageData.forEach((img, index) => {
      if (!existingImages[img.hash]) {
        formData.append('images', img.file);
        formData.append(`imageHashes[${index}]`, img.hash);
      } else {
        formData.append(`existingImageUrls[${index}]`, existingImages[img.hash]);
        formData.append(`imageHashes[${index}]`, img.hash);
      }
    });

    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value instanceof File ? value.name : value);
    }

    // Gửi yêu cầu PUT
    const response = await apiService.put(`/api/chi-tiet-san-pham/edit/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error in updateChiTietSanPham:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};