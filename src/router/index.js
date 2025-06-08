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