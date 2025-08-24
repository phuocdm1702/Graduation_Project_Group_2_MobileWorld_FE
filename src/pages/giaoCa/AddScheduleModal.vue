<template>
  <div class="modal fade" id="addScheduleModal" tabindex="-1" aria-labelledby="addScheduleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addScheduleModalLabel">{{ currentSchedule.id ? 'Cập nhật lịch làm việc' : 'Thêm mới lịch làm việc' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSchedule">
            <div class="mb-3">
              <label for="employeeId" class="form-label">Nhân viên:</label>
              <select class="form-select" id="employeeId" v-model="currentSchedule.idNhanVien" required>
                <option :value="null" disabled>Chọn nhân viên</option>
                <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                  {{ employee.tenNhanVien }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="shift" class="form-label">Ca làm:</label>
              <select class="form-select" id="shift" v-model="currentSchedule.caLam" required>
                <option value="8h-15h">8h-15h</option>
                <option value="15h-22h">15h-22h</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="workDate" class="form-label">Ngày làm:</label>
              <input type="date" class="form-control" id="workDate" v-model="currentSchedule.ngayLam" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-reset" data-bs-dismiss="modal">Đóng</button>
              <button type="submit" class="btn btn-action">{{ currentSchedule.id ? 'Cập nhật' : 'Thêm mới' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['currentSchedule', 'employees'],
  methods: {
    saveSchedule() {
      this.$emit('save-schedule', this.currentSchedule);
    }
  }
}
</script>

<style scoped>
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
</style>