<template>
  <div class="dashboard-container">
    <!-- Header Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="glass-card p-4">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="d-flex align-items-center">
                <div class="position-relative me-4">
                  <div class="avatar-circle d-flex align-items-center justify-content-center">
                    <span class="text-white fw-bold fs-2">{{ userInitial }}</span>
                  </div>
                </div>
                <div>
                  <h2 class="mb-2 fw-bold text-dark">Xin chào, {{ username }}! 👋</h2>
                  <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-center">
                      <div class="online-indicator me-2"></div>
                      <span class="text-muted fw-medium">{{ role }}</span>
                    </div>
                    <div class="vr opacity-25"></div>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar-check me-2 text-muted"></i>
                      <span class="text-muted">{{ currentDate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-end d-none d-md-block">
              <div class="status-badge">
                <span class="fw-semibold">Đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-lg-3 col-md-6" v-for="(stat, index) in stats" :key="index">
        <div class="stat-card glass-card p-4 h-100" @click="handleStatClick(stat)">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="stat-icon" :class="stat.iconClass">
              <i :class="stat.icon" class="fs-4"></i>
            </div>
            <div class="text-end">
              <div class="stat-value fw-bold mb-1">{{ stat.value }}</div>
              <div class="stat-change" :class="stat.changeClass">
                <i :class="stat.trendIcon" class="me-1"></i>
                {{ stat.change }}
              </div>
            </div>
          </div>
          <h6 class="stat-title mb-1">{{ stat.title }}</h6>
          <p class="stat-subtitle text-muted small mb-0">{{ stat.subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row g-4">
      <!-- Activity Timeline -->
      <div class="col-lg-8">
        <div class="glass-card" style="height: 100%; overflow: hidden;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">
              Hoạt động gần đây
            </h5>
            <button class="btn btn-link text-decoration-none p-0 fw-medium text-primary">
              Xem tất cả
              <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
          <div class="card-body">
            <div class="activity-timeline">
              <div 
                v-for="(activity, index) in recentActivities" 
                :key="activity.id"
                class="timeline-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="timeline-dot" :class="{ 'completed': activity.completed }"></div>
                <div class="timeline-content">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="timeline-title mb-1">{{ activity.title }}</h6>
                      <p class="timeline-description text-muted mb-0">{{ activity.description }}</p>
                    </div>
                    <div class="timeline-time">
                      <small class="text-muted">{{ activity.time }}</small>
                      <div class="activity-status" :class="activity.statusClass">
                        <i :class="activity.statusIcon"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Quick Actions -->
        <div class="glass-card mb-4">
          <div class="card-header">
            <h5 class="mb-0 fw-bold">
              Truy cập nhanh
            </h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-3">
              <button 
                v-for="(action, index) in quickActions" 
                :key="action.name"
                class="quick-action btn d-flex align-items-center p-3"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="handleQuickAction(action)"
              >
                <div class="action-icon me-3" :class="action.bgClass">
                  <i :class="action.icon"></i>
                </div>
                <span class="fw-medium">{{ action.name }}</span>
                <i class="bi bi-chevron-right ms-auto"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="glass-card">
          <div class="card-header">
            <h5 class="mb-0 fw-bold">
              Trạng thái hệ thống
            </h5>
          </div>
          <div class="card-body">
            <div class="system-status">
              <div 
                v-for="(status, index) in systemStatus" 
                :key="status.name"
                class="status-item d-flex justify-content-between align-items-center mb-3"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="d-flex align-items-center">
                  <div class="status-icon me-3" :class="status.iconClass">
                    <i :class="status.icon"></i>
                  </div>
                  <span class="fw-medium">{{ status.name }}</span>
                </div>
                <div class="d-flex align-items-center">
                  <div class="status-dot me-2" :class="status.dotClass"></div>
                  <span class="status-text" :class="status.textClass">{{ status.status }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    const username = ref('Admin')
    const role = ref('Quản trị viên')
    const currentTime = ref(new Date())

    const userInitial = computed(() => username.value.charAt(0).toUpperCase())
    const currentDate = computed(() => {
      return currentTime.value.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    })

    const stats = ref([
      {
        title: 'Tổng đơn hàng',
        value: '156',
        change: '+12%',
        subtitle: 'Hôm nay',
        icon: 'bi bi-bag-check',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Doanh thu',
        value: '2.5M',
        change: '+18%',
        subtitle: 'Tháng này',
        icon: 'bi bi-currency-dollar',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Khách hàng',
        value: '1,234',
        change: '+5%',
        subtitle: 'Tổng số',
        icon: 'bi bi-people',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Sản phẩm',
        value: '89',
        change: '-2%',
        subtitle: 'Trong kho',
        icon: 'bi bi-box-seam',
        iconClass: 'bg-mint',
        changeClass: 'text-muted',
        trendIcon: 'bi bi-trending-down'
      }
    ])

    const recentActivities = ref([
      {
        id: 1,
        title: 'Đơn hàng mới #12345',
        description: 'Khách hàng Nguyễn Văn A đã đặt hàng',
        time: '5 phút trước',
        completed: false,
      },
      {
        id: 2,
        title: 'Thanh toán thành công',
        description: 'Đơn hàng #12344 đã được thanh toán',
        time: '10 phút trước',
        completed: true,
      },
      {
        id: 3,
        title: 'Sản phẩm mới',
        description: 'Đã thêm 5 sản phẩm vào kho',
        time: '1 giờ trước',
        completed: true,
      },
      {
        id: 4,
        title: 'Khách hàng mới',
        description: 'Trần Thị B đã đăng ký tài khoản',
        time: '2 giờ trước',
        completed: true,
      }
      
    ])

    const quickActions = ref([
      {
        name: 'Tạo đơn hàng',
        icon: 'bi bi-plus-circle',
        bgClass: 'bg-mint'
      },
      {
        name: 'Quản lý sản phẩm',
        icon: 'bi bi-boxes',
        bgClass: 'bg-mint'
      },
      {
        name: 'Thống kê',
        icon: 'bi bi-bar-chart',
        bgClass: 'bg-mint'
      },
      {
        name: 'Cài đặt',
        icon: 'bi bi-gear',
        bgClass: 'bg-gray'
      }
    ])

    const systemStatus = ref([
      {
        name: 'Server',
        status: 'Hoạt động',
        icon: 'bi bi-server',
        iconClass: 'text-primary',
        dotClass: 'bg-success pulse',
        textClass: 'text-success fw-medium'
      },
      {
        name: 'Database',
        status: 'Bình thường',
        icon: 'bi bi-database',
        iconClass: 'text-info',
        dotClass: 'bg-success pulse',
        textClass: 'text-success fw-medium'
      },
      {
        name: 'Backup',
        status: 'Đang xử lý',
        icon: 'bi bi-cloud-upload',
        iconClass: 'text-warning',
        dotClass: 'bg-warning pulse',
        textClass: 'text-warning fw-medium'
      }
    ])

    const handleStatClick = (stat) => {
      console.log('Clicked stat:', stat.title)
    }

    const handleQuickAction = (action) => {
      console.log('Quick action:', action.name)
    }

    let timeInterval

    onMounted(() => {
      timeInterval = setInterval(() => {
        currentTime.value = new Date()
      }, 60000) // Update every minute
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      username,
      role,
      userInitial,
      currentDate,
      stats,
      recentActivities,
      quickActions,
      systemStatus,
      handleStatClick,
      handleQuickAction
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(21, 128, 61, 0.1);
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #34d399);
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
}

.status-badge {
  background: linear-gradient(135deg, #60a5fa, #34d399);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  display: inline-flex;
  align-items: center;
}

.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(21, 128, 61, 0.2);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.bg-primary {
  background: #60a5fa;
}

.bg-success {
  background: #15803d;
}

.bg-mint {
  background: #34d399;
}

.bg-gray {
  background-color: #6b7280;
}

.text-primary {
  color: #60a5fa !important;
}

.text-success {
  color: #15803d !important;
}

.text-mint {
  color: #34d399 !important;
}

.stat-value {
  font-size: 2rem;
  color: #1f2937;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.card-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 1.5rem 1rem;
}

.card-body {
  padding: 1.5rem;
}

.activity-timeline {
  position: relative;
  padding-left: 30px;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #60a5fa, #15803d);
}

.timeline-item {
  position: relative;
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: fadeInLeft 0.6s ease-out;
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6b7280;
  border: 3px solid white;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.2);
}

.timeline-dot.completed {
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2);
}

.timeline-title {
  color: #1f2937;
  font-weight: 600;
}

.timeline-time {
  text-align: right;
}

.activity-status {
  margin-top: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-pending {
  background: #60a5fa;
  color: white;
}

.status-success {
  background: #34d399;
  color: white;
}

.quick-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #1f2937;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.quick-action:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  color: #1f2937;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.status-item {
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.status-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.status-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

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

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>