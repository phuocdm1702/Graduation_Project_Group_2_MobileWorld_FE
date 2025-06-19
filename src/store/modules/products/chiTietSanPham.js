import apiService from "../../../services/api";

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

// Lấy danh sách sản phẩm
export const getProducts = () => {
  return apiService.get('/san-pham/all');
};

export const addChiTietSanPham = (data, images) => {
  const formData = new FormData();
  // Đóng gói dto dưới dạng Blob với Content-Type: application/json
  formData.append('dto', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  // Thêm images, đảm bảo là File object
  images.forEach((image, index) => {
    // Kiểm tra xem image có phải là File object hay có thuộc tính file
    const file = image.file || image;
    if (file instanceof File) {
      formData.append('images', file);
    } else {
      console.error(`Image at index ${index} is not a valid File object`, image);
    }
  });

  // Log FormData để debug
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  return apiService.post('/chi-tiet-san-pham', formData); // Xóa headers
};