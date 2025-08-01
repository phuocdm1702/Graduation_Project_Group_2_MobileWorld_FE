import apiService from './api';

export const batDauCa = (nhanVienId, tienMatBanDau) => {
    return apiService.post(`/api/giao-ca/bat-dau?nhanVienId=${nhanVienId}&tienMatBanDau=${tienMatBanDau}`);
};

export const ketThucCa = (nhanVienId, tienMatCuoiCa) => {
    return apiService.post(`/api/giao-ca/ket-thuc?nhanVienId=${nhanVienId}&tienMatCuoiCa=${tienMatCuoiCa}`);
};

export const getActiveShift = (nhanVienId) => {
    return apiService.get(`/api/giao-ca/active?nhanVienId=${nhanVienId}`);
};

export const xuatExcel = (reportData) => {
    return apiService.post('/api/giao-ca/xuat-excel', reportData, {
        responseType: 'blob',
    });
};

export const getPendingOrdersCount = () => {
    return apiService.get('/api/giao-ca/pending-orders-count');
};

export const getLastEndedShiftCash = () => {
    return apiService.get('/api/giao-ca/last-ended-shift-cash');
};