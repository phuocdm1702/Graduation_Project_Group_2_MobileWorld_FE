<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <div
      class="bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp"
      style="padding: 1rem"
    >
      <!-- QR Scanning Section -->
      <div
        v-if="isScanning"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div id="qr-reader" class="w-full h-72 mx-auto"></div>
          <button class="mt-4 btn btn-danger w-100" @click="isScanning = false">
            Dừng quét
          </button>
        </div>
      </div>

      <!-- Employee Image -->
      <div class="flex justify-center mb-6 animate__animated animate__zoomIn">
        <div class="employee-image-container relative">
          <div class="image-upload-wrapper">
            <div class="image-preview" @click="triggerFileInput">
              <img
                v-if="employeeImage"
                :src="employeeImage"
                alt="Ảnh nhân viên"
                class="employee-avatar"
              />
              <div v-else class="image-placeholder">
                <i class="bi bi-camera-fill upload-icon"></i>
                <span class="upload-text">Chọn ảnh</span>
                <span class="upload-subtext">JPG, PNG tối đa 5MB</span>
              </div>
            </div>

            <!-- Upload overlay -->
            <div class="upload-overlay" @click="triggerFileInput">
              <i class="bi bi-camera-fill"></i>
            </div>

            <!-- Remove button -->
            <button
              v-if="employeeImage"
              class="remove-image-btn"
              @click.stop="removeImage"
              title="Xóa ảnh"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            class="d-none"
            accept="image/*"
            @change="handleImageUpload"
          />
        </div>
      </div>

      <!-- Form Fields -->
      <div class="row g-4">
        <div class="col-md-6">
          <label class="filter-label"> Tên nhân viên </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập tên nhân viên"
            v-model="employee.tenNhanVien"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Số điện thoại </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập số điện thoại"
            v-model="employee.soDienThoai"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> CCCD </label>
          <div class="input-group">
            <input
              type="text"
              class="form-control search-input"
              placeholder="Nhập CCCD"
              v-model="employee.cccd"
            />
            <button
              class="btn btn-outline-action"
              title="Quét mã QR"
              @click="startScanning"
            >
              <i class="bi bi-qr-code"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Email </label>
          <input
            type="email"
            class="form-control search-input"
            placeholder="Nhập email"
            v-model="employee.email"
          />
        </div>

        <div class="col-md-4">
          <label class="filter-label">Tỉnh/Thành phố</label>
          <select
            class="form-control date-input"
            v-model="employee.thanhPho"
            @change="fetchDistricts"
          >
            <option value="" disabled>Chọn tỉnh/thành phố</option>
            <option
              v-for="province in provinces"
              :key="province.code"
              :value="province.name"
            >
              {{ province.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">Quận/Huyện</label>
          <select
            class="form-control date-input"
            v-model="employee.quan"
            @change="fetchWards"
          >
            <option value="" disabled>Chọn quận/huyện</option>
            <option
              v-for="district in districts"
              :key="district.code"
              :value="district.name"
            >
              {{ district.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="filter-label">Xã/Phường</label>
          <select class="form-control date-input" v-model="employee.phuong">
            <option value="" disabled>Chọn xã/phường</option>
            <option v-for="ward in wards" :key="ward.code" :value="ward.name">
              {{ ward.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label class="filter-label"> Địa chỉ cụ thể </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập địa chỉ cụ thể"
            v-model="employee.diaChiCuThe"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Ngày sinh </label>
          <input
            type="date"
            class="form-control date-input"
            v-model="employee.ngaySinh"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Giới tính </label>
          <div class="gender-options">
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nam"
                value="False"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nam"> Nam </label>
            </div>
            <div class="form-check custom-radio">
              <input
                class="form-check-input"
                type="radio"
                name="gioiTinh"
                id="nu"
                value="True"
                v-model="employee.gioiTinh"
              />
              <label class="form-check-label" for="nu"> Nữ </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-5">
        <button type="button" class="btn btn-reset" @click="goBack">Hủy</button>
        <button class="btn btn-action" @click="submitForm">
          {{ isEditMode ? "Cập Nhật" : "Thêm" }}
        </button>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import HeaderCard from "@/components/common/HeaderCard.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import { Html5Qrcode } from "html5-qrcode";
import {
  addNhanVien,
  getNhanVienDetail,
  UpdateNhanVien,
} from "../../store/modules/employees/nhanVien";
import axios from "axios";
export default {
  name: "NhanVienForm",
  components: {
    HeaderCard,
    ToastNotification,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const fileInput = ref(null);
    const isScanning = ref(false);
    const employeeImage = ref(null);
    const toastNotification = ref(null);
    // bien quet qr
    const html5QrCode = ref(null);

    const provinces = ref([]);
    const districts = ref([]);
    const wards = ref([]);

    const selectedProvinceCode = ref("");
    const selectedDistrictCode = ref("");

    //thanh pho
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        provinces.value = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
        toastNotification.value.addToast({
          type: "error",
          message: "Không thể tải danh sách tỉnh/thành phố!",
        });
      }
    };

    //quetmaqr
    const startQrScanner = () => {
      html5QrCode.value = new Html5Qrcode("qr-reader");
      html5QrCode.value
        .start(
          { facingMode: "environment" }, // Sử dụng camera sau
          {
            fps: 10, // Frames per second
            qrbox: { width: 500, height: 500 }, // Kích thước vùng quét
          },
          (decodedText, decodedResult) => {
            // Xử lý dữ liệu mã QR
            handleQrCodeResult(decodedText);
          },
        )
        .catch((err) => {
          console.error("Lỗi khởi động quét mã QR:", err);
          toastNotification.value.addToast({
            type: "error",
            message: "Không thể khởi động quét mã QR!",
          });
        });
    };

    // Dừng quét mã QR
    const stopQrScanner = () => {
      if (html5QrCode.value) {
        html5QrCode.value
          .stop()
          .then(() => {
            html5QrCode.value.clear();
            isScanning.value = false;
          })
          .catch((err) => {
            console.error("Lỗi dừng quét mã QR:", err);
          });
      }
    };

    // Xử lý dữ liệu từ mã QR
    const handleQrCodeResult = async (decodedText) => {
  try {
    console.log("Dữ liệu mã QR:", decodedText);
    const qrData = decodedText.split("|");
    if (qrData.length < 6) {
      throw new Error(
        `Dữ liệu mã QR không đủ trường: ${qrData.length} trường, yêu cầu tối thiểu 6 trường`
      );
    }

    const [cccd, , hoTen, ngaySinh, gioiTinh, diaChi] = qrData;

    if (!cccd || cccd.length !== 12 || isNaN(cccd)) {
      throw new Error("Số CCCD không hợp lệ (phải có 12 chữ số)");
    }
    if (!hoTen) {
      throw new Error("Họ tên không được để trống");
    }
    if (!diaChi) {
      throw new Error("Địa chỉ không được để trống");
    }

    employee.value.cccd = cccd;
    employee.value.tenNhanVien = hoTen;
    employee.value.ngaySinh = formatDate(ngaySinh);
    employee.value.gioiTinh = gioiTinh === "Nam" ? "False" : "True";

    const addressParts = parseAddress(diaChi);
    console.log("Địa chỉ phân tích:", addressParts);
    if (!addressParts.thanhPho) {
      console.error("Tỉnh/thành phố rỗng. Địa chỉ gốc:", diaChi);
      throw new Error("Không thể xác định tỉnh/thành phố từ địa chỉ");
    }

    // Chuẩn hóa và gán tỉnh/thành phố
    const normalizedThanhPho = normalizeName(addressParts.thanhPho);
    const matchedProvince = provinces.value.find(
      (p) => normalizeName(p.name) === normalizedThanhPho
    );
    employee.value.thanhPho = matchedProvince ? matchedProvince.name : addressParts.thanhPho;
    employee.value.diaChiCuThe = addressParts.diaChiCuThe;

    // Tải và gán quận/huyện
    await fetchDistricts();
    if (addressParts.quan) {
      const normalizedQuan = normalizeName(addressParts.quan);
      const matchedDistrict = districts.value.find(
        (d) => normalizeName(d.name) === normalizedQuan
      );
      if (matchedDistrict) {
        employee.value.quan = matchedDistrict.name;
      } else {
        console.warn(`Quận/Huyện "${addressParts.quan}" không tìm thấy trong danh sách`);
        employee.value.quan = addressParts.quan;
        toastNotification.value.addToast({
          type: "warning",
          message: `Quận/Huyện "${addressParts.quan}" không tìm thấy. Vui lòng kiểm tra và chọn lại.`,
        });
      }
    }

    // Tải và gán xã/phường
    await fetchWards();
    if (addressParts.phuong) {
      const normalizedPhuong = normalizeName(addressParts.phuong);
      const matchedWard = wards.value.find(
        (w) => normalizeName(w.name) === normalizedPhuong
      );
      if (matchedWard) {
        employee.value.phuong = matchedWard.name;
      } else {
        console.warn(`Xã/Phường "${addressParts.phuong}" không tìm thấy trong danh sách`);
        employee.value.phuong = addressParts.phuong;
        toastNotification.value.addToast({
          type: "warning",
          message: `Xã/Phường "${addressParts.phuong}" không tìm thấy. Vui lòng kiểm tra và chọn lại.`,
        });
      }
    }

    toastNotification.value.addToast({
      type: "success",
      message: "Quét mã QR thành công! Dữ liệu đã được điền vào form.",
    });

    stopQrScanner();
  } catch (error) {
    console.error("Lỗi quét mã QR:", error);
    toastNotification.value.addToast({
      type: "error",
      message: `Lỗi khi xử lý dữ liệu mã QR: ${error.message}`,
    });
  }
};

    // Hàm định dạng ngày sinh
    const formatDate = (dateString) => {
      try {
        if (!dateString || dateString.length !== 8 || isNaN(dateString)) {
          throw new Error("Ngày sinh không hợp lệ (yêu cầu DDMMYYYY)");
        }
        const day = dateString.slice(0, 2);
        const month = dateString.slice(2, 4);
        const year = dateString.slice(4, 8);
        const formattedDate = `${year}-${month}-${day}`;
        const date = new Date(formattedDate);
        if (isNaN(date.getTime())) {
          throw new Error("Ngày sinh không hợp lệ");
        }
        return formattedDate;
      } catch (error) {
        console.error("Lỗi định dạng ngày sinh:", error);
        toastNotification.value.addToast({
          type: "error",
          message: `Lỗi định dạng ngày sinh: ${error.message}`,
        });
        return "";
      }
    };

    // Hàm phân tích địa chỉ
    const parseAddress = (address) => {
      try {
        const normalizedAddress = address.replace(/\s+/g, " ").trim();
        const parts = normalizedAddress.split(/,\s*/);
        if (parts.length < 2) {
          throw new Error(
            `Địa chỉ không đủ trường: ${parts.length} trường, yêu cầu tối thiểu 2 trường (Quận/Huyện, Tỉnh/Thành phố)`
          );
        }
        return {
          diaChiCuThe: parts[0] || "",
          phuong: parts.length > 1 ? parts[1] : "",
          quan: parts.length > 2 ? parts[2] : "",
          thanhPho: parts.length > 3 ? parts[3] : parts[parts.length - 1],
        };
      } catch (error) {
        console.error("Lỗi phân tích địa chỉ:", error);
        toastNotification.value.addToast({
          type: "error",
          message: `Lỗi phân tích địa chỉ: ${error.message}`,
        });
        return {
          diaChiCuThe: address,
          phuong: "",
          quan: "",
          thanhPho: "",
        };
      }
    };

    // Hàm bắt đầu quét
    const startScanning = () => {
      isScanning.value = true;
      setTimeout(() => {
        startQrScanner();
      }, 100);
    };

    const normalizeName = (name) => {
      if (!name) return "";
      return name
        .replace(/^(Thị trấn|Quận|Phường|Xã|Huyện|Thành phố)\s+/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    //quan
    const fetchDistricts = async () => {
      districts.value = [];
      wards.value = [];
      employee.value.quan = "";
      employee.value.phuong = "";

      // Tìm mã tỉnh theo tên
      const selectedProvince = provinces.value.find(
        (p) => p.name === employee.value.thanhPho
      );
      if (selectedProvince) {
        selectedProvinceCode.value = selectedProvince.code;
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`
          );
          districts.value = response.data.districts;
        } catch (error) {
          console.error("Lỗi khi tải danh sách quận/huyện:", error);
          toastNotification.value.addToast({
            type: "error",
            message: "Không thể tải danh sách quận/huyện!",
          });
        }
      }
    };

    //xa
    const fetchWards = async () => {
      wards.value = [];
      employee.value.phuong = "";

      // Tìm mã quận theo tên
      const selectedDistrict = districts.value.find(
        (d) => d.name === employee.value.quan
      );
      if (selectedDistrict) {
        selectedDistrictCode.value = selectedDistrict.code;
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
          );
          wards.value = response.data.wards;
        } catch (error) {
          console.error("Lỗi khi tải danh sách xã/phường:", error);
          toastNotification.value.addToast({
            type: "error",
            message: "Không thể tải danh sách xã/phường!",
          });
        }
      }
    };

    // Form Data
    const employee = ref({
      id: null,
      tenNhanVien: "",
      soDienThoai: "",
      cccd: "",
      email: "",
      diaChiCuThe: "",
      ngaySinh: "",
      gioiTinh: "",
      thanhPho: "",
      quan: "",
      phuong: "",
    });

    // Computed
    const isEditMode = computed(() => !!route.params.id);

    // Methods
    const loadEmployeeData = async () => {
      if (isEditMode.value) {
        try {
          const employeeId = parseInt(route.params.id);
          const result = await getNhanVienDetail(employeeId);

          if (result.success) {
            const employeeData = result.data;

            // Temporarily store address data
            const addressData = {
              thanhPho: employeeData.thanhPho || "",
              quan: employeeData.quan || "",
              phuong: employeeData.phuong || "",
            };

            // Update employee data except address fields
            employee.value = {
              id: employeeData.id,
              tenNhanVien: employeeData.tenNhanVien || "",
              soDienThoai: employeeData.idTaiKhoan?.soDienThoai || "",
              cccd: employeeData.cccd || "",
              email: employeeData.idTaiKhoan?.email || "",
              diaChiCuThe: employeeData.diaChiCuThe || "",
              ngaySinh: employeeData.ngaySinh
                ? employeeData.ngaySinh.substring(0, 10)
                : "",
              gioiTinh: employeeData.deleted ? "True" : "False",
              thanhPho: "",
              quan: "",
              phuong: "",
            };
            employeeImage.value = employeeData.imageUrl || null;

            // Set province and fetch districts
            if (addressData.thanhPho) {
              employee.value.thanhPho = addressData.thanhPho;
              await fetchDistricts();
              // Set district and fetch wards
              if (addressData.quan && districts.value.length > 0) {
                employee.value.quan = addressData.quan;
                await fetchWards();
                // Set ward
                if (addressData.phuong && wards.value.length > 0) {
                  employee.value.phuong = addressData.phuong;
                }
              }
            }
          } else {
            toastNotification.value.addToast({
              type: "error",
              message: result.message || "Lỗi khi tải dữ liệu nhân viên!",
            });
          }
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu nhân viên:", error);
          toastNotification.value.addToast({
            type: "error",
            message: "Lỗi khi tải dữ liệu nhân viên!",
          });
        }
      }
    };

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toastNotification.value.addToast({
            type: "error",
            message: "Kích thước file không được vượt quá 5MB",
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toastNotification.value.addToast({
            type: "error",
            message: "Vui lòng chọn file hình ảnh",
          });
          return;
        }

        employeeImage.value = URL.createObjectURL(file);
      }
    };

    const removeImage = () => {
      employeeImage.value = null;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    const submitForm = async () => {
      // Kiểm tra dữ liệu form
      if (!employee.value.tenNhanVien || !employee.value.tenNhanVien.trim()) {
        toastNotification.value.addToast({
          type: "error",
          message: "Vui lòng nhập tên nhân viên!",
        });
        return;
      }
      if (!employee.value.soDienThoai || !employee.value.soDienThoai.trim()) {
        toastNotification.value.addToast({
          type: "error",
          message: "Vui lòng nhập số điện thoại!",
        });
        return;
      }
      if (!employee.value.cccd || !employee.value.cccd.trim()) {
        toastNotification.value.addToast({
          type: "error",
          message: "Vui lòng nhập CCCD!",
        });
        return;
      }

      // Chuẩn bị dữ liệu
      const file = fileInput.value?.files[0]; // Lấy file ảnh từ input
      const dataNhanVien = {
        ...employee.value,
        gioiTinh: employee.value.gioiTinh === "True",
      };

      let result;

      if (isEditMode.value) {
        // Cập nhật nhân viên
        try {
          result = await UpdateNhanVien(employee.value.id, dataNhanVien, file);
          if (result.success) {
            toastNotification.value.addToast({
              type: "success",
              message: "Cập nhật nhân viên thành công!",
            });
          } else {
            toastNotification.value.addToast({
              type: "error",
              message: result.message || "Lỗi khi cập nhật nhân viên!",
            });
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật nhân viên:", error);
          toastNotification.value.addToast({
            type: "error",
            message: "Lỗi khi cập nhật nhân viên!",
          });
        }
      } else {
        // Thêm nhân viên mới
        result = await addNhanVien(employee.value, file);
        if (result.success) {
          toastNotification.value.addToast({
            type: "success",
            message: "Thêm nhân viên thành công!",
          });
          setTimeout(() => {
            resetForm();
            goBack();
          }, 1500);
        } else {
          toastNotification.value.addToast({
            type: "error",
            message: result.message || "Lỗi khi thêm nhân viên!",
          });
        }
      }
    };

    const resetForm = () => {
      employee.value = {
        id: null,
        tenNhanVien: "",
        soDienThoai: "",
        cccd: "",
        email: "",
        diaChiCuThe: "",
        ngaySinh: "",
        gioiTinh: "",
        thanhPho: "",
        quan: "",
        phuong: "",
      };
      employeeImage.value = null;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    const goBack = () => {
      router.push("/nhanVien");
    };

    // Lifecycle
    onMounted(async () => {
      await fetchProvinces();
      await loadEmployeeData();
    });

    return {
      fileInput,
      isScanning,
      employeeImage,
      employee,
      toastNotification,
      isEditMode,
      triggerFileInput,
      handleImageUpload,
      removeImage,
      submitForm,
      goBack,
      provinces, // Thêm để template truy cập
      districts, // Thêm để template truy cập
      wards, // Thêm để template truy cập
      fetchDistricts, // Thêm để template truy cập
      fetchWards, // Thêm để template truy cập
      startScanning,
    };
  },
};
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

/* Image Upload Styles */
.employee-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-upload-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 12px;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
  position: relative;
}

.image-preview:hover {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  transform: scale(1.02);
}

.employee-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview:hover .employee-avatar {
  transform: scale(1.1);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  padding: 30px;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: #94a3b8;
}

.upload-text {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
  display: block;
}

.upload-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(52, 211, 153, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.upload-overlay i {
  font-size: 2rem;
  color: white;
}

.image-preview:hover .upload-overlay {
  opacity: 1;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Form Styles */
.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.search-input,
.date-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
}

.search-input:focus,
.date-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  outline: none;
}

.input-group .search-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.btn-outline-action {
  border: 2px solid #34d399;
  color: #34d399;
  background: white;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.btn-outline-action:hover {
  background: #34d399;
  color: white;
  transform: translateY(-1px);
}

/* Gender Options */
.gender-options {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.custom-radio {
  position: relative;
}

.custom-radio .form-check-input {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.custom-radio .form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.custom-radio .form-check-input:hover {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

.custom-radio .form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-reset {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset:hover {
  background: #4b5563;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
}

.btn-action {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-action:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(52, 211, 153, 0.4);
}

.btn-action:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .gender-options {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .image-upload-wrapper {
    width: 120px;
    height: 120px;
  }
}
</style>
