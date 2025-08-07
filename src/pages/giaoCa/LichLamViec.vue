<template>
  <div className="card mt-4">
    <div className="card-header">
      <h5 className="card-title mb-0">Lịch Làm Việc Nhân Viên</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="excel-importer" className="btn btn-primary">
          <i className="bi bi-file-earmark-excel me-2"></i> Import Excel
        </label>
        <input type="file" id="excel-importer" @change="handleFileUpload" accept=".xlsx, .xls" class="d-none"/>
        <span v-if="fileName" className="ms-3 text-muted">{{ fileName }}</span>
      </div>

      <div v-if="scheduleData.length > 0">
        <DataTable :headers="tableHeaders" :data="scheduleData" :itemsPerPage="5"/>
      </div>
      <div v-else className="text-center text-muted mt-4">
        <p>Chưa có dữ liệu lịch làm việc. Vui lòng import file Excel.</p>
        <p className="small">File Excel cần có các cột: <strong>Tên Nhân Viên</strong>, <strong>Ca Làm</strong>,
          <strong>Ngày</strong>.</p>
      </div>
    </div>
    <ToastNotification ref="toastNotification" type="info"/>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import * as XLSX from 'xlsx';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const scheduleData = ref([]);
const fileName = ref('');
const toastNotification = ref(null);

const tableHeaders = ref([
  {text: "STT", value: "stt", sortable: false},
  {text: "Tên Nhân Viên", value: "tenNhanVien", sortable: true},
  {text: "Ca Làm", value: "caLam", sortable: true},
  {text: "Ngày", value: "ngay", sortable: true},
]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      console.log('Sheet Names:', workbook.SheetNames);
      const firstSheetName = workbook.SheetNames.find(name => name === 'Sheet1') || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) throw new Error('Sheet1 not found');
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      console.log('jsonData:', jsonData);

      const parsedData = jsonData.slice(1).map((row, index) => ({
        stt: index + 1,
        tenNhanVien: row[0] || '',
        caLam: row[1] || '',
        ngay: formatDate(row[2]) || ''
      })).filter(row => row.tenNhanVien && row.caLam && row.ngay);
      console.log('Parsed Data:', parsedData);

      scheduleData.value = Array.isArray(parsedData) ? parsedData : [];
      console.log('scheduleData:', scheduleData.value);
      toastNotification.value.addToast({
        type: 'success',
        message: `Import thành công ${parsedData.length} dòng dữ liệu.`
      });
    } catch (error) {
      console.error("Error processing Excel file:", error.message, error.stack);
      scheduleData.value = [];
      toastNotification.value.addToast({
        type: 'error',
        message: 'Có lỗi xảy ra khi xử lý file Excel.'
      });
    }
    event.target.value = null;
  };

  reader.onerror = (error) => {
    console.error("FileReader error:", error);
    scheduleData.value = [];
    toastNotification.value.addToast({
      type: 'error',
      message: 'Có lỗi xảy ra khi đọc file.'
    });
  };

  reader.readAsArrayBuffer(file);
};

const formatDate = (excelDate) => {
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return isNaN(date) ? '' : date.toLocaleDateString('vi-VN');
  } else if (excelDate) {
    const date = new Date(excelDate);
    return isNaN(date) ? '' : date.toLocaleDateString('vi-VN');
  }
  return '';
};
</script>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>