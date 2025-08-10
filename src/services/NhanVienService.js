import api from './api';

const NhanVienService = {
    getAllNhanVienLookup() {
        return api.get('/nhan-vien/lookup');
    },
};

export default NhanVienService;
