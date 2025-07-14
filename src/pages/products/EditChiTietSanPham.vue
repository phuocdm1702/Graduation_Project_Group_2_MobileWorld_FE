<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Chỉnh Sửa Chi Tiết Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Form Section -->
    <FilterTableSection title="Form Chỉnh Sửa" icon="bi bi-pencil-square">
      <div class="m-3">
        <form @submit.prevent="submitForm" enctype="multipart/form-data" class="update-form">
          <!-- Product Name and Code -->
          <div class="row g-4">
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label class="form-label">Tên Sản Phẩm</label>
                <input v-model="formData.tenSanPham" type="text" class="form-control" disabled />
              </div>
            </div>
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label class="form-label">Mã Sản Phẩm</label>
                <input v-model="formData.maSanPham" type="text" class="form-control" disabled />
              </div>
            </div>
          </div>

          <!-- Variants -->
          <div class="variants-section mt-4">
            <h5>Biến Thể Sản Phẩm</h5>
            <div v-for="(variant, index) in formData.variants" :key="index" class="variant-group mb-4 p-3 border rounded">
              <div class="row g-3">
                <!-- Color -->
                <div class="col-md-3">
                  <label class="form-label">Màu Sắc</label>
                  <select v-model="variant.idMauSac" class="form-control" required @change="updateImagePreview(index)">
                    <option value="">Chọn màu sắc</option>
                    <option v-for="option in mauSacOptions" :key="option.id" :value="option.id">
                      {{ option.mauSac }}
                    </option>
                  </select>
                </div>
                <!-- RAM -->
                <div class="col-md-3">
                  <label class="form-label">RAM</label>
                  <select v-model="variant.idRam" class="form-control" required>
                    <option value="">Chọn RAM</option>
                    <option v-for="option in ramOptions" :key="option.id" :value="option.id">
                      {{ option.dungLuongRam }}
                    </option>
                  </select>
                </div>
                <!-- ROM -->
                <div class="col-md-3">
                  <label class="form-label">ROM</label>
                  <select v-model="variant.idBoNhoTrong" class="form-control" required>
                    <option value="">Chọn ROM</option>
                    <option v-for="option in boNhoTrongOptions" :key="option.id" :value="option.id">
                      {{ option.dungLuongBoNhoTrong }}
                    </option>
                  </select>
                </div>
                <!-- Price -->
                <div class="col-md-3">
                  <label class="form-label">Đơn Giá (VND)</label>
                  <input v-model.number="variant.donGia" type="number" class="form-control" required min="0" step="1000" />
                </div>
              </div>
              <!-- IMEI List -->
              <div class="mt-3">
                <label class="form-label">Danh Sách IMEI</label>
                <div v-for="(imei, imeiIndex) in variant.imeiList" :key="imeiIndex" class="imei-input-group mb-2">
                  <input v-model="variant.imeiList[imeiIndex]" type="text" class="form-control" placeholder="Nhập IMEI (15 chữ số)"
                    maxlength="15" required />
                  <button type="button" class="btn btn-danger btn-sm ms-2" @click="removeImei(index, imeiIndex)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addImei(index)">
                  Thêm IMEI
                </button>
              </div>
              <!-- Image Upload -->
              <div class="mt-3">
                <label class="form-label">Ảnh Sản Phẩm</label>
                <input type="file" class="form-control" accept="image/*" @change="handleImageUpload($event, index)" />
                <div v-if="variant.imagePreview || variant.imageUrl" class="image-preview mt-2">
                  <img :src="variant.imagePreview || variant.imageUrl" alt="Preview" class="preview-image" />
                  <button v-if="variant.imageUrl" type="button" class="btn btn-outline-danger btn-sm mt-2"
                    @click="removeImage(index)">
                    Xóa Ảnh Hiện Tại
                  </button>
                </div>
              </div>
              <!-- Remove Variant Button -->
              <button type="button" class="btn btn-danger btn-sm mt-3" @click="removeVariant(index)"
                v-if="formData.variants.length > 1">
                Xóa Biến Thể
              </button>
            </div>
            <button type="button" class="btn btn-primary btn-sm mt-3" @click="addVariant">
              Thêm Biến Thể
            </button>
          </div>

          <!-- Notes -->
          <div class="form-group mt-4">
            <label class="form-label">Ghi Chú</label>
            <textarea v-model="formData.ghiChu" class="form-control" rows="4"></textarea>
          </div>

          <!-- Form Actions -->
          <div class="form-actions mt-4">
            <button type="submit" class="btn btn-action" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Lưu Thay Đổi
            </button>
            <button type="button" class="btn btn-secondary ms-2" @click="goBack">Hủy</button>
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
import { getChiTietSanPhamBySanPhamId, updateChiTietSanPham, getMauSac, getRam, getBoNhoTrong } from '@/store/modules/products/chiTietSanPham';
import axios from 'axios';

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
      tenSanPham: '',
      maSanPham: '',
      ghiChu: '',
      variants: [
        {
          idMauSac: '',
          idRam: '',
          idBoNhoTrong: '',
          donGia: null,
          imeiList: [''],
          imageUrl: '',
          imageFile: null,
          imagePreview: '',
        },
      ],
    });
    const mauSacOptions = ref([]);
    const ramOptions = ref([]);
    const boNhoTrongOptions = ref([]);

    const fetchProductDetails = async () => {
      try {
        isLoading.value = true;
        const idSanPham = route.params.id;
        if (!idSanPham || idSanPham <= 0) {
          throw new Error("ID sản phẩm không hợp lệ");
        }

        const response = await getChiTietSanPhamBySanPhamId(idSanPham);
        const details = response.data;
        if (!details || details.length === 0) {
          throw new Error("Không tìm thấy chi tiết sản phẩm cho ID: " + idSanPham);
        }

        // Assuming the first item contains the common product details
        formData.value.tenSanPham = details[0].tenSanPham || '';
        formData.value.maSanPham = details[0].maSanPham || '';
        formData.value.ghiChu = details[0].ghiChu || '';

        // Group variants by mauSac, ram, and boNhoTrong
        formData.value.variants = details.reduce((acc, item) => {
          const mauSacId = mauSacOptions.value.find(opt => opt.mauSac === item.mauSac)?.id || '';
          const ramId = ramOptions.value.find(opt => opt.dungLuongRam === item.dungLuongRam)?.id || '';
          const boNhoTrongId = boNhoTrongOptions.value.find(opt => opt.dungLuongBoNhoTrong === item.dungLuongBoNhoTrong)?.id || '';

          const existingVariant = acc.find(
            v => v.idMauSac === mauSacId &&
                 v.idRam === ramId &&
                 v.idBoNhoTrong === boNhoTrongId
          );

          if (existingVariant) {
            existingVariant.imeiList.push(item.imei);
          } else {
            acc.push({
              idMauSac: mauSacId,
              idRam: ramId,
              idBoNhoTrong: boNhoTrongId,
              donGia: item.donGia,
              imeiList: [item.imei],
              imageUrl: item.imageUrl || '',
              imageFile: null,
              imagePreview: '',
            });
          }
          return acc;
        }, []);

        if (formData.value.variants.length === 0) {
          formData.value.variants.push({
            idMauSac: '',
            idRam: '',
            idBoNhoTrong: '',
            donGia: null,
            imeiList: [''],
            imageUrl: '',
            imageFile: null,
            imagePreview: '',
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Không thể tải chi tiết sản phẩm: ' + (error.response?.data?.message || error.message),
          duration: 5000,
        });
        router.push({ name: 'ChiTietSanPham', params: { id: route.params.id } });
      } finally {
        isLoading.value = false;
      }
    };

    const loadFilterOptions = async () => {
      try {
        const [mauSacRes, ramRes, boNhoTrongRes] = await Promise.all([
          getMauSac(),
          getRam(),
          getBoNhoTrong(),
        ]);
        mauSacOptions.value = mauSacRes.data || [];
        ramOptions.value = ramRes.data || [];
        boNhoTrongOptions.value = boNhoTrongRes.data || [];
      } catch (error) {
        console.error('Error loading filter options:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải bộ lọc: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
      }
    };

    const addVariant = () => {
      formData.value.variants.push({
        idMauSac: '',
        idRam: '',
        idBoNhoTrong: '',
        donGia: null,
        imeiList: [''],
        imageUrl: '',
        imageFile: null,
        imagePreview: '',
      });
    };

    const removeVariant = (index) => {
      formData.value.variants.splice(index, 1);
    };

    const addImei = (variantIndex) => {
      formData.value.variants[variantIndex].imeiList.push('');
    };

    const removeImei = (variantIndex, imeiIndex) => {
      formData.value.variants[variantIndex].imeiList.splice(imeiIndex, 1);
      if (formData.value.variants[variantIndex].imeiList.length === 0) {
        formData.value.variants[variantIndex].imeiList.push('');
      }
    };

    const handleImageUpload = (event, index) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.value?.addToast({
            type: 'error',
            message: 'File ảnh quá lớn (tối đa 10MB)',
            duration: 3000,
          });
          return;
        }
        if (!file.type.startsWith('image/')) {
          toast.value?.addToast({
            type: 'error',
            message: 'File không phải là ảnh hợp lệ',
            duration: 3000,
          });
          return;
        }
        formData.value.variants[index].imageFile = file;
        formData.value.variants[index].imagePreview = URL.createObjectURL(file);
      }
    };

    const removeImage = (index) => {
      formData.value.variants[index].imageUrl = '';
      formData.value.variants[index].imageFile = null;
      formData.value.variants[index].imagePreview = '';
    };

    const updateImagePreview = (index) => {
      if (!formData.value.variants[index].imageFile && !formData.value.variants[index].imageUrl) {
        const variant = formData.value.variants[index];
        const matchingVariant = formData.value.variants.find(
          v => v.idMauSac === variant.idMauSac && (v.imageUrl || v.imagePreview)
        );
        if (matchingVariant) {
          formData.value.variants[index].imageUrl = matchingVariant.imageUrl || '';
          formData.value.variants[index].imagePreview = matchingVariant.imagePreview || '';
        }
      }
    };

    const submitForm = async () => {
      try {
        isLoading.value = true;
        const formDataToSend = new FormData();
        const requestData = {
          id: route.params.id,
          maSanPham: formData.value.maSanPham,
          ghiChu: formData.value.ghiChu,
          variants: formData.value.variants.map(variant => ({
            idMauSac: variant.idMauSac,
            idRam: variant.idRam,
            idBoNhoTrong: variant.idBoNhoTrong,
            donGia: variant.donGia,
            imeiList: variant.imeiList.filter(imei => imei.trim() !== ''),
          })),
        };

        // Validate variants
        for (let i = 0; i < requestData.variants.length; i++) {
          const variant = requestData.variants[i];
          if (!variant.idMauSac || !variant.idRam || !variant.idBoNhoTrong || !variant.donGia) {
            throw new Error(`Biến thể ${i + 1} thiếu thông tin bắt buộc`);
          }
          if (!variant.imeiList || variant.imeiList.length === 0) {
            throw new Error(`Biến thể ${i + 1} phải có ít nhất một IMEI`);
          }
          for (const imei of variant.imeiList) {
            if (imei.length !== 15 || !/^\d{15}$/.test(imei)) {
              throw new Error(`IMEI "${imei}" tại biến thể ${i + 1} không hợp lệ - phải là 15 chữ số`);
            }
          }
        }

        formDataToSend.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
        formData.value.variants.forEach((variant, index) => {
          if (variant.imageFile) {
            formDataToSend.append('images', variant.imageFile);
          }
        });
        const existingImageUrls = formData.value.variants
          .filter(variant => variant.imageUrl)
          .map(variant => variant.imageUrl);
        if (existingImageUrls.length > 0) {
          formDataToSend.append('existingImageUrls', new Blob([JSON.stringify(existingImageUrls)], { type: 'application/json' }));
        }

        await updateChiTietSanPham(route.params.id, formDataToSend);
        toast.value?.addToast({
          type: 'success',
          message: 'Cập nhật chi tiết sản phẩm thành công',
          duration: 3000,
        });
        router.push({ name: 'ChiTietSanPham', params: { id: route.params.id } });
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi cập nhật chi tiết sản phẩm: ' + (error.response?.data?.message || error.message),
          duration: 5000,
        });
      } finally {
        isLoading.value = false;
      }
    };

    const goBack = () => {
      router.push({ name: 'ChiTietSanPham', params: { id: route.params.id } });
    };

    onMounted(async () => {
      await Promise.all([loadFilterOptions(), fetchProductDetails()]);
    });

    return {
      toast,
      formData,
      mauSacOptions,
      ramOptions,
      boNhoTrongOptions,
      isLoading,
      addVariant,
      removeVariant,
      addImei,
      removeImei,
      handleImageUpload,
      removeImage,
      updateImagePreview,
      submitForm,
      goBack,
    };
  },
};
</script>

<style scoped>
.update-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-label {
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-control {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.form-control:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  outline: none;
}

.form-control:disabled {
  background: #e9ecef;
  cursor: not-allowed;
}

.variant-group {
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.imei-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-image {
  max-width: 100px;
  max-height: 100px;
  margin-top: 0.5rem;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: #16a34a;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.btn-action:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .variant-group {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-action, .btn-secondary {
    width: 100%;
  }
}
</style>