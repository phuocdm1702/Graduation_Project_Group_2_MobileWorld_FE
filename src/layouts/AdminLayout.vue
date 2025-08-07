<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="d-flex flex-column flex-md-row background-admin min-vh-100">
    <!-- Chỉ hiển thị Sidebar khi không phải đường dẫn checkout-display -->
    <Sidebar v-if="!isCheckoutDisplayPage" />

    <div
      class="content-wrapper flex-grow-1 d-flex flex-column"
      :class="{
        'ms-sidebar-open': isSidebarOpen && !isCheckoutDisplayPage,
        'ms-sidebar-closed': !isSidebarOpen && !isCheckoutDisplayPage,
        'no-sidebar': isCheckoutDisplayPage
      }"
    >
      <div class="container-fluid p-2 flex-grow-1">
        <router-view />
      </div>
      <Footer v-if="!isCheckoutDisplayPage" />
    </div>

    <!-- Overlay chỉ hiện khi không phải checkout-display page -->
    <div
      v-if="isSidebarOpen && !isCheckoutDisplayPage"
      class="d-md-none bg-dark bg-opacity-50 position-fixed w-100 h-100"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/store/modules/ui';
import Sidebar from '@/components/common/Sidebar.vue';
import Footer from '@/components/common/Footer.vue';

const route = useRoute();
const uiStore = useUiStore();

const isSidebarOpen = computed(() => uiStore.isSidebarOpen);

// Kiểm tra xem có phải đường dẫn checkout-display không
const isCheckoutDisplayPage = computed(() => {
  return route.path === '/checkout-display';
});

const toggleSidebar = () => {
  uiStore.toggleSidebar();
};
</script>

<style scoped>
.background-admin {
  background-color: rgba(218, 218, 218, 0.289);
}

.content-wrapper {
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: calc(100% - 5px);
}

.ms-sidebar-open {
  margin-left: calc(280px + 5px); 
}

.ms-sidebar-closed {
  margin-left: calc(70px + 5px); 
}

/* Class mới cho trang không có sidebar */
.no-sidebar {
  margin-left: 0 !important;
  width: 100% !important;
}

.bg-dark.bg-opacity-50 {
  transition: opacity 0.3s ease;
  opacity: 0.5;
  z-index: 999; 
}

.bg-dark.bg-opacity-50:hover {
  opacity: 0.7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0 !important; 
    width: 100%; 
  }

  .ms-sidebar-open {
    margin-left: 0 !important;
  }

  .ms-sidebar-closed {
    margin-left: calc(70px + 5px); 
  }
  
  .no-sidebar {
    margin-left: 0 !important;
    width: 100% !important;
  }
}
</style>