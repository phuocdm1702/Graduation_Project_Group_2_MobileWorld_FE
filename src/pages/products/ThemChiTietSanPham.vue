<template>
  <div class="container-fluid p-4">
    <ProductInfo
      :product-data.sync="productData"
      @update:product-data="updateProductData"
    />
    <ProductVariants
      :product-data="productData"
      @variants-updated="handleVariantsUpdated"
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
import { defineComponent, ref } from 'vue';
import ProductInfo from './themChiTietSanPham/ThongTinSanPham.vue';
import ProductVariants from './themChiTietSanPham/ThemPhienBan.vue';
import ProductImages from './themChiTietSanPham/ThemAnhSanPham.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

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
    const productVariants = ref([]);
    const variantImeis = ref({});
    const mauSacOptions = ref([
      { id: 'ms1', tenMau: 'Đen Phantôm' },
      { id: 'ms2', tenMau: 'Trắng Ngọc Trai' },
      { id: 'ms3', tenMau: 'Xanh Thiên Hà' },
    ]);

    const updateProductData = (newData) => {
      productData.value = { ...newData };
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Thông tin sản phẩm đã được cập nhật!',
        duration: 3000,
      });
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
      };
      productVariants.value = [];
      variantImeis.value = {};
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Biểu mẫu đã được làm mới!',
        duration: 3000,
      });
    };

    const handleVariantsUpdated = (variants) => {
      productVariants.value = variants;
      toastNotification.value?.addToast({
        type: 'info',
        message: 'Danh sách biến thể đã được cập nhật!',
        duration: 3000,
      });
    };

    return {
      toastNotification,
      productData,
      productVariants,
      variantImeis,
      mauSacOptions,
      updateProductData,
      handleProductSubmitted,
      handleResetForm,
      handleVariantsUpdated,
    };
  },
});
</script>

<style scoped>
.container-fluid {
  padding: 0;
}
</style>