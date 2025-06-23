<template>
  <div class="container-fluid p-4">
    <ProductInfo
      :product-data="productData"
      @update:product-data="updateProductData"
      @reset-form="handleResetForm"
    />
    <ProductVariants
      :product-data="productData"
      :product-variants="productVariants"
      :variant-imeis="variantImeis"
      @variants-updated="handleVariantsUpdated"
      @reset-form="handleResetForm"
    />
    <ProductImages
      :product-data="productData"
      :product-variants="productVariants"
      :variant-imeis="variantImeis"
      :mau-sac-options="mauSacOptions"
      @product-submitted="handleProductSubmitted"
      @reset-form="handleResetForm"
    />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import ProductInfo from './themChiTietSanPham/ThongTinSanPham.vue';
import ProductVariants from './themChiTietSanPham/ThemPhienBan.vue';
import ProductImages from './themChiTietSanPham/ThemAnhSanPham.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import { getMauSac } from '@/store/modules/products/chiTietSanPham';

export default defineComponent({
  name: 'ProductDetails',
  components: {
    ProductInfo,
    ProductVariants,
    ProductImages,
    ToastNotification,
  },
  setup() {
    const toastNotification = ref(null);
    const productData = ref({
      tenSanPham: '',
      idHeDieuHanh: '',
      idCongNgheManHinh: '',
      idNhaSanXuat: '',
      idCumCamera: '',
      idSim: '',
      idThietKe: '',
      idPin: '',
      idCpu: '',
      idGpu: '',
      idCongNgheMang: '',
      idHoTroCongNgheSac: '',
      idChiSoKhangBuiVaNuoc: '',
      idHoTroBoNhoNgoai: '',
      ghiChu: '',
    });
    const productVariants = ref([]);
    const variantImeis = ref({});
    const mauSacOptions = ref([]);

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

    const updateProductData = (newData) => {
      productData.value = { ...newData };
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Thông tin sản phẩm đã được cập nhật!',
        duration: 3000,
      });
      console.log('Updated productData:', productData.value);
    };

    const handleVariantsUpdated = ({ variants, imeis }) => {
      productVariants.value = variants;
      variantImeis.value = imeis;
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Danh sách biến thể đã được cập nhật!',
        duration: 3000,
      });
      console.log('Updated productVariants:', productVariants.value);
      console.log('Updated variantImeis:', variantImeis.value);
    };

    const handleProductSubmitted = (payload) => {
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Sản phẩm đã được thêm thành công!',
        duration: 3000,
      });
      console.log('Final product payload:', payload);
      handleResetForm();
    };

    const handleResetForm = () => {
      productData.value = {
        tenSanPham: '',
        idHeDieuHanh: '',
        idCongNgheManHinh: '',
        idNhaSanXuat: '',
        idCumCamera: '',
        idSim: '',
        idThietKe: '',
        idPin: '',
        idCpu: '',
        idGpu: '',
        idCongNgheMang: '',
        idHoTroCongNgheSac: '',
        idChiSoKhangBuiVaNuoc: '',
        idHoTroBoNhoNgoai: '',
        ghiChu: '',
      };
      productVariants.value = [];
      variantImeis.value = {};
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Biểu mẫu đã được làm mới!',
        duration: 3000,
      });
      console.log('Form reset - productData:', productData.value);
      console.log('Form reset - productVariants:', productVariants.value);
      console.log('Form reset - variantImeis:', variantImeis.value);
    };

    return {
      toastNotification,
      productData,
      productVariants,
      variantImeis,
      mauSacOptions,
      updateProductData,
      handleVariantsUpdated,
      handleProductSubmitted,
      handleResetForm,
    };
  },
});
</script>

<style scoped>
.container-fluid {
  padding: 0;
}
</style>