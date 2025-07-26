// File: hoaDon.js
import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

export const useHoaDonStore = defineStore('hoaDon', {
    state: () => ({
        invoices: [],
        invoiceDetail: null,
        imelList: [], // Thêm state mới để lưu danh sách IMEI
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
                    giamGia: item.soTienGiamToiDa,
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
                    id: response.data.id,
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
                        ram: product.dungLuongRam,
                        capacity: product.dungLuongBoNhoTrong,
                        color: product.mauSac,
                        price: product.giaBan,
                        quantity: 1,
                        image: product.duongDan,
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

        async fetchImelList({ page = 0, size = 5 } = {}) {
            this.isLoading = true;
            try {
                const params = { page, size };
                const response = await apiService.get('/api/hoa-don/hoa-don-chi-tiet/imel', { params });
                const { content, totalElements } = response.data;

                this.imelList = content.map(item => ({
                    id: item.id,
                    imei: item.imel, // Ánh xạ đúng từ imel
                    maImel: item.ma, // Thêm maSanPhamChiTiet nếu cần
                    status: item.deleted === false ? 'Còn hàng' : 'Đã bán', // Suy ra trạng thái từ deleted
                }));
                this.totalElements = totalElements;
            } catch (error) {
                this.error = error.message || 'Không thể tải danh sách IMEI';
                console.error('Lỗi khi gọi API danh sách IMEI:', error);
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

                // Tìm hóa đơn để lấy thông tin loaiDon
                const invoice = this.invoices.find(inv => inv.id === id) || this.invoiceDetail;
                const loaiDonText = invoice?.loaiDon === 'trực tiếp' ? 'tại quầy' : 'online';

                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `hoa_don_client_${id}_${loaiDonText}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                return { success: true, message: `Đã tải hóa đơn ${loaiDonText} ${id} thành công` };
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

        // Trong actions của useHoaDonStore
        async updateInvoiceStatus(id, trangThai, idNhanVien = null) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.put(`/api/hoa-don/${id}/update-status`, null, {
                    params: { trangThai, idNhanVien }
                });
                // Cập nhật invoiceDetail nếu hóa đơn đang được xem
                if (this.invoiceDetail && this.invoiceDetail.id === id) {
                    this.invoiceDetail.trangThai = this.mapStatus(response.data.trangThai);
                    this.invoiceDetail.history.push({
                        id: Date.now(),
                        code: `LSHD_${Date.now()}`,
                        invoice: response.data.ma,
                        employee: response.data.maNhanVien || 'Hệ thống',
                        action: `Cập nhật trạng thái: ${this.mapStatus(response.data.trangThai)}`,
                        timestamp: this.formatDate(new Date()),
                        status: 'completed',
                    });
                }
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.message || 'Không thể cập nhật trạng thái hóa đơn';
                console.error('Lỗi khi cập nhật trạng thái:', error);
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
        getImelList: (state) => state.imelList, // Thêm getter để truy cập danh sách IMEI
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error,
        getTotalElements: (state) => state.totalElements,
        getPage: (state) => state.page,
        getSize: (state) => state.size,
    },
});