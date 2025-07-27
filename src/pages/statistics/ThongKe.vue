<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <!-- Header Section -->
    <HeaderCard
        title="Thống Kê & Báo Cáo"
        badgeText="Hệ Thống POS"
        badgeClass="gradient-custom-teal"
        :backgroundOpacity="0.95"
    />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Thống Kê" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Time Range Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian thống kê</label>
              <select v-model="filterType" class="form-control filter-select"
                      @change="fetchData(); fetchRevenueChartData()">
                <option value="day">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm này</option>
                <option value="custom">Tùy chọn</option>
              </select>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div class="col-lg-4 col-md-6" v-if="filterType === 'custom'">
            <div class="filter-group">
              <label class="filter-label">Thời gian tùy chọn</label>
              <div class="date-range-wrapper d-flex align-items-center">
                <input type="date" v-model="startDate" class="form-control date-input"/>
                <span class="date-separator mx-2">đến</span>
                <input type="date" v-model="endDate" class="form-control date-input"/>
                <button
                    @click="fetchData(); fetchRevenueChartData()"
                    class="btn btn-action ms-2"
                >
                  Lọc
                </button>
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
                    @click="selectedChartType = type.value; updateRevenueChart()"
                >
                  <i :class="type.icon" class="me-2"></i>
                  {{ type.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions mt-4">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex gap-4">
                                <div class="stat-item d-flex gap-1">
                  <span class="stat-label">Số đơn hàng:</span>
                  <span class="stat-value text-success">{{ totalOrders }}</span>
                </div>
                <div class="stat-item d-flex gap-1">
                  <span class="stat-label">Tổng doanh thu:</span>
                  <span class="stat-value text-success">{{ formatCurrency(totalRevenue) }}</span>
                </div>
<!--                <div class="stat-item">-->
<!--                  <span class="stat-label">Tăng trưởng:</span>-->
<!--                  <span class="stat-value" :class="growthRate >= 0 ? 'text-success' : 'text-danger'">-->
<!--                    {{ growthRate >= 0 ? '+' : '' }}{{ growthRate }}%-->
<!--                  </span>-->
<!--                </div>-->
              </div>
            </div>
          </div>

          <div class="action-buttons mt-3">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Statistics Cards Row -->
    <div class="row g-4 mb-4">
      <div class="col-lg-3 col-md-6" v-for="(stat, index) in statistics" :key="stat.title">
        <div class="stat-card glass-card p-4 h-100" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="stat-icon" :class="stat.bgColor">
              <i class="bi" :class="stat.icon"></i>
            </div>
            <div class="text-end">
              <div class="stat-value fw-bold mb-1">{{ formatCurrency(stat.revenue) }}</div>
              <div class="stat-change" v-html="formatGrowth(growthData[`growthDoanhThu${stat.title}`] || 0)"></div>
            </div>
          </div>
          <h6 class="stat-title mb-1">{{ stat.title }}</h6>
          <p class="stat-subtitle text-muted small mb-0">
            Sản phẩm đã bán: {{ stat.sold }} | Đơn hàng: {{ stat.orders }}
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4 mb-4 align-items-stretch">
      <!-- Revenue Chart -->
      <div class="col-lg-8">
        <FilterTableSection title="Biểu Đồ Doanh Thu" icon="bi bi-bar-chart-line">
          <div class="chart-container p-4">
            <canvas id="revenueChart" class="revenue-chart"></canvas>
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
                <div class="product-name fw-semibold">{{ product.productName }}</div>
                <div class="product-stats">
                  <small class="text-muted">Đã bán: {{ product.soldQuantity }} | Giá: {{
                      formatCurrency(product.price)
                    }}</small>
                </div>
              </div>
              <div class="product-progress">
                <div class="progress" style="width: 60px; height: 4px;">
                  <div class="progress-bar bg-mint"
                       :style="{ width: (product.soldQuantity / Math.max(...topProducts.map(p => p.soldQuantity)) * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Additional Charts Row -->
    <div class="row g-4 mb-4 align-items-stretch">
      <!-- Order Status Distribution -->
      <div class="col-lg-4 col-md-12">
        <FilterTableSection title="Phân Bố Trạng Thái Đơn Hàng" icon="bi bi-pie-chart">
          <div class="chart-container p-4">
            <div class="d-flex justify-content-center gap-1 mb-4">
              <button
                  @click="chartFilterType = 'day'; fetchOrderStatusStats()"
                  :class="['btn', chartFilterType === 'day' ? 'btn-primary' : 'btn-outline-secondary']"
                  class="px-3 py-1 rounded-start"
              >
                Ngày
              </button>
              <button
                  @click="chartFilterType = 'month'; fetchOrderStatusStats()"
                  :class="['btn', chartFilterType === 'month' ? 'btn-primary' : 'btn-outline-secondary']"
                  class="px-3 py-1"
              >
                Tháng
              </button>
              <button
                  @click="chartFilterType = 'year'; fetchOrderStatusStats()"
                  :class="['btn', chartFilterType === 'year' ? 'btn-primary' : 'btn-outline-secondary']"
                  class="px-3 py-1 rounded-end"
              >
                Năm
              </button>
            </div>
            <div v-if="error" class="text-danger text-center mb-3">
              {{ error }}
            </div>
            <div v-else-if="!orderStatusStats || Object.values(orderStatusStats).every(val => val === 0)"
                 class="text-muted text-center mb-3">
              Không có dữ liệu để hiển thị.
            </div>
            <canvas id="orderStatusChart" class="status-chart"></canvas>
          </div>
        </FilterTableSection>
      </div>

      <!-- Sales Channels -->
      <div class="col-lg-4 col-md-12">
        <FilterTableSection title="Phân Phối Đa Kênh" icon="bi bi-shop">
          <div class="chart-container p-4">
            <div v-if="loaiHoaDon.length === 0" class="text-muted text-center mb-3">
              Không có dữ liệu để hiển thị.
            </div>
            <canvas id="loaiHoaDonChart" class="status-chart"></canvas>
          </div>
        </FilterTableSection>
      </div>

      <!-- Top Brands -->
      <div class="col-lg-4 col-md-12">
        <FilterTableSection title="Hãng Bán Chạy" icon="bi bi-star">
          <div class="chart-container p-4">
            <div v-if="hangBanChay.length === 0" class="text-muted text-center mb-3">
              Không có dữ liệu để hiển thị.
            </div>
            <canvas id="hangBanChayChart" class="status-chart"></canvas>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Detailed Statistics Table -->
    <FilterTableSection title="Bảng Thống Kê Chi Tiết" icon="bi bi-table">
      <DataTable
          :headers="detailedStatsHeaders"
          :data="detailedStats"
          :pageSizeOptions="[5, 10, 15]"
      >
        <template v-slot:revenue="{ item }">
          {{ formatCurrency(item.revenue) }}
        </template>
        <template v-slot:avgOrder="{ item }">
          {{ formatCurrency(item.avgOrder) }}
        </template>
        <template v-slot:growth="{ item }">
          <span class="growth-badge" :class="item.growth >= 0 ? 'positive' : 'negative'">
            <i :class="item.growth >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'" class="me-1"></i>
            {{ item.growth >= 0 ? '+' : '' }}{{ item.growth }}%
          </span>
        </template>
        <template v-slot:status="{ item }">
          <span class="status-badge" :class="getStatusClass(item.status)">
            {{ item.status }}
          </span>
        </template>
      </DataTable>
    </FilterTableSection>

    <!-- Top Products Table -->
    <FilterTableSection title="Top sản phẩm bán chạy nhất của cửa hàng" icon="bi bi-trophy">
      <div v-if="topProducts.length === 0" class="text-center text-gray-500 py-4">
        Không có dữ liệu sản phẩm bán chạy.
      </div>
      <DataTable
          v-else
          :headers="[{value: 'index', text: '#'}, {value: 'imageUrl', text: 'Ảnh'}, {value: 'productName', text: 'Tên Sản Phẩm'}, {value: 'price', text: 'Giá Bán'}, {value: 'soldQuantity', text: 'Số Lượng Đã Bán'}]"
          :data="topProducts"
          :pageSizeOptions="[5, 10, 15]"
      >
        <template v-slot:index="{ index }">
          {{ (currentPage * pageSize) + (index + 1) }}
        </template>
        <template v-slot:imageUrl="{ item }">
            <span v-if="item.imageUrl && item.imageUrl.trim() !== ''">
                <img :src="item.imageUrl" alt="Ảnh"  class="product-image"/>
            </span>
          <span v-else>N/A</span>
        </template>
        <template v-slot:productName="{ item }">
          {{ item.productName || 'N/A' }}
        </template>
        <template v-slot:price="{ item }">
          {{ formatCurrency(item.price) }}
        </template>
        <template v-slot:soldQuantity="{ item }">
          {{ item.soldQuantity || '0' }}
        </template>
      </DataTable>
    </FilterTableSection>

    <!-- Out of Stock Products Table -->
    <FilterTableSection title="Sản Phẩm Sắp Hết Hàng" icon="bi bi-exclamation-triangle">
      <div v-if="sanPhamHetHang.length === 0" class="text-center text-gray-500 py-4">
        Không có dữ liệu sản phẩm sắp hết hàng.
      </div>
      <DataTable
          v-else
          :headers="[{value: 'index', text: '#'}, {value: 'tenSanPham', text: 'Tên Sản Phẩm'}, {value: 'soLuong', text: 'Số Lượng'}]"
          :data="sanPhamHetHang"
          :pageSizeOptions="[5, 8, 10]"
      >
        <template v-slot:index="{ index }">
          {{ (sanPhamHetHangCurrentPage * sanPhamHetHangPageSize) + (index + 1) }}
        </template>
        <template v-slot:tenSanPham="{ item }">
          {{ item.tenSanPham || 'N/A' }}
        </template>
        <template v-slot:soLuong="{ item }">
          {{ item.soLuong || '0' }}
        </template>
      </DataTable>
    </FilterTableSection>
  </div>
</template>

<script>
import {ref, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import {ThongKeJs} from '@/store/modules/statistics/ThongKe.js';

export default {
  name: 'ThongKe',
  components: {
    FilterTableSection,
    HeaderCard,
    DataTable,
  },
  setup() {
    const route = useRoute();
    const {
      statistics,
      formatCurrency,
      formatGrowth,
      topProducts,
      columnsTopProducts,
      growthData,
      orderStatusStats,
      filterType,
      startDate,
      endDate,
      chartFilterType,
      fetchData,
      fetchOrderStatusStats,
      fetchRevenueChartData,
      changePage,
      currentPage,
      totalPages,
      pageSize,
      hangBanChay,
      loaiHoaDon,
      sanPhamHetHang,
      columnsSanPhamHetHang,
      changeSanPhamHetHangPage,
      sanPhamHetHangCurrentPage,
      sanPhamHetHangTotalPages,
      sanPhamHetHangPageSize,
      exportExcel,
      revenueData,
      updateRevenueChart,
      totalRevenue,
      totalOrders,
      growthRate,
      chartTypes,
      selectedChartType,
      resetFilters
    } = ThongKeJs();

    const breadcrumbItems = computed(() => {
      if (typeof route.meta.breadcrumb === 'function') {
        return route.meta.breadcrumb(route);
      }
      return route.meta?.breadcrumb || ['Thống Kê'];
    });

    const detailedStatsHeaders = ref([
      {text: 'Thời gian', value: 'period'},
      {text: 'Doanh thu', value: 'revenue'},
      {text: 'Số đơn hàng', value: 'orders'},
      {text: 'Giá trị TB/đơn', value: 'avgOrder'},
      {text: 'Tăng trưởng', value: 'growth'},
      {text: 'Trạng thái', value: 'status'}
    ]);

    const detailedStats = computed(() => {
      return statistics.value.map(stat => ({
        period: stat.title,
        revenue: stat.revenue,
        orders: stat.orders,
        avgOrder: stat.revenue / (stat.orders || 1),
        growth: growthData.value[`growthDoanhThu${stat.title}`] || 0,
        status: stat.revenue > 0 ? (stat.revenue > 10000000 ? 'Xuất sắc' : 'Tốt') : 'Bình thường'
      }));
    });

    const getRankClass = (index) => {
      if (index === 0) return 'rank-gold';
      if (index === 1) return 'rank-silver';
      if (index === 2) return 'rank-bronze';
      return 'rank-default';
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'Xuất sắc':
          return 'status-excellent';
        case 'Tốt':
          return 'status-good';
        case 'Bình thường':
          return 'status-normal';
        default:
          return 'status-default';
      }
    };

    const printReport = () => {
      window.print();
    };

    const updateChart = () => {
      if (revenueData.value.labels.length > 0) {
        revenueData.value.datasets[0].type = selectedChartType.value;
        updateRevenueChart();
      }
    };

    watch(selectedChartType, () => {
      updateChart();
    });

    watch(filterType, () => {
      fetchRevenueChartData();
    });

    watch([totalRevenue, totalOrders, growthRate], ([newRevenue, newOrders, newGrowth]) => {
      console.log('Reactive update:', {
        totalRevenue: newRevenue,
        totalOrders: newOrders,
        growthRate: newGrowth,
        formattedRevenue: formatCurrency(newRevenue)
      });
    });

    return {
      breadcrumbItems,
      statistics,
      formatCurrency,
      formatGrowth,
      topProducts,
      columnsTopProducts,
      growthData,
      orderStatusStats,
      filterType,
      startDate,
      endDate,
      chartFilterType,
      fetchData,
      fetchOrderStatusStats,
      fetchRevenueChartData,
      changePage,
      currentPage,
      totalPages,
      pageSize,
      hangBanChay,
      loaiHoaDon,
      sanPhamHetHang,
      columnsSanPhamHetHang,
      changeSanPhamHetHangPage,
      sanPhamHetHangCurrentPage,
      sanPhamHetHangTotalPages,
      sanPhamHetHangPageSize,
      exportExcel,
      chartTypes,
      selectedChartType,
      totalRevenue,
      totalOrders,
      growthRate,
      detailedStats,
      detailedStatsHeaders,
      getRankClass,
      getStatusClass,
      resetFilters,
      printReport,
      updateChart
    };
  }
};
</script>

<style scoped>
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

.gradient-custom-teal {
  background: #34d399;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

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

.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #1f3a44;
  font-weight: 500;
}

.stat-value.text-success {
  color: rgb(21, 128, 61) !important;
  font-weight: bold;
}

.stat-value.text-danger {
  color: #dc3545 !important;
  font-weight: bold;
}

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

.bg-blue-500 {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.bg-purple-500 {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.bg-green-500 {
  background: linear-gradient(135deg, #34d399, #16a34a);
}

.bg-teal-600 {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}

.chart-container {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.revenue-chart,
.status-chart {
  max-width: 100%;
  max-height: 280px;
  width: 100%;
  height: auto;
}

.top-products-container {
  height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

.product-image {
  width: 50px; /* Kích thước chiều rộng ảnh */
  height: 50px; /* Kích thước chiều cao ảnh */
  object-fit: cover; /* Đảm bảo ảnh không bị méo */
  border-radius: 4px; /* Bo góc ảnh (tùy chọn) */
}

.row.align-items-stretch {
  display: flex;
  flex-wrap: wrap;
}

.row.align-items-stretch > .col-lg-8,
.row.align-items-stretch > .col-lg-4,
.row.align-items-stretch > .col-lg-6 {
  display: flex;
  flex-direction: column;
}

.row.align-items-stretch > .col-lg-8 > *,
.row.align-items-stretch > .col-lg-4 > *,
.row.align-items-stretch > .col-lg-6 > * {
  flex-grow: 1;
}

@media (max-width: 992px) {
  .row.align-items-stretch > .col-lg-4 {
    margin-bottom: 1.5rem;
  }
  .chart-container {
    height: 350px;
  }
}

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

  .chart-container,
  .top-products-container {
    height: 300px;
  }

  .status-chart {
    max-height: 250px;
  }
}

@media (max-width: 576px) {
  .chart-container,
  .top-products-container {
    height: 250px;
  }

  .status-chart {
    max-height: 200px;
  }
}

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

.progress {
  background-color: rgba(52, 211, 153, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar.bg-mint {
  background: linear-gradient(90deg, #34d399, #16a34a) !important;
  transition: width 0.6s ease;
}

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

  .stat-card {
    break-inside: avoid;
  }

  .chart-container {
    height: 200px !important;
  }
}
</style>
