<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Thông Tin Tài Khoản"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />
    <ToastNotification ref="toast" />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="loading-text mt-2">Đang xử lý...</div>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp" style="padding: 1rem">
      <div class="row g-4">
        <!-- Username -->
        <div class="col-md-6">
          <label class="filter-label">Tên Đăng Nhập</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person"></i></span>
            <input
              type="text"
              id="username"
              class="form-control search-input"
              v-model="formData.username"
              placeholder="Nhập tên đăng nhập"
              disabled
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div class="col-md-6">
          <label class="filter-label">Số Điện Thoại</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-telephone"></i></span>
            <input
              type="tel"
              id="phone"
              class="form-control search-input"
              v-model="formData.phone"
              placeholder="Nhập số điện thoại"
              disabled
            />
          </div>
        </div>

        <!-- Email -->
        <div class="col-md-6">
          <label class="filter-label">Email</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input
              type="email"
              id="email"
              class="form-control search-input"
              v-model="formData.email"
              placeholder="Nhập email"
              disabled
            />
          </div>
        </div>

        <!-- Status -->
        <div class="col-md-6">
          <label class="filter-label">Trạng Thái</label>
          <input
            type="text"
            id="status"
            class="form-control search-input"
            :value="formData.status === 'Đã nghỉ' ? 'Hoạt động' : 'Đã nghỉ'"
            disabled
          />
        </div>

        <!-- Password -->
        <div class="col-md-6">
          <label class="filter-label">Mật Khẩu</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control search-input"
              v-model="formData.password"
              placeholder="Mật khẩu đã được mã hóa"
              disabled
            />
            <button
              class="btn btn-outline-action"
              type="button"
              @click="showPassword = !showPassword; if (!showPassword) showSensitiveInfo = false"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Secret Key (Hidden by default) -->
        <div class="col-md-6" v-if="showSensitiveInfo">
          <label class="filter-label">Mã Khóa</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-key"></i></span>
            <input
              :type="showSensitiveInfo ? 'text' : 'password'"
              id="secretKey"
              class="form-control search-input"
              v-model="formData.secretKey"
              placeholder="Mã khóa đã được mã hóa"
              disabled
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="col-12">
          <div class="alert alert-danger d-flex align-items-center animate__animated animate__shakeX" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="col-12">
          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-reset"
              @click="handleLogout"
              :disabled="isLoading"
            >
              Đăng Xuất
            </button>
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
const showSensitiveInfo = ref(false);

const formData = ref({
  username: '',
  phone: '',
  email: '',
  password: '********',
  secretKey: '********',
  status: 'Hoạt động',
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (authData.isAuthenticated && authData.user?.username) {
        console.log('Restoring auth from localStorage:', authData);
        authStore.login(authData.user);
      } else {
        console.log('Invalid auth data in localStorage, redirecting to login');
        router.push('/auth/login');
        return;
      }
    } else {
      console.log('No auth data in localStorage, redirecting to login');
      router.push('/auth/login');
      return;
    }
  }

  try {
    isLoading.value = true;
    let token = localStorage.getItem('authToken');
    const username = authStore.user?.username;

    // Làm sạch token: chỉ lấy phần JWT
    if (token && token.includes('eyJ')) {
      const match = token.match(/eyJ[a-zA-Z0-9._-]+/);
      if (match) {
        token = match[0];
        console.log('Cleaned token:', token);
        localStorage.setItem('authToken', token); // Ghi đè token sạch vào localStorage
      } else {
        throw new Error('Token không hợp lệ trong localStorage');
      }
    }

    if (!token || !username) {
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        if (authData.user?.username) {
          console.log('Using fallback username from localStorage:', authData.user.username);
          formData.value = {
            username: authData.user.username,
            phone: authData.user.phone || '',
            email: authData.user.email || '',
            password: authData.user.password || '********',
            secretKey: '********',
            status: authData.user.status || 'Hoạt động',
          };
          error.value = 'Không thể tải thông tin chi tiết từ server. Hiển thị dữ liệu tạm thời.';
          if (toast.value) {
            toast.value.addToast({
              type: 'warning',
              message: error.value,
              duration: 5000,
            });
          }
          return;
        }
      }
      throw new Error('Không tìm thấy token hoặc tên đăng nhập.');
    }

    const response = await axios.get(`http://localhost:8080/tai-khoan/thong-tin/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    if (response.status === 200) {
      const userData = {
        username: response.data.tenDangNhap || response.data.username || username,
        phone: response.data.soDienThoai || response.data.phone || '',
        email: response.data.email || '',
        password: response.data.matKhau || '********',
        secretKey: '********',
        status: response.data.deleted === false ? 'Hoạt động' : 'Đã nghỉ',
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
    console.error('Error fetching user info:', err);
    error.value = err.response?.data?.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại.';
    if (toast.value) {
      toast.value.addToast({
        type: 'error',
        message: error.value,
        duration: 5000,
      });
    }
    if (err.response?.status === 401) {
      console.log('Unauthorized, redirecting to login');
      authStore.logout();
      localStorage.removeItem('auth');
      localStorage.removeItem('authToken');
      router.push('/auth/login');
    }
  } finally {
    isLoading.value = false;
  }
});

const handleLogout = () => {
  console.log('Logging out');
  authStore.logout();
  localStorage.removeItem('auth');
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  if (toast.value) {
    toast.value.addToast({
      type: 'success',
      message: 'Đăng xuất thành công!',
      duration: 3000,
    });
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.btn-reset:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-reset {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .bg-white {
    padding: 0.75rem;
  }

  .filter-label {
    font-size: 0.85rem;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 10px 14px;
  }

  .btn-reset {
    padding: 10px;
  }
}
</style>