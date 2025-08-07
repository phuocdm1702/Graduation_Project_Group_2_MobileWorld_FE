<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <div class="bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp" style="padding: 1rem">
      <!-- QR Scanning Modal -->
      <div
        v-if="isScanning"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5); z-index: 1050"
        aria-labelledby="qrModalLabel"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="qrModalLabel">Quét mã QR CCCD</h5>
              <button
                type="button"
                class="btn-close"
                @click="stopScanning"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div id="qr-reader" class="w-full h-72 mx-auto"></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-danger" @click="stopScanning">Hủy</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Image -->
      <div class="flex justify-center mb-6 animate__animated animate__zoomIn">
        <div class="employee-image-container relative">
          <div class="image-upload-wrapper">
            <div class="image-preview" @click="triggerFileInput">
              <img
                v-if="employeeImage"
                :src="employeeImage"
                alt="Ảnh nhân viên"
                class="employee-avatar"
              />
              <div v-else class="image-placeholder">
                <i class="bi bi-camera-fill upload-icon"></i>
                <span class="upload-text">Chọn ảnh</span>
                <span class="upload-subtext">JPG, PNG tối đa 5MB</span>
              </div>
            </div>
            <div class="upload-overlay" @click="triggerFileInput">
              <i class="bi bi-camera-fill"></i>
            </div>
            <button
              v-if="employeeImage"
              class="remove-image-btn"
              @click.stop="removeImage"
              title="Xóa ảnh"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <input
            ref="fileInput"
            type="file"
            class="d-none"
            accept="image/*"
            @change="handleImageUpload"
          />
        </div>
      </div>

      <!-- Form Fields -->
      <div class="row g-4">
        <div class="col-md-6">
          <label class="filter-label">Tên nhân viên</label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập tên nhân viên"
            v-model.trim="employee.tenNhanVien"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">Số điện thoại</label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập số điện thoại"
            v-model.trim="employee.soDienThoai"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">CCCD</label>
          <div class="input-group">
            <input
              type="text"
              class="form-control search-input"
              placeholder="Nhập CCCD"
              v-model.trim="employee.cccd"
            />
            <button
              class="btn btn-outline-action"
              title="Quét mã QR"
              @click="startScanning"
            >
              <i class="bi bi-qr-code"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <label class="filter-label">Email</label>
          <input
            type="email"
            class="form-control search-input"
            placeholder="Nhập email"
            v-model.trim="employee.email"
          />
        </div>
        <div class="col-md-4">
          <label class="filter-label">Tỉnh/Thành phố</label>
          <select
            class="form-control date-input"
            v-model="employee.thanhPho"
            @change="fetchDistricts"
          >
            <option value="" disabled>Chọn tỉnh/thành phố</option>
            <option v-for="province in provinces" :key="province.code" :value="province.name">
              {{ province.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">Quận/Huyện</label>
          <select
            class="form-control date-input"
            v-model="employee.quan"
            @change="fetchWards"
          >
            <option value="" disabled>Chọn quận/huyện</option>
            <option v-for="district in districts" :key="district.code" :value="district.name">
              {{ district.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">Xã/Phường</label>
          <select class="form-control date-input" v-model="employee.phuong">
            <option value="" disabled>Chọn xã/phường</option>
            <option v-for="ward in wards" :key="ward.code" :value="ward.name">
              {{ ward.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label class="filter-label">Địa chỉ cụ thể</label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập địa chỉ cụ thể"
            v-model.trim="employee.diaChiCuThe"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">Ngày sinh</label>
          <input
            type="date"
            class="form-control date-input"
            v-model="employee.ngaySinh"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">Giới tính</label>
          <div class="gender-options">
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nam"
                value="False"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nam">Nam</label>
            </div>
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nu"
                value="True"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nu">Nữ</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-5">
        <button type="button" class="btn btn-reset" @click="goBack">Hủy</button>
        <button class="btn btn-action" @click="showConfirmModal">
          {{ isEditMode ? 'Cập Nhật' : 'Thêm' }}
        </button>
      </div>

      <ToastNotification ref="toastNotification" />
      <NotificationModal
        ref="notificationModal"
        :type="'confirm'"
        :message="'Bạn có chắc chắn muốn ' + (isEditMode ? 'cập nhật' : 'thêm') + ' nhân viên này không?'"
        :confirmText="'Xác nhận'"
        :onConfirm="submitForm"
        :onCancel="closeConfirmModal"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import { Html5Qrcode } from 'html5-qrcode';
import { addNhanVien, getNhanVienDetail, UpdateNhanVien } from '../../store/modules/employees/nhanVien';
import axios from 'axios';

export default {
  name: 'NhanVienForm',
  components: {
    HeaderCard,
    ToastNotification,
    NotificationModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const fileInput = ref(null);
    const isScanning = ref(false);
    const employeeImage = ref(null);
    const existingEmployeeImage = ref(null);
    const toastNotification = ref(null);
    const notificationModal = ref(null);
    const html5QrCode = ref(null);
    const provinces = ref([]);
    const districts = ref([]);
    const wards = ref([]);
    const selectedProvinceCode = ref('');
    const selectedDistrictCode = ref('');

    const employee = ref({
      id: null,
      tenNhanVien: '',
      soDienThoai: '',
      cccd: '',
      email: '',
      diaChiCuThe: '',
      ngaySinh: '',
      gioiTinh: '',
      thanhPho: '',
      quan: '',
      phuong: '',
    });

    const isEditMode = computed(() => !!route.params.id);

    const fetchProvinces = async () => {
      const cachedProvinces = localStorage.getItem('provinces');
      if (cachedProvinces) {
        provinces.value = JSON.parse(cachedProvinces);
        return;
      }
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        provinces.value = response.data;
        localStorage.setItem('provinces', JSON.stringify(provinces.value));
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể tải danh sách tỉnh/thành phố!',
        });
      }
    };

    const fetchDistricts = async () => {
      districts.value = [];
      wards.value = [];
      const province = provinces.value.find(p => p.name === employee.value.thanhPho);
      if (!province) return;

      const cacheKey = `districts_${province.code}`;
      const cachedDistricts = localStorage.getItem(cacheKey);
      if (cachedDistricts) {
        districts.value = JSON.parse(cachedDistricts);
        return;
      }

      selectedProvinceCode.value = province.code;
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
        districts.value = response.data.districts;
        localStorage.setItem(cacheKey, JSON.stringify(districts.value));
      } catch (error) {
        console.error('Lỗi khi tải danh sách quận/huyện:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể tải danh sách quận/huyện!',
        });
      }
    };

    const fetchWards = async () => {
      wards.value = [];
      const district = districts.value.find(d => d.name === employee.value.quan);
      if (!district) return;

      const cacheKey = `wards_${district.code}`;
      const cachedWards = localStorage.getItem(cacheKey);
      if (cachedWards) {
        wards.value = JSON.parse(cachedWards);
        return;
      }

      selectedDistrictCode.value = district.code;
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
        wards.value = response.data.wards;
        localStorage.setItem(cacheKey, JSON.stringify(wards.value));
      } catch (error) {
        console.error('Lỗi khi tải danh sách xã/phường:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể tải danh sách xã/phường!',
        });
      }
    };

    const startScanning = async () => {
      isScanning.value = true;
      await nextTick();
      try {
        html5QrCode.value = new Html5Qrcode('qr-reader');
        await html5QrCode.value.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleQrCodeResult,
          (error) => console.warn('Lỗi quét QR:', error)
        );
      } catch (error) {
        console.error('Lỗi khởi động camera:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Không thể khởi động quét mã QR! Vui lòng kiểm tra quyền camera.',
        });
        stopScanning();
      }
    };

    const stopScanning = async () => {
      if (html5QrCode.value) {
        try {
          await html5QrCode.value.stop();
          html5QrCode.value.clear();
        } catch (error) {
          console.error('Lỗi dừng quét QR:', error);
        }
      }
      isScanning.value = false;
    };

    const handleQrCodeResult = async (decodedText) => {
      try {
        const qrData = decodedText.split('|');
        if (qrData.length < 6) throw new Error('Dữ liệu mã QR không hợp lệ');

        const [cccd, , hoTen, ngaySinh, gioiTinh, diaChi] = qrData;
        if (!cccd || cccd.length !== 12 || isNaN(cccd)) throw new Error('Số CCCD không hợp lệ');
        if (!hoTen || !diaChi) throw new Error('Họ tên hoặc địa chỉ không hợp lệ');

        employee.value.cccd = cccd;
        employee.value.tenNhanVien = hoTen;
        employee.value.ngaySinh = formatDate(ngaySinh);
        employee.value.gioiTinh = gioiTinh === 'Nam' ? 'False' : 'True';

        const addressParts = parseAddress(diaChi);
        employee.value.thanhPho = provinces.value.find(p => normalizeName(p.name) === normalizeName(addressParts.thanhPho))?.name || addressParts.thanhPho;
        employee.value.diaChiCuThe = addressParts.diaChiCuThe;

        await fetchDistricts();
        employee.value.quan = districts.value.find(d => normalizeName(d.name) === normalizeName(addressParts.quan))?.name || addressParts.quan;

        await fetchWards();
        employee.value.phuong = wards.value.find(w => normalizeName(w.name) === normalizeName(addressParts.phuong))?.name || addressParts.phuong;

        toastNotification.value.addToast({ type: 'success', message: 'Quét mã QR thành công!' });
      } catch (error) {
        toastNotification.value.addToast({ type: 'error', message: `Lỗi: ${error.message}` });
      } finally {
        stopScanning();
      }
    };

    const formatDate = (dateString) => {
      if (!dateString || dateString.length !== 8 || isNaN(dateString)) return '';
      return `${dateString.slice(4, 8)}-${dateString.slice(2, 4)}-${dateString.slice(0, 2)}`;
    };

    const parseAddress = (address) => {
      const parts = address.replace(/\s+/g, ' ').trim().split(/,\s*/);
      return {
        diaChiCuThe: parts[0] || '',
        phuong: parts[1] || '',
        quan: parts[2] || '',
        thanhPho: parts[3] || parts[parts.length - 1] || '',
      };
    };

    const normalizeName = (name) => name ? name.replace(/^(Thị trấn|Quận|Phường|Xã|Huyện|Thành phố)\s+/i, '').replace(/\s+/g, ' ').trim().toLowerCase() : '';

    const loadEmployeeData = async () => {
      if (!isEditMode.value) return;
      try {
        const employeeId = parseInt(route.params.id);
        const result = await getNhanVienDetail(employeeId);
        if (result.success) {
          const { data } = result;
          employee.value = {
            id: data.id,
            tenNhanVien: data.tenNhanVien || '',
            soDienThoai: data.idTaiKhoan?.soDienThoai || '',
            cccd: data.cccd || '',
            email: data.idTaiKhoan?.email || '',
            diaChiCuThe: data.diaChiCuThe || '',
            ngaySinh: data.ngaySinh?.substring(0, 10) || '',
            gioiTinh: data.gioiTinh ? 'True' : 'False',
            thanhPho: data.thanhPho || '',
            quan: data.quan || '',
            phuong: data.phuong || '',
          };
          employeeImage.value = data.anhNhanVien || null;
          existingEmployeeImage.value = data.anhNhanVien || null;

          if (employee.value.thanhPho) {
            await fetchDistricts();
            if (employee.value.quan) await fetchWards();
          }
        } else {
          toastNotification.value.addToast({ type: 'error', message: result.message || 'Lỗi khi tải dữ liệu nhân viên!' });
        }
      } catch (error) {
        toastNotification.value.addToast({ type: 'error', message: 'Lỗi khi tải dữ liệu nhân viên!' });
      }
    };

    const triggerFileInput = () => fileInput.value?.click();

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toastNotification.value.addToast({ type: 'error', message: 'Kích thước file không được vượt quá 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh' });
        return;
      }
      employeeImage.value = URL.createObjectURL(file);
    };

    const removeImage = () => {
      employeeImage.value = null;
      existingEmployeeImage.value = null;
      if (fileInput.value) fileInput.value.value = '';
    };

    const showConfirmModal = () => {
      if (!employeeImage.value && !isEditMode.value) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng chọn ảnh nhân viên!' });
        return;
      }
      if (!employee.value.tenNhanVien || !/^[a-zA-ZÀ-ỹ\s]{2,30}$/.test(employee.value.tenNhanVien)) {
        toastNotification.value.addToast({ type: 'error', message: 'Tên nhân viên phải từ 2-30 ký tự, chỉ chứa chữ cái và khoảng trắng!' });
        return;
      }
      if (!employee.value.soDienThoai || !/^(03|05|07|08|09)\d{8}$/.test(employee.value.soDienThoai)) {
        toastNotification.value.addToast({ type: 'error', message: 'Số điện thoại không hợp lệ!' });
        return;
      }
      if (!employee.value.cccd || !/^\d{12}$/.test(employee.value.cccd)) {
        toastNotification.value.addToast({ type: 'error', message: 'CCCD phải là 12 chữ số!' });
        return;
      }
      if (!employee.value.email) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng nhập email!' });
        return;
      }
      if (!employee.value.diaChiCuThe) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng nhập địa chỉ cụ thể!' });
        return;
      }
      if (!employee.value.gioiTinh) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng chọn giới tính!' });
        return;
      }
      if (!employee.value.ngaySinh) {
        toastNotification.value.addToast({ type: 'error', message: 'Vui lòng nhập ngày sinh!' });
        return;
      }
      const [year, month, day] = employee.value.ngaySinh.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      if (isNaN(inputDate.getTime()) || inputDate > new Date()) {
        toastNotification.value.addToast({ type: 'error', message: 'Ngày sinh không hợp lệ hoặc vượt quá ngày hiện tại!' });
        return;
      }
      notificationModal.value.openModal();
    };

    const closeConfirmModal = () => notificationModal.value.closeModal();

    const submitForm = async () => {
      const formData = new FormData();
      formData.append('tenNhanVien', employee.value.tenNhanVien);
      formData.append('soDienThoai', employee.value.soDienThoai);
      formData.append('cccd', employee.value.cccd);
      formData.append('email', employee.value.email);
      formData.append('diaChiCuThe', employee.value.diaChiCuThe);
      formData.append('ngaySinh', employee.value.ngaySinh);
      formData.append('gioiTinh', employee.value.gioiTinh === 'True');
      formData.append('thanhPho', employee.value.thanhPho);
      formData.append('quan', employee.value.quan);
      formData.append('phuong', employee.value.phuong);

      const file = fileInput.value?.files[0];
      if (file) formData.append('anhNhanVien', file);
      if (isEditMode.value && existingEmployeeImage.value && !file) {
        formData.append('existingAnhNhanVien', existingEmployeeImage.value);
      }

      try {
        const result = isEditMode.value
          ? await UpdateNhanVien(employee.value.id, formData)
          : await addNhanVien(formData);
        toastNotification.value.addToast({
          type: 'success',
          message: isEditMode.value ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!',
        });
        setTimeout(() => {
          resetForm();
          goBack();
        }, 1000);
      } catch (error) {
        toastNotification.value.addToast({
          type: 'error',
          message: error.response?.data?.message || 'Lỗi khi lưu nhân viên!',
        });
      }
    };

    const resetForm = () => {
      employee.value = {
        id: null,
        tenNhanVien: '',
        soDienThoai: '',
        cccd: '',
        email: '',
        diaChiCuThe: '',
        ngaySinh: '',
        gioiTinh: '',
        thanhPho: '',
        quan: '',
        phuong: '',
      };
      employeeImage.value = null;
      existingEmployeeImage.value = null;
      if (fileInput.value) fileInput.value.value = '';
    };

    const goBack = () => router.push('/nhanVien');

    onMounted(async () => {
      await fetchProvinces();
      await loadEmployeeData();
    });

    return {
      fileInput,
      isScanning,
      employeeImage,
      existingEmployeeImage,
      employee,
      toastNotification,
      notificationModal,
      isEditMode,
      triggerFileInput,
      handleImageUpload,
      removeImage,
      submitForm,
      goBack,
      provinces,
      districts,
      wards,
      fetchDistricts,
      fetchWards,
      startScanning,
      stopScanning,
      showConfirmModal,
      closeConfirmModal,
    };
  },
};
</script>

<style scoped>
.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.employee-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-upload-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 12px;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
}

.image-preview:hover {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  transform: scale(1.02);
}

.employee-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  padding: 30px;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: #94a3b8;
}

.upload-text {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.upload-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(52, 211, 153, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.upload-overlay i {
  font-size: 2rem;
  color: white;
}

.image-preview:hover .upload-overlay {
  opacity: 1;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.filter-label {
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.search-input,
.date-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus,
.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  outline: none;
}

.input-group .search-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.btn-outline-action {
  border: 2px solid #34d399;
  color: #34d399;
  background: white;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 12px 16px;
}

.btn-outline-action:hover {
  background: #34d399;
  color: white;
}

.gender-options {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.custom-radio .form-check-input {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 8px;
}

.custom-radio .form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.custom-radio .form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-reset {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

.btn-reset:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.btn-action {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(52, 211, 153, 0.4);
}

@media (max-width: 768px) {
  .gender-options {
    flex-direction: column;
    gap: 12px;
  }
  .action-buttons {
    flex-direction: column;
  }
  .image-upload-wrapper {
    width: 120px;
    height: 120px;
  }
}
</style>