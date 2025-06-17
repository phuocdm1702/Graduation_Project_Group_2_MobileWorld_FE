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
                <button
                  @click="toggleDropdown('ram')"
                  class="form-control search-input text-left"
                >
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
                  <label
                    v-for="ram in ramOptions"
                    :key="ram.id"
                    class="dropdown-item flex items-center"
                  >
                    <input
                      type="checkbox"
                      :value="ram.id"
                      v-model="currentVariant.selectedRams"
                      class="me-2"
                    />
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
                <button
                  @click="toggleDropdown('boNhoTrong')"
                  class="form-control search-input text-left"
                >
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
                  <label
                    v-for="boNho in boNhoTrongOptions"
                    :key="boNho.id"
                    class="dropdown-item flex items-center"
                  >
                    <input
                      type="checkbox"
                      :value="boNho.id"
                      v-model="currentVariant.selectedBoNhoTrongs"
                      class="me-2"
                    />
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
                <button
                  @click="openColorModal"
                  class="form-control search-input text-left"
                >
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
                  <input
                    v-model="groupCommonValues[group.groupKey].price"
                    type="text"
                    placeholder="Nhập giá chung"
                    class="form-control search-input"
                    @input="updateSelectedVariants(group)"
                  />
                </div>
                <button
                  v-if="selectedVariants.length > 0"
                  @click="removeMultipleVariants"
                  class="btn btn-reset"
                >
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
                      <input
                        type="checkbox"
                        :checked="allSelected[group.groupKey] || false"
                        @change="toggleGroupSelection(group, $event.target.checked)"
                      />
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
                    <td class="text-center">
                      <input
                        type="checkbox"
                        v-model="selectedVariants"
                        :value="group.startIndex + variantIndex"
                        @change="updateSelectedCount(group)"
                      />
                    </td>
                    <td class="text-center">{{ variantIndex + 1 }}</td>
                    <td>{{ productData.tenSanPham || 'N/A' }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span
                          class="color-swatch me-2"
                          :style="{ backgroundColor: getColorFromName(mauSacOptions.find(mau => mau.id === variant.idMauSac)?.mauSac) || '#000' }"
                        ></span>
                        {{ mauSacOptions.find(mau => mau.id === variant.idMauSac)?.mauSac || 'N/A' }}
                      </div>
                    </td>
                    <td>
                      <input
                        v-model="variant.donGia"
                        type="text"
                        class="form-control search-input"
                      />
                    </td>
                    <td class="text-center">
                      {{ variantImeis[group.startIndex + variantIndex]?.length || 0 }}
                    </td>
                    <td class="action-buttons-cell">
                      <button
                        @click="openImeiModal(group.startIndex + variantIndex)"
                        class="btn btn-sm btn-table"
                        title="Nhập IMEI"
                      >
                        <i class="bi bi-upc-scan"></i>
                      </button>
                      <button
                        @click="removeVariant(group.startIndex + variantIndex)"
                        class="btn btn-sm btn-table"
                        title="Xóa"
                      >
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
            <button
              type="button"
              class="btn-close"
              @click="closeColorModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div
                v-for="mau in mauSacOptions"
                :key="mau.id"
                class="col-4"
              >
                <label class="d-flex align-items-center">
                  <input
                    type="checkbox"
                    :value="mau.id"
                    v-model="currentVariant.selectedMauSacs"
                    class="me-2"
                  />
                  <span
                    class="color-swatch me-2"
                    :style="{ backgroundColor: getColorFromName(mau.mauSac) || '#FFFFFF' }"
                  ></span>
                  <span>{{ mau.mauSac }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeColorModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="confirmColorSelection"
            >
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
            <button
              type="button"
              class="btn-close"
              @click="closeImeiModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="filter-label">Nhập IMEI (mỗi IMEI trên một dòng)</label>
              <textarea
                v-model="imeiInput"
                rows="5"
                class="form-control search-input"
                placeholder="Nhập IMEI, mỗi IMEI trên một dòng..."
              ></textarea>
              <div class="mt-2">
                <p
                  v-for="(imei, index) in filteredImeiList"
                  :key="index"
                  class="text-sm"
                >
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
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  @change="handleExcelImport"
                  class="form-control search-input"
                />
              </div>
              <div class="col-4">
                <label class="filter-label">Tải mẫu Excel</label>
                <button
                  @click="downloadImeiTemplate"
                  class="btn btn-action w-100"
                >
                  Tải mẫu IMEI
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeImeiModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="saveImei"
            >
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
            <button
              type="button"
              class="btn-close"
              @click="closeFormModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="currentAttribute === 'ram'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng RAM</label>
                <input
                  v-model="entityData.dungLuongRam"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng RAM (ví dụ: 8GB)"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'boNhoTrong'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng Bộ Nhớ Trong</label>
                <input
                  v-model="entityData.dungLuongBoNhoTrong"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng bộ nhớ trong (ví dụ: 128GB)"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'mauSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Màu Sắc</label>
                <input
                  v-model="entityData.mauSac"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên màu sắc (ví dụ: Đen)"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeFormModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="handleAddAttribute"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getRam, addRam, getBoNhoTrong, addBoNhoTrong, getMauSac, addMauSac } from '@/store/modules/products/chiTietSanPham';

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
  },
  emits: ['variants-updated'],
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const isLoading = ref(true);
    const productVariants = ref([]);
    const currentVariant = ref({
      selectedRams: [],
      selectedBoNhoTrongs: [],
      selectedMauSacs: [],
    });
    const selectedVariants = ref([]);
    const allSelected = ref({});
    const groupCommonValues = ref({});
    const variantImeis = ref({});
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

    const groupVariantsByRamAndRom = computed(() => {
      const groups = [];
      const grouped = {};

      productVariants.value.forEach((variant, index) => {
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
        console.log('RAM:', ramRes.data);
        console.log('Bộ Nhớ Trong:', boNhoTrongRes.data);
        console.log('Màu Sắc:', mauSacRes.data);
        ramOptions.value = ramRes.data;
        boNhoTrongOptions.value = boNhoTrongRes.data;
        mauSacOptions.value = mauSacRes.data;
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

    const toggleDropdown = (type) => {
      dropdownOpen.value[type] = !dropdownOpen.value[type];
      Object.keys(dropdownOpen.value).forEach((key) => {
        if (key !== type) {
          dropdownOpen.value[key] = false;
        }
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
            const exists = productVariants.value.some(
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
      console.log('New Variants:', newVariants);
      productVariants.value = [...productVariants.value, ...newVariants];
      return true;
    };

    const removeVariant = (index) => {
      productVariants.value.splice(index, 1);
      delete variantImeis.value[index];
      selectedVariants.value = selectedVariants.value.filter((i) => i !== index);
      validateSelections();
      emit('variants-updated', productVariants.value);
    };

    const removeMultipleVariants = () => {
      productVariants.value = productVariants.value.filter(
        (_, index) => !selectedVariants.value.includes(index)
      );
      selectedVariants.value.forEach((index) => {
        delete variantImeis.value[index];
      });
      selectedVariants.value = [];
      validateSelections();
      emit('variants-updated', productVariants.value);
    };

    const updateSelectedVariants = (group) => {
      const groupKey = group.groupKey;
      const price = groupCommonValues.value[groupKey]?.price || '';
      if (price) {
        group.variants.forEach((variant, index) => {
          productVariants.value[group.startIndex + index].donGia = price;
        });
      }
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

    const getColorFromName = (name) => {
      const colorMap = {
        'Đen Phantôm': '#1A2526',
        'Trắng Ngọc Trai': '#F5F6F5',
        'Xanh Thiên Hà': '#2C4F6E',
      };
      return colorMap[name] || '#FFFFFF';
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
      showColorModal.value = true;
    };

    const closeColorModal = () => {
      showColorModal.value = false;
    };

    const confirmColorSelection = () => {
      if (addVariant()) {
        closeColorModal();
        validateSelections();
        emit('variants-updated', productVariants.value);
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm biến thể thành công!',
          duration: 3000,
        });
      }
    };

    const openImeiModal = (index) => {
      currentVariantIndex.value = index;
      imeiInput.value = variantImeis.value[index]?.join('\n') || '';
      showImeiModal.value = true;
    };

    const closeImeiModal = () => {
      showImeiModal.value = false;
      currentVariantIndex.value = null;
      imeiInput.value = '';
    };

    const saveImei = () => {
      const imeis = imeiInput.value
        .split('\n')
        .map((imei) => imei.trim())
        .filter((imei) => imei.length === 15);
      if (imeis.length > 0) {
        variantImeis.value[currentVariantIndex.value] = imeis;
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Lưu IMEI thành công!',
          duration: 2000,
        });
      } else {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng nhập ít nhất một IMEI hợp lệ (15 chữ số)!',
          duration: 3000,
        });
      }
      closeImeiModal();
    };

    const downloadImeiTemplate = () => {
      const link = new Blob(['Mock IMEI template content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(link);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'imei-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleExcelImport = (event) => {
      const file = event.target.files[0];
      if (file) {
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Đã nhập file Excel (giả lập)!',
          duration: 3000,
        });
      }
    };

    return {
      toastNotification,
      isLoading,
      productVariants,
      currentVariant,
      ramOptions,
      boNhoTrongOptions,
      mauSacOptions,
      dropdownOpen,
      groupVariantsByRamAndRom,
      selectedVariants,
      allSelected,
      groupCommonValues,
      variantImeis,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      showColorModal,
      showImeiModal,
      currentVariantIndex,
      imeiInput,
      filteredImeiList,
      toggleDropdown,
      addVariant,
      removeVariant,
      removeMultipleVariants,
      updateSelectedVariants,
      toggleGroupSelection,
      updateSelectedCount,
      getColorFromName,
      openAddModal,
      closeFormModal,
      openColorModal,
      closeColorModal,
      confirmColorSelection,
      openImeiModal,
      closeImeiModal,
      saveImei,
      downloadImeiTemplate,
      handleExcelImport,
      handleAddAttribute,
      entityData,
    };
  },
});
</script>

<style scoped>
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

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  flex: 1;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
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
  animation: fadeInUp 0.3s ease-out;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(52, 211, 153, 0.1);
}

.table-responsive {
  margin-top: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
}

.table th,
.table td {
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

.table th {
  background: #f1f3f5;
  font-weight: 600;
  color: #1f3a44;
}

.table td {
  color: #1f3a44;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
}

.btn-table {
  color: #1f3a44;
  border: none;
  background: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  animation: zoomIn 0.3s ease-out;
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

.text-success {
  color: #34d399;
}

.text-danger {
  color: #dc3545;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .table th,
  .table td {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}

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
</style>