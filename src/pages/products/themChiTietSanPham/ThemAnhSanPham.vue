<template>
  <div class="container-fluid">
    <!-- Ảnh Sản Phẩm Section -->
    <FilterTableSection
      v-if="showImageSection && productVariants.length > 0"
      title="Thêm Ảnh Sản Phẩm"
      icon="bi bi-image"
    >
      <div class="m-3">
        <div class="card-grid">
          <div
            v-for="color in uniqueColors"
            :key="color.colorId"
            class="product-card"
          >
            <div class="product-card-header">
              <span class="product-code">{{ color.colorName }}</span>
            </div>
            <div class="product-card-body text-center">
              <div class="image-preview">
                <img
                  v-if="colorImages[color.colorId]?.previewUrl"
                  :src="colorImages[color.colorId].previewUrl"
                  alt="Color Image Preview"
                  class="img-fluid"
                />
                <span v-else class="text-gray-700">Chưa có ảnh</span>
              </div>
              <label class="btn btn-action mt-3">
                <i class="bi bi-upload me-2"></i>
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  @change="handleColorImageUpload($event, color.colorId)"
                  class="d-none"
                />
              </label>
            </div>
          </div>
        </div>
        <div class="action-buttons mt-4">
          <button
            @click="resetForm"
            class="btn btn-reset"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="btn btn-action"
            :class="{ 'btn-disabled': isSubmitting }"
          >
            <i class="bi bi-check-circle me-2"></i>
            {{ isSubmitting ? 'Đang xử lý...' : 'Thêm sản phẩm' }}
          </button>
        </div>
      </div>
    </FilterTableSection>

    <!-- Notification Modal -->
    <NotificationModal
      :isVisible="isModalVisible"
      :type="notificationType"
      :message="notificationMessage"
      :isLoading="isNotificationLoading"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      @close="resetNotification"
    />
    <ToastNotification ref="toastNotification" />

    <!-- Loading Overlay -->
    <div
      v-if="isSubmitting"
      class="modal fade show d-block"
      tabindex="-1"
    >
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
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getMauSac, addChiTietSanPham } from '@/store/modules/products/chiTietSanPham';

export default defineComponent({
  name: 'ProductImages',
  components: {
    FilterTableSection,
    NotificationModal,
    ToastNotification,
  },
  props: {
    productData: {
      type: Object,
      required: true,
    },
    productVariants: {
      type: Array,
      required: true,
    },
    variantImeis: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const colorImages = ref({});
    const isSubmitting = ref(false);
    const isModalVisible = ref(false); // New ref to control modal visibility
    const notificationType = ref('');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(null);
    const notificationOnCancel = ref(null);
    const showImageSection = ref(true);
    const mauSacOptions = ref([]);

    const uniqueColors = computed(() => {
      const colorIds = [...new Set(props.productVariants.map((variant) => variant.idMauSac))];
      return colorIds.map((colorId) => ({
        colorId,
        colorName: mauSacOptions.value.find((mau) => mau.id === colorId)?.mauSac || 'N/A',
      }));
    });

    // Fetch màu sắc từ API
    const fetchMauSac = async () => {
      try {
        const response = await getMauSac();
        mauSacOptions.value = response.data;
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách màu sắc: ' + error.message,
          duration: 3000,
        });
      }
    };

    fetchMauSac();

    const handleColorImageUpload = (event, colorId) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          colorImages.value[colorId] = {
            file,
            previewUrl: e.target.result,
          };
          toastNotification.value?.addToast({
            type: 'success',
            message: `Tải ảnh cho màu ${mauSacOptions.value.find((mau) => mau.id === colorId)?.mauSac} thành công!`,
            duration: 3000,
          });
        };
        reader.readAsDataURL(file);
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
  if (!props.productData.tenSanPham) {
    return { valid: false, message: 'Vui lòng nhập tên sản phẩm!' };
  }
  if (!props.productData.idNhaSanXuat) {
    return { valid: false, message: 'Vui lòng chọn nhà sản xuất!' };
  }
  if (!props.productData.idPin) {
    return { valid: false, message: 'Vui lòng chọn pin!' };
  }
  if (!props.productData.congNgheManHinh) {
    return { valid: false, message: 'Vui lòng chọn công nghệ màn hình!' };
  }
  if (!props.productData.idCpu) {
    return { valid: false, message: 'Vui lòng chọn CPU!' };
  }
  if (!props.productData.idGpu) {
    return { valid: false, message: 'Vui lòng chọn GPU!' };
  }
  if (!props.productData.idCumCamera) {
    return { valid: false, message: 'Vui lòng chọn cụm camera!' };
  }
  if (!props.productData.idHeDieuHanh) {
    return { valid: false, message: 'Vui lòng chọn hệ điều hành!' };
  }
  if (!props.productData.idThietKe) {
    return { valid: false, message: 'Vui lòng chọn thiết kế!' };
  }
  if (!props.productData.idSim) {
    return { valid: false, message: 'Vui lòng chọn SIM!' };
  }
  if (!props.productData.hoTroCongNgheSac) {
    return { valid: false, message: 'Vui lòng chọn công nghệ sạc!' };
  }
  if (!props.productData.idCongNgheMang) {
    return { valid: false, message: 'Vui lòng chọn công nghệ mạng!' };
  }
  if (props.productVariants.length === 0) {
    return { valid: false, message: 'Vui lòng thêm ít nhất một phiên bản sản phẩm!' };
  }
  for (const variant of props.productVariants) {
    if (!variant.idMauSac) {
      return { valid: false, message: 'Vui lòng chọn màu sắc cho phiên bản!' };
    }
    if (!variant.idRam) {
      return { valid: false, message: 'Vui lòng chọn RAM cho phiên bản!' };
    }
    if (!variant.idBoNhoTrong) {
      return { valid: false, message: 'Vui lòng chọn bộ nhớ trong cho phiên bản!' };
    }
    if (!variant.donGia || isNaN(parseFloat(variant.donGia))) {
      return { valid: false, message: 'Vui lòng nhập đơn giá hợp lệ cho tất cả phiên bản!' };
    }
  }
  const missingImages = uniqueColors.value.filter((color) => !colorImages.value[color.colorId]);
  if (missingImages.length > 0) {
    return {
      valid: false,
      message: `Vui lòng tải ảnh cho màu: ${missingImages.map((c) => c.colorName).join(', ')}!`,
    };
  }
  return { valid: true };
};

    const handleSubmit = () => {
      const validation = validateForm();
      if (!validation.valid) {
        toastNotification.value?.addToast({
          type: 'error',
          message: validation.message,
          duration: 3000,
        });
        return;
      }

      notificationType.value = 'confirm';
      notificationMessage.value = 'Bạn có chắc chắn muốn thêm sản phẩm này?';
      notificationOnConfirm.value = submitProduct;
      notificationOnCancel.value = resetNotification;
      isNotificationLoading.value = false;
      isModalVisible.value = true; // Show modal
    };

    const submitProduct = async () => {
  isSubmitting.value = true;
  isNotificationLoading.value = true;
  notificationMessage.value = 'Đang thêm sản phẩm...';

  try {
    // Tạo productPayload khớp với ChiTietSanPhamRequest
    const productPayload = {
      tenSanPham: props.productData.tenSanPham,
      idNhaSanXuat: props.productData.idNhaSanXuat,
      idPin: props.productData.idPin,
      congNgheManHinh: props.productData.congNgheManHinh,
      idHoTroBoNhoNgoai: props.productData.idHoTroBoNhoNgoai,
      idCpu: props.productData.idCpu,
      idGpu: props.productData.idGpu,
      idCumCamera: props.productData.idCumCamera,
      idHeDieuHanh: props.productData.idHeDieuHanh,
      idChiSoKhangBuiVaNuoc: props.productData.idChiSoKhangBuiVaNuoc,
      idThietKe: props.productData.idThietKe,
      idSim: props.productData.idSim,
      hoTroCongNgheSac: props.productData.hoTroCongNgheSac,
      idCongNgheMang: props.productData.idCongNgheMang,
      giaBan: props.productData.giaBan ? parseFloat(props.productData.giaBan) : null,
      ghiChu: props.productData.ghiChu,
      variants: props.productVariants.map((variant, index) => ({
        idMauSac: variant.idMauSac,
        idRam: variant.idRam,
        idBoNhoTrong: variant.idBoNhoTrong,
        donGia: parseFloat(variant.donGia),
        imageIndex: index, // Gán imageIndex theo thứ tự
        imeiList: props.variantImeis[index] || []
      }))
    };

    // Tạo images từ colorImages
    const images = Object.values(colorImages.value).map((imageData, index) => ({
      file: imageData.file,
      imageIndex: index // Thêm imageIndex nếu cần
    }));

    // Log để debug
    console.log('Gửi API addChiTietSanPham với payload:', JSON.stringify(productPayload, null, 2));
    console.log('Images gửi đi:', images.map(img => ({ fileName: img.file?.name, imageIndex: img.imageIndex })));

    const response = await addChiTietSanPham(productPayload, images);
    console.log('Phản hồi từ API:', response.data);

    notificationType.value = 'success';
    notificationMessage.value = 'Thêm sản phẩm thành công!';
    notificationOnConfirm.value = () => {
      resetForm();
      isModalVisible.value = false;
    };
    notificationOnCancel.value = null;
    isNotificationLoading.value = false;

    emit('product-submitted', productPayload);
  } catch (error) {
    console.error('Lỗi khi gọi API addChiTietSanPham:', error);
    console.error('Chi tiết lỗi:', error.response?.data || error.message);

    notificationType.value = 'error';
    notificationMessage.value = 'Có lỗi xảy ra khi thêm sản phẩm: ' + (error.response?.data?.message || error.message);
    notificationOnConfirm.value = resetNotification;
    notificationOnCancel.value = null;
    isNotificationLoading.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

    const resetForm = () => {
  console.log('Bắt đầu resetForm');
  notificationType.value = 'confirm';
  notificationMessage.value = 'Bạn có chắc chắn muốn làm mới biểu mẫu? Tất cả dữ liệu sẽ bị xóa.';
  notificationOnConfirm.value = () => {
    console.log('Xác nhận làm mới form');
    emit('reset-form');
    colorImages.value = {};
    isModalVisible.value = false;
    toastNotification.value?.addToast({
      type: 'success',
      message: 'Đã làm mới biểu mẫu!',
      duration: 3000,
    });
    console.log('Đã phát sự kiện reset-form');
  };
  notificationOnCancel.value = resetNotification;
  isNotificationLoading.value = false;
  isModalVisible.value = true;
};

    const resetNotification = () => {
      notificationType.value = '';
      notificationMessage.value = '';
      notificationOnConfirm.value = null;
      notificationOnCancel.value = null;
      isNotificationLoading.value = false;
      isModalVisible.value = false; // Hide modal
    };

    return {
      toastNotification,
      colorImages,
      uniqueColors,
      isSubmitting,
      showImageSection,
      isModalVisible, // Return new ref
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      handleColorImageUpload,
      handleSubmit,
      resetForm,
      resetNotification,
      mauSacOptions,
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

.modal-header {
  border-bottom: 1px solid rgba(52, 211, 153, 0.2);
}

.modal-title {
  font-weight: 600;
  color: #1f3a44;
}

.modal-footer {
  border-top: 1px solid rgba(52, 211, 153, 0.2);
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