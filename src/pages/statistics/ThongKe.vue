<template>
  <div class="container-fluid py-4 statistics-management">
    <!-- Header Section -->
    <HeaderCard title="Thống Kê & Báo Cáo" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Thống Kê" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Time Range Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian thống kê</label>
              <select v-model="selectedTimeRange" class="form-control filter-select">
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">7 ngày qua</option>
                <option value="month">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="quarter">Quý này</option>
                <option value="year">Năm này</option>
                <option value="custom">Tùy chọn</option>
              </select>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div class="col-lg-4 col-md-6" v-if="selectedTimeRange === 'custom'">
            <div class="filter-group">
              <label class="filter-label">Thời gian tùy chọn</label>
              <div class="date-range-wrapper d-flex align-items-center">
                <input type="date" v-model="customStartDate" class="form-control date-input" />
                <span class="date-separator mx-2">đến</span>
                <input type="date" v-model="customEndDate" class="form-control date-input" />
              </div>
            </div>
          </div>

          <!-- Chart Type Filter -->
          <div class="col-lg-4">
            <div class="filter-group">
              <label class="filter-label">Loại biểu đồ</label>
              <div class="chart-type-buttons">
                <button 
                  v-for="type in chartTypes" 
                  :key="type.value"
                  class="btn chart-type-btn"
                  :class="{ 'active': selectedChartType === type.value }"
                  @click="selectedChartType = type.value"
                >
                  <i :class="type.icon" class="me-2"></i>
                  {{ type.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item me-4">
                  <span class="stat-label">Tổng doanh thu:</span>
                  <span class="stat-value text-success">{{ formatPrice(totalRevenue) }}</span>
                </div>
                <div class="stat-item me-4">
                  <span class="stat-label">Số đơn hàng:</span>
                  <span class="stat-value">{{ totalOrders }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Tăng trưởng:</span>
                  <span class="stat-value" :class="growthRate >= 0 ? 'text-success' : 'text-danger'">
                    {{ growthRate >= 0 ? '+' : '' }}{{ growthRate }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportReport">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất báo cáo
            </button>
            <button class="btn btn-action" @click="printReport">
              <i class="bi bi-printer me-2"></i>
              In báo cáo
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Statistics Cards Row -->
    <div class="row g-4 mb-4">
      <div class="col-lg-3 col-md-6" v-for="(stat, index) in statisticsCards" :key="index">
        <div class="stat-card glass-card p-4 h-100" :style="{ animationDelay: `${index * 0.1}s` }">
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

    <!-- Charts Section -->
    <div class="row g-4 mb-4">
      <!-- Revenue Chart -->
      <div class="col-lg-8">
        <FilterTableSection title="Biểu Đồ Doanh Thu" icon="bi bi-bar-chart-line">
          <div class="chart-container p-4">
            <canvas ref="revenueChart" class="revenue-chart"></canvas>
          </div>
        </FilterTableSection>
      </div>

      <!-- Top Products -->
      <div class="col-lg-4">
        <FilterTableSection title="Sản Phẩm Bán Chạy" icon="bi bi-trophy">
          <div class="top-products-container p-4">
            <div v-for="(product, index) in topProducts" :key="product.id" 
                 class="product-item d-flex align-items-center mb-3">
              <div class="product-rank me-3">
                <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
              </div>
              <div class="product-info flex-grow-1">
                <div class="product-name fw-semibold">{{ product.name }}</div>
                <div class="product-stats">
                  <small class="text-muted">Đã bán: {{ product.sold }} | Doanh thu: {{ formatPrice(product.revenue) }}</small>
                </div>
              </div>
              <div class="product-progress">
                <div class="progress" style="width: 60px; height: 4px;">
                  <div class="progress-bar bg-mint" :style="{ width: product.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Additional Charts Row -->
    <div class="row g-4 mb-4">
      <!-- Order Status Distribution -->
      <div class="col-lg-6">
        <FilterTableSection title="Phân Bố Trạng Thái Đơn Hàng" icon="bi bi-pie-chart">
          <div class="chart-container p-4">
            <canvas ref="statusChart" class="status-chart"></canvas>
          </div>
        </FilterTableSection>
      </div>

      <!-- Customer Analysis -->
      <div class="col-lg-6">
        <FilterTableSection title="Phân Tích Khách Hàng" icon="bi bi-people">
          <div class="customer-analysis p-4">
            <div class="row g-3">
              <div class="col-6">
                <div class="analysis-item text-center">
                  <div class="analysis-number text-mint fw-bold fs-4">{{ customerStats.new }}</div>
                  <div class="analysis-label text-muted">Khách hàng mới</div>
                </div>
              </div>
              <div class="col-6">
                <div class="analysis-item text-center">
                  <div class="analysis-number text-success fw-bold fs-4">{{ customerStats.returning }}</div>
                  <div class="analysis-label text-muted">Khách hàng quay lại</div>
                </div>
              </div>
              <div class="col-12">
                <div class="customer-growth-chart">
                  <canvas ref="customerChart" class="customer-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Detailed Statistics Table -->
    <FilterTableSection title="Bảng Thống Kê Chi Tiết" icon="bi bi-table">
      <div class="table-responsive">
        <table class="table table-hover statistics-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Doanh thu</th>
              <th>Số đơn hàng</th>
              <th>Giá trị TB/đơn</th>
              <th>Tăng trưởng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in detailedStats" :key="index" class="table-row">
              <td class="fw-semibold">{{ row.period }}</td>
              <td class="text-success fw-semibold">{{ formatPrice(row.revenue) }}</td>
              <td>{{ row.orders }}</td>
              <td>{{ formatPrice(row.avgOrder) }}</td>
              <td>
                <span class="growth-badge" :class="row.growth >= 0 ? 'positive' : 'negative'">
                  <i :class="row.growth >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'" class="me-1"></i>
                  {{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </FilterTableSection>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import HeaderCard from "@/components/common/HeaderCard.vue";

export default {
  name: 'Thống Kê',
  
  setup() {
    // Reactive data
    const selectedTimeRange = ref('month')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const selectedChartType = ref('line')
    const revenueChart = ref(null)
    const statusChart = ref(null)
    const customerChart = ref(null)

    // Chart instances
    let revenueChartInstance = null
    let statusChartInstance = null
    let customerChartInstance = null

    // Chart types
    const chartTypes = ref([
      { value: 'line', label: 'Đường', icon: 'bi bi-graph-up' },
      { value: 'bar', label: 'Cột', icon: 'bi bi-bar-chart' },
      { value: 'area', label: 'Vùng', icon: 'bi bi-area-chart' }
    ])

    // Statistics data
    const totalRevenue = ref(15800000)
    const totalOrders = ref(1247)
    const growthRate = ref(18.5)

    const statisticsCards = ref([
      {
        title: 'Doanh thu hôm nay',
        value: '3.2M',
        change: '+15.3%',
        subtitle: 'So với hôm qua',
        icon: 'bi bi-currency-dollar',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Đơn hàng mới',
        value: '89',
        change: '+12.8%',
        subtitle: 'Hôm nay',
        icon: 'bi bi-bag-check',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Khách hàng mới',
        value: '24',
        change: '+8.2%',
        subtitle: 'Tuần này',
        icon: 'bi bi-person-plus',
        iconClass: 'bg-mint',
        changeClass: 'text-success',
        trendIcon: 'bi bi-trending-up'
      },
      {
        title: 'Tỷ lệ chuyển đổi',
        value: '3.45%',
        change: '-2.1%',
        subtitle: 'Tháng này',
        icon: 'bi bi-percent',
        iconClass: 'bg-warning',
        changeClass: 'text-warning',
        trendIcon: 'bi bi-trending-down'
      }
    ])

    const topProducts = ref([
      { id: 1, name: 'iPhone 14 Pro Max', sold: 145, revenue: 2800000, percentage: 100 },
      { id: 2, name: 'Samsung Galaxy S23', sold: 123, revenue: 2100000, percentage: 85 },
      { id: 3, name: 'MacBook Pro M2', sold: 89, revenue: 1950000, percentage: 70 },
      { id: 4, name: 'iPad Air', sold: 67, revenue: 1200000, percentage: 46 },
      { id: 5, name: 'AirPods Pro', sold: 234, revenue: 850000, percentage: 30 }
    ])

    const customerStats = ref({
      new: 156,
      returning: 891
    })

    const detailedStats = ref([
      { period: 'Hôm nay', revenue: 3200000, orders: 89, avgOrder: 35955, growth: 15.3, status: 'Tốt' },
      { period: 'Hôm qua', revenue: 2800000, orders: 76, avgOrder: 36842, growth: 8.7, status: 'Tốt' },
      { period: 'Tuần này', revenue: 18500000, orders: 543, avgOrder: 34068, growth: 12.4, status: 'Xuất sắc' },
      { period: 'Tuần trước', revenue: 16200000, orders: 498, avgOrder: 32530, growth: -2.1, status: 'Bình thường' },
      { period: 'Tháng này', revenue: 67800000, orders: 1847, avgOrder: 36720, growth: 18.9, status: 'Xuất sắc' },
      { period: 'Tháng trước', revenue: 55600000, orders: 1632, avgOrder: 34069, growth: 7.3, status: 'Tốt' }
    ])

    // Chart data
    const revenueData = ref({
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: [2800000, 3200000, 2900000, 3500000, 4100000, 3800000, 3200000],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#34d399',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    })

    const statusData = ref({
      labels: ['Hoàn thành', 'Đang xử lý', 'Chờ xác nhận', 'Đã hủy'],
      datasets: [{
        data: [65, 20, 10, 5],
        backgroundColor: [
          '#34d399',
          '#f59e0b',
          '#3b82f6',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverOffset: 10
      }]
    })

    const customerData = ref({
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
      datasets: [
        {
          label: 'Khách hàng mới',
          data: [12, 19, 15, 25, 22, 24],
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
          tension: 0.4,
          pointBackgroundColor: '#34d399',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Khách hàng quay lại',
          data: [8, 15, 12, 18, 16, 20],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    })

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const getRankClass = (index) => {
      if (index === 0) return 'rank-gold'
      if (index === 1) return 'rank-silver'
      if (index === 2) return 'rank-bronze'
      return 'rank-default'
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'Xuất sắc': return 'status-excellent'
        case 'Tốt': return 'status-good'
        case 'Bình thường': return 'status-normal'
        default: return 'status-default'
      }
    }

    const resetFilters = () => {
      selectedTimeRange.value = 'month'
      customStartDate.value = ''
      customEndDate.value = ''
      selectedChartType.value = 'line'
    }

    const exportReport = () => {
      console.log('Exporting report...')
      // Implement export functionality here
      const data = {
        totalRevenue: totalRevenue.value,
        totalOrders: totalOrders.value,
        growthRate: growthRate.value,
        detailedStats: detailedStats.value,
        topProducts: topProducts.value,
        timeRange: selectedTimeRange.value
      }
      
      // Convert to CSV or Excel format
      const csvContent = convertToCSV(data)
      downloadCSV(csvContent, 'bao-cao-thong-ke.csv')
    }

    const printReport = () => {
      console.log('Printing report...')
      window.print()
    }

    const convertToCSV = (data) => {
      let csv = 'Báo cáo thống kê\n\n'
      csv += 'Tổng quan\n'
      csv += `Tổng doanh thu,${formatPrice(data.totalRevenue)}\n`
      csv += `Tổng đơn hàng,${data.totalOrders}\n`
      csv += `Tăng trưởng,${data.growthRate}%\n\n`
      
      csv += 'Thống kê chi tiết\n'
      csv += 'Thời gian,Doanh thu,Số đơn hàng,Giá trị TB/đơn,Tăng trưởng,Trạng thái\n'
      
      data.detailedStats.forEach(row => {
        csv += `${row.period},${row.revenue},${row.orders},${row.avgOrder},${row.growth}%,${row.status}\n`
      })
      
      return csv
    }

    const downloadCSV = (content, filename) => {
      const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Chart initialization and management
    const loadChartJS = async () => {
      try {
        // Try to load from CDN first
        if (window.Chart) {
          return window.Chart
        }
        
        // If CDN not available, load dynamically
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
        document.head.appendChild(script)
        
        return new Promise((resolve, reject) => {
          script.onload = () => resolve(window.Chart)
          script.onerror = reject
        })
      } catch (error) {
        console.error('Failed to load Chart.js:', error)
        return null
      }
    }

    const initializeCharts = async () => {
      await nextTick()
      
      try {
        const Chart = await loadChartJS()
        if (!Chart) {
          console.error('Chart.js not available')
          return
        }

        // Revenue Chart
        if (revenueChart.value) {
          const ctx = revenueChart.value.getContext('2d')
          
          if (revenueChartInstance) {
            revenueChartInstance.destroy()
          }
          
          revenueChartInstance = new Chart(ctx, {
            type: selectedChartType.value,
            data: revenueData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: '#34d399',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      return 'Doanh thu: ' + formatPrice(context.parsed.y)
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return (value / 1000000).toFixed(1) + 'M'
                    },
                    color: '#6b7280'
                  },
                  grid: {
                    color: 'rgba(52, 211, 153, 0.1)',
                    borderColor: 'rgba(52, 211, 153, 0.2)'
                  }
                },
                x: {
                  ticks: {
                    color: '#6b7280'
                  },
                  grid: {
                    display: false
                  }
                }
              },
              animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
              }
            }
          })
        }

        // Status Chart (Doughnut)
        if (statusChart.value) {
          const ctx = statusChart.value.getContext('2d')
          
          if (statusChartInstance) {
            statusChartInstance.destroy()
          }
          
          statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: statusData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: '#6b7280',
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: '#34d399',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      return context.label + ': ' + context.parsed + '%'
                    }
                  }
                }
              },
              cutout: '60%',
              animation: {
                animateRotate: true,
                duration: 1500
              }
            }
          })
        }

        // Customer Chart
        if (customerChart.value) {
          const ctx = customerChart.value.getContext('2d')
          
          if (customerChartInstance) {
            customerChartInstance.destroy()
          }
          
          customerChartInstance = new Chart(ctx, {
            type: 'line',
            data: customerData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 15,
                    usePointStyle: true,
                    color: '#6b7280',
                    font: {
                      size: 11
                    }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: '#34d399',
                  borderWidth: 1
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 10
                    }
                  },
                  grid: {
                    color: 'rgba(52, 211, 153, 0.1)'
                  }
                },
                x: {
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 10
                    }
                  },
                  grid: {
                    display: false
                  }
                }
              },
              animation: {
                duration: 1200,
                easing: 'easeInOutCubic'
              }
            }
          })
        }
      } catch (error) {
        console.error('Error initializing charts:', error)
      }
    }

    // Update revenue chart when chart type changes
    const updateRevenueChart = async () => {
      if (revenueChartInstance && selectedChartType.value) {
        try {
          const Chart = await loadChartJS()
          if (!Chart) return
          
          revenueChartInstance.destroy()
          
          const ctx = revenueChart.value.getContext('2d')
          revenueChartInstance = new Chart(ctx, {
            type: selectedChartType.value,
            data: revenueData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: '#34d399',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      return 'Doanh thu: ' + formatPrice(context.parsed.y)
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return (value / 1000000).toFixed(1) + 'M'
                    },
                    color: '#6b7280'
                  },
                  grid: {
                    color: 'rgba(52, 211, 153, 0.1)',
                    borderColor: 'rgba(52, 211, 153, 0.2)'
                  }
                },
                x: {
                  ticks: {
                    color: '#6b7280'
                  },
                  grid: {
                    display: false
                  }
                }
              },
              animation: {
                duration: 800,
                easing: 'easeInOutQuart'
              }
            }
          })
        } catch (error) {
          console.error('Error updating revenue chart:', error)
        }
      }
    }

    // Update chart data based on selected time range
    const updateChartData = () => {
      switch (selectedTimeRange.value) {
        case 'today':
          revenueData.value.labels = ['6h', '9h', '12h', '15h', '18h', '21h']
          revenueData.value.datasets[0].data = [500000, 800000, 1200000, 900000, 1500000, 600000]
          totalRevenue.value = 5500000
          totalOrders.value = 89
          growthRate.value = 15.3
          break
        case 'yesterday':
          revenueData.value.labels = ['6h', '9h', '12h', '15h', '18h', '21h']
          revenueData.value.datasets[0].data = [450000, 700000, 1100000, 800000, 1300000, 550000]
          totalRevenue.value = 4900000
          totalOrders.value = 76
          growthRate.value = 8.7
          break
        case 'week':
          revenueData.value.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
          revenueData.value.datasets[0].data = [2800000, 3200000, 2900000, 3500000, 4100000, 3800000, 3200000]
          totalRevenue.value = 23500000
          totalOrders.value = 543
          growthRate.value = 12.4
          break
        case 'month':
          revenueData.value.labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
          revenueData.value.datasets[0].data = [12000000, 15000000, 13500000, 16800000]
          totalRevenue.value = 57300000
          totalOrders.value = 1247
          growthRate.value = 18.9
          break
        case 'quarter':
          revenueData.value.labels = ['Tháng 1', 'Tháng 2', 'Tháng 3']
          revenueData.value.datasets[0].data = [45000000, 52000000, 58000000]
          totalRevenue.value = 155000000
          totalOrders.value = 3542
          growthRate.value = 22.1
          break
        case 'year':
          revenueData.value.labels = ['Q1', 'Q2', 'Q3', 'Q4']
          revenueData.value.datasets[0].data = [155000000, 178000000, 165000000, 192000000]
          totalRevenue.value = 690000000
          totalOrders.value = 15847
          growthRate.value = 28.5
          break
        default:
          break
      }
      
      // Update charts if they exist
      if (revenueChartInstance) {
        revenueChartInstance.data = revenueData.value
        revenueChartInstance.update('active')
      }
    }

    // Cleanup function
    const destroyCharts = () => {
      if (revenueChartInstance) {
        revenueChartInstance.destroy()
        revenueChartInstance = null
      }
      if (statusChartInstance) {
        statusChartInstance.destroy()
        statusChartInstance = null
      }
      if (customerChartInstance) {
        customerChartInstance.destroy()
        customerChartInstance = null
      }
    }

    // Watch for chart type changes
    watch(selectedChartType, () => {
      updateRevenueChart()
    })

    // Watch for time range changes to update data
    watch(selectedTimeRange, () => {
      updateChartData()
    })

    // Initialize charts on mount
    onMounted(() => {
      setTimeout(initializeCharts, 200) // Small delay to ensure DOM is ready
    })

    // Cleanup on unmount
    onUnmounted(() => {
      destroyCharts()
    })

    return {
      selectedTimeRange,
      customStartDate,
      customEndDate,
      selectedChartType,
      chartTypes,
      totalRevenue,
      totalOrders,
      growthRate,
      statisticsCards,
      topProducts,
      customerStats,
      detailedStats,
      revenueChart,
      statusChart,
      customerChart,
      revenueData,
      statusData,
      customerData,
      formatPrice,
      getRankClass,
      getStatusClass,
      resetFilters,
      exportReport,
      printReport,
      initializeCharts,
      updateRevenueChart,
      updateChartData
    }
  }
}
</script>

<style scoped>
/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Base Styles */
.statistics-management {
  min-height: 100vh;
  animation: fadeInUp 0.4s ease-out;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

/* Filter Styles */
.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.filter-select,
.date-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.filter-select:focus,
.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.date-separator {
  color: #1f3a44;
  font-weight: 500;
}

.chart-type-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-type-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  background: #f8f9fa;
  color: #1f3a44;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.chart-type-btn.active,
.chart-type-btn:hover {
  background: #34d399;
  color: white;
  border-color: #34d399;
}

/* Filter Stats */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f3a44;
}

.stat-value.text-success {
  color: #16a34a !important;
}

.stat-value.text-danger {
  color: #dc3545 !important;
}

/* Action Buttons */
.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset,
.btn-action {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

/* Statistics Cards */
.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(52, 211, 153, 0.2);
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

.bg-mint {
  background: linear-gradient(135deg, #34d399, #16a34a);
}

.bg-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-value {
  font-size: 2rem;
  color: #1f3a44;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.text-success {
  color: #16a34a !important;
}

.text-warning {
  color: #f59e0b !important;
}

.text-mint {
  color: #34d399 !important;
}

/* Chart Containers */
.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.revenue-chart,
.status-chart,
.customer-chart {
  max-width: 100%;
  max-height: 100%;
}

/* Top Products */
.top-products-container {
  max-height: 400px;
  overflow-y: auto;
}

.product-item {
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.product-item:hover {
  background: rgba(52, 211, 153, 0.05);
}

.product-rank {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.rank-number {
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 1.1rem;
}

.rank-gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.rank-silver {
  background: linear-gradient(135deg, #e5e7eb, #9ca3af);
  color: white;
}

.rank-bronze {
  background: linear-gradient(135deg, #d97706, #92400e);
  color: white;
}

.rank-default {
  background: #f3f4f6;
  color: #6b7280;
}

.product-name {
  color: #1f3a44;
  font-size: 0.9rem;
}

.product-stats {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Customer Analysis */
.customer-analysis {
  height: 350px;
}

.analysis-item {
  padding: 1rem;
  background: rgba(52, 211, 153, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.analysis-number {
  font-size: 2.5rem;
  font-weight: 700;
}

.analysis-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.customer-growth-chart {
  height: 150px;
  margin-top: 1rem;
}

/* Statistics Table */
.statistics-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.statistics-table thead {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.statistics-table th {
  font-weight: 600;
  padding: 1rem;
  border: none;
}

.statistics-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: rgba(52, 211, 153, 0.05);
}

.growth-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.growth-badge.positive {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.growth-badge.negative {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-excellent {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.status-good {
  background: rgba(52, 211, 153, 0.2);
  color: #16a34a;
}

.status-normal {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chart-type-buttons {
    flex-direction: column;
  }

  .chart-type-btn {
    width: 100%;
    justify-content: center;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .chart-container {
    height: 250px;
  }

  .customer-analysis {
    height: auto;
  }

  .analysis-number {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .statistics-table {
    font-size: 0.875rem;
  }

  .statistics-table th,
  .statistics-table td {
    padding: 0.75rem 0.5rem;
  }

  .product-item {
    padding: 0.5rem;
  }

  .product-rank {
    width: 30px;
    height: 30px;
  }

  .rank-number {
    font-size: 0.9rem;
  }
}

/* Animation Classes */
.animate__animated {
  --animate-duration: 0.3s;
}

.animate__fadeIn {
  animation-name: fadeInUp;
}

.animate__zoomIn {
  animation-name: zoomIn;
}

/* Scrollbar Styling */
.top-products-container::-webkit-scrollbar {
  width: 4px;
}

/* Scrollbar Styling */
.top-products-container::-webkit-scrollbar {
  width: 4px;
}

.top-products-container::-webkit-scrollbar-track {
  background: rgba(52, 211, 153, 0.05);
  border-radius: 2px;
}

.top-products-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-radius: 2px;
}

.top-products-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #16a34a, #059669);
}

/* Progress Bar Styling */
.progress {
  background-color: rgba(52, 211, 153, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar.bg-mint {
  background: linear-gradient(90deg, #34d399, #16a34a) !important;
  transition: width 0.6s ease;
}

/* Loading States */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Enhanced Filter Section */
.filter-group {
  position: relative;
}

.filter-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: -15px;
  width: 3px;
  height: 100%;
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filter-group:hover::before {
  opacity: 1;
}

/* Enhanced Table Styles */
.statistics-table {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.statistics-table thead th {
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
}

.statistics-table thead th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
}

/* Card Hover Effects */
.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.15);
}

/* Enhanced Chart Containers */
.chart-container {
  position: relative;
  background: rgba(52, 211, 153, 0.02);
  border-radius: 8px;
}

.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 49%, rgba(52, 211, 153, 0.05) 50%, transparent 51%);
  pointer-events: none;
  border-radius: 8px;
}

/* Enhanced Button Styles */
.btn-action,
.btn-reset {
  position: relative;
  overflow: hidden;
}

.btn-action::before,
.btn-reset::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-action:hover::before,
.btn-reset:hover::before {
  left: 100%;
}

/* Enhanced Status Indicators */
.status-badge {
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  opacity: 0.3;
  border-radius: 1rem 0 0 1rem;
}

/* Enhanced Stats Cards Animation */
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(52, 211, 153, 0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.6s ease;
  opacity: 0;
}

.stat-card:hover::before {
  opacity: 1;
  animation: shimmer 1.5s ease-in-out;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Enhanced Form Elements */
.form-control:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

.date-range-wrapper {
  position: relative;
}

.date-range-wrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 2px;
  background: #34d399;
  z-index: 1;
  pointer-events: none;
}

/* Enhanced Product Items */
.product-item {
  position: relative;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.product-item:hover {
  border-left-color: #34d399;
  padding-left: 1rem;
}

/* Enhanced Growth Badges */
.growth-badge {
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.growth-badge.positive {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(22, 163, 74, 0.05));
}

.growth-badge.negative {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(52, 211, 153, 0.2);
  }
  
  .filter-select,
  .date-input {
    background: rgba(31, 41, 55, 0.8);
    color: #e5e7eb;
    border-color: rgba(52, 211, 153, 0.2);
  }
  
  .chart-type-btn {
    background: rgba(31, 41, 55, 0.8);
    color: #e5e7eb;
  }
  
  .statistics-table {
    background: rgba(31, 41, 55, 0.95);
  }
  
  .statistics-table td {
    color: #e5e7eb;
  }
}

/* Print Styles */
@media print {
  .filter-actions,
  .action-buttons {
    display: none !important;
  }
  
  .glass-card {
    background: white !important;
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }
  
  .statistics-management {
    background: white !important;
  }
  
  .stat-card {
    break-inside: avoid;
  }
  
  .chart-container {
    height: 200px !important;
  }
}

/* Accessibility Enhancements */
.btn:focus,
.form-control:focus {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .glass-card {
    border-width: 2px;
    border-color: #34d399;
  }
  
  .stat-icon {
    border: 2px solid currentColor;
  }
  
  .growth-badge.positive {
    background: #16a34a;
    color: white;
  }
  
  .growth-badge.negative {
    background: #dc3545;
    color: white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Additional utility classes */
.text-mint {
  color: #34d399 !important;
}

.bg-mint-light {
  background-color: rgba(52, 211, 153, 0.1) !important;
}

.border-mint {
  border-color: #34d399 !important;
}

.shadow-mint {
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.2) !important;
}

/* Enhanced animations for better UX */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>