import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';

// Lazy-load layouts
const AdminLayout = () => import('@/layouts/AdminLayout.vue');
const AuthLayout = () => import('@/layouts/AuthLayout.vue');

// Lazy-load pages
const TrangChu = () => import('@/pages/home/TrangChu.vue');
const ProductList = () => import('@/pages/products/SanPham.vue');
const HoaDon = () => import('@/pages/bills/HoaDon.vue');
const HoaDonChiTiet = () => import('@/pages/bills/HoaDonChiTiet.vue');
const PhieuGiamGia = () => import('@/pages/promotions/PhieuGiamGia.vue');
const PhieuGiamGiaForm = () => import('@/pages/promotions/PhieuGiamGiaForm.vue');
const DotGiamGia = () => import('@/pages/promotions/DotGiamGia.vue');
const DotGiamGiaForm = () => import('@/pages/promotions/DotGiamGiaForm.vue');
const banHang = () => import('@/pages/sells/banHang.vue');
const NhanVien = () => import('@/pages/accounts/NhanVien.vue');
const NhanVienForm = () => import('@/pages/accounts/NhanVienForm.vue');
const KhachHang = () => import('@/pages/accounts/KhachHang.vue');
const KhachHangForm = () => import('@/pages/accounts/KhachHangForm.vue');
const ThongKe = () => import('@/pages/statistics/ThongKe.vue');
const Login = () => import('@/pages/auth/Login.vue');

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
