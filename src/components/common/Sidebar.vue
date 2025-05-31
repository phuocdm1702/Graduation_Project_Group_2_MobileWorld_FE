<template>
  <aside
    class="modern-sidebar fixed-top h-100"
    :class="isSidebarOpen ? 'w-280px' : 'w-70px'"
  >
    <div class="sidebar-background"></div>
    
    <div class="sidebar-header">
      <div class="logo-container">
        <img class="logo-icon" src="/images/logos/logo.png" alt="Logo">
        <div class="logo-text" :class="{ 'logo-hidden': !isSidebarOpen }">
          Mobile World
        </div>
      </div>
      <button
        class="toggle-btn"
        @click="toggleSidebar"
        aria-label="Toggle Sidebar"
      >
        <span
          class="toggle-icon"
          :class="isSidebarOpen ? 'rotate-180' : ''"
        >
          <i class="bi bi-list"></i>
        </span>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="(item) in menuItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item-active': isActive(item.path) }"
      >
        <div class="nav-icon">
          <component
            :is="item.icon"
            class="icon-svg"
          />
        </div>
        <div class="nav-text" :class="{ 'text-hidden': !isSidebarOpen }">
          {{ item.name }}
        </div>
        
        <!-- Tooltip when collapsed -->
        <div
          v-if="!isSidebarOpen"
          class="nav-tooltip"
        >
          {{ item.name }}
          <div class="tooltip-arrow"></div>
        </div>
      </router-link>
    </nav>
    
    <!-- Bottom Section -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">
          <img 
            src="#" 
            alt="User Avatar" 
            class="avatar-img"
            @error="handleImageError"
          />
          <span class="avatar-fallback">A</span>
        </div>
        <div class="user-info" :class="{ 'info-hidden': !isSidebarOpen }">
          <div class="user-name">Admin User</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/store/modules/ui';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  UserIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline';

// State từ Pinia
const uiStore = useUiStore();
const route = useRoute();
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);

// Danh sách menu
const menuItems = ref([
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Sản phẩm', path: '/products/san-pham/list', icon: CubeIcon },
  { name: 'Khách hàng', path: '/customers/khach-hang/list', icon: UserGroupIcon },
  { name: 'Nhân viên', path: '/employees/nhan-vien/list', icon: UserIcon },
  { name: 'Hóa đơn', path: '/orders/hoa-don/list', icon: ShoppingCartIcon },
  { name: 'Khuyến mãi', path: '/promotions/khuyen-mai/list', icon: TagIcon },
  { name: 'Thống kê', path: '/statistics/doanh-thu', icon: ChartBarIcon },
]);

// Kiểm tra active route
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path);
};

// Hàm toggle sidebar
const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

// Handle image error
const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
};
</script>

<style scoped>
.modern-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #ffffff; /* White background */
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1); /* Added shadow */
}

.w-280px {
  width: 280px;
}

.w-70px {
  width: 70px;
}

.sidebar-background {
  display: none; /* Remove gradient background */
}

/* Header Styles */
.sidebar-header {
  position: relative;
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
  flex-shrink: 0;
  min-height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.logo-icon {
  color: #005ee2; /* Lighter primary blue */
  flex-shrink: 0;
  width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #005ee2; /* Lighter primary blue */
  white-space: nowrap;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.logo-hidden {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
}

.toggle-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background-color: #e9ecef;
  color: #005ee2; /* Lighter primary blue */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background-color: #dee2e6;
  transform: scale(1.05);
}

.toggle-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Navigation Styles */
.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0.25rem 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  color: #000000;
  text-decoration: none;
  transition: all 0.2s ease;
  min-height: 48px;
  overflow: hidden;
}

.nav-item:hover {
  background-color: #e9ecef;
  color: #005ee2; /* Lighter primary blue */
}

.nav-item-active {
  background-color: #005ee2; /* Lighter primary blue */
  color: #ffffff; /* White text for active item */
  box-shadow: 0 4px 20px rgba(63, 143, 252, 0.2); /* Shadow with lighter primary blue */
}

/* Fix hover on active items */
.nav-item-active:hover {
  background-color: #005ee2; /* Maintain lighter primary blue on hover */
  color: #ffffff; /* Keep white text on hover */
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-svg {
  width: 20px;
  height: 20px;
  color: #005ee2; /* Lighter primary blue */
  transition: transform 0.2s ease;
}

.nav-item-active .icon-svg {
  color: #ffffff; /* White icon for active item */
}

.nav-item:hover .icon-svg {
  transform: scale(1.1);
}

.nav-text {
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  margin-left: 1rem;
  white-space: nowrap;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.text-hidden {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  margin-left: 0;
}

/* Tooltip Styles */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem 0.75rem;
  background-color: #005ee2; /* Lighter primary blue */
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 1001;
}

.nav-item:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(4px);
}

.tooltip-arrow {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #005ee2; /* Match tooltip background */
}

/* Footer Styles */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background-color: #ffffff;
  flex-shrink: 0;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  overflow: hidden;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(63, 143, 252, 0.2); /* Shadow with lighter primary blue */
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #005ee2; /* Lighter primary blue */
}

.user-info {
  flex: 1;
  min-width: 0;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.info-hidden {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #ced4da;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modern-sidebar {
    width: 70px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .modern-sidebar.w-280px {
    width: 280px;
  }

  .modern-sidebar.w-70px {
    width: 70px;
  }
  
  .sidebar-header {
    padding: 1rem 0 Winn.75rem;
  }
  
  .nav-item {
    margin: 0.25rem 0.5rem;
    padding: 0.625rem;
  }
  
  .sidebar-footer {
    padding: 0.75rem;
  }
}

/* Animation cho sidebar khi thu gọn */
@media (prefers-reduced-motion: no-preference) {
  .modern-sidebar * {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>