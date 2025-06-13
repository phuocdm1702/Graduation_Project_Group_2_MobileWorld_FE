<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container-fluid py-4">
      <HeaderCard
          :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thêm Đợt Giảm Giá'"
          badgeText="Hệ Thống POS"
          badgeClass="gradient-custom-teal"
          :backgroundOpacity="0.95"
      />

      <div class="container mx-auto px-4">
        <ToastNotification ref="toastNotification" />
        <NotificationModal
            ref="notificationModal"
            :type="'confirm'"
            :message="'Bạn có chắc chắn muốn ' + (isEditMode ? 'cập nhật' : 'thêm') + ' đợt giảm giá này?'"
            :confirmText="'Xác nhận'"
            :onConfirm="confirmAddData"
        />

        <!-- Container chính -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Form Đợt Giảm Giá -->
          <div class="card bg-white border rounded-lg shadow-md p-6 h-full">
            <FilterTableSection :title="isEditMode ? 'Cập Nhật Đợt Giảm Giá' : 'Thông Tin Đợt Giảm Giá'" icon="pi pi-plus-circle" class="h-full">
              <form @submit.prevent="showConfirmModal" class="p-3 space-y-4">
                <div class="mb-3">
                  <label class="filter-label">Tên đợt giảm giá</label>
                  <input
                      v-model="dotGiamGia.tenDotGiamGia"
                      type="text"
                      class="form-control input"
                      placeholder="Nhập tên đợt giảm giá"
                      required
                  />
                </div>
                <div class="mb-3">
                  <label class="filter-label">Loại giảm giá</label>
                  <select v-model="dotGiamGia.loaiGiamGiaApDung" class="form-control input" required>
                    <option value="" disabled>Chọn loại giảm giá</option>
                    <option value="Phần trăm">Phần trăm</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                  </select>
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
                </div>
                <div class="mb-3">
                  <label class="filter-label">Số tiền giảm tối đa</label>
                  <input
                      v-model="formattedSoTienGiamToiDa"
                      type="text"
                      class="form-control input"
                      placeholder="Nhập số tiền tối đa"
                      required
                  />
                </div>
                <div class="mb-3">
                  <label class="filter-label">Ngày bắt đầu</label>
                  <input
                      v-model="dotGiamGia.ngayBatDau"
                      type="date"
                      class="form-control input"
                      required
                  />
                </div>
                <div class="mb-3">
                  <label class="filter-label">Ngày kết thúc</label>
                  <input
                      v-model="dotGiamGia.ngayKetThuc"
                      type="date"
                      class="form-control input"
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
          <div class="card bg-white border rounded-lg shadow-md p-6 h-full">
            <FilterTableSection title="Sản Phẩm" icon="pi pi-box" class="h-full">
              <div class="p-3">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="filter-label">Tìm kiếm theo tên, mã...</label>
                    <div class="search-input-wrapper">
                      <i class="pi pi-search search-icon"></i>
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
            </FilterTableSection>
          </div>
        </div>

        <!-- Chi Tiết Sản Phẩm -->
        <div class="card bg-white border rounded-lg shadow-md p-6 mt-6">
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

              <DataTable
                  v-else
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
                  <img v-if="item.anh.duongDan" :src="item.anh.duongDan" alt="Ảnh" class="w-10 h-10 object-cover" />
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
          </FilterTableSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDotGiamGia } from '@/store/modules/promotions/DotGiamGiaForm.js';
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';

const router = useRouter();
const route = useRoute();

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
} = useDotGiamGia();

const toastNotification = ref(null);
const notificationModal = ref(null);

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

const showConfirmModal = () => {
  notificationModal.value.openModal();
};

const confirmAddData = () => {
  addData();
};

const handleCheckboxChangeCTSP = (id, isChecked) => {
  ctspList.value = ctspList.value.map(item => {
    if (item.ctsp.id === id) {
      return { ...item, selected: isChecked };
    }
    return item;
  });
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

.form-control.input {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #fff;
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

.btn-action:disabled {
  background: #a3e4d7;
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

.btn-danger:disabled {
  background: #e57373;
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

@media (max-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .h-full {
    height: auto;
  }
}
</style>