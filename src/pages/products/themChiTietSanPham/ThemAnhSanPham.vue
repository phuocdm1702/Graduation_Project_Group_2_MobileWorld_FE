<template>
  <div class="container-fluid">
    <!-- Ảnh Sản Phẩm Section -->
    <FilterTableSection v-if="showImageSection && productVariants?.length > 0" title="Thêm Ảnh Sản Phẩm" icon="bi bi-image">
      <div class="m-3">
        <div class="card-grid">
          <div v-for="color in uniqueColors" :key="color.colorId" class="product-card">
            <div class="product-card-header">
              <span class="product-code">{{ color.colorName }}</span>
            </div>
            <div class="product-card-body text-center">
              <div class="image-preview">
                <img v-if="colorImages[color.colorId]?.previewUrl" :src="colorImages[color.colorId].previewUrl" alt="Color Image Preview" class="img-fluid" />
                <span v-else class="text-gray-700">Chưa có ảnh</span>
              </div>
              <label class="btn btn-action mt-3">
                <i class="bi bi-upload me-2"></i>
                Tải ảnh lên
                <input type="file" accept="image/*" @change="handleColorImageUpload($event, color.colorId)" class="d-none" />
              </label>
              <div v-if="colorImages[color.colorId]?.status" class="status mt-2 text-sm">
                {{ colorImages[color.colorId].status }}
              </div>
            </div>
          </div>
        </div>
        <div class="action-buttons mt-4">
          <button @click="resetForm" class="btn btn-reset">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
          <button @click="handleSubmit" :disabled="isSubmitting" class="btn btn-action" :class="{ 'btn-disabled': isSubmitting }">
            <i class="bi bi-check-circle me-2"></i>
            {{ isSubmitting ? 'Đang xử lý...' : 'Thêm sản phẩm' }}
          </button>
        </div>
      </div>
    </FilterTableSection>

    <!-- Toast Notification -->
    <ToastNotification ref="toastNotification" />

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center p-4">
          <i class="bi bi-arrow-clockwise animate-spin text-4xl text-success"></i>
          <p class="mt-3 text-gray-700">Đang xử lý...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getMauSac, addChiTietSanPham } from '@/store/modules/products/chiTietSanPham';
import imageCompression from 'browser-image-compression';

export default defineComponent({
  name: 'ProductImages',
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
      required: true,
    },
    mauSacOptions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['product-submitted', 'reset-form'],
  setup(props, { emit }) {
    const router = useRouter();
    const toastNotification = ref(null);
    const colorImages = ref({});
    const isSubmitting = ref(false);
    const showImageSection = ref(true);

    const uniqueColors = computed(() => {
      const colorIds = [...new Set(props.productVariants.map((variant) => variant.idMauSac))];
      return colorIds.map((colorId) => ({
        colorId,
        colorName: props.mauSacOptions.find((mau) => mau.id === colorId)?.mauSac || 'N/A',
      }));
    });

    const fetchMauSac = async () => {
      try {
        const response = await getMauSac();
        props.mauSacOptions = response.data;
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách màu sắc: ' + error.message,
          duration: 3000,
        });
      }
    };

    fetchMauSac();

    const handleColorImageUpload = async (event, colorId) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        try {
          const compressionOptions = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, compressionOptions);
          const reader = new FileReader();
          reader.onload = (e) => {
            colorImages.value[colorId] = {
              file: compressedFile,
              previewUrl: e.target.result,
              status: 'Đã nén, sẵn sàng tải lên',
            };
            toastNotification.value?.addToast({
              type: 'success',
              message: `Tải ảnh cho màu ${props.mauSacOptions.find((mau) => mau.id === colorId)?.mauSac} thành công!`,
              duration: 3000,
            });
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          toastNotification.value?.addToast({
            type: 'error',
            message: 'Lỗi khi nén ảnh: ' + error.message,
            duration: 3000,
          });
        }
      } else {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn file ảnh hợp lệ!',
          duration: 3000,
        });
      }
      event.target.value = '';
    };

    const validateForm = () => {
      if (!props.productData.tenSanPham) return { valid: false, message: 'Vui lòng nhập tên sản phẩm!' };
      if (!props.productData.idNhaSanXuat) return { valid: false, message: 'Vui lòng chọn nhà sản xuất!' };
      if (!props.productData.idPin) return { valid: false, message: 'Vui lòng chọn pin!' };
      if (!props.productData.idCongNgheManHinh) return { valid: false, message: 'Vui lòng chọn công nghệ màn hình!' };
      if (!props.productData.idCpu) return { valid: false, message: 'Vui lòng chọn CPU!' };
      if (!props.productData.idGpu) return { valid: false, message: 'Vui lòng chọn GPU!' };
      if (!props.productData.idCumCamera) return { valid: false, message: 'Vui lòng chọn cụm camera!' };
      if (!props.productData.idHeDieuHanh) return { valid: false, message: 'Vui lòng chọn hệ điều hành!' };
      if (!props.productData.idThietKe) return { valid: false, message: 'Vui lòng chọn thiết kế!' };
      if (!props.productData.idSim) return { valid: false, message: 'Vui lòng chọn SIM!' };
      if (!props.productData.idHoTroCongNgheSac) return { valid: false, message: 'Vui lòng chọn công nghệ sạc!' };
      if (!props.productData.idCongNgheMang) return { valid: false, message: 'Vui lòng chọn công nghệ mạng!' };
      if (!props.productData.idChiSoKhangBuiVaNuoc) return { valid: false, message: 'Vui lòng chọn chỉ số kháng bụi nước!' };
      if (!props.productVariants || props.productVariants.length === 0) return { valid: false, message: 'Vui lòng thêm ít nhất một phiên bản sản phẩm!' };
      for (const [index, variant] of props.productVariants.entries()) {
        if (!variant.idMauSac) return { valid: false, message: 'Vui lòng chọn màu sắc cho phiên bản!' };
        if (!variant.idRam) return { valid: false, message: 'Vui lòng chọn RAM cho phiên bản!' };
        if (!variant.idBoNhoTrong) return { valid: false, message: 'Vui lòng chọn bộ nhớ trong cho phiên bản!' };
        if (!variant.donGia || isNaN(parseFloat(variant.donGia)) || parseFloat(variant.donGia) <= 0) return { valid: false, message: 'Vui lòng nhập đơn giá hợp lệ cho tất cả phiên bản!' };
        const imeis = props.variantImeis[index] || [];
        if (!imeis || imeis.length === 0) return { valid: false, message: `Vui lòng nhập ít nhất một IMEI cho phiên bản ${index + 1}!` };
        for (const imei of imeis) {
          if (!imei || imei.length !== 15 || !/^\d{15}$/.test(imei)) return { valid: false, message: `IMEI "${imei}" không hợp lệ! IMEI phải là 15 chữ số.` };
        }
      }
      const missingImages = uniqueColors.value.filter((color) => !colorImages.value[color.colorId]);
      if (missingImages.length > 0) return { valid: false, message: `Vui lòng tải ảnh cho màu: ${missingImages.map((c) => c.colorName).join(', ')}!` };
      return { valid: true };
    };

    const handleSubmit = async () => {
      console.log('handleSubmit called');
      const validation = validateForm();
      console.log('Validation result:', validation);
      if (!validation.valid) {
        toastNotification.value?.addToast({
          type: 'error',
          message: validation.message,
          duration: 3000,
        });
        return;
      }

      await submitProduct();
    };

    const submitProduct = async () => {
      isSubmitting.value = true;
      console.log('submitProduct started');

      try {
        const productPayload = {
          tenSanPham: props.productData.tenSanPham,
          idNhaSanXuat: parseInt(props.productData.idNhaSanXuat) || null,
          idPin: parseInt(props.productData.idPin) || null,
          idCongNgheManHinh: parseInt(props.productData.idCongNgheManHinh) || null,
          idHoTroBoNhoNgoai: props.productData.idHoTroBoNhoNgoai ? parseInt(props.productData.idHoTroBoNhoNgoai) : null,
          idCpu: parseInt(props.productData.idCpu) || null,
          idGpu: parseInt(props.productData.idGpu) || null,
          idCumCamera: parseInt(props.productData.idCumCamera) || null,
          idHeDieuHanh: parseInt(props.productData.idHeDieuHanh) || null,
          idChiSoKhangBuiVaNuoc: parseInt(props.productData.idChiSoKhangBuiVaNuoc) || null,
          idThietKe: parseInt(props.productData.idThietKe) || null,
          idSim: parseInt(props.productData.idSim) || null,
          idHoTroCongNgheSac: parseInt(props.productData.idHoTroCongNgheSac) || null,
          idCongNgheMang: parseInt(props.productData.idCongNgheMang) || null,
          ghiChu: props.productData.ghiChu || '',
          variants: props.productVariants.map((variant, index) => ({
            idMauSac: parseInt(variant.idMauSac) || null,
            idRam: parseInt(variant.idRam) || null,
            idBoNhoTrong: parseInt(variant.idBoNhoTrong) || null,
            donGia: parseFloat(variant.donGia) || 0,
            imeiList: props.variantImeis[index] || [],
          })),
        };

        console.log('Payload to send:', JSON.stringify(productPayload, null, 2));
        const images = Object.values(colorImages.value).map((imageData) => imageData.file);
        console.log('Images to send:', images);

        const response = await addChiTietSanPham(productPayload, images);
        console.log('Response from server:', response);

        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm sản phẩm thành công!',
          duration: 3000,
        });
        emit('product-submitted', response.data);
        resetForm();
        router.push('/sanPham');
      } catch (error) {
        console.error('Error in submitProduct:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Có lỗi xảy ra khi thêm sản phẩm: ' + error.message,
          duration: 3000,
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    const resetForm = () => {
      emit('reset-form');
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã làm mới biểu mẫu!',
        duration: 3000,
      });
    };

    return {
      toastNotification,
      colorImages,
      uniqueColors,
      isSubmitting,
      showImageSection,
      handleColorImageUpload,
      handleSubmit,
      resetForm,
    };
  },
});
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card-header {
  background: #f1f3f5;
  padding: 0.75rem;
  text-align: center;
}

.product-code {
  font-weight: 600;
  color: #1f3a44;
  font-size: 0.9rem;
}

.product-card-body {
  padding: 1rem;
}

.image-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-content {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.text-success {
  color: #34d399;
}

.text-gray-700 {
  color: #495057;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status {
  color: #34d399;
}

@media (max-width: 576px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>