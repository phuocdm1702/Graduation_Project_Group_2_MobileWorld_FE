<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Phiếu Giảm Giá' : 'Thêm Phiếu Giảm Giá'"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <div class="row">
      <!-- Form Phiếu Giảm Giá -->
      <div class="col-lg-6">
        <FilterTableSection
          :title="isEditMode ? 'Cập Nhật Phiếu Giảm Giá' : 'Thêm Phiếu Giảm Giá'"
          icon="bi bi-plus-circle"
        >
          <form @submit.prevent="submitForm" class="p-3">
            <div class="mb-3">
              <label class="filter-label">Mã Phiếu</label>
              <input
                v-model="formData.ma"
                type="text"
                class="form-control date-input"
                placeholder="Nhập mã phiếu"
                :disabled="!isEditMode"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Tên</label>
              <input
                v-model="formData.tenPhieuGiamGia"
                type="text"
                class="form-control date-input"
                placeholder="Nhập tên phiếu"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Loại</label>
              <select
                v-model="formData.loaiPhieuGiamGia"
                class="form-control date-input"
                required
              >
                <option value="" disabled>Chọn loại</option>
                <option value="Phần trăm">Phần trăm</option>
                <option value="Tiền mặt">Tiền mặt</option>
              </select>
            </div>
            <div class="mb-3" v-if="formData.loaiPhieuGiamGia === 'Phần trăm'">
              <label class="filter-label">Phần trăm giảm giá</label>
              <input
                v-model.number="formData.phanTramGiamGia"
                type="number"
                class="form-control date-input"
                placeholder="Nhập phần trăm giảm giá"
                required
              />
            </div>
            <div class="mb-3" v-if="formData.loaiPhieuGiamGia === 'Tiền mặt'">
              <label class="filter-label">Số tiền giảm tối đa</label>
              <div class="input-group">
                <input
                  v-model="formData.soTienGiamToiDa"
                  type="text"
                  class="form-control date-input"
                  placeholder="Nhập số tiền giảm tối đa"
                  required
                  @input="updateSoTienGiamToiDa"
                />
                <span class="input-group-text">VND</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="filter-label">Hóa đơn tối thiểu</label>
              <div class="input-group">
                <input
                  v-model="formData.hoaDonToiThieu"
                  type="text"
                  class="form-control date-input"
                  placeholder="Nhập hóa đơn tối thiểu"
                  required
                  @input="updateHoaDonToiThieu"
                />
                <span class="input-group-text">VND</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="filter-label">Số lượng</label>
              <input
                v-model.number="formData.soLuongDung"
                type="number"
                class="form-control date-input"
                placeholder="Nhập số lượng (-1 cho không giới hạn)"
                :disabled="formData.riengTu"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày bắt đầu</label>
              <input
                v-model="formData.ngayBatDau"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày kết thúc</label>
              <input
                v-model="formData.ngayKetThuc"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Mô tả</label>
              <input
                v-model="formData.moTa"
                type="text"
                class="form-control date-input"
                placeholder="Nhập mô tả"
              />
            </div>
            <div class="mb-3 form-check">
              <input
                v-model="formData.riengTu"
                type="checkbox"
                class="form-check-input"
                id="riengTu"
              />
              <label class="form-check-label" for="riengTu">Riêng tư</label>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-action flex-fill">
                <i class="bi bi-plus-circle me-2"></i>
                {{ isEditMode ? "Cập Nhật" : "Thêm" }}
              </button>
              <button
                type="button"
                class="btn btn-secondary flex-fill"
                @click="goBack"
              >
                Quay Về
              </button>
            </div>
          </form>
        </FilterTableSection>
      </div>

      <!-- Chọn Khách Hàng -->
      <div class="col-lg-6">
        <FilterTableSection title="Chọn Khách Hàng" icon="bi bi-people">
          <div class="p-3" :class="{ 'disabled-section': !formData.riengTu }">
            <div class="mb-3">
              <label class="filter-label">Tìm kiếm khách hàng</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  v-model="searchCustomer"
                  type="text"
                  class="form-control search-input"
                  placeholder="Tìm theo mã hoặc tên..."
                  @input="debouncedSearchCustomer"
                  :disabled="!formData.riengTu"
                />
              </div>
            </div>
            <div
              class="customer-list"
              style="max-height: 250px; overflow-y: auto"
            >
              <div
                v-for="customer in filteredCustomers"
                :key="customer.id"
                class="customer-item d-flex justify-content-between align-items-center p-2 mb-2"
                :class="{ selected: selectedCustomers.includes(customer.id) }"
                @click="formData.riengTu && toggleCustomerSelection(customer.id)"
              >
                <span>{{ customer.ma }} - {{ customer.ten }}</span>
                <span>{{ customer.gioiTinh == 1 ? "Nam" : "Nữ" }}</span>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Danh Sách Khách Hàng Đã Chọn -->
        <FilterTableSection
          title="Khách Hàng Đã Chọn"
          icon="bi bi-check-circle"
          class="mt-4"
        >
          <div class="p-3">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Tên Khách Hàng</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in selectedCustomersData" :key="customer.id">
                  <td>{{ customer.ma }}</td>
                  <td>{{ customer.ten }}</td>
                  <td>{{ customer.gioiTinh == 1 ? "Nam" : "Nữ" }}</td>
                  <td>{{ formatDate(customer.ngaySinh) }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-table"
                      @click="formData.riengTu && removeCustomer(customer.id)"
                      title="Xóa"
                      :disabled="!formData.riengTu"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-if="selectedCustomersData.length === 0"
              class="text-muted text-center"
            >
              Chưa có khách hàng nào được chọn
            </p>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";
import HeaderCard from "@/components/common/HeaderCard.vue";
import FilterTableSection from "@/components/common/FilterTableSection.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import {
  fetchCustomers,
  searchCustomers,
  addVoucher,
  getVoucherDetail,
  updateVoucher,
} from "./usePGG";

export default {
  name: "PhieuGiamGiaForm",
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Form Data
    const formData = ref({
      ma: "",
      tenPhieuGiamGia: "",
      loaiPhieuGiamGia: "",
      phanTramGiamGia: 0,
      soTienGiamToiDa: 0,
      hoaDonToiThieu: 0,
      soLuongDung: -1,
      ngayBatDau: "",
      ngayKetThuc: "",
      moTa: "",
      riengTu: false,
      customerIds: [],
    });

    const searchCustomer = ref("");
    const customers = ref([]);
    const selectedCustomers = ref([]);
    const toastNotification = ref(null);

    const formattedSoTienGiamToiDa = computed({
      get() {
        return formData.value.soTienGiamToiDa
          ? formData.value.soTienGiamToiDa.toLocaleString("vi-VN")
          : "";
      },
      set(value) {
        const rawValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
        formData.value.soTienGiamToiDa = rawValue;
      },
    });

    const formattedHoaDonToiThieu = computed({
      get() {
        return formData.value.hoaDonToiThieu
          ? formData.value.hoaDonToiThieu.toLocaleString("vi-VN")
          : "";
      },
      set(value) {
        const rawValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
        formData.value.hoaDonToiThieu = rawValue;
      },
    });

    // Computed
    const isEditMode = computed(() => !!route.params.id);

    const filteredCustomers = computed(() => {
      return customers.value.filter((customer) => {
        const maKhachHang = customer.maKhachHang || "";
        const tenKhachHang = customer.ten || "";
        const searchTerm = searchCustomer.value.toLowerCase();
        return (
          maKhachHang.toLowerCase().includes(searchTerm) ||
          tenKhachHang.toLowerCase().includes(searchTerm)
        );
      });
    });

    const selectedCustomersData = computed(() => {
      return customers.value.filter((customer) =>
        selectedCustomers.value.includes(customer.id)
      );
    });

    // Generate random code for ma field
    const generateRandomCode = () => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomCode = "PGG_";
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters[randomIndex];
      }
      return randomCode;
    };

    // Set random code when not in edit mode
    onMounted(() => {
      if (!isEditMode.value) {
        formData.value.ma = generateRandomCode();
      }
      loadCustomers();
      loadVoucherData();
    });

    // Watch for changes in riengTu or selectedCustomers to update soLuongDung
    watch(
      () => [formData.value.riengTu, selectedCustomers.value],
      ([riengTu, selectedCustomers]) => {
        if (riengTu) {
          formData.value.soLuongDung = selectedCustomers.length;
          formData.value.customerIds = selectedCustomers;
        } else {
          formData.value.soLuongDung = -1;
          formData.value.customerIds = [];
          selectedCustomers.value = [];
        }
      },
      { deep: true }
    );

    // Methods
    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const loadCustomers = async () => {
      try {
        const response = await fetchCustomers();
        customers.value = response.data;
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: "Lỗi khi tải danh sách khách hàng!",
        });
      }
    };

    const loadVoucherData = async () => {
      if (isEditMode.value) {
        try {
          const response = await getVoucherDetail(route.params.id);
          const voucher = response.data;
          formData.value = {
            ma: voucher.ma,
            tenPhieuGiamGia: voucher.tenPhieuGiamGia,
            loaiPhieuGiamGia: voucher.loaiPhieuGiamGia,
            phanTramGiamGia: voucher.phanTramGiamGia || 0,
            soTienGiamToiDa: voucher.soTienGiamToiDa || 0,
            hoaDonToiThieu: voucher.hoaDonToiThieu,
            soLuongDung: voucher.soLuongDung,
            ngayBatDau: new Date(voucher.ngayBatDau).toISOString().split("T")[0],
            ngayKetThuc: new Date(voucher.ngayKetThuc).toISOString().split("T")[0],
            moTa: voucher.moTa,
            riengTu: voucher.riengTu === 1,
            customerIds: voucher.customerIds || [],
          };
          selectedCustomers.value = voucher.customerIds || [];
          // Ensure soLuongDung is updated based on riengTu and selected customers
          if (formData.value.riengTu) {
            formData.value.soLuongDung = selectedCustomers.value.length;
          }
        } catch (error) {
          toastNotification.value.addToast({
            type: "error",
            message: "Không tìm thấy phiếu giảm giá!",
          });
        }
      }
    };

    const debouncedSearchCustomer = debounce(async (value) => {
      searchCustomer.value = value;
      if (value.trim() && formData.value.riengTu) {
        try {
          const response = await searchCustomers(value);
          customers.value = response.data;
        } catch (error) {
          toastNotification.value.addToast({
            type: "error",
            message: "Lỗi khi tìm kiếm khách hàng!",
          });
        }
      } else {
        loadCustomers();
      }
    }, 300);

    const toggleCustomerSelection = (id) => {
      const index = selectedCustomers.value.indexOf(id);
      if (index === -1) {
        selectedCustomers.value.push(id);
      } else {
        selectedCustomers.value.splice(index, 1);
      }
      formData.value.customerIds = selectedCustomers.value;
    };

    const removeCustomer = (id) => {
      selectedCustomers.value = selectedCustomers.value.filter(
        (cid) => cid !== id
      );
      formData.value.customerIds = selectedCustomers.value;
      toastNotification.value.addToast({
        type: "success",
        message: "Đã xóa khách hàng!",
      });
    };

    const submitForm = async () => {
      // Validation
      if (
        !formData.value.ma ||
        !formData.value.tenPhieuGiamGia ||
        !formData.value.loaiPhieuGiamGia ||
        (formData.value.loaiPhieuGiamGia === "Phần trăm" &&
          !formData.value.phanTramGiamGia) ||
        (formData.value.loaiPhieuGiamGia === "Tiền mặt" &&
          !formData.value.soTienGiamToiDa) ||
        !formData.value.hoaDonToiThieu ||
        !formData.value.ngayBatDau ||
        !formData.value.ngayKetThuc
      ) {
        toastNotification.value.addToast({
          type: "error",
          message: "Vui lòng điền đầy đủ thông tin!",
        });
        return;
      }

      if (
        formData.value.riengTu &&
        (!formData.value.customerIds || formData.value.customerIds.length === 0)
      ) {
        toastNotification.value.addToast({
          type: "error",
          message: "Vui lòng chọn ít nhất một khách hàng cho phiếu riêng tư!",
        });
        return;
      }

      const payload = {
        ma: formData.value.ma,
        tenPhieuGiamGia: formData.value.tenPhieuGiamGia,
        loaiPhieuGiamGia: formData.value.loaiPhieuGiamGia,
        phanTramGiamGia:
          formData.value.loaiPhieuGiamGia === "Phần trăm"
            ? formData.value.phanTramGiamGia
            : 0,
        soTienGiamToiDa:
          formData.value.loaiPhieuGiamGia === "Tiền mặt"
            ? formData.value.soTienGiamToiDa
            : 0,
        hoaDonToiThieu: formData.value.hoaDonToiThieu,
        soLuongDung: formData.value.soLuongDung,
        ngayBatDau: new Date(formData.value.ngayBatDau),
        ngayKetThuc: new Date(formData.value.ngayKetThuc),
        moTa: formData.value.moTa,
        riengTu: formData.value.riengTu ? 1 : 0,
        customerIds: formData.value.riengTu ? formData.value.customerIds : [],
      };

      try {
        if (isEditMode.value) {
          await updateVoucher(route.params.id, payload);
          toastNotification.value.addToast({
            type: "success",
            message: "Cập nhật phiếu giảm giá thành công!",
          });
        } else {
          await addVoucher(payload);
          toastNotification.value.addToast({
            type: "success",
            message: "Thêm phiếu giảm giá thành công!",
          });
        }
        goBack();
      } catch (error) {
        toastNotification.value.addToast({
          type: "error",
          message: `Lỗi: ${
            error.response?.data || "Không thể lưu phiếu giảm giá!"
          }`,
        });
      }
    };

    const goBack = () => {
      router.push("/phieuGiamGia");
    };

    return {
      formData,
      searchCustomer,
      customers,
      selectedCustomers,
      toastNotification,
      isEditMode,
      filteredCustomers,
      selectedCustomersData,
      debouncedSearchCustomer,
      toggleCustomerSelection,
      removeCustomer,
      submitForm,
      goBack,
      formatDate,
    };
  },
};
</script>

<style scoped>
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

.form-control.date-input {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #fff;
}

.form-control.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.form-control:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
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
  background: #fff;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.customer-list {
  max-height: 250px;
  overflow-y: auto;
}

.customer-item {
  background: #fff;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-item:hover,
.customer-item.selected {
  background: #34d399;
  color: white;
}

.disabled-section .customer-item {
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled-section .customer-item:hover {
  background: #fff;
  color: inherit;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: #5a6268;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-table:disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.table {
  background: #fff;
}

.table th,
.table td {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .col-lg-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>