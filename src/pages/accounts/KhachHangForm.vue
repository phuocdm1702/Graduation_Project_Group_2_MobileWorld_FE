<template>
  <div class="container-fluid py-4">
    <HeaderCard
      :title="isEditMode ? 'Cập Nhật Khách Hàng' : 'Thêm Khách Hàng'"
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
          <div id="qr-reader" class="w-72 h-72 mx-auto"></div>
          <button class="mt-4 btn btn-danger w-100" @click="isScanning = false">
            Dừng quét
          </button>
        </div>
      </div>

      <!-- Customer Image -->
      <div class="flex justify-center mb-6 animate__animated animate__zoomIn">
        <div class="employee-image-container relative">
          <div class="image-upload-wrapper">
            <div class="image-preview" @click="triggerFileInput">
              <img
                v-if="customerImage"
                :src="customerImage"
                alt="Ảnh khách hàng"
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
              v-if="customerImage"
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
          <label class="filter-label"> Tên khách hàng </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập tên khách hàng"
            v-model="customer.tenKH"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Số điện thoại </label>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Nhập số điện thoại"
            v-model="customer.soDienThoai"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Email </label>
          <input
            type="email"
            class="form-control search-input"
            placeholder="Nhập email"
            v-model="customer.email"
          />
        </div>
        <div class="col-md-6">
          <label class="filter-label"> Ngày sinh </label>
          <input
            type="date"
            class="form-control date-input"
            v-model="customer.ngaySinh"
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
                v-model="customer.gioiTinh"
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
                v-model="customer.gioiTinh"
              />
              <label class="form-check-label" for="nu"> Nữ </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Address Management Section -->
      <div class="address-management-section mt-5">
        <div class="section-header">
          <div class="section-title">
            <i class="bi bi-geo-alt-fill section-icon"></i>
            <h2 class="title-text">Quản lý địa chỉ</h2>
            <span class="address-count" @click="toggleAddressList">
              {{ addresses.length }} địa chỉ
            </span>
          </div>
          <button class="btn btn-add-address" @click="showAddAddress = true">
            Thêm địa chỉ
          </button>
        </div>

        <!-- Address List Dropdown -->
        <div
          v-if="showAddressList"
          class="address-dropdown animate__animated animate__fadeInDown"
        >
          <div class="dropdown-header">
            <h3 class="dropdown-title">Danh sách địa chỉ</h3>
            <button class="btn-close-dropdown" @click="showAddressList = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="dropdown-body">
            <input
              type="text"
              class="form-control search-input"
              placeholder="Tìm kiếm địa chỉ..."
              v-model="addressSearchQuery"
            />
            <div class="address-list-items">
              <div
                v-for="(address, index) in filteredAddresses"
                :key="index"
                class="address-item"
                :class="{ 'default-address': address.isDefault }"
                @click="selectAddress(index)"
              >
                <span class="address-text">{{
                  getAbbreviatedAddress(address)
                }}</span>
                <span v-if="address.isDefault" class="badge badge-default">
                  <i class="bi bi-star-fill me-1"></i>
                  Mặc định
                </span>
              </div>
              <div v-if="filteredAddresses.length === 0" class="no-results">
                Không tìm thấy địa chỉ phù hợp
              </div>
            </div>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Add Address Form -->
        <div
          v-if="showAddAddress"
          class="add-address-form animate__animated animate__slideInDown"
        >
          <div class="form-header">
            <h3 class="form-title">Thêm địa chỉ mới</h3>
            <button class="btn-close-form" @click="cancelAddAddress">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="form-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label"> Địa chỉ cụ thể </label>
                <input
                  type="text"
                  class="form-control modern-input"
                  placeholder="Nhập số nhà, tên đường..."
                  v-model="newAddress.diaChiCuThe"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label"> Tỉnh/Thành phố </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.thanhPho"
                  @change="fetchDistricts"
                >
                  <option value="" disabled>Chọn tỉnh/thành phố</option>
                  <option
                    v-for="(province, index) in provinces"
                    :key="index"
                    :value="province.name"
                  >
                    {{ province.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label"> Quận/Huyện </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.quan"
                  @change="fetchWards"
                >
                  <option value="" disabled>Chọn quận/huyện</option>
                  <option
                    v-for="(district, index) in districts"
                    :key="index"
                    :value="district.name"
                  >
                    {{ district.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label"> Xã/Phường </label>
                <select
                  class="form-select modern-select"
                  v-model="newAddress.phuong"
                >
                  <option value="" disabled>Chọn xã/phường</option>
                  <option
                    v-for="(ward, index) in wards"
                    :key="index"
                    :value="ward.name"
                  >
                    {{ ward.name }}
                  </option>
                </select>
              </div>

              <div class="col-12">
                <div class="form-check-wrapper">
                  <input
                    class="form-check-input modern-checkbox"
                    type="checkbox"
                    id="defaultAddress"
                    v-model="newAddress.isDefault"
                  />
                  <label class="form-check-label" for="defaultAddress">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-save" @click="addAddress">
              Lưu địa chỉ
            </button>
            <button class="btn btn-cancel" @click="cancelAddAddress">
              Hủy bỏ
            </button>
          </div>
        </div>

        <!-- Address List (Single Address with Navigation) -->
        <div class="address-list">
          <div v-if="addresses.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <h4 class="empty-title">Chưa có địa chỉ nào</h4>
            <p class="empty-text">Thêm địa chỉ đầu tiên cho khách hàng</p>
            <button class="btn btn-empty-action" @click="showAddAddress = true">
              Thêm địa chỉ ngay
            </button>
          </div>

          <div v-else class="address-container">
            <!-- Navigation Buttons -->
            <div class="address-navigation">
              <button
                class="btn btn-nav btn-prev"
                :disabled="currentAddressIndex === 0"
                @click="prevAddress"
              >
                <i class="bi bi-chevron-left"></i>
                Trước
              </button>
              <span class="address-counter"
                >Địa chỉ {{ currentAddressIndex + 1 }} / {{ addresses.length }}</span
              >
              <button
                class="btn btn-nav btn-next"
                :disabled="currentAddressIndex === addresses.length - 1"
                @click="nextAddress"
              >
                Tiếp
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>

            <!-- Single Address Card -->
            <div
              class="address-card animate__animated animate__fadeInUp"
              :style="{ animationDelay: '0.1s' }"
            >
              <div class="card-header">
                <div class="address-info">
                  <h5 class="address-title">
                    <i class="bi bi-geo-alt-fill me-2"></i>
                    Địa chỉ {{ currentAddressIndex + 1 }}
                  </h5>
                  <div class="address-badges">
                    <span
                      v-if="addresses[currentAddressIndex].isDefault"
                      class="badge badge-default"
                    >
                      <i class="bi bi-star-fill me-1"></i>
                      Mặc định
                    </span>
                  </div>
                </div>
                <div class="card-actions">
                  <button
                    class="btn-action btn-edit"
                    @click="editAddress(currentAddressIndex)"
                    title="Chỉnh sửa"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn-action btn-delete"
                    @click="confirmDeleteAddress(currentAddressIndex)"
                    title="Xóa"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">
                      <i class="bi bi-house-door me-2"></i>
                      Địa chỉ cụ thể
                    </label>
                    <input
                      v-if="addresses[currentAddressIndex].isEditing"
                      type="text"
                      class="form-control modern-input"
                      v-model="addresses[currentAddressIndex].diaChiCuThe"
                    />
                    <p v-else class="form-value">
                      {{ addresses[currentAddressIndex].diaChiCuThe }}
                    </p>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-building me-2"></i>
                      Tỉnh/Thành phố
                    </label>
                    <select
                      v-if="addresses[currentAddressIndex].isEditing"
                      class="form-select modern-select"
                      v-model="addresses[currentAddressIndex].thanhPho"
                      @change="fetchDistrictsForEdit(currentAddressIndex)"
                    >
                      <option value="" disabled>Chọn tỉnh/thành phố</option>
                      <option
                        v-for="(province, idx) in provinces"
                        :key="idx"
                        :value="province.name"
                      >
                        {{ province.name }}
                      </option>
                    </select>
                    <p v-else class="form-value">
                      {{ addresses[currentAddressIndex].thanhPho }}
                    </p>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-signpost me-2"></i>
                      Quận/Huyện
                    </label>
                    <select
                      v-if="addresses[currentAddressIndex].isEditing"
                      class="form-select modern-select"
                      v-model="addresses[currentAddressIndex].quan"
                      @change="fetchWardsForEdit(currentAddressIndex)"
                    >
                      <option value="" disabled>Chọn quận/huyện</option>
                      <option
                        v-for="(district, idx) in addresses[currentAddressIndex].districts"
                        :key="idx"
                        :value="district.name"
                      >
                        {{ district.name }}
                      </option>
                    </select>
                    <p v-else class="form-value">
                      {{ addresses[currentAddressIndex].quan }}
                    </p>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">
                      <i class="bi bi-geo me-2"></i>
                      Xã/Phường
                    </label>
                    <select
                      v-if="addresses[currentAddressIndex].isEditing"
                      class="form-select divers-select"
                      v-model="addresses[currentAddressIndex].phuong"
                    >
                      <option value="" disabled>Chọn xã/phường</option>
                      <option
                        v-for="(ward, idx) in addresses[currentAddressIndex].wards"
                        :key="idx"
                        :value="ward.name"
                      >
                        {{ ward.name }}
                      </option>
                    </select>
                    <p v-else class="form-value">
                      {{ addresses[currentAddressIndex].phuong }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="form-check-wrapper">
                  <input
                    class="form-check-input modern-checkbox"
                    type="checkbox"
                    :id="`defaultAddr${currentAddressIndex}`"
                    v-model="addresses[currentAddressIndex].isDefault"
                    @change="setDefaultAddress(currentAddressIndex)"
                  />
                  <label
                    class="form-check-label"
                    :for="`defaultAddr${currentAddressIndex}`"
                  >
                    <i class="bi bi-star-fill me-2"></i>
                    Địa chỉ mặc định
                  </label>
                </div>
                <div
                  v-if="addresses[currentAddressIndex].isEditing"
                  class="edit-actions"
                >
                  <button
                    class="btn btn-save"
                    @click="saveEditedAddress(currentAddressIndex)"
                  >
                    Lưu
                  </button>
                  <button
                    class="btn btn-cancel"
                    @click="cancelEditAddress(currentAddressIndex)"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mt-5">
        <button type="button" class="btn btn-reset" @click="goBack">Hủy</button>
        <button class="btn btn-action" @click="submitCustomer">
          {{ isEditMode ? "Cập Nhật" : "Thêm" }}
        </button>
      </div>
    </div>

    <NotificationModal
      ref="notificationModal"
      :type="notificationType"
      :message="notificationMessage"
      :isLoading="isNotificationLoading"
      :onConfirm="notificationOnConfirm"
      :onCancel="notificationOnCancel"
      @close="resetNotification"
    />
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import HeaderCard from "@/components/common/HeaderCard.vue";
import {
  addKhanhHang,
  getKhachHangDetail,
  UpdateKhachHang,
  UpdateKhachHangDiaChi,
  GetKhachHangDiaChiList,
  DeleteKhachHangDiaChi,
  SetMacDinhDiaChi,
  addDiaChi,
} from "../../store/modules/customers/khachHang";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const fileInput = ref(null);
const isScanning = ref(false);
const customerImage = ref(null);
const toastNotification = ref(null);
const notificationModal = ref(null);

const isEditMode = computed(() => !!route.params.id);

const customer = ref({
  id: null,
  tenKH: "",
  soDienThoai: "",
  email: "",
  ngaySinh: "",
  gioiTinh: "",
});

const showAddAddress = ref(false);
const showAddressList = ref(false);
const addressSearchQuery = ref("");
const newAddress = ref({
  diaChiCuThe: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  isDefault: false,
});
const addresses = ref([]);
const currentAddressIndex = ref(0);
const notificationType = ref("");
const notificationMessage = ref("");
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(null);
const notificationOnCancel = ref(null);

// Mock location data
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");

// Computed property for filtered addresses
const filteredAddresses = computed(() => {
  const query = addressSearchQuery.value.toLowerCase().trim();
  if (!query) return addresses.value;
  return addresses.value.filter((address) =>
    [
      address.diaChiCuThe,
      address.thanhPho,
      address.quan,
      address.phuong,
    ].some((field) => field?.toLowerCase().includes(query))
  );
});

// Toggle address list dropdown
const toggleAddressList = () => {
  showAddressList.value = !showAddressList.value;
  if (!showAddressList.value) {
    addressSearchQuery.value = ""; // Reset search when closing
  }
};

// Select address from dropdown
const selectAddress = (index) => {
  currentAddressIndex.value = addresses.value.findIndex(
    (addr) => addr === filteredAddresses.value[index]
  );
  showAddressList.value = false;
  addressSearchQuery.value = "";
};

// Generate abbreviated address
const getAbbreviatedAddress = (address) => {
  const parts = [
    address.diaChiCuThe,
    address.phuong,
    address.quan,
    address.thanhPho,
  ].filter(Boolean);
  return parts.join(", ").substring(0, 50) + (parts.join(", ").length > 50 ? "..." : "");
};

// Load provinces
const fetchProvinces = async () => {
  try {
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    provinces.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
    toastNotification.value.addToast({
      type: "error",
      message: "Không thể tải danh sách tỉnh/thành phố!",
    });
  }
};

// Load districts
const fetchDistricts = async () => {
  districts.value = [];
  wards.value = [];
  newAddress.value.quan = "";
  newAddress.value.phuong = "";

  const selectedProvince = provinces.value.find(
    (p) => p.name === newAddress.value.thanhPho
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

// Load wards
const fetchWards = async () => {
  wards.value = [];
  newAddress.value.phuong = "";

  const selectedDistrict = districts.value.find(
    (d) => d.name === newAddress.value.quan
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

// Load districts for editing
const fetchDistrictsForEdit = async (index) => {
  const address = addresses.value[index];
  address.districts = [];
  address.wards = [];

  const selectedProvince = provinces.value.find(
    (p) => p.name === address.thanhPho
  );
  if (selectedProvince) {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`
      );
      address.districts = response.data.districts;

      // Kiểm tra xem quan hiện tại có trong danh sách districts không
      const currentDistrict = address.districts.find(
        (d) => d.name === address.quan
      );
      if (currentDistrict) {
        // Nếu quan hợp lệ, giữ nguyên và tải danh sách phường
        await fetchWardsForEdit(index);
      } else {
        // Nếu quan không hợp lệ, reset quan và phuong
        address.quan = "";
        address.phuong = "";
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách quận/huyện:", error);
      toastNotification.value.addToast({
        type: "error",
        message: "Không thể tải danh sách quận/huyện!",
      });
    }
  } else {
    address.quan = "";
    address.phuong = "";
  }
};

// Load wards for editing
const fetchWardsForEdit = async (index) => {
  const address = addresses.value[index];
  address.wards = [];

  const selectedDistrict = address.districts.find(
    (d) => d.name === address.quan
  );
  if (selectedDistrict) {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
      );
      address.wards = response.data.wards;

      // Kiểm tra xem phuong hiện tại có trong danh sách wards không
      const currentWard = address.wards.find((w) => w.name === address.phuong);
      if (!currentWard) {
        address.phuong = "";
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách xã/phường:", error);
      toastNotification.value.addToast({
        type: "error",
        message: "Không thể tải danh sách xã/phường!",
      });
    }
  } else {
    address.phuong = "";
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toastNotification.value.addToast({
        type: "error",
        message: "Kích thước file không được vượt quá 5MB",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toastNotification.value.addToast({
        type: "error",
        message: "Vui lòng chọn file hình ảnh",
      });
      return;
    }
    customer.value.imageFile = file;
    customerImage.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  customerImage.value = null;
  customer.value.imageFile = null;
  if (fileInput.value) fileInput.value.value = "";
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const loadCustomerData = async () => {
  if (isEditMode.value) {
    const customerId = parseInt(route.params.id);
    try {
      const response = await getKhachHangDetail(customerId);
      if (response.success && response.data) {
        const customerData = response.data;
        const ngaySinh = customerData.ngaySinh
          ? new Date(customerData.ngaySinh).toISOString().split("T")[0]
          : "";
        customer.value = {
          id: customerData.id,
          tenKH: customerData.ten || "",
          soDienThoai: customerData.idTaiKhoan?.soDienThoai || "",
          email: customerData.idTaiKhoan?.email || "",
          ngaySinh: ngaySinh,
          gioiTinh: customerData.gioiTinh ? "True" : "False",
        };
        customerImage.value = customerData.anhKhachHang || null;

        const addressResponse = await GetKhachHangDiaChiList(customerId);
        if (addressResponse.success && addressResponse.data) {
          addresses.value = addressResponse.data
            .filter((addr) => addr.deleted !== false)
            .map((addr) => ({
              id: addr.id,
              diaChiCuThe: addr.diaChiCuThe || "",
              thanhPho: addr.thanhPho || "",
              quan: addr.quan || "",
              phuong: addr.phuong || "",
              isDefault: addr.macDinh || false,
              isEditing: false,
              districts: [],
              wards: [],
            }));
          if (addresses.value.length > 0) {
            newAddress.value.thanhPho = addresses.value[0].thanhPho;
            await fetchDistricts();
            newAddress.value.quan = addresses.value[0].quan;
            await fetchWards();
          }
        }
      } else {
        toastNotification.value.addToast({
          type: "error",
          message: response.message || "Không tìm thấy khách hàng!",
        });
        router.push("/khachHang");
      }
    } catch (error) {
      toastNotification.value.addToast({
        type: "error",
        message: "Lỗi khi tải dữ liệu khách hàng!",
      });
      router.push("/khachHang");
    }
  }
};

const addAddress = async () => {
  if (!newAddress.value.diaChiCuThe.trim()) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng nhập địa chỉ cụ thể!",
    });
    return;
  }
  if (!newAddress.value.thanhPho) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn tỉnh/thành phố!",
    });
    return;
  }
  if (!newAddress.value.quan) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn quận/huyện!",
    });
    return;
  }
  if (!newAddress.value.phuong) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn xã/phường!",
    });
    return;
  }

  const diaChiData = {
    idKhachHang: customer.value.id,
    diaChiCuThe: newAddress.value.diaChiCuThe,
    thanhPho: newAddress.value.thanhPho,
    quan: newAddress.value.quan,
    phuong: newAddress.value.phuong,
    macDinh: newAddress.value.isDefault,
  };

  try {
    const response = await addDiaChi(diaChiData);
    if (!response.success) {
      throw new Error(response.message || "Lỗi khi lưu địa chỉ!");
    }

    if (newAddress.value.isDefault) {
      addresses.value.forEach((addr) => (addr.isDefault = false));
    }

    addresses.value.push({
      id: response.data.id,
      ...newAddress.value,
      isEditing: false,
      districts: [],
      wards: [],
    });

    // Move to the newly added address
    currentAddressIndex.value = addresses.value.length - 1;

    newAddress.value = {
      diaChiCuThe: "",
      thanhPho: "",
      quan: "",
      phuong: "",
      isDefault: false,
    };
    showAddAddress.value = false;
    districts.value = [];
    wards.value = [];

    toastNotification.value.addToast({
      type: "success",
      message: "Thêm địa chỉ thành công!",
    });
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: error.message || "Lỗi khi lưu địa chỉ!",
    });
  }
};

const editAddress = async (index) => {
  addresses.value.forEach((addr, idx) => {
    addr.isEditing = idx === index;
    if (addr.isEditing) {
      addr.original = { ...addr }; // Save original state for cancel
      fetchDistrictsForEdit(index); // Load districts for editing
    }
  });
};

const saveEditedAddress = async (index) => {
  const address = addresses.value[index];
  if (!address.diaChiCuThe.trim()) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng nhập địa chỉ cụ thể!",
    });
    return;
  }
  if (!address.thanhPho) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn tỉnh/thành phố!",
    });
    return;
  }
  if (!address.quan) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn quận/huyện!",
    });
    return;
  }
  if (!address.phuong) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng chọn xã/phường!",
    });
    return;
  }

  const addressData = {
    id: address.id,
    idKhachHang: customer.value.id,
    diaChiCuThe: address.diaChiCuThe,
    thanhPho: address.thanhPho,
    quan: address.quan,
    phuong: address.phuong,
    macDinh: address.isDefault,
  };

  try {
    const response = await UpdateKhachHangDiaChi(address.id, addressData);
    if (!response.success) {
      throw new Error(response.message || "Lỗi khi cập nhật địa chỉ!");
    }

    if (address.isDefault) {
      addresses.value.forEach((addr, i) => {
        addr.isDefault = i === index;
      });
    }

    address.isEditing = false;
    address.districts = [];
    address.wards = [];
    delete address.original;

    toastNotification.value.addToast({
      type: "success",
      message: "Cập nhật địa chỉ thành công!",
    });
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: error.message || "Lỗi khi cập nhật địa chỉ!",
    });
  }
};

const cancelEditAddress = (index) => {
  const address = addresses.value[index];
  if (address.original) {
    addresses.value[index] = { ...address.original, isEditing: false };
  }
  address.isEditing = false;
  address.districts = [];
  address.wards = [];
};

const cancelAddAddress = () => {
  newAddress.value = {
    diaChiCuThe: "",
    thanhPho: "",
    quan: "",
    phuong: "",
    isDefault: false,
  };
  showAddAddress.value = false;
};

const confirmDeleteAddress = (index) => {
  notificationMessage.value = "Bạn có chắc chắn muốn xóa địa chỉ này không?";
  notificationType.value = "confirm";
  notificationOnConfirm.value = () => deleteAddress(index);
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const deleteAddress = async (index) => {
  const address = addresses.value[index];
  try {
    if (isEditMode.value && address.id) {
      const response = await DeleteKhachHangDiaChi(address.id);
      if (!response.success) {
        throw new Error(response.message || "Lỗi khi xóa địa chỉ!");
      }
    }
    addresses.value.splice(index, 1);
    // Adjust index after deletion
    if (currentAddressIndex.value >= addresses.value.length) {
      currentAddressIndex.value = addresses.value.length - 1;
    }
    if (addresses.value.length === 0) {
      currentAddressIndex.value = 0;
    }
    resetNotification();
    toastNotification.value.addToast({
      type: "success",
      message: "Xóa địa chỉ thành công!",
    });
  } catch (error) {
    resetNotification();
    toastNotification.value.addToast({
      type: "error",
      message: error.message || "Không thể xóa địa chỉ!",
    });
  }
};

const setDefaultAddress = async (index) => {
  const address = addresses.value[index];
  try {
    const response = await SetMacDinhDiaChi(address.id, true);
    if (!response.success) {
      throw new Error(response.message || "Lỗi khi đặt địa chỉ mặc định!");
    }

    addresses.value.forEach((addr, i) => {
      addr.isDefault = i === index;
    });

    toastNotification.value.addToast({
      type: "success",
      message: "Đã đặt làm địa chỉ mặc định!",
    });
  } catch (error) {
    address.isDefault = false;
    toastNotification.value.addToast({
      type: "error",
      message: error.message || "Không thể đặt địa chỉ mặc định!",
    });
  }
};

const nextAddress = () => {
  if (currentAddressIndex.value < addresses.value.length - 1) {
    currentAddressIndex.value++;
  }
};

const prevAddress = () => {
  if (currentAddressIndex.value > 0) {
    currentAddressIndex.value--;
  }
};

const submitCustomer = () => {
  if (!customer.value.tenKH || !customer.value.tenKH.trim()) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng nhập tên khách hàng!",
    });
    return;
  }
  if (!customer.value.soDienThoai || !customer.value.soDienThoai.trim()) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng nhập số điện thoại!",
    });
    return;
  }
  if (!customer.value.email || !customer.value.email.trim()) {
    toastNotification.value.addToast({
      type: "error",
      message: "Vui lòng nhập email!",
    });
    return;
  }

  notificationMessage.value = isEditMode.value
    ? "Bạn có chắc chắn muốn cập nhật khách hàng này không?"
    : "Bạn có chắc chắn muốn thêm khách hàng này không?";
  notificationType.value = "confirm";
  notificationOnConfirm.value = () => saveCustomer();
  notificationOnCancel.value = resetNotification;
  notificationModal.value.openModal();
};

const saveCustomer = async () => {
  isNotificationLoading.value = true;
  try {
    const defaultAddress =
      addresses.value.find((addr) => addr.isDefault) || addresses.value[0] || {};
    const customerData = {
      id: customer.value.id,
      tenKH: customer.value.tenKH,
      soDienThoai: customer.value.soDienThoai,
      email: customer.value.email,
      ngaySinh: customer.value.ngaySinh || null,
      gioiTinh: customer.value.gioiTinh === "True" ? 1 : 0,
      userName: customer.value.email,
      diaChiCuThe: defaultAddress.diaChiCuThe || "",
      thanhPho: defaultAddress.thanhPho || "",
      quan: defaultAddress.quan || "",
      phuong: defaultAddress.phuong || "",
      macDinh: defaultAddress.isDefault || false,
    };

    if (customer.value.imageFile) {
      customerData.anhKhachHang = await convertToBase64(customer.value.imageFile);
    } else if (customerImage.value === null) {
      customerData.anhKhachHang = null;
    }

    let response;
    if (isEditMode.value) {
      if (!customer.value.id) {
        throw new Error("ID khách hàng không hợp lệ, không thể cập nhật!");
      }
      response = await UpdateKhachHang(customer.value.id, customerData);
      for (const address of addresses.value) {
        const addressData = {
          id: address.id,
          idKhachHang: customer.value.id,
          diaChiCuThe: address.diaChiCuThe,
          thanhPho: address.thanhPho,
          quan: address.quan,
          phuong: address.phuong,
          macDinh: address.isDefault,
        };
        if (address.id) {
          const addressResponse = await UpdateKhachHangDiaChi(
            address.id,
            addressData
          );
          if (!addressResponse.success) {
            throw new Error(
              addressResponse.message || "Lỗi khi cập nhật địa chỉ!"
            );
          }
        } else {
          const addressResponse = await addDiaChi(addressData);
          if (!addressResponse.success) {
            throw new Error(addressResponse.message || "Lỗi khi thêm địa chỉ!");
          }
          address.id = addressResponse.data.id;
        }
      }
    } else {
      response = await addKhanhHang(customerData);
      if (response.success) {
        customer.value.id = response.data.id;
        for (const address of addresses.value) {
          const addressData = {
            idKhachHang: customer.value.id,
            diaChiCuThe: address.diaChiCuThe,
            thanhPho: address.thanhPho,
            quan: address.quan,
            phuong: address.phuong,
            macDinh: address.isDefault,
          };
          const addressResponse = await addDiaChi(addressData);
          if (!addressResponse.success) {
            throw new Error(addressResponse.message || "Lỗi khi thêm địa chỉ!");
          }
          address.id = addressResponse.data.id;
        }
      }
    }

    if (response.success) {
      toastNotification.value.addToast({
        type: "success",
        message: isEditMode.value
          ? "Cập nhật khách hàng thành công!"
          : "Thêm khách hàng thành công!",
      });
      setTimeout(() => {
        resetForm();
        goBack();
      }, 1500);
    } else {
      throw new Error(response.message || "Lỗi khi lưu khách hàng!");
    }
  } catch (error) {
    toastNotification.value.addToast({
      type: "error",
      message: error.message || "Lỗi khi lưu khách hàng!",
    });
  } finally {
    isNotificationLoading.value = false;
    resetNotification();
  }
};

const resetForm = () => {
  customer.value = {
    id: null,
    tenKH: "",
    soDienThoai: "",
    email: "",
    ngaySinh: "",
    gioiTinh: "",
  };
  customerImage.value = null;
  customer.value.imageFile = null;
  addresses.value = [];
  currentAddressIndex.value = 0;
  showAddressList.value = false;
  addressSearchQuery.value = "";
  if (fileInput.value) fileInput.value.value = "";
};

const goBack = () => {
  router.push("/khachHang");
};

const resetNotification = () => {
  notificationMessage.value = "";
  notificationType.value = "";
  notificationOnConfirm.value = null;
  notificationOnCancel.value = null;
};

onMounted(async () => {
  await fetchProvinces();
  loadCustomerData();
});
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

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
.date-input,
.modern-input,
.modern-select {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
}

.search-input:focus,
.date-input:focus,
.modern-input:focus,
.modern-select:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
  outline: none;
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

.custom-radio .form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

/* Address Management Section */
.address-management-section {
  margin: 0 auto;
  max-width: 100%;
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 1.5rem;
  color: #34d399;
}

.title-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.address-count {
  background: #e0f2fe;
  color: #0277bd;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-count:hover {
  background: #bae6fd;
  transform: scale(1.05);
}

.btn-add-address {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
}

.btn-add-address:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, #34d399, #a7f3d0, #34d399);
  border-radius: 2px;
  margin-bottom: 24px;
}

/* Address Dropdown */
.address-dropdown {
  position: absolute;
  top: 70px;
  left: 150px;
  right: 150px;
  width: 50%;
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.dropdown-header {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close-dropdown {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-close-dropdown:hover {
  background: #f3f4f6;
  color: #374151;
}

.dropdown-body {
  padding: 16px;
}

.address-list-items {
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  margin-bottom: 8px;
}

.address-item:hover {
  background: #e0f2fe;
}

.address-item.default-address {
  border: 2px solid #fbbf24;
}

.address-text {
  font-size: 0.95rem;
  color: #374151;
}

.no-results {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  padding: 16px;
}

/* Add Address Form */
.add-address-form {
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-header {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.btn-close-form {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-close-form:hover {
  background: #f3f4f6;
  color: #374151;
}

.form-body {
  padding: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.form-value {
  margin: 0;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 12px;
  color: #374151;
  font-size: 0.95rem;
}

.form-check-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.modern-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.modern-checkbox:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  margin: 0;
}

.form-actions,
.edit-actions {
  padding: 20px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-save {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
}

.btn-save:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
}

/* Address Navigation */
.address-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-nav {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-nav:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-nav:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
}

.btn-prev i,
.btn-next i {
  font-size: 1rem;
}

.address-counter {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

/* Ensure the address card takes full width */
.address-container {
  width: 100%;
}

/* Address Grid */
.address-list {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon i {
  font-size: 2rem;
  color: #9ca3af;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-empty-action {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-empty-action:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
}

.address-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.address-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15);
  border-color: #34d399;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.address-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.address-badges {
  display: flex;
  gap: 8px;
}

.badge-default {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #dbeafe;
  color: #2563eb;
}

.btn-edit:hover {
  background: #bfdbfe;
  transform: scale(1.1);
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.card-body {
  padding: 24px;
}

.card-footer {
  padding: 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 24px 0;
}

.btn-reset {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
}

.btn-reset:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.btn-action {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
}

.btn-action:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.35);
}

/* QR Scanner Styles */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-opacity-50 {
  --tw-bg-opacity: 0.5;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.z-50 {
  z-index: 50;
}

.bg-white {
  background-color: white;
}

.p-6 {
  padding: 1.5rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.w-72 {
  width: 18rem;
}

.h-72 {
  height: 18rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mt-4 {
  margin-top: 1rem;
}

.w-100 {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .form-actions,
  .edit-actions {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }

  .address-navigation {
    flex-direction: column;
    gap: 12px;
  }

  .address-dropdown {
    left: 10px;
    right: 10px;
    top: 80px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .address-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .card-actions {
    justify-content: center;
  }

  .gender-options {
    flex-direction: column;
    gap: 12px;
  }
}

/* Animation Classes */
.animate__animated {
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

.animate__zoomIn {
  animation-name: zoomIn;
}

.animate__slideInDown {
  animation-name: slideInDown;
}

.animate__fadeInDown {
  animation-name: fadeInDown;
}

/* Loading Animation */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom Scrollbar */
.address-management-section::-webkit-scrollbar,
.address-list-items::-webkit-scrollbar {
  width: 6px;
}

.address-management-section::-webkit-scrollbar-track,
.address-list-items::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.address-management-section::-webkit-scrollbar-thumb,
.address-list-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.address-management-section::-webkit-scrollbar-thumb:hover,
.address-list-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus Styles for Accessibility */
.btn-add-address:focus,
.btn-save:focus,
.btn-cancel:focus,
.btn-action:focus,
.btn-reset:focus,
.btn-nav:focus,
.btn-close-dropdown:focus,
.address-count:focus {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}

.modern-input:focus,
.modern-select:focus,
.search-input:focus,
.date-input:focus {
  outline: none;
}

/* Print Styles */
@media print {
  .action-buttons,
  .btn-add-address,
  .card-actions,
  .form-actions,
  .edit-actions,
  .address-navigation,
  .address-dropdown {
    display: none;
  }

  .address-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
  }

  .address-container {
    display: block;
  }
}
</style>