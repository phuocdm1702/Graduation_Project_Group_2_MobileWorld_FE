<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Quản Lý Lịch Làm Việc"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Filters and Add Button Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="filter-container m-3">
        <!-- Left side: Filters -->
        <div class="filters-section">
          <div class="filter-group">
            <label for="filterEmployee" class="filter-label">Nhân viên:</label>
            <select class="form-select filter-select" id="filterEmployee" v-model="filter.employeeId">
              <option :value="null">Tất cả</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.tenNhanVien }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filterDate" class="filter-label">Ngày làm:</label>
            <input type="date" class="form-control filter-input" id="filterDate" v-model="filter.workDate" />
          </div>
        </div>
        
        <!-- Right side: Add Button -->
        <div class="add-button-section">
          <button class="btn btn-primary-custom" @click="openAddModal">
            Thêm mới lịch làm việc
          </button>
        </div>
      </div>
    </FilterTableSection>

    <!-- Import Excel Section -->
    <FilterTableSection title="Nhập Dữ Liệu Từ Excel" icon="bi bi-file-earmark-excel">
      <div class="m-3 animate__animated animate__fadeInUp">
        <div class="row g-4 align-items-end">
          <div class="col-lg-6 col-md-6">
            <div class="filter-group">
              <label for="excelFile" class="filter-label">Chọn file Excel:</label>
              <input type="file" class="form-control search-input" id="excelFile" @change="handleFileUpload" accept=".xlsx, .xls" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6 d-flex justify-content-start">
            <button class="btn btn-primary-custom mt-auto" @click="uploadExcel">
              <i class="bi bi-file-earmark-arrow-up me-1"></i> Import Excel
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Bảng hiển thị Lịch Làm Việc -->
    <FilterTableSection title="Danh Sách Lịch Làm Việc" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredSchedules.length }} lịch làm việc</span>
        </div>
        <div class="view-toggle">
          <button class="btn btn-view-toggle me-2" :class="{ 'active': viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="bi bi-table me-1"></i> Bảng
          </button>
          <button class="btn btn-view-toggle" :class="{ 'active': viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <i class="bi bi-calendar3 me-1"></i> Lịch
          </button>
        </div>
      </div>
      <div class="table-body animate__animated animate__zoomIn" v-if="viewMode === 'table'">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0 custom-table">
            <thead class="thead-blue">
              <tr>
                <th class="text-uppercase text-xxs font-weight-bolder text-center">STT</th>
                <th class="text-uppercase text-xxs font-weight-bolder text-center">Nhân viên</th>
                <th class="text-uppercase text-xxs font-weight-bolder text-center">Ca làm</th>
                <th class="text-uppercase text-xxs font-weight-bolder text-center">Ngày làm</th>
                <th class="text-uppercase text-xxs font-weight-bolder text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(schedule, index) in filteredSchedules" :key="schedule.id" class="table-row-hover">
                <td class="text-center">
                  <p class="text-xs font-weight-bold mb-0">{{ index + 1 }}</p>
                </td>
                <td class="text-center">
                  <p class="text-xs font-weight-bold mb-0">{{ getEmployeeName(schedule.idNhanVien) }}</p>
                </td>
                <td class="text-center">
                  <p class="text-xs font-weight-bold mb-0">{{ schedule.caLam }}</p>
                </td>
                <td class="text-center">
                  <p class="text-xs font-weight-bold mb-0">{{ schedule.ngayLam }}</p>
                </td>
                <td class="text-center align-middle">
                  <button class="btn btn-sm btn-table me-2" @click="editSchedule(schedule)">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-table" @click="deleteSchedule(schedule.id)">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="calendar-body animate__animated animate__zoomIn custom-calendar" v-else>
        <FullCalendar :options="calendarOptions" />
      </div>
    </FilterTableSection>

    <AddScheduleModal :currentSchedule="currentSchedule" :employees="employees" @save-schedule="saveSchedule" />
  </div>
</template>

<script>
import LichLamViecService from '@/services/LichLamViecService';
import NhanVienService from '@/services/NhanVienService';
import axios from 'axios';
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddScheduleModal from './AddScheduleModal.vue';
import { Modal } from 'bootstrap';

export default {
  components: {
    HeaderCard,
    FilterTableSection,
    FullCalendar,
    AddScheduleModal,
  },
  data() {
    return {
      allSchedules: [],
      employees: [],
      currentSchedule: {
        id: null,
        idNhanVien: null,
        caLam: '',
        ngayLam: null,
        deleted: false,
      },
      filter: {
        employeeId: null,
        workDate: null,
      },
      selectedFile: null,
      viewMode: 'table', // Default view mode
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [],
        eventClick: this.handleEventClick,
        dateClick: this.handleDateClick,
        height: 'auto',
        locale: 'vi',
        buttonText: {
          today: 'Hôm nay',
          month: 'Tháng',
          week: 'Tuần',
          day: 'Ngày',
        },
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
      },
      addScheduleModal: null,
    };
  },
  computed: {
    filteredSchedules() {
      let schedules = this.allSchedules;
      if (this.filter.employeeId) {
        schedules = schedules.filter(s => s.idNhanVien === this.filter.employeeId);
      }
      if (this.filter.workDate) {
        schedules = schedules.filter(s => s.ngayLam === this.filter.workDate);
      }
      return schedules;
    }
  },
  methods: {
    openAddModal() {
      this.resetForm();
      this.addScheduleModal.show();
    },
    async fetchSchedules() {
      try {
        const response = await LichLamViecService.getAllLichLamViec();
        this.allSchedules = response.data;
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    },
    async fetchEmployees() {
      try {
        const response = await NhanVienService.getAllNhanVienLookup();
        this.employees = response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    },
    getEmployeeName(employeeId) {
      const employee = this.employees.find(emp => emp.id === employeeId);
      return employee ? employee.tenNhanVien : 'Không xác định';
    },
    resetForm() {
      this.currentSchedule = {
        id: null,
        idNhanVien: null,
        caLam: '',
        ngayLam: null,
        deleted: false,
      };
    },
    editSchedule(schedule) {
      this.currentSchedule = { ...schedule, ngayLam: schedule.ngayLam };
      this.addScheduleModal.show();
    },
    async saveSchedule(schedule) {
      try {
        if (schedule.id) {
          await LichLamViecService.updateLichLamViec(
            schedule.id,
            schedule
          );
        } else {
          await LichLamViecService.createLichLamViec(schedule);
        }
        this.resetForm();
        await this.fetchSchedules();
        this.updateCalendarEvents();
        this.addScheduleModal.hide();
      } catch (error) {
        console.error('Error saving schedule:', error);
      }
    },
    async deleteSchedule(id) {
      if (confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) {
        try {
          await LichLamViecService.deleteLichLamViec(id);
          await this.fetchSchedules();
          this.updateCalendarEvents();
        } catch (error) {
          console.error('Error deleting schedule:', error);
        }
      }
    },
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadExcel() {
      if (!this.selectedFile) {
        alert('Vui lòng chọn một file Excel để import.');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      try {
        await axios.post('http://localhost:8080/api/lich-lam-viec/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Import Excel thành công!');
        this.selectedFile = null;
        document.getElementById('excelFile').value = '';
        await this.fetchSchedules();
        this.updateCalendarEvents();
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Import Excel thất bại! Vui lòng kiểm tra console để biết chi tiết.');
      }
    },
    updateCalendarEvents() {
      this.calendarOptions.events = this.allSchedules.map(schedule => ({
        id: schedule.id,
        title: `${this.getEmployeeName(schedule.idNhanVien)} - ${schedule.caLam}`,
        start: schedule.ngayLam,
        allDay: true,
      }));
    },
    handleEventClick(info) {
      const schedule = this.allSchedules.find(s => s.id === parseInt(info.event.id));
      if (schedule) {
        this.editSchedule(schedule);
      }
    },
    handleDateClick(info) {
      this.currentSchedule.ngayLam = info.dateStr;
      this.resetForm();
      this.currentSchedule.ngayLam = info.dateStr;
    },
  },
  async created() {
    await this.fetchEmployees();
    await this.fetchSchedules();
    this.updateCalendarEvents();
  },
  mounted() {
    this.addScheduleModal = new Modal(document.getElementById('addScheduleModal'));
  }
};
</script>

<style scoped>
/* Filter Container Layout */
.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  padding: 1rem 0;
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.add-button-section {
  display: flex;
  align-items: flex-end;
}

/* Filter Inputs */
.filter-select,
.filter-input {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  transition: all 0.3s ease;
  background: white;
  font-size: 0.9rem;
}

.filter-select:focus,
.filter-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  outline: none;
}

/* Primary Button Style */
.btn-primary-custom {
  background:#34d399;
  color: white;
  border: none;
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary-custom:hover {
  background: #059669;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.view-toggle {
  display: flex;
}

.btn-view-toggle {
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-view-toggle:hover {
  background: #e2e8f0;
  color: #475569;
  border-color: #cbd5e1;
}

.btn-view-toggle.active {
  background:#34d399;
  color: white;
  border-color: #34d399;
  box-shadow: 0 2px 8px rgba(52, 211, 153, 0.3);
}

/* Custom Table Styles */
.custom-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.thead-blue {
  background:#34d399;
}

.thead-blue th {
  border: none;
  padding: 1rem 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: middle;
}

.table-row-hover {
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.table-row-hover:hover {
  background: rgba(52, 211, 153, 0.05);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.table-row-hover td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border: none;
}

.text-blue {
  color: #34d399 !important;
  font-weight: 600;
}

/* Custom Calendar Styles */
.custom-calendar {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
}

.custom-calendar :deep(.fc-toolbar) {
  background:#34d399;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.custom-calendar :deep(.fc-toolbar-title) {
  color: white;
  font-weight: 600;
}

.custom-calendar :deep(.fc-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.custom-calendar :deep(.fc-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.custom-calendar :deep(.fc-button-active) {
  background: rgba(255, 255, 255, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.custom-calendar :deep(.fc-event) {
  background:#34d399;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-calendar :deep(.fc-event:hover) {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-1px);
}

.custom-calendar :deep(.fc-daygrid-day:hover) {
  background: rgba(52, 211, 153, 0.05);
}

.custom-calendar :deep(.fc-day-today) {
  background: rgba(52, 211, 153, 0.1) !important;
}

.custom-calendar :deep(a) {
  text-decoration: none !important;
}

.custom-calendar :deep(.fc-event a) {
  color: white;
}

.custom-calendar :deep(.fc-daygrid-day-number) {
  color: #1f3a44;
  font-weight: 600;
}

.custom-calendar :deep(.fc-col-header-cell a) {
  color: #1f3a44;
  font-weight: 600;
  text-decoration: none;
}

.custom-calendar :deep(.fc-daygrid-day-top) {
  color: #1f3a44;
}

.custom-calendar :deep(.fc-day-other .fc-daygrid-day-number) {
  color: #94a3b8;
}

/* Responsive Design */
@media (max-width: 992px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .add-button-section {
    align-items: center;
    justify-content: center;
  }
  
  .filter-group {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .filters-section {
    gap: 0.75rem;
  }
  
  .btn-primary-custom {
    width: 100%;
    padding: 0.75rem;
  }
}

/* Legacy Styles */
.gradient-custom-teal {
  background:#34d399;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px 8px 0 0;
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-count {
  font-size: 0.875rem;
  color: #34d399;
  font-weight: 600;
  background: rgba(52, 211, 153, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}
</style>