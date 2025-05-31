import { defineStore } from 'pinia';
import { useUiStore } from './ui';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  actions: {
    async login(credentials) {
      // Dữ liệu fix cứng
      const mockUser = {
        username: 'admin',
        password: '123456',
        name: 'Admin User',
        role: 'admin',
      };

      // Kiểm tra thông tin đăng nhập
      if (
        credentials.username === mockUser.username &&
        credentials.password === mockUser.password
      ) {
        this.isAuthenticated = true;
        this.user = { name: mockUser.name, role: mockUser.role };

        // Mở sidebar sau khi đăng nhập
        const uiStore = useUiStore();
        uiStore.openSidebar();

        // Điều hướng đến dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Tài khoản hoặc mật khẩu không đúng');
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;

      // Đóng sidebar khi đăng xuất
      const uiStore = useUiStore();
      uiStore.closeSidebar();

      // Điều hướng về trang login
      router.push('/auth/login');
    },
  },
});