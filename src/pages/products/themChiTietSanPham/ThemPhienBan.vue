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
                <button @click="toggleDropdown('ram')" class="form-control search-input text-left">
                  {{
                    currentVariant.selectedRams.length > 0
                      ? currentVariant.selectedRams
                        .map((id) => ramOptions.find((r) => r.id === id)?.dungLuongRam)
                        .filter(Boolean)
                        .join(', ') || 'Không có RAM hợp lệ'
                      : 'Chọn RAM'
                  }}
                </button>
                <div v-if="dropdownOpen.ram" class="dropdown-menu show">
                  <label v-for="ram in ramOptions" :key="ram.id" class="dropdown-item flex items-center">
                    <input type="checkbox" :value="ram.id" v-model="currentVariant.selectedRams" class="me-2" />
                    {{ ram.dungLuongRam }}
                  </label>
                </div>
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
                <button @click="toggleDropdown('boNhoTrong')" class="form-control search-input text-left">
                  {{
                    currentVariant.selectedBoNhoTrongs.length > 0
                      ? currentVariant.selectedBoNhoTrongs
                        .map((id) => boNhoTrongOptions.find((b) => b.id === id)?.dungLuongBoNhoTrong)
                        .filter(Boolean)
                        .join(', ') || 'Không có ROM hợp lệ'
                      : 'Chọn Bộ Nhớ Trong'
                  }}
                </button>
                <div v-if="dropdownOpen.boNhoTrong" class="dropdown-menu show">
                  <label v-for="boNho in boNhoTrongOptions" :key="boNho.id" class="dropdown-item flex items-center">
                    <input type="checkbox" :value="boNho.id" v-model="currentVariant.selectedBoNhoTrongs"
                      class="me-2" />
                    {{ boNho.dungLuongBoNhoTrong }}
                  </label>
                </div>
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
                <button @click="openColorModal" class="form-control search-input text-left">
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

        <!-- Danh sách biến thể -->
        <div v-if="!isLoading && productVariants.length > 0" class="mt-4">
          <div v-for="(group, groupIndex) in groupVariantsByRamAndRom" :key="groupIndex" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="table-count">Phiên bản {{ group.ram }}/{{ group.rom }}</span>
              <div class="action-buttons">
                <div class="filter-group me-3">
                  <label class="filter-label">Giá Chung</label>
                  <input v-model="groupCommonValues[group.groupKey].price" type="text" placeholder="Nhập giá chung"
                    class="form-control search-input" @input="updateSelectedVariants(group)" />
                </div>
                <button v-if="selectedVariants.length > 0" @click="removeMultipleVariants" class="btn btn-reset">
                  <i class="bi bi-trash-fill me-2"></i>
                  Xóa {{ selectedVariants.length }} Đã Chọn
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
                      <input v-model="variant.donGia" type="text" class="form-control search-input" />
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

    <!-- Color Selection Modal -->
    <div v-if="showColorModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chọn Màu Sắc</h5>
            <button type="button" class="btn-close" @click="closeColorModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div v-for="mau in mauSacOptions" :key="mau.id" class="col-4">
                <label class="d-flex align-items-center">
                  <input type="checkbox" :value="mau.id" v-model="currentVariant.selectedMauSacs" class="me-2" />
                  <span class="color-swatch me-2" :style="{ backgroundColor: mau.maMau || '#FFFFFF' }"></span>
                  <span>{{ mau.mauSac }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-reset" @click="closeColorModal">
              Đóng
            </button>
            <button type="button" class="btn btn-action" @click="confirmColorSelection">
              Xác nhận
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
            <h5 class="modal-title">Nhập IMEI</h5>
            <button type="button" class="btn-close" @click="closeImeiModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="filter-label">Nhập IMEI (mỗi IMEI trên một dòng)</label>
              <textarea v-model="imeiInput" rows="5" class="form-control search-input"
                placeholder="Nhập IMEI, mỗi IMEI trên một dòng..."></textarea>
              <div class="mt-2">
                <p v-for="(imei, index) in filteredImeiList" :key="index" class="text-sm">
                  IMEI {{ index + 1 }}: {{ imei.length }} chữ số
                  <span :class="imei.length === 15 ? 'text-success' : 'text-danger'">
                    {{ imei.length === 15 ? '(Đủ 15 số)' : '(Cần 15 số)' }}
                  </span>
                </p>
                <p v-if="!imeiInput.trim()" class="text-sm">Chưa nhập IMEI</p>
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
            <button type="button" class="btn btn-reset" @click="closeImeiModal">
              Đóng
            </button>
            <button type="button" class="btn btn-action" @click="saveImei">
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
                <input v-model="entityData.maMau" type="text" class="form-control search-input"
                  placeholder="Nhập mã màu (ví dụ: #FFFFFF)" />
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
    const dropdownOpen = ref({
      ram: false,
      boNhoTrong: false,
    });
    const showFormModal = ref(false);
    const currentAttribute = ref('');
    const showColorModal = ref(false);
    const showImeiModal = ref(false);
    const currentVariantIndex = ref(null);
    const imeiInput = ref('');
    const entityData = ref({});

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

    const filteredImeiList = computed(() => {
      return imeiInput.value
        .split('\n')
        .map((imei) => imei.trim())
        .filter((imei) => imei.length > 0);
    });

    const currentAttributeLabel = computed(() => {
      const labels = {
        ram: 'RAM',
        boNhoTrong: 'Bộ Nhớ Trong',
        mauSac: 'Màu Sắc',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

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

    const toggleDropdown = (type) => {
      dropdownOpen.value[type] = !dropdownOpen.value[type];
      Object.keys(dropdownOpen.value).forEach((key) => {
        if (key !== type) {
          dropdownOpen.value[key] = false;
        }
      });
    };

    const closeAllDropdowns = () => {
      Object.keys(dropdownOpen.value).forEach((key) => {
        dropdownOpen.value[key] = false;
      });
    };

    const addVariant = () => {
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

      const newVariants = [];
      currentVariant.value.selectedRams.forEach((ramId) => {
        currentVariant.value.selectedBoNhoTrongs.forEach((boNhoId) => {
          currentVariant.value.selectedMauSacs.forEach((mauSacId) => {
            const exists = localProductVariants.value.some(
              (variant) =>
                variant.idRam === ramId &&
                variant.idBoNhoTrong === boNhoId &&
                variant.idMauSac === mauSacId
            );
            if (!exists) {
              newVariants.push({
                idRam: ramId,
                idBoNhoTrong: boNhoId,
                idMauSac: mauSacId,
                donGia: '',
              });
            }
          });
        });
      });

      if (newVariants.length > 0) {
        localProductVariants.value = [...localProductVariants.value, ...newVariants];
        updateSelectedOptions();
        validateSelections();
        emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
        console.log('Emitting productVariants:', localProductVariants.value);
        console.log('Emitting variantImeis:', localVariantImeis.value);
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm biến thể thành công!',
          duration: 3000,
        });
        return true;
      }
      return false;
    };

    const removeVariant = (index) => {
      localProductVariants.value.splice(index, 1);
      delete localVariantImeis.value[index];
      selectedVariants.value = selectedVariants.value.filter((i) => i !== index);
      validateSelections();
      updateSelectedOptions();
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
      console.log('After removeVariant - productVariants:', localProductVariants.value);
      console.log('After removeVariant - variantImeis:', localVariantImeis.value);
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
      console.log('After removeMultipleVariants - productVariants:', localProductVariants.value);
      console.log('After removeMultipleVariants - variantImeis:', localVariantImeis.value);
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
      closeAllDropdowns();
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

    const openColorModal = () => {
      closeAllDropdowns();
      showColorModal.value = true;
    };

    const closeColorModal = () => {
      showColorModal.value = false;
    };

    const confirmColorSelection = () => {
      const success = addVariant();
      if (success) {
        closeColorModal();
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

    const saveImei = () => {
      const imeis = filteredImeiList.value.filter((imei) => imei.length === 15);
      if (imeis.length === 0 && imeiInput.value.trim()) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Không có IMEI hợp lệ (cần 15 chữ số)!',
          duration: 3000,
        });
        return;
      }
      localVariantImeis.value[currentVariantIndex.value] = imeis;
      emit('variants-updated', { variants: localProductVariants.value, imeis: localVariantImeis.value });
      console.log('After saveImei - variantImeis:', localVariantImeis.value);
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Lưu IMEI thành công!',
        duration: 3000,
      });
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
          const json = XLSX.utils.sheet_to_json(sheet);
          const imeis = json
            .map((row) => row.IMEI?.toString().trim())
            .filter((imei) => imei && imei.length === 15);
          imeiInput.value = imeis.join('\n');
          toastNotification.value?.addToast({
            type: 'success',
            message: `Đã nhập ${imeis.length} IMEI từ Excel!`,
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
      const ws = XLSX.utils.json_to_sheet([{ IMEI: '123456789012345' }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'IMEI Template');
      XLSX.write(wb, 'imei_template.xlsx');
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã tải mẫu Excel!',
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
  closeAllDropdowns();
  showColorModal.value = false;
  showImeiModal.value = false;
  showFormModal.value = false;
  currentAttribute.value = '';
  imeiInput.value = '';
  entityData.value = {};
  await nextTick(); // Đảm bảo giao diện được cập nhật
  emit('variants-updated', { variants: [], imeis: {} });
  emit('reset-form');
  toastNotification.value?.addToast({
    type: 'info',
    message: 'Đã làm mới danh sách biến thể!',
    duration: 3000,
  });
  console.log('ProductVariants reset - localProductVariants:', localProductVariants.value);
  console.log('ProductVariants reset - currentVariant:', currentVariant.value);
};

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.input-group')) {
        closeAllDropdowns();
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

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
      dropdownOpen,
      isLoading,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      showColorModal,
      showImeiModal,
      currentVariantIndex,
      imeiInput,
      entityData,
      groupVariantsByRamAndRom,
      filteredImeiList,
      toggleDropdown,
      openAddModal,
      closeFormModal,
      handleAddAttribute,
      openColorModal,
      closeColorModal,
      confirmColorSelection,
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
    };
  },
});
</script>

<style scoped>
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

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
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

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  width: 100%;
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(52, 211, 153, 0.1);
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
</style>