import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import Login from '@/pages/auth/Login.vue';
import TrangChu from '@/pages/home/TrangChu.vue';
import ProductList from '@/pages/products/san-pham/List.vue';
import HoaDon from '@/pages/bills/HoaDon.vue';
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
      { path: '/banHang', component: banHang},
      { path: '/hoaDon', component: HoaDon },
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