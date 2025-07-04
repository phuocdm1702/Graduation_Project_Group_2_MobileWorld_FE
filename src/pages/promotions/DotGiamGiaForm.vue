<template>
    <div class="container-fluid py-4">
      <HeaderCard
          :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thêm Đợt Giảm Giá'"
          badgeText="Hệ Thống POS"
          badgeClass="gradient-custom-teal"
          :backgroundOpacity="0.95"
      />

      <div>
        <ToastNotification ref="toastNotification" />
        <NotificationModal
            ref="notificationModal"
            :type="'confirm'"
            :message="'Bạn có chắc chắn muốn ' + (isEditMode ? 'cập nhật' : 'thêm') + ' đợt giảm giá này?'"
            :confirmText="'Xác nhận'"
            :onConfirm="confirmAddData"
        />

        <!-- Container chính -->
        <div class="row">
          <!-- Form Đợt Giảm Giá -->
          <div class="col-md-6">
            <div>
              <FilterTableSection :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thông Tin Đợt Giảm Giá'" icon="pi pi-plus-circle">
                <form @submit.prevent="showConfirmModal" class="p-3 space-y-4 flex-grow-1">
                  <div class="mb-3">
                    <label class="filter-label">Mã đợt giảm giá</label>
                    <input
                        v-model="dotGiamGia.ma"
                        type="text"
                        class="form-control input"
                        placeholder="Nhập mã đợt giảm giá"
                        :disabled="!isEditMode"
                        @blur="checkDuplicateMa"
                    />
                    <p v-if="errors.ma" class="text-red-500 text-sm mt-1">{{ errors.ma }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Tên đợt giảm giá</label>
                    <input
                        v-model="dotGiamGia.tenDotGiamGia"
                        type="text"
                        class="form-control input"
                        placeholder="Nhập tên đợt giảm giá"
                    />
                    <p v-if="errors.tenDotGiamGia" class="text-red-500 text-sm mt-1">{{ errors.tenDotGiamGia }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Loại giảm giá</label>
                    <select v-model="dotGiamGia.loaiGiamGiaApDung" class="form-control input">
                      <option value="" disabled>Chọn loại giảm giá</option>
                      <option value="Phần trăm">Phần trăm</option>
                      <option value="Tiền mặt">Tiền mặt</option>
                    </select>
                    <p v-if="errors.loaiGiamGiaApDung" class="text-red-500 text-sm mt-1">{{ errors.loaiGiamGiaApDung }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Giá trị giảm giá</label>
                    <input
                        v-model.number="dotGiamGia.giaTriGiamGia"
                        type="number"
                        class="form-control input"
                        placeholder="0"
                        required
                        :min="0"
                        :disabled="isTienMat"
                    />
                    <p v-if="errors.giaTriGiamGia" class="text-red-500 text-sm mt-1">{{ errors.giaTriGiamGia }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Số tiền giảm tối đa</label>
                    <input
                        v-model="formattedSoTienGiamToiDa"
                        type="text"
                        class="form-control input"
                        placeholder="Nhập số tiền tối đa"
                    />
                    <p v-if="errors.soTienGiamToiDa" class="text-red-500 text-sm mt-1">{{ errors.soTienGiamToiDa }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Ngày bắt đầu</label>
                    <input
                        v-model="dotGiamGia.ngayBatDau"
                        type="date"
                        class="form-control input"
                    />
                    <p v-if="errors.ngayBatDau" class="text-red-500 text-sm mt-1">{{ errors.ngayBatDau }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="filter-label">Ngày kết thúc</label>
                    <input
                        v-model="dotGiamGia.ngayKetThuc"
                        type="date"
                        class="form-control input"
                    />
                    <p v-if="errors.ngayKetThuc" class="text-red-500 text-sm mt-1">{{ errors.ngayKetThuc }}</p>
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
          </div>

          <!-- Danh Sách Sản Phẩm -->
          <div class="col-md-6">
            <div>
              <FilterTableSection title="Sản Phẩm" icon="pi pi-box">
                <div class="p-3 flex-grow-1">
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="filter-label">Tìm kiếm</label>
                      <div class="search-input-wrapper">
                        <i class="bi bi-search search-icon input"></i>
                        <input
                            v-model="searchKeyword"
                            type="text"
                            class="form-control search-input"
                            placeholder="Tìm kiếm theo tên, mã..."
                            @input="fetchData"
                        />
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

                  <div class="flex-grow-1" style="overflow-y: auto;">
                    <DataTable
                        :headers="productHeaders"
                        :data="dspList"
                        :pageSizeOptions="[5, 10, 15]"
                        class="product-table"
                    >
                      <template #checkbox="{ item }">
                        <input
                            type="checkbox"
                            :value="item.sp.id"
                            :checked="idDSPs.includes(item.sp.id)"
                            @change="fetchCTSPData(item.sp.id)"
                            class="form-check-input"
                        />
                      </template>
                      <template #index="{ index }">
                        {{ index + 1 }}
                      </template>
                      <template #sp.ma="{ item }">
                        <span>{{ item.sp.ma }}</span>
                      </template>
                      <template #sp.tenSanPham="{ item }">
                        <span>{{ item.sp.tenSanPham }}</span>
                      </template>
                      <template #nsx.nhaSanXuat="{ item }">
                        <span>{{ item.nsx.nhaSanXuat }}</span>
                      </template>
                      <template #soLuongCTSP="{ item }">
                        <span>{{ item.soLuongCTSP }}</span>
                      </template>
                    </DataTable>
                  </div>
                </div>
              </FilterTableSection>
            </div>
          </div>
        </div>

        <!-- Chi Tiết Sản Phẩm -->
        <div>
          <FilterTableSection title="Chi Tiết Sản Phẩm" icon="pi pi-list">
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
                <button
                    class="btn btn-action btn-sm"
                    @click="selectAllCTSP"
                    :disabled="idDSPs.length === 0"
                >
                  Chọn tất cả
                </button>
                <button
                    class="btn btn-danger btn-sm"
                    @click="deselectAllCTSP"
                    :disabled="idDSPs.length === 0"
                >
                  Bỏ chọn tất cả
                </button>
              </div>

              <div v-if="filteredCTSPList.length === 0" class="text-center py-4 text-muted">
                <i class="pi pi-inbox fs-1"></i>
                <p class="mt-2">{{ isEditMode ? 'Không có dữ liệu chi tiết đợt giảm giá' : 'Không có dữ liệu' }}</p>
              </div>
              <div v-else class="flex-grow-1" style="overflow-y: auto;">
                <DataTable
                    :headers="detailHeaders"
                    :data="filteredCTSPList"
                    :pageSizeOptions="[5, 10, 15]"
                    class="detail-table"
                >
                  <template #select="{ item }">
                    <input
                        type="checkbox"
                        :value="item.ctsp.id"
                        :checked="item.selected"
                        @change="handleCheckboxChangeCTSP(item.ctsp.id, $event.target.checked)"
                        class="form-check-input"
                    />
                  </template>
                  <template #index="{ index }">
                    {{ index + 1 }}
                  </template>
<template #anh.duongDan="{ item }">
  <img v-if="item.anh.duongDan" :src="item.anh.duongDan" alt="Ảnh" class="product-image"/>
  <span v-else>N/A</span>
</template>
                  <template #soLuongTrongDotGiamGiaKhac="{ item }">
                    <span>{{ item.soLuongTrongDotGiamGiaKhac || '0' }}</span>
                  </template>
                  <template #sp.tenSanPham_va_MauSac="{ item }">
                    <span>{{ `${item.sp?.tenSanPham || 'Chưa có dữ liệu'} - ${item.ctsp?.idMauSac?.mauSac || 'Chưa có dữ liệu'}` }}</span>
                  </template>
                  <template #bnt.dungLuongBoNhoTrong="{ item }">
                    <span>{{ item.bnt?.dungLuongBoNhoTrong || 'Chưa có dữ liệu' }}</span>
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
  { text: 'Tên sản phẩm', value: 'sp.tenSanPham' },
  { text: 'Hãng', value: 'nsx.nhaSanXuat' },
  { text: 'Số lượng', value: 'soLuongCTSP' },
]);

const detailHeaders = computed(() => [
  { text: '#', value: 'select' },
  { text: 'STT', value: 'index' },
  { text: 'Ảnh', value: 'anh.duongDan' },
  { text: 'Số lượng trùng', value: 'soLuongTrongDotGiamGiaKhac' },
  { text: 'Sản phẩm & Màu sắc', value: 'sp.tenSanPham_va_MauSac' },
  { text: 'Bộ nhớ', value: 'bnt.dungLuongBoNhoTrong' },
  { text: 'Đơn giá', value: 'ctsp.giaBan' },
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
  errors.value = {};
  const today = new Date().toISOString().split('T')[0];
  console.log('Validating form with data:', {
    dotGiamGia: dotGiamGia.value,
    idDSPs: idDSPs.value
  });

  if (isEditMode.value) {
    if (!dotGiamGia.value.ma) {
      errors.value.ma = 'Vui lòng nhập mã đợt giảm giá';
    } else if (dotGiamGia.value.ma !== originalMa.value) {
      await checkDuplicateMa();
    }
  }

  if (!dotGiamGia.value.tenDotGiamGia) {
    errors.value.tenDotGiamGia = 'Vui lòng nhập tên đợt giảm giá';
  }

  if (!dotGiamGia.value.loaiGiamGiaApDung) {
    errors.value.loaiGiamGiaApDung = 'Vui lòng chọn loại giảm giá';
  }

  if (dotGiamGia.value.loaiGiamGiaApDung !== 'Tiền mặt' && dotGiamGia.value.giaTriGiamGia <= 0) {
    errors.value.giaTriGiamGia = 'Vui lòng nhập giá trị giảm giá lớn hơn 0';
  }

  if (!dotGiamGia.value.soTienGiamToiDa || dotGiamGia.value.soTienGiamToiDa <= 0) {
    errors.value.soTienGiamToiDa = 'Số tiền giảm tối đa phải lớn hơn 0';
  }

  if (!dotGiamGia.value.ngayBatDau) {
    errors.value.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
  } else if (dotGiamGia.value.ngayBatDau < today && !isEditMode.value) {
    errors.value.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại';
  }

  if (!dotGiamGia.value.ngayKetThuc || dotGiamGia.value.ngayKetThuc < dotGiamGia.value.ngayBatDau) {
    errors.value.ngayKetThuc = 'Vui lòng chọn ngày kết thúc hợp lệ';
  }

  if (idDSPs.value.length === 0) {
    console.log('No DSP selected, showing toast');
    toastNotification.value?.addToast({
      type: 'error',
      message: 'Vui lòng chọn ít nhất một dòng sản phẩm',
      duration: 3000,
    });
    return false;
  }

  console.log('Validation errors:', errors.value);
  return Object.keys(errors.value).length === 0;
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
  ctspList.value = ctspList.value.map(item => {
    if (item.ctsp.id === id) {
      return { ...item, selected: isChecked };
    }
    return item;
  });
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
  width: 50px; /* Kích thước chiều rộng ảnh */
  height: 50px; /* Kích thước chiều cao ảnh */
  object-fit: cover; /* Đảm bảo ảnh không bị méo */
  border-radius: 4px; /* Bo góc ảnh (tùy chọn) */
}
</style>