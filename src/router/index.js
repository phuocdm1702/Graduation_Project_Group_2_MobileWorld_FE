import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import Login from '@/pages/auth/Login.vue';
import Dashboard from '@/pages/dashboard/Dashboard.vue';
import ProductList from '@/pages/products/san-pham/List.vue';
import { useAuthStore } from '@/store/modules/auth';


const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '/dashboard', component: Dashboard },
      { path: '/products/san-pham/list', component: ProductList },
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

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login');
  } else {
    next();
  }
});

export default router;