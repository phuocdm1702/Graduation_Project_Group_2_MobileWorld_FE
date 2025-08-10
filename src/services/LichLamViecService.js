import axios from 'axios';

const API_URL = 'http://localhost:8080/api/lich-lam-viec'; // Assuming your backend runs on port 8080

class LichLamViecService {
    getAllLichLamViec() {
        return axios.get(API_URL);
    }

    createLichLamViec(lichLamViec) {
        return axios.post(API_URL, lichLamViec);
    }

    updateLichLamViec(id, lichLamViec) {
        return axios.put(`${API_URL}/${id}`, lichLamViec);
    }

    deleteLichLamViec(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new LichLamViecService();