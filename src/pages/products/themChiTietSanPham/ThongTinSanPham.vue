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
        <div class="row g-4">
          <!-- Tên Sản Phẩm -->
          <div class="col-lg-12">
            <div class="search-group">
              <label class="filter-label">Tên Sản Phẩm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  v-model.trim="productData.tenSanPham"
                  type="text"
                  placeholder="Nhập tên sản phẩm (mới hoặc chọn)"
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
              <div v-if="isProductSelected" class="mt-2">
                <span class="text-success">Sản phẩm đã chọn: {{ productData.tenSanPham }}</span>
                <button
                  @click="clearProductSelection"
                  class="btn btn-reset btn-sm ms-2"
                >
                  <i class="bi bi-x-circle"></i> Hủy chọn
                </button>
              </div>
              <div v-else-if="productData.tenSanPham && filteredProductNameOptions.length === 0" class="mt-2 text-info">
                Sẽ thêm sản phẩm mới: {{ productData.tenSanPham }}
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
                >
                  <option value="">Chọn Hệ Điều Hành</option>
                  <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                    {{ option.heDieuHanh }} {{ option.phienBan }}
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
                  v-model="productData.idCongNgheManHinh"
                  class="form-control search-input"
                >
                  <option value="">Chọn Công Nghệ Màn Hình</option>
                  <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                    {{ option.congNgheManHinh }} {{ option.chuanManHinh }} {{ option.kichThuoc }} {{ option.doPhanGiai }} {{ option.tanSoQuet }}
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
                >
                  <option value="">Chọn Nhà Sản Xuất</option>
                  <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                    {{ option.nhaSanXuat }}
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
                >
                  <option value="">Chọn Cụm Camera</option>
                  <option v-for="option in cumCameraOptions" :key="option.id" :value="option.id">
                    {{ option.thongSoCameraSau }} {{ option.thongSoCameraTruoc }}
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
                >
                  <option value="">Chọn Sim</option>
                  <option v-for="option in simOptions" :key="option.id" :value="option.id">
                    {{ option.soLuongSimHoTro }} {{ option.cacLoaiSimHoTro }}
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
                >
                  <option value="">Chọn Thiết Kế</option>
                  <option v-for="option in thietKeOptions" :key="option.id" :value="option.id">
                    {{ option.chatLieuKhung }} {{ option.chatLieuMatLung }}
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
                >
                  <option value="">Chọn Pin</option>
                  <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                    {{ option.loaiPin }} {{ option.dungLuongPin }}
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
                >
                  <option value="">Chọn Công Nghệ Mạng</option>
                  <option v-for="option in congNgheMangOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNgheMang }}
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
                  v-model="productData.idHoTroCongNgheSac"
                  class="form-control search-input"
                >
                  <option value="">Chọn Hỗ Trợ Công Nghệ Sạc</option>
                  <option v-for="option in hoTroCongNgheSacOptions" :key="option.id" :value="option.id">
                    {{ option.congSac }} {{ option.congNgheHoTro }}
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
                >
                  <option value="">Chọn Chỉ Số Kháng Bụi Nước</option>
                  <option v-for="option in chiSoKhangBuiVaNuocOptions" :key="option.id" :value="option.id">
                    {{ option.tenChiSo }}
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

          <!-- Hỗ Trợ Bộ Nhớ Ngoài -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hỗ Trợ Bộ Nhớ Ngoài</label>
              <div class="input-group">
                <select
                  v-model="productData.idHoTroBoNhoNgoai"
                  class="form-control search-input"
                >
                  <option value="">Chọn Hỗ Trợ Bộ Nhớ Ngoài</option>
                  <option v-for="option in hoTroBoNhoNgoaiOptions" :key="option.id" :value="option.id">
                    {{ option.hoTroBoNhoNgoai }}
                  </option>
                </select>
                <button
                  @click="openAddModal('hoTroBoNhoNgoai')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Ghi Chú -->
          <div class="col-lg-12">
            <div class="filter-group">
              <label class="filter-label">Ghi Chú</label>
              <textarea
                v-model="productData.ghiChu"
                class="form-control search-input"
                placeholder="Nhập ghi chú"
                rows="3"
              ></textarea>
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
                  v-model="entityData.heDieuHanh"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hệ điều hành"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Phiên Bản</label>
                <input
                  v-model="entityData.phienBan"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập phiên bản"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheManHinh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Công Nghệ Màn Hình</label>
                <input
                  v-model="entityData.congNgheManHinh"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập công nghệ màn hình"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Kích Thước</label>
                <input
                  v-model="entityData.kichThuoc"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập kích thước màn hình"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Độ Phân Giải</label>
                <input
                  v-model="entityData.doPhanGiai"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập độ phân giải"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Tần Số Quét</label>
                <input
                  v-model="entityData.tanSoQuet"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tần số quét"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'nhaSanXuat'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Nhà Sản Xuất</label>
                <input
                  v-model="entityData.nhaSanXuat"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên nhà sản xuất"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cumCamera'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Thông Số Camera Sau</label>
                <input
                  v-model="entityData.thongSoCameraSau"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera sau"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Thông Số Camera Trước</label>
                <input
                  v-model="entityData.thongSoCameraTruoc"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera trước"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'sim'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Sim</label>
                <input
                  v-model="entityData.cacLoaiSimHoTro"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại sim"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Số Lượng Sim</label>
                <input
                  v-model="entityData.soLuongSimHoTro"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập số lượng sim hỗ trợ"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'thietKe'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chất Liệu Khung</label>
                <input
                  v-model="entityData.chatLieuKhung"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chất liệu khung"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Chất Liệu Mặt Lưng</label>
                <input
                  v-model="entityData.chatLieuMatLung"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chất liệu mặt lưng"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'pin'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Pin</label>
                <input
                  v-model="entityData.loaiPin"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại pin"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Dung Lượng Pin</label>
                <input
                  v-model="entityData.dungLuongPin"
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
                  v-model="entityData.tenCongNgheMang"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên công nghệ mạng"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroCongNgheSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Cổng Sạc</label>
                <input
                  v-model="entityData.congSac"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập cổng sạc"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Công Nghệ Sạc</label>
                <input
                  v-model="entityData.congNgheHoTro"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập công nghệ sạc"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'chiSoKhangBuiVaNuoc'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chỉ Số Kháng Bụi Nước</label>
                <input
                  v-model="entityData.tenChiSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chỉ số kháng bụi nước"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroBoNhoNgoai'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Hỗ Trợ Bộ Nhớ Ngoài</label>
                <input
                  v-model="entityData.hoTroBoNhoNgoai"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập hỗ trợ bộ nhớ ngoài"
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
import { defineComponent, ref, computed, watch } from 'vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import {
  getHeDieuHanh, addHeDieuHanh, getCongNgheManHinh, addCongNgheManHinh,
  getNhaSanXuat, addNhaSanXuat, getCumCamera, addCumCamera,
  getSim, addSim, getThietKe, addThietKe, getPin, addPin,
  getCpu, addCpu, getGpu, addGpu, getCongNgheMang, addCongNgheMang,
  getHoTroCongNgheSac, addHoTroCongNgheSac, getChiSoKhangBuiVaNuoc, addChiSoKhangBuiVaNuoc,
  getHoTroBoNhoNgoai, addHoTroBoNhoNgoai,
  getProducts, addChiTietSanPham,
} from '@/store/modules/products/chiTietSanPham';

export default defineComponent({
  name: 'ProductInfo',
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  props: {
    productData: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:productData', 'reset-form'],
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const isLoading = ref(false); // Đặt mặc định là false để không hiển thị loading
    const localProductData = ref({ ...props.productData });
    const heDieuHanhOptions = ref([]);
    const congNgheManHinhOptions = ref([]);
    const nhaSanXuatOptions = ref([]);
    const cumCameraOptions = ref([]);
    const simOptions = ref([]);
    const thietKeOptions = ref([]);
    const pinOptions = ref([]);
    const cpuOptions = ref([]);
    const gpuOptions = ref([]);
    const congNgheMangOptions = ref([]);
    const hoTroCongNgheSacOptions = ref([]);
    const chiSoKhangBuiVaNuocOptions = ref([]);
    const hoTroBoNhoNgoaiOptions = ref([]);
    const productNameOptions = ref([]);
    const filteredProductNameOptions = ref([]);
    const showProductDropdown = ref(false);
    const isProductSelected = ref(false);
    const isNewProduct = ref(false);
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
        hoTroBoNhoNgoai: 'Hỗ Trợ Bộ Nhớ Ngoài',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

    watch(() => props.productData, (newData) => {
      localProductData.value = { ...newData };
      isProductSelected.value = false;
      isNewProduct.value = false;
      showProductDropdown.value = false;
      filteredProductNameOptions.value = productNameOptions.value;
    }, { deep: true });

    const fetchData = async () => {
      try {
        const [
          heDieuHanhRes,
          congNgheManHinhRes,
          nhaSanXuatRes,
          cumCameraRes,
          simRes,
          thietKeRes,
          pinRes,
          cpuRes,
          gpuRes,
          congNgheMangRes,
          hoTroCongNgheSacRes,
          chiSoKhangBuiVaNuocRes,
          hoTroBoNhoNgoaiRes,
          productsRes,
        ] = await Promise.all([
          getHeDieuHanh(),
          getCongNgheManHinh(),
          getNhaSanXuat(),
          getCumCamera(),
          getSim(),
          getThietKe(),
          getPin(),
          getCpu(),
          getGpu(),
          getCongNgheMang(),
          getHoTroCongNgheSac(),
          getChiSoKhangBuiVaNuoc(),
          getHoTroBoNhoNgoai(),
          getProducts(),
        ]);

        heDieuHanhOptions.value = heDieuHanhRes.data || [];
        congNgheManHinhOptions.value = congNgheManHinhRes.data || [];
        nhaSanXuatOptions.value = nhaSanXuatRes.data || [];
        cumCameraOptions.value = cumCameraRes.data || [];
        simOptions.value = simRes.data || [];
        thietKeOptions.value = thietKeRes.data || [];
        pinOptions.value = pinRes.data || [];
        cpuOptions.value = cpuRes.data || [];
        gpuOptions.value = gpuRes.data || [];
        congNgheMangOptions.value = congNgheMangRes.data || [];
        hoTroCongNgheSacOptions.value = hoTroCongNgheSacRes.data || [];
        chiSoKhangBuiVaNuocOptions.value = chiSoKhangBuiVaNuocRes.data || [];
        hoTroBoNhoNgoaiOptions.value = hoTroBoNhoNgoaiRes.data || [];
        productNameOptions.value = productsRes.data || [];
        filteredProductNameOptions.value = productsRes.data || [];

        if (heDieuHanhOptions.value.length > 0) localProductData.value.idHeDieuHanh = heDieuHanhOptions.value[0].id;
        if (congNgheManHinhOptions.value.length > 0) localProductData.value.idCongNgheManHinh = congNgheManHinhOptions.value[0].id;
        if (nhaSanXuatOptions.value.length > 0) localProductData.value.idNhaSanXuat = nhaSanXuatOptions.value[0].id;
        if (cumCameraOptions.value.length > 0) localProductData.value.idCumCamera = cumCameraOptions.value[0].id;
        if (simOptions.value.length > 0) localProductData.value.idSim = simOptions.value[0].id;
        if (thietKeOptions.value.length > 0) localProductData.value.idThietKe = thietKeOptions.value[0].id;
        if (pinOptions.value.length > 0) localProductData.value.idPin = pinOptions.value[0].id;
        if (cpuOptions.value.length > 0) localProductData.value.idCpu = cpuOptions.value[0].id;
        if (gpuOptions.value.length > 0) localProductData.value.idGpu = gpuOptions.value[0].id;
        if (congNgheMangOptions.value.length > 0) localProductData.value.idCongNgheMang = congNgheMangOptions.value[0].id;
        if (hoTroCongNgheSacOptions.value.length > 0) localProductData.value.idHoTroCongNgheSac = hoTroCongNgheSacOptions.value[0].id;
        if (chiSoKhangBuiVaNuocOptions.value.length > 0) localProductData.value.idChiSoKhangBuiVaNuoc = chiSoKhangBuiVaNuocOptions.value[0].id;
        if (hoTroBoNhoNgoaiOptions.value.length > 0) localProductData.value.idHoTroBoNhoNgoai = hoTroBoNhoNgoaiOptions.value[0].id;

        emit('update:productData', localProductData.value);
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải dữ liệu: ' + error.message,
          duration: 3000,
        });
        productNameOptions.value = [];
        filteredProductNameOptions.value = [];
      }
    };

    fetchData();

    const filterProducts = () => {
      const searchTerm = localProductData.value.tenSanPham?.toLowerCase().trim() || '';
      if (!searchTerm) {
        filteredProductNameOptions.value = productNameOptions.value;
      } else {
        filteredProductNameOptions.value = productNameOptions.value.filter((product) =>
          product.tenSanPham?.toLowerCase().includes(searchTerm)
        );
      }
      isNewProduct.value = searchTerm !== '' && filteredProductNameOptions.value.length === 0;
      if (!isProductSelected.value) {
        emit('update:productData', localProductData.value);
      }
    };

    const selectProduct = (product) => {
      localProductData.value = {
        ...product,
        idCongNgheManHinh: product.congNgheManHinhId || '',
        idHoTroCongNgheSac: product.hoTroCongNgheSacId || '',
        idHoTroBoNhoNgoai: product.idHoTroBoNhoNgoai || '',
        ghiChu: product.ghiChu || '',
      };
      showProductDropdown.value = false;
      isProductSelected.value = true;
      isNewProduct.value = false;
      emit('update:productData', localProductData.value);
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã chọn sản phẩm!',
        duration: 3000,
      });
    };

    const clearProductSelection = () => {
      isProductSelected.value = false;
      isNewProduct.value = localProductData.value.tenSanPham !== '';
      localProductData.value = {
        tenSanPham: localProductData.value.tenSanPham,
        idHeDieuHanh: heDieuHanhOptions.value.length > 0 ? heDieuHanhOptions.value[0].id : '',
        idCongNgheManHinh: congNgheManHinhOptions.value.length > 0 ? congNgheManHinhOptions.value[0].id : '',
        idNhaSanXuat: nhaSanXuatOptions.value.length > 0 ? nhaSanXuatOptions.value[0].id : '',
        idCumCamera: cumCameraOptions.value.length > 0 ? cumCameraOptions.value[0].id : '',
        idSim: simOptions.value.length > 0 ? simOptions.value[0].id : '',
        idThietKe: thietKeOptions.value.length > 0 ? thietKeOptions.value[0].id : '',
        idPin: pinOptions.value.length > 0 ? pinOptions.value[0].id : '',
        idCpu: cpuOptions.value.length > 0 ? cpuOptions.value[0].id : '',
        idGpu: gpuOptions.value.length > 0 ? gpuOptions.value[0].id : '',
        idCongNgheMang: congNgheMangOptions.value.length > 0 ? congNgheMangOptions.value[0].id : '',
        idHoTroCongNgheSac: hoTroCongNgheSacOptions.value.length > 0 ? hoTroCongNgheSacOptions.value[0].id : '',
        idChiSoKhangBuiVaNuoc: chiSoKhangBuiVaNuocOptions.value.length > 0 ? chiSoKhangBuiVaNuocOptions.value[0].id : '',
        idHoTroBoNhoNgoai: hoTroBoNhoNgoaiOptions.value.length > 0 ? hoTroBoNhoNgoaiOptions.value[0].id : '',
        ghiChu: '',
      };
      emit('update:productData', localProductData.value);
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Đã hủy chọn sản phẩm. Bạn có thể thêm sản phẩm mới.',
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

    const handleAddAttribute = async () => {
      try {
        const newId = `new_${Date.now()}`;
        const data = { id: newId, ...entityData.value };
        switch (currentAttribute.value) {
          case 'heDieuHanh':
            await addHeDieuHanh(data);
            heDieuHanhOptions.value.push(data);
            localProductData.value.idHeDieuHanh = newId;
            break;
          case 'congNgheManHinh':
            await addCongNgheManHinh(data);
            congNgheManHinhOptions.value.push({
              id: newId,
              congNgheManHinh: entityData.value.congNgheManHinh,
              kichThuoc: entityData.value.kichThuoc,
              doPhanGiai: entityData.value.doPhanGiai,
              tanSoQuet: entityData.value.tanSoQuet,
            });
            localProductData.value.idCongNgheManHinh = newId;
            break;
          case 'nhaSanXuat':
            await addNhaSanXuat(data);
            nhaSanXuatOptions.value.push(data);
            localProductData.value.idNhaSanXuat = newId;
            break;
          case 'cumCamera':
            await addCumCamera(data);
            cumCameraOptions.value.push(data);
            localProductData.value.idCumCamera = newId;
            break;
          case 'sim':
            await addSim(data);
            simOptions.value.push(data);
            localProductData.value.idSim = newId;
            break;
          case 'thietKe':
            await addThietKe(data);
            thietKeOptions.value.push(data);
            localProductData.value.idThietKe = newId;
            break;
          case 'pin':
            await addPin(data);
            pinOptions.value.push(data);
            localProductData.value.idPin = newId;
            break;
          case 'cpu':
            await addCpu(data);
            cpuOptions.value.push(data);
            localProductData.value.idCpu = newId;
            break;
          case 'gpu':
            await addGpu(data);
            gpuOptions.value.push(data);
            localProductData.value.idGpu = newId;
            break;
          case 'congNgheMang':
            await addCongNgheMang(data);
            congNgheMangOptions.value.push(data);
            localProductData.value.idCongNgheMang = newId;
            break;
          case 'hoTroCongNgheSac':
            await addHoTroCongNgheSac(data);
            hoTroCongNgheSacOptions.value.push({
              id: newId,
              congSac: entityData.value.congSac,
              congNgheHoTro: entityData.value.congNgheHoTro,
            });
            localProductData.value.idHoTroCongNgheSac = newId;
            break;
          case 'chiSoKhangBuiVaNuoc':
            await addChiSoKhangBuiVaNuoc(data);
            chiSoKhangBuiVaNuocOptions.value.push(data);
            localProductData.value.idChiSoKhangBuiVaNuoc = newId;
            break;
          case 'hoTroBoNhoNgoai':
            await addHoTroBoNhoNgoai(data);
            hoTroBoNhoNgoaiOptions.value.push(data);
            localProductData.value.idHoTroBoNhoNgoai = newId;
            break;
        }
        toastNotification.value?.addToast({
          type: 'success',
          message: `Thêm ${currentAttributeLabel.value} thành công!`,
          duration: 3000,
        });
        emit('update:productData', localProductData.value);
        closeFormModal();
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Lỗi khi thêm ${currentAttributeLabel.value}: ${error.message}`,
          duration: 3000,
        });
      }
    };

    const resetForm = () => {
      localProductData.value = {
        tenSanPham: localProductData.value.tenSanPham,
        idHeDieuHanh: heDieuHanhOptions.value.length > 0 ? heDieuHanhOptions.value[0].id : '',
        idCongNgheManHinh: congNgheManHinhOptions.value.length > 0 ? congNgheManHinhOptions.value[0].id : '',
        idNhaSanXuat: nhaSanXuatOptions.value.length > 0 ? nhaSanXuatOptions.value[0].id : '',
        idCumCamera: cumCameraOptions.value.length > 0 ? cumCameraOptions.value[0].id : '',
        idSim: simOptions.value.length > 0 ? simOptions.value[0].id : '',
        idThietKe: thietKeOptions.value.length > 0 ? thietKeOptions.value[0].id : '',
        idPin: pinOptions.value.length > 0 ? pinOptions.value[0].id : '',
        idCpu: cpuOptions.value.length > 0 ? cpuOptions.value[0].id : '',
        idGpu: gpuOptions.value.length > 0 ? gpuOptions.value[0].id : '',
        idCongNgheMang: congNgheMangOptions.value.length > 0 ? congNgheMangOptions.value[0].id : '',
        idHoTroCongNgheSac: hoTroCongNgheSacOptions.value.length > 0 ? hoTroCongNgheSacOptions.value[0].id : '',
        idChiSoKhangBuiVaNuoc: chiSoKhangBuiVaNuocOptions.value.length > 0 ? chiSoKhangBuiVaNuocOptions.value[0].id : '',
        idHoTroBoNhoNgoai: hoTroBoNhoNgoaiOptions.value.length > 0 ? hoTroBoNhoNgoaiOptions.value[0].id : '',
        ghiChu: '',
      };
      isProductSelected.value = false;
      isNewProduct.value = false;
      emit('update:productData', localProductData.value);
      emit('reset-form');
    };

    return {
      toastNotification,
      productData: localProductData,
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
      hoTroBoNhoNgoaiOptions,
      productNameOptions,
      filteredProductNameOptions,
      showProductDropdown,
      isProductSelected,
      isNewProduct,
      isLoading,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      entityData,
      filterProducts,
      selectProduct,
      clearProductSelection,
      delayHideProductDropdown,
      openAddModal,
      closeFormModal,
      handleAddAttribute,
      resetForm,
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  animation: fadeInUp 0.3s ease-out;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #1f3a44;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.dropdown-item:active {
  background: rgba(52, 211, 153, 0.2);
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

.text-info {
  color: #3498db;
}
</style>