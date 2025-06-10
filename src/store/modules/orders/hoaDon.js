import { defineStore } from 'pinia';
import { apiService } from '@/services/api'; // Đường dẫn tới api.js

export const useHoaDonStore = defineStore('hoaDon', {
    state: () => ({
        invoices: [],
        isLoading: false,
        error: null,
        page: 0,
        size: 5,
        totalElements: 0,
        filters: {
            keyword: '',
            minAmount: null,
            maxAmount: null,
            startDate: null,
            endDate: null,
            trangThai: null,
        },
    }),

    actions: {
        async fetchInvoices({ page = this.page, size = this.size } = {}) {
            this.isLoading = true;
            this.page = page;
            this.size = size;

            try {
                const params = {
                    page,
                    size,
                    keyword: this.filters.keyword || undefined,
                    minAmount: this.filters.minAmount ?? undefined,
                    maxAmount: this.filters.maxAmount ?? undefined,
                    startDate: this.filters.startDate ? new Date(this.filters.startDate).toISOString() : undefined,
                    endDate: this.filters.endDate ? new Date(this.filters.endDate).toISOString() : undefined,
                    trangThai: this.filters.trangThai ?? undefined,
                };

                const response = await apiService.get('/api/hoa-don/home', { params });
                console.log('API Response:', response.data); // Kiểm tra dữ liệu
                const { content, totalElements } = response.data;

                this.invoices = content.map(item => ({
                    id: item.id,
                    ma: item.ma,
                    maNhanVien: item.maNhanVien, // Ánh xạ nhân viên
                    tenKhachHang: item.tenKhachHang,
                    soDienThoaiKhachHang: item.soDienThoaiKhachHang,
                    tongTienSauGiam: item.tongTienSauGiam,
                    phiVanChuyen: item.phiVanChuyen,
                    ngayTao: this.formatDate(item.ngayTao), // Format ngayTao
                    loaiDon: item.loaiDon,
                    trangThaiFormatted: this.mapStatus(item.trangThai),
                }));
                this.totalElements = totalElements;
            } catch (error) {
                this.error = error.message || 'Không thể tải hóa đơn';
                console.error('Lỗi khi gọi API:', error);
            } finally {
                this.isLoading = false;
            }
        },

        // Function to format date as "HH:mm:ss DD-MM-YYYY"
        formatDate(dateString) {
            const date = new Date(dateString);
            const time = date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = date.getFullYear();
            return `${time} ${day}-${month}-${year}`;
        },

        updateFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.fetchInvoices({ page: 0 }); // Reset về trang đầu
        },

        mapStatus(statusNumber) {
            const statusMap = {
                0: 'Chờ xác nhận',
                1: 'Chờ giao hàng',
                2: 'Đang giao',
                3: 'Hoàn thành',
                4: 'Đã hủy',
            };
            return statusMap[statusNumber] || 'N/A';
        },
    },

    getters: {
        getInvoices: (state) => state.invoices,
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error,
        getTotalElements: (state) => state.totalElements,
        getPage: (state) => state.page,
        getSize: (state) => state.size,
    },
});