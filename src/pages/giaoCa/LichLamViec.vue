<template>
  <div class="card mt-4">
    <div class="card-header">
      <h5 class="card-title mb-0">Lịch Làm Việc Nhân Viên</h5>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label for="excel-importer" class="btn btn-primary">
          <i class="bi bi-file-earmark-excel me-2"></i> Import Excel
        </label>
        <input type="file" id="excel-importer" @change="handleFileUpload" accept=".xlsx, .xls" class="d-none" />
        <span v-if="fileName" class="ms-3 text-muted">{{ fileName }}</span>
      </div>

      <div v-if="scheduleData.length > 0">
        <DataTable :headers="tableHeaders" :items="scheduleData" :totalPages="1" :currentPage="1">
          <template #item-stt="{ item, index }">
            <span>{{ index + 1 }}</span>
          </template>
        </DataTable>
      </div>
      <div v-else class="text-center text-muted mt-4">
        <p>Chưa có dữ liệu lịch làm việc. Vui lòng import file Excel.</p>
        <p class="small">File Excel cần có các cột: <strong>Tên Nhân Viên</strong>, <strong>Ca Làm</strong>, <strong>Ngày</strong>.</p>
      </div>
    </div>
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const scheduleData = ref([]);
const fileName = ref('');
const toastNotification = ref(null);

const tableHeaders = ref([
  { text: "STT", value: "stt", sortable: false },
  { text: "Tên Nhân Viên", value: "tenNhanVien", sortable: true },
  { text: "Ca Làm", value: "caLam", sortable: true },
  { text: "Ngày", value: "ngay", sortable: true },
]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Loại bỏ các dòng trống hoặc không hợp lệ
      const parsedData = jsonData.slice(1).map((row, index) => ({
        stt: index + 1,
        tenNhanVien: row[0] || '', // Cột đầu tiên làm tên nhân viên
        caLam: row[1] || '',       // Cột thứ hai làm ca làm
        ngay: formatDate(row[2]) || '', // Cột thứ ba làm ngày
      })).filter(row => row.tenNhanVien || row.caLam || row.ngay); // Loại bỏ dòng trống hoàn toàn

      scheduleData.value = parsedData;
      toastNotification.value.addToast({ type: 'success', message: `Import thành công ${parsedData.length} dòng dữ liệu.` });
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toastNotification.value.addToast({ type: 'error', message: 'Có lỗi xảy ra khi xử lý file Excel.' });
    }
    event.target.value = null; // Reset input to allow re-uploading the same file
  };

  reader.onerror = (error) => {
    console.error("FileReader error:", error);
    toastNotification.value.addToast({ type: 'error', message: 'Có lỗi xảy ra khi đọc file.' });
  };

  reader.readAsArrayBuffer(file);
};

// Helper to format date from Excel (which might be a number or string)
const formatDate = (excelDate) => {
  if (typeof excelDate === 'number') {
    // Excel stores dates as serial numbers.
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toLocaleDateString('vi-VN');
  } else if (excelDate) {
    // If it's already a string, try to parse it.
    const date = new Date(excelDate);
    if (!isNaN(date)) {
        return date.toLocaleDateString('vi-VN');
    }
  }
  return excelDate; // Return as is if format is not recognized
};

</script>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>
