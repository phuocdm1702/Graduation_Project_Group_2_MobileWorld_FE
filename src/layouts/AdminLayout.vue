<template>
  <div class="d-flex">
    <Sidebar />

    <div class="flex-grow-1" :class="{ 'ms-0': !isSidebarOpen, 'ms-280px': isSidebarOpen }">
      <div class="container-fluid p-4">
        <router-view />
      </div>
    </div>

    <div
      v-if="isSidebarOpen"
      class="d-md-none bg-dark bg-opacity-50 position-fixed w-100 h-100"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '@/store/modules/ui';
import Sidebar from '@/components/common/Sidebar.vue';

// Lấy trạng thái sidebar từ Pinia
const uiStore = useUiStore();
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);

// Hàm toggle sidebar cho overlay trên mobile
const toggleSidebar = () => {
  uiStore.toggleSidebar();
};
</script>

<style scoped>
.flex-grow-1 {
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth transition */
}

.ms-280px {
  margin-left: 280px;
}

.ms-0 {
  margin-left: 0;
}

/* Ensure the overlay transition is smooth */
.bg-dark.bg-opacity-50 {
  transition: opacity 0.3s ease; /* Smooth fade for overlay */
  opacity: 0.5;
}

.bg-dark.bg-opacity-50:hover {
  opacity: 0.7; /* Optional: slight hover effect */
}
</style>