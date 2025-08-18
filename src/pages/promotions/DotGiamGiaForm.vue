<template>
  <div class="container-fluid py-4">
    <HeaderCard :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thêm Đợt Giảm Giá'" badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal" :backgroundOpacity="0.95" />

    <div>
      <ToastNotification ref="toastNotification" />
      <NotificationModal ref="notificationModal" :type="'confirm'"
        :message="'Bạn có chắc chắn muốn ' + (isEditMode ? 'cập nhật' : 'thêm') + ' đợt giảm giá này?'"
        :confirmText="'Xác nhận'" :onConfirm="confirmAddData" />

      <!-- Container chính -->
      <div class="form-container">
        <!-- Form Đợt Giảm Giá -->
        <div class="form-section-wrapper">
          <FilterTableSection :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thông Tin Đợt Giảm Giá'"
            icon="bi bi-info-circle" class="form-section">
            <form @submit.prevent="showConfirmModal" class="p-3 space-y-4 h-100">
              <div class="mb-3">
                <label class="filter-label">Mã đợt giảm giá</label>
                <input v-model="dotGiamGia.ma" type="text" class="form-control input" placeholder="Mã tự động"
                  :disabled="!isEditMode" @blur="checkDuplicateMa" />
              </div>
              <div class="mb-3">
                <label class="filter-label">Tên đợt giảm giá</label>
                <input v-model="dotGiamGia.tenDotGiamGia" type="text" class="form-control input"
                  placeholder="Nhập tên đợt giảm giá" />
              </div>
              <div class="mb-3">
                <label class="filter-label">Loại giảm giá</label>
                <select v-model="dotGiamGia.loaiGiamGiaApDung" class="form-control input">
                  <option value="" disabled>Chọn loại giảm giá</option>
                  <option value="Phần trăm">Phần trăm</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>
              <div class="mb-3" v-if="dotGiamGia.loaiGiamGiaApDung !== 'Tiền mặt'">
                <label class="filter-label">Giá trị giảm giá</label>
                <input v-model.number="dotGiamGia.giaTriGiamGia" type="number" class="form-control input"
                  placeholder="0" required :min="0" />
              </div>
              <div class="mb-3">
                <label class="filter-label">Số tiền giảm</label>
                <input v-model="formattedSoTienGiamToiDa" type="text" class="form-control input"
                  placeholder="Nhập số tiền giảm" />
              </div>
              <div class="mb-3">
                <label class="filter-label">Ngày bắt đầu</label>
                <input v-model="dotGiamGia.ngayBatDau" type="date" class="form-control input" />
              </div>
              <div class="mb-3">
                <label class="filter-label">Ngày kết thúc</label>
                <input v-model="dotGiamGia.ngayKetThuc" type="date" class="form-control input" />
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
        <div class="product-section-wrapper">
          <FilterTableSection title="Danh Sách Sản Phẩm" icon="bi bi-table" class="product-section">
            <div class="p-3 h-100">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label сlass="filter-label">Tìm kiếm</label>
                  <div class="search-input-wrapper">
                    <i class="bi bi-search search-icon input"></i>
                    <input v-model="searchKeyword" type="text" class="form-control search-input"
                      placeholder="Tìm kiếm theo tên, mã..." @input="fetchData" />
                  </div>
                </div>
                <div class="col-md-3">
                  <label class="filter-label">Hệ điều hành</label>
                  <select v-model="selectedHeDieuHanh" class="form-control input">
                    <option value="">Tất cả</option>
                    <option v-for="hdh in uniqueHeDieuHanh" :key="hdh.id" :value="hdh.id">
                      {{ hdh.heDieuHanh }} {{ hdh.phienBan }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="filter-label">Nhà sản xuất</label>
                  <select v-model="selectedNhaSanXuat" class="form-control input">
                    <option value="">Tất cả</option>
                    <option v-for="nsx in uniqueNhaSanXuat" :key="nsx.id" :value="nsx.id">
                      {{ nsx.nhaSanXuat }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="table-container h-100" style="overflow-y: auto;">
                <DataTable
                    v-if="!isLoading"
                    :headers="productHeaders"
                    :data="dspList"
                    :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
                    :itemsPerPage="10"
                    class="product-table"
                >
                  <template #checkbox="{ item }">
                    <input
                        v-if="item && item.sp"
                        type="checkbox"
                        :value="item.sp.id"
                        :checked="idDSPs.includes(item.sp.id)"
                        @change="fetchCTSPData(item.sp.id)"
                        class="form-check-input"
                    />
                    <span v-else>N/A</span>
                  </template>
                  <template #index="{ globalIndex }">
                    {{ globalIndex + 1 }}
                  </template>
                  <template #sp.ma="{ item }">
                    <span>{{ item.sp?.ma ?? 'N/A' }}</span>
                  </template>
                  <template #sp.tenSanPham="{ item }">
                    <span>{{ item.sp?.tenSanPham ?? 'N/A' }}</span>
                  </template>
                  <template #nsx.nhaSanXuat="{ item }">
                    <span>{{ item.nsx?.nhaSanXuat ?? 'N/A' }}</span>
                  </template>
                  <template #soLuongCTSP="{ item }">
                    <span>{{ item.soLuongCTSP ?? '0' }}</span>
                  </template>
                </DataTable>
                <div v-else-if="isLoading" class="text-center py-4 text-muted">
                  <i class="pi pi-spin pi-spinner fs-1"></i>
                  <p class="mt-2">Đang tải dữ liệu...</p>
                </div>
                <div v-else class="text-center py-4 text-muted">
                  <i class="pi pi-inbox fs-1"></i>
                  <p class="mt-2">Không có dữ liệu sản phẩm</p>
                </div>
              </div>
            </div>
          </FilterTableSection>
        </div>
      </div>

      <!-- Chi Tiết Sản Phẩm -->
      <div>
        <FilterTableSection title="Danh Sách Chi Tiết Sản Phẩm" icon="bi bi-table">
          <div class="p-3">
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="filter-label">Dòng sản phẩm</label>
                <select v-model="selectedDongSanPham" class="form-control input" @change="updateBoNhoTrong">
                  <option value="">Tất cả</option>
                  <option v-for="dong in uniqueDongSanPhams" :key="dong" :value="dong">
                    {{ dong }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="filter-label">Bộ nhớ trong</label>
                <select v-model="selectedBoNhoTrong" class="form-control input">
                  <option value="">Tất cả</option>
                  <option v-for="boNho in filteredBoNhoTrong" :key="boNho" :value="boNho">
                    {{ boNho }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="filter-label">Màu sắc</label>
                <select v-model="selectedMauSac" class="form-control input">
                  <option value="">Tất cả</option>
                  <option v-for="mau in filteredMauSac" :key="mau" :value="mau">
                    {{ mau }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mb-3 d-flex justify-content-end gap-2">
              <button class="btn btn-action btn-sm" @click="selectAllCTSP" :disabled="idDSPs.length === 0">
                Chọn tất cả
              </button>
              <button class="btn btn-danger btn-sm" @click="deselectAllCTSP" :disabled="idDSPs.length === 0">
                Bỏ chọn tất cả
              </button>
            </div>

            <div v-if="filteredCTSPList.length === 0" class="text-center py-4 text-muted">
              <i class="pi pi-inbox fs-1"></i>
              <p class="mt-2">{{ isEditMode ? 'Không có dữ liệu chi tiết đợt giảm giá' : 'Không có dữ liệu' }}</p>
            </div>
            <div v-else class="table-container" style="overflow-y: auto;">
              <DataTable :headers="detailHeaders" :data="filteredCTSPList" :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]"
                class="detail-table">
                <template #select="{ item }">
                  <input
                      type="checkbox"
                      :value="item.ctsp.id"
                      :checked="selectedCTSPIds.includes(item.ctsp.id)"
                      @change="handleCheckboxChangeCTSP(item.ctsp.id, $event.target.checked)"
                      class="form-check-input"
                  />
                </template>
                <template #index="{ globalIndex }">
                  {{ globalIndex + 1 }}
                </template>
                <template #anh.duongDan="{ item }">
                  <img v-if="item.anh.duongDan" :src="item.anh.duongDan" alt="Ảnh" class="product-image" />
                  <span v-else>N/A</span>
                </template>
                <template #soLuongTrongDotGiamGiaKhac="{ item }">
                  <span>Trùng với {{ item.soLuongTrongDotGiamGiaKhac }} đợt giảm giá</span>
                </template>
                <template #sp.tenSanPham_va_MauSac="{ item }">
                  <span>{{ `${item.sp?.tenSanPham || 'Chưa có dữ liệu'} - ${item.ctsp?.idMauSac?.mauSac || 'Chưa có dữ liệu'} - ${ item.bnt?.dungLuongBoNhoTrong || 'Chưa có dữ liệu' }` }}</span>
                </template>
                <template #ctsp.giaBan="{ item }">
                  <span>{{ item.ctsp.giaBan ? item.ctsp.giaBan.toLocaleString() : 'N/A' }}</span>
                </template>
                <template #giaSauKhiGiam="{ item }">
                  <span>{{ item.giaSauKhiGiam ? item.giaSauKhiGiam.toLocaleString() : 'N/A' }}</span>
                </template>
              </DataTable>
            </div>
          </div>
        </FilterTableSection>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { useDotGiamGia } from '@/store/modules/promotions/DotGiamGiaForm.js';
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';

const router = useRouter();
const route = useRoute();
const toastNotification = ref(null);
const notificationModal = ref(null);
const errors = ref({});
const originalMa = ref('');

const {
  toast,
  selectedCTSPIds,
  currentPageDSP,
  changePageDSP,
  pageSizeDSP,
  totalPagesDSP,
  currentPageCTSP,
  changePageCTSP,
  pageSizeCTSP,
  totalPagesCTSP,
  dspList,
  ctspList,
  searchKeyword,
  idDSPs,
  selectedDongSanPham,
  selectedBoNhoTrong,
  selectedMauSac,
  selectedHeDieuHanh,
  selectedNhaSanXuat,
  uniqueHeDieuHanh,
  uniqueNhaSanXuat,
  dotGiamGia,
  edit,
  uniqueDongSanPhams,
  filteredBoNhoTrong,
  filteredMauSac,
  filteredCTSPList,
  addData,
  columns,
  getNestedValue,
  columns2,
  getNestedValue2,
  displayedPagesDSP,
  displayedPagesCTSP,
  fetchCTSPData,
  selectAllCTSP,
  deselectAllCTSP,
} = useDotGiamGia(toastNotification);

const isEditMode = computed(() => edit.value);
const isTienMat = computed(() => dotGiamGia.value.loaiGiamGiaApDung === 'Tiền mặt');

const formattedSoTienGiamToiDa = computed({
  get() {
    const value = dotGiamGia.value.soTienGiamToiDa;
    return value ? Number(value).toLocaleString('vi-VN') : '';
  },
  set(newValue) {
    const rawValue = newValue.replace(/[^0-9]/g, '');
    dotGiamGia.value.soTienGiamToiDa = rawValue ? Number(rawValue) : 0;
  },
});

const updateBoNhoTrong = () => {
  currentPageCTSP.value = 0;
};

const goBack = () => {
  router.push('/dotGiamGia');
};

const productHeaders = computed(() => [
  { text: '#', value: 'checkbox' },
  { text: 'STT', value: 'index' },
  { text: 'Mã', value: 'sp.ma' },
  { text: 'Tên SP', value: 'sp.tenSanPham' },
  { text: 'Hãng', value: 'nsx.nhaSanXuat' },
  { text: 'Số lượng', value: 'soLuongCTSP' },
]);

const detailHeaders = computed(() => [
  { text: '#', value: 'select' },
  { text: 'STT', value: 'index' },
  { text: 'Ảnh', value: 'anh.duongDan' },
  { text: 'Trùng', value: 'soLuongTrongDotGiamGiaKhac' },
  { text: 'Sản phẩm & Màu sắc & Bộ nhớ', value: 'sp.tenSanPham_va_MauSac' },
  { text: 'Đơn giá gốc', value: 'ctsp.giaBan' },
  { text: 'Đơn giá sau giảm', value: 'giaSauKhiGiam' },
]);

const checkDuplicateMa = async () => {
  if (!isEditMode.value) {
    delete errors.value.ma;
    return;
  }

  if (!dotGiamGia.value.ma) {
    errors.value.ma = 'Vui lòng nhập mã đợt giảm giá';
    return;
  }

  if (isEditMode.value && dotGiamGia.value.ma === originalMa.value) {
    delete errors.value.ma;
    return;
  }

  try {
    const response = await axios.get('/api/dotGiamGia/ViewAddDotGiamGia/exists/ma', {
      params: {
        ma: dotGiamGia.value.ma,
        excludeId: isEditMode.value ? dotGiamGia.value.id : null,
      },
    });
    if (response.data) {
      errors.value.ma = 'Mã đợt giảm giá đã tồn tại';
    } else {
      delete errors.value.ma;
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra mã:', error);
    toastNotification.value?.addToast({ type: 'error', message: 'Lỗi khi kiểm tra mã', duration: 3000 });
    errors.value.ma = 'Lỗi khi kiểm tra mã';
  }
};

const validateForm = async () => {
  const today = new Date().toISOString().split('T')[0];
  console.log('Validating form with data:', {
    dotGiamGia: dotGiamGia.value,
    idDSPs: idDSPs.value
  });

  let hasError = false;

  if (isEditMode.value) {
    if (!dotGiamGia.value.ma) {
      toastNotification.value?.addToast({
        type: 'error',
        message: 'Vui lòng nhập mã đợt giảm giá',
        duration: 3000
      });
      hasError = true;
    } else if (dotGiamGia.value.ma !== originalMa.value) {
      await checkDuplicateMa();
      if (errors.value.ma) {
        toastNotification.value?.addToast({
          type: 'error',
          message: errors.value.ma,
          duration: 3000
        });
        hasError = true;
      }
    }
  }

  if (!dotGiamGia.value.tenDotGiamGia) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng nhập tên đợt giảm giá',
      duration: 3000
    });
    hasError = true;
  }

  if (!dotGiamGia.value.loaiGiamGiaApDung) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng chọn loại giảm giá',
      duration: 3000
    });
    hasError = true;
  }

  if (dotGiamGia.value.loaiGiamGiaApDung !== 'Tiền mặt' && dotGiamGia.value.giaTriGiamGia <= 0) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng nhập giá trị giảm giá lớn hơn 0',
      duration: 3000
    });
    hasError = true;
  }

  if (!dotGiamGia.value.soTienGiamToiDa || dotGiamGia.value.soTienGiamToiDa <= 0) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Số tiền giảm tối đa phải lớn hơn 0',
      duration: 3000
    });
    hasError = true;
  }

  if (!dotGiamGia.value.ngayBatDau) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng chọn ngày bắt đầu',
      duration: 3000
    });
    hasError = true;
  } else if (dotGiamGia.value.ngayBatDau < today && !isEditMode.value) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại',
      duration: 3000
    });
    hasError = true;
  }

  if (!dotGiamGia.value.ngayKetThuc || dotGiamGia.value.ngayKetThuc < dotGiamGia.value.ngayBatDau) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng chọn ngày kết thúc hợp lệ',
      duration: 3000
    });
    hasError = true;
  }

  if (idDSPs.value.length === 0) {
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng chọn ít nhất một dòng sản phẩm',
      duration: 3000
    });
    hasError = true;
  }

  console.log('Validation completed, hasError:', hasError);
  return !hasError;
};

const showConfirmModal = async () => {
  console.log('showConfirmModal called');
  const isValid = await validateForm();
  console.log('isValid:', isValid, 'errors:', errors.value);
  if (isValid) {
    console.log('Opening notification modal', notificationModal.value);
    notificationModal.value?.openModal();
  }
};

const confirmAddData = async () => {
  await addData();
};

const handleCheckboxChangeCTSP = (id, isChecked) => {
  console.log("handleCheckboxChangeCTSP called with id:", id, "isChecked:", isChecked);
  if (isChecked) {
    if (!selectedCTSPIds.value.includes(id)) {
      selectedCTSPIds.value.push(id);
    }
  } else {
    selectedCTSPIds.value = selectedCTSPIds.value.filter(ctspId => ctspId !== id);
  }
  ctspList.value = ctspList.value.map(item => {
    if (item.ctsp.id === id) {
      return { ...item, selected: isChecked };
    }
    return item;
  });
  console.log("selectedCTSPIds after update:", selectedCTSPIds.value);
  console.log("ctspList after update:", ctspList.value.map(item => ({
    id: item.ctsp.id,
    selected: item.selected
  })));
};
onMounted(() => {
  if (isEditMode.value) {
    originalMa.value = dotGiamGia.value.ma;
  }
  // Đặt giá trị mặc định cho các bộ lọc là "Tất cả"
  selectedHeDieuHanh.value = '';
  selectedNhaSanXuat.value = '';
  selectedDongSanPham.value = '';
  selectedBoNhoTrong.value = '';
  selectedMauSac.value = '';

  // Thêm listener cho sự kiện checkbox-change
  const table = document.querySelector('.detail-table');
  if (table) {
    table.addEventListener('checkbox-change', (event) => {
      const { id, checked } = event.detail;
      handleCheckboxChangeCTSP(id, checked);
    });
  }
});
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

.form-control.input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
  flex: 1;
  min-width: 0;
}

.form-control.input:focus {
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

.btn-action:disabled {
  background: #6c757d;
  cursor: not-allowed;
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

.btn-danger {
  background: #dc3545;
  border: none;
  padding: 0.3rem 0.8rem;
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

.btn-danger:disabled {
  background: #6c757d;
  cursor: not-allowed;
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

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

/* Đảm bảo chiều cao bằng nhau với CSS Grid */
.form-container {
  display: grid;
  grid-template-columns: 5fr 7fr;
  /* Tỷ lệ tương ứng với col-md-5 và col-md-7 */
  gap: 1rem;
  align-items: stretch;
  /* Đảm bảo các cột có chiều cao bằng nhau */
}

.form-section-wrapper,
.product-section-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Đảm bảo wrapper chiếm toàn bộ chiều cao của grid cell */
}

.form-section,
.product-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* Đảm bảo FilterTableSection chiếm toàn bộ không gian có sẵn */
}

.form-section .p-3,
.product-section .p-3 {
  flex: 1;
  /* Nội dung bên trong co giãn để lấp đầy */
  display: flex;
  flex-direction: column;
}

.form-section .space-y-4,
.product-section .h-100 {
  flex: 1;
}

.table-container {
  flex: 1;
  overflow-y: auto;
}

/* Scrollbar Styling */
.table-container::-webkit-scrollbar,
.product-table::-webkit-scrollbar,
.detail-table::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track,
.product-table::-webkit-scrollbar-track,
.detail-table::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb,
.product-table::-webkit-scrollbar-thumb,
.detail-table::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover,
.product-table::-webkit-scrollbar-thumb:hover,
.detail-table::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

@media (max-width: 768px) {
  .form-container {
    grid-template-columns: 1fr;
    /* Chuyển về 1 cột trên màn hình nhỏ */
  }

  .form-section-wrapper,
  .product-section-wrapper {
    min-height: 400px;
    /* Giảm chiều cao trên màn hình nhỏ */
  }
}
</style>