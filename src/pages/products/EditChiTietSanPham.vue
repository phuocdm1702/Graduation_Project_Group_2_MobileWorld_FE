<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Chỉnh Sửa Chi Tiết Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Form Section -->
    <FilterTableSection title="Thông Tin Chi Tiết Sản Phẩm" icon="bi bi-pencil-square">
      <div class="m-3">
        <form @submit.prevent="handleSubmit" class="row g-4">
          <!-- Tên sản phẩm -->
          <div class="col-md-6">
            <label class="filter-label">Tên Sản Phẩm</label>
            <input v-model.trim="formData.tenSanPham" type="text" class="form-control search-input"
              placeholder="Nhập tên sản phẩm" required :disabled="true" />
          </div>

          <!-- Màu sắc -->
          <div class="col-md-6">
            <label class="filter-label">Màu Sắc</label>
            <select v-model="formData.variants[0].idMauSac" class="form-select search-input" required>
              <option value="">Chọn màu sắc</option>
              <option v-for="option in mauSacOptions" :key="option.id" :value="option.id">
                {{ option.mauSac }}
              </option>
            </select>
          </div>

          <!-- RAM -->
          <div class="col-md-6">
            <label class="filter-label">RAM</label>
            <select v-model="formData.variants[0].idRam" class="form-select search-input" required>
              <option value="">Chọn RAM</option>
              <option v-for="option in ramOptions" :key="option.id" :value="option.id">
                {{ option.dungLuongRam }}
              </option>
            </select>
          </div>

          <!-- Bộ nhớ trong -->
          <div class="col-md-6">
            <label class="filter-label">Bộ Nhớ Trong</label>
            <select v-model="formData.variants[0].idBoNhoTrong" class="form-select search-input" required>
              <option value="">Chọn bộ nhớ trong</option>
              <option v-for="option in boNhoTrongOptions" :key="option.id" :value="option.id">
                {{ option.dungLuongBoNhoTrong }}
              </option>
            </select>
          </div>

          <!-- Đơn giá -->
          <div class="col-md-6">
            <label class="filter-label">Đơn Giá</label>
            <input v-model.number="formData.variants[0].donGia" type="number" class="form-control search-input"
              placeholder="Nhập đơn giá" min="0" step="1000" required />
          </div>

          <!-- IMEI -->
          <div class="col-md-6">
            <label class="filter-label">IMEI</label>
            <input v-model.trim="formData.variants[0].imeiList[0]" type="text" class="form-control search-input"
              placeholder="Nhập IMEI (15 chữ số)" pattern="\d{15}" required />
          </div>

          <!-- Ảnh sản phẩm -->
          <div class="col-md-6">
            <label class="filter-label">Ảnh Sản Phẩm</label>
            <input type="file" accept="image/*" @change="handleImageChange" class="form-control search-input" />
            <div v-if="existingImageUrl" class="mt-2">
              <img :src="existingImageUrl" alt="Current Image" class="product-image" />
              <p class="mt-1 text-sm text-gray-600">Ảnh hiện tại</p>
            </div>
          </div>

          <!-- Ghi chú -->
          <div class="col-md-12">
            <label class="filter-label">Ghi Chú</label>
            <textarea v-model.trim="formData.ghiChu" class="form-control search-input" rows="4"
              placeholder="Nhập ghi chú"></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="col-md-12">
            <div class="action-buttons d-flex gap-3">
              <button type="button" class="btn btn-action btn-outline" @click="goBack">
                Hủy
              </button>
              <button type="submit" class="btn btn-action" :disabled="isLoading">
                {{ isLoading ? 'Đang Lưu...' : 'Lưu' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </FilterTableSection>

    <!-- Toast Notification -->
    <ToastNotification ref="toast" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getChiTietSanPhamBySanPhamId, getMauSac, getRam, getBoNhoTrong, updateChiTietSanPham, checkImelExists } from '@/store/modules/products/chiTietSanPham';
import apiService from '@/services/api';

export default {
  name: 'EditChiTietSanPham',
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = ref(null);
    const isLoading = ref(false);
    const formData = ref({
      id: null, // ID của chi tiết sản phẩm
      tenSanPham: '',
      ghiChu: '',
      variants: [{
        idMauSac: '',
        idRam: '',
        idBoNhoTrong: '',
        donGia: 0,
        imeiList: [''],
      }],
    });
    const mauSacOptions = ref([]);
    const ramOptions = ref([]);
    const boNhoTrongOptions = ref([]);
    const existingImageUrl = ref('');
    const images = ref([]);
    const originalImei = ref('');

    const loadFilterOptions = async () => {
      try {
        const [mauSacRes, ramRes, boNhoTrongRes] = await Promise.all([
          getMauSac(),
          getRam(),
          getBoNhoTrong(),
        ]);
        mauSacOptions.value = mauSacRes.data;
        ramOptions.value = ramRes.data;
        boNhoTrongOptions.value = boNhoTrongRes.data;
        console.log('mauSacOptions:', mauSacOptions.value);
        console.log('ramOptions:', ramOptions.value);
        console.log('boNhoTrongOptions:', boNhoTrongOptions.value);
      } catch (error) {
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải bộ lọc: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
        console.error('Lỗi khi tải bộ lọc:', error);
      }
    };

    const fetchProductDetail = async () => {
      try {
        isLoading.value = true;
        console.log('Fetching product details for idSanPham:', route.params.id, 'and IMEI:', route.query.imei);
        const response = await getChiTietSanPhamBySanPhamId(route.params.id);
        console.log('API Response:', response.data);
        const productDetail = response.data.find(item => item.imei === route.query.imei);
        console.log('Selected Product Detail:', productDetail);
        if (!productDetail) {
          throw new Error(`Không tìm thấy chi tiết sản phẩm với IMEI: ${route.query.imei}`);
        }
        // Lấy ID chi tiết sản phẩm từ API
        const chiTietSanPhamId = await getChiTietSanPhamIdByImei(route.query.imei);
        formData.value = {
          id: chiTietSanPhamId,
          tenSanPham: productDetail.tenSanPham || '',
          ghiChu: productDetail.ghiChu || '',
          variants: [{
            idMauSac: mauSacOptions.value.find(opt => opt.mauSac === productDetail.mauSac)?.id || '',
            idRam: ramOptions.value.find(opt => opt.dungLuongRam === productDetail.dungLuongRam)?.id || '',
            idBoNhoTrong: boNhoTrongOptions.value.find(opt => opt.dungLuongBoNhoTrong === productDetail.dungLuongBoNhoTrong)?.id || '',
            donGia: productDetail.donGia || 0,
            imeiList: [productDetail.imei || ''],
          }],
        };
        originalImei.value = productDetail.imei || '';
        existingImageUrl.value = productDetail.imageUrl || '';
        console.log('Form Data after fetch:', JSON.stringify(formData.value));
        console.log('Original IMEI:', originalImei.value);
        console.log('ChiTietSanPham ID:', formData.value.id);
      } catch (error) {
        toast.value?.addToast({
          type: 'error',
          message: 'Không thể tải chi tiết sản phẩm: ' + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        console.error('Error fetching product detail:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const getChiTietSanPhamIdByImei = async (imei) => {
      try {
        const response = await apiService.get(`/api/chi-tiet-san-pham/find-by-imei?imei=${imei}`);
        console.log('ChiTietSanPham ID Response:', response.data);
        return response.data.id;
      } catch (error) {
        console.error('Error fetching ChiTietSanPham ID by IMEI:', error);
        throw new Error('Không thể tìm ID chi tiết sản phẩm cho IMEI: ' + imei);
      }
    };

    const handleImageChange = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        images.value = [files[0]];
      }
    };

    const validateFormData = () => {
      const variant = formData.value.variants[0];
      if (!formData.value.tenSanPham || !formData.value.tenSanPham.trim()) {
        toast.value?.addToast({
          type: 'error',
          message: 'Tên sản phẩm không được để trống',
          duration: 3000,
        });
        return false;
      }
      if (!formData.value.id) {
        toast.value?.addToast({
          type: 'error',
          message: 'ID chi tiết sản phẩm không hợp lệ',
          duration: 3000,
        });
        return false;
      }
      if (!variant.idMauSac) {
        toast.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn màu sắc',
          duration: 3000,
        });
        return false;
      }
      if (!variant.idRam) {
        toast.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn RAM',
          duration: 3000,
        });
        return false;
      }
      if (!variant.idBoNhoTrong) {
        toast.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn bộ nhớ trong',
          duration: 3000,
        });
        return false;
      }
      if (variant.donGia <= 0) {
        toast.value?.addToast({
          type: 'error',
          message: 'Đơn giá phải lớn hơn 0',
          duration: 3000,
        });
        return false;
      }
      const imei = variant.imeiList[0];
      if (!imei || imei.length !== 15 || !/^\d{15}$/.test(imei)) {
        toast.value?.addToast({
          type: 'error',
          message: 'IMEI phải là 15 chữ số',
          duration: 3000,
        });
        return false;
      }
      return true;
    };

    const checkImei = async (imei) => {
      try {
        console.log('Checking IMEI:', imei);
        const response = await checkImelExists(imei);
        console.log('Check IMEI response:', response.data);
        return response.data.exists;
      } catch (error) {
        console.error('Lỗi khi kiểm tra IMEI:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi kiểm tra IMEI: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
        throw new Error('Không thể kiểm tra IMEI');
      }
    };

    const handleSubmit = async () => {
      if (!validateFormData()) {
        return;
      }
      try {
        isLoading.value = true;
        console.log('Submitting Form Data:', JSON.stringify(formData.value));
        const newImei = formData.value.variants[0].imeiList[0];
        if (newImei !== originalImei.value) {
          console.log('IMEI đã thay đổi, kiểm tra trùng lặp');
          const imeiExists = await checkImei(newImei);
          if (imeiExists) {
            toast.value?.addToast({
              type: 'error',
              message: `IMEI ${newImei} đã tồn tại trong hệ thống`,
              duration: 3000,
            });
            return;
          }
        } else {
          console.log('IMEI không thay đổi, bỏ qua kiểm tra trùng lặp');
        }
        const response = await updateChiTietSanPham(
          formData.value.id,
          formData.value,
          images.value,
          existingImageUrl.value ? [existingImageUrl.value] : []
        );
        toast.value?.addToast({
          type: 'success',
          message: `Cập nhật chi tiết sản phẩm ${formData.value.tenSanPham} thành công!`,
          duration: 3000,
        });
        setTimeout(() => {
          router.push({ name: 'ChiTietSanPham', params: { id: route.params.id } });
        }, 1000); // Delay navigation to ensure toast is visible
      } catch (error) {
        let errorMessage = 'Lỗi khi cập nhật chi tiết sản phẩm';
        if (error.message === 'Không thể kiểm tra IMEI') {
          errorMessage = 'Không thể kiểm tra IMEI. Vui lòng thử lại sau.';
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ: Kiểm tra lại thông tin đã nhập';
        } else if (error.response?.status === 404) {
          errorMessage = 'Không tìm thấy chi tiết sản phẩm';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
        }
        toast.value?.addToast({
          type: 'error',
          message: errorMessage,
          duration: 3000,
        });
        console.error('Error updating product detail:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const goBack = () => {
      router.push({ name: 'ChiTietSanPham', params: { id: route.params.id } });
    };

    onMounted(async () => {
      await loadFilterOptions();
      await fetchProductDetail();
      if (!formData.value.id) {
        console.warn('ChiTietSanPham ID is empty after fetch');
        toast.value?.addToast({
          type: 'error',
          message: 'Không thể tải ID chi tiết sản phẩm. Vui lòng kiểm tra lại.',
          duration: 3000,
        });
      }
    });

    return {
      toast,
      formData,
      mauSacOptions,
      ramOptions,
      boNhoTrongOptions,
      existingImageUrl,
      images,
      isLoading,
      handleImageChange,
      handleSubmit,
      goBack,
    };
  },
};
</script>

<style scoped>
.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-input {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action:hover {
  background: #16a34a;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
  transform: translateY(-2px);
}

.btn-action:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid #34d399;
  color: #34d399;
}

.btn-outline:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.product-image {
  width: 60px;
  height: 65px;
}
</style>