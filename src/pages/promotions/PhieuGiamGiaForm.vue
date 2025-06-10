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
        <FilterTableSection :title="isEditMode ? 'Cập Nhật Phiếu Giảm Giá' : 'Thêm Phiếu Giảm Giá'" icon="bi bi-plus-circle">
          <form @submit.prevent="submitForm" class="p-3">
            <div class="mb-3">
              <label class="filter-label">Mã Phiếu</label>
              <input
                v-model="formData.code"
                type="text"
                class="form-control date-input"
                placeholder="Nhập mã phiếu"
                required
                :disabled="isEditMode"
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Tên</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control date-input"
                placeholder="Nhập tên phiếu"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Loại</label>
              <select v-model="formData.type" class="form-control date-input" required>
                <option value="" disabled>Chọn loại</option>
                <option value="Phần trăm">Phần trăm</option>
                <option value="Tiền mặt">Tiền mặt</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="filter-label">Phần trăm / Giá trị</label>
              <input
                v-model.number="formData.value"
                type="number"
                class="form-control date-input"
                placeholder="Nhập giá trị"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Số lượng</label>
              <input
                v-model.number="formData.quantity"
                type="number"
                class="form-control date-input"
                placeholder="Nhập số lượng"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày bắt đầu</label>
              <input
                v-model="formData.startDate"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày kết thúc</label>
              <input
                v-model="formData.endDate"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ghi Chú</label>
              <input
                v-model="formData.note"
                type="text"
                class="form-control date-input"
                placeholder="Nhập ghi chú"
              />
            </div>
            <div class="mb-3 form-check">
              <input
                v-model="formData.isActive"
                type="checkbox"
                class="form-check-input"
                id="active"
              />
              <label class="form-check-label" for="active">Riêng Tư</label>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-action flex-fill">
                <i class="bi bi-plus-circle me-2"></i> {{ isEditMode ? 'Cập Nhật' : 'Thêm' }}
              </button>
              <button type="button" class="btn btn-secondary flex-fill" @click="goBack">
                Quay Về
              </button>
            </div>
          </form>
        </FilterTableSection>
      </div>

      <!-- Chọn Khách Hàng -->
      <div class="col-lg-6">
        <FilterTableSection title="Chọn Khách Hàng" icon="bi bi-people">
          <div class="p-3">
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
                  :disabled="!formData.isActive"
                />
              </div>
            </div>
            <div class="customer-list" style="max-height: 250px; overflow-y: auto;">
              <div
                v-for="customer in filteredCustomers"
                :key="customer.id"
                class="customer-item d-flex justify-content-between align-items-center p-2 mb-2"
                :class="{ 'selected': selectedCustomers.includes(customer.id) }"
                @click="toggleCustomerSelection(customer.id)"
              >
                <span>{{ customer.code }} - {{ customer.name }}</span>
                <span>{{ customer.gender }}</span>
              </div>
            </div>
          </div>
        </FilterTableSection>

        <!-- Danh Sách Khách Hàng Đã Chọn -->
        <FilterTableSection title="Khách Hàng Đã Chọn" icon="bi bi-check-circle" class="mt-4">
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
                  <td>{{ customer.code }}</td>
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.gender }}</td>
                  <td>{{ customer.birthDate }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-table"
                      @click="removeCustomer(customer.id)"
                      title="Xóa"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="selectedCustomersData.length === 0" class="text-muted text-center">
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
import { ref, computed, onMounted } from 'vue';
import { debounce } from 'lodash';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

export default {
  name: 'PhieuGiamGiaForm',
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const apiBaseUrl = 'http://localhost:8080/api'; // Thay bằng URL backend thực tế

    // Form Data
    const formData = ref({
      id: null,
      code: '',
      name: '',
      type: '',
      value: 0,
      quantity: 0,
      startDate: '',
      endDate: '',
      note: '',
      isActive: false,
    });

    const searchCustomer = ref('');
    const customers = ref([]);
    const selectedCustomers = ref([]);
    const toastNotification = ref(null);

    // Computed
    const isEditMode = computed(() => !!route.params.id);

    const filteredCustomers = computed(() => {
      return customers.value.filter((customer) =>
        customer.code.toLowerCase().includes(searchCustomer.value.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchCustomer.value.toLowerCase())
      );
    });

    const selectedCustomersData = computed(() => {
      return customers.value.filter((customer) => selectedCustomers.value.includes(customer.id));
    });

    // Methods
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/data-kh`);
        customers.value = response.data || [];
      } catch (error) {
        console.error('Error fetching customers:', error);
        customers.value = [];
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách khách hàng!',
        });
      }
    };

    const loadVoucherData = async () => {
      if (isEditMode.value) {
        const voucherId = parseInt(route.params.id);
        try {
          const response = await axios.get(`${apiBaseUrl}/phieu-giam-gia/${voucherId}`);
          const voucher = response.data;
          formData.value = {
            id: voucher.id,
            code: voucher.ma,
            name: voucher.tenPhieuGiamGia,
            type: voucher.loaiPhieuGiamGia,
            value: voucher.loaiPhieuGiamGia === 'Phần trăm' ? voucher.phanTramGiamGia : voucher.soTienGiamToiDa,
            quantity: voucher.soLuongDung,
            startDate: new Date(voucher.ngayBatDau).toISOString().split('T')[0],
            endDate: new Date(voucher.ngayKetThuc).toISOString().split('T')[0],
            note: voucher.moTa || '',
            isActive: voucher.riengTu,
          };

          // Sử dụng selectedCustomers từ phản hồi
          if (voucher.selectedCustomers && Array.isArray(voucher.selectedCustomers)) {
            selectedCustomers.value = voucher.selectedCustomers.map(customer => customer.id);
          } else {
            selectedCustomers.value = [];
            toastNotification.value.addToast({
              type: 'warning',
              message: 'Không tìm thấy danh sách khách hàng, tiếp tục với danh sách rỗng.',
            });
          }
        } catch (error) {
          console.error('Error loading voucher data:', error);
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy phiếu giảm giá!',
          });
        }
      } else {
        // Tạo mã ngẫu nhiên cho phiếu mới
        formData.value.code = `PGG_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      }
    };

    const debouncedSearchCustomer = debounce((value) => {
      searchCustomer.value = value;
    }, 300);

    const toggleCustomerSelection = (id) => {
      const index = selectedCustomers.value.indexOf(id);
      if (index === -1) {
        selectedCustomers.value.push(id);
      } else {
        selectedCustomers.value.splice(index, 1);
      }
    };

    const removeCustomer = (id) => {
      selectedCustomers.value = selectedCustomers.value.filter((cid) => cid !== id);
      toastNotification.value.addToast({
        type: 'success',
        message: 'Đã xóa khách hàng!',
      });
    };

    const submitForm = async () => {
      if (!formData.value.code || !formData.value.name || !formData.value.type || formData.value.value == null || formData.value.quantity == null || !formData.value.startDate || !formData.value.endDate) {
        toastNotification.value.addToast({
          type: 'error',
          message: 'Vui lòng điền đầy đủ thông tin!',
        });
        return;
      }

      const payload = {
        ma: formData.value.code,
        tenPhieuGiamGia: formData.value.name,
        loaiPhieuGiamGia: formData.value.type,
        phanTramGiamGia: formData.value.type === 'Phần trăm' ? formData.value.value : 0,
        soTienGiamToiDa: formData.value.type === 'Tiền mặt' ? formData.value.value : 0,
        soLuongDung: formData.value.quantity,
        ngayBatDau: formData.value.startDate,
        ngayKetThuc: formData.value.endDate,
        moTa: formData.value.note,
        trangThai: formData.value.isActive,
        riengTu: formData.value.isActive,
        customerIds: formData.value.isActive ? selectedCustomers.value : [],
      };

      try {
        if (isEditMode.value) {
          await axios.put(`${apiBaseUrl}/update-phieu-giam-gia/${formData.value.id}`, payload);
          toastNotification.value.addToast({
            type: 'success',
            message: 'Cập nhật phiếu giảm giá thành công!',
          });
        } else {
          await axios.post(`${apiBaseUrl}/addPhieuGiamGia`, payload);
          toastNotification.value.addToast({
            type: 'success',
            message: 'Thêm phiếu giảm giá thành công!',
          });
        }
        goBack();
      } catch (error) {
        console.error('Error submitting form:', error);
        toastNotification.value.addToast({
          type: 'error',
          message: 'Lỗi khi lưu phiếu giảm giá!',
        });
      }
    };

    const goBack = () => {
      router.push('/phieuGiamGia');
    };

    // Lifecycle
    onMounted(async () => {
      await fetchCustomers();
      loadVoucherData();
    });

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
    };
  },
};
</script>

<style scoped>
/* Giữ nguyên các style đã có */
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