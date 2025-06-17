<template>
  <div class="container-fluid">
    <!-- Header -->
    <HeaderCard
      title="Thêm Chi Tiết Sản Phẩm"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Main Form Section -->
    <FilterTableSection title="Thông Tin Sản Phẩm" icon="bi bi-box-seam">
      <div class="m-3">
        <div v-if="isLoading" class="text-center">
          <p class="text-gray-700">Đang tải dữ liệu...</p>
        </div>

        <div v-else class="row g-4">
          <!-- Tên Sản Phẩm -->
          <div class="col-lg-12">
            <div class="search-group">
              <label class="filter-label">Tên Sản Phẩm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  v-model.trim="productData.tenSanPham"
                  type="text"
                  placeholder="Nhập hoặc chọn tên sản phẩm"
                  class="form-control search-input"
                  @focus="showProductDropdown = true"
                  @blur="delayHideProductDropdown"
                  @input="filterProducts"
                />
                <div
                  v-if="showProductDropdown && filteredProductNameOptions.length > 0"
                  class="dropdown-menu show"
                >
                  <div
                    v-for="product in filteredProductNameOptions"
                    :key="product.id"
                    class="dropdown-item"
                    @mousedown="selectProduct(product)"
                  >
                    {{ product.tenSanPham }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hệ Điều Hành, Màn Hình, Nhà Sản Xuất -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <div class="input-group">
                <select
                  v-model="productData.idHeDieuHanh"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Hệ Điều Hành</option>
                  <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                    {{ option.tenHeDieuHanh }}
                  </option>
                </select>
                <button
                  @click="openAddModal('heDieuHanh')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Màn Hình</label>
              <div class="input-group">
                <select
                  v-model="productData.congNgheManHinh"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Công Nghệ Màn Hình</option>
                  <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('congNgheManHinh')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Nhà Sản Xuất</label>
              <div class="input-group">
                <select
                  v-model="productData.idNhaSanXuat"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Nhà Sản Xuất</option>
                  <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                    {{ option.tenNhaSanXuat }}
                  </option>
                </select>
                <button
                  @click="openAddModal('nhaSanXuat')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Camera, Sim, Thiết Kế -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Cụm Camera</label>
              <div class="input-group">
                <select
                  v-model="productData.idCumCamera"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Cụm Camera</option>
                  <option v-for="option in cumCameraOptions" :key="option.id" :value="option.id">
                    {{ option.thongSo }}
                  </option>
                </select>
                <button
                  @click="openAddModal('cumCamera')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Sim</label>
              <div class="input-group">
                <select
                  v-model="productData.idSim"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Sim</option>
                  <option v-for="option in simOptions" :key="option.id" :value="option.id">
                    {{ option.loaiSim }}
                  </option>
                </select>
                <button
                  @click="openAddModal('sim')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Thiết Kế</label>
              <div class="input-group">
                <select
                  v-model="productData.idThietKe"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Thiết Kế</option>
                  <option v-for="option in thietKeOptions" :key="option.id" :value="option.id">
                    {{ option.loaiThietKe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('thietKe')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pin, CPU, GPU -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Pin</label>
              <div class="input-group">
                <select
                  v-model="productData.idPin"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Pin</option>
                  <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                    {{ option.dungLuong }}
                  </option>
                </select>
                <button
                  @click="openAddModal('pin')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">CPU</label>
              <div class="input-group">
                <select
                  v-model="productData.idCpu"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn CPU</option>
                  <option v-for="option in cpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenCpu }}
                  </option>
                </select>
                <button
                  @click="openAddModal('cpu')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">GPU</label>
              <div class="input-group">
                <select
                  v-model="productData.idGpu"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn GPU</option>
                  <option v-for="option in gpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenGpu }}
                  </option>
                </select>
                <button
                  @click="openAddModal('gpu')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Công Nghệ Mạng, Hỗ Trợ Công Nghệ Sạc, Chỉ Số Kháng Bụi Nước -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Mạng</label>
              <div class="input-group">
                <select
                  v-model="productData.idCongNgheMang"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Công Nghệ Mạng</option>
                  <option v-for="option in congNgheMangOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('congNgheMang')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hỗ Trợ Công Nghệ Sạc</label>
              <div class="input-group">
                <select
                  v-model="productData.hoTroCongNgheSac"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Hỗ Trợ Công Nghệ Sạc</option>
                  <option v-for="option in hoTroCongNgheSacOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('hoTroCongNgheSac')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Kháng Bụi Nước</label>
              <div class="input-group">
                <select
                  v-model="productData.idChiSoKhangBuiVaNuoc"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Chỉ Số Kháng Bụi Nước</option>
                  <option v-for="option in chiSoKhangBuiVaNuocOptions" :key="option.id" :value="option.id">
                    {{ option.chiSo }}
                  </option>
                </select>
                <button
                  @click="openAddModal('chiSoKhangBuiVaNuoc')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Form Modal -->
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
            <div v-if="currentAttribute === 'heDieuHanh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Hệ Điều Hành</label>
                <input
                  v-model="entityData.tenHeDieuHanh"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hệ điều hành"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheManHinh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Công Nghệ Màn Hình</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập công nghệ màn hình"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'nhaSanXuat'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Nhà Sản Xuất</label>
                <input
                  v-model="entityData.tenNhaSanXuat"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên nhà sản xuất"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cumCamera'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Thông Số Camera</label>
                <input
                  v-model="entityData.thongSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'sim'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Sim</label>
                <input
                  v-model="entityData.loaiSim"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại sim"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'thietKe'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Thiết Kế</label>
                <input
                  v-model="entityData.loaiThietKe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại thiết kế"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'pin'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng Pin</label>
                <input
                  v-model="entityData.dungLuong"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng pin"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên CPU</label>
                <input
                  v-model="entityData.tenCpu"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên CPU"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'gpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên GPU</label>
                <input
                  v-model="entityData.tenGpu"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên GPU"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheMang'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Công Nghệ Mạng</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên công nghệ mạng"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroCongNgheSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Hỗ Trợ Công Nghệ Sạc</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hỗ trợ công nghệ sạc"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'chiSoKhangBuiVaNuoc'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chỉ Số Kháng Bụi Nước</label>
                <input
                  v-model="entityData.chiSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chỉ số kháng bụi nước"
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
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

const mockData = {
  '/he-dieu-hanh': [
    { id: 'hdh1', tenHeDieuHanh: 'Android 14' },
    { id: 'hdh2', tenHeDieuHanh: 'iOS 17' },
    { id: 'hdh3', tenHeDieuHanh: 'HarmonyOS 4' },
  ],
  '/cong-nghe-man-hinh': [
    { id: 'cmh1', tenCongNghe: 'Dynamic AMOLED 2X' },
    { id: 'cmh2', tenCongNghe: 'Super Retina XDR' },
    { id: 'cmh3', tenCongNghe: 'LTPO OLED' },
  ],
  '/nha-san-xuat': [
    { id: 'nsx1', tenNhaSanXuat: 'Samsung' },
    { id: 'nsx2', tenNhaSanXuat: 'Apple' },
    { id: 'nsx3', tenNhaSanXuat: 'Huawei' },
  ],
  '/cum-camera': [
    { id: 'cc1', thongSo: '108MP + 12MP + 10MP' },
    { id: 'cc2', thongSo: '50MP + 48MP + 12MP' },
    { id: 'cc3', thongSo: '64MP + 8MP + 5MP' },
  ],
  '/sim': [
    { id: 'sim1', loaiSim: 'Nano SIM' },
    { id: 'sim2', loaiSim: 'eSIM' },
    { id: 'sim3', loaiSim: 'Dual SIM (Nano + eSIM)' },
  ],
  '/thiet-ke': [
    { id: 'tk1', loaiThietKe: 'Nguyên khối' },
    { id: 'tk2', loaiThietKe: 'Gập ngang' },
    { id: 'tk3', loaiThietKe: 'Gập dọc' },
  ],
  '/pin': [
    { id: 'pin1', dungLuong: '4500mAh' },
    { id: 'pin2', dungLuong: '5000mAh' },
    { id: 'pin3', dungLuong: '4300mAh' },
  ],
  '/cpu': [
    { id: 'cpu1', tenCpu: 'Snapdragon 8 Gen 3' },
    { id: 'cpu2', tenCpu: 'A17 Pro' },
    { id: 'cpu3', tenCpu: 'Kirin 9000s' },
  ],
  '/gpu': [
    { id: 'gpu1', tenGpu: 'Adreno 750' },
    { id: 'gpu2', tenGpu: 'Apple GPU (6-core)' },
    { id: 'gpu3', tenGpu: 'Maleoon 910' },
  ],
  '/cong-nghe-mang': [
    { id: 'cnm1', tenCongNghe: '5G SA/NSA' },
    { id: 'cnm2', tenCongNghe: '4G LTE' },
    { id: 'cnm3', tenCongNghe: '3G' },
  ],
  '/ho-tro-cong-nghe-sac': [
    { id: 'sac1', tenCongNghe: 'SuperVOOC 100W' },
    { id: 'sac2', tenCongNghe: 'MagSafe 15W' },
    { id: 'sac3', tenCongNghe: 'Fast Charge 66W' },
  ],
  '/chi-so-khang-bui-nuoc': [
    { id: 'kb1', chiSo: 'IP68' },
    { id: 'kb2', chiSo: 'IP67' },
    { id: 'kb3', chiSo: 'IP54' },
  ],
};

const mockProducts = {
  content: [
    {
      id: 'sp1',
      tenSanPham: 'Samsung Galaxy S24 Ultra',
      idHeDieuHanh: 'hdh1',
      congNgheManHinh: 'cmh1',
      idNhaSanXuat: 'nsx1',
      idCumCamera: 'cc1',
      idSim: 'sim3',
      idThietKe: 'tk1',
      idPin: 'pin2',
      idCpu: 'cpu1',
      idGpu: 'gpu1',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac3',
      idChiSoKhangBuiVaNuoc: 'kb1',
    },
    {
      id: 'sp2',
      tenSanPham: 'iPhone 15 Pro Max',
      idHeDieuHanh: 'hdh2',
      congNgheManHinh: 'cmh2',
      idNhaSanXuat: 'nsx2',
      idCumCamera: 'cc2',
      idSim: 'sim2',
      idThietKe: 'tk1',
      idPin: 'pin3',
      idCpu: 'cpu2',
      idGpu: 'gpu2',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac2',
      idChiSoKhangBuiVaNuoc: 'kb1',
    },
    {
      id: 'sp3',
      tenSanPham: 'Huawei P60 Pro',
      idHeDieuHanh: 'hdh3',
      congNgheManHinh: 'cmh3',
      idNhaSanXuat: 'nsx3',
      idCumCamera: 'cc3',
      idSim: 'sim1',
      idThietKe: 'tk1',
      idPin: 'pin1',
      idCpu: 'cpu3',
      idGpu: 'gpu3',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac1',
      idChiSoKhangBuiVaNuoc: 'kb2',
    },
  ],
};

export default defineComponent({
  name: 'ProductInfo',
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  emits: ['update:productData'], // Declare event for productData updates
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const isLoading = ref(false);
    const productData = ref({
      tenSanPham: '',
      idHeDieuHanh: '',
      congNgheManHinh: '',
      idNhaSanXuat: '',
      idCumCamera: '',
      idSim: '',
      idThietKe: '',
      idPin: '',
      idCpu: '',
      idGpu: '',
      idCongNgheMang: '',
      hoTroCongNgheSac: '',
      idChiSoKhangBuiVaNuoc: '',
    });
    const heDieuHanhOptions = ref(mockData['/he-dieu-hanh']);
    const congNgheManHinhOptions = ref(mockData['/cong-nghe-man-hinh']);
    const nhaSanXuatOptions = ref(mockData['/nha-san-xuat']);
    const cumCameraOptions = ref(mockData['/cum-camera']);
    const simOptions = ref(mockData['/sim']);
    const thietKeOptions = ref(mockData['/thiet-ke']);
    const pinOptions = ref(mockData['/pin']);
    const cpuOptions = ref(mockData['/cpu']);
    const gpuOptions = ref(mockData['/gpu']);
    const congNgheMangOptions = ref(mockData['/cong-nghe-mang']);
    const hoTroCongNgheSacOptions = ref(mockData['/ho-tro-cong-nghe-sac']);
    const chiSoKhangBuiVaNuocOptions = ref(mockData['/chi-so-khang-bui-nuoc']);
    const productNameOptions = ref(mockProducts.content);
    const filteredProductNameOptions = ref(mockProducts.content);
    const showProductDropdown = ref(false);
    const isProductSelected = ref(false);
    const showFormModal = ref(false);
    const currentAttribute = ref('');
    const entityData = ref({});

    const currentAttributeLabel = computed(() => {
      const labels = {
        heDieuHanh: 'Hệ Điều Hành',
        congNgheManHinh: 'Công Nghệ Màn Hình',
        nhaSanXuat: 'Nhà Sản Xuất',
        cumCamera: 'Cụm Camera',
        sim: 'Sim',
        thietKe: 'Thiết Kế',
        pin: 'Pin',
        cpu: 'CPU',
        gpu: 'GPU',
        congNgheMang: 'Công Nghệ Mạng',
        hoTroCongNgheSac: 'Hỗ Trợ Công Nghệ Sạc',
        chiSoKhangBuiVaNuoc: 'Chỉ Số Kháng Bụi Nước',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

    const filterProducts = () => {
      const searchTerm = productData.value.tenSanPham.toLowerCase().trim();
      filteredProductNameOptions.value = productNameOptions.value.filter((product) =>
        product.tenSanPham.toLowerCase().includes(searchTerm)
      );
      isProductSelected.value = false;
    };

    const selectProduct = (product) => {
      productData.value = { ...product };
      showProductDropdown.value = false;
      isProductSelected.value = true;

      // Emit the updated productData
      emit('update:productData', productData.value);

      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã chọn sản phẩm!',
        duration: 3000,
      });
    };

    const delayHideProductDropdown = () => {
      setTimeout(() => {
        showProductDropdown.value = false;
      }, 200);
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

    const handleAddAttribute = () => {
      const newId = `new_${Date.now()}`;
      switch (currentAttribute.value) {
        case 'heDieuHanh':
          heDieuHanhOptions.value.push({ id: newId, tenHeDieuHanh: entityData.value.tenHeDieuHanh });
          break;
        case 'congNgheManHinh':
          congNgheManHinhOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'nhaSanXuat':
          nhaSanXuatOptions.value.push({ id: newId, tenNhaSanXuat: entityData.value.tenNhaSanXuat });
          break;
        case 'cumCamera':
          cumCameraOptions.value.push({ id: newId, thongSo: entityData.value.thongSo });
          break;
        case 'sim':
          simOptions.value.push({ id: newId, loaiSim: entityData.value.loaiSim });
          break;
        case 'thietKe':
          thietKeOptions.value.push({ id: newId, loaiThietKe: entityData.value.loaiThietKe });
          break;
        case 'pin':
          pinOptions.value.push({ id: newId, dungLuong: entityData.value.dungLuong });
          break;
        case 'cpu':
          cpuOptions.value.push({ id: newId, tenCpu: entityData.value.tenCpu });
          break;
        case 'gpu':
          gpuOptions.value.push({ id: newId, tenGpu: entityData.value.tenGpu });
          break;
        case 'congNgheMang':
          congNgheMangOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'hoTroCongNgheSac':
          hoTroCongNgheSacOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'chiSoKhangBuiVaNuoc':
          chiSoKhangBuiVaNuocOptions.value.push({ id: newId, chiSo: entityData.value.chiSo });
          break;
      }
      toastNotification.value?.addToast({
        type: 'success',
        message: `Thêm ${currentAttributeLabel.value} thành công!`,
        duration: 3000,
      });
      closeFormModal();
    };

    return {
      toastNotification,
      productData,
      heDieuHanhOptions,
      congNgheManHinhOptions,
      nhaSanXuatOptions,
      cumCameraOptions,
      simOptions,
      thietKeOptions,
      pinOptions,
      cpuOptions,
      gpuOptions,
      congNgheMangOptions,
      hoTroCongNgheSacOptions,
      chiSoKhangBuiVaNuocOptions,
      productNameOptions,
      filteredProductNameOptions,
      showProductDropdown,
      isProductSelected,
      isLoading,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      entityData,
      filterProducts,
      selectProduct,
      delayHideProductDropdown,
      openAddModal,
      closeFormModal,
      handleAddAttribute,
    };
  },
});
</script>

<style scoped>
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

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

.gradient-custom-teal {
  background: #34d399;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-group {
  position: relative;
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
</style>