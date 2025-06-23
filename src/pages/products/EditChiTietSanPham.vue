<!-- EditChiTietSanPham.vue -->
<template>
  <div class="container-fluid py-4 product-detail-management">
    <!-- Header -->
    <HeaderCard title="Chỉnh Sửa Chi Tiết Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Form Section -->
    <FilterTableSection title="Thông Tin Chi Tiết Sản Phẩm" icon="bi bi-pencil-square">
      <div class="m-3">
        <form @submit.prevent="saveChiTietSanPham">
          <div class="row g-4">
            <!-- Product Name -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Tên Sản Phẩm</label>
                <input v-model.trim="chiTietSanPham.tenSanPham" type="text" class="form-control search-input"
                  placeholder="Nhập tên sản phẩm..." required />
              </div>
            </div>
            <!-- Manufacturer -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Hãng</label>
                <select v-model="chiTietSanPham.idNhaSanXuat" class="form-control search-input" required>
                  <option value="">Chọn hãng</option>
                  <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                    {{ option.nhaSanXuat }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Operating System -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Hệ Điều Hành</label>
                <select v-model="chiTietSanPham.idHeDieuHanh" class="form-control search-input" required>
                  <option value="">Chọn hệ điều hành</option>
                  <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                    {{ option.heDieuHanh }} {{ option.phienBan }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Screen Technology -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Công nghệ màn hình</label>
                <select v-model="chiTietSanPham.idCongNgheManHinh" class="form-control search-input" required>
                  <option value="">Chọn công nghệ màn hình</option>
                  <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                    {{ option.chuanManHinh }} {{ option.congNgheManHinh }} {{ option.doPhanGiai }} {{ option.tanSoQuet
                    }}
                    {{ option.doSangToiDa }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Battery -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Pin</label>
                <select v-model="chiTietSanPham.idPin" class="form-control search-input" required>
                  <option value="">Chọn loại pin</option>
                  <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                    {{ option.loaiPin }} {{ option.dungLuongPin }}
                  </option>
                </select>
              </div>
            </div>
            <!-- CPU -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">CPU</label>
                <select v-model="chiTietSanPham.idCpu" class="form-control search-input" required>
                  <option value="">Chọn CPU</option>
                  <option v-for="option in cpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenCpu }}
                  </option>
                </select>
              </div>
            </div>
            <!-- GPU -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">GPU</label>
                <select v-model="chiTietSanPham.idGpu" class="form-control search-input" required>
                  <option value="">Chọn GPU</option>
                  <option v-for="option in gpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenGpu }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Camera Cluster -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Cụm Camera</label>
                <select v-model="chiTietSanPham.idCumCamera" class="form-control search-input" required>
                  <option value="">Chọn cụm camera</option>
                  <option v-for="option in cumCameraOptions" :key="option.id" :value="option.id">
                    {{ option.thongSoCameraSau }} / {{ option.thongSoCameraTruoc }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Design -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Thiết Kế</label>
                <select v-model="chiTietSanPham.idThietKe" class="form-control search-input" required>
                  <option value="">Chọn thiết kế</option>
                  <option v-for="option in thietKeOptions" :key="option.id" :value="option.id">
                    {{ option.chatLieuKhung }} / {{ option.chatLieuMatLung }}
                  </option>
                </select>
              </div>
            </div>
            <!-- SIM -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">SIM</label>
                <select v-model="chiTietSanPham.idSim" class="form-control search-input" required>
                  <option value="">Chọn loại SIM</option>
                  <option v-for="option in simOptions" :key="option.id" :value="option.id">
                    {{ option.cacLoaiSimHoTro }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Network Technology -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Công nghệ mạng</label>
                <select v-model="chiTietSanPham.idCongNgheMang" class="form-control search-input" required>
                  <option value="">Chọn công nghệ mạng</option>
                  <option v-for="option in congNgheMangOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNgheMang }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Dust/Water Resistance -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Chỉ số kháng bụi và nước</label>
                <select v-model="chiTietSanPham.idChiSoKhangBuiVaNuoc" class="form-control search-input">
                  <option value="">Chọn chỉ số kháng bụi và nước</option>
                  <option v-for="option in chiSoKhangBuiVaNuocOptions" :key="option.id" :value="option.id">
                    {{ option.tenChiSo }}
                  </option>
                </select>
              </div>
            </div>
            <!-- External Memory Support -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Hỗ trợ bộ nhớ ngoài</label>
                <select v-model="chiTietSanPham.idHoTroBoNhoNgoai" class="form-control search-input">
                  <option value="">Chọn hỗ trợ bộ nhớ ngoài</option>
                  <option v-for="option in hoTroBoNhoNgoaiOptions" :key="option.id" :value="option.id">
                    {{ option.hoTroBoNhoNgoai }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Charging Technology -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Công nghệ sạc</label>
                <select v-model="chiTietSanPham.idHoTroCongNgheSac" class="form-control search-input">
                  <option value="">Chọn công nghệ sạc</option>
                  <option v-for="option in hoTroCongNgheSacOptions" :key="option.id" :value="option.id">
                    {{ option.congNgheHoTro }} {{ option.congSac }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Note -->
            <div class="col-lg-12 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Ghi Chú</label>
                <textarea v-model="chiTietSanPham.ghiChu" class="form-control search-input"
                  placeholder="Nhập ghi chú..." rows="4"></textarea>
              </div>
            </div>
            <!-- Variants -->
            <div class="col-12">
              <div class="filter-group">
                <label class="filter-label">Biến Thể</label>
                <div v-for="(variant, index) in chiTietSanPham.variants" :key="index"
                  class="variant-group mb-3 p-3 border rounded">
                  <div class="row g-3">
                    <!-- Color -->
                    <div class="col-md-3">
                      <label class="filter-label">Màu Sắc</label>
                      <select v-model="variant.idMauSac" class="form-control search-input" required>
                        <option value="">Chọn màu sắc</option>
                        <option v-for="option in mauSacOptions" :key="option.id" :value="option.id">
                          {{ option.mauSac }}
                        </option>
                      </select>
                    </div>
                    <!-- RAM -->
                    <div class="col-md-3">
                      <label class="filter-label">RAM</label>
                      <select v-model="variant.idRam" class="form-control search-input" required>
                        <option value="">Chọn RAM</option>
                        <option v-for="option in ramOptions" :key="option.id" :value="option.id">
                          {{ option.dungLuongRam }}
                        </option>
                      </select>
                    </div>
                    <!-- Storage -->
                    <div class="col-md-3">
                      <label class="filter-label">Bộ Nhớ Trong</label>
                      <select v-model="variant.idBoNhoTrong" class="form-control search-input" required>
                        <option value="">Chọn bộ nhớ trong</option>
                        <option v-for="option in boNhoTrongOptions" :key="option.id" :value="option.id">
                          {{ option.dungLuongBoNhoTrong }}
                        </option>
                      </select>
                    </div>
                    <!-- Price -->
                    <div class="col-md-3">
                      <label class="filter-label">Đơn Giá</label>
                      <input v-model.number="variant.donGia" type="number" class="form-control search-input"
                        placeholder="Nhập đơn giá..." min="0.01" step="0.01" required />
                    </div>
                    <!-- IMEI -->
                    <div class="col-md-12">
                      <label class="filter-label">IMEI</label>
                      <input v-model="variant.imeiList[0]" type="text" class="form-control search-input"
                        placeholder="Nhập IMEI..." required />
                    </div>
                    <!-- Image -->
                    <div class="col-md-12">
                      <label class="filter-label">Ảnh Biến Thể</label>
                      <input type="file" accept="image/*" class="form-control"
                        @change="handleImageChange($event, index)" />
                      <div v-if="variant.imageUrl" class="mt-2">
                        <img :src="variant.imageUrl" alt="Variant Image" class="img-preview" />
                      </div>
                    </div>
                    <!-- Remove Variant Button -->
                    <div class="col-md-12 text-end">
                      <button type="button" class="btn btn-danger btn-sm" @click="removeVariant(index)"
                        v-if="chiTietSanPham.variants.length > 1">
                        Xóa Biến Thể
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm mt-2" @click="addVariant">
                  Thêm Biến Thể
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions mt-4">
            <div class="action-buttons">
              <router-link :to="`/ChiTietSanPham/${chiTietSanPham.id}`" class="btn btn-reset">
                Quay lại
              </router-link>
              <button type="submit" class="btn btn-action">
                Lưu Chi Tiết Sản Phẩm
              </button>
            </div>
          </div>
        </form>
      </div>
    </FilterTableSection>

    <!-- Modals -->
    <NotificationModal ref="notificationModal" :type="notificationType" :message="notificationMessage"
      :isLoading="isNotificationLoading" :onConfirm="notificationOnConfirm" :onCancel="notificationOnCancel"
      @close="resetNotification" />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import {
  getChiTietSanPhamBySanPhamId,
  getMauSac,
  getRam,
  getBoNhoTrong,
  getNhaSanXuat,
  getHeDieuHanh,
  getCongNgheManHinh,
  getPin,
  getCpu,
  getGpu,
  getCumCamera,
  getThietKe,
  getSim,
  getCongNgheMang,
  getChiSoKhangBuiVaNuoc,
  getHoTroBoNhoNgoai,
  getHoTroCongNgheSac,
  updateChiTietSanPham,
} from '@/store/modules/products/chiTietSanPham';

export default defineComponent({
  name: 'EditChiTietSanPham',
  components: {
    HeaderCard,
    FilterTableSection,
    NotificationModal,
    ToastNotification,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toastNotification = ref(null);
    const notificationModal = ref(null);
    const isLoading = ref(false);

    // Notification state
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => { });
    const notificationOnCancel = ref(() => { });

    // ChiTietSanPham data
    const chiTietSanPham = ref({
      id: '',
      tenSanPham: '',
      idNhaSanXuat: '',
      idPin: '',
      idCongNgheManHinh: '',
      idHoTroBoNhoNgoai: null,
      idCpu: '',
      idGpu: '',
      idCumCamera: '',
      idHeDieuHanh: '',
      idChiSoKhangBuiVaNuoc: null,
      idThietKe: '',
      idSim: '',
      idHoTroCongNgheSac: null,
      idCongNgheMang: '',
      ghiChu: '',
      variants: [{
        idMauSac: '',
        idRam: '',
        idBoNhoTrong: '',
        donGia: '',
        imeiList: [''],
        imageUrl: '',
        imageFile: null,
      }],
    });

    // Filter options
    const nhaSanXuatOptions = ref([]);
    const heDieuHanhOptions = ref([]);
    const congNgheManHinhOptions = ref([]);
    const pinOptions = ref([]);
    const cpuOptions = ref([]);
    const gpuOptions = ref([]);
    const cumCameraOptions = ref([]);
    const thietKeOptions = ref([]);
    const simOptions = ref([]);
    const congNgheMangOptions = ref([]);
    const chiSoKhangBuiVaNuocOptions = ref([]);
    const hoTroBoNhoNgoaiOptions = ref([]);
    const hoTroCongNgheSacOptions = ref([]);
    const mauSacOptions = ref([]);
    const ramOptions = ref([]);
    const boNhoTrongOptions = ref([]);

    // Load filter options
    const loadFilterOptions = async () => {
      try {
        const [
          nhaSanXuatRes,
          heDieuHanhRes,
          congNgheManHinhRes,
          pinRes,
          cpuRes,
          gpuRes,
          cumCameraRes,
          thietKeRes,
          simRes,
          congNgheMangRes,
          chiSoKhangBuiVaNuocRes,
          hoTroBoNhoNgoaiRes,
          hoTroCongNgheSacRes,
          mauSacRes,
          ramRes,
          boNhoTrongRes,
        ] = await Promise.allSettled([
          getNhaSanXuat(),
          getHeDieuHanh(),
          getCongNgheManHinh(),
          getPin(),
          getCpu(),
          getGpu(),
          getCumCamera(),
          getThietKe(),
          getSim(),
          getCongNgheMang(),
          getChiSoKhangBuiVaNuoc(),
          getHoTroBoNhoNgoai(),
          getHoTroCongNgheSac(),
          getMauSac(),
          getRam(),
          getBoNhoTrong(),
        ]);

        nhaSanXuatOptions.value = nhaSanXuatRes.status === 'fulfilled' ? nhaSanXuatRes.value.data || [] : [];
        heDieuHanhOptions.value = heDieuHanhRes.status === 'fulfilled' ? heDieuHanhRes.value.data || [] : [];
        congNgheManHinhOptions.value = congNgheManHinhRes.status === 'fulfilled' ? congNgheManHinhRes.value.data || [] : [];
        pinOptions.value = pinRes.status === 'fulfilled' ? pinRes.value.data || [] : [];
        cpuOptions.value = cpuRes.status === 'fulfilled' ? cpuRes.value.data || [] : [];
        gpuOptions.value = gpuRes.status === 'fulfilled' ? gpuRes.value.data || [] : [];
        cumCameraOptions.value = cumCameraRes.status === 'fulfilled' ? cumCameraRes.value.data || [] : [];
        thietKeOptions.value = thietKeRes.status === 'fulfilled' ? thietKeRes.value.data || [] : [];
        simOptions.value = simRes.status === 'fulfilled' ? simRes.value.data || [] : [];
        congNgheMangOptions.value = congNgheMangRes.status === 'fulfilled' ? congNgheMangRes.value.data || [] : [];
        chiSoKhangBuiVaNuocOptions.value = chiSoKhangBuiVaNuocRes.status === 'fulfilled' ? chiSoKhangBuiVaNuocRes.value.data || [] : [];
        hoTroBoNhoNgoaiOptions.value = hoTroBoNhoNgoaiRes.status === 'fulfilled' ? hoTroBoNhoNgoaiRes.value.data || [] : [];
        hoTroCongNgheSacOptions.value = hoTroCongNgheSacRes.status === 'fulfilled' ? hoTroCongNgheSacRes.value.data || [] : [];
        mauSacOptions.value = mauSacRes.status === 'fulfilled' ? mauSacRes.value.data || [] : [];
        ramOptions.value = ramRes.status === 'fulfilled' ? ramRes.value.data || [] : [];
        boNhoTrongOptions.value = boNhoTrongRes.status === 'fulfilled' ? boNhoTrongRes.value.data || [] : [];
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách bộ lọc: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
      }
    };

    const loadChiTietSanPham = async () => {
  try {
    isLoading.value = true;
    const productId = route.params.id;
    console.log('productId:', productId); // Debug log
    if (!productId) {
      throw new Error('Missing productId in route parameters');
    }
    const response = await getChiTietSanPhamBySanPhamId(productId);
    console.log('API Response:', response.data); // Debug log
    const productDetail = response.data; // Assume response.data is a single object
    if (!productDetail) {
      throw new Error('Không tìm thấy chi tiết sản phẩm');
    }
    chiTietSanPham.value = {
      id: productId,
      tenSanPham: productDetail.tenSanPham || '',
      idNhaSanXuat: productDetail.idNhaSanXuat || '',
      idPin: productDetail.idPin || '',
      idCongNgheManHinh: productDetail.idCongNgheManHinh || '',
      idHoTroBoNhoNgoai: productDetail.idHoTroBoNhoNgoai || null,
      idCpu: productDetail.idCpu || '',
      idGpu: productDetail.idGpu || '',
      idCumCamera: productDetail.idCumCamera || '',
      idHeDieuHanh: productDetail.idHeDieuHanh || '',
      idChiSoKhangBuiVaNuoc: productDetail.idChiSoKhangBuiVaNuoc || null,
      idThietKe: productDetail.idThietKe || '',
      idSim: productDetail.idSim || '',
      idHoTroCongNgheSac: productDetail.idHoTroCongNgheSac || null,
      idCongNgheMang: productDetail.idCongNgheMang || '',
      ghiChu: productDetail.ghiChu || '',
      variants: productDetail.variants?.map(variant => ({
        idMauSac: variant.idMauSac || '',
        idRam: variant.idRam || '',
        idBoNhoTrong: variant.idBoNhoTrong || '',
        donGia: variant.donGia || '',
        imeiList: variant.imeiList || [''],
        imageUrl: variant.imageUrl || '',
        imageFile: null,
      })) || [{
        idMauSac: '',
        idRam: '',
        idBoNhoTrong: '',
        donGia: '',
        imeiList: [''],
        imageUrl: '',
        imageFile: null,
      }],
    };

    // Validate IDs against options
    const validateOption = (id, options, field, displayName) => {
      if (id && !options.find(opt => opt.id === id)) {
        console.warn(`${field} ${id} not found in options`);
        chiTietSanPham.value[field] = '';
        toastNotification.value?.addToast({
          type: 'warning',
          message: `${displayName} không hợp lệ, vui lòng chọn lại.`,
          duration: 3000,
        });
      }
    };

    validateOption(chiTietSanPham.value.idNhaSanXuat, nhaSanXuatOptions.value, 'idNhaSanXuat', 'Hãng');
    validateOption(chiTietSanPham.value.idHeDieuHanh, heDieuHanhOptions.value, 'idHeDieuHanh', 'Hệ điều hành');
    validateOption(chiTietSanPham.value.idCongNgheManHinh, congNgheManHinhOptions.value, 'idCongNgheManHinh', 'Công nghệ màn hình');
    validateOption(chiTietSanPham.value.idPin, pinOptions.value, 'idPin', 'Pin');
    validateOption(chiTietSanPham.value.idCpu, cpuOptions.value, 'idCpu', 'CPU');
    validateOption(chiTietSanPham.value.idGpu, gpuOptions.value, 'idGpu', 'GPU');
    validateOption(chiTietSanPham.value.idCumCamera, cumCameraOptions.value, 'idCumCamera', 'Cụm camera');
    validateOption(chiTietSanPham.value.idThietKe, thietKeOptions.value, 'idThietKe', 'Thiết kế');
    validateOption(chiTietSanPham.value.idSim, simOptions.value, 'idSim', 'SIM');
    validateOption(chiTietSanPham.value.idCongNgheMang, congNgheMangOptions.value, 'idCongNgheMang', 'Công nghệ mạng');
    validateOption(chiTietSanPham.value.idChiSoKhangBuiVaNuoc, chiSoKhangBuiVaNuocOptions.value, 'idChiSoKhangBuiVaNuoc', 'Chỉ số kháng bụi và nước');
    validateOption(chiTietSanPham.value.idHoTroBoNhoNgoai, hoTroBoNhoNgoaiOptions.value, 'idHoTroBoNhoNgoai', 'Hỗ trợ bộ nhớ ngoài');
    validateOption(chiTietSanPham.value.idHoTroCongNgheSac, hoTroCongNgheSacOptions.value, 'idHoTroCongNgheSac', 'Công nghệ sạc');
    chiTietSanPham.value.variants.forEach((variant, index) => {
      validateOption(variant.idMauSac, mauSacOptions.value, `variants[${index}].idMauSac`, 'Màu sắc');
      validateOption(variant.idRam, ramOptions.value, `variants[${index}].idRam`, 'RAM');
      validateOption(variant.idBoNhoTrong, boNhoTrongOptions.value, `variants[${index}].idBoNhoTrong`, 'Bộ nhớ trong');
    });
  } catch (error) {
    console.error('Error fetching chi tiết sản phẩm:', error);
    toastNotification.value?.addToast({
      type: 'error',
      message: error.message || 'Lỗi khi tải thông tin chi tiết sản phẩm',
      duration: 5000,
    });
    router.push({ name: 'SanPham' }); // Redirect to product list
  } finally {
    isLoading.value = false;
  }
};

    const addVariant = () => {
      chiTietSanPham.value.variants.push({
        idMauSac: '',
        idRam: '',
        idBoNhoTrong: '',
        donGia: '',
        imeiList: [''],
        imageUrl: '',
        imageFile: null,
      });
    };

    const removeVariant = (index) => {
      chiTietSanPham.value.variants.splice(index, 1);
    };

    const handleImageChange = (event, index) => {
      const file = event.target.files[0];
      if (file) {
        chiTietSanPham.value.variants[index].imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          chiTietSanPham.value.variants[index].imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const saveChiTietSanPham = async () => {
      try {
        isLoading.value = true;
        const images = chiTietSanPham.value.variants.map(variant => variant.imageFile).filter(file => file !== null);
        const response = await updateChiTietSanPham(chiTietSanPham.value.id, chiTietSanPham.value, images);
        toastNotification.value?.addToast({
          type: 'success',
          message: `Cập nhật chi tiết sản phẩm ${chiTietSanPham.value.tenSanPham} thành công`,
          duration: 3000,
        });
        setTimeout(() => {
          router.push({ name: 'ChiTietSanPham', params: { id: chiTietSanPham.value.id } });
        }, 1000);
      } catch (error) {
        console.error('Error updating chi tiết sản phẩm:', error);
        let errorMessage = 'Lỗi khi cập nhật chi tiết sản phẩm';
        if (error.response?.data) {
          if (typeof error.response.data === 'object') {
            errorMessage = Object.entries(error.response.data)
              .map(([field, message]) => `${field}: ${message}`)
              .join('; ');
          } else {
            errorMessage = error.response.data.message || error.message;
          }
        }
        toastNotification.value?.addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        });
      } finally {
        isLoading.value = false;
      }
    };

    // Reset notification
    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => { };
      notificationOnCancel.value = () => { };
    };

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadFilterOptions(), loadChiTietSanPham()]);
    });

    return {
      chiTietSanPham,
      nhaSanXuatOptions,
      heDieuHanhOptions,
      congNgheManHinhOptions,
      pinOptions,
      cpuOptions,
      gpuOptions,
      cumCameraOptions,
      thietKeOptions,
      simOptions,
      congNgheMangOptions,
      chiSoKhangBuiVaNuocOptions,
      hoTroBoNhoNgoaiOptions,
      hoTroCongNgheSacOptions,
      mauSacOptions,
      ramOptions,
      boNhoTrongOptions,
      toastNotification,
      notificationModal,
      isLoading,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      addVariant,
      removeVariant,
      handleImageChange,
      saveChiTietSanPham,
      resetNotification,
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

  0%,
  100% {
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

.search-input {
  padding-left: 1rem;
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

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset,
.btn-action,
.btn-primary,
.btn-danger {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-primary {
  background: #34d399;
  color: white;
}

.btn-primary:hover {
  background: #16a34a;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.variant-group {
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.1);
}

.img-preview {
  max-width: 100px;
  max-height: 100px;
  margin-top: 0.5rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .filter-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>