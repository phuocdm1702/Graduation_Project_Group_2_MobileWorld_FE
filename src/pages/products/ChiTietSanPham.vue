<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <HeaderCard title="Chi Tiết Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <div class="row g-4 align-items-end">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input v-model.trim="searchKeyword" @input="debouncedSearch" type="text"
                  placeholder="Tìm kiếm theo IMEI, tên, mã sản phẩm, màu sắc, RAM, ROM, giá..."
                  class="form-control search-input" />
              </div>
            </div>
          </div>

          <!-- Price Range -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng Giá</label>
              <div class="slider-container">
                <div class="slider-track"></div>
                <div class="slider-range" :style="{
                  left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice) * 100)}%`,
                  width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice) * 100)}%`
                }"></div>
                <div class="slider-thumb"
                  :style="{ left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice) * 100)}%` }"
                  @mousedown="(e) => startDrag('min', e)"></div>
                <div class="slider-thumb"
                  :style="{ left: `${((priceRange[1] - minPrice) / (maxPrice - minPrice) * 100)}%` }"
                  @mousedown="(e) => startDrag('max', e)"></div>
                <input type="range" v-model="priceRange[0]" :min="minPrice" :max="priceRange[1]"
                  class="absolute opacity-0 w-full h-full" />
                <input type="range" v-model="priceRange[1]" :min="priceRange[0]" :max="maxPrice"
                  class="absolute opacity-0 w-full h-full" />
              </div>
              <div class="flex justify-between text-sm text-gray-600 mt-1">
                <span>{{ formatPrice(priceRange[0]) }}</span>
                <span>{{ formatPrice(priceRange[1]) }}</span>
              </div>
            </div>
          </div>

          <!-- Color Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Màu Sắc</label>
              <select v-model="searchFilters.idMauSac" @change="searchProductDetails" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in mauSacOptions" :key="option.id" :value="option.id">
                  {{ option.mauSac }}
                </option>
              </select>
            </div>
          </div>

          <!-- ROM Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">ROM</label>
              <select v-model="searchFilters.idBoNhoTrong" @change="searchProductDetails"
                class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in boNhoTrongOptions" :key="option.id" :value="option.id">
                  {{ option.dungLuongBoNhoTrong }}
                </option>
              </select>
            </div>
          </div>

          <!-- RAM Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">RAM</label>
              <select v-model="searchFilters.idRam" @change="searchProductDetails" class="form-control search-input">
                <option value="">Tất cả</option>
                <option v-for="option in ramOptions" :key="option.id" :value="option.id">
                  {{ option.dungLuongRam }}
                </option>
              </select>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Trạng Thái</label>
              <div class="status-radio-group">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="searchFilters.status" value=""
                    id="statusAll" @change="searchProductDetails">
                  <label class="form-check-label" for="statusAll">Tất cả</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="searchFilters.status" value="Hoạt động"
                    id="statusActive" @change="searchProductDetails">
                  <label class="form-check-label" for="statusActive">Hoạt động</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="searchFilters.status" value="Đã Bán"
                    id="statusSold" @change="searchProductDetails">
                  <label class="form-check-label" for="statusSold">Đã Bán</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <div class="row g-3">
            <div class="col-lg-12">
              <div class="filter-stats d-flex">
                <div class="stat-item me-4">
                  <span class="stat-label">Tổng số chi tiết:</span>
                  <span class="stat-value">{{ filteredProductDetails.length }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-action" @click="downloadSelectedBarcodes" :disabled="selectedImeis.length === 0"
              title="Tải ảnh barcode đã chọn">
              Tải Barcode
            </button>
            <button class="btn btn-action" @click="resetAllFilters">
              Đặt lại bộ lọc
            </button>
            <button class="btn btn-action" @click="goBack">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Table View with IMEI List -->
    <FilterTableSection title="Danh Sách Chi Tiết Sản Phẩm" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredProductDetails.length }} chi tiết sản phẩm</span>
        </div>
        <div class="table-controls">
          <div class="view-toggle">
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'table', 'btn-outline-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'">
              <i class="bi bi-table"></i>
            </button>
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'card', 'btn-outline-secondary': viewMode !== 'card' }"
              @click="viewMode = 'card'">
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
            <button class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'imei', 'btn-outline-secondary': viewMode !== 'imei' }"
              @click="viewMode = 'imei'">
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="table-body">
        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <DataTable title="" :headers="headers" :data="filteredProductDetails" :pageSize="pageSize"
            :pageSizeOptions="[5, 10, 15, 20, 30, 40, 50]" @page-changed="goToPage"
            @items-per-page-changed="handleItemsPerPageChange" class="table-product">
            <template #checkbox="{ item }">
              <input type="checkbox" v-model="selectedImeis" :value="item.imei" />
            </template>
            <template #stt="{ item, index }">
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </template>
            <template #imageUrl="{ item }">
              <img :src="item.imageUrl" alt="Product Image" class="product-image" />
            </template>
            <template #imei="{ item }">
              <div class="code-text">{{ item.imei }}</div>
            </template>
            <template #tenSanPham="{ item }">
              <div class="employee-name">{{ item.tenSanPham }}</div>
            </template>
            <template #maSanPham="{ item }">
              <div class="customer-name">{{ item.maSanPham || 'N/A' }}</div>
            </template>
            <template #mauSac="{ item }">
              <div class="customer-name">{{ item.mauSac || 'N/A' }}</div>
            </template>
            <template #dungLuongRam="{ item }">
              <div class="customer-name">{{ item.dungLuongRam || 'N/A' }}</div>
            </template>
            <template #dungLuongBoNhoTrong="{ item }">
              <div class="customer-name">{{ item.dungLuongBoNhoTrong || 'N/A' }}</div>
            </template>
            <template #donGia="{ item }">
              <div class="amount-cell">{{ formatPrice(item.donGia) }}</div>
            </template>
            <template #deleted="{ item }">
              <span class="status-badge" :class="getStatusBadgeClass(item.deleted ? 'Đã Bán' : 'Hoạt động')">
                <i :class="getStatusIcon(item.deleted ? 'Đã Bán' : 'Hoạt động')" class="me-1"></i>
                {{ item.deleted ? 'Đã Bán' : 'Hoạt động' }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="action-buttons d-flex justify-content-center">
                <button class="btn btn-sm btn-table" @click="editProductDetail(item)" :disabled="item.deleted"
                  title="Chỉnh sửa chi tiết sản phẩm">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="showBarcode(item.imei)" title="Hiển thị mã barcode">
                  <i class="bi bi-upc-scan"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else-if="viewMode === 'card'" class="card-grid">
          <div v-for="detail in sharedPaginatedItems" :key="detail.imei" class="product-card">
            <div class="product-card-header">
              <div class="product-code">{{ detail.imei }}</div>
              <span class="status-badge" :class="getStatusBadgeClass(detail.deleted ? 'Đã Bán' : 'Hoạt động')">
                {{ detail.deleted ? 'Đã Bán' : 'Hoạt động' }}
              </span>
            </div>
            <div class="product-card-body">
              <div class="d-flex justify-content-between">
                <img :src="detail.imageUrl" alt="Product Image" class="product-card-image" />
              <div class="product-info">
                <div class="product-name">{{ detail.tenSanPham }}</div>
                <div class="product-detail">Màu sắc: {{ detail.mauSac || 'N/A' }}</div>
              </div>
              </div>
              <div class="product-details">
                <div class="detail-row">
                  <span class="detail-label">Mã sản phẩm:</span>
                  <span class="detail-value">{{ detail.maSanPham || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">RAM:</span>
                  <span class="detail-value">{{ detail.dungLuongRam || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ROM:</span>
                  <span class="detail-value">{{ detail.dungLuongBoNhoTrong || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Đơn giá:</span>
                  <span class="detail-value">{{ formatPrice(detail.donGia) }}</span>
                </div>
              </div>
              <div class="product-amounts mt-2 d-flex justify-content-between">
                <div class="total-amount">{{ formatPrice(detail.donGia) }}</div>
                <button class="btn btn-sm btn-table" @click="showBarcode(detail.imei)" title="Hiển thị mã barcode">
                  <i class="bi bi-upc-scan"></i> Barcode
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- IMEI List View -->
        <div v-else-if="viewMode === 'imei'" class="imei-list-view">
          <div class="imei-header">
            <div class="search-group mb-3 col-md-6">
              <label class="filter-label">Tìm kiếm IMEI</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input v-model.trim="imeiSearchKeyword" @input="debouncedImeiSearch" type="text"
                  placeholder="Nhập IMEI để tìm kiếm..." class="form-control search-input" />
              </div>
            </div>
            <div class="imei-count">
              {{ sharedPaginatedItems.length }}/{{ sharedFilteredItems.length }} IMEI
            </div>
          </div>
          <div class="imei-list-container">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col" style="width: 5%;">#</th>
                  <th scope="col" style="width: 5%;">STT</th>
                  <th scope="col" style="width: 10%;">Ảnh</th>
                  <th scope="col" style="width: 15%;">Mã Sản Phẩm</th>
                  <th scope="col" style="width: 20%;">Tên Sản Phẩm</th>
                  <th scope="col" style="width: 20%;">IMEI</th>
                  <th scope="col" style="width: 15%;">Trạng Thái</th>
                  <th scope="col" style="width: 20%;">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sharedPaginatedItems" :key="item.imei">
                  <td>
                    <input type="checkbox" v-model="selectedImeis" :value="item.imei" />
                  </td>
                  <td>{{ (sharedCurrentPage - 1) * sharedPageSize + index + 1 }}</td>
                  <td>
                    <img :src="item.imageUrl" alt="Product Image" class="product-image" />
                  </td>
                  <td class="product-name">{{ item.maSanPham || 'N/A' }}</td>
                  <td class="product-name">{{ item.tenSanPham || 'N/A' }}</td>
                  <td class="imei-code">{{ item.imei }}</td>
                  <td>
                    <span class="status-badge" :class="getStatusBadgeClass(item.deleted ? 'Đã Bán' : 'Hoạt động')">
                      <i :class="getStatusIcon(item.deleted ? 'Đã Bán' : 'Hoạt động')" class="me-1"></i>
                      {{ item.deleted ? 'Đã Bán' : 'Hoạt động' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons d-flex justify-content-center">
                      <button class="btn btn-sm btn-table" @click="showBarcode(item.imei)" title="Hiển thị mã barcode">
                        <i class="bi bi-upc-scan"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="sharedPaginatedItems.length === 0">
                  <td colspan="8" class="text-center">Không tìm thấy IMEI nào</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Shared Pagination -->
        <div v-if="viewMode === 'card' || viewMode === 'imei'" class="shared-pagination">
          <nav aria-label="Shared Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: sharedCurrentPage === 1 }">
                <button class="page-link" @click="sharedCurrentPage--" :disabled="sharedCurrentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in sharedTotalPages" :key="page" class="page-item"
                :class="{ active: sharedCurrentPage === page }">
                <button class="page-link" @click="sharedCurrentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: sharedCurrentPage === sharedTotalPages }">
                <button class="page-link" @click="sharedCurrentPage++" :disabled="sharedCurrentPage === sharedTotalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </FilterTableSection>

    <!-- Barcode Modal -->
    <div class="modal fade" id="barcodeModal" tabindex="-1" aria-labelledby="barcodeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content barcode-modal-content">
          <div class="modal-header barcode-modal-header">
            <h5 class="modal-title" id="barcodeModalLabel">Mã Barcode IMEI</h5>
          </div>
          <div class="modal-body text-center barcode-modal-body">
            <div class="barcode-container">
              <canvas id="barcodeCanvas" class="barcode-canvas"></canvas>
            </div>
            <div class="action-buttons mt-3 d-flex justify-content-center gap-3">
              <button class="btn btn-action" @click="copyImei(selectedImei)" title="Sao chép IMEI">
                <i class="bi bi-clipboard"></i> Sao chép IMEI
              </button>
              <button class="btn btn-action" @click="downloadBarcodeImage(selectedImei)" title="Tải ảnh barcode">
                <i class="bi bi-download"></i> Tải Barcode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ToastNotification ref="toast" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import DataTable from '@/components/common/DataTable.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import debounce from 'lodash/debounce';
import { getChiTietSanPhamBySanPhamId, getMauSac, getRam, getBoNhoTrong } from '@/store/modules/products/chiTietSanPham';
import JsBarcode from 'jsbarcode';
import * as bootstrap from 'bootstrap';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
  name: 'ProductDetail',
  components: {
    HeaderCard,
    FilterTableSection,
    DataTable,
    ToastNotification,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = ref(null);
    const productDetails = ref([]);
    const searchKeyword = ref('');
    const imeiSearchKeyword = ref('');
    const searchFilters = ref({
      idMauSac: '',
      idBoNhoTrong: '',
      idRam: '',
      minPrice: 0,
      maxPrice: 100000000,
      status: '',
    });
    const currentPage = ref(1);
    const pageSize = ref(10);
    const sharedCurrentPage = ref(1);
    const sharedPageSize = ref(10);
    const minPrice = ref(0);
    const maxPrice = ref(100000000);
    const priceRange = ref([0, 100000000]);
    const mauSacOptions = ref([]);
    const boNhoTrongOptions = ref([]);
    const ramOptions = ref([]);
    const viewMode = ref('table');
    const isLoading = ref(false);
    const selectedImei = ref('');
    const selectedImeis = ref([]);

    const headers = ref([
      { text: '#', value: 'checkbox' },
      { text: 'STT', value: 'stt' },
      { text: 'Ảnh', value: 'imageUrl' }, // Thêm cột ảnh
      { text: 'Mã SP', value: 'maSanPham' },
      { text: 'Tên SP', value: 'tenSanPham' },
      { text: 'IMEI', value: 'imei' },
      { text: 'Màu Sắc', value: 'mauSac' },
      { text: 'RAM', value: 'dungLuongRam' },
      { text: 'ROM', value: 'dungLuongBoNhoTrong' },
      { text: 'Đơn Giá', value: 'donGia' },
      { text: 'Trạng Thái', value: 'deleted' },
      { text: 'Hành Động', value: 'actions' },
    ]);

    const filteredProductDetails = computed(() => {
      let filtered = productDetails.value;

      if (searchKeyword.value) {
        filtered = filtered.filter(
          (item) =>
            item.imei?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.tenSanPham?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.maSanPham?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.mauSac?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.dungLuongRam?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.dungLuongBoNhoTrong?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            String(item.donGia).includes(searchKeyword.value.toLowerCase())
        );
      }

      if (searchFilters.value.idMauSac) {
        filtered = filtered.filter(
          (item) => String(item.idMauSac) === String(searchFilters.value.idMauSac)
        );
      }

      if (searchFilters.value.idRam) {
        filtered = filtered.filter(
          (item) => String(item.idRam) === String(searchFilters.value.idRam)
        );
      }

      if (searchFilters.value.idBoNhoTrong) {
        filtered = filtered.filter(
          (item) => String(item.idBoNhoTrong) === String(searchFilters.value.idBoNhoTrong)
        );
      }

      if (searchFilters.value.minPrice !== undefined && searchFilters.value.maxPrice !== undefined) {
        filtered = filtered.filter(
          (item) =>
            item.donGia >= searchFilters.value.minPrice &&
            item.donGia <= searchFilters.value.maxPrice
        );
      }

      if (searchFilters.value.status) {
        filtered = filtered.filter(
          (item) => (searchFilters.value.status === 'Hoạt động' && !item.deleted) ||
                    (searchFilters.value.status === 'Đã Bán' && item.deleted)
        );
      }

      return filtered;
    });

    const sharedFilteredItems = computed(() => {
      let filtered = viewMode.value === 'imei' ? filteredImeiList.value : filteredProductDetails.value;
      return filtered;
    });

    const sharedPaginatedItems = computed(() => {
      const start = (sharedCurrentPage.value - 1) * sharedPageSize.value;
      const end = start + sharedPageSize.value;
      return sharedFilteredItems.value.slice(start, end).map((item, index) => ({
        ...item,
        stt: start + index + 1,
      }));
    });

    const sharedTotalPages = computed(() =>
      Math.ceil(sharedFilteredItems.value.length / sharedPageSize.value)
    );

    const filteredImeiList = computed(() => {
      let filtered = productDetails.value.map(item => ({
        imei: item.imei,
        tenSanPham: item.tenSanPham,
        maSanPham: item.maSanPham,
        deleted: item.deleted,
        imageUrl: item.imageUrl // Thêm imageUrl vào danh sách IMEI
      }));

      if (imeiSearchKeyword.value) {
        filtered = filtered.filter(item =>
          item.imei.toLowerCase().includes(imeiSearchKeyword.value.toLowerCase()) ||
          item.tenSanPham?.toLowerCase().includes(imeiSearchKeyword.value.toLowerCase()) ||
          item.maSanPham?.toLowerCase().includes(imeiSearchKeyword.value.toLowerCase())
        );
      }

      if (searchFilters.value.status) {
        filtered = filtered.filter(
          (item) => (searchFilters.value.status === 'Hoạt động' && !item.deleted) ||
                    (searchFilters.value.status === 'Đã Bán' && item.deleted)
        );
      }

      return filtered;
    });

    const fetchProductDetails = async () => {
      try {
        isLoading.value = true;
        const response = await getChiTietSanPhamBySanPhamId(route.params.id);
        productDetails.value = response.data.map(item => ({
          imei: item.imei,
          tenSanPham: item.tenSanPham,
          maSanPham: item.maSanPham,
          mauSac: item.mauSac,
          dungLuongRam: item.dungLuongRam,
          dungLuongBoNhoTrong: item.dungLuongBoNhoTrong,
          donGia: item.donGia,
          deleted: item.deleted,
          imageUrl: item.imageUrl, // Thêm imageUrl
          idMauSac: item.mauSac ? mauSacOptions.value.find(opt => opt.mauSac === item.mauSac)?.id : null,
          idRam: item.dungLuongRam ? ramOptions.value.find(opt => opt.dungLuongRam === item.dungLuongRam)?.id : null,
          idBoNhoTrong: item.dungLuongBoNhoTrong ? boNhoTrongOptions.value.find(opt => opt.dungLuongBoNhoTrong === item.dungLuongBoNhoTrong)?.id : null,
        }));
        const prices = productDetails.value.map(item => item.donGia);
        minPrice.value = Math.min(...prices) || 0;
        maxPrice.value = Math.max(...prices) || 100000000;
        priceRange.value = [minPrice.value, maxPrice.value];
        searchFilters.value.minPrice = minPrice.value;
        searchFilters.value.maxPrice = maxPrice.value;
        pageSize.value = response.data.pageSize || 10;
        sharedPageSize.value = response.data.imeiPageSize || 10;
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Không thể tải chi tiết sản phẩm: ' + (error.response?.data?.error || error.message),
          duration: 5000,
        });
        productDetails.value = [];
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
        mauSacOptions.value = mauSacRes.data;
        ramOptions.value = ramRes.data;
        boNhoTrongOptions.value = boNhoTrongRes.data;
      } catch (error) {
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải bộ lọc: ' + (error.response?.data?.error || error.message),
          duration: 3000,
        });
        console.error('Lỗi khi tải bộ lọc:', error);
      }
    };

    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const startDrag = (type, event) => {
      const slider = event.target.closest('.slider-container');
      const updatePrice = (e) => {
        const rect = slider.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newPrice = Math.round(pos * (maxPrice.value - minPrice.value) + minPrice.value);

        if (type === 'min' && newPrice < priceRange.value[1]) {
          priceRange.value[0] = Math.max(minPrice.value, newPrice);
        } else if (type === 'max' && newPrice > priceRange.value[0]) {
          priceRange.value[1] = Math.min(maxPrice.value, newPrice);
        }
        searchFilters.value.minPrice = priceRange.value[0];
        searchFilters.value.maxPrice = priceRange.value[1];
        searchProductDetails();
      };

      const stopDrag = () => {
        document.removeEventListener('mousemove', updatePrice);
        document.removeEventListener('mouseup', stopDrag);
      };

      document.addEventListener('mousemove', updatePrice);
      document.addEventListener('mouseup', stopDrag);
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
      searchProductDetails();
    }, 300);

    const debouncedImeiSearch = debounce(() => {
      sharedCurrentPage.value = 1;
    }, 300);

    const searchProductDetails = () => {
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
    };

    const resetAllFilters = () => {
      searchKeyword.value = '';
      imeiSearchKeyword.value = '';
      searchFilters.value = {
        idMauSac: '',
        idBoNhoTrong: '',
        idRam: '',
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        status: '',
      };
      priceRange.value = [minPrice.value, maxPrice.value];
      selectedImeis.value = [];
      currentPage.value = 1;
      sharedCurrentPage.value = 1;
      toast.value?.addToast({
        type: 'info',
        message: 'Đã đặt lại tất cả bộ lọc',
        duration: 2000,
      });
    };

    const goToPage = (page) => {
      currentPage.value = page;
    };

    const handleItemsPerPageChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Hoạt động':
          return 'badge-completed';
        case 'Đã Bán':
          return 'badge-canceled';
        default:
          return 'badge-primary';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Hoạt động':
          return 'bi bi-check-circle';
        case 'Đã Bán':
          return 'bi bi-x-circle';
        default:
          return 'bi bi-circle';
      }
    };

    const editProductDetail = (item) => {
      console.log('Navigating with id:', route.params.id);
      if (!route.params.id) {
        toast.value?.addToast({
          type: 'error',
          message: 'Không tìm thấy ID sản phẩm để điều hướng',
          duration: 5000,
        });
        return;
      }
      router.push({
        name: 'EditChiTietSanPham',
        params: { id: route.params.id },
      }).catch((error) => {
        console.error('Lỗi điều hướng:', error);
        toast.value?.addToast({
          type: 'error',
          message: 'Không thể điều hướng đến trang chỉnh sửa: ' + error.message,
          duration: 5000,
        });
      });
    };

    const showBarcode = (imei) => {
      selectedImei.value = imei;
      const modal = new bootstrap.Modal(document.getElementById('barcodeModal'));
      modal.show();
      setTimeout(() => {
        JsBarcode("#barcodeCanvas", imei, {
          format: "CODE128",
          displayValue: true,
          fontSize: 18,
          height: 100,
          width: 3,
          margin: 10,
          background: "#ffffff",
          lineColor: "#1f3a44",
        });
      }, 0);
    };

    const copyImei = async (imei) => {
      try {
        await navigator.clipboard.writeText(imei);
        toast.value?.addToast({
          type: 'success',
          message: `Đã sao chép IMEI: ${imei}`,
          duration: 2000,
        });
      } catch (error) {
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi sao chép IMEI: ' + error.message,
          duration: 3000,
        });
      }
    };

    const downloadBarcodeImage = (imei) => {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, imei, {
        format: "CODE128",
        displayValue: true,
        fontSize: 18,
        height: 100,
        width: 3,
        margin: 10,
        background: "#ffffff",
        lineColor: "#1f3a44",
      });
      const link = document.createElement('a');
      const url = canvas.toDataURL('image/png');
      link.setAttribute('href', url);
      link.setAttribute('download', `barcode_${imei}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.value?.addToast({
        type: 'success',
        message: `Đã tải xuống ảnh barcode cho IMEI: ${imei}`,
        duration: 2000,
      });
    };

    const downloadSelectedBarcodes = async () => {
      if (selectedImeis.value.length === 0) {
        toast.value?.addToast({
          type: 'warning',
          message: 'Vui lòng chọn ít nhất một IMEI để tải barcode',
          duration: 2000,
        });
        return;
      }

      const zip = new JSZip();
      for (const imei of selectedImeis.value) {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, imei, {
          format: "CODE128",
          displayValue: true,
          fontSize: 18,
          height: 100,
          width: 3,
          margin: 10,
          background: "#ffffff",
          lineColor: "#1f3a44",
        });
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        zip.file(`barcode_${imei}.png`, base64Data, { base64: true });
      }

      try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'barcodes.zip');
        toast.value?.addToast({
          type: 'success',
          message: `Đã tải xuống ${selectedImeis.value.length} ảnh barcode`,
          duration: 2000,
        });
      } catch (error) {
        toast.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải xuống barcodes: ' + error.message,
          duration: 3000,
        });
      }
    };

    const goBack = () => {
      router.push('/SanPham');
    };

    watch(
      () => priceRange.value,
      ([min, max]) => {
        searchFilters.value.minPrice = min;
        searchFilters.value.maxPrice = max;
        searchProductDetails();
      },
      { deep: true }
    );

    watch(() => viewMode.value, () => {
      sharedCurrentPage.value = 1; // Reset shared pagination when view mode changes
    });

    onMounted(async () => {
      await Promise.all([loadFilterOptions(), fetchProductDetails()]);
    });

    return {
      toast,
      productDetails,
      searchKeyword,
      imeiSearchKeyword,
      searchFilters,
      currentPage,
      pageSize,
      sharedCurrentPage,
      sharedPageSize,
      minPrice,
      maxPrice,
      priceRange,
      mauSacOptions,
      boNhoTrongOptions,
      ramOptions,
      viewMode,
      headers,
      filteredProductDetails,
      filteredImeiList,
      sharedFilteredItems,
      sharedPaginatedItems,
      sharedTotalPages,
      isLoading,
      formatPrice,
      startDrag,
      debouncedSearch,
      debouncedImeiSearch,
      searchProductDetails,
      resetAllFilters,
      goToPage,
      handleItemsPerPageChange,
      getStatusBadgeClass,
      getStatusIcon,
      editProductDetail,
      showBarcode,
      copyImei,
      downloadBarcodeImage,
      downloadSelectedBarcodes,
      selectedImei,
      selectedImeis,
      goBack,
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
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gentleGlow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }

  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

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

.search-group {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  outline: none;
}

.status-radio-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  font-size: 0.9rem;
  color: #1f3a44;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #34d399;
  border-color: #34d399;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.filter-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #1f3a44;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f3a44;
}

.action-buttons {
  display: flex;
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

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.table-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-count {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.view-toggle .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-toggle .btn-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border: none;
  color: white;
}

.view-toggle .btn-primary:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.view-toggle .btn-outline-secondary {
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #1f3a44;
}

.view-toggle .btn-outline-secondary:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  align-items: center;
}

.badge-completed {
  background: #34d399;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

.badge-primary {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.code-text {
  font-weight: 500;
  color: #34d399;
}

.amount-cell {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.total-amount {
  font-weight: 600;
  color: #16a34a !important;
}

.card-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  animation: fadeInUp 0.3s ease-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.15);
}

.product-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.product-card-body {
  padding: 1rem;
}

.product-info {
  text-align: right;
  margin-bottom: 1rem;
}

.product-name {
  font-weight: 600;
  color: #1f3a44;
}

.product-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
  color: #1f3a44;
}

.product-amounts {
  padding-top: 1rem;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
}

.shared-pagination {
  padding: 1rem;
}

.pagination {
  margin: 0;
  justify-content: center;
}

.page-item .page-link {
  border-radius: 6px;
  margin: 0 0.2rem;
  color: #1f3a44;
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 0.4rem 0.8rem;
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #34d399, #16a34a);
  border-color: #34d399;
  color: white;
}

.page-item:not(.disabled) .page-link:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  border-color: #16a34a;
  color: white;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: rgba(52, 153, 211, 0.2);
  color: #6c757d;
}

.slider-container {
  position: relative;
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
}

.slider-track {
  height: 4px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: absolute;
}

.slider-range {
  height: 4px;
  background-color: #16a34a;
  border-radius: 2px;
  position: absolute;
}

.slider-thumb {
  width: 18px;
  height: 18px;
  background-color: #16a34a;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.product-image, .product-card-image {
  width: 60px;
  height: 65px;
}

.imei-list-view {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.3s ease-out;
}

.imei-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.imei-count {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.imei-list-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.imei-list-container table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.imei-list-container th,
.imei-list-container td {
  padding: 1.2rem 1rem;
  vertical-align: middle;
  text-align: center;
  font-size: 0.95rem;
}

.imei-list-container th {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
  color: #1f3a44;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.product-code {
  font-weight: 500;
  color: #34d399;
}

.product-name {
  font-weight: 500;
  color: #1f3a44;
}

.imei-code {
  font-weight: 500;
  color: #34d399;
}

.imei-list-container tbody tr {
  transition: background 0.2s ease;
}

.imei-list-container tbody tr:hover {
  background: rgba(52, 211, 153, 0.1);
  cursor: pointer;
}

.imei-list-container::-webkit-scrollbar, .table-product::-webkit-scrollbar {
  width: 6px;
}

.imei-list-container::-webkit-scrollbar-track, .table-product::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.imei-list-container::-webkit-scrollbar-thumb, .table-product::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 3px;
}

.imei-list-container::-webkit-scrollbar-thumb:hover, .table-product::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

/* Barcode Modal Styles */
.barcode-modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(52, 211, 153, 0.25);
  background: linear-gradient(145deg, #ffffff, #f4f7fa);
  animation: zoomIn 0.3s ease-out;
  overflow: hidden;
}

.barcode-modal-header {
  background: #34d399;
  color: white;
  border-bottom: none;
  padding: 1.5rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.barcode-modal-header .modal-title {
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
}

.barcode-modal-body {
  padding: 2.5rem;
  background: white;
  border-radius: 12px;
  margin: 1.5rem;
  box-shadow: inset 0 0 12px rgba(52, 211, 153, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.imei-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.barcode-canvas {
  max-width: 100%;
  border: 3px solid #34d399;
  border-radius: 12px;
  padding: 15px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .filter-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .imei-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .imei-list-container th,
  .imei-list-container td {
    font-size: 0.85rem;
    padding: 0.8rem;
  }

  .barcode-modal-body {
    padding: 1.5rem;
  }

  .status-radio-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.7rem;
  }

  .view-toggle .btn {
    padding: 0.3rem 0.5rem;
  }

  .imei-list-container th,
  .imei-list-container td {
    font-size: 0.8rem;
    padding: 0.6rem;
  }

  .barcode-modal-content {
    margin: 1rem;
  }

  .barcode-modal-header {
    padding: 1rem;
  }

  .barcode-modal-body {
    padding: 1rem;
  }

  .imei-text {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>