// File: hoaDon.js
import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

export const useHoaDonStore = defineStore('hoaDon', {
    state: () => ({
        invoices: [],
        invoiceDetail: null,
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
            loaiDon: null, // Thêm loaiDon vào filters
        },
    }),

    actions: {
        // GET API view HoaDon
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
                    loaiDon: this.filters.loaiDon || undefined,
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
                    trangThaiFormatted: this.mapStatus(item.trangThai), // Sử dụng mapStatus
                }));
                this.totalElements = totalElements;
            } catch (error) {
                this.error = error.message || 'Không thể tải hóa đơn';
                console.error('Lỗi khi gọi API:', error);
            } finally {
                this.isLoading = false;
            }
        },

        updateFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.fetchInvoices();
        },

        // GET API Detail
        async fetchInvoiceDetail(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.get(`/api/hoa-don/${id}/detail`);
                this.invoiceDetail = {
                    ma: response.data.maHoaDon,
                    loaiDon: response.data.loaiDon,
                    trangThai: this.mapStatus(response.data.trangThai), // Sử dụng mapStatus
                    idPhieuGiamGia: { ma: response.data.maGiamGia || 'Không có' },
                    ngayTao: this.formatDate(response.data.ngayTao),
                    idKhachHang: {
                        ten: response.data.tenKhachHang,
                        email: response.data.email || 'N/A',
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
                        quantity: 1,
                        image: '/assets/placeholder-product.png',
                    })),
                    payments: response.data.thanhToanInfos.map(payment => ({
                        id: payment.maHinhThucThanhToan,
                        code: payment.maHinhThucThanhToan,
                        method: payment.kieuThanhToan,
                        amount: payment.tienChuyenKhoan || payment.tienMat,
                        note: 'N/A',
                        confirmedBy: response.data.maNhanVien,
                        status: 'completed',
                        timestamp: this.formatDate(response.data.ngayTao),
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

        // GET API by ID
        async fetchInvoiceById(ma) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiService.get(`/api/hoa-don/QR-by-ma/${ma}`);
                const invoice = {
                    id: response.data.id,
                    ma: response.data.ma,
                    maNhanVien: response.data.maNhanVien,
                    tenKhachHang: response.data.tenKhachHang,
                    soDienThoaiKhachHang: response.data.soDienThoaiKhachHang,
                    tongTienSauGiam: response.data.tongTienSauGiam,
                    phiVanChuyen: response.data.phiVanChuyen,
                    ngayTao: this.formatDate(response.data.ngayTao),
                    loaiDon: response.data.loaiDon,
                    trangThaiFormatted: this.mapStatus(response.data.trangThai), // Sử dụng mapStatus
                };
                this.invoices = [invoice, ...this.invoices.filter((inv) => inv.ma !== ma)];
                this.totalElements = this.invoices.length;
                return { success: true, data: invoice };
            } catch (error) {
                this.error = error.message || 'Không thể tải hóa đơn';
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        // GET API down HoaDon
        async printInvoice(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.get(`/api/hoa-don/${id}/pdf`, {
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `hoa_don_${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                return { success: true, message: `Đã tải hóa đơn ${id} thành công` };
            } catch (error) {
                this.error = error.message || 'Không thể tải file PDF hóa đơn';
                console.error('Lỗi khi gọi API in hóa đơn:', error);
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        // GET API export Excel
        async exportExcel() {
            this.isLoading = true;
            this.error = null;

            try {
                const params = {
                    keyword: this.filters.keyword || undefined,
                    minAmount: this.filters.minAmount ?? undefined,
                    maxAmount: this.filters.maxAmount ?? undefined,
                    startDate: this.filters.startDate ? new Date(this.filters.startDate).toISOString() : undefined,
                    endDate: this.filters.endDate ? new Date(this.filters.endDate).toISOString() : undefined,
                    trangThai: this.filters.trangThai ?? undefined,
                    loaiDon: this.filters.loaiDon || undefined,
                };

                const response = await apiService.get('/api/hoa-don/export-excel', {
                    params,
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                link.setAttribute('download', `DanhSachHoaDon_${timestamp}.xlsx`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                return { success: true, message: `Đã xuất danh sách hóa đơn thành công` };
            } catch (error) {
                this.error = error.message || 'Không thể xuất danh sách hóa đơn ra Excel';
                console.error('Lỗi khi gọi API xuất Excel:', error);
                return { success: false, message: this.error };
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

        mapStatusToNumber(statusString) {
            const statusMap = {
                'Chờ xác nhận': 0,
                'Chờ giao hàng': 1,
                'Đang giao': 2,
                'Hoàn thành': 3,
                'Đã hủy': 4,
            };
            return statusMap[statusString] || null;
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