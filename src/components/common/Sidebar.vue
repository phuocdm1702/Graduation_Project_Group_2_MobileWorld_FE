<template>
  <aside
    class="modern-sidebar fixed-top h-100"
    :class="isSidebarOpen ? 'w-280px' : 'w-70px'"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <img class="logo-icon" src="/images/logos/logo3.png" alt="Logo">
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
      <!-- User Profile -->
      <div
        class="user-profile"
        :class="{ 'user-profile-collapsed': !isSidebarOpen }"
        @click="openUserModal"
        role="button"
        tabindex="0"
        aria-label="Open user menu"
      >
        <div class="avatar">
          <img 
            :src="userAvatar || '/images/avatars/huan2.jpg'" 
            alt="User Avatar" 
            class="avatar-img"
            @error="handleImageError"
          />
          <span class="avatar-fallback">A</span>
        </div>
        <div class="user-info" :class="{ 'text-hidden': !isSidebarOpen }">
          <div class="user-name">Admin</div>
          <div class="user-role">Administrator</div>
        </div>
        <div v-if="!isSidebarOpen" class="nav-tooltip">
          User Menu
          <div class="tooltip-arrow"></div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <transition name="modal-fade">
      <div v-if="isUserModalOpen" class="user-modal">
        <div class="modal-overlay" @click="closeUserModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Cài đặt quản trị viên</h3>
            <button class="modal-close-btn" @click="closeUserModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <button class="modal-btn" @click="toggleDarkMode">
              <i class="bi bi-moon-stars-fill"></i>
              Thay đổi giao diện tối
            </button>
            <button class="modal-btn" @click="goToSettings">
              <i class="bi bi-gear-fill"></i>
              Cài đặt
            </button>
            <button class="modal-btn" @click="goToAccountInfo">
              <i class="bi bi-person-fill"></i>
              Thông tin tài khoản
            </button>
            <button class="modal-btn logout" @click="openLogoutConfirmModal">
              <i class="bi bi-box-arrow-right"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notification Modal -->
    <notification-modal
      ref="notificationModal"
      :type="notificationType"
      :message="notificationMessage"
      :confirmText="notificationConfirmText"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      :isLoading="isLoading"
      @close="resetNotification"
    />
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/store/modules/ui';
import NotificationModal from './NotificationModal.vue';
import {
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  UserIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUiStore();
const route = useRoute();
const router = useRouter();
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);
const isUserModalOpen = ref(false);
const notificationModal = ref(null);
const notificationType = ref('');
const notificationMessage = ref('');
const notificationConfirmText = ref('Xác nhận');
const notificationOnConfirm = ref(() => {});
const notificationOnCancel = ref(() => {});
const isLoading = ref(false);
const userAvatar = ref(''); // Lấy từ API hoặc dữ liệu người dùng

const menuItems = ref([
  { name: 'Trang chủ', path: '/trangChu', icon: HomeIcon },
  { name: 'Bán Hàng', path: '/banHang', icon: ShoppingCartIcon },
  { name: 'Quản Lý Hóa đơn', path: '/hoaDon', icon: DocumentTextIcon },
  { 
    name: 'Quản Lý Sản phẩm', 
    path: '/quanLySanPham', 
    icon: CubeIcon,
    children: [
      { name: 'Sản phẩm', path: '/sanPham' },
      { name: 'Nhà sản xuất', path: '/nhaSanXuat' },
      { name: 'Cụm Camera', path: '/cumCamera' },
      { name: 'Hình Ảnh', path: '/hinhAnh' },
      { name: 'Hỗ trợ Cổng Sạc', path: '/hoTroCongSac' },
      { name: 'Sạc', path: '/sac' },
      { name: 'RAM', path: '/ram' },
      { name: 'Bộ Nhớ Trong', path: '/boNhoTrong' },
      { name: 'Bộ Nhớ Ngoài', path: '/boNhoNgoai' },
      { name: 'CPU', path: '/cpu' },
      { name: 'GPU', path: '/gpu' },
      { name: 'Công Nghệ Mạng', path: '/congNgheMang' },
      { name: 'Hệ điều hành', path: '/heDieuHanh' },
      { name: 'Kháng bụi - Kháng Nước', path: '/khangBuiKhangNuoc' },
      { name: 'Màu sắc', path: '/mauSac' },
      { name: 'Pin', path: '/pin' },
      { name: 'Sim', path: '/sim' },
      { name: 'Thiết kế', path: '/thietKe' },
    ],
    isOpen: false,
  },
  { 
    name: 'Quản Lý Tài khoản',
    path: '/quanLyTaiKhoan',
    icon: UserIcon,
    children: [
      { name: 'Nhân viên', path: '/nhanVien' },
      { name: 'Khách hàng', path: '/khachHang' },
    ],
    isOpen: false,
  },
  { 
    name: 'Quản Lý Giảm giá',
    path: '/quanLyGiamGia',
    icon: TagIcon,
    children: [
      { name: 'Phiếu giảm giá', path: '/phieuGiamGia' },
      { name: 'Đợt giảm giá', path: '/dotGiamGia' },
    ],
    isOpen: false,
  },
  { name: 'Thống kê', path: '/thongKe', icon: ChartBarIcon },
]);

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path);
};

const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

const toggleSubmenu = (item) => {
  // Nếu sidebar đang đóng, mở sidebar và mở luôn submenu
  if (!isSidebarOpen.value) {
    uiStore.toggleSidebar();
    // Đợi một chút để sidebar mở xong rồi mới mở submenu
    setTimeout(() => {
      // Đóng tất cả submenu khác
      menuItems.value.forEach(menuItem => {
        if (menuItem !== item && menuItem.children) {
          menuItem.isOpen = false;
        }
      });
      // Mở submenu được click
      item.isOpen = true;
    }, 100); // Delay 100ms để sidebar mở mượt
    return;
  }
  
  // Nếu sidebar đã mở, thì toggle submenu bình thường
  menuItems.value.forEach(menuItem => {
    if (menuItem !== item && menuItem.children) {
      menuItem.isOpen = false;
    }
  });
  item.isOpen = !item.isOpen;
};

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'; // Sử dụng ảnh mặc định
  event.target.nextElementSibling.style.display = 'none'; // Ẩn fallback
};

const openUserModal = () => {
  isUserModalOpen.value = true;
};

const closeUserModal = () => {
  isUserModalOpen.value = false;
};

const toggleDarkMode = () => {
  console.log('Toggle dark mode');
  notificationType.value = 'success';
  notificationMessage.value = 'Đã thay đổi giao diện thành công!';
  notificationConfirmText.value = 'OK';
  notificationOnConfirm.value = () => {};
  notificationOnCancel.value = () => {};
  notificationModal.value.openModal();
};

const goToSettings = () => {
  router.push('/settings');
  closeUserModal();
};

const goToAccountInfo = () => {
  router.push('/account-info');
  closeUserModal();
};

const openLogoutConfirmModal = () => {
  notificationType.value = 'confirm';
  notificationMessage.value = 'Bạn có chắc chắn muốn đăng xuất?';
  notificationConfirmText.value = 'Đăng xuất';
  notificationOnConfirm.value = async () => {
    isLoading.value = true; // Start loading
    console.log('Logout confirmed');
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay
    isLoading.value = false; // Stop loading
    router.push('/auth/login');
    closeUserModal();
  };
  notificationOnCancel.value = () => {
    console.log('Logout cancelled');
  };
  notificationModal.value.openModal();
};

const resetNotification = () => {
  notificationType.value = '';
  notificationMessage.value = '';
  notificationConfirmText.value = 'Xác nhận';
  notificationOnConfirm.value = () => {};
  notificationOnCancel.value = () => {};
  isLoading.value = false;
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
  background-color: rgba(249, 250, 251, 0.95);
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
}

.w-280px {
  width: 280px;
}

.w-70px {
  width: 70px;
}

.sidebar-header {
  position: relative;
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  background-color: rgba(249, 250, 251, 0.95);
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
  background-clip: text;
  flex-shrink: 0;
  width: 50px;
  margin-right: 5px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background-color: #15803d;
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
  background-color: rgba(229, 231, 235, 0.5);
  color: #15803d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background-color: #f0fdf4;
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
  color: #111827;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  overflow: hidden;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #f0fdf4;
  color: #16a34a;
  transform: translateX(4px);
}

.nav-item-active {
  background: #dcfce7;
  color: #15803d;
  transform: translateX(4px);
}

.nav-item-active:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.nav-parent {
  position: relative;
}

.nav-item-expanded {
  border-left: 3px solid #15803d;
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
  color: #111827;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-active .icon-svg {
  color: #15803d;
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
  color: #15803d;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  padding-right: 0.5rem;
  transform-origin: center;
}

.dropdown-expanded {
  transform: rotate(180deg) scale(1.1);
  color: #15803d;
}

.nav-item-active .dropdown-arrow {
  color: #15803d;
}

.nav-tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  background-color: #111827;
  border-radius: 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1001;
}

.nav-item:hover .nav-tooltip,
.user-profile:hover .nav-tooltip {
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
  border-right: 6px solid #111827;
}

/* Optimized submenu animations */
.submenu {
  overflow: hidden;
  background-color: rgba(249, 250, 251, 0.95);
  margin: 0.25rem 0.75rem 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 2px solid rgba(229, 231, 235, 0.5);
}

.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: #111827;
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
  background-color: #f0fdf4;
  color: #16a34a;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submenu-item-active {
  background-color: #dcfce7;
  color: #15803d;
  font-weight: 600;
  border-left: 2px solid #15803d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  background-color: #d1d5db;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.8);
}

.submenu-item:hover .indicator-dot {
  background: #16a34a;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.indicator-active {
  background: #15803d;
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
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

/* Sidebar footer layout */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  background-color: rgba(249, 250, 251, 0.95);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 80px;
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.user-profile-collapsed {
  flex: 0;
  justify-content: center;
  padding: 0;
}

.user-profile:hover {
  background-color: #f0fdf4;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 2;
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
  background: #15803d;
  z-index: 1;
}

.user-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info.text-hidden {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  margin-left: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User Modal */
.user-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 2001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #15803d;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close-btn:hover {
  color: #15803d;
}

.modal-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(249, 250, 251, 0.95);
  color: #111827;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-btn:hover {
  background: #f0fdf4;
  color: #16a34a;
  transform: translateX(4px);
}

.modal-btn i {
  font-size: 1.1rem;
}

.modal-btn.logout {
  background: #22c55e;
  color: #ffffff;
}

.modal-btn.logout:hover {
  background: #15803d;
  transform: translateX(4px);
}

.modal-btn:hover i {
  transform: scale(1.1);
}

/* Modal Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(249, 250, 251, 0.95);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
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