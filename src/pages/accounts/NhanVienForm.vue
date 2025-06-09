<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <div class="bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp" style="padding: 1rem;">
      <!-- QR Scanning Section -->
      <div v-if="isScanning" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div id="qr-reader" class="w-72 h-72 mx-auto"></div>
          <button class="mt-4 btn btn-danger w-100" @click="isScanning = false">
            Dừng quét
          </button>
        </div>
      </div>

      <!-- Employee Image -->
      <div class="flex justify-center mb-6 animate__animated animate__zoomIn">
        <div class="employee-image-container relative">
          <div class="image-upload-wrapper">
            <div
              class="image-preview"
              @click="triggerFileInput"
            >
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
            
            <!-- Upload overlay -->
            <div class="upload-overlay" @click="triggerFileInput">
              <i class="bi bi-camera-fill"></i>
            </div>
            
            <!-- Remove button -->
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
          <label class="filter-label">
            Tên nhân viên
          </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập tên nhân viên"
            v-model="employee.tenNhanVien"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Số điện thoại
          </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập số điện thoại"
            v-model="employee.soDienThoai"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            CCCD
          </label>
          <div class="input-group">
            <input
              type="text"
              class="form-control search-input"
              placeholder="Nhập CCCD"
              v-model="employee.cccd"
            />
            <button class="btn btn-outline-action" title="Quét mã QR" @click="isScanning = true">
              <i class="bi bi-qr-code"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Email
          </label>
          <input
            type="email"
            class="form-control search-input"
            placeholder="Nhập email"
            v-model="employee.email"
          />
        </div>
        <div class="col-md-4">
          <label class="filter-label">
            Tỉnh/Thành phố
          </label>
          <select class="form-control date-input" v-model="employee.tinh">
            <option value="" disabled>Chọn tỉnh/thành phố</option>
            <option value="hanoi">Hà Nội</option>
            <option value="hcm">TP. Hồ Chí Minh</option>
            <option value="danang">Đà Nẵng</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">
            Quận/Huyện
          </label>
          <select class="form-control date-input" v-model="employee.quan">
            <option value="" disabled>Chọn quận/huyện</option>
            <option value="quan1">Quận 1</option>
            <option value="quan2">Quận 2</option>
            <option value="quan3">Quận 3</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">
            Xã/Phường
          </label>
          <select class="form-control date-input" v-model="employee.phuong">
            <option value="" disabled>Chọn xã/phường</option>
            <option value="phuong1">Phường 1</option>
            <option value="phuong2">Phường 2</option>
            <option value="phuong3">Phường 3</option>
          </select>
        </div>
        <div class="col-12">
          <label class="filter-label">
            Địa chỉ cụ thể
          </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập địa chỉ cụ thể"
            v-model="employee.diaChi"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Ngày sinh
          </label>
          <input
            type="date"
            class="form-control date-input"
            v-model="employee.ngaySinh"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Giới tính
          </label>
          <div class="gender-options">
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nam"
                value="Nam"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nam">
                Nam
              </label>
            </div>
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nu"
                value="Nữ"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nu">
                Nữ
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-5">
        <button type="button" class="btn btn-reset" @click="goBack">
          Hủy
        </button>
        <button class="btn btn-action" @click="submitForm">
          {{ isEditMode ? 'Cập Nhật' : 'Thêm' }}
        </button>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import HeaderCard from "@/components/common/HeaderCard.vue";
import ToastNotification from '@/components/common/ToastNotification.vue';

export default {
  name: 'NhanVienForm',
  components: {
    HeaderCard,
    ToastNotification,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const fileInput = ref(null);
    const isScanning = ref(false);
    const employeeImage = ref(null);
    const toastNotification = ref(null);

    // Form Data
    const employee = ref({
      id: null,
      tenNhanVien: '',
      soDienThoai: '',
      cccd: '',
      email: '',
      diaChi: '',
      ngaySinh: '',
      gioiTinh: '',
      tinh: '',
      quan: '',
      phuong: ''
    });

    // Computed
    const isEditMode = computed(() => !!route.params.id);

    // Methods
    const loadEmployeeData = () => {
      if (isEditMode.value) {
        // Simulate fetching employee data by ID
        const employeeId = parseInt(route.params.id);
        // Mock data for testing
        const employeeData = {
          id: employeeId,
          tenNhanVien: `Nhân viên ${employeeId}`,
          soDienThoai: '0123456789',
          cccd: '123456789012',
          email: `nhanvien${employeeId}@example.com`,
          diaChi: 'Số 123, Đường ABC',
          ngaySinh: '1990-01-01',
          gioiTinh: 'Nam',
          tinh: 'hanoi',
          quan: 'quan1',
          phuong: 'phuong1'
        };
        
        if (employeeData) {
          employee.value = { ...employeeData };
          // Load employee image if exists
          employeeImage.value = `/path/to/employee/${employeeId}.jpg`; // Example path
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy nhân viên!',
          });
        }
      }
    };

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Kích thước file không được vượt quá 5MB',
          });
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Vui lòng chọn file hình ảnh',
          });
          return;
        }
        
        employeeImage.value = URL.createObjectURL(file);
      }
    };

    const removeImage = () => {
      employeeImage.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const submitForm = () => {
      // Validate form
      if (!employee.value.tenNhanVien || !employee.value.tenNhanVien.trim()) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng nhập tên nhân viên!',
        });
        return;
      }
      
      if (!employee.value.soDienThoai || !employee.value.soDienThoai.trim()) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng nhập số điện thoại!',
        });
        return;
      }

      if (!employee.value.cccd || !employee.value.cccd.trim()) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng nhập CCCD!',
        });
        return;
      }

      if (isEditMode.value) {
        // Update logic (e.g., API call to update employee)
        console.log('Updated employee:', employee.value);
        toastNotification.value.addToast({
          type: 'success',
          message: 'Cập nhật nhân viên thành công!',
        });
      } else {
        // Create logic (e.g., API call to create employee)
        console.log('Created employee:', employee.value);
        toastNotification.value.addToast({
          type: 'success',
          message: 'Thêm nhân viên thành công!',
        });
      }

      // Reset form and navigate back after a delay
      setTimeout(() => {
        resetForm();
        goBack();
      }, 1500);
    };

    const resetForm = () => {
      employee.value = {
        id: null,
        tenNhanVien: '',
        soDienThoai: '',
        cccd: '',
        email: '',
        diaChi: '',
        ngaySinh: '',
        gioiTinh: '',
        tinh: '',
        quan: '',
        phuong: ''
      };
      employeeImage.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const goBack = () => {
      router.push('/nhanVien');
    };

    // Lifecycle
    onMounted(() => {
      loadEmployeeData();
    });

    return {
      fileInput,
      isScanning,
      employeeImage,
      employee,
      toastNotification,
      isEditMode,
      triggerFileInput,
      handleImageUpload,
      removeImage,
      submitForm,
      goBack,
    };
  },
};
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

/* Image Upload Styles */
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
  position: relative;
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
  transition: transform 0.3s ease;
}

.image-preview:hover .employee-avatar {
  transform: scale(1.1);
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
  display: block;
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
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Form Styles */
.filter-label {
  display: block;
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
  background: #ffffff;
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
  transition: all 0.3s ease;
}

.btn-outline-action:hover {
  background: #34d399;
  color: white;
  transform: translateY(-1px);
}

/* Gender Options */
.gender-options {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.custom-radio {
  position: relative;
}

.custom-radio .form-check-input {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.custom-radio .form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.custom-radio .form-check-input:hover {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

.custom-radio .form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Action Buttons */
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset:hover {
  background: #4b5563;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
}

.btn-action {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-action:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(52, 211, 153, 0.4);
}

.btn-action:active {
  transform: translateY(0);
}

/* Responsive */
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