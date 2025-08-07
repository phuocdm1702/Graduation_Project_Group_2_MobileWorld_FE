```vue
<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Không Có Quyền Truy Cập"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-red"
      :backgroundOpacity="0.95"
    />
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
      <h2 class="text-danger mb-3">Bạn không có quyền truy cập trang này!</h2>
      <p class="text-muted">Vui lòng liên hệ quản trị viên nếu bạn cần thêm quyền.</p>
      <button class="btn btn-primary mt-3" @click="goBack">Quay Lại</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';

const router = useRouter();

const goBack = () => {
  router.push('/trangChu');
};
</script>

<style scoped>
.gradient-custom-red {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.btn-primary {
  background: #34d399;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #2cb989;
  transform: translateY(-2px);
}
</style>
```