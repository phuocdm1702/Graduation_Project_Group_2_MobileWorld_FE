<template>
  <div>
    <!-- Sidebar for desktop (hidden on mobile) -->
    <aside
      class="modern-sidebar fixed-top h-100"
      :class="isSidebarOpen && !isMobile ? 'w-280px' : 'w-70px'"
      v-if="!isMobile"
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
          v-for="(item) in filteredMenuItems"
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
            <span class="avatar-fallback">{{ authStore.user?.username?.charAt(0) || 'A' }}</span>
          </div>
          <div class="user-info" :class="{ 'text-hidden': !isSidebarOpen }">
            <div class="user-name">{{ authStore.user?.username || 'Admin' }}</div>
            <div class="user-role">{{ authStore.user?.capQuyenHan === 1 ? 'Administrator' : 'Nhân viên' }}</div>
          </div>
          <div v-if="!isSidebarOpen" class="nav-tooltip">
            User Menu
            <div class="tooltip-arrow"></div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Navbar for mobile -->
    <nav class="mobile-navbar" v-if="isMobile">
      <div class="navbar-content">
        <router-link
          v-for="(item, index) in filteredMainMenuItems"
          :key="item.name"
          :to="item.path"
          class="navbar-item"
          :class="{ 'navbar-item-active': isActive(item.path) }"
          :aria-label="item.name"
        >
          <div class="navbar-icon">
            <component :is="item.icon" class="icon-svg" />
          </div>
          <span class="navbar-text">{{ item.name }}</span>
        </router-link>
        <button class="navbar-item" @click="toggleMobileMenu" aria-label="Open Menu">
          <div class="navbar-icon">
            <i class="bi bi-list"></i>
          </div>
          <span class="navbar-text">Menu</span>
        </button>
      </div>
    </nav>

    <!-- Mobile menu overlay -->
    <transition name="mobile-menu-slide">
      <div v-if="isMobileMenuOpen && isMobile" class="mobile-menu-overlay">
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <div class="logo-container">
              <img class="logo-icon" src="/images/logos/logo3.png" alt="Logo">
              <div class="logo-text">Mobile World</div>
            </div>
            <button class="mobile-menu-close" @click="toggleMobileMenu" aria-label="Close Menu">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="mobile-menu-nav">
            <div
              v-for="item in filteredMenuItems"
              :key="item.name"
              class="mobile-nav-item-wrapper"
            >
              <router-link
                v-if="!item.children"
                :to="item.path"
                class="mobile-nav-item"
                :class="{ 'mobile-nav-item-active': isActive(item.path) }"
                @click="toggleMobileMenu"
              >
                <div class="nav-icon">
                  <component :is="item.icon" class="icon-svg" />
                </div>
                <span class="mobile-nav-text">{{ item.name }}</span>
              </router-link>
              <button
                v-else
                class="mobile-nav-item mobile-nav-parent"
                :class="{ 'mobile-nav-item-active': isActive(item.path) }"
                @click="toggleSubmenu(item)"
                :aria-expanded="item.isOpen"
                :aria-label="item.name"
              >
                <div class="nav-icon">
                  <component :is="item.icon" class="icon-svg" />
                </div>
                <span class="mobile-nav-text">{{ item.name }}</span>
                <i
                  class="bi bi-chevron-down"
                  :class="{ 'dropdown-expanded': item.isOpen }"
                ></i>
              </button>
              <div v-if="item.children && item.isOpen" class="mobile-submenu">
                <router-link
                  v-for="subItem in item.children"
                  :key="subItem.name"
                  :to="subItem.path"
                  class="mobile-submenu-item"
                  :class="{ 'mobile-submenu-item-active': isActive(subItem.path) }"
                  @click="toggleMobileMenu"
                >
                  <div class="submenu-indicator">
                    <div
                      class="indicator-dot"
                      :class="{ 'indicator-active': isActive(subItem.path) }"
                    ></div>
                  </div>
                  <span class="mobile-submenu-text">{{ subItem.name }}</span>
                </router-link>
              </div>
            </div>
          </div>
          <div class="mobile-menu-footer">
            <button class="user-profile" @click="openUserModal" aria-label="Open user menu">
              <div class="avatar">
                <img
                  :src="userAvatar || '/images/avatars/huan2.jpg'"
                  alt="User Avatar"
                  class="avatar-img"
                  @error="handleImageError"
                />
                <span class="avatar-fallback">{{ authStore.user?.username?.charAt(0) || 'A' }}</span>
              </div>
              <div class="user-info">
                <div class="user-name">{{ authStore.user?.username || 'Admin' }}</div>
                <div class="user-role">{{ authStore.user?.capQuyenHan === 1 ? 'Administrator' : 'Nhân viên' }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- User Modal -->
    <transition name="modal-fade">
      <div v-if="isUserModalOpen" class="user-modal">
        <div class="modal-overlay" @click="closeUserModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Cài đặt quản trị viên</h3>
            <button class="modal-close-btn" @click="closeUserModal" aria-label="Close user modal">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/store/modules/ui';
import { useAuthStore } from '@/store/modules/auth';
import NotificationModal from './NotificationModal.vue';
import {
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  UserIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUiStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);
const isUserModalOpen = ref(false);
const isMobileMenuOpen = ref(false);
const notificationModal = ref(null);
const notificationType = ref('');
const notificationMessage = ref('');
const notificationConfirmText = ref('Xác nhận');
const notificationOnConfirm = ref(() => {});
const notificationOnCancel = ref(() => {});
const isLoading = ref(false);
const userAvatar = ref('');
const isMobile = ref(window.innerWidth <= 768);

// Danh sách menu gốc
const baseMenuItems = ref([
  { 
    name: 'Trang chủ', 
    path: '/trangChu', 
    icon: HomeIcon 
  },
  { 
    name: 'Thống kê', 
    path: '/thongKe', 
    icon: ChartBarIcon,
    requiresAdmin: true 
  },
  { 
    name: 'Bán hàng', 
    path: '/banHang', 
    icon: ShoppingCartIcon 
  },
  { 
    name: 'Quản lý hóa đơn', 
    path: '/hoaDon', 
    icon: DocumentTextIcon,
  },
  { 
    name: 'Quản lý sản phẩm', 
    path: '/quanLySanPham', 
    icon: CubeIcon,
    requiresAdmin: true,
    children: [
      { name: 'Sản phẩm', path: '/sanPham' },
      { name: 'Nhà sản xuất', path: '/nhaSanXuat' },
      { name: 'Cụm camera', path: '/cumCamera' },
      { name: 'Hỗ trợ công nghệ sạc', path: '/hoTroCongNgheSac' },
      { name: 'RAM', path: '/ram' },
      { name: 'Bộ nhớ trong', path: '/boNhoTrong' },
      { name: 'Bộ nhớ ngoài', path: '/boNhoNgoai' },
      { name: 'CPU', path: '/cpu' },
      { name: 'GPU', path: '/gpu' },
      { name: 'Công nghệ mạng', path: '/congNgheMang' },
      { name: 'Công nghệ màn hình', path: '/congNgheManHinh' },
      { name: 'Hệ điều hành', path: '/heDieuHanh' },
      { name: 'Kháng bụi - Kháng nước', path: '/khangBuiKhangNuoc' },
      { name: 'Màu sắc', path: '/mauSac' },
      { name: 'Pin', path: '/pin' },
      { name: 'Sim', path: '/sim' },
      { name: 'Thiết kế', path: '/thietKe' },
    ],
    isOpen: false,
  },
  { 
    name: 'Quản lý giảm giá',
    path: '/quanLyGiamGia',
    icon: TagIcon,
    requiresAdmin: true,
    children: [
      { name: 'Phiếu giảm giá', path: '/phieuGiamGia' },
      { name: 'Đợt giảm giá', path: '/dotGiamGia' },
    ],
    isOpen: false,
  },
  { 
    name: 'Quản lý tài khoản',
    path: '/quanLyTaiKhoan',
    icon: UserIcon,
    requiresAdmin: true,
    children: [
      { name: 'Nhân viên', path: '/nhanVien' },
      { name: 'Khách hàng', path: '/khachHang' },
    ],
    isOpen: false,
  },
  { 
    name: 'Giao ca', 
    path: '/giao-ca', 
    icon: ClockIcon 
  },
  { 
    name: 'Lịch làm việc', 
    path: '/lich-lam-viec', 
    icon: CalendarDaysIcon,
    requiresAdmin: true,

  },
  { 
    name: 'Hỗ trợ khách hàng', 
    path: '/chatInterface', 
    icon: ChatBubbleLeftRightIcon 
  },
]);

// Danh sách menu gốc cho navbar di động
const baseMainMenuItems = ref([
  { name: 'Trang chủ', path: '/trangChu', icon: HomeIcon },
  { name: 'Thống kê', path: '/thongKe', icon: ChartBarIcon, requiresAdmin: true },
  { name: 'Bán Hàng', path: '/banHang', icon: ShoppingCartIcon },
  { name: 'Hóa đơn', path: '/hoaDon', icon: DocumentTextIcon},
  { name: 'Lịch làm việc', path: '/lich-lam-viec', icon: CalendarDaysIcon, requiresAdmin: true },

]);

// Lọc menu dựa trên quyền hạn
const filteredMenuItems = computed(() => {
  if (authStore.isAuthenticated && authStore.user?.capQuyenHan === 1) {
    // Admin: Hiển thị tất cả menu
    return baseMenuItems.value;
  }
  // Nhân viên: Chỉ hiển thị các menu không yêu cầu quyền admin
  return baseMenuItems.value.filter(item => !item.requiresAdmin);
});

const filteredMainMenuItems = computed(() => {
  if (authStore.isAuthenticated && authStore.user?.capQuyenHan === 1) {
    // Admin: Hiển thị tất cả menu
    return baseMainMenuItems.value;
  }
  // Nhân viên: Chỉ hiển thị các menu không yêu cầu quyền admin
  return baseMainMenuItems.value.filter(item => !item.requiresAdmin);
});

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path);
};

const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const toggleSubmenu = (item) => {
  if (!isSidebarOpen.value && !isMobile.value) {
    uiStore.toggleSidebar();
    setTimeout(() => {
      baseMenuItems.value.forEach(menuItem => {
        if (menuItem !== item && menuItem.children) {
          menuItem.isOpen = false;
        }
      });
      item.isOpen = true;
    }, 100);
    return;
  }
  
  baseMenuItems.value.forEach(menuItem => {
    if (menuItem !== item && menuItem.children) {
      menuItem.isOpen = false;
    }
  });
  item.isOpen = !item.isOpen;
};

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png';
  event.target.nextElementSibling.style.display = 'none';
};

const openUserModal = () => {
  isUserModalOpen.value = true;
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const closeUserModal = () => {
  isUserModalOpen.value = false;
};

const toggleDarkMode = () => {
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
    isLoading.value = true;
    authStore.logout();
    localStorage.removeItem('auth');
    localStorage.removeItem('username');
    await new Promise(resolve => setTimeout(resolve, 1500));
    isLoading.value = false;
    router.push('/auth/login');
    closeUserModal();
  };
  notificationOnCancel.value = () => {};
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
  el.offsetHeight;
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
  el.offsetHeight;
  el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.transform = 'translateY(-10px)';
  
  setTimeout(done, 300);
};

// Handle window resize to toggle between sidebar and navbar
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
    uiStore.setSidebarState(false);
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Giữ nguyên toàn bộ style từ mã gốc */
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
}

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

/* Optimized mobile navbar styles */
.mobile-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
}

.navbar-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 0.5rem;
}

.navbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #374151;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: manipulation;
  min-height: 60px;
  font-size: 0.85rem;
  font-weight: 500;
}

.navbar-item:hover {
  background: #f0fdf4;
  color: #16a34a;
  transform: scale(1.05);
}

.navbar-item:active {
  transform: scale(0.95);
  background: #dcfce7;
}

.navbar-item-active {
  background: #dcfce7;
  color: #15803d;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.navbar-item .icon-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.navbar-item:hover .icon-svg,
.navbar-item-active .icon-svg {
  transform: scale(1.15);
}

.navbar-text {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Mobile menu overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.mobile-menu-content {
  background: #ffffff;
  width: 100%;
  max-height: 85vh;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.15);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.4);
  background: rgba(249, 250, 251, 0.95);
}

.mobile-menu-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-menu-close:hover {
  color: #15803d;
  background: #f0fdf4;
}

.mobile-menu-nav {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.mobile-nav-item-wrapper {
  margin-bottom: 0.75rem;
}

.mobile-nav-item,
.mobile-nav-parent {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: #374151;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  font-weight: 500;
  min-height: 56px;
  touch-action: manipulation;
}

.mobile-nav-item:hover,
.mobile-nav-parent:hover {
  background: #f0fdf4;
  color: #16a34a;
  transform: translateX(4px);
}

.mobile-nav-item:active,
.mobile-nav-parent:active {
  transform: scale(0.98);
}

.mobile-nav-item-active {
  background: #dcfce7;
  color: #15803d;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-nav-text {
  margin-left: 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
}

.mobile-nav-parent .bi-chevron-down {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.mobile-nav-parent .dropdown-expanded {
  transform: rotate(180deg);
}

.mobile-submenu {
  padding-left: 2.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.mobile-submenu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
}

.mobile-submenu-item:hover {
  background: #f0fdf4;
  color: #16a34a;
  transform: translateX(4px);
}

.mobile-submenu-item:active {
  transform: scale(0.98);
}

.mobile-submenu-item-active {
  color: #15803d;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-submenu-text {
  flex: 1;
  font-weight: 500;
}

.mobile-menu-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(229, 231, 235, 0.4);
  background: rgba(249, 250, 251, 0.95);
}

.mobile-menu-footer .user-profile {
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-footer .user-profile:hover {
  background: #f0fdf4;
  transform: scale(1.02);
}

.mobile-menu-footer .user-profile:active {
  transform: scale(0.98);
}

.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.mobile-menu-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .modern-sidebar {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-navbar,
  .mobile-menu-overlay {
    display: none;
  }
}

/* Scrollbar for mobile menu */
.mobile-menu-nav::-webkit-scrollbar {
  width: 6px;
}

.mobile-menu-nav::-webkit-scrollbar-track {
  background: rgba(249, 250, 251, 0.95);
}

.mobile-menu-nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.mobile-menu-nav::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>