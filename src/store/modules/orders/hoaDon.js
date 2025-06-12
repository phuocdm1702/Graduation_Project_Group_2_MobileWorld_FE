// File: hoaDon.js
import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

export const useHoaDonStore = defineStore('hoaDon', {
    state: () => ({
        invoices: [],
        invoiceDetail: null, // Thêm state để lưu chi tiết hóa đơn
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
                const { content, totalElements } = response.data;

                this.invoices = content.map(item => ({
                    id: item.id,
                    ma: item.ma,
                    maNhanVien: item.maNhanVien,
                    tenKhachHang: item.tenKhachHang,
                    soDienThoaiKhachHang: item.soDienThoaiKhachHang,
                    tongTienSauGiam: item.tongTienSauGiam,
                    phiVanChuyen: item.phiVanChuyen,
                    ngayTao: this.formatDate(item.ngayTao),
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

        // Thêm action để lấy chi tiết hóa đơn
        async fetchInvoiceDetail(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.get(`/api/hoa-don/${id}/detail`);
                this.invoiceDetail = {
                    ma: response.data.maHoaDon,
                    loaiDon: response.data.loaiDon,
                    trangThai: this.mapStatus(response.data.trangThai),
                    idPhieuGiamGia: { ma: response.data.maGiamGia || 'Không có' },
                    ngayTao: this.formatDate(response.data.ngayTao),
                    idKhachHang: {
                        ten: response.data.tenKhachHang,
                        email: response.data.email || 'N/A', // Nếu backend không trả về email, có thể thêm vào sau
                    },
                    soDienThoaiKhachHang: response.data.soDienThoaiKhachHang,
                    diaChiKhachHang: response.data.diaChiKhachHang,
                    tongTienSauGiam: response.data.tongTienSauGiam,
                    phiVanChuyen: response.data.phiVanChuyen,
                    maNhanVien: response.data.maNhanVien,
                    tenNhanVien: response.data.tenNhanVien,
                    products: response.data.sanPhamChiTietInfos.map(product => ({
                        id: product.maSanPham,
                        name: product.tenSanPham,
                        imei: product.imel,
                        price: product.giaBan,
                        quantity: 1, // Backend không trả về quantity, giả sử mặc định là 1
                        image: '/assets/placeholder-product.png', // Thêm placeholder
                    })),
                    payments: response.data.thanhToanInfos.map(payment => ({
                        id: payment.maHinhThucThanhToan,
                        code: payment.maHinhThucThanhToan,
                        method: payment.kieuThanhToan,
                        amount: payment.tienChuyenKhoan || payment.tienMat,
                        note: 'N/A',
                        confirmedBy: response.data.maNhanVien,
                        status: 'completed',
                        timestamp: this.formatDate(response.data.ngayTao), // Giả sử dùng ngayTao
                    })),
                    history: response.data.lichSuHoaDonInfos.map(history => ({
                        id: history.ma,
                        code: history.ma,
                        invoice: response.data.maHoaDon,
                        employee: response.data.maNhanVien,
                        action: history.hanhDong,
                        timestamp: this.formatDate(history.thoiGian),
                        status: 'completed',
                    })),
                };
            } catch (error) {
                this.error = error.message || 'Không thể tải chi tiết hóa đơn';
                console.error('Lỗi khi gọi API chi tiết:', error);
            } finally {
                this.isLoading = false;
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            const time = date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${time} ${day}-${month}-${year}`;
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
        getInvoiceDetail: (state) => state.invoiceDetail,
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error,
        getTotalElements: (state) => state.totalElements,
        getPage: (state) => state.page,
        getSize: (state) => state.size,
    },
});