import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import Login from '@/pages/auth/Login.vue';
import TrangChu from '@/pages/home/TrangChu.vue';
import ProductList from '@/pages/products/san-pham/List.vue';
import HoaDon from '@/pages/bills/HoaDon.vue';
import PhieuGiamGia from '@/pages/promotions/PhieuGiamGia.vue';
import PhieuGiamGiaForm from '@/pages/promotions/PhieuGiamGiaForm.vue';
import DotGiamGia from '@/pages/promotions/DotGiamGia.vue';
import DotGiamGiaForm from '@/pages/promotions/DotGiamGiaForm.vue';
import HoaDonChiTiet from '@/pages/bills/HoaDonChiTiet.vue';
import banHang from '@/pages/sells/banHang.vue';
import NhanVien from '@/pages/accounts/NhanVien.vue';
import NhanVienForm from '@/pages/accounts/NhanVienForm.vue';
import KhachHang from '@/pages/accounts/KhachHang.vue';
import KhachHangForm from '@/pages/accounts/KhachHangForm.vue';
import ThongKe from '@/pages/statistics/ThongKe.vue';
import { useAuthStore } from '@/store/modules/auth';

const routes = [
  {
    path: '/',
    redirect: '/trangChu',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '/trangChu', component: TrangChu },
      { path: '/products/san-pham/list', component: ProductList },
      { path: '/banHang', component: banHang },
      { path: '/hoaDon', component: HoaDon },
      { path: '/hoaDon/:id', component: HoaDonChiTiet },
      { path: '/phieuGiamGia', component: PhieuGiamGia },
      { path: '/phieuGiamGia/form/:id?', component: PhieuGiamGiaForm },
      { path: '/dotGiamGia', component: DotGiamGia },
      { path: '/dotGiamGia/form/:id?', component: DotGiamGiaForm },
      { path: '/nhanVien', component: NhanVien },
      { path: '/nhanVien/form/:id?', component: NhanVienForm },
      { path: '/khachHang', component: KhachHang },
      { path: '/khachHang/form/:id?', component: KhachHangForm },
      { path: '/thongKe', component: ThongKe },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login');
  } else {
    next();
  }
});

export default router;