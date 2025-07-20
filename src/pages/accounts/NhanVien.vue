<template>
  <div class="container-fluid py-4">
    <HeaderCard
      title="Quản Lý Nhân Viên"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3 animate__animated animate__fadeInUp">
        <div class="row g-4 align-items-end">
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  placeholder="Mã, tên, email, SĐT..."
                  v-model="keyword"
                  @keyup.enter="debouncedSearch($event.target.value)"
                />
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng thái</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="tat-ca"
                    v-model="statusFilter"
                    class="radio-input"
                  />
                  Tất cả
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    value="true"
                    v-model="statusFilter"
                    class="radio-input"
                  />
                  Đang làm
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    value="false"
                    v-model="statusFilter"
                    class="radio-input"
                  />
                  Đã nghỉ
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12" style="display: flex; align-items: center">
              <div class="filter-stats">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số nhân viên:</span>
                  <span
                    class="stat-value"
                    style="color: #15803d; font-weight: bold"
                    >{{ filteredEmployees.length }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              Đặt lại bộ lọc
            </button>
            <router-link to="/nhanVien/form" class="btn btn-action">
              Thêm Nhân Viên
            </router-link>
            <button class="btn btn-action" @click="exportExcel">
              Xuất Excel
            </button>
            <label for="import-excel" class="btn btn-action cursor-pointer">
              Nhập từ Excel
              <input
                id="import-excel"
                type="file"
                accept=".xlsx, .xls"
                class="d-none"
                @change="handleExcelUpload"
              />
            </label>
            <button class="btn btn-action" @click="downloadTemplate">
              Tải mẫu Excel
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Nhân Viên" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count"
            >{{ filteredEmployees.length }} nhân viên</span
          >
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <div class="animate__animated animate__zoomIn">
          <DataTable
            :headers="headers"
            :data="filteredEmployees"
            :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
          >
            <template #stt="{ item, index }">
              {{ index + 1 }}
            </template>
            <template #ma="{ item }">
              <div class="code-cell">
                <span class="code-text">{{ item.ma }}</span>
              </div>
            </template>
            <template #tenNhanVien="{ item }">
              <span class="employee-name">{{ item.tenNhanVien }}</span>
            </template>
            <template #email="{ item }">
              <div class="email-cell">
                <span class="email-text">{{ item.idTaiKhoan.email }}</span>
              </div>
            </template>
            <template #soDienThoai="{ item }">
              <div class="email-cell">
                <span class="email-text">{{
                  item.idTaiKhoan.soDienThoai
                }}</span>
              </div>
            </template>
            <template #diaChi="{ item }">
              <div class="address-cell">
                <span class="address-text">{{ formatAddress(item) }}</span>
              </div>
            </template>
            <template #trangThai="{ item }">
              <span
                class="status-badge"
                :class="getStatusBadgeClass(item.idTaiKhoan.deleted)"
              >
                {{ item.idTaiKhoan.deleted ? "Đang làm" : "Đã nghỉ" }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="action-buttons-cell d-flex gap-2">
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="item.idTaiKhoan.deleted"
                    @change="toggleEmployeeStatus(item)"
                  />
                  <span class="slider round"></span>
                </label>
                <button
                  class="btn btn-sm btn-table"
                  @click="editEmployee(item)"
                  title="Chỉnh sửa"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                  class="btn btn-sm btn-table"
                  @click="confirmDeleteEmployee(item)"
                  title="Xóa"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </FilterTableSection>

    <NotificationModal
      ref="notificationModal"
      :type="notificationType"
      :message="notificationMessage"
      :isLoading="isNotificationLoading"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      @close="resetNotification"
    />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash";
import DataTable from "@/components/common/DataTable.vue";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import {
  fetchNhanVien,
  Search,
  trangThai,
  importNhanVien,
} from "../../store/modules/employees/nhanVien";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const router = useRouter();
const keyword = ref("");
const statusFilter = ref("tat-ca");
const currentPage = ref(1);
const pageSize = ref(10);
const notificationType = ref("");
const notificationMessage = ref("");
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(null);
const notificationOnCancel = ref(null);
const notificationModal = ref(null);
const toastNotification = ref(null);

const employees = ref([]);

// const filteredEmployees = computed(() => {
//   return employees.value.filter((employee) => {
//     const searchText = keyword.value.toLowerCase();
//     const matchesSearch =
//       employee.ma.toLowerCase().includes(searchText) ||
//       employee.tenNhanVien.toLowerCase().includes(searchText) ||
//       employee.email.toLowerCase().includes(searchText) ||
//       employee.soDienThoai.includes(searchText);
//     const matchesStatus =
//       statusFilter.value === "tat-ca" ||
//       employee.idTaiKhoan.deleted === (statusFilter.value === "true");
//     return matchesSearch && matchesStatus;
//   });
// });
const filteredEmployees = computed(() => {
  return employees.value
    .filter((employee) => {
      const searchText = keyword.value.toLowerCase();
      const matchesSearch =
        (employee.ma || "").toLowerCase().includes(searchText) ||
        (employee.tenNhanVien || "").toLowerCase().includes(searchText) ||
        (employee.idTaiKhoan?.email || "").toLowerCase().includes(searchText) ||
        (employee.idTaiKhoan?.soDienThoai || "").includes(searchText);
      const matchesStatus =
        statusFilter.value === "tat-ca" ||
        employee.idTaiKhoan.deleted === (statusFilter.value === "true");
      return matchesSearch && matchesStatus;
    })
    .slice()
    .reverse(); // Đảo ngược danh sách
});

const formatAddress = (employee) => {
  if (!employee) return "Chưa có dữ liệu";

  const parts = [
    employee.diaChiCuThe || "",
    employee.phuong || "",
    employee.quan || "",
    employee.thanhPho || "",
  ].filter((part) => part && part.trim() !== "");

  return parts.length > 0 ? parts.join(", ") : "Chưa có dữ liệu";
};

onMounted(async () => {
  const data = await fetchNhanVien();
  employees.value = data;
});

const headers = [
  { value: "stt", text: "STT" },
  { value: "ma", text: "Mã Nhân Viên" },
  { value: "tenNhanVien", text: "Tên Nhân Viên" },
  { value: "email", text: "Email" },
  { value: "soDienThoai", text: "Số Điện Thoại" },
  { value: "diaChi", text: "Địa Chỉ" },
  { value: "trangThai", text: "Trạng Thái" },
  { value: "actions", text: "Hành Động" },
];

const debouncedSearch = debounce(async (value) => {
  keyword.value = value;
  currentPage.value = 1;

  try {
    const result = await Search(value);
    if (result.success) {
      employees.value = result.data;
    } else {
      toastNotification.value.addToast({
        type: "error",
        message: result.message || "Không tìm thấy nhân viên",
      });
      employees.value = [];
    }
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: "Đã xảy ra lỗi khi tìm kiếm nhân viên",
    });
    employees.value = [];
  }
}, 1);

const resetFilters = () => {
  keyword.value = "";
  statusFilter.value = "tat-ca";
  currentPage.value = 1;
  onMounted();
};

const getStatusBadgeClass = (status) => {
  return {
    "badge-waiting": status,
    "badge-canceled": !status,
  };
};

const viewEmployee = (employee) => {
  router.push(`/nhanVien/${employee.ma}`);
};

const editEmployee = (employee) => {
  router.push(`/nhanVien/form/${employee.id}`);
};

const confirmDeleteEmployee = (employee) => {
  notificationMessage.value = `Bạn có chắc chắn muốn xóa nhân viên ${employee.tenNhanVien}?`;
  notificationType.value = "confirm";
  notificationOnConfirm.value = () => deleteEmployee(employee);
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const deleteEmployee = (employee) => {
  employees.value = employees.value.filter((e) => e.ma !== employee.ma);
  toastNotification.value.addToast({
    type: "success",
    message: "Xóa nhân viên thành công!",
  });
  resetNotification();
};

const toggleEmployeeStatus = async (employee) => {
  const newDeleted = !employee.idTaiKhoan.deleted;
  const newStatus = newDeleted ? "Đang làm" : "Đã nghỉ";

  try {
    const taiKhoanId = employee.idTaiKhoan?.id;
    if (!taiKhoanId) {
      throw new Error("Không tìm thấy ID tài khoản của nhân viên");
    }

    const result = await trangThai(taiKhoanId);

    if (result.success) {
      employees.value = employees.value.map((e) =>
        e.id === employee.id
          ? {
              ...e,
              trangThai: newStatus,
              idTaiKhoan: { ...e.idTaiKhoan, deleted: newDeleted },
            }
          : e
      );

      toastNotification.value.addToast({
        type: "success",
        message: `Trạng thái của ${employee.tenNhanVien} đã được cập nhật thành ${newStatus}!`,
      });
    } else {
      throw new Error(result.message || "Cập nhật trạng thái thất bại");
    }
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: `Lỗi khi cập nhật trạng thái: ${error.message}`,
    });
    console.error("Lỗi khi cập nhật trạng thái:", error);
  }
};

const resetNotification = () => {
  notificationMessage.value = "";
  notificationType.value = "";
  notificationOnConfirm.value = null;
  notificationOnCancel.value = null;
};

const exportExcel = () => {
  if (filteredEmployees.value.length === 0) {
    toastNotification.value.addToast({
      type: "warning",
      message: "Không có dữ liệu để xuất!",
    });
    return;
  }

  try {
    const exportData = filteredEmployees.value.map((employee, index) => ({
      STT: index + 1,
      "Mã Nhân Viên": employee.ma,
      "Tên Nhân Viên": employee.tenNhanVien,
      Email: employee.idTaiKhoan?.email || "Chưa có dữ liệu",
      "Số Điện Thoại": employee.idTaiKhoan?.soDienThoai || "Chưa có dữ liệu",
      "Ngày Sinh": employee.ngaySinh
        ? new Date(employee.ngaySinh).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Chưa có dữ liệu",
      "Địa Chỉ Cụ Thể": employee.diaChiCuThe || "Chưa có dữ liệu",
      Phường: employee.phuong || "Chưa có dữ liệu",
      Quận: employee.quan || "Chưa có dữ liệu",
      "Thành Phố": employee.thanhPho || "Chưa có dữ liệu",
      "Trạng Thái": employee.idTaiKhoan?.deleted ? "Đang làm" : "Đã nghỉ",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Nhân Viên");

    worksheet["!cols"] = [
      { wch: 5 }, // STT
      { wch: 15 }, // Mã Nhân Viên
      { wch: 20 }, // Tên Nhân Viên
      { wch: 25 }, // Email
      { wch: 15 }, // Số Điện Thoại
      { wch: 15 }, // Ngày Sinh
      { wch: 30 }, // Địa Chỉ Cụ Thể
      { wch: 20 }, // Phường
      { wch: 20 }, // Quận
      { wch: 20 }, // Thành Phố
      { wch: 15 }, // Trạng Thái
    ];

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: R === 0 },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const timestamp = new Date()
      .toLocaleString("vi-VN")
      .replace(/[:/,\s]/g, "-");
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Danh_Sach_Nhan_Vien_${timestamp}.xlsx`);

    toastNotification.value.addToast({
      type: "success",
      message: "Xuất Excel thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    toastNotification.value.addToast({
      type: "error",
      message: "Đã xảy ra lỗi khi xuất Excel",
    });
  }
};

const downloadTemplate = () => {
  try {
    const templateData = [
      {
        STT: 1,
        "Mã Nhân Viên": "NV001",
        "Tên Nhân Viên": "Nguyễn Văn A",
        Email: "nguyenvana@example.com",
        "Số Điện Thoại": "0123456789",
        "Ngày Sinh": "01/01/1990",
        "Địa Chỉ Cụ Thể": "123 Đường Láng",
        "Thành Phố": "Hà Nội",
        Quận: "Đống Đa",
        Phường: "Láng Thượng",
        "Trạng Thái": "Đang làm",
      },
      {
        STT: 2,
        "Mã Nhân Viên": "NV002",
        "Tên Nhân Viên": "Trần Thị B",
        Email: "tranthib@example.com",
        "Số Điện Thoại": "0987654321",
        "Ngày Sinh": "15/05/1995",
        "Địa Chỉ Cụ Thể": "456 Lê Lợi",
        "Thành Phố": "TP Hồ Chí Minh",
        Quận: "Quận 1",
        Phường: "Bến Nghé",
        "Trạng Thái": "Đã nghỉ",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Nhân Viên");

    worksheet["!cols"] = [
      { wch: 5 }, // STT
      { wch: 15 }, // Mã Nhân Viên
      { wch: 20 }, // Tên Nhân Viên
      { wch: 25 }, // Email
      { wch: 15 }, // Số Điện Thoại
      { wch: 15 }, // Ngày Sinh
      { wch: 40 }, // Địa Chỉ Cụ Thể
      { wch: 15 }, // Thành Phố
      { wch: 15 }, // Quận
      { wch: 15 }, // Phường
      { wch: 15 }, // Trạng Thái
    ];

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E6F3E6" } },
        alignment: { horizontal: "center" },
      };
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Template_Nhan_Vien.xlsx");

    toastNotification.value.addToast({
      type: "success",
      message: "Tải template Excel thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi tải template Excel:", error);
    toastNotification.value.addToast({
      type: "error",
      message: "Đã xảy ra lỗi khi tải template Excel",
    });
  }
};

const handleExcelUpload = async (event) => {
  try {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) {
      toastNotification.value.addToast({
        type: "error",
        message: "Vui lòng chọn file Excel để nhập!",
      });
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toastNotification.value.addToast({
        type: "error",
        message: "Vui lòng chọn file Excel (.xlsx hoặc .xls)!",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          dateNF: "dd/mm/yyyy",
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: "dd/mm/yyyy",
        });

        const parseExcelDate = (value) => {
          if (!value) return null;

          if (typeof value === "number") {
            const date = new Date((value - 25569) * 86400 * 1000);
            if (isNaN(date.getTime())) {
              throw new Error(`Ngày không hợp lệ: ${value}`);
            }
            return date.toISOString().split("T")[0];
          }

          if (typeof value === "string") {
            const parts = value.split("/");
            if (parts.length === 3) {
              const [day, month, year] = parts.map(Number);
              const date = new Date(year, month - 1, day);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
              }
            }

            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split("T")[0];
            }
          }

          throw new Error(`Ngày không hợp lệ: ${value}`);
        };

        const nhanViens = jsonData.map((row, index) => {
          if (!row["Mã Nhân Viên"] || !row["Tên Nhân Viên"]) {
            throw new Error(
              `Dòng ${index + 2}: Thiếu Mã Nhân Viên hoặc Tên Nhân Viên`
            );
          }

          const employeeData = {
            ma: row["Mã Nhân Viên"]?.toString().trim() || "",
            tenNhanVien: row["Tên Nhân Viên"]?.toString().trim() || "",
            idTaiKhoan: {
              email: row["Email"]?.toString().trim() || "",
              soDienThoai: row["Số Điện Thoại"]?.toString().trim() || "",
              deleted: row["Trạng Thái"]?.toString().trim() === "Đang làm",
            },
            ngaySinh: parseExcelDate(row["Ngày Sinh"]),
            diaChiCuThe: row["Địa Chỉ Cụ Thể"]?.toString().trim() || "",
            thanhPho: row["Thành Phố"]?.toString().trim() || "",
            quan: row["Quận"]?.toString().trim() || "",
            phuong: row["Phường"]?.toString().trim() || "",
          };

          return employeeData;
        });

        const result = await importNhanVien(nhanViens);

        if (result.success) {
          employees.value = result.data || nhanViens;
          toastNotification.value.addToast({
            type: "success",
            message: `Nhập thành công ${nhanViens.length} nhân viên từ Excel!`,
          });
        } else {
          throw new Error(result.message || "Lỗi khi nhập dữ liệu từ Excel");
        }
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: error.message || "Đã xảy ra lỗi khi xử lý file Excel",
        });
        console.error("Lỗi khi xử lý file Excel:", error);
      } finally {
        fileInput.value = "";
      }
    };

    reader.onerror = () => {
      toastNotification.value.addToast({
        type: "error",
        message: "Lỗi khi đọc file Excel",
      });
      fileInput.value = "";
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: "Đã xảy ra lỗi khi nhập dữ liệu từ Excel",
    });
    console.error("Lỗi khi nhập Excel:", error);
    event.target.value = "";
  }
};
</script>

<style scoped>
/* Removed card view and table-controls related styles */
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
  0%,
  100% {
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

.search-group {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
  flex: 1;
  min-width: 0;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #1f3a44;
  cursor: pointer;
}

.radio-input {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #34d399;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.radio-input:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
}

.radio-input:focus {
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: space-between;
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
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

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #34d399;
}

.employee-name {
  font-weight: 500;
  color: #1f3a44;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  align-items: center;
}

.badge-waiting {
  background: #34d399;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #34d399;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.row.g-4 {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.row.g-4 > [class*="col-"] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (max-width: 992px) {
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .row.g-4 {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }

  .row.g-4 > [class*="col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .filter-label {
    font-size: 0.8rem;
  }

  .search-input {
    font-size: 0.85rem;
    padding: 0.5rem 0.5rem 0.5rem 2rem;
  }

  .search-icon {
    left: 0.75rem;
  }

  .radio-label {
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
