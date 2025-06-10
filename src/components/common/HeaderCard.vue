<template>
  <div class="header-card">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="header-title sm:text-2xl font-extrabold tracking-tight" :style="{ color: titleColor }">
          {{ dynamicTitle }}
        </h1>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path"
                class="text-sm font-medium hover:text-green-600"
                :style="{ color: index === 0 ? '#15803d' : '#6b7280' }">
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-sm font-medium text-gray-500" aria-current="page">
                {{ crumb.name }}
              </span>
              <span v-if="index < breadcrumbs.length - 1" class="mx-2 text-gray-400" aria-hidden="true">
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
  { name: 'Trang chủ', path: '/trangChu'},
  { name: 'Bán Hàng', path: '/banHang' },
  { name: 'Quản Lý Hóa đơn', path: '/hoaDon'},
  {
    name: 'Trang chủ',
    path: '/trangChu',
    children: [
            {
        name: 'Sản phẩm',
        path: '/sanPham',
        children: [
          { name: 'Thêm Chi Tiết Sản phẩm', path: '/themChiTietSanPham' },
        ],
      },
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
      {
        name: 'Nhân viên',
        path: '/nhanVien',
        children: [
          { name: 'Thêm nhân viên', path: '/nhanVien/form' },
          { name: 'Sửa nhân viên', path: '/nhanVien/form/:id?' },
        ],
      },
      {
        name: 'Khách hàng',
        path: '/khachHang',
        children: [
          { name: 'Thêm khách hàng', path: '/khachHang/form' },
          { name: 'Sửa khách hàng', path: '/khachHang/form/:id?' },
        ],
      },
      {
        name: 'Phiếu giảm giá',
        path: '/phieuGiamGia',
        children: [
          { name: 'Thêm phiếu giảm giá', path: '/phieuGiamGia/form' },
          { name: 'Sửa phiếu giảm giá', path: '/phieuGiamGia/form/:id?' },
        ],
      },
      { name: 'Đợt giảm giá', path: '/dotGiamGia',
        children: [
          { name: 'Thêm đợt giảm giá', path: '/dotGiamGia/form' },
          { name: 'Sửa đợt giảm giá', path: '/dotGiamGia/form/:id?' },
        ],
       },
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
  setup(props) {
    const route = useRoute();

    const breadcrumbs = computed(() => {
      const currentPath = route.path;
      const crumbs = [];

      // Helper function to check if a path matches, including dynamic routes
      const pathMatches = (menuPath, currentPath) => {
        if (!menuPath.includes(':')) {
          return menuPath === currentPath;
        }
        // Handle dynamic routes like /nhanVien/form/:id?
        const regex = new RegExp(`^${menuPath.replace(/:id\?/, '[^/]*')}$`);
        return regex.test(currentPath);
      };

      // Helper function to find a menu item by path, recursively
      const findMenuItem = (items, path, parents = []) => {
        for (const item of items) {
          if (pathMatches(item.path, path)) {
            return { item, parents };
          }
          if (item.children) {
            const result = findMenuItem(item.children, path, [...parents, item]);
            if (result.item) return result;
          }
        }
        return { item: null, parents: [] };
      };

      // Helper function to build breadcrumb trail
      const buildBreadcrumbs = (path) => {
        const { item, parents } = findMenuItem(menuItems, path);

        // Add all parent items to breadcrumbs
        parents.forEach((parent) => {
          crumbs.push({ name: parent.name, path: parent.path });
        });

        // Add current item or fallback
        if (item) {
          // For dynamic routes, use the menu item path without the specific id
          crumbs.push({ name: item.name, path: item.path.replace('/:id?', '') });
        } else {
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

    // Compute the dynamic title based on the last breadcrumb
    const dynamicTitle = computed(() => {
      const lastCrumb = breadcrumbs.value[breadcrumbs.value.length - 1];
      return lastCrumb ? lastCrumb.name : props.title;
    });

    return { breadcrumbs, dynamicTitle };
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
  color: #16a34a;
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