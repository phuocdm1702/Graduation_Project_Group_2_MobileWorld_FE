<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Quản Lý Lịch Làm Việc"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Form Thêm/Sửa Lịch Làm Việc -->
    <FilterTableSection title="Thông Tin Lịch Làm Việc" icon="bi bi-calendar-check">
      <div class="m-3 animate__animated animate__fadeInUp">
        <form @submit.prevent="saveSchedule">
          <div class="row g-4">
            <div class="col-lg-4 col-md-6">
              <div class="filter-group">
                <label for="employeeId" class="filter-label">Nhân viên:</label>
                <select class="form-select search-input" id="employeeId" v-model="currentSchedule.idNhanVien" required>
                  <option :value="null" disabled>Chọn nhân viên</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.tenNhanVien }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-lg-4 col-md-6">
              <div class="filter-group">
                <label for="shift" class="filter-label">Ca làm:</label>
                <select class="form-select search-input" id="shift" v-model="currentSchedule.caLam" required>
                  <option value="8h-15h">8h-15h</option>
                  <option value="15h-22h">15h-22h</option>
                </select>
              </div>
            </div>
            <div class="col-lg-4 col-md-6">
              <div class="filter-group">
                <label for="workDate" class="filter-label">Ngày làm:</label>
                <input type="date" class="form-control search-input" id="workDate" v-model="currentSchedule.ngayLam" required />
              </div>
            </div>
          </div>
          <div class="action-buttons mt-4 d-flex justify-content-end">
            <button type="submit" class="btn btn-action me-2">
              <i class="bi bi-save me-1"></i> {{ currentSchedule.id ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" class="btn btn-reset" @click="resetForm">
              <i class="bi bi-x-circle me-1"></i> Hủy
            </button>
          </div>
        </form>
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
            <button class="btn btn-action mt-auto" @click="uploadExcel">
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
          <span class="table-count">{{ allSchedules.length }} lịch làm việc</span>
        </div>
        <div class="view-toggle">
          <button class="btn btn-action me-2" :class="{ 'active': viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="bi bi-table me-1"></i> Bảng
          </button>
          <button class="btn btn-action" :class="{ 'active': viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <i class="bi bi-calendar3 me-1"></i> Lịch
          </button>
        </div>
      </div>
      <div class="table-body animate__animated animate__zoomIn" v-if="viewMode === 'table'">
        <div class="table-responsive">
          <table class="table table-hover align-items-center mb-0">
            <thead class="thead-light">
              <tr>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">ID</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Nhân viên</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Ca làm</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Ngày làm</th>
                <th class="text-secondary opacity-7"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="schedule in allSchedules" :key="schedule.id">
                <td>
                  <p class="text-xs font-weight-bold mb-0">{{ schedule.id }}</p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">{{ getEmployeeName(schedule.idNhanVien) }}</p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">{{ schedule.caLam }}</p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">{{ schedule.ngayLam }}</p>
                </td>
                <td class="align-middle">
                  <button class="btn btn-sm btn-table me-2" @click="editSchedule(schedule)">
                    <i class="bi bi-pencil-fill"></i> Sửa
                  </button>
                  <button class="btn btn-sm btn-table" @click="deleteSchedule(schedule.id)">
                    <i class="bi bi-trash-fill"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="calendar-body animate__animated animate__zoomIn" v-else>
        <FullCalendar :options="calendarOptions" />
      </div>
    </FilterTableSection>
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

export default {
  components: {
    HeaderCard,
    FilterTableSection,
    FullCalendar,
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
    };
  },
  methods: {
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
    },
    async saveSchedule() {
      try {
        if (this.currentSchedule.id) {
          await LichLamViecService.updateLichLamViec(
            this.currentSchedule.id,
            this.currentSchedule
          );
        } else {
          await LichLamViecService.createLichLamViec(this.currentSchedule);
        }
        this.resetForm();
        await this.fetchSchedules();
        this.updateCalendarEvents();
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
};
</script>

<style scoped>
/* Existing styles remain unchanged */
.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-toggle .btn {
  min-width: 100px;
}

.view-toggle .btn.active {
  background: #16a34a;
  color: white;
}

.calendar-body {
  padding: 1rem;
}

.calendar-body :deep(.fc-event) {
  cursor: pointer;
}

/* Remove underline from ALL links in the calendar, but don't touch their color */
.calendar-body :deep(a) {
  text-decoration: none !important;
}

/* For event-specific links, also set the text color to white */
.calendar-body :deep(.fc-event a) {
  color: white;
}


/* Existing styles below */
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

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
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

.btn-reset,
.btn-action {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-count {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
}

@media (max-width: 992px) {
  .filter-actions, .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .row.g-4 {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }
  .row.g-4 > [class*="col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}
</style>