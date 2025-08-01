import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

export const useHoaDonStore = defineStore('hoaDon', {
    state: () => ({
        invoices: [],
        invoiceDetail: null,
        imelList: [],
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
            loaiDon: null,
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

        updateFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.fetchInvoices();
        },

        async fetchInvoiceDetail(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.get(`/api/hoa-don/${id}/detail`);
                this.invoiceDetail = {
                    id: response.data.id,
                    ma: response.data.maHoaDon,
                    loaiDon: response.data.loaiDon,
                    trangThai: this.mapStatus(response.data.trangThai),
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
                    products: response.data.sanPhamChiTietInfos.map(product => {
                        if (!product.idSanPham) {
                            console.warn('Missing idSanPham for product:', product);
                        }
                        return {
                            chiTietSanPhamId: product.chiTietSanPhamId,
                            idSanPham: product.idSanPham,
                            id: product.chiTietSanPhamId,
                            maSanPham: product.maSanPham,
                            maHinhSanPhamChiTiet: product.maHinhSanPhamChiTiet,
                            name: product.tenSanPham,
                            imei: product.imel,
                            ram: product.dungLuongRam,
                            capacity: product.dungLuongBoNhoTrong,
                            color: product.mauSac,
                            price: product.giaBan,
                            quantity: 1,
                            image: product.duongDan,
                        };
                    }),
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
                    trangThaiFormatted: this.mapStatus(response.data.trangThai),
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

        async fetchImelList({ page = 0, size = 100, idSanPham, chiTietSanPhamId } = {}) {
            this.isLoading = true;
            try {
                if (!idSanPham || !chiTietSanPhamId) {
                    throw new Error('idSanPham and chiTietSanPhamId are required');
                }
                const params = { page, size, idSanPham, chiTietSanPhamId };
                console.log('Fetching IMEI list with params:', params);
                const response = await apiService.get('/api/hoa-don/hoa-don-chi-tiet/imel', { params });
                const { content, totalElements } = response.data;

                this.imelList = content.map(item => ({
                    id: item.id,
                    imei: item.imel,
                    maImel: item.ma,
                    status: item.deleted === false ? 'Còn hàng' : 'Đã bán',
                    ram: item.dungLuongRam,
                    capacity: item.dungLuongBoNhoTrong,
                    price: item.giaBan,
                    color: item.mauSac
                }));
                this.totalElements = totalElements;
            } catch (error) {
                this.error = error.message || 'Không thể tải danh sách IMEI';
                console.error('Lỗi khi gọi API danh sách IMEI:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                }
            } finally {
                this.isLoading = false;
            }
        },

        async printInvoice(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.get(`/api/hoa-don/${id}/pdf`, {
                    responseType: 'blob',
                });

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

        async updateInvoiceStatus(id, trangThai, idNhanVien = null) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.put(`/api/hoa-don/${id}/update-status`, null, {
                    params: { trangThai, idNhanVien }
                });
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

        async confirmAndAssignIMEI(idHD, imelMap) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.post(`/api/client/hoa-don/xac-nhan-imei/${idHD}`, imelMap);
                const updatedInvoice = response.data;

                if (this.invoiceDetail && this.invoiceDetail.id === idHD) {
                    this.invoiceDetail = {
                        ...this.invoiceDetail,
                        trangThai: this.mapStatus(updatedInvoice.trangThai),
                        products: updatedInvoice.sanPhamChiTietInfos.map(product => ({
                            chiTietSanPhamId: product.chiTietSanPhamId,
                            idSanPham: product.idSanPham,
                            id: product.chiTietSanPhamId,
                            maSanPham: product.maSanPham,
                            maHinhSanPhamChiTiet: product.maHinhSanPhamChiTiet,
                            name: product.tenSanPham,
                            imei: product.imel,
                            ram: product.dungLuongRam,
                            capacity: product.dungLuongBoNhoTrong,
                            color: product.mauSac,
                            price: product.giaBan,
                            quantity: 1,
                            image: product.duongDan,
                        })),
                        history: updatedInvoice.lichSuHoaDonInfos.map(history => ({
                            id: history.ma,
                            code: history.ma,
                            invoice: updatedInvoice.maHoaDon,
                            employee: updatedInvoice.maNhanVien,
                            action: history.hanhDong,
                            timestamp: this.formatDate(history.thoiGian),
                            status: 'completed',
                        })),
                    };
                }

                const invoiceIndex = this.invoices.findIndex(inv => inv.id === idHD);
                if (invoiceIndex !== -1) {
                    this.invoices[invoiceIndex] = {
                        ...this.invoices[invoiceIndex],
                        trangThaiFormatted: this.mapStatus(updatedInvoice.trangThai),
                    };
                }

                return { success: true, data: updatedInvoice };
            } catch (error) {
                this.error = error.message || 'Không thể xác nhận và gán IMEI';
                console.error('Lỗi khi gọi API xác nhận IMEI:', error);
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async selectIMEI({ imei, selectedProduct, invoiceId, products }) {
            this.isLoading = true;
            this.error = null;

            try {
                if (!imei || typeof imei !== 'string' || imei.trim() === '') {
                    throw new Error('IMEI không hợp lệ');
                }
                if (!selectedProduct || !selectedProduct.chiTietSanPhamId || !selectedProduct.idSanPham) {
                    throw new Error('Thông tin sản phẩm không đầy đủ');
                }

                const imeiData = this.imelList.find(i => i.imei === imei);
                if (!imeiData || imeiData.status !== 'Còn hàng') {
                    throw new Error(`IMEI ${imei} không khả dụng`);
                }

                // Step 1: Fetch idImel
                const idImelResponse = await apiService.get(`/api/chi-tiet-san-pham/find-id-imel-by-imei?imei=${imei}`);
                const idImel = idImelResponse.data?.idImel;
                if (!idImel) {
                    throw new Error('Không tìm thấy idImel cho IMEI này');
                }

                // Step 2: Create new product using selectedProduct and imeiData
                const newProduct = {
                    chiTietSanPhamId: selectedProduct.chiTietSanPhamId,
                    idSanPham: selectedProduct.idSanPham,
                    id: selectedProduct.id,
                    maSanPham: imeiData.maImel || selectedProduct.maSanPham || 'N/A',
                    maHinhSanPhamChiTiet: imeiData.maHinhSanPhamChiTiet || selectedProduct.maHinhSanPhamChiTiet || 'N/A',
                    name: imeiData.name || selectedProduct.name || 'Sản phẩm không xác định',
                    imei: imei,
                    ram: imeiData.ram || selectedProduct.ram || 'N/A',
                    capacity: imeiData.capacity || selectedProduct.capacity || 'N/A',
                    color: imeiData.color || selectedProduct.color || 'N/A',
                    price: imeiData.price || selectedProduct.price || 0,
                    quantity: 1,
                    image: imeiData.image || selectedProduct.image || '/assets/placeholder-product.png',
                    imeiList: [{ imei, status: 'Còn hàng' }],
                };

                // Step 3: Replace product
                const productIndex = products.findIndex(p => p.chiTietSanPhamId === selectedProduct.chiTietSanPhamId);
                if (productIndex === -1) {
                    throw new Error('Không tìm thấy sản phẩm để thay thế');
                }

                // Step 4: Assign IMEI to invoice
                const imelMap = { [newProduct.chiTietSanPhamId]: imei };
                const result = await apiService.post(`/api/hoa-don/xac-nhan-imei/${invoiceId}`, imelMap);

                if (result.status === 200) {
                    // Update products in invoiceDetail
                    if (this.invoiceDetail && this.invoiceDetail.id === invoiceId) {
                        this.invoiceDetail.products[productIndex] = newProduct;
                        this.invoiceDetail.history.push({
                            id: Date.now(),
                            code: `LSHD_${Date.now()}`,
                            invoice: this.invoiceDetail.ma,
                            employee: 'Hệ thống',
                            action: `Thay thế sản phẩm ${selectedProduct.name} bằng ${newProduct.name} với IMEI ${imei}`,
                            timestamp: this.formatDate(new Date()),
                            status: 'completed',
                        });
                    }

                    return {
                        success: true,
                        message: `Đã thay thế sản phẩm và gán IMEI ${imei} cho ${newProduct.name}`,
                        updatedProduct: newProduct,
                    };
                } else {
                    throw new Error(result.data?.message || 'Lỗi khi gán IMEI');
                }
            } catch (error) {
                this.error = error.message || 'Lỗi khi thay thế sản phẩm';
                console.error('Error in selectIMEI:', error);
                console.error('Error response:', error.response?.data);
                return {
                    success: false,
                    message: error.response?.data?.message || error.message || 'Lỗi không xác định',
                };
            } finally {
                this.isLoading = false;
            }
        },

        async updateCustomerInfo(id, tenKhachHang, soDienThoai, diaChi, email) {
            this.isLoading = true;
            this.error = null;

            try {
                const params = { tenKhachHang, soDienThoai, diaChi, email };
                const response = await apiService.put(`/api/hoa-don/${id}/update-customer-info`, null, { params });
                if (this.invoiceDetail && this.invoiceDetail.id === id) {
                    this.invoiceDetail.idKhachHang.ten = tenKhachHang;
                    this.invoiceDetail.soDienThoaiKhachHang = soDienThoai;
                    this.invoiceDetail.diaChiKhachHang = diaChi;
                    this.invoiceDetail.idKhachHang.email = email;
                    this.invoiceDetail.history.push({
                        id: Date.now(),
                        code: `LSHD_${Date.now()}`,
                        invoice: this.invoiceDetail.ma,
                        employee: 'Hệ thống',
                        action: `Cập nhật thông tin khách hàng: ${tenKhachHang}`,
                        timestamp: this.formatDate(new Date()),
                        status: 'completed',
                    });
                }
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.message || 'Không thể cập nhật thông tin khách hàng';
                console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async updateHoaDon(id, maHD, loaiHD) {
            this.isLoading = true;
            this.error = null;

            try {
                const params = { maHD, loaiHD };
                const response = await apiService.put(`/api/hoa-don/${id}/update-hoa-don`, null, { params });
                if (this.invoiceDetail && this.invoiceDetail.id === id) {
                    this.invoiceDetail.ma = maHD;
                    this.invoiceDetail.loaiDon = loaiHD;
                    this.invoiceDetail.history.push({
                        id: Date.now(),
                        code: `LSHD_${Date.now()}`,
                        invoice: this.invoiceDetail.ma,
                        employee: 'Hệ thống',
                        action: `Cập nhật thông tin hóa đơn: ${maHD}`,
                        timestamp: this.formatDate(new Date()),
                        status: 'completed',
                    });
                }
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.message || 'Không thể cập nhật thông tin hóa đơn';
                console.error('Lỗi khi cập nhật thông tin hóa đơn:', error);
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
        getImelList: (state) => state.imelList,
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error,
        getTotalElements: (state) => state.totalElements,
        getPage: (state) => state.page,
        getSize: (state) => state.size,
    },
});