import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '@fortawesome/fontawesome-free/css/all.min.css';

Chart.register(ChartDataLabels);

export function ThongKeJs() {
    const statistics = ref([]);
    const topProducts = ref([]);
    const growthData = ref({});
    const orderStatusStats = ref({});
    const filterType = ref('month');
    const startDate = ref('');
    const endDate = ref('');
    const chartFilterType = ref('month');
    const currentPage = ref(0);
    const totalPages = ref(0);
    const pageSize = ref(10);
    const hangBanChay = ref([]);
    const loaiHoaDon = ref([]);
    const sanPhamHetHang = ref([]);
    const sanPhamHetHangCurrentPage = ref(0);
    const sanPhamHetHangTotalPages = ref(0);
    const sanPhamHetHangPageSize = ref(8);
    const totalRevenue = ref(0);
    const totalOrders = ref(0);
    const growthRate = ref(0);
    const selectedChartType = ref('line');
    const chartTypes = [
        { value: 'line', label: 'Đường', icon: 'bi bi-graph-up' },
        { value: 'bar', label: 'Cột', icon: 'bi bi-bar-chart' }
    ];

    const revenueData = ref({
        labels: [],
        datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: [],
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
    });

    let orderStatusChart = null;
    let hangBanChayChart = null;
    let loaiHoaDonChart = null;
    let revenueChart = null;
    const loading = ref(true);
    const error = ref(null);

    const formatCurrency = (value) => {
        if (!value) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatGrowth = (value) => {
        if (value > 0) return `<i class="fas fa-arrow-up text-green-500"></i> ${value.toFixed(1)}%`;
if (value < 0) return `<i class="fas fa-arrow-down text-red-500"></i> ${Math.abs(value).toFixed(1)}%`;
return `<i class="fas fa-arrow-down text-red-500"></i> 0%`;
};

const changePage = (page) => {
    currentPage.value = page;
    fetchData();
};

const changeSanPhamHetHangPage = (page) => {
    sanPhamHetHangCurrentPage.value = page;
    fetchSanPhamHetHangOnly();
};

const columnsTopProducts = ref([
    { key: 'index', label: '#', formatter: (value, item, index) => (currentPage.value * pageSize.value) + (index + 1) },
    { key: 'imageUrl', label: 'Ảnh', formatter: (value) => value ? `<img src="${value}" alt="Ảnh" class="w-10 h-10 object-cover rounded">` : 'N/A' },
    { key: 'productName', label: 'Tên Sản Phẩm', formatter: (value) => value || 'N/A' },
    { key: 'price', label: 'Giá Bán', formatter: (value) => formatCurrency(value) },
    { key: 'soldQuantity', label: 'Số Lượng Đã Bán', formatter: (value) => value || '0' }
]);

const columnsSanPhamHetHang = ref([
    { key: 'index', label: '#', formatter: (value, item, index) => (sanPhamHetHangCurrentPage.value * sanPhamHetHangPageSize.value) + (index + 1) },
    { key: 'tenSanPham', label: 'Tên Sản Phẩm', formatter: (value) => value || 'N/A' },
    { key: 'soLuong', label: 'Số Lượng', formatter: (value) => value || '0' }
]);

const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
        const params = {
            filterType: filterType.value,
            ...(filterType.value === 'custom' && { startDate: startDate.value, endDate: endDate.value }),
            page: currentPage.value,
            size: pageSize.value,
            sanPhamHetHangPage: sanPhamHetHangCurrentPage.value,
            sanPhamHetHangSize: sanPhamHetHangPageSize.value
        };
        const response = await axios.get('http://localhost:8080/api/thongKe', { params });

        statistics.value = [
            {
                title: 'Hôm nay',
                revenue: response.data.ngay[0]?.doanhThu || 0,
                sold: response.data.ngay[0]?.sanPhamDaBan || 0,
                orders: response.data.ngay[0]?.tongSoDonHang || 0,
                bgColor: 'bg-blue-500',
                icon: 'bi-calendar-day'
            },
            {
                title: 'Tuần này',
                revenue: response.data.tuan[0]?.doanhThu || 0,
                sold: response.data.tuan[0]?.sanPhamDaBan || 0,
                orders: response.data.tuan[0]?.tongSoDonHang || 0,
                bgColor: 'bg-purple-500',
                icon: 'bi-calendar-week'
            },
            {
                title: 'Tháng này',
                revenue: response.data.thang[0]?.doanhThu || 0,
                sold: response.data.thang[0]?.sanPhamDaBan || 0,
                orders: response.data.thang[0]?.tongSoDonHang || 0,
                bgColor: 'bg-green-500',
                icon: 'bi-calendar-month'
            },
            {
                title: 'Năm này',
                revenue: response.data.nam[0]?.doanhThu || 0,
                sold: response.data.nam[0]?.sanPhamDaBan || 0,
                orders: response.data.nam[0]?.tongSoDonHang || 0,
                bgColor: 'bg-teal-600',
                icon: 'bi-calendar'
            }
        ];

        switch (filterType.value) {
            case 'day':
                totalRevenue.value = response.data.ngay[0]?.doanhThu || 0;
                totalOrders.value = response.data.ngay[0]?.tongSoDonHang || 0;
                growthRate.value = response.data.growthData?.growthDoanhThuNgay || 0;
                break;
            case 'week':
                totalRevenue.value = response.data.tuan[0]?.doanhThu || 0;
                totalOrders.value = response.data.tuan[0]?.tongSoDonHang || 0;
                growthRate.value = response.data.growthData?.growthDoanhThuThang || 0;
                break;
            case 'month':
                totalRevenue.value = response.data.thang[0]?.doanhThu || 0;
                totalOrders.value = response.data.thang[0]?.tongSoDonHang || 0;
                growthRate.value = response.data.growthData?.growthDoanhThuThang || 0;
                break;
            case 'year':
                totalRevenue.value = response.data.nam[0]?.doanhThu || 0;
                totalOrders.value = response.data.nam[0]?.tongSoDonHang || 0;
                growthRate.value = response.data.growthData?.growthDoanhThuNam || 0;
                break;
            case 'custom':
                totalRevenue.value = response.data.custom[0]?.doanhThu || 0;
                totalOrders.value = response.data.custom[0]?.tongSoDonHang || 0;
                growthRate.value = 0;
                break;
        }

        topProducts.value = response.data.topProducts || [];
        totalPages.value = response.data.totalPages || 0;
        growthData.value = response.data.growthData || {};
        hangBanChay.value = response.data.hangBanChay || [];
        loaiHoaDon.value = response.data.loaiHoaDon || [];
        sanPhamHetHang.value = response.data.sanPhamHetHang || [];
        sanPhamHetHangTotalPages.value = response.data.sanPhamHetHangTotalPages || 0;
        console.log('API response:', response.data);
        console.log('totalRevenue:', totalRevenue.value);
        console.log('totalOrders:', totalOrders.value);
        console.log('growthRate:', growthRate.value);
        updateHangBanChayChart();
        updateLoaiHoaDonChart();
    } catch (err) {
        error.value = 'Lỗi khi tải dữ liệu thống kê. Vui lòng thử lại sau.';
        console.error('Error fetching data:', err);
    } finally {
        loading.value = false;
    }
};

const fetchSanPhamHetHangOnly = async () => {
    try {
        const params = {
            sanPhamHetHangPage: sanPhamHetHangCurrentPage.value,
            sanPhamHetHangSize: sanPhamHetHangPageSize.value
        };
        const response = await axios.get('http://localhost:8080/api/thongKe', { params });
        console.log('sanPhamHetHang:', response.data.sanPhamHetHang);
        sanPhamHetHang.value = response.data.sanPhamHetHang || [];
        sanPhamHetHangTotalPages.value = response.data.sanPhamHetHangTotalPages || 0;
    } catch (error) {
        console.error('Error fetching sanPhamHetHang data:', error);
    }
};

const fetchRevenueChartData = async () => {
    try {
        const params = {
            filterType: filterType.value,
            ...(filterType.value === 'custom' && { startDate: startDate.value, endDate: endDate.value })
        };
        const response = await axios.get('http://localhost:8080/api/thongKe/revenue-chart', { params });
        revenueData.value.labels = response.data.labels;
        revenueData.value.datasets[0].data = response.data.data;
        updateRevenueChart();
    } catch (error) {
        console.error('Error fetching revenue chart data:', error);
    }
};

const fetchOrderStatusStats = async () => {
    try {
        const params = {
            filterType: chartFilterType.value,
            date: new Date().toISOString().split('T')[0]
        };
        const response = await axios.get('http://localhost:8080/api/thongKe/order-status-stats', { params });
        console.log('Order status stats response:', response.data);
        orderStatusStats.value = response.data;
        error.value = null;
        updateOrderStatusChart();
    } catch (err) {
        error.value = 'Lỗi khi tải dữ liệu trạng thái đơn hàng. Vui lòng thử lại sau.';
        console.error('Error fetching order status stats:', err);
    }
};

const exportExcel = async () => {
    try {
        const params = {
            filterType: filterType.value,
            ...(filterType.value === 'custom' && { startDate: startDate.value, endDate: endDate.value })
        };
        const response = await axios.get('http://localhost:8080/api/thongKe/export-excel', {
            params,
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `thong_ke_${filterType.value}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting Excel:', error);
    }
};

const updateRevenueChart = () => {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: selectedChartType.value,
        data: revenueData.value,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#34d399',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                        }
                    }
                },
                datalabels: {
                    color: '#1f3a44', // Đổi màu thành xanh đậm
                    formatter: (value) => formatCurrency(value),
                    font: { weight: 'bold' },
                    borderRadius: 4,
                    padding: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        },
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(52, 211, 153, 0.1)',
                        borderColor: 'rgba(52, 211, 153, 0.2)'
                    }
                },
                x: {
                    ticks: { color: '#6b7280' },
                    grid: { display: false }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
};

const updateHangBanChayChart = () => {
    const ctx = document.getElementById('hangBanChayChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas hangBanChayChart not found');
        return;
    }
    if (hangBanChayChart) hangBanChayChart.destroy();

    const data = hangBanChay.value.map(item => item.doanhThu);
    if (data.every(val => val === 0)) {
        console.warn('No data to display for hangBanChayChart');
        return;
    }

    hangBanChayChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hangBanChay.value.map(item => item.nhaSanXuat),
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                datalabels: {
                    color: '#1f3a44', // Đổi màu thành xanh đậm
                    formatter: (value) => value > 0 ? formatCurrency(value) : '',
                    font: { weight: 'bold', size: 10 },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 4,
                    padding: 4
                }
            }
        }
    });
};

const updateLoaiHoaDonChart = () => {
    const ctx = document.getElementById('loaiHoaDonChart')?.getContext('2d');
    if (!ctx || loaiHoaDonChart) return;

    loaiHoaDonChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: loaiHoaDon.value.map(item => item.loaiDon),
            datasets: [{
                data: loaiHoaDon.value.map(item => item.soLuong),
                backgroundColor: ['#FF6384', '#36A2EB'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 20, padding: 15 } },
                datalabels: {
                    color: '#fff',
                    formatter: (value) => value > 0 ? value : '',
                    font: { weight: 'bold' }
                }
            }
        }
    });
};

const updateOrderStatusChart = () => {
    const ctx = document.getElementById('orderStatusChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas orderStatusChart not found');
        return;
    }
    if (orderStatusChart) orderStatusChart.destroy();
    const data = [
        orderStatusStats.value['Chờ xác nhận'] || 0,
        orderStatusStats.value['Chờ giao hàng'] || 0,
        orderStatusStats.value['Đang giao'] || 0,
        orderStatusStats.value['Hoàn thành'] || 0,
        orderStatusStats.value['Đã hủy'] || 0
    ];
    console.log('Order status chart data:', data);
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xác nhận', 'Chờ giao hàng', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 20, padding: 15 } },
                datalabels: {
                    color: '#fff',
                    formatter: (value) => value > 0 ? value : '',
                    font: { weight: 'bold' }
                }
            }
        }
    });
};

const resetFilters = () => {
    filterType.value = 'month';
    startDate.value = '';
    endDate.value = '';
    fetchData();
    fetchRevenueChartData();
};

onMounted(() => {
    fetchData();
    fetchOrderStatusStats();
    fetchRevenueChartData();
});

return {
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
    selectedChartType,
    chartTypes,
    resetFilters
};
}
