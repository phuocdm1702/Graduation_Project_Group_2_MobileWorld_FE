import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/modules/auth";

// Lazy-load layouts
const AdminLayout = () => import("@/layouts/AdminLayout.vue");
const AuthLayout = () => import("@/layouts/AuthLayout.vue");

// Lazy-load pages
const TrangChu = () => import("@/pages/home/TrangChu.vue");
const SanPham = () => import("@/pages/products/SanPham.vue");
const EditSanPham = () => import("@/pages/products/EditSanPham.vue");
const ChiTietSanPham = () => import("@/pages/products/ChiTietSanPham.vue");
const EditChiTietSanPham = () => import("@/pages/products/EditChiTietSanPham.vue");
const ThemChiTietSanPham = () => import("@/pages/products/ThemChiTietSanPham.vue");
const HoaDon = () => import("@/pages/bills/HoaDon.vue");
const HoaDonChiTiet = () => import("@/pages/bills/HoaDonChiTiet.vue");
const PhieuGiamGia = () => import("@/pages/promotions/PhieuGiamGia.vue");
const PhieuGiamGiaForm = () => import("@/pages/promotions/PhieuGiamGiaForm.vue");
const DotGiamGia = () => import("@/pages/promotions/DotGiamGia.vue");
const DotGiamGiaForm = () => import("@/pages/promotions/DotGiamGiaForm.vue");
const BanHang = () => import("@/pages/sells/banHang.vue");
const ThanhToanQuay = () => import("@/pages/sells/thanhToanQuay.vue");
const NhanVien = () => import("@/pages/accounts/NhanVien.vue");
const NhanVienForm = () => import("@/pages/accounts/NhanVienForm.vue");
const KhachHang = () => import("@/pages/accounts/KhachHang.vue");
const KhachHangForm = () => import("@/pages/accounts/KhachHangForm.vue");
const ChatInterface = () => import("@/pages/customerSupport/ChatInterface.vue");
const ThongKe = () => import("@/pages/statistics/ThongKe.vue");
const Login = () => import("@/pages/auth/Login.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const routes = [
  {
    path: "/",
    redirect: "/trangChu",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { 
        path: "/trangChu", 
        name: "TrangChu", 
        component: TrangChu,
        meta: {
          title: "Trang chủ",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" }
          ]
        }
      },
      { 
        path: "/sanPham", 
        name: "SanPham", 
        component: SanPham,
        meta: {
          title: "Sản phẩm",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Sản phẩm", path: "/sanPham" }
          ]
        }
      },
      { 
        path: "/editSanPham/:id?", 
        name: "EditSanPham", 
        component: EditSanPham, 
        props: true,
        meta: {
          title: "Chỉnh sửa sản phẩm",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Sản phẩm", path: "/sanPham" },
            { name: "Chỉnh sửa sản phẩm", path: "/editSanPham" }
          ]
        }
      },
      { 
        path: "/chiTietSanPham/:id?", 
        name: "ChiTietSanPham", 
        component: ChiTietSanPham, 
        props: true,
        meta: {
          title: "Chi tiết sản phẩm",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Sản phẩm", path: "/sanPham" },
            { name: "Chi tiết sản phẩm", path: "/chiTietSanPham" }
          ]
        }
      },
      { 
        path: "/chiTietSanPham/edit/:id?", 
        name: "EditChiTietSanPham", 
        component: EditChiTietSanPham, 
        props: true,
        meta: {
          title: "Chỉnh sửa chi tiết sản phẩm",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Sản phẩm", path: "/sanPham" },
            { name: "Chi tiết sản phẩm", path: "/chiTietSanPham" },
            { name: "Chỉnh sửa chi tiết sản phẩm", path: "/chiTietSanPham/edit" }
          ]
        }
      },
      { 
        path: "/themChiTietSanPham", 
        name: "ThemChiTietSanPham", 
        component: ThemChiTietSanPham,
        meta: {
          title: "Thêm chi tiết sản phẩm",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Sản phẩm", path: "/sanPham" },
            { name: "Thêm chi tiết sản phẩm", path: "/themChiTietSanPham" }
          ]
        }
      },
      { 
        path: "/banHang", 
        name: "BanHang", 
        component: BanHang,
        meta: {
          title: "Bán hàng",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Bán hàng", path: "/banHang" }
          ]
        }
      },
      { 
        path: "/thanh-toan-quay/:invoiceId", 
        name: "ThanhToanQuay", 
        component: ThanhToanQuay,
        props: route => ({
          invoiceId: route.params.invoiceId,
          totalAmount: Number(route.query.totalAmount) || 0,
          discount: Number(route.query.discount) || 0,
          shippingFee: Number(route.query.shippingFee) || 0
        }),
        meta: {
          title: "Thanh toán tại quầy",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Bán hàng", path: "/banHang" },
            { name: "Thanh toán tại quầy", path: "/thanh-toan-quay" }
          ]
        }
      },
      { 
        path: "/hoaDon", 
        name: "HoaDon", 
        component: HoaDon,
        meta: {
          title: "Quản lý hóa đơn",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Quản lý hóa đơn", path: "/hoaDon" }
          ]
        }
      },
      { 
        path: "/hoaDon/:id/detail", 
        name: "HoaDonChiTiet", 
        component: HoaDonChiTiet, 
        props: true,
        meta: {
          title: "Chi tiết hóa đơn",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Quản lý hóa đơn", path: "/hoaDon" },
            { name: "Chi tiết hóa đơn", path: "/hoaDon/detail" }
          ]
        }
      },
      { 
        path: "/phieuGiamGia", 
        name: "PhieuGiamGia", 
        component: PhieuGiamGia,
        meta: {
          title: "Phiếu giảm giá",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Phiếu giảm giá", path: "/phieuGiamGia" }
          ]
        }
      },
      { 
        path: "/phieuGiamGia/form/:id?", 
        name: "PhieuGiamGiaForm", 
        component: PhieuGiamGiaForm, 
        props: true,
        meta: {
          title: "Form phiếu giảm giá",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Phiếu giảm giá", path: "/phieuGiamGia" },
            { name: "Form phiếu giảm giá", path: "/phieuGiamGia/form" }
          ]
        }
      },
      { 
        path: "/dotGiamGia", 
        name: "DotGiamGia", 
        component: DotGiamGia,
        meta: {
          title: "Đợt giảm giá",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Đợt giảm giá", path: "/dotGiamGia" }
          ]
        }
      },
      { 
        path: "/dotGiamGia/form/:id?", 
        name: "DotGiamGiaForm", 
        component: DotGiamGiaForm, 
        props: true,
        meta: {
          title: "Form đợt giảm giá",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Đợt giảm giá", path: "/dotGiamGia" },
            { name: "Form đợt giảm giá", path: "/dotGiamGia/form" }
          ]
        }
      },
      { 
        path: "/nhanVien", 
        name: "NhanVien", 
        component: NhanVien,
        meta: {
          title: "Nhân viên",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Nhân viên", path: "/nhanVien" }
          ]
        }
      },
      { 
        path: "/nhanVien/form/:id?", 
        name: "NhanVienForm", 
        component: NhanVienForm, 
        props: true,
        meta: {
          title: "Form nhân viên",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Nhân viên", path: "/nhanVien" },
            { name: "Form nhân viên", path: "/nhanVien/form" }
          ]
        }
      },
      { 
        path: "/khachHang", 
        name: "KhachHang", 
        component: KhachHang,
        meta: {
          title: "Khách hàng",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Khách hàng", path: "/khachHang" }
          ]
        }
      },
      { 
        path: "/khachHang/form/:id?", 
        name: "KhachHangForm", 
        component: KhachHangForm, 
        props: true,
        meta: {
          title: "Form khách hàng",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Khách hàng", path: "/khachHang" },
            { name: "Form khách hàng", path: "/khachHang/form" }
          ]
        }
      },
      { 
        path: "/chatInterface", 
        name: "ChatInterface", 
        component: ChatInterface,
        meta: {
          title: "Hệ thống chat khách hàng",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Hỗ trợ khách hàng", path: "/chatInterface" }
          ]
        }
      },
      { 
        path: "/thongKe", 
        name: "ThongKe", 
        component: ThongKe,
        meta: {
          title: "Thống kê",
          breadcrumb: [
            { name: "Trang chủ", path: "/trangChu" },
            { name: "Thống kê", path: "/thongKe" }
          ]
        }
      },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { 
        path: "login", 
        name: "Login", 
        component: Login,
        meta: {
          title: "Đăng nhập",
          breadcrumb: [
            { name: "Đăng nhập", path: "/auth/login" }
          ]
        }
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: {
      title: "Không tìm thấy trang",
      breadcrumb: [
        { name: "Không tìm thấy trang", path: "/404" }
      ]
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Khôi phục trạng thái auth từ localStorage (đồng bộ)
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    const authData = JSON.parse(savedAuth);
    if (authData.isAuthenticated && authData.user) {
      authStore.login(authData.user);
    }
  }

  console.log('Route to:', to.name, 'Authenticated:', authStore.isAuthenticated);

  // Nếu route yêu cầu đăng nhập và chưa đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login');
    next('/auth/login');
  } else {
    next();
  }
});

export default router;