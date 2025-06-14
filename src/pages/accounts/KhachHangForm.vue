<template>
  <div class="container-fluid py-4 customer-form">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Khách Hàng' : 'Thêm Khách Hàng'"
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

      <!-- Customer Image -->
      <div class="flex justify-center mb-6 animate__animated animate__zoomIn">
        <div class="employee-image-container relative">
          <div class="image-upload-wrapper">
            <div
              class="image-preview"
              @click="triggerFileInput"
            >
              <img
                v-if="customerImage"
                :src="customerImage"
                alt="Ảnh khách hàng"
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
              v-if="customerImage"
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
            Tên khách hàng
          </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập tên khách hàng"
            v-model="customer.ten"
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
            v-model="customer.soDienThoai"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Email
          </label>
          <input
            type="email"
            class="form-control search-input"
            placeholder="Nhập email"
            v-model="customer.email"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label">
            Ngày sinh
          </label>
          <input
            type="date"
            class="form-control date-input"
            v-model="customer.ngaySinh"
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
                v-model="customer.gioiTinh"
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
                v-model="customer.gioiTinh"
              />
              <label class="form-check-label" for="nu">
                Nữ
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Address Management Section -->
      <div class="address-management-section mt-5">
        <div class="section-header">
          <div class="section-title">
            <i class="bi bi-geo-alt-fill section-icon"></i>
            <h2 class="title-text">Quản lý địa chỉ</h2>
            <span class="address-count">{{ addresses.length }} địa chỉ</span>
          </div>
          <button
            class="btn btn-add-address"
            @click="showAddAddress = true"
          >
            Thêm địa chỉ
          </button>
        </div>

        <div class="section-divider"></div>

        <!-- Add Address Form -->
        <div
          v-if="showAddAddress"
          class="add-address-form animate__animated animate__slideInDown"
        >
          <div class="form-header">
            <h3 class="form-title">
              Thêm địa chỉ mới
            </h3>
            <button class="btn-close-form" @click="cancelAddAddress">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="form-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">
                  Địa chỉ cụ thể
                </label>
                <input
                  type="text"
                  class="form-control modern-input"
                  placeholder="Nhập số nhà, tên đường..."
                  v-model="newAddress.diaChi"
                />
              </div>
              
              <div class="col-md-4">
                <label class="form-label">
                  Tỉnh/Thành phố
                </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.tinhThanh"
                >
                  <option value="" disabled>Chọn tỉnh/thành phố</option>
                  <option v-for="tinh in tinhThanhList" :key="tinh" :value="tinh">{{ tinh }}</option>
                </select>
              </div>
              
              <div class="col-md-4">
                <label class="form-label">
                  Quận/Huyện
                </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.quanHuyen"
                >
                  <option value="" disabled>Chọn quận/huyện</option>
                  <option v-for="quan in quanHuyenList" :key="quan" :value="quan">{{ quan }}</option>
                </select>
              </div>
              
              <div class="col-md-4">
                <label class="form-label">
                  Xã/Phường
                </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.xaPhuong"
                >
                  <option value="" disabled>Chọn xã/phường</option>
                  <option v-for="xa in xaPhuongList" :key="xa" :value="xa">{{ xa }}</option>
                </select>
              </div>
              
              <div class="col-12">
                <div class="form-check-wrapper">
                  <input
                    class="form-check-input modern-checkbox"
                    type="checkbox"
                    id="defaultAddress"
                    v-model="newAddress.isDefault"
                  />
                  <label class="form-check-label" for="defaultAddress">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-save" @click="addAddress">
              Lưu địa chỉ
            </button>
            <button class="btn btn-cancel" @click="cancelAddAddress">
              Hủy bỏ
            </button>
          </div>
        </div>

        <!-- Address List -->
        <div class="address-list">
          <div v-if="addresses.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <h4 class="empty-title">Chưa có địa chỉ nào</h4>
            <p class="empty-text">Thêm địa chỉ đầu tiên cho khách hàng</p>
            <button class="btn btn-empty-action" @click="showAddAddress = true">
              Thêm địa chỉ ngay
            </button>
          </div>

          <div v-else class="address-grid">
            <div
              v-for="(address, index) in addresses"
              :key="index"
              class="address-card animate__animated animate__fadeInUp"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="card-header">
                <div class="address-info">
                  <h5 class="address-title">
                    <i class="bi bi-geo-alt-fill me-2"></i>
                    Địa chỉ {{ index + 1 }}
                  </h5>
                  <div class="address-badges">
                    <span v-if="address.isDefault" class="badge badge-default">
                      <i class="bi bi-star-fill me-1"></i>
                      Mặc định
                    </span>
                  </div>
                </div>
                <div class="card-actions">
                  <button
                    class="btn-action btn-edit"
                    @click="editAddress(index)"
                    title="Chỉnh sửa"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn-action btn-delete"
                    @click="confirmDeleteAddress(index)"
                    title="Xóa"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">
                      <i class="bi bi-house-door me-2"></i>
                      Địa chỉ cụ thể
                    </label>
                    <input
                      type="text"
                      class="form-control modern-input"
                      v-model="address.diaChi"
                    />
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-building me-2"></i>
                      Tỉnh/Thành phố
                    </label>
                    <select
                      class="form-select modern-select"
                      v-model="address.tinhThanh"
                    >
                      <option value="" disabled>Chọn tỉnh/thành phố</option>
                      <option v-for="tinh in tinhThanhList" :key="tinh" :value="tinh">{{ tinh }}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-signpost me-2"></i>
                      Quận/Huyện
                    </label>
                    <select
                      class="form-select modern-select"
                      v-model="address.quanHuyen"
                    >
                      <option value="" disabled>Chọn quận/huyện</option>
                      <option v-for="quan in quanHuyenList" :key="quan" :value="quan">{{ quan }}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-geo me-2"></i>
                      Xã/Phường
                    </label>
                    <select
                      class="form-select modern-select"
                      v-model="address.xaPhuong"
                    >
                      <option value="" disabled>Chọn xã/phường</option>
                      <option v-for="xa in xaPhuongList" :key="xa" :value="xa">{{ xa }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="form-check-wrapper">
                  <input
                    class="form-check-input modern-checkbox"
                    type="checkbox"
                    :id="`defaultAddr${index}`"
                    v-model="address.isDefault"
                    @change="setDefaultAddress(index)"
                  />
                  <label class="form-check-label" :for="`defaultAddr${index}`">
                    <i class="bi bi-star-fill me-2"></i>
                    Địa chỉ mặc định
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-5">
        <button type="button" class="btn btn-reset" @click="goBack">
          Hủy
        </button>
        <button class="btn btn-action" @click="submitCustomer">
          {{ isEditMode ? 'Cập Nhật' : 'Thêm' }}
        </button>
      </div>
    </div>

    <NotificationModal
      ref="notificationModal"
      :type="notificationType"
      :message="notificationMessage"
      :isLoading="isNotificationLoading"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      @close="resetNotification"
    />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";

const router = useRouter();
const route = useRoute();
const fileInput = ref(null);
const isScanning = ref(false);
const customerImage = ref(null);
const toastNotification = ref(null);
const notificationModal = ref(null);

const isEditMode = computed(() => !!route.params.id);

const customer = ref({
  id: null,
  ten: '',
  soDienThoai: '',
  email: '',
  ngaySinh: '',
  gioiTinh: '',
});

const showAddAddress = ref(false);
const newAddress = ref({
  diaChi: '',
  tinhThanh: '',
  quanHuyen: '',
  xaPhuong: '',
  isDefault: false,
});
const addresses = ref([]);
const notificationType = ref('');
const notificationMessage = ref('');
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(null);
const notificationOnCancel = ref(null);

// Mock location data
const tinhThanhList = ref(['Hà Nội', 'TP.HCM', 'Đà Nẵng']);
const quanHuyenList = ref(['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy']);
const xaPhuongList = ref(['Phúc Xá', 'Hàng Mã', 'Yên Hòa']);

const loadCustomerData = () => {
  if (isEditMode.value) {
    const customerId = parseInt(route.params.id);
    const customerData = {
      id: customerId,
      ten: `Khách hàng ${customerId}`,
      soDienThoai: '0123456789',
      email: `khach${customerId}@example.com`,
      ngaySinh: '1990-01-01',
      gioiTinh: 'Nam',
    };
    if (customerData) {
      customer.value = { ...customerData };
      customerImage.value = `/path/to/customer/${customerId}.jpg`;
      addresses.value = [
        { diaChi: 'Số 123, Đường ABC', tinhThanh: 'Hà Nội', quanHuyen: 'Ba Đình', xaPhuong: 'Phúc Xá', isDefault: true },
        { diaChi: 'Số 456, Đường XYZ', tinhThanh: 'TP.HCM', quanHuyen: 'Quận 1', xaPhuong: 'Phường Bến Nghé', isDefault: false },
      ];
    } else {
      toastNotification.value.addToast({
        type: 'error',
        message: 'Không tìm thấy khách hàng!',
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
    if (file.size > 5 * 1024 * 1024) {
      toastNotification.value.addToast({
        type: 'error',
        message: 'Kích thước file không được vượt quá 5MB',
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toastNotification.value.addToast({
        type: 'error',
        message: 'Vui lòng chọn file hình ảnh',
      });
      return;
    }
    customerImage.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  customerImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const addAddress = () => {
  if (!newAddress.value.diaChi.trim()) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng nhập địa chỉ cụ thể!',
    });
    return;
  }
  
  if (newAddress.value.isDefault) {
    addresses.value.forEach(addr => (addr.isDefault = false));
  }
  addresses.value.push({ ...newAddress.value });
  newAddress.value = { diaChi: '', tinhThanh: '', quanHuyen: '', xaPhuong: '', isDefault: false };
  showAddAddress.value = false;
  
  toastNotification.value.addToast({
    type: 'success',
    message: 'Thêm địa chỉ thành công!',
  });
};

const cancelAddAddress = () => {
  newAddress.value = { diaChi: '', tinhThanh: '', quanHuyen: '', xaPhuong: '', isDefault: false };
  showAddAddress.value = false;
};

const editAddress = (index) => {
  newAddress.value = { ...addresses.value[index] };
  showAddAddress.value = true;
  addresses.value.splice(index, 1);
};

const confirmDeleteAddress = (index) => {
  notificationMessage.value = 'Bạn có chắc chắn muốn xóa địa chỉ này không?';
  notificationType.value = 'confirm';
  notificationOnConfirm.value = () => deleteAddress(index);
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const deleteAddress = (index) => {
  addresses.value.splice(index, 1);
  resetNotification();
  toastNotification.value.addToast({
    type: 'success',
    message: 'Xóa địa chỉ thành công!',
  });
};

const setDefaultAddress = (index) => {
  if (addresses.value[index].isDefault) {
    addresses.value.forEach((addr, i) => {
      addr.isDefault = i === index;
    });
    toastNotification.value.addToast({
      type: 'success',
      message: 'Đã đặt làm địa chỉ mặc định!',
    });
  }
};

const submitCustomer = () => {
  if (!customer.value.ten || !customer.value.ten.trim()) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng nhập tên khách hàng!',
    });
    return;
  }
  if (!customer.value.soDienThoai || !customer.value.soDienThoai.trim()) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng nhập số điện thoại!',
    });
    return;
  }
  if (!customer.value.email || !customer.value.email.trim()) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng nhập email!',
    });
    return;
  }

  notificationMessage.value = isEditMode.value
    ? 'Bạn có chắc chắn muốn cập nhật khách hàng này không?'
    : 'Bạn có chắc chắn muốn thêm khách hàng này không?';
  notificationType.value = 'confirm';
  notificationOnConfirm.value = () => saveCustomer();
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const saveCustomer = () => {
  resetNotification();
  toastNotification.value.addToast({
    type: 'success',
    message: isEditMode.value ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!',
  });
  setTimeout(() => {
    resetForm();
    goBack();
  }, 1500);
};

const resetForm = () => {
  customer.value = {
    id: null,
    ten: '',
    soDienThoai: '',
    email: '',
    ngaySinh: '',
    gioiTinh: '',
  };
  customerImage.value = null;
  addresses.value = [];
  if (fileInput.value) fileInput.value.value = '';
};

const goBack = () => {
  router.push('/khachHang');
};

const resetNotification = () => {
  notificationMessage.value = '';
  notificationType.value = '';
  notificationOnConfirm.value = null;
  notificationOnCancel.value = null;
};

// Lifecycle
onMounted(() => {
  loadCustomerData();
});
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

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
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

.custom-radio .form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

/* Address Management Section */
.address-management-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 1.5rem;
  color: #34d399;
}

.title-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.address-count {
  background: #e0f2fe;
  color: #0277bd;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-add-address {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
}

.btn-add-address:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, #34d399, #a7f3d0, #34d399);
  border-radius: 2px;
  margin-bottom: 24px;
}

/* Add Address Form */
.add-address-form {
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-header {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.btn-close-form {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-close-form:hover {
  background: #f3f4f6;
  color: #374151;
}

.form-body {
  padding: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.modern-input,
.modern-select {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  width: 100%;
}

.modern-input:focus,
.modern-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  outline: none;
}

.form-check-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.modern-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.modern-checkbox:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  margin: 0;
}

.form-actions {
  padding: 20px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-save {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
}

.btn-save:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
}

/* Address List */
.address-list {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon i {
  font-size: 2rem;
  color: #9ca3af;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-empty-action {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-empty-action:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
}

.address-grid {
  display: grid;
  gap: 20px;
}

.address-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.address-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15);
  border-color: #34d399;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.address-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.address-badges {
  display: flex;
  gap: 8px;
}

.badge-default {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-edit {
  background: #dbeafe;
  color: #2563eb;
}

.btn-edit:hover {
  background: #bfdbfe;
  transform: scale(1.1);
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.card-body {
  padding: 24px;
}

.card-footer {
  padding: 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 24px 0;
}

.btn-reset {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
}

.btn-reset:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.btn-action {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
  min-width: 120px;
}

.btn-action:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

/* QR Scanner Styles */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-opacity-50 {
  --tw-bg-opacity: 0.5;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.z-50 {
  z-index: 50;
}

.bg-white {
  background-color: white;
}

.p-6 {
  padding: 1.5rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.w-72 {
  width: 18rem;
}

.h-72 {
  height: 18rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mt-4 {
  margin-top: 1rem;
}

.w-100 {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .address-card {
    margin-bottom: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .address-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .card-actions {
    justify-content: center;
  }
  
  .gender-options {
    flex-direction: column;
    gap: 12px;
  }
}

/* Animation Classes */
.animate__animated {
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

.animate__zoomIn {
  animation-name: zoomIn;
}

.animate__slideInDown {
  animation-name: slideInDown;
}

/* Loading Animation */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom Scrollbar */
.address-management-section::-webkit-scrollbar {
  width: 6px;
}

.address-management-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.address-management-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.address-management-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus Styles for Accessibility */
.btn-add-address:focus,
.btn-save:focus,
.btn-cancel:focus,
.btn-action:focus,
.btn-reset:focus {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}

.modern-input:focus,
.modern-select:focus,
.search-input:focus,
.date-input:focus {
  outline: none;
}

/* Print Styles */
@media print {
  .action-buttons,
  .btn-add-address,
  .card-actions,
  .form-actions {
    display: none;
  }
  
  .address-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>