import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default function useDashboard() {
    const username = ref('Admin')
    const role = ref('Quản trị viên')
    const currentTime = ref(new Date())
    const router = useRouter()

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
            value: '0',
            change: '0%',
            subtitle: 'Hôm nay',
            icon: 'bi bi-bag-check',
            iconClass: 'bg-mint',
            changeClass: 'text-success',
            trendIcon: 'bi bi-trending-up'
        },
        {
            title: 'Doanh thu',
            value: '0',
            change: '0%',
            subtitle: 'Tháng này',
            icon: 'bi bi-currency-dollar',
            iconClass: 'bg-mint',
            changeClass: 'text-success',
            trendIcon: 'bi bi-trending-up'
        },
        {
            title: 'Khách hàng',
            value: '0',
            change: '0%',
            subtitle: 'Tổng số',
            icon: 'bi bi-people',
            iconClass: 'bg-mint',
            changeClass: 'text-success',
            trendIcon: 'bi bi-trending-up'
        },
        {
            title: 'Sản phẩm',
            value: '0',
            change: '0%',
            subtitle: 'Trong kho',
            icon: 'bi bi-box-seam',
            iconClass: 'bg-mint',
            changeClass: 'text-muted',
            trendIcon: 'bi bi-trending-down'
        }
    ])

    const recentActivities = ref([])

    const quickActions = ref([
        {
            name: 'Tạo đơn hàng',
            icon: 'bi bi-plus-circle',
            bgClass: 'bg-mint',
            link: '/banHang'
        },
        {
            name: 'Quản lý sản phẩm',
            icon: 'bi bi-boxes',
            bgClass: 'bg-mint',
            link: '/sanPham'
        },
        {
            name: 'Thống kê',
            icon: 'bi bi-bar-chart',
            bgClass: 'bg-mint',
            link: '/thongKe'
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value)
    }

    const fetchDashboardData = async () => {
        try {
            // Fetch order stats
            const orderResponse = await axios.get('/api/trangchu/orders')
            const orderData = orderResponse.data
            stats.value[0].value = orderData.currentValue || '0'
            stats.value[0].change = orderData.growthRate ? orderData.growthRate.toFixed(1) + '%' : '0%'
            stats.value[0].changeClass = orderData.growthRate >= 0 ? 'text-success' : 'text-danger'
            stats.value[0].trendIcon = orderData.growthRate >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'

            // Fetch revenue stats
            const revenueResponse = await axios.get('/api/trangchu/revenue')
            const revenueData = revenueResponse.data
            stats.value[1].value = formatCurrency(revenueData.currentValue || 0)
            stats.value[1].change = revenueData.growthRate ? revenueData.growthRate.toFixed(1) + '%' : '0%'
            stats.value[1].changeClass = revenueData.growthRate >= 0 ? 'text-success' : 'text-danger'
            stats.value[1].trendIcon = revenueData.growthRate >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'

            // Fetch customer stats
            const customerResponse = await axios.get('/api/trangchu/customers')
            const customerData = customerResponse.data
            stats.value[2].value = customerData.currentValue || '0'
            stats.value[2].change = customerData.growthRate ? customerData.growthRate.toFixed(1) + '%' : '0%'
            stats.value[2].changeClass = customerData.growthRate >= 0 ? 'text-success' : 'text-danger'
            stats.value[2].trendIcon = customerData.growthRate >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'

            // Fetch product stats
            const productResponse = await axios.get('/api/trangchu/products')
            const productData = productResponse.data
            stats.value[3].value = productData.currentValue || '0'
            stats.value[3].change = productData.growthRate ? productData.growthRate.toFixed(1) + '%' : '0%'
            stats.value[3].changeClass = productData.growthRate >= 0 ? 'text-success' : 'text-danger'
            stats.value[3].trendIcon = productData.growthRate >= 0 ? 'bi bi-trending-up' : 'bi bi-trending-down'

            // Fetch recent activities
            const activitiesResponse = await axios.get('/api/trangchu/activities')
            recentActivities.value = activitiesResponse.data.map((activity, index) => {
                const date = new Date(activity.thoiGian)
                return {
                    id: activity.id || index + 1,
                    title: `Đơn hàng #${activity.maHoaDon || 'N/A'}`,
                    description: activity.moTa || 'Không có mô tả',
                    time: `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                    completed: activity.trangThai === 3,
                    statusClass: activity.trangThai === 3 ? 'status-success' : 'status-pending',
                    statusIcon: activity.trangThai === 3 ? 'bi bi-check-circle' : 'bi bi-hourglass-split'
                }
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Đặt giá trị mặc định để tránh giao diện bị lỗi
            stats.value[0].value = '0'
            stats.value[0].change = '0%'
            stats.value[0].changeClass = 'text-muted'
            stats.value[0].trendIcon = 'bi bi-trending-flat'
            stats.value[1].value = formatCurrency(0)
            stats.value[1].change = '0%'
            stats.value[1].changeClass = 'text-muted'
            stats.value[1].trendIcon = 'bi bi-trending-flat'
            stats.value[2].value = '0'
            stats.value[2].change = '0%'
            stats.value[2].changeClass = 'text-muted'
            stats.value[2].trendIcon = 'bi bi-trending-flat'
            stats.value[3].value = '0'
            stats.value[3].change = '0%'
            stats.value[3].changeClass = 'text-muted'
            stats.value[3].trendIcon = 'bi bi-trending-flat'
        }
    }

    const handleStatClick = (stat) => {
        console.log('Clicked stat:', stat.title)
    }

    const handleQuickAction = (action) => {
        console.log('Quick action:', action.name)
    }

    let timeInterval

    onMounted(() => {
        fetchDashboardData()
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
        handleQuickAction,
    }
}