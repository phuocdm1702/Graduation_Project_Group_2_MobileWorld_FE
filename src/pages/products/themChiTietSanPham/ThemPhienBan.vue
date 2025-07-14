<template>
  <div class="container-fluid">
    <!-- Phiên Bản Section -->
    <FilterTableSection title="Thêm Phiên Bản" icon="bi bi-layers">
      <div class="m-3">
        <div class="row g-4">
          <!-- RAM -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">RAM</label>
              <div class="input-group">
                <button @click="openVariantModal('ram')" class="form-control search-input text-left">
                  {{
                    currentVariant.selectedRams.length > 0
                      ? currentVariant.selectedRams
                        .map((id) => ramOptions.find((r) => r.id === id)?.dungLuongRam)
                        .filter(Boolean)
                        .join(', ') || 'Không có RAM hợp lệ'
                      : 'Chọn RAM'
                  }}
                </button>
                <button @click="openAddModal('ram')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Bộ Nhớ Trong -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Bộ Nhớ Trong</label>
              <div class="input-group">
                <button @click="openVariantModal('boNhoTrong')" class="form-control search-input text-left">
                  {{
                    currentVariant.selectedBoNhoTrongs.length > 0
                      ? currentVariant.selectedBoNhoTrongs
                        .map((id) => boNhoTrongOptions.find((b) => b.id === id)?.dungLuongBoNhoTrong)
                        .filter(Boolean)
                        .join(', ') || 'Không có ROM hợp lệ'
                      : 'Chọn Bộ Nhớ Trong'
                  }}
                </button>
                <button @click="openAddModal('boNhoTrong')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Màu Sắc -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Màu Sắc</label>
              <div class="input-group">
                <button @click="openVariantModal('mauSac')" class="form-control search-input text-left">
                  {{
                    currentVariant.selectedMauSacs.length > 0
                      ? currentVariant.selectedMauSacs
                        .map((id) => mauSacOptions.find((m) => m.id === id)?.mauSac)
                        .filter(Boolean)
                        .join(', ') || 'Không có màu hợp lệ'
                      : 'Chọn Màu Sắc'
                  }}
                </button>
                <button @click="openAddModal('mauSac')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Generate Variants Button -->
        <div class="mt-3 d-flex justify-content-end align-items-start variant-button-container">
          <div class="text-end">
            <button @click="generateVariants" class="btn btn-action" :disabled="currentVariant.selectedRams.length === 0 ||
              currentVariant.selectedBoNhoTrongs.length === 0 ||
              currentVariant.selectedMauSacs.length === 0">
              {{ productVariants.length > 0 ? 'Tạo lại biến thể' : 'Tạo biến thể' }}
            </button>
            <small v-if="productVariants.length > 0" class="text-muted d-block mt-1">
              Nhấn lại để tạo lại các biến thể với lựa chọn mới
            </small>
          </div>
        </div>

        <!-- Danh sách biến thể -->
        <div v-if="!isLoading && productVariants.length > 0" class="mt-4">
          <div v-for="(group, groupIndex) in groupVariantsByRamAndRom" :key="groupIndex" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="table-count">Phiên bản {{ group.ram }}/{{ group.rom }}</span>
              <div class="action-buttons">
                <div class="filter-group me-3">
                  <input v-model="groupCommonValues[group.groupKey].price" type="text" placeholder="Nhập giá chung"
                    class="form-control search-input" @input="updateSelectedVariants(group)"
                    style="  border-top-right-radius: 8px; border-bottom-right-radius: 8px;" />
                </div>
                <button v-if="hasSelectedInGroup[group.groupKey]" @click="removeMultipleVariants" class="btn btn-reset">
                  <i class="bi bi-trash-fill me-2"></i>
                  Xóa {{ selectedVariantsInGroup(group).length }} Đã Chọn
                </button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th class="text-center">
                      <input type="checkbox" :checked="allSelected[group.groupKey] || false"
                        @change="toggleGroupSelection(group, $event.target.checked)" />
                    </th>
                    <th class="text-center">STT</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Màu Sắc</th>
                    <th>Đơn Giá</th>
                    <th>Số Lượng IMEI</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(variant, variantIndex) in group.variants" :key="variantIndex">
                    <td>
                      <input type="checkbox" v-model="selectedVariants" :value="group.startIndex + variantIndex"
                        @change="updateSelectedCount(group)" />
                    </td>
                    <td class="text-center">{{ variantIndex + 1 }}</td>
                    <td>{{ productData.tenSanPham || 'N/A' }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span class="color-swatch me-2"
                          :style="{ backgroundColor: mauSacOptions.find(mau => mau.id === variant.idMauSac)?.maMau || '#000' }"></span>
                        {{mauSacOptions.find(mau => mau.id === variant.idMauSac)?.mauSac || 'N/A'}}
                      </div>
                    </td>
                    <td>
                      <input v-model="variant.donGia" type="text" class="form-control search-input-table" />
                    </td>
                    <td class="text-center">
                      {{ variantImeis[group.startIndex + variantIndex]?.length || 0 }}
                    </td>
                    <td class="action-buttons-cell">
                      <button @click="openImeiModal(group.startIndex + variantIndex)" class="btn btn-sm btn-table"
                        title="Nhập IMEI">
                        <i class="bi bi-upc-scan"></i>
                      </button>
                      <button @click="removeVariant(group.startIndex + variantIndex)" class="btn btn-sm btn-table"
                        title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else-if="isLoading" class="mt-4">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    </FilterTableSection>

    <!-- Variant Selection Modal with Slider -->
    <div v-if="showVariantModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalTitles[currentStep] }}</h5>
            <button type="button" class="btn-close" @click="closeVariantModal"></button>
          </div>
          <div class="modal-body">
            <!-- Selection Summary -->
            <div class="selection-summary mb-4 p-3 border rounded bg-light">
              <h6 class="fw-bold mb-3">Đã chọn:</h6>
              <div class="row">
                <div class="col-md-4">
                  <strong>RAM: </strong>
                  <span v-if="currentVariant.selectedRams.length > 0">
                    {{currentVariant.selectedRams
                      .map((id) => ramOptions.find((r) => r.id === id)?.dungLuongRam)
                      .filter(Boolean)
                      .join(', ')}}
                  </span>
                  <span v-else class="text-muted">Chưa chọn</span>
                </div>
                <div class="col-md-4">
                  <strong>Bộ Nhớ Trong: </strong>
                  <span v-if="currentVariant.selectedBoNhoTrongs.length > 0">
                    {{currentVariant.selectedBoNhoTrongs
                      .map((id) => boNhoTrongOptions.find((b) => b.id === id)?.dungLuongBoNhoTrong)
                      .filter(Boolean)
                      .join(', ')}}
                  </span>
                  <span v-else class="text-muted">Chưa chọn</span>
                </div>
                <div class="col-md-4 perspective">
                  <strong>Màu Sắc: </strong>
                  <span v-if="currentVariant.selectedMauSacs.length > 0">
                    {{currentVariant.selectedMauSacs
                      .map((id) => mauSacOptions.find((m) => m.id === id)?.mauSac)
                      .filter(Boolean)
                      .join(', ')}}
                  </span>
                  <span v-else class="text-muted">Chưa chọn</span>
                </div>
              </div>
            </div>

            <!-- RAM Selection -->
            <div v-if="currentStep === 'ram'" class="variant-scroll-container">
              <div class="mb-3">
                <label class="filter-label">Tìm kiếm RAM</label>
                <input v-model="variantSearch" type="text" class="form-control search-input"
                  placeholder="Nhập dung lượng RAM..." />
              </div>
              <div class="row g-3">
                <div v-for="ram in filteredRamOptions" :key="ram.id" class="col-12">
                  <label class="variant-option d-flex align-items-center p-2 rounded">
                    <input type="checkbox" :value="ram.id" v-model="currentVariant.selectedRams"
                      class="me-2 variant-checkbox" />
                    <span class="variant-name">{{ ram.dungLuongRam }}</span>
                  </label>
                </div>
                <div v-if="filteredRamOptions.length === 0" class="col-12 text-center text-muted">
                  Không tìm thấy RAM phù hợp
                </div>
              </div>
            </div>

            <!-- ROM Selection -->
            <div v-if="currentStep === 'boNhoTrong'" class="variant-scroll-container">
              <div class="mb-3">
                <label class="filter-label">Tìm kiếm Bộ Nhớ Trong</label>
                <input v-model="variantSearch" type="text" class="form-control search-input"
                  placeholder="Nhập dung lượng bộ nhớ trong..." />
              </div>
              <div class="row g-3">
                <div v-for="boNho in filteredBoNhoTrongOptions" :key="boNho.id" class="col-12">
                  <label class="variant-option d-flex align-items-center p-2 rounded">
                    <input type="checkbox" :value="boNho.id" v-model="currentVariant.selectedBoNhoTrongs"
                      class="me-2 variant-checkbox" />
                    <span class="variant-name">{{ boNho.dungLuongBoNhoTrong }}</span>
                  </label>
                </div>
                <div v-if="filteredBoNhoTrongOptions.length === 0" class="col-12 text-center text-muted">
                  Không tìm thấy bộ nhớ trong phù hợp
                </div>
              </div>
            </div>

            <!-- Color Selection -->
            <div v-if="currentStep === 'mauSac'" class="variant-scroll-container">
              <div class="mb-3">
                <label class="filter-label">Tìm kiếm màu sắc</label>
                <input v-model="variantSearch" type="text" class="form-control search-input"
                  placeholder="Nhập tên màu hoặc mã màu..." />
              </div>
              <div class="row g-3">
                <div v-for="mau in filteredMauSacOptions" :key="mau.id" class="col-12">
                  <label class="variant-option d-flex align-items-center p-2 rounded">
                    <input type="checkbox" :value="mau.id" v-model="currentVariant.selectedMauSacs"
                      class="me-2 variant-checkbox" />
                    <span class="color-swatch me-2" :style="{ backgroundColor: mau.maMau || '#FFFFFF' }"
                      :title="mau.maMau"></span>
                    <div class="color-info flex-grow-1">
                      <span class="variant-name">{{ mau.mauSac }}</span>
                      <small class="color-code text-muted">{{ mau.maMau }}</small>
                    </div>
                  </label>
                </div>
                <div v-if="filteredMauSacOptions.length === 0" class="col-12 text-center text-muted">
                  Không tìm thấy màu sắc phù hợp
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="currentStep !== 'ram'" type="button" class="btn btn-reset" @click="prevStep">
              Quay lại
            </button>
            <button v-if="currentStep !== 'mauSac'" type="button" class="btn btn-action" @click="nextStep"
              :disabled="!canProceed">
              Tiếp theo
            </button>
            <button type="button" class="btn btn-reset" @click="closeVariantModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- IMEI Input Modal -->
    <div v-if="showImeiModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nhập IMEI cho biến thể {{ currentVariantLabel }}</h5>
            <button type="button" class="btn-close" @click="closeImeiModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="filter-label">Nhập IMEI</label>
              <textarea v-model="imeiInput" rows="6" class="form-control search-input"
                placeholder="Nhập IMEI, mỗi IMEI trên một dòng, đúng 15 chữ số..."
                @input="restrictImeiInput"></textarea>
            </div>
            <div class="imei-list mb-3">
              <h6 class="fw-bold">Danh sách IMEI: {{ filteredImeiList.length }} IMEI</h6>
              <div v-if="filteredImeiList.length > 0" class="imei-scroll-container">
                <div v-for="(imei, index) in filteredImeiList" :key="index"
                  class="imei-item d-flex align-items-center p-2">
                  <span class="flex-grow-1">
                    IMEI {{ index + 1 }}: {{ imei }}
                    <span :class="imei.length === 15 ? 'text-success' : 'text-danger'">
                      {{ imei.length === 15 ? '(Hợp lệ)' : `(Không hợp lệ, cần 15 số, hiện tại ${imei.length} số)` }}
                    </span>
                  </span>
                  <button @click="removeImei(index)" class="btn btn-sm btn-reset ms-2" title="Xóa IMEI">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
              <div v-else class="text-muted text-center">
                Chưa có IMEI nào được nhập
              </div>
            </div>
            <div class="row g-3">
              <div class="col-8">
                <label class="filter-label">Nhập từ file Excel</label>
                <input type="file" accept=".xlsx, .xls" @change="handleExcelImport" class="form-control search-input" />
              </div>
              <div class="col-4">
                <label class="filter-label">Tải mẫu Excel</label>
                <button @click="downloadImeiTemplate" class="btn btn-action w-100">
                  Tải mẫu IMEI
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-reset" @click="clearImeiInput">Xóa tất cả</button>
            <button type="button" class="btn btn-reset" @click="closeImeiModal">Đóng</button>
            <button type="button" class="btn btn-action" @click="saveImei"
              :disabled="validImeis.length === 0 && imeiInput.trim()">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for RAM, Bộ Nhớ Trong, Màu Sắc -->
    <div v-if="showFormModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm {{ currentAttributeLabel }}</h5>
            <button type="button" class="btn-close" @click="closeFormModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="currentAttribute === 'ram'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng RAM</label>
                <input v-model="entityData.dungLuongRam" type="text" class="form-control search-input"
                  placeholder="Nhập dung lượng RAM (ví dụ: 8GB)" />
              </div>
            </div>
            <div v-if="currentAttribute === 'boNhoTrong'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng Bộ Nhớ Trong</label>
                <input v-model="entityData.dungLuongBoNhoTrong" type="text" class="form-control search-input"
                  placeholder="Nhập dung lượng bộ nhớ trong (ví dụ: 128GB)" />
              </div>
            </div>
            <div v-if="currentAttribute === 'mauSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Màu Sắc</label>
                <input v-model="entityData.mauSac" type="text" class="form-control search-input"
                  placeholder="Nhập tên màu sắc (ví dụ: Đen)" />
              </div>
              <div class="col-12">
                <label class="filter-label">Mã Màu (Hex)</label>
                <div class="input-group">
                  <input v-model="entityData.maMau" type="text" class="form-control search-input"
                    placeholder="Nhập mã màu (ví dụ: #FFFFFF)" />
                  <span class="input-group-text color-preview"
                    :style="{ backgroundColor: isValidHex(entityData.maMau) ? entityData.maMau : '#FFFFFF' }"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-reset" @click="closeFormModal">
              Đóng
            </button>
            <button type="button" class="btn btn-action" @click="handleAddAttribute">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getRam, addRam, getBoNhoTrong, addBoNhoTrong, getMauSac, addMauSac } from '@/store/modules/products/chiTietSanPham';
import * as XLSX from 'xlsx';
import { nextTick } from 'vue';

export default defineComponent({
  name: 'ProductVariants',
  components: {
    FilterTableSection,
    ToastNotification,
  },
  props: {
    productData: {
      type: Object,
      required: true,
    },
    productVariants: {
      type: Array,
      default: () => [],
    },
    variantImeis: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['variants-updated', 'reset-form'],
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const isLoading = ref(true);
    const localProductVariants = ref([...props.productVariants]);
    const localVariantImeis = ref({ ...props.variantImeis });
    const currentVariant = ref({
      selectedRams: [],
      selectedBoNhoTrongs: [],
      selectedMauSacs: [],
    });
    const selectedVariants = ref([]);
    const allSelected = ref({});
    const groupCommonValues = ref({});
    const ramOptions = ref([]);
    const boNhoTrongOptions = ref([]);
    const mauSacOptions = ref([]);
    const showFormModal = ref(false);
    const currentAttribute = ref('');
    const showVariantModal = ref(false);
    const showImeiModal = ref(false);
    const currentVariantIndex = ref(null);
    const imeiInput = ref('');
    const entityData = ref({});
    const variantSearch = ref('');
    const currentStep = ref('ram');

    const modalTitles = {
      ram: 'Chọn RAM',
      boNhoTrong: 'Chọn Bộ Nhớ Trong',
      mauSac: 'Chọn Màu Sắc',
    };

    // Watch for changes in props.productData to update local state
    watch(() => props.productData, (newProductData) => {
      console.log('ProductData updated in ThemPhienBan:', newProductData);
      updateSelectedOptions();
      validateSelections();
    }, { deep: true });

    // Watch for changes in props.productVariants and props.variantImeis to reset local state
    watch(() => props.productVariants, (newVariants) => {
      localProductVariants.value = [...newVariants];
      updateSelectedOptions();
      validateSelections();
      console.log('ProductVariants updated - localProductVariants:', localProductVariants.value);
    }, { deep: true });

    watch(() => props.variantImeis, (newImeis) => {
      localVariantImeis.value = { ...newImeis };
      console.log('ProductVariants updated - localVariantImeis:', localVariantImeis.value);
    }, { deep: true });

    const groupVariantsByRamAndRom = computed(() => {
      const groups = [];
      const grouped = {};

      localProductVariants.value.forEach((variant, index) => {
        const ramOption = ramOptions.value.find((r) => r.id === variant.idRam);
        const romOption = boNhoTrongOptions.value.find((b) => b.id === variant.idBoNhoTrong);
        const ram = ramOption ? ramOption.dungLuongRam : 'Unknown';
        const rom = romOption ? romOption.dungLuongBoNhoTrong : 'Unknown';

        if (!ramOption || !romOption) {
          console.warn('Không tìm thấy RAM hoặc ROM cho variant:', variant);
        }

        const groupKey = `${ram}/${rom}`;

        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            ram,
            rom,
            groupKey,
            variants: [],
            startIndex: index,
          };
          groups.push(grouped[groupKey]);
        }
        grouped[groupKey].variants.push(variant);
      });

      return groups;
    });

    const hasSelectedInGroup = computed(() => {
      const result = {};
      groupVariantsByRamAndRom.value.forEach((group) => {
        const groupKey = group.groupKey;
        const groupIndices = group.variants.map((_, index) => group.startIndex + index);
        result[groupKey] = groupIndices.some((index) => selectedVariants.value.includes(index));
      });
      return result;
    });

    const selectedVariantsInGroup = (group) => {
      const groupIndices = group.variants.map((_, index) => group.startIndex + index);
      return selectedVariants.value.filter((index) => groupIndices.includes(index));
    };

    const currentVariantLabel = computed(() => {
      if (currentVariantIndex.value === null) return '';
      const variant = localProductVariants.value[currentVariantIndex.value];
      if (!variant) return '';
      const ram = ramOptions.value.find((r) => r.id === variant.idRam)?.dungLuongRam || 'Unknown';
      const rom = boNhoTrongOptions.value.find((b) => b.id === variant.idBoNhoTrong)?.dungLuongBoNhoTrong || 'Unknown';
      const color = mauSacOptions.value.find((m) => m.id === variant.idMauSac)?.mauSac || 'Unknown';
      return `${ram}/${rom}/${color}`;
    });

    const filteredImeiList = computed(() => {
      return imeiInput.value
        .split('\n')
        .map((imei) => imei.trim())
        .filter((imei) => imei.length > 0);
    });

    const validImeis = computed(() => {
      const existingImeis = new Set(
        Object.values(localVariantImeis.value).flat().filter((imei) => imei.length === 15)
      );
      return filteredImeiList.value
        .filter((imei) => imei.length === 15 && !existingImeis.has(imei))
        .map((imei) => imei);
    });

    const filteredRamOptions = computed(() => {
      if (!variantSearch.value.trim()) return ramOptions.value;
      const searchTerm = variantSearch.value.toLowerCase();
      return ramOptions.value.filter(
        (ram) => ram.dungLuongRam.toLowerCase().includes(searchTerm)
      );
    });

    const filteredBoNhoTrongOptions = computed(() => {
      if (!variantSearch.value.trim()) return boNhoTrongOptions.value;
      const searchTerm = variantSearch.value.toLowerCase();
      return boNhoTrongOptions.value.filter(
        (boNho) => boNho.dungLuongBoNhoTrong.toLowerCase().includes(searchTerm)
      );
    });

    const filteredMauSacOptions = computed(() => {
      if (!variantSearch.value.trim()) return mauSacOptions.value;
      const searchTerm = variantSearch.value.toLowerCase();
      return mauSacOptions.value.filter(
        (mau) =>
          mau.mauSac.toLowerCase().includes(searchTerm) ||
          mau.maMau.toLowerCase().includes(searchTerm)
      );
    });

    const currentAttributeLabel = computed(() => {
      const labels = {
        ram: 'RAM',
        boNhoTrong: 'Bộ Nhớ Trong',
        mauSac: 'Màu Sắc',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

    const canProceed = computed(() => {
      if (currentStep.value === 'ram') return currentVariant.value.selectedRams.length > 0;
      if (currentStep.value === 'boNhoTrong') return currentVariant.value.selectedBoNhoTrongs.length > 0;
      return true;
    });

    const isValidHex = (hex) => {
      return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
    };

    // Fetch data from APIs
    const fetchData = async () => {
      try {
        const [ramRes, boNhoTrongRes, mauSacRes] = await Promise.all([
          getRam(),
          getBoNhoTrong(),
          getMauSac(),
        ]);
        ramOptions.value = ramRes.data || [];
        boNhoTrongOptions.value = boNhoTrongRes.data || [];
        mauSacOptions.value = (mauSacRes.data || []).map(item => ({
          id: item.id,
          ma: item.ma,
          mauSac: item.mauSac,
          maMau: item.maMau,
          deleted: item.deleted
        }));
        isLoading.value = false;
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải dữ liệu: ' + error.message,
          duration: 3000,
        });
        isLoading.value = false;
      }
    };

    fetchData();

    // Update selected options based on current variants
    const updateSelectedOptions = () => {
      const rams = new Set();
      const boNhoTrongs = new Set();
      const mauSacs = new Set();

      localProductVariants.value.forEach((variant) => {
        rams.add(variant.idRam);
        boNhoTrongs.add(variant.idBoNhoTrong);
        mauSacs.add(variant.idMauSac);
      });

      currentVariant.value.selectedRams = [...rams].filter(Boolean);
      currentVariant.value.selectedBoNhoTrongs = [...boNhoTrongs].filter(Boolean);
      currentVariant.value.selectedMauSacs = [...mauSacs].filter(Boolean);
    };

    const generateVariants = () => {
      if (!props.productData.tenSanPham) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn một sản phẩm trước khi thêm biến thể!',
          duration: 3000,
        });
        return false;
      }

      if (
        currentVariant.value.selectedRams.length === 0 ||
        currentVariant.value.selectedBoNhoTrongs.length === 0 ||
        currentVariant.value.selectedMauSacs.length === 0
      ) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn ít nhất một RAM, một Bộ Nhớ Trong và một Màu Sắc!',
          duration: 3000,
        });
        return false;
      }

      // Lưu danh sách biến thể cũ để sao chép giá và IMEI
      const oldVariants = [...localProductVariants.value];
      const oldImeis = { ...localVariantImeis.value };
      const newVariants = [];

      // Tạo danh sách biến thể mới
      currentVariant.value.selectedRams.forEach((ramId) => {
        currentVariant.value.selectedBoNhoTrongs.forEach((boNhoId) => {
          currentVariant.value.selectedMauSacs.forEach((mauSacId) => {
            // Tìm biến thể cũ để giữ giá
            const existingVariant = oldVariants.find(
              (v) => v.idRam === ramId && v.idBoNhoTrong === boNhoId && v.idMauSac === mauSacId
            );
            newVariants.push({
              idRam: ramId,
              idBoNhoTrong: boNhoId,
              idMauSac: mauSacId,
              donGia: existingVariant ? existingVariant.donGia : '',
            });
          });
        });
      });

      // Cập nhật lại IMEI cho các biến thể vẫn còn
      const newVariantImeis = {};
      newVariants.forEach((variant, index) => {
        const oldIndex = oldVariants.findIndex(
          (v) => v.idRam === variant.idRam && v.idBoNhoTrong === variant.idBoNhoTrong && v.idMauSac === variant.idMauSac
        );
        if (oldIndex !== -1 && oldImeis[oldIndex]) {
          newVariantImeis[index] = [...oldImeis[oldIndex]];
        }
      });

      // Cập nhật state
      localProductVariants.value = [...newVariants];
      localVariantImeis.value = newVariantImeis;
      selectedVariants.value = [];
      allSelected.value = {};
      groupCommonValues.value = {};

      // Cập nhật lại các lựa chọn và trạng thái
      updateSelectedOptions();
      validateSelections();

      // Phát sự kiện để cập nhật biến thể
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
      console.log('Emitting productVariants:', localProductVariants.value);
      console.log('Emitting variantImeis:', localVariantImeis.value);

      toastNotification.value?.addToast({
        type: 'success',
        message: 'Tạo lại biến thể thành công!',
        duration: 3000,
      });

      return true;
    };

    const removeVariant = (index) => {
      localProductVariants.value.splice(index, 1);
      delete localVariantImeis.value[index];
      selectedVariants.value = selectedVariants.value.filter((i) => i !== index);
      validateSelections();
      updateSelectedOptions();
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
    };

    const removeMultipleVariants = () => {
      localProductVariants.value = localProductVariants.value.filter(
        (_, index) => !selectedVariants.value.includes(index)
      );
      selectedVariants.value.forEach((index) => {
        delete localVariantImeis.value[index];
      });
      selectedVariants.value = [];
      validateSelections();
      updateSelectedOptions();
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
    };

    const updateSelectedVariants = (group) => {
      const groupKey = group.groupKey;
      const price = groupCommonValues.value[groupKey]?.price || '';
      if (price) {
        group.variants.forEach((variant, index) => {
          localProductVariants.value[group.startIndex + index].donGia = price;
        });
      }
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
    };

    const toggleGroupSelection = (group, checked) => {
      const groupKey = group.groupKey;
      allSelected.value[groupKey] = checked;
      const groupIndices = group.variants.map((_, index) => group.startIndex + index);
      if (checked) {
        selectedVariants.value = [...new Set([...selectedVariants.value, ...groupIndices])];
      } else {
        selectedVariants.value = selectedVariants.value.filter(
          (index) => !groupIndices.includes(index)
        );
      }
    };

    const updateSelectedCount = (group) => {
      const groupKey = group.groupKey;
      const groupIndices = group.variants.map((_, index) => group.startIndex + index);
      allSelected.value[groupKey] = groupIndices.every((index) =>
        selectedVariants.value.includes(index)
      );
    };

    const validateSelections = () => {
      groupVariantsByRamAndRom.value.forEach((group) => {
        const groupKey = `${group.ram}/${group.rom}`;
        if (!(groupKey in allSelected.value)) {
          allSelected.value[groupKey] = false;
          groupCommonValues.value[groupKey] = { price: '' };
        }
      });
    };

    const openAddModal = (attribute) => {
      currentAttribute.value = attribute;
      entityData.value = {};
      showFormModal.value = true;
    };

    const closeFormModal = () => {
      showFormModal.value = false;
      currentAttribute.value = '';
      entityData.value = {};
    };

    const handleAddAttribute = async () => {
      try {
        const newId = `new_${Date.now()}`;
        const data = { id: newId, ...entityData.value };
        switch (currentAttribute.value) {
          case 'ram':
            await addRam(data);
            ramOptions.value.push(data);
            break;
          case 'boNhoTrong':
            await addBoNhoTrong(data);
            boNhoTrongOptions.value.push(data);
            break;
          case 'mauSac':
            data.ma = `MS${Date.now().toString().slice(-5)}`;
            data.deleted = false;
            await addMauSac(data);
            mauSacOptions.value.push(data);
            break;
        }
        toastNotification.value?.addToast({
          type: 'success',
          message: `Thêm ${currentAttributeLabel.value} thành công!`,
          duration: 3000,
        });
        closeFormModal();
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Lỗi khi thêm ${currentAttributeLabel.value}: ${error.message}`,
          duration: 3000,
        });
      }
    };

    const openVariantModal = (step) => {
      currentStep.value = step;
      variantSearch.value = '';
      showVariantModal.value = true;
    };

    const closeVariantModal = () => {
      showVariantModal.value = false;
      currentStep.value = 'ram';
      variantSearch.value = '';
    };

    const nextStep = () => {
      if (currentStep.value === 'ram' && currentVariant.value.selectedRams.length > 0) {
        currentStep.value = 'boNhoTrong';
      } else if (currentStep.value === 'boNhoTrong' && currentVariant.value.selectedBoNhoTrongs.length > 0) {
        currentStep.value = 'mauSac';
      }
    };

    const prevStep = () => {
      if (currentStep.value === 'mauSac') {
        currentStep.value = 'boNhoTrong';
      } else if (currentStep.value === 'boNhoTrong') {
        currentStep.value = 'ram';
      }
    };

    const openImeiModal = (index) => {
      currentVariantIndex.value = index;
      imeiInput.value = localVariantImeis.value[index]?.join('\n') || '';
      showImeiModal.value = true;
    };

    const closeImeiModal = () => {
      showImeiModal.value = false;
      currentVariantIndex.value = null;
      imeiInput.value = '';
    };

    const restrictImeiInput = (event) => {
      const textarea = event.target;
      let lines = imeiInput.value.split('\n');
      let cursorPos = textarea.selectionStart;
      let currentLineIndex = imeiInput.value.substr(0, cursorPos).split('\n').length - 1;
      let currentLine = lines[currentLineIndex] || '';

      // Chỉ giữ số và giới hạn 15 ký tự mỗi dòng
      lines = lines.map((line, index) => {
        let cleaned = line.replace(/[^0-9]/g, '').slice(0, 15);
        if (index === currentLineIndex && cleaned.length >= 15 && imeiInput.value[cursorPos - 1] !== '\n') {
          cleaned += '\n';
        }
        return cleaned;
      });

      imeiInput.value = lines.join('\n');

      // Cập nhật vị trí con trỏ
      const newLines = imeiInput.value.split('\n');
      let newCursorPos = 0;
      for (let i = 0; i < Math.min(currentLineIndex, newLines.length); i++) {
        newCursorPos += newLines[i].length + 1;
      }
      newCursorPos += Math.min(currentLine.replace(/[^0-9]/g, '').length, 15);
      if (currentLine.replace(/[^0-9]/g, '').length >= 15 && imeiInput.value[cursorPos - 1] !== '\n') {
        newCursorPos++;
      }
      setTimeout(() => textarea.setSelectionRange(newCursorPos, newCursorPos), 0);

      // Kiểm tra và thông báo lỗi
      const invalidLines = lines.filter(line => line.length > 0 && line.length !== 15);
      if (invalidLines.length > 0) {
        toastNotification.value?.addToast({
          type: 'warning',
          message: `Có ${invalidLines.length} IMEI không hợp lệ (cần đúng 15 chữ số)!`,
          duration: 3000,
        });
      }
    };

    const removeImei = (index) => {
      const lines = imeiInput.value.split('\n').filter((_, i) => i !== index);
      imeiInput.value = lines.join('\n');
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã xóa IMEI thành công!',
        duration: 2000,
      });
    };

    const clearImeiInput = () => {
      imeiInput.value = '';
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã xóa tất cả IMEI!',
        duration: 2000,
      });
    };

    const saveImei = () => {
      const existingImeis = new Set(
        Object.values(localVariantImeis.value)
          .flat()
          .filter((imei) => imei.length === 15)
      );
      const newImeis = validImeis.value;
      const duplicates = newImeis.filter((imei) => existingImeis.has(imei));
      const invalidImeis = filteredImeiList.value.filter((imei) => imei.length !== 15 && imei.length > 0);

      if (filteredImeiList.value.length > 0 && newImeis.length === 0) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Không có IMEI hợp lệ! Tất cả IMEI phải có đúng 15 chữ số.',
          duration: 3000,
        });
        return;
      }

      if (invalidImeis.length > 0) {
        toastNotification.value?.addToast({
          type: 'warning',
          message: `Có ${invalidImeis.length} IMEI không hợp lệ đã bị bỏ qua.`,
          duration: 3000,
        });
      }

      if (duplicates.length > 0) {
        toastNotification.value?.addToast({
          type: 'warning',
          message: `Có ${duplicates.length} IMEI trùng lặp đã bị bỏ qua.`,
          duration: 3000,
        });
      }

      if (newImeis.length > 0) {
        localVariantImeis.value[currentVariantIndex.value] = [...(localVariantImeis.value[currentVariantIndex.value] || []), ...newImeis];
        emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
        toastNotification.value?.addToast({
          type: 'success',
          message: `Lưu ${newImeis.length} IMEI thành công!`,
          duration: 3000,
        });
      } else {
        toastNotification.value?.addToast({
          type: 'info',
          message: 'Không có IMEI mới nào được lưu.',
          duration: 3000,
        });
      }

      closeImeiModal();
    };

    const handleExcelImport = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: ['IMEI'] });
          const existingImeis = new Set(
            Object.values(localVariantImeis.value).flat().filter((imei) => imei.length === 15)
          );
          const imeis = json
            .map((row) => row.IMEI?.toString().replace(/[^0-9]/g, '').slice(0, 15))
            .filter((imei) => imei && imei.length === 15 && !existingImeis.has(imei));
          const duplicates = json
            .map((row) => row.IMEI?.toString().replace(/[^0-9]/g, '').slice(0, 15))
            .filter((imei) => imei && imei.length === 15 && existingImeis.has(imei));
          const invalid = json
            .map((row) => row.IMEI?.toString().replace(/[^0-9]/g, ''))
            .filter((imei) => imei && imei.length !== 15);

          if (imeis.length === 0 && (duplicates.length > 0 || invalid.length > 0)) {
            toastNotification.value?.addToast({
              type: 'error',
              message: `Không có IMEI hợp lệ mới! ${duplicates.length} trùng lặp, ${invalid.length} không hợp lệ.`,
              duration: 3000,
            });
            return;
          }

          imeiInput.value = [...filteredImeiList.value, ...imeis].join('\n');
          toastNotification.value?.addToast({
            type: 'success',
            message: `Đã nhập ${imeis.length} IMEI hợp lệ từ Excel!${duplicates.length > 0 ? ` (${duplicates.length} trùng lặp bị bỏ qua)` : ''}${invalid.length > 0 ? ` (${invalid.length} không hợp lệ bị bỏ qua)` : ''}`,
            duration: 3000,
          });
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi nhập file Excel: ' + error.message,
          duration: 3000,
        });
      }
    };

    const downloadImeiTemplate = () => {
      const ws = XLSX.utils.json_to_sheet([{ IMEI: '123456789012345' }], { header: ['IMEI'] });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'IMEI Template');
      XLSX.write(wb, 'imei_template.xlsx');
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã tải mẫu Excel! Mỗi IMEI phải có đúng 15 chữ số.',
        duration: 3000,
      });
    };

    const resetForm = async () => {
      localProductVariants.value = [];
      localVariantImeis.value = {};
      currentVariant.value = {
        selectedRams: [],
        selectedBoNhoTrongs: [],
        selectedMauSacs: [],
      };
      selectedVariants.value = [];
      allSelected.value = {};
      groupCommonValues.value = {};
      showVariantModal.value = false;
      showImeiModal.value = false;
      showFormModal.value = false;
      currentAttribute.value = '';
      imeiInput.value = '';
      entityData.value = {};
      variantSearch.value = '';
      currentStep.value = 'ram';
      await nextTick();
      emit('variants-updated', { variants: [], imeis: {} });
      emit('reset-form');
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã làm mới danh sách biến thể!',
        duration: 3000,
      });
    };

    return {
      toastNotification,
      productVariants: localProductVariants,
      variantImeis: localVariantImeis,
      currentVariant,
      selectedVariants,
      allSelected,
      groupCommonValues,
      ramOptions,
      boNhoTrongOptions,
      mauSacOptions,
      isLoading,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      showVariantModal,
      showImeiModal,
      currentVariantIndex,
      imeiInput,
      entityData,
      variantSearch,
      currentStep,
      modalTitles,
      currentVariantLabel,
      groupVariantsByRamAndRom,
      hasSelectedInGroup,
      selectedVariantsInGroup,
      filteredImeiList,
      validImeis,
      filteredRamOptions,
      filteredBoNhoTrongOptions,
      filteredMauSacOptions,
      canProceed,
      generateVariants,
      openAddModal,
      closeFormModal,
      handleAddAttribute,
      openVariantModal,
      closeVariantModal,
      nextStep,
      prevStep,
      openImeiModal,
      closeImeiModal,
      saveImei,
      removeVariant,
      removeMultipleVariants,
      updateSelectedVariants,
      toggleGroupSelection,
      updateSelectedCount,
      handleExcelImport,
      downloadImeiTemplate,
      resetForm,
      isValidHex,
      restrictImeiInput,
      removeImei,
      clearImeiInput,
    };
  },
});
</script>

<style scoped>
td,
th {
  text-align: center;
}

.variant-button-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.text-end {
  text-align: end;
}

.color-swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  min-width: 100%;
}

.table-count {
  font-weight: 600;
  color: #1f3a44;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-table {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-table i {
  margin: 0;
}

.text-left {
  text-align: left;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-input-table {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus,
.search-input-table:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.form-control {
  padding: 7px 14px;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-action:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.modal-header {
  border-bottom: 1px solid rgba(52, 211, 153, 0.2);
}

.modal-title {
  font-weight: 600;
  color: #1f3a44;
}

.modal-footer {
  border-top: 1px solid rgba(52, 211, 153, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-close {
  color: #6c757d;
}

.btn-close:hover {
  color: #1f3a44;
}

.variant-option {
  transition: all 0.2s ease;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.variant-option:hover {
  background: rgba(52, 211, 153, 0.1);
  border-color: #34d399;
  transform: translateY(-2px);
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.variant-option:hover .color-swatch {
  transform: scale(1.1);
}

.variant-checkbox {
  width: 18px;
  height: 18px;
}

.color-info {
  display: flex;
  flex-direction: column;
}

.variant-name {
  font-weight: 500;
  color: #1f3a44;
}

.color-code {
  font-size: 0.8rem;
}

.color-preview {
  width: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 0 8px 8px 0;
}

.variant-scroll-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.variant-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.variant-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.variant-scroll-container::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 4px;
}

.variant-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

.selection-summary {
  background-color: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.imei-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.imei-list::-webkit-scrollbar {
  width: 8px;
}

.imei-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.imei-list::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 4px;
}

.imei-list::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

.imei-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.imei-item:hover {
  background: rgba(52, 211, 153, 0.1);
  border-color: #34d399;
}
</style>