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
            sortBy: 'id',  // Mới: Default sort by id
            sortDir: 'DESC',  // Mới: Default DESC
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
                    sortBy: this.filters.sortBy,  // Mới
                    sortDir: this.filters.sortDir,  // Mới
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
            this.fetchInvoices({ page: 0 });  // Reset page về 0 khi filter thay đổi
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
                        return {
                            hoaDonChiTietId: product.hoaDonChiTietId, // Thêm
                            chiTietSanPhamId: product.chiTietSanPhamId,
                            idSanPham: product.idSanPham, // Dùng trực tiếp, không cần fallback
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

        async fetchImelList({ page = 0, size = 100, idSanPham, chiTietSanPhamId, clearPrevious = true } = {}) {
            this.isLoading = true;
            try {
                if (!idSanPham || !chiTietSanPhamId) {
                    throw new Error('idSanPham and chiTietSanPhamId are required');
                }

                // Always clear previous data first
                this.imelList = [];
                console.log('Cleared store imelList for new product');

                const params = { page, size, idSanPham, chiTietSanPhamId };
                console.log('Fetching IMEI list with params:', params);
                const response = await apiService.get('/api/hoa-don/hoa-don-chi-tiet/imel', { params });
                const { content, totalElements } = response.data;

                const newIMEIs = content.map(item => ({
                    id: item.id,
                    imei: item.imel,
                    maImel: item.ma,
                    status: item.deleted === false ? 'Còn hàng' : 'Đã bán',
                    ram: item.dungLuongRam,
                    capacity: item.dungLuongBoNhoTrong,
                    price: item.giaBan,
                    color: item.mauSac
                }));

                // Always use fresh data
                this.imelList = newIMEIs;
                console.log('Set fresh IMEI data in store:', newIMEIs.length, 'items');
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

        async updateHoaDonStatus(id, trangThai, idNhanVien) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.put(`/api/hoa-don/${id}/update-status`, null, {
                    params: { trangThai, idNhanVien }
                });
                
                // Update local state if this is the current invoice detail
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

                // Return success immediately without waiting for email
                const result = { 
                    success: true, 
                    data: response.data
                };

                // Send email asynchronously in background - don't await
                this.sendStatusUpdateEmailAsync(id);

                return result;
            } catch (error) {
                this.error = error.message || 'Không thể cập nhật trạng thái hóa đơn';
                console.error('Lỗi khi cập nhật trạng thái:', error);
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async sendStatusUpdateEmailAsync(hoaDonId) {
            // Send email in background without blocking UI
            try {
                console.log('Sending email notification in background for invoice:', hoaDonId);
                const emailResult = await this.sendStatusUpdateEmail(hoaDonId);
                
                if (emailResult.success) {
                    console.log('Background email sent successfully:', emailResult.message);
                } else {
                    console.warn('Background email sending failed:', emailResult.message);
                }
            } catch (error) {
                console.error('Background email sending error:', error);
            }
        },

        async confirmAndAssignIMEI(idHD, imelMap) {
            this.isLoading = true;
            this.error = null;

            console.log('confirmAndAssignIMEI called with:', { idHD, imelMap });

            // Validate input
            if (!idHD || !imelMap || Object.keys(imelMap).length === 0) {
                this.error = 'ID hóa đơn và danh sách IMEI không được để trống';
                this.isLoading = false;
                return { success: false, message: this.error };
            }

            // Backend expect Map<Integer, String> - gửi object đơn giản với integer keys
            const finalPayload = {};
            Object.entries(imelMap).forEach(([key, value]) => {
                finalPayload[parseInt(key)] = value.trim();
            });

            console.log('Sending payload to API:', {
                endpoint: `/api/hoa-don/xac-nhan-imei/${idHD}`,
                originalPayload: imelMap,
                finalPayload: finalPayload
            });

            try {
                // Gọi API với endpoint chính xác
                const response = await apiService.post(`/api/hoa-don/xac-nhan-imei/${idHD}`, finalPayload);
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
                this.error = error.response?.data?.message || error.message || 'Không thể xác nhận và gán IMEI';
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

                // Lấy idImel
                const idImelResponse = await apiService.get(`/api/chi-tiet-san-pham/find-id-imel-by-imei?imei=${imei}`);
                const idImel = idImelResponse.data?.idImel;
                if (!idImel) {
                    throw new Error('Không tìm thấy idImel cho IMEI này');
                }

                // Tạo sản phẩm mới
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

                // Lưu sản phẩm cũ để khôi phục nếu cần
                const oldProduct = { ...products.find(p => p.chiTietSanPhamId === selectedProduct.chiTietSanPhamId) };

                // Thay thế sản phẩm tạm thời
                const productIndex = products.findIndex(p => p.chiTietSanPhamId === selectedProduct.chiTietSanPhamId);
                if (productIndex === -1) {
                    throw new Error('Không tìm thấy sản phẩm để thay thế');
                }
                products[productIndex] = newProduct;

                // Gán IMEI cho hóa đơn
                const imelMap = { [newProduct.chiTietSanPhamId]: imei };
                const result = await apiService.post(`/api/hoa-don/xac-nhan-imei/${invoiceId}`, imelMap);

                if (result.status === 200) {
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
                    // Khôi phục sản phẩm cũ nếu thất bại
                    products[productIndex] = oldProduct;
                    throw new Error(result.data?.message || 'Lỗi khi gán IMEI');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Lỗi không xác định';
                console.error('Error in selectIMEI:', error);
                return {
                    success: false,
                    message: this.error,
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

        async addProductToInvoiceDetail(idHD, chiTietSanPhamId, imei) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.post(`/api/hoa-don/${idHD}/add-product-to-detail`, {
                    chiTietSanPhamId,
                    imei,
                });

                const updatedInvoice = response.data;

                // Cập nhật invoiceDetail nếu idHD khớp
                if (this.invoiceDetail && this.invoiceDetail.id === idHD) {
                    this.invoiceDetail = {
                        ...this.invoiceDetail,
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
                        tongTienSauGiam: updatedInvoice.tongTienSauGiam,
                    };
                }

                // Cập nhật danh sách invoices nếu cần
                const invoiceIndex = this.invoices.findIndex(inv => inv.id === idHD);
                if (invoiceIndex !== -1) {
                    this.invoices[invoiceIndex] = {
                        ...this.invoices[invoiceIndex],
                        tongTienSauGiam: updatedInvoice.tongTienSauGiam,
                    };
                }

                return { success: true, data: updatedInvoice };
            } catch (error) {
                this.error = error.response?.data?.message || 'Không thể thêm sản phẩm vào hóa đơn chi tiết';
                console.error('Lỗi khi gọi API thêm sản phẩm:', error);
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async deleteProductFromInvoiceDetail(idHD, idHoaDonChiTiet) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiService.delete(`/api/hoa-don/${idHD}/delete-product-from-detail/${idHoaDonChiTiet}`);
                const updatedInvoice = response.data;

                // Cập nhật invoiceDetail nếu idHD khớp
                if (this.invoiceDetail && this.invoiceDetail.id === idHD) {
                    this.invoiceDetail = {
                        ...this.invoiceDetail,
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

                // Cập nhật danh sách invoices nếu cần
                const invoiceIndex = this.invoices.findIndex(inv => inv.id === idHD);
                if (invoiceIndex !== -1) {
                    this.invoices[invoiceIndex] = {
                        ...this.invoices[invoiceIndex],
                        tongTienSauGiam: updatedInvoice.tongTienSauGiam,
                    };
                }

                return { success: true, data: updatedInvoice };
            } catch (error) {
                this.error = error.response?.data?.message || 'Không thể xóa sản phẩm khỏi hóa đơn chi tiết';
                console.error('Lỗi khi gọi API xóa sản phẩm:', error);
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

            // Debug logging
            console.log(`mapStatusToNumber input: "${statusString}", length: ${statusString?.length}`);
            console.log('Available keys:', Object.keys(statusMap));

            // Trim whitespace and normalize
            const cleanStatus = statusString?.trim();
            const result = statusMap[cleanStatus];

            console.log(`mapStatusToNumber result: ${result}`);
            return result !== undefined ? result : null;
        },

        async autoAssignRelatedProductIMEIs(originalImelMap) {
            console.log('Starting auto-detection for related products...');
            const enhancedMap = { ...originalImelMap };

            if (!this.invoiceDetail || !this.invoiceDetail.products) {
                console.log('No invoice detail or products found, returning original map');
                return enhancedMap;
            }

            // Tìm tất cả products trong invoice
            const allProducts = this.invoiceDetail.products;
            console.log('All products in invoice:', allProducts.map(p => ({
                chiTietSanPhamId: p.chiTietSanPhamId,
                idSanPham: p.idSanPham,
                name: p.name,
                ram: p.ram,
                capacity: p.capacity,
                color: p.color,
                imei: p.imei
            })));

            console.log('Full products data:', allProducts);

            // Với mỗi chiTietSanPhamId đã có IMEI, chỉ tìm products cùng thuộc tính để auto-assign
            for (const [providedId, providedImei] of Object.entries(originalImelMap)) {
                const providedProduct = allProducts.find(p => p.chiTietSanPhamId === parseInt(providedId));

                if (!providedProduct) {
                    console.warn(`Product with chiTietSanPhamId ${providedId} not found in invoice`);
                    continue;
                }

                console.log(`Checking for products with SAME attributes as chiTietSanPhamId ${providedId}:`, {
                    name: providedProduct.name,
                    ram: providedProduct.ram,
                    capacity: providedProduct.capacity,
                    color: providedProduct.color
                });

                // CHỈ tìm products có CÙNG thuộc tính (name, ram, capacity, color) để auto-assign
                const sameAttributeProducts = allProducts.filter(p =>
                    p.chiTietSanPhamId !== parseInt(providedId) && // Khác chiTietSanPhamId
                    p.name === providedProduct.name && // Cùng tên sản phẩm
                    p.ram === providedProduct.ram && // Cùng RAM
                    p.capacity === providedProduct.capacity && // Cùng capacity
                    p.color === providedProduct.color && // Cùng màu
                    !enhancedMap[p.chiTietSanPhamId] && // Chưa có IMEI trong map
                    (!p.imei || p.imei === '' || p.imei === null) // Chưa có IMEI trong database
                );

                console.log(`Found ${sameAttributeProducts.length} products with SAME attributes for auto-assignment:`,
                    sameAttributeProducts.map(p => p.chiTietSanPhamId));

                // Chỉ auto-assign cho products có CÙNG thuộc tính
                for (const sameProduct of sameAttributeProducts) {
                    const availableImei = this.findAvailableIMEIForProduct(sameProduct, Object.values(enhancedMap));

                    if (availableImei) {
                        enhancedMap[sameProduct.chiTietSanPhamId] = availableImei;
                        console.log(`Auto-assigned IMEI ${availableImei} to chiTietSanPhamId ${sameProduct.chiTietSanPhamId} (same attributes)`);
                    } else {
                        console.warn(`No available IMEI found for chiTietSanPhamId ${sameProduct.chiTietSanPhamId}`);
                    }
                }
            }

            // Tìm products có thuộc tính KHÁC mà chưa có IMEI - KHÔNG auto-assign, chỉ log để user biết
            const productsWithDifferentAttributes = allProducts.filter(p =>
                !enhancedMap[p.chiTietSanPhamId] && // Chưa có IMEI trong map
                (!p.imei || p.imei === '' || p.imei === null) // Chưa có IMEI trong database
            );

            if (productsWithDifferentAttributes.length > 0) {
                console.log(`Found ${productsWithDifferentAttributes.length} products with DIFFERENT attributes that need manual IMEI selection:`,
                    productsWithDifferentAttributes.map(p => ({
                        chiTietSanPhamId: p.chiTietSanPhamId,
                        name: p.name,
                        ram: p.ram,
                        capacity: p.capacity,
                        color: p.color
                    })));

                // Không auto-assign, để user tự chọn IMEI cho products có thuộc tính khác
                console.log('These products require manual IMEI selection by user.');

                // Return error để ngăn API call khi chưa đủ IMEI
                this.error = `Cần chọn IMEI cho ${productsWithDifferentAttributes.length} sản phẩm còn lại có thuộc tính khác nhau`;
                return {
                    success: false,
                    message: this.error,
                    missingProducts: productsWithDifferentAttributes.map(p => ({
                        chiTietSanPhamId: p.chiTietSanPhamId,
                        name: p.name,
                        ram: p.ram,
                        capacity: p.capacity,
                        color: p.color
                    })),
                    requiresManualSelection: true
                };
            }

            console.log('Final enhanced IMEI map (only same attributes auto-assigned):', enhancedMap);
            return enhancedMap;
        },

        findAvailableIMEI(idSanPham, usedImeis) {
            // Tìm IMEI khả dụng cho sản phẩm này
            const availableImeis = this.imelList.filter(imei =>
                imei.idSanPham === idSanPham &&
                imei.status === 'Còn hàng' &&
                !usedImeis.includes(imei.imei)
            );

            if (availableImeis.length > 0) {
                console.log(`Found ${availableImeis.length} available IMEIs for product ${idSanPham}`);
                return availableImeis[0].imei; // Lấy IMEI đầu tiên
            }

            console.warn(`No available IMEI found for product ${idSanPham}`);
            return null;
        },

        findAvailableIMEIForProduct(product, usedImeis) {
            // Tìm IMEI khả dụng cho sản phẩm dựa trên các thuộc tính
            console.log(`Finding IMEI for product:`, {
                chiTietSanPhamId: product.chiTietSanPhamId,
                idSanPham: product.idSanPham,
                name: product.name,
                ram: product.ram,
                capacity: product.capacity,
                color: product.color
            });

            // Tìm theo idSanPham trước
            if (product.idSanPham) {
                const availableImeis = this.imelList.filter(imei =>
                    imei.idSanPham === product.idSanPham &&
                    imei.status === 'Còn hàng' &&
                    !usedImeis.includes(imei.imei)
                );

                if (availableImeis.length > 0) {
                    console.log(`Found IMEI by idSanPham ${product.idSanPham}:`, availableImeis[0].imei);
                    return availableImeis[0].imei;
                }
            }

            // Fallback: Tìm theo thuộc tính sản phẩm (nếu IMEI có thông tin này)
            const availableImeis = this.imelList.filter(imei =>
                imei.status === 'Còn hàng' &&
                !usedImeis.includes(imei.imei) &&
                // Có thể match theo các thuộc tính khác nếu có
                (imei.ram === product.ram || !imei.ram) &&
                (imei.boNho === product.capacity || !imei.boNho) &&
                (imei.mauSac === product.color || !imei.mauSac)
            );

            if (availableImeis.length > 0) {
                console.log(`Found IMEI by product attributes:`, availableImeis[0].imei);
                return availableImeis[0].imei;
            }

            console.warn(`No available IMEI found for product ${product.chiTietSanPhamId}`);
            return null;
        },

        async sendStatusUpdateEmail(hoaDonId, customEmail = null) {
            this.isLoading = true;
            this.error = null;
            
            try {
                let endpoint;
                if (customEmail) {
                    endpoint = `/api/email/send-invoice-status/${hoaDonId}/custom-email?email=${encodeURIComponent(customEmail)}`;
                } else {
                    endpoint = `/api/email/send-invoice-status/${hoaDonId}`;
                }
                
                const response = await apiService.post(endpoint);
                
                if (response.data.success) {
                    console.log('Email sent successfully:', response.data.message);
                    return {
                        success: true,
                        message: response.data.message
                    };
                } else {
                    throw new Error(response.data.message || 'Failed to send email');
                }
            } catch (error) {
                console.error('Error sending status update email:', error);
                this.error = error.response?.data?.message || error.message || 'Lỗi gửi email thông báo';
                return {
                    success: false,
                    message: this.error
                };
            } finally {
                this.isLoading = false;
            }
        },

        async checkCustomerEmail(hoaDonId) {
            try {
                const response = await apiService.get(`/api/email/check-email/${hoaDonId}`);
                return response.data;
            } catch (error) {
                console.error('Error checking customer email:', error);
                return {
                    hasEmail: false,
                    message: 'Lỗi kiểm tra email khách hàng'
                };
            }
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