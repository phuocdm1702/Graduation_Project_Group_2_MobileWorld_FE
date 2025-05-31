<template>
  <div>
    <h2 class="text-center mb-4">Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label for="username" class="form-label">Tên đăng nhập</label>
        <input
          type="text"
          id="username"
          class="form-control"
          v-model="username"
          placeholder="Nhập tên đăng nhập"
          required
        />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mật khẩu</label>
        <input
          type="password"
          id="password"
          class="form-control"
          v-model="password"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
    </form>
    <p class="text-center mt-3">
      <router-link to="/forgot-password">Quên mật khẩu?</router-link>
    </p>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/modules/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Login',
  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogin = () => {
      // Tài khoản và mật khẩu cứng
      const validUsername = 'admin';
      const validPassword = '123456';

      if (username.value === validUsername && password.value === validPassword) {
        authStore.login({ username: username.value });
        router.push('/dashboard');
      } else {
        error.value = 'Tên đăng nhập hoặc mật khẩu không đúng!';
      }
    };

    return { username, password, error, handleLogin };
  },
};
</script>