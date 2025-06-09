<template>
  <div>
    <BreadcrumbWrapper :breadcrumb-items="breadcrumbItems" />
    <div class="mt-2 mx-auto">
      <ToastNotification ref="toast" />

      <!-- Form lọc -->
      <div
        class="bg-white shadow-lg rounded-lg p-5 mb-2 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            v-model.trim="searchKeyword"
            @input="debouncedSearch"
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            class="input-field p-2 border border-gray-300"
          />
        </div>

        <!-- Filter for Manufacturer -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hãng</label>
          <v-select
            v-model="searchFilters.idNhaSanXuat"
            :options="nhaSanXuatOptions"
            label="nhaSanXuat"
            :reduce="option => option.id"
            placeholder="Tất cả"
            class="input-field"
            @update:modelValue="searchProductDetails"
            clearable
          />
        </div>

        <!-- Filter for OS -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hệ Điều Hành</label>
          <v-select
            v-model="searchFilters.idHeDieuHanh"
            :options="heDieuHanhOptions"
            :get-option-label="option => `${option.heDieuHanh} ${option.phienBan}`"
            :reduce="option => option.id" 
            placeholder="Tất cả"
            class="input-field"
            @update:modelValue="searchProductDetails"
            clearable
          />
        </div>

        <!-- Filter for Screen Technology -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Công nghệ màn hình</label>
          <v-select
            v-model="searchFilters.idCongNgheManHinh"
            :options="congNgheManHinhOptions"
            :get-option-label="option => `${option.chuanManHinh} ${option.congNgheManHinh}`"
            :reduce="option => option.id"
            placeholder="Tất cả"
            class="input-field"
            @update:modelValue="searchProductDetails"
            clearable
          />
        </div>

        <!-- Filter for Battery -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pin</label>
          <v-select
            v-model="searchFilters.idPin"
            :options="pinOptions"
            :get-option-label="option => `${option.loaiPin} ${option.dungLuongPin}`"
            :reduce="option => option.id"
            placeholder="Tất cả"
            class="input-field"
            @update:model-value="searchProductDetails"
            clearable
          />
        </div>

        <!-- Filter for Stock Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái tồn kho</label>
          <div class="flex items-center gap-4 mt-3">
            <label class="flex items-center gap-1">
              <input
                type="radio"
                v-model="searchFilters.stockStatus"
                value=""
                @change="searchProductDetails"
                class="form-radio"
              />
              <span class="text-sm">Tất cả</span>
            </label>
            <label class="flex items-center gap-1">
              <input
                type="radio"
                v-model="searchFilters.stockStatus"
                value="inStock"
                @change="searchProductDetails"
                class="form-radio"
              />
              <span class="text-sm">Còn hàng</span>
            </label>
            <label class="flex items-center gap-1">
              <input
                type="radio"
                v-model="searchFilters.stockStatus"
                value="outOfStock"
                @change="searchProductDetails"
                class="form-radio"
              />
              <span class="text-sm">Hết hàng</span>
            </label>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end w-full col-span-full gap-2">
          <button
            @click="resetSearch"
            class="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 mr-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.992"
              />
            </svg>
            Đặt lại
          </button>
          <button
            @click="navigateToAddPage"
            class="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 mr-1"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm chi tiết sản phẩm
          </button>
        </div>
      </div>

      <!-- Thông báo khi không có dữ liệu -->
      <div v-if="productDetails.length === 0" class="text-center text-gray-500 py-4">
        Không tìm thấy sản phẩm nào.
      </div>

      <!-- Bảng danh sách sản phẩm -->
      <DynamicTable
        v-else
        class="dynamic-table"
        :data="productDetails"
        :columns="columns"
        :get-nested-value="getNestedValue"
      />

      <!-- Phân trang -->
      <footer
        v-if="productDetails.length > 0"
        class="bg-white shadow-lg rounded-lg p-4 flex justify-center items-center mt-2"
      >
        <Pagination :current-page="currentPage" :total-pages="totalPages" @page-changed="goToPage" />
      </footer>

      <!-- Modal xác nhận -->
      <ConfirmModal
        :show="showConfirmModal"
        :message="confirmMessage"
        @confirm="executeConfirmedAction"
        @cancel="closeConfirmModal"
      />
    </div>
  </div>
</template>

<script>

</script>

<style scoped>

</style>