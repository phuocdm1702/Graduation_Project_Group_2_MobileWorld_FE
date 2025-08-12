<template>
  <div class="container-fluid py-4">
    <HeaderCard title="Thông Tin Tài Khoản" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" :backgroundOpacity="0.95" />
    <ToastNotification ref="toast" />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="loading-text mt-2">Đang xử lý...</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-4">
      <!-- Profile Card -->
      <div class="col-lg-6">
        <div class="profile-card bg-white rounded-lg shadow-sm animate__animated animate__fadeInLeft">
          <div class="profile-header">
            <div class="profile-avatar">
              <img :src="getProfileImage()" :alt="formData.username || 'Avatar'" class="avatar-image" @error="handleImageError" />
              <div class="avatar-overlay">
                <i class="bi bi-camera-fill"></i>
              </div>
            </div>
            <div class="profile-info">
              <h4 class="profile-name">{{ formData.username || 'Chưa có tên' }}</h4>
              <div class="profile-role">
                <span class="role-badge" :class="getRoleClass()">
                  <i class="bi" :class="getRoleIcon()"></i>
                  {{ formData.role || 'Nhân viên' }}
                </span>
              </div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Bảo mật</div>
                <div class="stat-value">Cao</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <i class="bi bi-clock-history"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Hoạt động</div>
                <div class="stat-value">Online</div>
              </div>
            </div>
          </div>

          <div class="profile-additional">
            <div class="additional-item">
              <div class="additional-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="additional-content">
                <div class="additional-label">Ngày tạo</div>
                <div class="additional-value">{{ formatDate(formData.createdAt) }}</div>
              </div>
            </div>
            <div class="additional-item">
              <div class="additional-icon">
                <i class="bi bi-clock"></i>
              </div>
              <div class="additional-content">
                <div class="additional-label">Lần cuối đăng nhập</div>
                <div class="additional-value">{{ formatDate(formData.lastLogin) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Details -->
      <div class="col-lg-6">
        <div class="details-card bg-white rounded-lg shadow-sm animate__animated animate__fadeInRight">
          <div class="card-header">
            <h5 class="card-title">
              <i class="bi bi-info-circle me-2"></i>
              Chi Tiết Tài Khoản
            </h5>
          </div>

          <div class="card-body">
            <div class="row g-4">
              <!-- Basic Information Section -->
              <div class="col-12" style="margin-top: .5rem;">
                <div class="section-title">
                  <i class="bi bi-person-badge me-2"></i>
                  Thông Tin Cơ Bản
                </div>
              </div>

              <!-- Username -->
              <div class="col-12" style="margin-top: .5rem;">
                <label class="filter-label">Tên Đăng Nhập</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-person"></i></span>
                  <input type="text" id="username" class="form-control search-input" v-model="formData.username" placeholder="Nhập tên đăng nhập" disabled />
                </div>
              </div>

              <!-- Status -->
              <div class="col-md-6">
                <label class="filter-label">Trạng Thái</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i :class="getStatusIcon()" :style="{ color: getStatusColor() }"></i>
                  </span>
                  <input type="text" id="status" class="form-control search-input" :value="getStatusText()" disabled />
                </div>
              </div>

              <!-- Role -->
              <div class="col-md-6">
                <label class="filter-label">Vai Trò</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i :class="getRoleIcon()" :style="{ color: getRoleColor() }"></i>
                  </span>
                  <input type="text" id="role" class="form-control search-input" :value="formData.role || 'Nhân viên'" disabled />
                </div>
              </div>

              <!-- Contact Information Section -->
              <div class="col-12" style="margin-top: .5rem;">
                <div class="section-title">
                  <i class="bi bi-envelope-at me-2"></i>
                  Thông Tin Liên Hệ
                </div>
              </div>

              <!-- Phone Number -->
              <div class="col-12" style="margin-top: .5rem;">
                <label class="filter-label">Số Điện Thoại</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                  <input type="tel" id="phone" class="form-control search-input" v-model="formData.phone" placeholder="Nhập số điện thoại" disabled />
                </div>
              </div>

              <!-- Email -->
              <div class="col-12" style="margin-top: .5rem;">
                <label class="filter-label">Email</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                  <input type="email" id="email" class="form-control search-input" v-model="formData.email" placeholder="Nhập email" disabled />
                </div>
              </div>

              <!-- Security Information Section -->
              <div class="col-12" style="margin-top: .5rem;">
                <div class="section-title">
                  <i class="bi bi-shield-lock me-2"></i>
                  Thông Tin Bảo Mật
                </div>
              </div>

              <!-- Password -->
              <div class="col-12" style="margin-top: .5rem;">
                <label class="filter-label">Mật Khẩu</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input :type="showPassword ? 'text' : 'password'" id="password" class="form-control search-input" v-model="formData.password" placeholder="Mật khẩu đã được mã hóa" disabled />
                  <button class="btn btn-outline-action" type="button" @click="togglePassword">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="col-12" style="margin-top: .5rem;">
                <div class="alert alert-danger d-flex align-items-center animate__animated animate__shakeX" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Panel -->
      <div class="col-12" style="margin-top: .5rem;">
        <div class="action-panel bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp">
          <div class="action-content">
            <div class="action-info">
              <h6 class="action-title">Quản Lý Phiên Làm Việc</h6>
              <p class="action-description">Đăng xuất khỏi hệ thống để bảo mật tài khoản của bạn.</p>
            </div>
            <div class="action-buttons">
              <button type="button" class="btn btn-reset" @click="handleLogout" :disabled="isLoading">
                <i class="bi bi-box-arrow-right me-2"></i>
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import axios from 'axios';
import HeaderCard from '@/components/common/HeaderCard.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const authStore = useAuthStore();
const router = useRouter();
const toast = ref(null);
const isLoading = ref(false);
const error = ref('');
const showPassword = ref(false);
const imageLoadError = ref(false);

const formData = ref({
  username: '',
  phone: '',
  email: '',
  password: '********',
  status: 'Hoạt động',
  role: 'Nhân viên',
  capQuyenHan: 2, // Thay permissionLevel thành capQuyenHan
  avatar: '',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
});

const getStatusIcon = () => {
  return formData.value.status === 'Hoạt động' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
};

const getStatusText = () => {
  return formData.value.status;
};

const getStatusColor = () => {
  return formData.value.status === 'Hoạt động' ? '#10b981' : '#ef4444';
};

const getRoleClass = () => {
  return formData.value.capQuyenHan === 1 ? 'role-admin' : 'role-employee';
};

const getRoleIcon = () => {
  return formData.value.capQuyenHan === 1 ? 'bi-shield-fill-check' : 'bi-person-check-fill';
};

const getRoleColor = () => {
  return formData.value.capQuyenHan === 1 ? '#dc2626' : '#059669';
};

const getProfileImage = () => {
  if (imageLoadError.value || !formData.value.avatar) {
    return getDefaultAvatar();
  }
  return formData.value.avatar;
};

const getDefaultAvatar = () => {
  const capQuyenHan = formData.value.capQuyenHan || 2;
  return capQuyenHan === 1
    ? 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=200&font-size=0.6&format=png&rounded=true'
    : 'https://ui-avatars.com/api/?name=Employee&background=059669&color=fff&size=200&font-size=0.6&format=png&rounded=true';
};

const handleImageError = () => {
  imageLoadError.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có thông tin';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Chưa có thông tin';
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (authData.isAuthenticated && authData.user?.username) {
        authStore.login(authData.user);
      } else {
        router.push('/auth/login');
        return;
      }
    } else {
      router.push('/auth/login');
      return;
    }
  }

  try {
    isLoading.value = true;
    const username = authStore.user?.username;

    if (!username) {
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        if (authData.user?.username) {
          const capQuyenHan = authData.user.capQuyenHan || 2;
          formData.value = {
            username: authData.user.username,
            phone: authData.user.phone || '',
            email: authData.user.email || '',
            password: authData.user.password || '********',
            status: authData.user.status || 'Hoạt động',
            role: capQuyenHan === 1 ? 'Admin' : 'Nhân viên',
            capQuyenHan: capQuyenHan,
            avatar: authData.user.avatar || '',
            createdAt: authData.user.createdAt || new Date().toISOString(),
            lastLogin: authData.user.lastLogin || new Date().toISOString(),
          };
          error.value = 'Không thể tải thông tin chi tiết từ server. Hiển thị dữ liệu tạm thời.';
          toast.value?.addToast({
            type: 'warning',
            message: error.value,
            duration: 5000,
          });
          return;
        }
      }
      throw new Error('Không tìm thấy tên đăng nhập.');
    }

    const response = await axios.get(`http://localhost:8080/tai-khoan/thong-tin/${username}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      const capQuyenHan = response.data.idQuyenHan?.capQuyenHan || 2;
      const userData = {
        username: response.data.tenDangNhap || response.data.username || username,
        phone: response.data.soDienThoai || response.data.phone || '',
        email: response.data.email || '',
        password: response.data.matKhau || '********',
        status: response.data.deleted === true ? 'Hoạt động' : 'Đã nghỉ',
        role: capQuyenHan === 1 ? 'Admin' : 'Nhân viên',
        capQuyenHan: capQuyenHan,
        avatar: response.data.avatar || response.data.anhDaiDien || '',
        createdAt: response.data.createdAt || response.data.ngayTao || new Date().toISOString(),
        lastLogin: response.data.lastLogin || response.data.lanCuoiDangNhap || new Date().toISOString(),
      };
      formData.value = { ...userData };
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: userData,
      }));
    } else {
      throw new Error('API trả về mã trạng thái không mong đợi: ' + response.status);
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại.';
    toast.value?.addToast({
      type: 'error',
      message: error.value,
      duration: 5000,
    });
    if (err.response?.status === 401) {
      authStore.logout();
      localStorage.removeItem('auth');
      router.push('/auth/login');
    }
  } finally {
    isLoading.value = false;
  }
});

const handleLogout = () => {
  authStore.logout();
  localStorage.removeItem('auth');
  localStorage.removeItem('username');
  toast.value?.addToast({
    type: 'success',
    message: 'Đăng xuất thành công!',
    duration: 3000,
  });
  router.push('/auth/login');
};
</script>

<style scoped>
.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-text {
  color: white;
  font-size: 1rem;
}

.profile-card,
.details-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.profile-card {
  padding: 2rem;
  text-align: center;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-avatar {
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #34d399;
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.3);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
}

.avatar-overlay i {
  color: white;
  font-size: 0.8rem;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.profile-role {
  margin-bottom: 1rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.role-admin {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.role-employee {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
  border: 1px solid #6ee7b7;
}

.profile-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  color: white;
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-align: left;
}

.stat-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
  text-align: left;
}

.profile-additional {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.additional-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f1f5f9;
  border-radius: 8px;
}

.additional-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #64748b, #475569);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.additional-icon i {
  color: white;
  font-size: 0.9rem;
}

.additional-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  text-align: left;
}

.additional-value {
  font-size: 0.8rem;
  color: #1e293b;
  font-weight: 600;
  text-align: left;
}

.details-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
}

.filter-label {
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.search-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  outline: none;
}

.search-input:disabled {
  background-color: #f8f9fa;
  opacity: 0.7;
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

.alert-danger {
  font-size: 0.9rem;
  border-radius: 12px;
  padding: 12px 16px;
}

.action-panel {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.action-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-reset {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: 0.3s ease;
}

.btn-reset:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
}

.btn-reset:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .profile-card,
  .details-card {
    height: auto;
  }

  .profile-stats {
    flex-direction: column;
  }

  .action-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .profile-card,
  .details-card,
  .action-panel {
    padding: 1rem;
  }

  .avatar-image {
    width: 100px;
    height: 100px;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .profile-stats {
    gap: 0.75rem;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

  .stat-icon i {
    font-size: 0.9rem;
  }

  .profile-additional {
    gap: 0.75rem;
  }

  .additional-icon {
    width: 28px;
    height: 28px;
  }

  .additional-icon i {
    font-size: 0.8rem;
  }

  .card-header {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .filter-label {
    font-size: 0.85rem;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 10px 14px;
  }

  .btn-outline-action {
    padding: 10px 14px;
  }

  .action-title {
    font-size: 1rem;
  }

  .action-description {
    font-size: 0.8rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .btn-reset {
    width: 100%;
    padding: 10px 20px;
  }
}

@media (max-width: 576px) {
  .container-fluid {
    padding: 1rem;
  }

  .avatar-image {
    width: 80px;
    height: 80px;
    border-width: 3px;
  }

  .avatar-overlay {
    width: 28px;
    height: 28px;
    border-width: 2px;
  }

  .profile-name {
    font-size: 1.1rem;
  }

  .role-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-label,
  .stat-value {
    font-size: 0.8rem;
  }

  .additional-label,
  .additional-value {
    font-size: 0.75rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .section-title {
    font-size: 0.9rem;
  }

  .filter-label {
    font-size: 0.8rem;
  }

  .search-input {
    font-size: 0.85rem;
    padding: 8px 12px;
  }

  .btn-outline-action {
    padding: 8px 12px;
  }

  .alert-danger {
    font-size: 0.8rem;
    padding: 10px 12px;
  }

  .action-title {
    font-size: 0.9rem;
  }

  .action-description {
    font-size: 0.75rem;
  }

  .btn-reset {
    font-size: 0.9rem;
    padding: 8px 16px;
  }
}
</style>