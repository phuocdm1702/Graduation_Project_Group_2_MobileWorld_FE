<template>
  <div class="header-card">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="header-title sm:text-2xl font-extrabold tracking-tight" :style="{ color: titleColor }">{{ title }}</h1>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-sm font-medium hover:text-green-600"
                :style="{ color: index === 0 ? '#15803d' : '#6b7280' }"
              >
                {{ crumb.name }}
              </router-link>
              <span
                v-else
                class="text-sm font-medium text-gray-500"
                aria-current="page"
              >
                {{ crumb.name }}
              </span>
              <span
                v-if="index < breadcrumbs.length - 1"
                class="mx-2 text-gray-400"
                aria-hidden="true"
              >
                /
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const menuItems = [
  { name: 'Trang chủ', path: '/trangChu', icon: 'HomeIcon' },
  { name: 'Bán Hàng', path: '/banHang', icon: 'ShoppingCartIcon' },
  { name: 'Quản Lý Hóa đơn', path: '/hoaDon', icon: 'DocumentTextIcon' },
  {
    name: 'Quản Lý Sản phẩm',
    path: '/quanLySanPham',
    icon: 'CubeIcon',
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
  },
  {
    name: 'Quản Lý Tài khoản',
    path: '/quanLyTaiKhoan',
    icon: 'UserIcon',
    children: [
      { name: 'Nhân viên', path: '/nhanVien' },
      { name: 'Khách hàng', path: '/khachHang' },
    ],
  },
  {
    name: 'Quản Lý Giảm giá',
    path: '/quanLyGiamGia',
    icon: 'TagIcon',
    children: [
      { name: 'Phiếu giảm giá', path: '/phieuGiamGia' },
      { name: 'Đợt giảm giá', path: '/dotGiamGia' },
    ],
  },
  { name: 'Thống kê', path: '/thongKe', icon: 'ChartBarIcon' },
];

export default {
  name: 'HeaderCard',
  props: {
    title: {
      type: String,
      default: 'Không Xác Định',
    },
    badgeText: {
      type: String,
      default: 'Default',
    },
    titleColor: {
      type: String,
      default: '#15803d',
    },
    badgeClass: {
      type: String,
      default: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    },
    backgroundOpacity: {
      type: Number,
      default: 0.95,
    },
  },
  setup() {
    const route = useRoute();

    const breadcrumbs = computed(() => {
      const currentPath = route.path;
      const crumbs = [];

      // Helper function to find a menu item by path
      const findMenuItem = (items, path) => {
        for (const item of items) {
          if (item.path === path || path.startsWith(item.path)) {
            return item;
          }
          if (item.children) {
            const childItem = findMenuItem(item.children, path);
            if (childItem) return item;
          }
        }
        return null;
      };

      // Helper function to build breadcrumb trail
      const buildBreadcrumbs = (path) => {
        let currentItem = null;
        let parentItem = null;

        // Find the deepest matching menu item
        for (const item of menuItems) {
          if (path === item.path || path.startsWith(item.path)) {
            currentItem = item;
            break;
          }
          if (item.children) {
            for (const child of item.children) {
              if (path === child.path || path.startsWith(child.path)) {
                currentItem = child;
                parentItem = item;
                break;
              }
            }
            if (currentItem) break;
          }
        }

        // Build the breadcrumb trail
        if (parentItem) {
          crumbs.push({ name: parentItem.name, path: parentItem.path });
        }
        if (currentItem) {
          crumbs.push({ name: currentItem.name, path: currentItem.path });
        } else {
          // Fallback for unmatched routes
          crumbs.push({ name: route.name || 'Trang hiện tại', path });
        }
      };

      buildBreadcrumbs(currentPath);

      // Add Home as the first breadcrumb
      if (crumbs[0]?.path !== '/trangChu') {
        crumbs.unshift({ name: 'Trang chủ', path: '/trangChu' });
      }

      return crumbs;
    });

    return { breadcrumbs };
  },
};
</script>

<style scoped>
.header-card {
  animation: slideIn 0.6s ease-out;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.115);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  display: flex;
  background-color: rgba(255, 255, 255, v-bind(backgroundOpacity));
}

h1 {
  font-size: 1.7rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.breadcrumb li {
  display: flex;
  align-items: center;
}

.breadcrumb a {
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: #16a34a; /* Matches hover color from Sidebar.vue */
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .header-title {
    font-size: 1.75rem;
  }
  .breadcrumb {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: 1rem;
  }
  .header-title {
    font-size: 1.5rem;
  }
  .breadcrumb {
    font-size: 0.75rem;
  }
}
</style>