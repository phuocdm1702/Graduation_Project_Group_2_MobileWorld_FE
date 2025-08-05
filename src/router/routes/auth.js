import { defineStore } from 'pinia';
import { useUiStore } from './ui';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  actions: {
    login(user) {
      this.isAuthenticated = true;
      this.user = {
        username: user.username,
        phone: user.phone || '',
        email: user.email || '',
        status: user.status || 'Hoạt động',
        idNhanVien: user.idNhanVien || null,
        capQuyenHan: user.capQuyenHan || 2, // Lưu capQuyenHan, mặc định là 2 nếu không có
      };

      // Mở sidebar sau khi đăng nhập
      const uiStore = useUiStore();
      uiStore.openSidebar();

      // Điều hướng đến trang chủ
      router.push('/trangChu');
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