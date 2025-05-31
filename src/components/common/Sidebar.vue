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
      <div
        v-for="(item) in menuItems"
        :key="item.name"
        class="nav-item-wrapper"
      >
        <router-link
          v-if="!item.children"
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
          <div
            v-if="!isSidebarOpen"
            class="nav-tooltip"
          >
            {{ item.name }}
            <div class="tooltip-arrow"></div>
          </div>
        </router-link>

        <div
          v-else
          class="nav-item nav-parent"
          :class="{ 
            'nav-item-active': isActive(item.path),
            'nav-item-expanded': item.isOpen && isSidebarOpen 
          }"
          @click="toggleSubmenu(item)"
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
          <div
            v-if="isSidebarOpen"
            class="dropdown-arrow"
            :class="{ 'dropdown-expanded': item.isOpen }"
          >
            <i class="bi bi-chevron-down"></i>
          </div>
          <div
            v-if="!isSidebarOpen"
            class="nav-tooltip"
          >
            {{ item.name }}
            <div class="tooltip-arrow"></div>
          </div>
        </div>

        <transition
          name="submenu-slide"
          @before-enter="beforeEnter"
          @enter="enter"
          @before-leave="beforeLeave"
          @leave="leave"
        >
          <div
            v-if="item.children && isSidebarOpen && item.isOpen"
            class="submenu"
          >
            <router-link
              v-for="(subItem, subIndex) in item.children"
              :key="subItem.name"
              :to="subItem.path"
              class="submenu-item"
              :class="{ 'submenu-item-active': isActive(subItem.path) }"
              :style="{ 
                transitionDelay: `${subIndex * 30}ms`,
                animationDelay: `${subIndex * 30}ms` 
              }"
            >
              <div class="submenu-indicator">
                <div 
                  class="indicator-dot"
                  :class="{ 'indicator-active': isActive(subItem.path) }"
                ></div>
              </div>
              <div class="submenu-text">
                {{ subItem.name }}
              </div>
            </router-link>
          </div>
        </transition>
      </div>
    </nav>
    
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
  DocumentTextIcon ,
  UserIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUiStore();
const route = useRoute();
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);

const menuItems = ref([
  { name: 'Trang chủ', path: '/home', icon: HomeIcon },
  { name: 'Bán Hàng', path: '/sale', icon: ShoppingCartIcon },
  { name: 'Hóa đơn', path: '/orders/hoa-don/list', icon: DocumentTextIcon },
  { 
    name: 'Sản phẩm', 
    path: '/products/san-pham', 
    icon: CubeIcon,
    children: [
      { name: 'Sản phẩm', path: '/products/san-pham/list' },
      { name: 'Nhà sản xuất', path: '/products/nha-san-xuat' },
      { name: 'Cụm Camera', path: '/products/cum-camera' },
      { name: 'Cổng Nhé Mạng', path: '/products/cong-nhe-mang' },
      { name: 'Hình', path: '/products/hinh' },
      { name: 'Hỗ trợ Cổng Nhé', path: '/products/ho-tro-cong-nhe' },
      { name: 'Sạc', path: '/products/sac' },
      { name: 'RAM', path: '/products/ram' },
      { name: 'Bộ Nhớ Trong', path: '/products/bo-nho-trong' },
      { name: 'Bộ Nhớ Ngoài', path: '/products/bo-nho-ngoai' },
      { name: 'CPU', path: '/products/cpu' },
      { name: 'GPU', path: '/products/gpu' },
      { name: 'Cổng Nhé Mạng', path: '/products/cong-nhe-mang' },
      { name: 'Hệ điều hành', path: '/products/he-dieu-hanh' },
      { name: 'Kháng bụi - Kháng Nước', path: '/products/khang-bui-khang-nuoc' },
      { name: 'Màu sắc', path: '/products/mau-sac' },
      { name: 'Pin', path: '/products/pin' },
      { name: 'Sim', path: '/products/sim' },
      { name: 'Thiết kế', path: '/products/thiet-ke' },
    ],
    isOpen: false,
  },
  { 
    name: 'Tài khoản', 
    path: '/accounts/tai-khoan', 
    icon: UserIcon,
    children: [
      { name: 'Nhân viên', path: '/accounts/nhan-vien/list' },
      { name: 'Khách hàng', path: '/accounts/khach-hang/list' },
    ],
    isOpen: false,
  },
  { 
    name: 'Phiếu Giảm giá', 
    path: '/promotions/phieu-giam-gia', 
    icon: TagIcon,
    children: [
      { name: 'Phiếu giảm giá', path: '/promotions/phieu-giam-gia/list' },
      { name: 'Đợt giảm giá', path: '/promotions/dot-giam-gia' },
    ],
    isOpen: false,
  },
  { name: 'Thống kê', path: '/statistics/doanh-thu', icon: ChartBarIcon },
]);

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path);
};

const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

const toggleSubmenu = (item) => {
  if (isSidebarOpen.value) {
    // Close all other submenus
    menuItems.value.forEach(menuItem => {
      if (menuItem !== item && menuItem.children) {
        menuItem.isOpen = false;
      }
    });
    // Toggle the clicked submenu
    item.isOpen = !item.isOpen;
  }
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
};

// Animation hooks for submenu
const beforeEnter = (el) => {
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.transform = 'translateY(-10px)';
};

const enter = (el, done) => {
  el.offsetHeight; // Force reflow
  el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  el.style.height = el.scrollHeight + 'px';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    el.style.height = 'auto';
    done();
  }, 400);
};

const beforeLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
};

const leave = (el, done) => {
  el.offsetHeight; // Force reflow
  el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.transform = 'translateY(-10px)';
  
  setTimeout(done, 300);
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
  background-color: #ffffff;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
}

.w-280px {
  width: 280px;
}

.w-70px {
  width: 70px;
}

.sidebar-background {
  display: none;
}

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
  background-image: linear-gradient(135deg, #002962, #0052cc);
  -webkit-background-clip: text;
  color: transparent;
  background-clip: text;
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
    background-image: linear-gradient(135deg, #002962, #0052cc);
  -webkit-background-clip: text;
  color: transparent;
  background-clip: text;
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
  color: #002962;
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

.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item-wrapper {
  display: flex;
  flex-direction: column;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  overflow: hidden;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #e9ecef;
  color: #002962;
  transform: translateX(4px);
}

.nav-item-active {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(63, 143, 252, 0.2);
  transform: translateX(4px);
}

.nav-item-active:hover {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: #ffffff;
}

.nav-parent {
  position: relative;
}

.nav-item-expanded {
  border-left: 3px solid #002962;
  margin-left: 0.5rem;
  padding-left: 1rem;
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
  color: #002962;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-active .icon-svg {
  color: #ffffff;
}

.nav-item:hover .icon-svg {
  transform: scale(1.1) rotate(5deg);
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
  flex: 1;
}

.text-hidden {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  margin-left: 0;
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: #002962;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  padding-right: 0.5rem;
  transform-origin: center;
}

.dropdown-expanded {
  transform: rotate(180deg) scale(1.1);
  color: #0056b3;
}

.nav-item-active .dropdown-arrow {
  color: #ffffff;
}

.nav-tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #002962, #0052cc);
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
  border-right: 6px solid #002962;
}

/* Optimized submenu animations */
.submenu {
  overflow: hidden;
  background-color: #f8f9fa;
  margin: 0.25rem 0.75rem 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 2px solid #dee2e6;
}

.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: #000000;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 6px;
  margin: 0.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateX(-10px);
  animation: slideInSubmenu 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInSubmenu {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.submenu-item:hover {
  background-color: #ffffff;
  color: #002962;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submenu-item-active {
  background-color: #ffffff;
  color: #002962;
  font-weight: 600;
  border-left: 2px solid #002962;
  box-shadow: 0 2px 8px rgba(63, 143, 252, 0.2);
}

.submenu-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #dee2e6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.8);
}

.submenu-item:hover .indicator-dot {
  background: linear-gradient(135deg, #002962, #0052cc);
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(63, 143, 252, 0.4);
}

.indicator-active {
  background: linear-gradient(135deg, #002962, #0052cc);
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(63, 143, 252, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1.4); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.6); 
    opacity: 0.8; 
  }
}

.submenu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

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
  box-shadow: 0 4px 12px rgba(63, 143, 252, 0.2);
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
  background: linear-gradient(135deg, #002962, #0052cc);
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
    padding: 1rem 0.75rem;
  }
  
  .nav-item {
    margin: 0.2rem 0.5rem;
    padding: 0.625rem;
  }
  
  .submenu-item {
    margin: 0.2rem;
    padding: 0.5rem 1rem;
  }
  
  .sidebar-footer {
    padding: 0.75rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .modern-sidebar * {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>