<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center position-relative">
    <div v-if="isLoading" class="full-screen-loading-overlay">
      <loading-spinner size="4rem" color="#0056b3" />
    </div>
    <div class="card p-4 shadow-lg border-0 animate-slide-in" style="max-width: 400px; width: 100%;">
      <div class="text-center mb-4 mt-3">
        <h2 class="h4 fw-bold text-primary">Welcome to Mobile World</h2>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-3 position-relative">
          <label for="username" class="form-label text-primary fw-medium">Username</label>
          <div class="position-relative">
            <i class="bi bi-person-fill text-primary position-absolute icon-inside-input"></i>
            <input
              type="text"
              id="username"
              class="form-control rounded-3 shadow-sm ps-5"
              v-model="username"
              placeholder="Enter your username"
              required
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="mb-3 position-relative">
          <label for="password" class="form-label text-primary fw-medium">Password</label>
          <div class="position-relative">
            <i class="bi bi-lock-fill text-primary position-absolute icon-inside-input"></i>
            <input
              type="password"
              id="password"
              class="form-control rounded-3 shadow-sm ps-5"
              v-model="password"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
            />
          </div>
        </div>
        <div v-if="error" class="alert alert-danger alert-dismissible fade show animate-pulse" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
        </div>
        <button
          type="submit"
          class="btn w-100 fw-semibold py-2 rounded-3 animate-button"
          :disabled="isLoading"
        >
          Sign In
        </button>
      </form>
      <p class="text-center mt-3">
        <router-link to="/forgot-password" class="text-primary text-decoration-none hover-underline" :class="{ 'disabled-link': isLoading }">
          Forgot Password?
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/modules/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/common/Loading.vue';

export default {
  name: 'Login',
  components: {
    LoadingSpinner,
  },
  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const isLoading = ref(false);
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
      isLoading.value = true;
      error.value = '';

      await new Promise(resolve => setTimeout(resolve, 1500));

      const validUsername = 'admin';
      const validPassword = '123456';

      if (username.value === validUsername && password.value === validPassword) {
        authStore.login({ username: username.value });
        router.push('/trangChu');
      } else {
        error.value = 'Invalid username or password!';
      }

      isLoading.value = false;
    };

    return { username, password, error, isLoading, handleLogin };
  },
};
</script>

<style scoped>
/* Custom animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

.animate-pulse {
  animation: pulse 0.3s ease-in-out;
}

.animate-button {
  transition: all 0.3s ease-in-out;
  background: linear-gradient(135deg, #002962, #0052cc);
  color: #e9ecef;
}

.animate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  color: #e9ecef;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.text-primary {
  background-image: linear-gradient(135deg, #002962, #0052cc);
  -webkit-background-clip: text;
  color: transparent !important;
  background-clip: text;
}

.form-control {
  transition: all 0.3s ease-in-out;
}

.form-control:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 0.7;
}

.card {
  border-radius: 1rem;
}

.hover-underline:hover:not(.disabled-link) {
  text-decoration: underline !important;
  background-image: linear-gradient(135deg, #002962, #0052cc);
  -webkit-background-clip: text;
  color: transparent;
  background-clip: text;
}

.icon-inside-input {
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
}

.form-control.ps-5 {
  padding-left: 3rem !important;
}

.disabled-link {
  pointer-events: none;
  opacity: 0.5;
}

.full-screen-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
</style>