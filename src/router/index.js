import { createRouter, createWebHistory } from 'vue-router';
import authRoutes from './routes/auth';

const routes = [
  ...authRoutes,
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/Dashboard.vue'),
    meta: { layout: 'AdminLayout' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const layout = to.meta.layout || 'AdminLayout';
  to.meta.layoutComponent = layout;
  next();
});

export default router;