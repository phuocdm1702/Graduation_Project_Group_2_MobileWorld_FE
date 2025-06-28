<template>
  <div class="container-fluid py-4 customer-management">
    <HeaderCard
      title="Quản Lý Khách Hàng"
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
                  :value="keyword"
                  @input="debouncedSearch($event.target.value)"
                />
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Giới tính</label>
              <select class="form-control date-input" v-model="genderFilter">
                <option value="tat-ca">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng thái</label>
              <select class="form-control date-input" v-model="statusFilter">
                <option value="tat-ca">Tất cả</option>
                <option value="Kích hoạt">Kích hoạt</option>
                <option value="Hủy kích hoạt">Hủy kích hoạt</option>
              </select>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12" style="display: flex; align-items: center">
              <div class="filter-stats">
                <div class="stat-item d-flex gap-2">
                  <span class="stat-label">Tổng số khách hàng:</span>
                  <span
                    class="stat-value"
                    style="color: #15803d; font-weight: bold"
                    >{{ filteredCustomers.length }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-reset" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Đặt lại bộ lọc
            </button>
            <router-link to="/khachHang/form" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i>
              Thêm Khách Hàng
            </router-link>
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất Excel
            </button>
            <label for="import-excel" class="btn btn-action cursor-pointer">
              <i class="bi bi-file-earmark-excel me-2"></i>
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
              <i class="bi bi-file-earmark-excel me-2"></i>
              Tải mẫu Excel
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Khách Hàng" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count"
            >{{ filteredCustomers.length }} khách hàng</span
          >
        </div>
        <div class="table-controls">
          <div class="view-toggle">
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': viewMode === 'table',
                'btn-outline-secondary': viewMode !== 'table',
              }"
              @click="viewMode = 'table'"
            >
              <i class="bi bi-table"></i>
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': viewMode === 'card',
                'btn-outline-secondary': viewMode !== 'card',
              }"
              @click="viewMode = 'card'"
            >
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <div
          v-if="viewMode === 'table'"
          class="animate__animated animate__zoomIn"
        >
          <DataTable
            :headers="headers"
            :data="filteredCustomers"
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
            <template #ten="{ item }">
              <div class="customer-cell">
                <div class="customer-name">{{ item.ten }}</div>
              </div>
            </template>
            <template #soDienThoai="{ item }">
              <div class="customer-cell">
                <div class="customer-name">{{ item.idTaiKhoan.soDienThoai }}</div>
              </div>
            </template>
             <template #email="{ item }">
              <div class="customer-cell">
                <div class="customer-name">{{ item.idTaiKhoan.email }}</div>
              </div>
            </template>
            <template #diaChi="{ item }">
        <div class="customer-cell">
          <div class="customer-name">
            <span v-if="item.idDiaChiKhachHang && item.idDiaChiKhachHang.macDinh === true">
              {{ item.idDiaChiKhachHang.diaChiCuThe }},
              {{ item.idDiaChiKhachHang.thanhPho }},
              {{ item.idDiaChiKhachHang.quan }},
              {{ item.idDiaChiKhachHang.phuong }}
            </span>
            <span v-else>Không có địa chỉ</span>
          </div>
        </div>
      </template>
            <template #trangThai="{ item }">
              <span
                class="status-badge"
                :class="getStatusBadgeClass(item.idTaiKhoan.deleted)"
              >
                <i :class="getStatusIcon(item.idTaiKhoan.deleted)" class="me-1"></i>
                {{ item.idTaiKhoan.deleted ? "Kích Hoạt":"Đã Hủy" }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="action-buttons-cell d-flex gap-2">
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="item.idTaiKhoan.deleted"
                    @change="toggleCustomerStatus(item)"
                  />
                  <span class="slider round"></span>
                </label>
                <button
                  class="btn btn-sm btn-table"
                  @click="editCustomer(item)"
                  title="Chỉnh sửa"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                  class="btn btn-sm btn-table"
                  @click="confirmDeleteCustomer(item)"
                  title="Xóa"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else class="card-grid animate__animated animate__zoomIn">
          <div
            v-for="customer in paginatedCustomers"
            :key="customer.ma"
            class="customer-card"
          >
            <div class="invoice-card-header">
              <div class="invoice-code">{{ customer.ma }}</div>
              <span
                class="status-badge"
                :class="getStatusBadgeClass(customer.trangThai)"
              >
                {{ customer.trangThai }}
              </span>
            </div>
            <div class="invoice-card-body">
              <div class="customer-info">
                <div class="customer-name">{{ customer.ten }}</div>
              </div>
              <div class="customer-info">
                <div class="customer-phone">{{ customer.idTaiKhoan.soDienThoai }}</div>
              </div>
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ customer.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Địa chỉ:</span>
                  <span class="detail-value">{{ customer.diaChi }}</span>
                </div>
              </div>
            </div>
            <div class="invoice-card-actions">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="customer.trangThai === 'Kích hoạt'"
                  @change="toggleCustomerStatus(customer)"
                />
                <span class="slider round"></span>
              </label>
              <button
                class="btn btn-sm btn-table"
                @click="editCustomer(customer)"
              >
                <i class="bi bi-pen-fill me-1"></i> Sửa
              </button>
              <button
                class="btn btn-sm btn-table"
                @click="confirmDeleteCustomer(customer)"
              >
                <i class="bi bi-trash-fill me-1"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination for Card View -->
        <div v-if="viewMode === 'card'" class="card-pagination">
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link"
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button
                  class="page-link"
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
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
import { fetchKhachHang, trangThai,importKhachHang } from "../../store/modules/customers/khachHang";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const router = useRouter();
const keyword = ref("");
const genderFilter = ref("tat-ca");
const statusFilter = ref("tat-ca");
const viewMode = ref("table");
const currentPage = ref(1);
const pageSize = ref(10);
const notificationType = ref("");
const notificationMessage = ref("");
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(null);
const notificationOnCancel = ref(null);
const notificationModal = ref(null);
const toastNotification = ref(null);

const customers = ref([]);

const filteredCustomers = computed(() => {
  return customers.value.filter((customer) => {
    const searchText = keyword.value.toLowerCase();
    const matchesSearch =
      customer.ma.toLowerCase().includes(searchText) ||
      customer.ten.toLowerCase().includes(searchText) ||
      customer.email.toLowerCase().includes(searchText) ||
      customer.soDienThoai.includes(searchText);
    const matchesStatus =
      statusFilter.value === "tat-ca" ||
      customer.trangThai === statusFilter.value;
    const matchesGender =
      genderFilter.value === "tat-ca" ||
      customer.gioiTinh === genderFilter.value;
    return matchesSearch && matchesStatus && matchesGender;
  });
});

onMounted(async () => {
  const data = await fetchKhachHang();
  customers.value = data;

});

const totalPages = computed(() =>
  Math.ceil(filteredCustomers.value.length / pageSize.value)
);

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCustomers.value.slice(start, start + pageSize.value);
});

const headers = [
  { value: "stt", text: "STT" },
  { value: "ma", text: "Mã Khách Hàng" },
  { value: "ten", text: "Tên Khách Hàng" },
   { value: "soDienThoai", text: "Số Điện Thoại" },
  { value: "email", text: "Email" },
  { value: "diaChi", text: "Địa Chỉ" },
  { value: "trangThai", text: "Trạng Thái" },
  { value: "actions", text: "Hành Động" },
];

const debouncedSearch = debounce((value) => {
  keyword.value = value;
  currentPage.value = 1;
}, 300);


const resetFilters = () => {
  keyword.value = "";
  genderFilter.value = "tat-ca";
  statusFilter.value = "tat-ca";
  currentPage.value = 1;
};

const getStatusBadgeClass = (status) => {
  return {
    "badge-waiting": status,
    "badge-canceled": !status,
  };
};

const getStatusIcon = (status) => {
  return {
    "bi bi-check-circle": status,
    "bi bi-x-circle": !status,
  };
};

const editCustomer = (customer) => {
  router.push(`/khachHang/form/${customer.id}`);
};

const confirmDeleteCustomer = (customer) => {
  notificationMessage.value = `Bạn có chắc chắn muốn xóa khách hàng ${customer.ten}?`;
  notificationType.value = "confirm";
  notificationOnConfirm.value = () => deleteCustomer(customer);
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const deleteCustomer = (customer) => {
  customers.value = customers.value.filter((c) => c.ma !== customer.ma);
  toastNotification.value.addToast({
    type: "success",
    message: "Xóa khách hàng thành công!",
  });
  resetNotification();
};

const toggleCustomerStatus = async (customer) => {
  const newDeleted = !customer.idTaiKhoan.deleted; 
  const newStatus = newDeleted ? "Kích Hoạt" : "Đã Hủy";

  try {
    const taiKhoanId = customer.idTaiKhoan?.id;
    if (!taiKhoanId) {
      throw new Error("Không tìm thấy ID tài khoản của khách hàng");
    }

    const result = await trangThai(taiKhoanId);

    if (result.success) {
      customers.value = customers.value.map((e) =>
        e.id === customer.id
          ? {
              ...e,
              trangThai: newStatus,
              idTaiKhoan: { ...e.idTaiKhoan, deleted: newDeleted },
            }
          : e
      );

      toastNotification.value.addToast({
        type: "success",
        message: `Trạng thái của ${customer.ten} đã được cập nhật thành ${newStatus}!`,
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
  if (!customers.value.length) {
    toastNotification.value.addToast({
      type: "warning",
      message: "Không có dữ liệu khách hàng để xuất!",
    });
    return;
  }

  try {
    const exportData = customers.value.map((customer, index) => ({
      STT: index + 1,
      "Mã Khách Hàng": customer.ma || "N/A",
      "Tên Khách Hàng": customer.ten || "N/A",
      "Email": customer.idTaiKhoan?.email || "N/A",
      "Số Điện Thoại": customer.idTaiKhoan?.soDienThoai || "N/A",
      "Giới Tính": customer.gioiTinh === false ? "Nam" : 
                    customer.gioiTinh === true ? "Nữ" : "N/A",
      "Ngày Sinh": customer.ngaySinh ? 
        new Date(customer.ngaySinh).toLocaleDateString("vi-VN") : "N/A",
      "CCCD": customer.cccd || "N/A",
      "Địa Chỉ Cụ Thể": customer.idDiaChiKhachHang?.macDinh ? 
        customer.idDiaChiKhachHang.diaChiCuThe || "N/A" : "N/A",
      "Phường": customer.idDiaChiKhachHang?.macDinh ? 
        customer.idDiaChiKhachHang.phuong || "N/A" : "N/A",
      "Quận": customer.idDiaChiKhachHang?.macDinh ? 
        customer.idDiaChiKhachHang.quan || "N/A" : "N/A",
      "Thành Phố": customer.idDiaChiKhachHang?.macDinh ? 
        customer.idDiaChiKhachHang.thanhPho || "N/A" : "N/A",
      "Trạng Thái": customer.idTaiKhoan?.deleted === false ? "Kích Hoạt" : "Đã Hủy",
      "Ảnh Khách Hàng": customer.anhKhachHang || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    // Đặt độ rộng cột
    worksheet["!cols"] = [
      { wch: 5 },  // STT
      { wch: 15 }, // Mã Khách Hàng
      { wch: 20 }, // Tên Khách Hàng
      { wch: 25 }, // Email
      { wch: 15 }, // Số Điện Thoại
      { wch: 10 }, // Giới Tính
      { wch: 15 }, // Ngày Sinh
      { wch: 15 }, // CCCD
      { wch: 30 }, // Địa Chỉ Cụ Thể
      { wch: 20 }, // Phường
      { wch: 20 }, // Quận
      { wch: 20 }, // Thành Phố
      { wch: 15 }, // Trạng Thái
      { wch: 30 }, // Ảnh Khách Hàng
    ];

    // Áp dụng định dạng cho tiêu đề và ô
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "KhachHang");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const timestamp = new Date().toLocaleString("vi-VN").replace(/[:/,\s]/g, "-");
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Danh_Sach_Khach_Hang_${timestamp}.xlsx`);

    toastNotification.value.addToast({
      type: "success",
      message: "Xuất file Excel thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    toastNotification.value.addToast({
      type: "error",
      message: `Lỗi khi xuất file Excel: ${error.message}`,
    });
  }
};

const downloadTemplate = () => {
  toastNotification.value.addToast({
    type: "success",
    message: "Tải template Excel thành công!",
  });
};

const handleExcelUpload = async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) {
      toastNotification.value.addToast({
        type: "error",
        message: "Vui lòng chọn file Excel!",
      });
      return;
    }

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toastNotification.value.addToast({
        type: "error",
        message: "Chỉ hỗ trợ file Excel (.xlsx hoặc .xls)!",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true, dateNF: "dd/mm/yyyy" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: "dd/mm/yyyy" });

        const khachHangs = jsonData.map((row, index) => {
          // Xác thực các trường bắt buộc
          if (!row["Mã Khách Hàng"] || !row["Tên Khách Hàng"] || !row["Email"]) {
            throw new Error(`Dòng ${index + 2}: Thiếu Mã Khách Hàng, Tên Khách Hàng hoặc Email`);
          }

          // Xác thực trạng thái
          const trangThai = row["Trạng Thái"]?.toString().trim();
          if (trangThai && !["Kích Hoạt", "Đã Hủy"].includes(trangThai)) {
            throw new Error(`Dòng ${index + 2}: Trạng Thái phải là 'Kích Hoạt' hoặc 'Đã Hủy'`);
          }

          // Xác thực giới tính
          const gioiTinh = row["Giới Tính"]?.toString().trim();
          if (gioiTinh && !["Nam", "Nữ"].includes(gioiTinh)) {
            throw new Error(`Dòng ${index + 2}: Giới Tính phải là 'Nam' hoặc 'Nữ'`);
          }

          // Xử lý ngày sinh
          let ngaySinh = null;
          if (row["Ngày Sinh"]) {
            const parsedDate = new Date(row["Ngày Sinh"]);
            if (isNaN(parsedDate.getTime())) {
              throw new Error(`Dòng ${index + 2}: Ngày Sinh không hợp lệ`);
            }
            ngaySinh = parsedDate.toISOString();
          }

          // Xác thực CCCD
          const cccd = row["CCCD"]?.toString().trim();
          if (cccd && !/^\d{12}$/.test(cccd)) {
            throw new Error(`Dòng ${index + 2}: CCCD phải là 12 chữ số`);
          }

          // Xác thực email
          const email = row["Email"]?.toString().trim();
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error(`Dòng ${index + 2}: Email không hợp lệ`);
          }

          // Xác thực số điện thoại
          const soDienThoai = row["Số Điện Thoại"]?.toString().trim();
          if (soDienThoai && !/^\d{10}$/.test(soDienThoai)) {
            throw new Error(`Dòng ${index + 2}: Số điện thoại phải là 10 chữ số`);
          }

          return {
            ma: row["Mã Khách Hàng"].toString().trim(),
            tenKH: row["Tên Khách Hàng"].toString().trim(),
            email: email || "",
            soDienThoai: soDienThoai || "",
            userName: row["Tên Đăng Nhập"]?.toString().trim() || email,
            gioiTinh: gioiTinh === "Nam" ? false : gioiTinh === "Nữ" ? true : null,
            ngaySinh: ngaySinh,
            cccd: cccd || null,
            diaChiCuThe: row["Địa Chỉ Cụ Thể"]?.toString().trim() || "",
            phuong: row["Phường"]?.toString().trim() || "",
            quan: row["Quận"]?.toString().trim() || "",
            thanhPho: row["Thành Phố"]?.toString().trim() || "",
            createdAt: row["Ngày Tạo"] ? new Date(row["Ngày Tạo"]).toISOString() : new Date().toISOString(),
            deleted: trangThai === "Kích Hoạt" ? false : true,
          };
        });

        const result = await importKhachHang(khachHangs);
        if (result.success) {
          // Cập nhật danh sách khách hàng
          const data = await fetchKhachHang();
          customers.value = data;
          toastNotification.value.addToast({
            type: "success",
            message: `Nhập thành công ${khachHangs.length} khách hàng từ Excel!`,
          });
        } else {
          throw new Error(result.message || "Lỗi khi nhập dữ liệu từ Excel");
        }
      } catch (error) {
        console.error("Lỗi khi xử lý file Excel:", error);
        toastNotification.value.addToast({
          type: "error",
          message: `Lỗi khi xử lý file Excel: ${error.message}`,
        });
      } finally {
        event.target.value = ""; // Reset input file
      }
    };

    reader.onerror = () => {
      toastNotification.value.addToast({
        type: "error",
        message: "Lỗi khi đọc file Excel",
      });
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Lỗi khi nhập Excel:", error);
    toastNotification.value.addToast({
      type: "error",
      message: `Lỗi khi nhập dữ liệu từ Excel: ${error.message}`,
    });
    event.target.value = "";
  }
};

</script>

<style scoped>
/* Animations */
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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
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

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.customer-management {
  min-height: 100vh;
  padding: 1rem;
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

.search-input,
.date-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
  flex: 1;
  min-width: 0;
}

.search-input:focus,
.date-input:focus {
  border-color: #34d399;
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
  border-bottom: 1px solid rgba(45, 212, 191, 0.1);
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

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.view-toggle .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-toggle .btn-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border: none;
}

.view-toggle .btn-primary:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.view-toggle .btn-outline-secondary {
  border: 1px solid rgba(45, 212, 191, 0.2);
  color: #1f3a44;
}

.view-toggle .btn-outline-secondary:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #34d399;
}

.customer-cell {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.75rem;
  color: #6c757d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  width: 130px;
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

.card-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.customer-card {
  background: #f8f9fa;
  border: 1px solid rgba(45, 212, 191, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.customer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(45, 212, 191, 0.2);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(45, 212, 191, 0.1);
}

.invoice-code {
  font-weight: 600;
  color: #34d399;
}

.invoice-card-body {
  padding: 1rem;
}

.customer-info {
  margin-bottom: 1rem;
}

.customer-name {
  font-weight: 600;
  color: #1f3a44;
}

.customer-phone {
  font-size: 0.875rem;
  color: #6c757d;
}

.invoice-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
  color: #1f3a44;
}

.invoice-card-actions {
  padding: 1rem;
  border-top: 1px solid rgba(45, 212, 191, 0.1);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.card-pagination {
  padding: 1.5rem;
}

.page-item .page-link {
  border-radius: 8px;
  margin: 0 0.25rem;
  color: #1f3a44;
  border: 1px solid rgba(45, 212, 191, 0.2);
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-color: #34d399;
  color: white;
}

.page-item:not(.disabled) .page-link:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  border-color: #16a34a;
  color: white;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: rgba(52, 211, 153, 0.2);
  color: #6c757d;
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

  .search-input,
  .date-input {
    font-size: 0.85rem;
    padding: 0.5rem 0.5rem 0.5rem 2rem;
  }

  .search-icon {
    left: 0.75rem;
  }
}

@media (max-width: 576px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
