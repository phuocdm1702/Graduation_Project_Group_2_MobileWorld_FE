<!-- EditSanPham.vue -->
<template>
  <div class="container-fluid py-4 product-management">
    <!-- Header -->
    <HeaderCard title="Chỉnh Sửa Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Form Section -->
    <FilterTableSection title="Thông Tin Sản Phẩm" icon="bi bi-pencil-square">
      <div class="m-3">
        <form @submit.prevent="saveProduct">
          <div class="row g-4">
            <!-- Product Code -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Mã Sản Phẩm</label>
                <input v-model.trim="product.ma" type="text" class="form-control search-input"
                  placeholder="Nhập mã sản phẩm..." required />
              </div>
            </div>
            <!-- Product Name -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Tên Sản Phẩm</label>
                <input v-model.trim="product.tenSanPham" type="text" class="form-control search-input"
                  placeholder="Nhập tên sản phẩm..." required />
              </div>
            </div>
            <!-- Manufacturer -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Hãng</label>
                <select v-model="product.idNhaSanXuat" class="form-control search-input" required>
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
                <select v-model="product.idHeDieuHanh" class="form-control search-input" required>
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
                <select v-model="product.congNgheManHinhId" class="form-control search-input" required>
                  <option value="">Chọn công nghệ màn hình</option>
                  <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                    {{ option.chuanManHinh }} {{ option.congNgheManHinh }} {{ option.doPhanGiai }} {{ option.tanSoQuet
                    }} {{ option.doSangToiDa }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Battery -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Pin</label>
                <select v-model="product.idPin" class="form-control search-input" required>
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
                <select v-model="product.idCpu" class="form-control search-input" required>
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
                <select v-model="product.idGpu" class="form-control search-input" required>
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
                <select v-model="product.idCumCamera" class="form-control search-input" required>
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
                <select v-model="product.idThietKe" class="form-control search-input" required>
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
                <select v-model="product.idSim" class="form-control search-input" required>
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
                <select v-model="product.idCongNgheMang" class="form-control search-input" required>
                  <option value="">Chọn công nghệ mạng</option>
                  <option v-for="option in congNgheMangOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNgheMang }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Optional Fields -->
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Chỉ số kháng bụi và nước</label>
                <select v-model="product.idChiSoKhangBuiVaNuoc" class="form-control search-input">
                  <option value="">Chọn chỉ số kháng bụi và nước</option>
                  <option v-for="option in chiSoKhangBuiVaNuocOptions" :key="option.id" :value="option.id">
                    {{ option.tenChiSo }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Hỗ trợ bộ nhớ ngoài</label>
                <select v-model="product.idHoTroBoNhoNgoai" class="form-control search-input">
                  <option value="">Chọn hỗ trợ bộ nhớ ngoài</option>
                  <option v-for="option in hoTroBoNhoNgoaiOptions" :key="option.id" :value="option.id">
                    {{ option.hoTroBoNhoNgoai }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-lg-6 col-md-12">
              <div class="filter-group">
                <label class="filter-label">Công nghệ sạc</label>
                <select v-model="product.hoTroCongNgheSacId" class="form-control search-input">
                  <option value="">Chọn công nghệ sạc</option>
                  <option v-for="option in hoTroCongNgheSacOptions" :key="option.id" :value="option.id">
                    {{ option.congNgheHoTro }} {{ option.congSac }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions mt-4">
            <div class="action-buttons">
              <router-link to="/sanPham" class="btn btn-reset">
                Quay lại
              </router-link>
              <button type="submit" class="btn btn-action">
                Lưu sản phẩm
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
  fetchNhaSanXuat,
  fetchHeDieuHanh,
  fetchCongNgheManHinh,
  fetchPin,
  fetchCpu,
  fetchGpu,
  fetchCumCamera,
  fetchThietKe,
  fetchSim,
  fetchCongNgheMang,
  fetchChiSoKhangBuiVaNuoc,
  fetchHoTroBoNhoNgoai,
  fetchHoTroCongNgheSac,
  getProductDetail,
  updateProduct,
} from '@/store/modules/products/sanPham';

export default defineComponent({
  name: 'EditSanPham',
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

    // Product data
    const product = ref({
      id: '',
      ma: '',
      tenSanPham: '',
      idNhaSanXuat: '',
      idHeDieuHanh: '',
      congNgheManHinhId: '',
      idPin: '',
      idCpu: '',
      idGpu: '',
      idCumCamera: '',
      idThietKe: '',
      idSim: '',
      idCongNgheMang: '',
      idChiSoKhangBuiVaNuoc: null,
      idHoTroBoNhoNgoai: null,
      hoTroCongNgheSacId: null,
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
        ] = await Promise.allSettled([
          fetchNhaSanXuat(),
          fetchHeDieuHanh(),
          fetchCongNgheManHinh(),
          fetchPin(),
          fetchCpu(),
          fetchGpu(),
          fetchCumCamera(),
          fetchThietKe(),
          fetchSim(),
          fetchCongNgheMang(),
          fetchChiSoKhangBuiVaNuoc(),
          fetchHoTroBoNhoNgoai(),
          fetchHoTroCongNgheSac(),
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

        // Fallback options in case of failure
        if (!nhaSanXuatOptions.value.length) {
          nhaSanXuatOptions.value = [
            { id: 1, nhaSanXuat: 'Apple' },
            { id: 2, nhaSanXuat: 'Samsung' },
            { id: 3, nhaSanXuat: 'Google' },
          ];
        }
        if (!heDieuHanhOptions.value.length) {
          heDieuHanhOptions.value = [
            { id: 1, heDieuHanh: 'iOS', phienBan: '16' },
            { id: 2, heDieuHanh: 'Android', phienBan: '13' },
          ];
        }
        if (!congNgheManHinhOptions.value.length) {
          congNgheManHinhOptions.value = [
            { id: 1, chuanManHinh: 'OLED', congNgheManHinh: 'OLED' },
            { id: 2, chuanManHinh: 'AMOLED', congNgheManHinh: 'AMOLED' },
          ];
        }
        if (!pinOptions.value.length) {
          pinOptions.value = [
            { id: 1, loaiPin: 'Li-Ion', dungLuongPin: '3200 mAh' },
            { id: 2, loaiPin: 'Li-Po', dungLuongPin: '5000 mAh' },
          ];
        }
        if (!cpuOptions.value.length) {
          cpuOptions.value = [
            { id: 1, tenCpu: 'Snapdragon 8 Gen 1' },
            { id: 2, tenCpu: 'A15 Bionic' },
          ];
        }
        if (!gpuOptions.value.length) {
          gpuOptions.value = [
            { id: 1, tenGpu: 'Adreno 730' },
            { id: 2, tenGpu: 'Apple GPU' },
          ];
        }
        if (!cumCameraOptions.value.length) {
          cumCameraOptions.value = [
            { id: 1, thongSoCameraSau: '48MP', thongSoCameraTruoc: '12MP' },
            { id: 2, thongSoCameraSau: '108MP', thongSoCameraTruoc: '16MP' },
          ];
        }
        if (!thietKeOptions.value.length) {
          thietKeOptions.value = [
            { id: 1, chatLieuKhung: 'Nhôm', chatLieuMatLung: 'Kính' },
            { id: 2, chatLieuKhung: 'Thép', chatLieuMatLung: 'Kính' },
          ];
        }
        if (!simOptions.value.length) {
          simOptions.value = [
            { id: 1, cacLoaiSimHoTro: 'Nano SIM, eSIM' },
            { id: 2, cacLoaiSimHoTro: 'Dual Nano SIM' },
          ];
        }
        if (!congNgheMangOptions.value.length) {
          congNgheMangOptions.value = [
            { id: 1, tenCongNgheMang: '5G' },
            { id: 2, tenCongNgheMang: '4G' },
          ];
        }
        if (!chiSoKhangBuiVaNuocOptions.value.length) {
          chiSoKhangBuiVaNuocOptions.value = [
            { id: 1, tenChiSo: 'IP68' },
            { id: 2, tenChiSo: 'IP67' },
          ];
        }
        if (!hoTroBoNhoNgoaiOptions.value.length) {
          hoTroBoNhoNgoaiOptions.value = [
            { id: 1, hoTroBoNhoNgoai: 'Có, lên đến 1TB' },
            { id: 2, hoTroBoNhoNgoai: 'Không' },
          ];
        }
        if (!hoTroCongNgheSacOptions.value.length) {
          hoTroCongNgheSacOptions.value = [
            { id: 1, congNgheHoTro: 'Sạc nhanh 25W', congSac: 'USB-C' },
            { id: 2, congNgheHoTro: 'Sạc nhanh 15W', congSac: 'Lightning' },
          ];
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách bộ lọc: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
      }
    };

    // Load product details
    const loadProduct = async () => {
      try {
        isLoading.value = true;
        const productId = route.params.id;
        const response = await getProductDetail(productId);
        if (response.data) {
          product.value = {
            id: response.data.id || '',
            ma: response.data.ma || '',
            tenSanPham: response.data.tenSanPham || '',
            idNhaSanXuat: response.data.idNhaSanXuat || '',
            idHeDieuHanh: response.data.idHeDieuHanh || '',
            congNgheManHinhId: response.data.congNgheManHinhId || '',
            idPin: response.data.idPin || '',
            idCpu: response.data.idCpu || '',
            idGpu: response.data.idGpu || '',
            idCumCamera: response.data.idCumCamera || '',
            idThietKe: response.data.idThietKe || '',
            idSim: response.data.idSim || '',
            idCongNgheMang: response.data.idCongNgheMang || '',
            idChiSoKhangBuiVaNuoc: response.data.idChiSoKhangBuiVaNuoc || null,
            idHoTroBoNhoNgoai: response.data.idHoTroBoNhoNgoai || null,
            hoTroCongNgheSacId: response.data.hoTroCongNgheSacId || null,
          };

          // Validate IDs against options
          const validateOption = (id, options, field, displayName) => {
            if (id && !options.find(opt => opt.id === id)) {
              console.warn(`${field} ${id} not found in options`);
              product.value[field] = '';
              toastNotification.value?.addToast({
                type: 'warning',
                message: `${displayName} không hợp lệ, vui lòng chọn lại.`,
                duration: 3000,
              });
            }
          };

          validateOption(product.value.idNhaSanXuat, nhaSanXuatOptions.value, 'idNhaSanXuat', 'Hãng');
          validateOption(product.value.idHeDieuHanh, heDieuHanhOptions.value, 'idHeDieuHanh', 'Hệ điều hành');
          validateOption(product.value.congNgheManHinhId, congNgheManHinhOptions.value, 'congNgheManHinhId', 'Công nghệ màn hình');
          validateOption(product.value.idPin, pinOptions.value, 'idPin', 'Pin');
          validateOption(product.value.idCpu, cpuOptions.value, 'idCpu', 'CPU');
          validateOption(product.value.idGpu, gpuOptions.value, 'idGpu', 'GPU');
          validateOption(product.value.idCumCamera, cumCameraOptions.value, 'idCumCamera', 'Cụm camera');
          validateOption(product.value.idThietKe, thietKeOptions.value, 'idThietKe', 'Thiết kế');
          validateOption(product.value.idSim, simOptions.value, 'idSim', 'SIM');
          validateOption(product.value.idCongNgheMang, congNgheMangOptions.value, 'idCongNgheMang', 'Công nghệ mạng');
          validateOption(product.value.idChiSoKhangBuiVaNuoc, chiSoKhangBuiVaNuocOptions.value, 'idChiSoKhangBuiVaNuoc', 'Chỉ số kháng bụi và nước');
          validateOption(product.value.idHoTroBoNhoNgoai, hoTroBoNhoNgoaiOptions.value, 'idHoTroBoNhoNgoai', 'Hỗ trợ bộ nhớ ngoài');
          validateOption(product.value.hoTroCongNgheSacId, hoTroCongNgheSacOptions.value, 'hoTroCongNgheSacId', 'Công nghệ sạc');
        } else {
          throw new Error('Không tìm thấy sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải thông tin sản phẩm: ' + (error.response?.data?.message || error.message),
          duration: 5000,
        });
      } finally {
        isLoading.value = false;
      }
    };

    const saveProduct = async () => {
  console.log('Product ID:', product.value.id);
  console.log('Product Data:', JSON.stringify(product.value, null, 2));
  
  try {
    isLoading.value = true;
    
    // Gọi API update
    const response = await updateProduct(product.value.id, product.value);
    console.log('Update response:', response); // Debug log
    
    // Đảm bảo toast notification được gọi
    if (toastNotification.value) {
      toastNotification.value.addToast({
        type: 'success',
        message: `Cập nhật sản phẩm ${product.value.tenSanPham} thành công`,
        duration: 3000,
      });
      console.log('Toast notification called'); // Debug log
    } else {
      console.error('toastNotification ref is null');
    }
    
    // Delay trước khi navigate để toast có thời gian hiển thị
    setTimeout(() => {
      router.push('/sanPham');
    }, 1000);
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    let errorMessage = 'Lỗi khi cập nhật sản phẩm';
    if (error.response?.data) {
      console.log('Server Response:', error.response.data);
      if (typeof error.response.data === 'object') {
        errorMessage = Object.entries(error.response.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
      } else {
        errorMessage = error.response.data.message || error.message;
      }
    }
    
    if (toastNotification.value) {
      toastNotification.value.addToast({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      });
    }
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
      await Promise.all([loadFilterOptions(), loadProduct()]);
    });

    return {
      product,
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
      toastNotification,
      notificationModal,
      isLoading,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      saveProduct,
      resetNotification,
    };
  },
});
</script>

<style scoped>
/* Animations */
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

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Base Styles */
.product-management {
  min-height: 100vh;
}

/* Filter Label and Inputs */
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
.btn-action {
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
  display: inline-flex;
  align-items: center;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

/* Responsive */
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