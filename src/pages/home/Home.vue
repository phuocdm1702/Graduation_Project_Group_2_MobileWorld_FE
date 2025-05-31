<template>
  <div class="container-fluid py-4">
    <div class="container">
      <!-- Welcome Card -->
      <div class="card shadow-lg border-0 mb-4 welcome-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <div class="d-flex align-items-center">
                <div class="position-relative me-4">
                  <div class="avatar-container rounded-circle d-flex align-items-center justify-content-center shadow" 
                       style="width: 80px; height: 80px; background: linear-gradient(135deg, #002962, #0052cc);">
                    <span class="text-white fw-bold fs-2">{{ username.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white d-flex align-items-center justify-content-center" 
                       style="width: 24px; height: 24px;">
                    <div class="status-indicator bg-white rounded-circle" style="width: 8px; height: 8px;"></div>
                  </div>
                </div>
                <div>
                  <h2 class="mb-2 text-dark fw-bold welcome-text">Xin chào, {{ username }}! 👋</h2>
                  <div class="d-flex align-items-center flex-wrap gap-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-success rounded-circle me-2" style="width: 8px; height: 8px;"></div>
                      <span class="text-muted fw-medium">{{ role }}</span>
                    </div>
                    <div class="vr"></div>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-clock me-2 text-muted"></i>
                      <span class="text-muted">Thành viên từ {{ memberSince }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 text-end d-none d-lg-block">
              <div class="badge fs-6 px-3 py-2 status-badge" style="background: linear-gradient(135deg, #002962, #0052cc);">
                <div class="d-flex align-items-center">
                  <div class="bg-success rounded-circle me-2 pulse-dot" style="width: 8px; height: 8px;"></div>
                  <span class="text-white fw-semibold">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100 stat-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-container rounded-3 d-flex align-items-center justify-content-center" 
                     style="width: 48px; height: 48px; background: linear-gradient(135deg, #002962, #0052cc);">
                  <i class="bi bi-bag text-white"></i>
                </div>
                <span class="fs-3 fw-bold stat-number" style="color: #002962;">{{ totalSales }}</span>
              </div>
              <h5 class="card-title text-dark mb-1">Tổng đơn hàng</h5>
              <p class="card-text text-muted small mb-0">Hôm nay</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100 stat-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-container rounded-3 d-flex align-items-center justify-content-center" 
                     style="width: 48px; height: 48px; background: linear-gradient(135deg, #28a745, #1e7e34);">
                  <i class="bi bi-currency-dollar text-white"></i>
                </div>
                <span class="fs-3 fw-bold stat-number text-success">{{ totalRevenue }}</span>
              </div>
              <h5 class="card-title text-dark mb-1">Doanh thu</h5>
              <p class="card-text text-muted small mb-0">Tháng này</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100 stat-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-container rounded-3 d-flex align-items-center justify-content-center" 
                     style="width: 48px; height: 48px; background: linear-gradient(135deg, #002962, #003ba3);">
                  <i class="bi bi-people text-white"></i>
                </div>
                <span class="fs-3 fw-bold stat-number" style="color: #002962;">{{ totalCustomers }}</span>
              </div>
              <h5 class="card-title text-dark mb-1">Khách hàng</h5>
              <p class="card-text text-muted small mb-0">Tổng số</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100 stat-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-container rounded-3 d-flex align-items-center justify-content-center" 
                     style="width: 48px; height: 48px; background: linear-gradient(135deg, #fd7e14, #e8590c);">
                  <i class="bi bi-box text-white"></i>
                </div>
                <span class="fs-3 fw-bold stat-number text-warning">{{ totalProducts }}</span>
              </div>
              <h5 class="card-title text-dark mb-1">Sản phẩm</h5>
              <p class="card-text text-muted small mb-0">Trong kho</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Access -->
      <div class="row g-4">
        <!-- Recent Activity -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm activity-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold text-dark">Hoạt động gần đây</h5>
              <button class="btn btn-link text-decoration-none p-0 fw-medium view-all-btn" style="color: #002962;">Xem tất cả</button>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div v-for="(activity, index) in recentActivities" :key="activity.id" 
                     class="list-group-item border-0 px-0 py-3 activity-item" 
                     :style="`background: rgba(248, 249, 250, 0.5); animation-delay: ${index * 0.1}s;`">
                  <div class="d-flex align-items-center">
                    <div class="activity-icon rounded-circle d-flex align-items-center justify-content-center me-3" 
                         :class="activity.bgColor" style="width: 40px; height: 40px;">
                      <i :class="activity.icon" class="text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-1 fw-semibold text-dark">{{ activity.title }}</h6>
                      <p class="mb-0 text-muted small">{{ activity.description }}</p>
                    </div>
                    <span class="text-muted small">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access & System Status -->
        <div class="col-lg-4">
          <!-- Quick Access -->
          <div class="card border-0 shadow-sm mb-4 quick-access-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0">
              <h5 class="mb-0 fw-bold text-dark">Truy cập nhanh</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button v-for="(action, index) in quickActions" :key="action.name" 
                        class="btn btn-outline-primary d-flex align-items-center justify-content-start p-3 border-0 quick-action-btn"
                        :style="`background: rgba(0, 94, 226, 0.05); animation-delay: ${index * 0.1}s;`">
                  <div class="rounded-2 d-flex align-items-center justify-content-center me-3" 
                       :class="action.bgColor" style="width: 32px; height: 32px;">
                    <i :class="action.icon" class="text-white small"></i>
                  </div>
                  <span class="fw-medium">{{ action.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="card border-0 shadow-sm system-status-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
            <div class="card-header bg-transparent border-0">
              <h5 class="mb-0 fw-bold text-dark">Trạng thái hệ thống</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3 status-item">
                <span class="text-muted">Server</span>
                <div class="d-flex align-items-center">
                  <div class="bg-success rounded-circle me-2 pulse-dot" style="width: 8px; height: 8px;"></div>
                  <span class="text-success small fw-medium">Hoạt động</span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3 status-item">
                <span class="text-muted">Database</span>
                <div class="d-flex align-items-center">
                  <div class="bg-success rounded-circle me-2 pulse-dot" style="width: 8px; height: 8px;"></div>
                  <span class="text-success small fw-medium">Bình thường</span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center status-item">
                <span class="text-muted">Backup</span>
                <div class="d-flex align-items-center">
                  <div class="bg-warning rounded-circle me-2 pulse-dot" style="width: 8px; height: 8px;"></div>
                  <span class="text-warning small fw-medium">Đang xử lý</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      username: 'Admin',
      role: 'Quản trị viên',
      memberSince: 'Tháng 1, 2024',
      totalSales: 156,
      totalRevenue: '2.5M',
      totalCustomers: 1234,
      totalProducts: 89,
      recentActivities: [
        {
          id: 1,
          title: 'Đơn hàng mới #12345',
          description: 'Khách hàng Nguyễn Văn A đã đặt hàng',
          time: '5 phút',
          icon: 'bi bi-bag-check',
          bgColor: 'bg-primary'
        },
        {
          id: 2,
          title: 'Thanh toán thành công',
          description: 'Đơn hàng #12344 đã được thanh toán',
          time: '10 phút',
          icon: 'bi bi-check-circle',
          bgColor: 'bg-success'
        },
        {
          id: 3,
          title: 'Sản phẩm mới',
          description: 'Đã thêm 5 sản phẩm vào kho',
          time: '1 giờ',
          icon: 'bi bi-plus-circle',
          bgColor: 'bg-info'
        },
        {
          id: 4,
          title: 'Khách hàng mới',
          description: 'Trần Thị B đã đăng ký tài khoản',
          time: '2 giờ',
          icon: 'bi bi-person-plus',
          bgColor: 'bg-warning'
        }
      ],
      quickActions: [
        {
          name: 'Tạo đơn hàng',
          icon: 'bi bi-plus-lg',
          bgColor: 'bg-primary'
        },
        {
          name: 'Quản lý kho',
          icon: 'bi bi-boxes',
          bgColor: 'bg-success'
        },
        {
          name: 'Báo cáo',
          icon: 'bi bi-bar-chart',
          bgColor: 'bg-info'
        },
        {
          name: 'Cài đặt',
          icon: 'bi bi-gear',
          bgColor: 'bg-secondary'
        }
      ]
    }
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.username) {
        this.username = userData.username;
        this.role = userData.role || 'Người dùng';
      }
    }
  }
};
</script>

<style scoped>
/* Keyframes for smooth animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes smoothPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 94, 226, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 94, 226, 0.5);
  }
}

/* Main card animations */
.welcome-card {
  animation: fadeInUp 0.8s ease-out;
}

.stat-card {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 25px rgba(0, 94, 226, 0.15) !important;
}

.activity-card,
.quick-access-card,
.system-status-card {
  animation: slideInLeft 0.8s ease-out;
}

/* Element-specific animations */
.avatar-container {
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.1);
  animation: gentleGlow 2s infinite;
}

.welcome-text {
  animation: fadeInUp 1s ease-out 0.3s both;
}

.status-badge {
  animation: fadeInUp 1s ease-out 0.5s both;
}

.pulse-dot {
  animation: smoothPulse 2s infinite ease-in-out;
}

.status-indicator {
  animation: smoothPulse 2s infinite ease-in-out;
}

/* Icon and number animations */
.icon-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
}

.stat-number {
  transition: all 0.3s ease;
}

.stat-card:hover .stat-number {
  transform: scale(1.1);
}

/* Activity items */
.activity-item {
  animation: slideInLeft 0.6s ease-out;
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateX(10px);
  background: rgba(0, 94, 226, 0.05) !important;
}

.activity-icon {
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  transform: scale(1.15);
}

/* Quick action buttons */
.quick-action-btn {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent !important;
}

.quick-action-btn:hover {
  background: rgba(0, 94, 226, 0.1) !important;
  transform: translateX(8px) scale(1.02);
  border-color: rgba(0, 94, 226, 0.2) !important;
}

/* Status items */
.status-item {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.status-item:hover {
  transform: translateX(5px);
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
}

/* View all button */
.view-all-btn {
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: scale(1.05);
  color: #003ba3 !important;
}

/* Global smooth transitions */
* {
  transition: color 0.3s ease, background-color 0.3s ease;
}

/* Responsive animations */
@media (max-width: 768px) {
  .stat-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .quick-action-btn:hover {
    transform: translateX(4px) scale(1.01);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>