import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

export default defineComponent({
  name: 'AddChiTietSanPham',
  components: {
    HeaderCard,
    FilterTableSection,
    NotificationModal,
    ToastNotification,
  },
  setup() {
    const route = useRoute();
    const toastNotification = ref(null);
    const notificationModal = ref(null);
    const isSubmitting = ref(false);
    const isLoading = ref(true);

    // Product Data
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

    // Options for dropdowns
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
    const ramOptions = ref([]);
    const boNhoTrongOptions = ref([]);
    const mauSacOptions = ref([]);
    const productNameOptions = ref([]);
    const filteredProductNameOptions = ref([]);
    const showProductDropdown = ref(false);
    const isProductSelected = ref(false);

    // Variants and Images
    const productVariants = ref([]);
    const currentVariant = ref({
      selectedRams: [],
      selectedBoNhoTrongs: [],
      selectedMauSacs: [],
    });
    const selectedVariants = ref([]);
    const allSelected = ref({});
    const groupCommonValues = ref({});
    const variantImeis = ref({});
    const mainImages = ref([]);
    const colorImages = ref({});
    const showImageSection = ref(false);

    // Modals and Dropdowns
    const showFormModal = ref(false);
    const currentAttribute = ref('');
    const showColorModal = ref(false);
    const showImeiModal = ref(false);
    const currentVariantIndex = ref(null);
    const imeiInput = ref('');
    const dropdownOpen = ref({
      ram: false,
      boNhoTrong: false,
    });

    // Notification
    const notificationType = ref('confirm');
    const notificationMessage = ref('');
    const isNotificationLoading = ref(false);
    const notificationOnConfirm = ref(() => {});
    const notificationOnCancel = ref(() => {});
    const entityData = ref({});

    // Computed properties
    const groupVariantsByRamAndRom = computed(() => {
      const groups = [];
      const grouped = {};

      productVariants.value.forEach((variant, index) => {
        const ram = ramOptions.value.find((r) => r.id === variant.idRam)?.dungLuong || 'Unknown';
        const rom = boNhoTrongOptions.value.find((b) => b.id === variant.idBoNhoTrong)?.dungLuong || 'Unknown';
        const groupKey = `${ram}/${rom}`;

        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            ram,
            rom,
            groupKey,
            variants: [],
            startIndex: index,
          };
          groups.push(grouped[groupKey]);
        }
        grouped[groupKey].variants.push(variant);
      });

      return groups;
    });

    const uniqueColors = computed(() => {
      const colorSet = new Set();
      const unique = [];

      productVariants.value.forEach((variant) => {
        if (!colorSet.has(variant.idMauSac)) {
          colorSet.add(variant.idMauSac);
          const colorName = mauSacOptions.value.find((mau) => mau.id === variant.idMauSac)?.tenMau || 'Unknown';
          unique.push({ colorId: variant.idMauSac, colorName });
        }
      });

      return unique;
    });

    const filteredImeiList = computed(() => {
      return imeiInput.value
        .split('\n')
        .map((imei) => imei.trim())
        .filter((imei) => imei.length > 0);
    });

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
        ram: 'RAM',
        boNhoTrong: 'Bộ Nhớ Trong',
        mauSac: 'Màu Sắc',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

    // Methods
    const fetchOptions = async () => {
      try {
        const endpoints = {
          heDieuHanh: '/he-dieu-hanh',
          congNgheManHinh: '/cong-nghe-man-hinh',
          nhaSanXuat: '/nha-san-xuat',
          cumCamera: '/cum-camera',
          sim: '/sim',
          thietKe: '/thiet-ke',
          pin: '/pin',
          cpu: '/cpu',
          gpu: '/gpu',
          congNgheMang: '/cong-nghe-mang',
          hoTroCongNgheSac: '/ho-tro-cong-nghe-sac',
          chiSoKhangBuiVaNuoc: '/chi-so-khang-bui-nuoc',
          ram: '/ram',
          boNhoTrong: '/bo-nho-trong',
          mauSac: '/mau-sac',
        };

        const promises = Object.keys(endpoints).map(async (key) => {
          const response = await axios.get(`http://localhost:8080${endpoints[key]}`);
          const data = response.data.content || response.data;
          switch (key) {
            case 'heDieuHanh':
              heDieuHanhOptions.value = data;
              break;
            case 'congNgheManHinh':
              congNgheManHinhOptions.value = data;
              break;
            case 'nhaSanXuat':
              nhaSanXuatOptions.value = data;
              break;
            case 'cumCamera':
              cumCameraOptions.value = data;
              break;
            case 'sim':
              simOptions.value = data;
              break;
            case 'thietKe':
              thietKeOptions.value = data;
              break;
            case 'pin':
              pinOptions.value = data;
              break;
            case 'cpu':
              cpuOptions.value = data;
              break;
            case 'gpu':
              gpuOptions.value = data;
              break;
            case 'congNgheMang':
              congNgheMangOptions.value = data;
              break;
            case 'hoTroCongNgheSac':
              hoTroCongNgheSacOptions.value = data;
              break;
            case 'chiSoKhangBuiVaNuoc':
              chiSoKhangBuiVaNuocOptions.value = data;
              break;
            case 'ram':
              ramOptions.value = data;
              break;
            case 'boNhoTrong':
              boNhoTrongOptions.value = data;
              break;
            case 'mauSac':
              mauSacOptions.value = data;
              break;
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tùy chọn:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải dữ liệu tùy chọn!',
          duration: 3000,
        });
      }
    };

    const fetchProductNames = async () => {
      try {
        let allProducts = [];
        let page = 0;
        let hasMore = true;
        const pageSize = 100;

        while (hasMore) {
          const response = await axios.get('http://localhost:8080/san-pham', {
            params: {
              page: page,
              size: pageSize,
            },
          });

          const data = response.data;
          if (data.content && data.content.length > 0) {
            allProducts = [...allProducts, ...data.content];
            page += 1;
            hasMore = data.content.length === pageSize && (!data.totalPages || page < data.totalPages);
          } else {
            hasMore = false;
          }
        }

        productNameOptions.value = allProducts;
        filteredProductNameOptions.value = allProducts;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải danh sách sản phẩm!',
          duration: 3000,
        });
      }
    };

    const filterProducts = () => {
      const searchTerm = productData.value.tenSanPham.toLowerCase().trim();
      if (searchTerm) {
        filteredProductNameOptions.value = productNameOptions.value.filter((product) =>
          product.tenSanPham.toLowerCase().includes(searchTerm)
        );
      } else {
        filteredProductNameOptions.value = productNameOptions.value;
      }
      isProductSelected.value = false;
    };

    const selectProduct = async (product) => {
      productData.value.tenSanPham = product.tenSanPham;
      showProductDropdown.value = false;
      isProductSelected.value = true;

      try {
        const response = await axios.get(`http://localhost:8080/san-pham/${product.id}`);
        const productDetails = response.data;

        productData.value = {
          ...productData.value,
          idHeDieuHanh: productDetails.idHeDieuHanh || '',
          congNgheManHinh: productDetails.congNgheManHinh || '',
          idNhaSanXuat: productDetails.idNhaSanXuat || '',
          idCumCamera: productDetails.idCumCamera || '',
          idSim: productDetails.idSim || '',
          idThietKe: productDetails.idThietKe || '',
          idPin: productDetails.idPin || '',
          idCpu: productDetails.idCpu || '',
          idGpu: productDetails.idGpu || '',
          idCongNgheMang: productDetails.idCongNgheMang || '',
          hoTroCongNgheSac: productDetails.hoTroCongNgheSac || '',
          idChiSoKhangBuiVaNuoc: productDetails.idChiSoKhangBuiVaNuoc || '',
        };

        toastNotification.value?.addToast({
          type: 'success',
          message: 'Đã tải thông tin sản phẩm!',
          duration: 3000,
        });
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải chi tiết sản phẩm!',
          duration: 3000,
        });
      }
    };

    const delayHideProductDropdown = () => {
      setTimeout(() => {
        showProductDropdown.value = false;
      }, 200);
    };

    const toggleDropdown = (type) => {
      dropdownOpen.value[type] = !dropdownOpen.value[type];
      Object.keys(dropdownOpen.value).forEach((key) => {
        if (key !== type) {
          dropdownOpen.value[key] = false;
        }
      });
    };

    const addVariant = () => {
      if (
        currentVariant.value.selectedRams.length === 0 ||
        currentVariant.value.selectedBoNhoTrongs.length === 0 ||
        currentVariant.value.selectedMauSacs.length === 0
      ) {
        return false;
      }

      const newVariants = [];
      currentVariant.value.selectedRams.forEach((ramId) => {
        currentVariant.value.selectedBoNhoTrongs.forEach((boNhoId) => {
          currentVariant.value.selectedMauSacs.forEach((mauSacId) => {
            const exists = productVariants.value.some(
              (variant) =>
                variant.idRam === ramId &&
                variant.idBoNhoTrong === boNhoId &&
                variant.idMauSac === mauSacId
            );
            if (!exists) {
              newVariants.push({
                idRam: ramId,
                idBoNhoTrong: boNhoId,
                idMauSac: mauSacId,
                donGia: '',
              });
            }
          });
        });
      });

      productVariants.value = [...productVariants.value, ...newVariants];
      return true;
    };

    const removeVariant = (index) => {
      productVariants.value.splice(index, 1);
      if (variantImeis.value[index]) {
        delete variantImeis.value[index];
      }
      selectedVariants.value = selectedVariants.value.filter((i) => i !== index);
      validateSelections();
    };

    const removeMultipleVariants = () => {
      productVariants.value = productVariants.value.filter(
        (_, index) => !selectedVariants.value.includes(index)
      );
      selectedVariants.value.forEach((index) => {
        if (variantImeis.value[index]) {
          delete variantImeis.value[index];
        }
      });
      selectedVariants.value = [];
      validateSelections();
    };

    const updateSelectedVariants = (group) => {
      const groupKey = group.groupKey;
      const price = groupCommonValues.value[groupKey]?.price || '';
      if (price) {
        group.variants.forEach((variant, index) => {
          productVariants.value[group.startIndex + index].donGia = price;
        });
      }
    };

    const toggleGroupSelection = (group, checked) => {
      const groupKey = group.groupKey;
      allSelected.value[groupKey] = checked;
      const groupIndices = group.variants.map((_, index) => group.startIndex + index);
      if (checked) {
        selectedVariants.value = [
          ...new Set([...selectedVariants.value, ...groupIndices]),
        ];
      } else {
        selectedVariants.value = selectedVariants.value.filter(
          (index) => !groupIndices.includes(index)
        );
      }
    };

    const updateSelectedCount = (group) => {
      const groupKey = group.groupKey;
      const groupIndices = group.variants.map((_, index) => group.startIndex + index);
      allSelected.value[groupKey] = groupIndices.every((index) =>
        selectedVariants.value.includes(index)
      );
    };

    const validateSelections = () => {
      groupVariantsByRamAndRom.value.forEach((group) => {
        const groupKey = `${group.ram}/${group.rom}`;
        if (!(groupKey in allSelected.value)) {
          allSelected.value[groupKey] = false;
          groupCommonValues.value[groupKey] = { price: '' };
        }
      });
    };

    const getColorFromName = (name) => {
      const colorMap = {
        Đen: '#000000',
        Trắng: '#FFFFFF',
        Xanh: '#00FF00',
        Đỏ: '#FF0000',
        Vàng: '#FFFF00',
        Xám: '#808080',
      };
      return colorMap[name] || '#FFFFFF';
    };

    const handleMainImageUpload = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        mainImages.value.push({ file, previewUrl });
      }
    };

    const handleColorImageUpload = (event, colorId) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        colorImages.value[colorId] = { file, previewUrl };
      }
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

    const openColorModal = () => {
      showColorModal.value = true;
    };

    const closeColorModal = () => {
      showColorModal.value = false;
    };

    const openImeiModal = (index) => {
      currentVariantIndex.value = index;
      imeiInput.value = variantImeis.value[index]?.join('\n') || '';
      showImeiModal.value = true;
    };

    const closeImeiModal = () => {
      showImeiModal.value = false;
      currentVariantIndex.value = null;
      imeiInput.value = '';
    };

    const saveImei = () => {
      const imeis = imeiInput.value
        .split('\n')
        .map((imei) => imei.trim())
        .filter((imei) => imei.length === 15);
      if (imeis.length > 0) {
        variantImeis.value[currentVariantIndex.value] = imeis;
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Lưu IMEI thành công!',
          duration: 2000,
        });
      } else {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng nhập ít nhất một IMEI hợp lệ (15 chữ số)!',
          duration: 3000,
        });
      }
      closeImeiModal();
    };

    const handleExcelImport = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post('http://localhost:8080/import-imei', formData);
          const imeis = response.data;
          imeiInput.value = imeis.join('\n');
          toastNotification.value?.addToast({
            type: 'success',
            message: 'Nhập IMEI từ Excel thành công!',
            duration: 2000,
          });
        } catch (error) {
          console.error('Lỗi khi nhập IMEI từ Excel:', error);
          toastNotification.value?.addToast({
            type: 'error',
            message: 'Lỗi khi nhập IMEI từ Excel!',
            duration: 3000,
          });
        }
      }
    };

    const downloadImeiTemplate = () => {
      const link = document.createElement('a');
      link.href = '/templates/imei-template.xlsx';
      link.download = 'imei-template.xlsx';
      link.click();
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    const handleAddAttribute = async () => {
      try {
        const endpoints = {
          heDieuHanh: '/he-dieu-hanh',
          congNgheManHinh: '/cong-nghe-man-hinh',
          nhaSanXuat: '/nha-san-xuat',
          cumCamera: '/cum-camera',
          sim: '/sim',
          thietKe: '/thiet-ke',
          pin: '/pin',
          cpu: '/cpu',
          gpu: '/gpu',
          congNgheMang: '/cong-nghe-mang',
          hoTroCongNgheSac: '/ho-tro-cong-nghe-sac',
          chiSoKhangBuiVaNuoc: '/chi-so-khang-bui-nuoc',
          ram: '/ram',
          boNhoTrong: '/bo-nho-trong',
          mauSac: '/mau-sac',
        };

        const response = await axios.post(
          `http://localhost:8080${endpoints[currentAttribute.value]}`,
          entityData.value
        );
        const newItem = response.data;

        switch (currentAttribute.value) {
          case 'heDieuHanh':
            heDieuHanhOptions.value.push(newItem);
            productData.value.idHeDieuHanh = newItem.id;
            break;
          case 'congNgheManHinh':
            congNgheManHinhOptions.value.push(newItem);
            productData.value.congNgheManHinh = newItem.id;
            break;
          case 'nhaSanXuat':
            nhaSanXuatOptions.value.push(newItem);
            productData.value.idNhaSanXuat = newItem.id;
            break;
          case 'cumCamera':
            cumCameraOptions.value.push(newItem);
            productData.value.idCumCamera = newItem.id;
            break;
          case 'sim':
            simOptions.value.push(newItem);
            productData.value.idSim = newItem.id;
            break;
          case 'thietKe':
            thietKeOptions.value.push(newItem);
            productData.value.idThietKe = newItem.id;
            break;
          case 'pin':
            pinOptions.value.push(newItem);
            productData.value.idPin = newItem.id;
            break;
          case 'cpu':
            cpuOptions.value.push(newItem);
            productData.value.idCpu = newItem.id;
            break;
          case 'gpu':
            gpuOptions.value.push(newItem);
            productData.value.idGpu = newItem.id;
            break;
          case 'congNgheMang':
            congNgheMangOptions.value.push(newItem);
            productData.value.idCongNgheMang = newItem.id;
            break;
          case 'hoTroCongNgheSac':
            hoTroCongNgheSacOptions.value.push(newItem);
            productData.value.hoTroCongNgheSac = newItem.id;
            break;
          case 'chiSoKhangBuiVaNuoc':
            chiSoKhangBuiVaNuocOptions.value.push(newItem);
            productData.value.idChiSoKhangBuiVaNuoc = newItem.id;
            break;
          case 'ram':
            ramOptions.value.push(newItem);
            currentVariant.value.selectedRams.push(newItem.id);
            break;
          case 'boNhoTrong':
            boNhoTrongOptions.value.push(newItem);
            currentVariant.value.selectedBoNhoTrongs.push(newItem.id);
            break;
          case 'mauSac':
            mauSacOptions.value.push(newItem);
            currentVariant.value.selectedMauSacs.push(newItem.id);
            break;
        }

        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm thành công!',
          duration: 2000,
        });
        closeFormModal();
        validateSelections();
      } catch (error) {
        console.error('Lỗi khi thêm thuộc tính:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Có lỗi xảy ra: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
      }
    };

    const confirmColorSelection = () => {
      if (addVariant()) {
        showImageSection.value = true;
        closeColorModal();
        validateSelections();
      } else {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn ít nhất một RAM, một Bộ Nhớ Trong và một Màu Sắc!',
          duration: 3000,
        });
      }
    };

    const resetForm = () => {
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
      currentVariant.value = {
        selectedRams: [],
        selectedBoNhoTrongs: [],
        selectedMauSacs: [],
      };
      selectedVariants.value = [];
      allSelected.value = {};
      groupCommonValues.value = {};
      mainImages.value = [];
      colorImages.value = {};
      variantImeis.value = {};
      showImageSection.value = false;
      showFormModal.value = false;
      showColorModal.value = false;
      showImeiModal.value = false;
      isProductSelected.value = false;
      dropdownOpen.value = { ram: false, boNhoTrong: false };
      resetNotification();
    };

    const handleSubmit = async () => {
      if (isSubmitting.value) return;

      isSubmitting.value = true;
      try {
        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData.value));
        formData.append('productVariants', JSON.stringify(productVariants.value));
        formData.append('variantImeis', JSON.stringify(variantImeis.value));

        mainImages.value.forEach((image, index) => {
          formData.append(`mainImages[${index}]`, image.file);
        });

        Object.keys(colorImages.value).forEach((colorId, index) => {
          formData.append(`colorImages[${colorId}]`, colorImages.value[colorId].file);
        });

        await axios.post('http://localhost:8080/san-pham/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm mới sản phẩm thành công!',
          duration: 3000,
        });
        resetForm();
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi thêm sản phẩm: ' + (error.response?.data?.message || error.message),
          duration: 3000,
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    onMounted(async () => {
      try {
        await Promise.all([fetchOptions(), fetchProductNames()]);
      } finally {
        isLoading.value = false;
      }
    });

    watch(
      () => productData.value,
      (newValue) => {
        console.log('productData cập nhật:', newValue);
      },
      { deep: true }
    );

    return {
      toastNotification,
      notificationModal,
      productData,
      productVariants,
      currentVariant,
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
      ramOptions,
      boNhoTrongOptions,
      mauSacOptions,
      dropdownOpen,
      groupVariantsByRamAndRom,
      uniqueColors,
      selectedVariants,
      allSelected,
      groupCommonValues,
      showImageSection,
      mainImages,
      colorImages,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      showColorModal,
      showImeiModal,
      currentVariantIndex,
      imeiInput,
      variantImeis,
      productNameOptions,
      filteredProductNameOptions,
      showProductDropdown,
      filteredImeiList,
      isProductSelected,
      isSubmitting,
      isLoading,
      toggleDropdown,
      addVariant,
      removeVariant,
      removeMultipleVariants,
      updateSelectedVariants,
      toggleGroupSelection,
      updateSelectedCount,
      openAddModal,
      closeFormModal,
      openColorModal,
      closeColorModal,
      confirmColorSelection,
      openImeiModal,
      closeImeiModal,
      saveImei,
      handleExcelImport,
      handleMainImageUpload,
      handleColorImageUpload,
      handleSubmit,
      resetForm,
      getColorFromName,
      filterProducts,
      selectProduct,
      delayHideProductDropdown,
      downloadImeiTemplate,
      handleAddAttribute,
      entityData,
      notificationType,
      notificationMessage,
      isNotificationLoading,
      notificationOnConfirm,
      notificationOnCancel,
      resetNotification,
    };
  },
});