import { defineStore } from 'pinia';
import { batDauCa, ketThucCa, getActiveShift, getLastEndedShiftCash } from '@/services/giaoCaService';

export const useGiaoCaStore = defineStore('giaoCa', {
  state: () => ({
    activeShift: null, // Sẽ lưu toàn bộ thông tin ca đang hoạt động từ BE
    reportData: {},
    lastEndedShiftCash: 0, // Thêm state mới để lưu tiền mặt cuối ca trước
  }),
  actions: {
    async checkActiveShift(nhanVienId) {
      try {
        const response = await getActiveShift(nhanVienId);
        if (response.status === 200) {
          this.activeShift = response.data;
        } else {
          this.activeShift = null;
        }
      } catch (error) {
        if (error.response && error.response.status === 204) {
            this.activeShift = null; // No active shift
        } else {
            console.error('Error checking active shift:', error);
            throw error;
        }
      }
    },
    async fetchLastEndedShiftCash() {
        try {
            const response = await getLastEndedShiftCash();
            if (response.status === 200) {
                this.lastEndedShiftCash = response.data;
            } else {
                this.lastEndedShiftCash = 0;
            }
        } catch (error) {
            if (error.response && error.response.status === 204) {
                this.lastEndedShiftCash = 0; // No previous shift cash
            } else {
                console.error('Error fetching last ended shift cash:', error);
                this.lastEndedShiftCash = 0;
            }
        }
    },
    async startShift(nhanVienId, tienMatBanDau) {
      try {
        const response = await batDauCa(nhanVienId, tienMatBanDau);
        this.activeShift = response.data;
        return true;
      } catch (error) {
        console.error('Error starting shift:', error);
        throw error;
      }
    },
    async endShift(nhanVienId, tienMatCuoiCa) {
      try {
        const response = await ketThucCa(nhanVienId, tienMatCuoiCa);
        this.reportData = response.data;
        this.activeShift = null; // Kết thúc ca, không còn ca hoạt động
        return response.data;
      } catch (error) {
        console.error('Error ending shift:', error);
        throw error;
      }
    },
    resetReportData() {
        this.reportData = {};
    }
  },
  persist: true, // This will persist the store's state in localStorage
});
