import { defineComponent, computed, onMounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

// Dữ liệu giả lập cho các tùy chọn
const mockData = {
  '/he-dieu-hanh': [
    { id: 'hdh1', tenHeDieuHanh: 'Android 14' },
    { id: 'hdh2', tenHeDieuHanh: 'iOS 17' },
    { id: 'hdh3', tenHeDieuHanh: 'HarmonyOS 4' },
  ],
  '/cong-nghe-man-hinh': [
    { id: 'cmh1', tenCongNghe: 'Dynamic AMOLED 2X' },
    { id: 'cmh2', tenCongNghe: 'Super Retina XDR' },
    { id: 'cmh3', tenCongNghe: 'LTPO OLED' },
  ],
  '/nha-san-xuat': [
    { id: 'nsx1', tenNhaSanXuat: 'Samsung' },
    { id: 'nsx2', tenNhaSanXuat: 'Apple' },
    { id: 'nsx3', tenNhaSanXuat: 'Huawei' },
  ],
  '/cum-camera': [
    { id: 'cc1', thongSo: '108MP + 12MP + 10MP' },
    { id: 'cc2', thongSo: '50MP + 48MP + 12MP' },
    { id: 'cc3', thongSo: '64MP + 8MP + 5MP' },
  ],
  '/sim': [
    { id: 'sim1', loaiSim: 'Nano SIM' },
    { id: 'sim2', loaiSim: 'eSIM' },
    { id: 'sim3', loaiSim: 'Dual SIM (Nano + eSIM)' },
  ],
  '/thiet-ke': [
    { id: 'tk1', loaiThietKe: 'Nguyên khối' },
    { id: 'tk2', loaiThietKe: 'Gập ngang' },
    { id: 'tk3', loaiThietKe: 'Gập dọc' },
  ],
  '/pin': [
    { id: 'pin1', dungLuong: '4500mAh' },
    { id: 'pin2', dungLuong: '5000mAh' },
    { id: 'pin3', dungLuong: '4300mAh' },
  ],
  '/cpu': [
    { id: 'cpu1', tenCpu: 'Snapdragon 8 Gen 3' },
    { id: 'cpu2', tenCpu: 'A17 Pro' },
    { id: 'cpu3', tenCpu: 'Kirin 9000s' },
  ],
  '/gpu': [
    { id: 'gpu1', tenGpu: 'Adreno 750' },
    { id: 'gpu2', tenGpu: 'Apple GPU (6-core)' },
    { id: 'gpu3', tenGpu: 'Maleoon 910' },
  ],
  '/cong-nghe-mang': [
    { id: 'cnm1', tenCongNghe: '5G SA/NSA' },
    { id: 'cnm2', tenCongNghe: '4G LTE' },
    { id: 'cnm3', tenCongNghe: '3G' },
  ],
  '/ho-tro-cong-nghe-sac': [
    { id: 'sac1', tenCongNghe: 'SuperVOOC 100W' },
    { id: 'sac2', tenCongNghe: 'MagSafe 15W' },
    { id: 'sac3', tenCongNghe: 'Fast Charge 66W' },
  ],
  '/chi-so-khang-bui-nuoc': [
    { id: 'kb1', chiSo: 'IP68' },
    { id: 'kb2', chiSo: 'IP67' },
    { id: 'kb3', chiSo: 'IP54' },
  ],
  '/ram': [
    { id: 'ram1', dungLuong: '8GB' },
    { id: 'ram2', dungLuong: '12GB' },
    { id: 'ram3', dungLuong: '16GB' },
  ],
  '/bo-nho-trong': [
    { id: 'bnt1', dungLuong: '128GB' },
    { id: 'bnt2', dungLuong: '256GB' },
    { id: 'bnt3', dungLuong: '512GB' },
  ],
  '/mau-sac': [
    { id: 'ms1', tenMau: 'Đen Phantôm' },
    { id: 'ms2', tenMau: 'Trắng Ngọc Trai' },
    { id: 'ms3', tenMau: 'Xanh Thiên Hà' },
  ],
};

// Giả lập danh sách sản phẩm
const mockProducts = {
  content: [
    {
      id: 'sp1',
      tenSanPham: 'Samsung Galaxy S24 Ultra',
      idHeDieuHanh: 'hdh1',
      congNgheManHinh: 'cmh1',
      idNhaSanXuat: 'nsx1',
      idCumCamera: 'cc1',
      idSim: 'sim3',
      idThietKe: 'tk1',
      idPin: 'pin2',
      idCpu: 'cpu1',
      idGpu: 'gpu1',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac3',
      idChiSoKhangBuiVaNuoc: 'kb1',
    },
    {
      id: 'sp2',
      tenSanPham: 'iPhone 15 Pro Max',
      idHeDieuHanh: 'hdh2',
      congNgheManHinh: 'cmh2',
      idNhaSanXuat: 'nsx2',
      idCumCamera: 'cc2',
      idSim: 'sim2',
      idThietKe: 'tk1',
      idPin: 'pin3',
      idCpu: 'cpu2',
      idGpu: 'gpu2',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac2',
      idChiSoKhangBuiVaNuoc: 'kb1',
    },
    {
      id: 'sp3',
      tenSanPham: 'Huawei P60 Pro',
      idHeDieuHanh: 'hdh3',
      congNgheManHinh: 'cmh3',
      idNhaSanXuat: 'nsx3',
      idCumCamera: 'cc3',
      idSim: 'sim1',
      idThietKe: 'tk1',
      idPin: 'pin1',
      idCpu: 'cpu3',
      idGpu: 'gpu3',
      idCongNgheMang: 'cnm1',
      hoTroCongNgheSac: 'sac1',
      idChiSoKhangBuiVaNuoc: 'kb2',
    },
  ],
};

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
    const isLoading = ref(false); // Bỏ loading vì dùng dữ liệu cứng

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

    // Options for dropdowns (gán dữ liệu cứng)
    const heDieuHanhOptions = ref(mockData['/he-dieu-hanh']);
    const congNgheManHinhOptions = ref(mockData['/cong-nghe-man-hinh']);
    const nhaSanXuatOptions = ref(mockData['/nha-san-xuat']);
    const cumCameraOptions = ref(mockData['/cum-camera']);
    const simOptions = ref(mockData['/sim']);
    const thietKeOptions = ref(mockData['/thiet-ke']);
    const pinOptions = ref(mockData['/pin']);
    const cpuOptions = ref(mockData['/cpu']);
    const gpuOptions = ref(mockData['/gpu']);
    const congNgheMangOptions = ref(mockData['/cong-nghe-mang']);
    const hoTroCongNgheSacOptions = ref(mockData['/ho-tro-cong-nghe-sac']);
    const chiSoKhangBuiVaNuocOptions = ref(mockData['/chi-so-khang-bui-nuoc']);
    const ramOptions = ref(mockData['/ram']);
    const boNhoTrongOptions = ref(mockData['/bo-nho-trong']);
    const mauSacOptions = ref(mockData['/mau-sac']);
    const productNameOptions = ref(mockProducts.content);
    const filteredProductNameOptions = ref(mockProducts.content);
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

    const selectProduct = (product) => {
      productData.value = {
        tenSanPham: product.tenSanPham,
        idHeDieuHanh: product.idHeDieuHanh || '',
        congNgheManHinh: product.congNgheManHinh || '',
        idNhaSanXuat: product.idNhaSanXuat || '',
        idCumCamera: product.idCumCamera || '',
        idSim: product.idSim || '',
        idThietKe: product.idThietKe || '',
        idPin: product.idPin || '',
        idCpu: product.idCpu || '',
        idGpu: product.idGpu || '',
        idCongNgheMang: product.idCongNgheMang || '',
        hoTroCongNgheSac: product.hoTroCongNgheSac || '',
        idChiSoKhangBuiVaNuoc: product.idChiSoKhangBuiVaNuoc || '',
      };
      showProductDropdown.value = false;
      isProductSelected.value = true;

      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã chọn sản phẩm!',
        duration: 3000,
      });
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
        'Đen Phantôm': '#1A2526',
        'Trắng Ngọc Trai': '#F5F6F5',
        'Xanh Thiên Hà': '#2C4F6E',
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
      imeiInput.value = variantImeis.value[currentVariantIndex.value]?.join('\n') || '';
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

    const downloadImeiTemplate = () => {
      const link = new Blob(['Mock IMEI template content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(link);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'imei-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const resetNotification = () => {
      notificationType.value = 'confirm';
      notificationMessage.value = '';
      isNotificationLoading.value = false;
      notificationOnConfirm.value = () => {};
      notificationOnCancel.value = () => {};
    };

    const confirmColorSelection = () => {
      // if (addVariant()) {
      //   showImageSection.value = true;
      //   closeColorModal();
      //   validateSelections();
      // } else {
      //   toastNotification.value?.addToast({
      //     type: 'error',
      //     message: 'Vui lòng chọn ít nhất một RAM, một Bộ Nhớ Trong và một Màu Sắc!',
      //     duration: 3000,
      //   });
      // }
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

    const handleSubmit = () => {
      if (isSubmitting.value) return;

      isSubmitting.value = true;
      setTimeout(() => {
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm mới sản phẩm thành công (giả lập)!',
          duration: 3000,
        });
        resetForm();
        isSubmitting.value = false;
      }, 1000);
    };

    onMounted(() => {
      // Không cần gọi API, dữ liệu đã được gán cứng
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
      handleMainImageUpload,
      handleColorImageUpload,
      handleSubmit,
      resetForm,
      getColorFromName,
      filterProducts,
      selectProduct,
      delayHideProductDropdown,
      downloadImeiTemplate,
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