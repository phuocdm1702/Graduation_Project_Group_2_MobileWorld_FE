<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thêm Đợt Giảm Giá'"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <div class="row">
      <!-- Form Đợt Giảm Giá -->
      <div class="col-lg-6">
        <FilterTableSection :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thông Tin Đợt Giảm Giá'" icon="bi bi-plus-circle" class="h-100">
          <form @submit.prevent="saveSale" class="p-3">
            <div class="mb-3">
              <label class="filter-label">Tên đợt giảm giá</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control date-input"
                placeholder="Nhập tên đợt giảm giá"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Loại giảm giá</label>
              <select v-model="form.type" class="form-control date-input" required>
                <option value="" disabled>Chọn loại giảm giá</option>
                <option value="Phần trăm">Phần trăm</option>
                <option value="Tiền mặt">Tiền mặt</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="filter-label">Giá trị giảm giá</label>
              <input
                v-model.number="form.value"
                type="number"
                class="form-control date-input"
                placeholder="0"
                required
                :min="0"
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Số tiền giảm tối đa</label>
              <input
                v-model.number="form.maxDiscount"
                type="number"
                class="form-control date-input"
                placeholder="Nhập số tiền tối đa"
                required
                :min="0"
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày bắt đầu</label>
              <input
                v-model="form.startDate"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="mb-3">
              <label class="filter-label">Ngày kết thúc</label>
              <input
                v-model="form.expiryDate"
                type="date"
                class="form-control date-input"
                required
              />
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-action flex-fill">
                {{ isEditMode ? 'Cập Nhật' : 'Thêm' }}
              </button>
              <button type="button" class="btn btn-secondary flex-fill" @click="goBack">
                Quay Về
              </button>
            </div>
          </form>
        </FilterTableSection>
      </div>

      <!-- Danh Sách Sản Phẩm -->
      <div class="col-lg-6">
        <FilterTableSection title="Sản Phẩm" icon="bi bi-box-seam" class="h-100">
          <div class="p-3">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="filter-label">Tìm kiếm theo tên, mã...</label>
                <div class="search-input-wrapper">
                  <i class="bi bi-search search-icon"></i>
                  <input
                    v-model="productSearch"
                    type="text"
                    class="form-control search-input"
                    placeholder="Tìm kiếm theo tên, mã..."
                    @input="searchProducts"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <label class="filter-label">Hệ điều hành</label>
                <select v-model="osFilter" class="form-control date-input">
                  <option value="">Hệ điều hành</option>
                  <option value="iOS">iOS</option>
                  <option value="Android">Android</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="filter-label">Nhà sản xuất</label>
                <select v-model="brandFilter" class="form-control date-input">
                  <option value="">Nhà sản xuất</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                </select>
              </div>
            </div>
            
            <DataTable
              :headers="productHeaders"
              :data="filteredProducts"
              :pageSizeOptions="[5, 10, 15]"
              :showSTT="true"
              class="product-table"
            >
              <template #checkbox="{ item }">
                <input
                  type="checkbox"
                  :checked="isProductSelected(item)"
                  @change="toggleProduct(item)"
                  class="form-check-input"
                />
              </template>
              <template #stt="{ item, index }">
                {{ index + 1 }}
              </template>
              <template #code="{ item }">
                <span>{{ item.code }}</span>
              </template>
              <template #name="{ item }">
                <span>{{ item.name }}</span>
              </template>
              <template #brand="{ item }">
                <span>{{ item.brand }}</span>
              </template>
              <template #quantity="{ item }">
                <span>{{ item.quantity }}</span>
              </template>
            </DataTable>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Chi Tiết Sản Phẩm -->
    <div class="row mt-4">
      <div class="col-12">
        <FilterTableSection title="Chi Tiết Sản Phẩm" icon="bi bi-list-ul">
          <div class="p-3">
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="filter-label">Dòng sản phẩm</label>
                <select v-model="productLineFilter" class="form-control date-input">
                  <option value="">Dòng sản phẩm</option>
                  <option value="iPhone">iPhone</option>
                  <option value="Samsung Galaxy">Samsung Galaxy</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="filter-label">Bộ nhớ trong</label>
                <select v-model="storageFilter" class="form-control date-input">
                  <option value="">Bộ nhớ trong</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="filter-label">Màu sắc</label>
                <select v-model="colorFilter" class="form-control date-input">
                  <option value="">Màu sắc</option>
                  <option value="Đen">Đen</option>
                  <option value="Trắng">Trắng</option>
                  <option value="Xanh">Xanh</option>
                  <option value="Tím">Tím</option>
                </select>
              </div>
            </div>

            <div class="mb-3 d-flex justify-content-end">
              <button
                class="btn btn-action btn-sm me-2"
                @click="selectAll"
              >
                Chọn tất cả
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="clearAll"
              >
                Bỏ chọn tất cả
              </button>
            </div>

            <DataTable
              :headers="detailHeaders"
              :data="filteredSelectedDetails"
              :pageSizeOptions="[5, 10, 15]"
              :showSTT="true"
              class="detail-table"
            >
              <template #checkbox="{ item }">
                <input
                  type="checkbox"
                  class="form-check-input"
                />
              </template>
              <template #stt="{ item, index }">
                {{ index + 1 }}
              </template>
              <template #code="{ item }">
                <span>{{ item.code }}</span>
              </template>
              <template #name="{ item }">
                <span>{{ item.name }}</span>
              </template>
              <template #brand="{ item }">
                <span>{{ item.brand }}</span>
              </template>
              <template #ram="{ item }">
                <span>{{ item.ram }}</span>
              </template>
              <template #storage="{ item }">
                <span>{{ item.storage }}</span>
              </template>
              <template #color="{ item }">
                <span>{{ item.color }}</span>
              </template>
              <template #imei="{ item }">
                <span>{{ item.imei }}</span>
              </template>
              <template #actions="{ item }">
                <button
                  class="btn btn-sm btn-table"
                  @click="removeDetail(item)"
                  title="Xóa"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </template>
            </DataTable>

            <div v-if="filteredSelectedDetails.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-inbox fs-1"></i>
              <p class="mt-2">Không có dữ liệu</p>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>

    <!-- Modals -->
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

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';

export default {
  name: 'DotGiamGiaForm',
  components: {
    DataTable,
    NotificationModal,
    ToastNotification,
    HeaderCard,
    FilterTableSection,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Form Data
    const form = ref({
      id: null,
      name: '',
      type: '',
      value: null,
      maxDiscount: null,
      startDate: '',
      expiryDate: '',
    });

    // Product Data
    const products = ref([
      { id: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', os: 'iOS' },
      { id: 2, code: 'SP00002', name: 'iPhone 15', brand: 'Apple', os: 'iOS' },
      { id: 3, code: 'SP00003', name: 'Samsung Galaxy S23', brand: 'Samsung', os: 'Android' },
    ]);

    // Product Details Data
    const productDetails = ref([
      { id: 1, productId: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', ram: '6GB', storage: '128GB', color: 'Đen', imei: '123456789012345', quantity: 1 },
      { id: 2, productId: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', ram: '6GB', storage: '256GB', color: 'Trắng', imei: '123456789012346', quantity: 1 },
      { id: 3, productId: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', ram: '6GB', storage: '512GB', color: 'Xanh', imei: '123456789012347', quantity: 1 },
      { id: 4, productId: 2, code: 'SP00002', name: 'iPhone 15', brand: 'Apple', ram: '8GB', storage: '128GB', color: 'Đen', imei: '123456789012348', quantity: 1 },
      { id: 5, productId: 2, code: 'SP00002', name: 'iPhone 15', brand: 'Apple', ram: '8GB', storage: '256GB', color: 'Trắng', imei: '123456789012349', quantity: 1 },
      { id: 6, productId: 3, code: 'SP00003', name: 'Samsung Galaxy S23', brand: 'Samsung', ram: '8GB', storage: '256GB', color: 'Xanh', imei: '123456789012350', quantity: 1 },
      { id: 7, productId: 3, code: 'SP00003', name: 'Samsung Galaxy S23', brand: 'Samsung', ram: '8GB', storage: '512GB', color: 'Tím', imei: '123456789012351', quantity: 1 },
    ]);

    const productSearch = ref('');
    const osFilter = ref('');
    const brandFilter = ref('');
    const productLineFilter = ref('');
    const storageFilter = ref('');
    const colorFilter = ref('');
    const selectedDetails = ref([]);

    // Computed
    const isEditMode = computed(() => !!route.params.id);

    const filteredProducts = computed(() => {
      return products.value.map(product => ({
        ...product,
        quantity: productDetails.value.filter(detail => detail.productId === product.id).length
      })).filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
                            product.code.toLowerCase().includes(productSearch.value.toLowerCase());
        const matchesBrand = !brandFilter.value || product.brand === brandFilter.value;
        const matchesOs = !osFilter.value || product.os === osFilter.value;
        return matchesSearch && matchesBrand && matchesOs;
      });
    });

    const filteredSelectedDetails = computed(() => {
      return selectedDetails.value.filter((detail) => {
        const matchesProductLine = !productLineFilter.value || detail.name.includes(productLineFilter.value);
        const matchesStorage = !storageFilter.value || detail.storage === storageFilter.value;
        const matchesColor = !colorFilter.value || detail.color === colorFilter.value;
        return matchesProductLine && matchesStorage && matchesColor;
      });
    });

    const productHeaders = [
      { text: '#', value: 'checkbox' },
      { text: 'STT', value: 'stt' },
      { text: 'Mã', value: 'code' },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Hãng', value: 'brand' },
      { text: 'Số lượng', value: 'quantity' },
    ];

    const detailHeaders = [
      { text: '#', value: 'checkbox' },
      { text: 'STT', value: 'stt' },
      { text: 'Mã', value: 'code' },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Hãng', value: 'brand' },
      { text: 'RAM', value: 'ram' },
      { text: 'Bộ nhớ trong', value: 'storage' },
      { text: 'Màu sắc', value: 'color' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Hành động', value: 'actions' },
    ];

    // Methods
    const loadSaleData = () => {
      if (isEditMode.value) {
        // Simulate fetching sale data by ID
        const saleId = parseInt(route.params.id);
        // Placeholder: Replace with actual data fetching logic
        const sale = { // Mock data for testing
          id: saleId,
          name: `Sale ${saleId}`,
          type: 'Phần trăm',
          value: 10,
          maxDiscount: 1000000,
          startDate: '2025-06-01',
          expiryDate: '2025-12-31',
          details: [
            { id: 1, productId: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', ram: '6GB', storage: '128GB', color: 'Đen', imei: '123456789012345', quantity: 1 },
            { id: 2, productId: 1, code: 'SP00001', name: 'iPhone 14', brand: 'Apple', ram: '6GB', storage: '256GB', color: 'Trắng', imei: '123456789012346', quantity: 1 },
          ],
        };
        if (sale) {
          form.value = { ...sale };
          selectedDetails.value = sale.details || [];
        } else {
          toastNotification.value.addToast({
            type: 'error',
            message: 'Không tìm thấy đợt giảm giá!',
          });
        }
      }
    };

    const searchProducts = () => {
      // Handled by computed property
    };

    const isProductSelected = (product) => {
      const productDetailIds = productDetails.value
        .filter(detail => detail.productId === product.id)
        .map(detail => detail.id);
      return productDetailIds.every(id => selectedDetails.value.some(detail => detail.id === id));
    };

    const toggleProduct = (product) => {
      const productDetailIds = productDetails.value
        .filter(detail => detail.productId === product.id)
        .map(detail => detail.id);
      const allSelected = productDetailIds.every(id => selectedDetails.value.some(detail => detail.id === id));

      if (allSelected) {
        // Remove all product details
        selectedDetails.value = selectedDetails.value.filter(detail => !productDetailIds.includes(detail.id));
      } else {
        // Add all product details
        const detailsToAdd = productDetails.value.filter(detail => detail.productId === product.id);
        detailsToAdd.forEach(detail => {
          if (!selectedDetails.value.some(d => d.id === detail.id)) {
            selectedDetails.value.push({ ...detail });
          }
        });
      }
    };

    const removeDetail = (detail) => {
      selectedDetails.value = selectedDetails.value.filter((d) => d.id !== detail.id);
    };

    const selectAll = () => {
      productDetails.value.forEach((detail) => {
        if (!selectedDetails.value.some((d) => d.id === detail.id)) {
          selectedDetails.value.push({ ...detail });
        }
      });
    };

    const clearAll = () => {
      selectedDetails.value = [];
    };

    const goBack = () => {
      router.push('/dotGiamGia');
    };

    const saveSale = () => {
      if (
        !form.value.name ||
        !form.value.type ||
        form.value.value == null ||
        form.value.maxDiscount == null ||
        !form.value.startDate ||
        !form.value.expiryDate ||
        selectedDetails.value.length === 0
      ) {
        notificationType.value = 'error';
        notificationMessage.value = 'Vui lòng điền đầy đủ thông tin và chọn ít nhất một chi tiết sản phẩm!';
        notificationOnConfirm.value = () => {};
        notificationOnCancel.value = () => resetNotification();
        notificationModal.value.openModal(); // Changed from show to openModal
        return;
      }

      if (isEditMode.value) {
        // Update logic (e.g., API call to update sale)
        console.log('Updated sale:', { ...form.value, details: selectedDetails.value });
        toastNotification.value.addToast({ // Changed from showToast to addToast
          type: 'success',
          message: 'Cập nhật đợt giảm giá thành công!',
        });
      } else {
        // Create logic (e.g., API call to create sale)
        console.log('Created sale:', { ...form.value, details: selectedDetails.value });
        toastNotification.value.addToast({ // Changed from showToast to addToast
          type: 'success',
          message: 'Thêm đợt giảm giá thành công!',
        });
      }

      goBack();
    };

    const notificationModal = ref(null);
    const toastNotification = ref(null);
    const notificationType = ref('');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => resetNotification());

    const resetNotification = () => {
      notificationType.value = '';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => resetNotification();
      // Removed hide() call as it's not needed; closeModal is handled internally
    };

    // Lifecycle
    onMounted(() => {
      loadSaleData();
    });

    return {
      form,
      products,
      productDetails,
      productSearch,
      osFilter,
      brandFilter,
      productLineFilter,
      storageFilter,
      colorFilter,
      selectedDetails,
      isEditMode,
      filteredProducts,
      filteredSelectedDetails,
      productHeaders,
      detailHeaders,
      searchProducts,
      isProductSelected,
      toggleProduct,
      removeDetail,
      selectAll,
      clearAll,
      goBack,
      saveSale,
      notificationModal,
      toastNotification,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      resetNotification,
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
  background: transparent;
}

.btn-table:hover {
  color: #dc3545;
  text-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
}

.btn-danger {
  background: #dc3545;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
  color: white;
}

.form-check-input {
  width: 1.2em;
  height: 1.2em;
  margin-top: 0.1em;
}

.product-table,
.detail-table {
  overflow: hidden;
}

.text-muted {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .col-lg-6 {
    margin-bottom: 1rem;
  }
  
  .row.mb-3 .col-md-6,
  .row.mb-3 .col-md-3,
  .row.mb-3 .col-md-4 {
    margin-bottom: 1rem;
  }
}
</style>