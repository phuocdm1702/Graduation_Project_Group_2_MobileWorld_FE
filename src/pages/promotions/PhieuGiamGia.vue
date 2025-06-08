<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCard title="Quản Lý Phiếu Giảm Giá" />
    <div class="container mx-auto px-4">
      <ToastNotification ref="toast" />
      <!-- Form lọc -->
      <FilterTableSection>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm phiếu</label>
            <input
              v-model="searchQuery"
              id="searchQuery"
              type="text"
              placeholder="Tìm theo mã hoặc tên phiếu..."
              class="input-field"
            />
          </div>
          <div>
            <label for="filterType" class="block text-sm font-medium text-gray-700 mb-1">Loại phiếu</label>
            <select v-model="filterType" id="filterType" class="input-field">
              <option value="">Tất cả loại phiếu</option>
              <option value="Phần trăm">Phần trăm</option>
              <option value="Tiền mặt">Tiền mặt</option>
            </select>
          </div>
          <div>
            <label for="filterStatus" class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select v-model="filterStatus" id="filterStatus" class="input-field">
              <option value="">Tất cả trạng thái</option>
              <option value="Chưa diễn ra">Chưa diễn ra</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Không hoạt động">Không hoạt động</option>
            </select>
          </div>
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
            <input v-model="startDate" id="startDate" type="date" class="input-field" />
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
            <input v-model="endDate" id="endDate" type="date" class="input-field" />
          </div>
          <div>
            <label for="minOrder" class="block text-sm font-medium text-gray-700 mb-1">Hóa đơn tối thiểu</label>
            <input
              v-model="minOrder"
              id="minOrder"
              type="number"
              placeholder="Hóa đơn tối thiểu"
              class="input-field"
            />
          </div>
          <div>
            <label for="valueFilter" class="block text-sm font-medium text-gray-700 mb-1">Giá trị phiếu</label>
            <input
              v-model="valueFilter"
              id="valueFilter"
              type="number"
              placeholder="Giá trị phiếu"
              class="input-field"
            />
          </div>
          <div class="flex justify-end w-full col-span-full gap-2">
            <router-link to="/add-phieu-giam-gia">
              <button
                class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Thêm Phiếu
              </button>
            </router-link>
          </div>
        </div>
      </FilterTableSection>
      <!-- Bảng danh sách -->
      <DataTable
        :data="vouchers"
        :columns="columns"
        :get-nested-value="getNestedValue"
        class="bg-white shadow-lg rounded-lg"
      />
      <!-- Phân trang -->
      <footer class="bg-white shadow-lg rounded-lg p-4 flex justify-center items-center mt-4">
        <div class="inline-flex items-center gap-2">
          <button
            v-for="page in displayedPages"
            :key="page"
            class="px-3 py-1 border rounded-md"
            :class="{ 'bg-orange-500 text-white': currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
      </footer>
      <NotificationModal :show="showNotificationModal" :message="notificationMessage" />
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition;
}
</style>