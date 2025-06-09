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
    const customers = ref([
      { id: 1, code: 'KH0001', name: 'Trần Đức Anh', gender: 'Nam', birthDate: '12/01/1998' },
      { id: 2, code: 'KH0002', name: 'Trịnh Thị Anh', gender: 'Nữ', birthDate: '17/01/1996' },
      { id: 3, code: 'KH0003', name: 'Nguyễn Hoàng Phất', gender: 'Nam', birthDate: '06/02/2000' },
      { id: 4, code: 'KH0004', name: 'Nguyễn Minh Anh', gender: 'Nữ', birthDate: '19/12/2001' },
      { id: 5, code: 'KH0005', name: 'Nguyễn Hồng Long', gender: 'Nam', birthDate: '20/10/1994' },
      { id: 6, code: 'KH0006', name: 'Bùi Trúc Anh', gender: 'Nữ', birthDate: '20/11/2004' },
      { id: 7, code: 'KH0007', name: 'Ngô Kiên Trung', gender: 'Nam', birthDate: '20/10/1991' },
      { id: 8, code: 'KH0008', name: 'Phan Đức Phúc', gender: 'Nam', birthDate: '10/10/2002' },
      { id: 9, code: 'KH0009', name: 'Đinh Minh Phụng', gender: 'Nam', birthDate: '17/12/2006' },
    ]);

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
    const loadVoucherData = () => {
      if (isEditMode.value) {
        // Simulate fetching voucher data by ID
        // Note: The original code references an undefined 'vouchers' array.
        // For demonstration, we'll use a placeholder or skip loading if not defined.
        // In a real app, fetch from an API or store.
        const voucherId = parseInt(route.params.id);
        // Placeholder: Replace with actual data fetching logic
        const voucher = { // Mock data for testing
          id: voucherId,
          code: `VOUCHER00${voucherId}`,
          name: `Voucher ${voucherId}`,
          type: 'Tiền mặt',
          value: 100000,
          quantity: 50,
          startDate: '2025-06-01',
          endDate: '2025-12-31',
          note: 'Test voucher',
          isActive: true,
          customers: [1, 2], // Example customer IDs
        };
        if (voucher) {
          formData.value = { ...voucher };
          selectedCustomers.value = voucher.customers || [];
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy phiếu giảm giá!',
          });
        }
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
      toastNotification.value.addToast({ // Changed from showToast to addToast
        type: 'success',
        message: 'Đã xóa khách hàng!',
      });
    };

    const submitForm = () => {
      if (!formData.value.code || !formData.value.name || !formData.value.type || formData.value.value == null || formData.value.quantity == null || !formData.value.startDate || !formData.value.endDate) {
        toastNotification.value.addToast({ // Changed from showToast to addToast
          type: 'error',
          message: 'Vui lòng điền đầy đủ thông tin!',
        });
        return;
      }

      if (isEditMode.value) {
        // Update logic (e.g., API call to update voucher)
        console.log('Updated voucher:', { ...formData.value, customers: selectedCustomers.value });
        toastNotification.value.addToast({ // Changed from showToast to addToast
          type: 'success',
          message: 'Cập nhật phiếu giảm giá thành công!',
        });
      } else {
        // Create logic (e.g., API call to create voucher)
        console.log('Created voucher:', { ...formData.value, customers: selectedCustomers.value });
        toastNotification.value.addToast({ // Changed from showToast to addToast
          type: 'success',
          message: 'Thêm phiếu giảm giá thành công!',
        });
      }

      // Reset form and navigate back
      formData.value = {
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
      };
      selectedCustomers.value = [];
      goBack();
    };

    const goBack = () => {
      router.push('/phieuGiamGia');
    };

    // Lifecycle
    onMounted(() => {
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