<template>
  <div class="container-fluid py-4 product-management">
    <!-- Header -->
    <HeaderCard
      title="Thêm Chi Tiết Sản Phẩm"
      badgeText="Hệ Thống POS"
      badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95"
    />

    <!-- Main Form Section -->
    <FilterTableSection title="Thông Tin Sản Phẩm" icon="bi bi-box-seam">
      <div class="m-3">
        <div v-if="isLoading" class="text-center">
          <p class="text-gray-700">Đang tải dữ liệu...</p>
        </div>

        <div v-else class="row g-4">
          <!-- Tên Sản Phẩm -->
          <div class="col-lg-12">
            <div class="search-group">
              <label class="filter-label">Tên Sản Phẩm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  v-model.trim="productData.tenSanPham"
                  type="text"
                  placeholder="Nhập hoặc chọn tên sản phẩm"
                  class="form-control search-input"
                  @focus="showProductDropdown = true"
                  @blur="delayHideProductDropdown"
                  @input="filterProducts"
                />
                <div
                  v-if="showProductDropdown && filteredProductNameOptions.length > 0"
                  class="dropdown-menu show"
                >
                  <div
                    v-for="product in filteredProductNameOptions"
                    :key="product.id"
                    class="dropdown-item"
                    @mousedown="selectProduct(product)"
                  >
                    {{ product.tenSanPham }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hệ Điều Hành, Màn Hình, Nhà Sản Xuất -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <div class="input-group">
                <select
                  v-model="productData.idHeDieuHanh"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Hệ Điều Hành</option>
                  <option v-for="option in heDieuHanhOptions" :key="option.id" :value="option.id">
                    {{ option.tenHeDieuHanh }}
                  </option>
                </select>
                <button
                  @click="openAddModal('heDieuHanh')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Màn Hình</label>
              <div class="input-group">
                <select
                  v-model="productData.congNgheManHinh"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Công Nghệ Màn Hình</option>
                  <option v-for="option in congNgheManHinhOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('congNgheManHinh')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Nhà Sản Xuất</label>
              <div class="input-group">
                <select
                  v-model="productData.idNhaSanXuat"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Nhà Sản Xuất</option>
                  <option v-for="option in nhaSanXuatOptions" :key="option.id" :value="option.id">
                    {{ option.tenNhaSanXuat }}
                  </option>
                </select>
                <button
                  @click="openAddModal('nhaSanXuat')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Camera, Sim, Thiết Kế -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Cụm Camera</label>
              <div class="input-group">
                <select
                  v-model="productData.idCumCamera"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Cụm Camera</option>
                  <option v-for="option in cumCameraOptions" :key="option.id" :value="option.id">
                    {{ option.thongSo }}
                  </option>
                </select>
                <button
                  @click="openAddModal('cumCamera')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Sim</label>
              <div class="input-group">
                <select
                  v-model="productData.idSim"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Sim</option>
                  <option v-for="option in simOptions" :key="option.id" :value="option.id">
                    {{ option.loaiSim }}
                  </option>
                </select>
                <button
                  @click="openAddModal('sim')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Thiết Kế</label>
              <div class="input-group">
                <select
                  v-model="productData.idThietKe"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Thiết Kế</option>
                  <option v-for="option in thietKeOptions" :key="option.id" :value="option.id">
                    {{ option.loaiThietKe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('thietKe')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pin, CPU, GPU -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Pin</label>
              <div class="input-group">
                <select
                  v-model="productData.idPin"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Pin</option>
                  <option v-for="option in pinOptions" :key="option.id" :value="option.id">
                    {{ option.dungLuong }}
                  </option>
                </select>
                <button
                  @click="openAddModal('pin')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">CPU</label>
              <div class="input-group">
                <select
                  v-model="productData.idCpu"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn CPU</option>
                  <option v-for="option in cpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenCpu }}
                  </option>
                </select>
                <button
                  @click="openAddModal('cpu')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">GPU</label>
              <div class="input-group">
                <select
                  v-model="productData.idGpu"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn GPU</option>
                  <option v-for="option in gpuOptions" :key="option.id" :value="option.id">
                    {{ option.tenGpu }}
                  </option>
                </select>
                <button
                  @click="openAddModal('gpu')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Công Nghệ Mạng, Hỗ Trợ Công Nghệ Sạc, Chỉ Số Kháng Bụi Nước -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Mạng</label>
              <div class="input-group">
                <select
                  v-model="productData.idCongNgheMang"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Công Nghệ Mạng</option>
                  <option v-for="option in congNgheMangOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('congNgheMang')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hỗ Trợ Công Nghệ Sạc</label>
              <div class="input-group">
                <select
                  v-model="productData.hoTroCongNgheSac"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Hỗ Trợ Công Nghệ Sạc</option>
                  <option v-for="option in hoTroCongNgheSacOptions" :key="option.id" :value="option.id">
                    {{ option.tenCongNghe }}
                  </option>
                </select>
                <button
                  @click="openAddModal('hoTroCongNgheSac')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Kháng Bụi Nước</label>
              <div class="input-group">
                <select
                  v-model="productData.idChiSoKhangBuiVaNuoc"
                  class="form-control search-input"
                  :disabled="isProductSelected"
                >
                  <option value="">Chọn Chỉ Số Kháng Bụi Nước</option>
                  <option v-for="option in chiSoKhangBuiVaNuocOptions" :key="option.id" :value="option.id">
                    {{ option.chiSo }}
                  </option>
                </select>
                <button
                  @click="openAddModal('chiSoKhangBuiVaNuoc')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Phiên Bản Section -->
    <FilterTableSection title="Thêm Phiên Bản" icon="bi bi-layers">
      <div class="m-3">
        <div class="row g-4">
          <!-- RAM -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">RAM</label>
              <div class="input-group">
                <button
                  @click="toggleDropdown('ram')"
                  class="form-control search-input text-left"
                >
                  {{
                    currentVariant.selectedRams.length > 0
                      ? currentVariant.selectedRams
                          .map((id) => ramOptions.find((r) => r.id === id)?.dungLuong)
                          .filter(Boolean)
                          .join(', ') || 'Không có RAM hợp lệ'
                      : 'Chọn RAM'
                  }}
                </button>
                <div
                  v-if="dropdownOpen.ram"
                  class="dropdown-menu show"
                >
                  <label
                    v-for="ram in ramOptions"
                    :key="ram.id"
                    class="dropdown-item flex items-center"
                  >
                    <input
                      type="checkbox"
                      :value="ram.id"
                      v-model="currentVariant.selectedRams"
                      class="me-2"
                    />
                    {{ ram.dungLuong }}
                  </label>
                </div>
                <button
                  @click="openAddModal('ram')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Bộ Nhớ Trong -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Bộ Nhớ Trong</label>
              <div class="input-group">
                <button
                  @click="toggleDropdown('boNhoTrong')"
                  class="form-control search-input text-left"
                >
                  {{
                    currentVariant.selectedBoNhoTrongs.length > 0
                      ? currentVariant.selectedBoNhoTrongs
                          .map((id) => boNhoTrongOptions.find((b) => b.id === id)?.dungLuong)
                          .filter(Boolean)
                          .join(', ') || 'Không có ROM hợp lệ'
                      : 'Chọn Bộ Nhớ Trong'
                  }}
                </button>
                <div
                  v-if="dropdownOpen.boNhoTrong"
                  class="dropdown-menu show"
                >
                  <label
                    v-for="boNho in boNhoTrongOptions"
                    :key="boNho.id"
                    class="dropdown-item flex items-center"
                  >
                    <input
                      type="checkbox"
                      :value="boNho.id"
                      v-model="currentVariant.selectedBoNhoTrongs"
                      class="me-2"
                    />
                    {{ boNho.dungLuong }}
                  </label>
                </div>
                <button
                  @click="openAddModal('boNhoTrong')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Màu Sắc -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Màu Sắc</label>
              <div class="input-group">
                <button
                  @click="openColorModal"
                  class="form-control search-input text-left"
                >
                  {{
                    currentVariant.selectedMauSacs.length > 0
                      ? currentVariant.selectedMauSacs
                          .map((id) => mauSacOptions.find((m) => m.id === id)?.tenMau)
                          .filter(Boolean)
                          .join(', ') || 'Không có màu hợp lệ'
                      : 'Chọn Màu Sắc'
                  }}
                </button>
                <button
                  @click="openAddModal('mauSac')"
                  class="btn btn-action"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách biến thể -->
        <div v-if="productVariants.length > 0" class="mt-4">
          <div v-for="(group, groupIndex) in groupVariantsByRamAndRom" :key="groupIndex" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="table-count">Phiên bản {{ group.ram }}/{{ group.rom }}</span>
              <div class="action-buttons">
                <div class="filter-group me-3">
                  <label class="filter-label">Giá Chung</label>
                  <input
                    v-model="groupCommonValues[group.groupKey].price"
                    type="text"
                    placeholder="Nhập giá chung"
                    class="form-control search-input"
                    @input="updateSelectedVariants(group)"
                  />
                </div>
                <button
                  v-if="selectedVariants.length > 0"
                  @click="removeMultipleVariants"
                  class="btn btn-reset"
                >
                  <i class="bi bi-trash-fill me-2"></i>
                  Xóa {{ selectedVariants.length }} Đã Chọn
                </button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th class="text-center">
                      <input
                        type="checkbox"
                        :checked="allSelected[group.groupKey] || false"
                        @change="toggleGroupSelection(group, $event.target.checked)"
                      />
                    </th>
                    <th class="text-center">STT</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Màu Sắc</th>
                    <th>Đơn Giá</th>
                    <th>Số Lượng IMEI</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(variant, variantIndex) in group.variants" :key="variantIndex">
                    <td class="text-center">
                      <input
                        type="checkbox"
                        v-model="selectedVariants"
                        :value="group.startIndex + variantIndex"
                        @change="updateSelectedCount(group)"
                      />
                    </td>
                    <td class="text-center">{{ variantIndex + 1 }}</td>
                    <td>{{ productData.tenSanPham || 'N/A' }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span
                          class="color-swatch me-2"
                          :style="{ backgroundColor: getColorFromName(mauSacOptions.find(mau => mau.id === variant.idMauSac)?.tenMau) || '#000' }"
                        ></span>
                        {{ mauSacOptions.find(mau => mau.id === variant.idMauSac)?.tenMau || 'N/A' }}
                      </div>
                    </td>
                    <td>
                      <input
                        v-model="variant.donGia"
                        type="text"
                        class="form-control search-input"
                      />
                    </td>
                    <td class="text-center">
                      {{ variantImeis[group.startIndex + variantIndex]?.length || 0 }}
                    </td>
                    <td class="action-buttons-cell">
                      <button
                        @click="openImeiModal(group.startIndex + variantIndex)"
                        class="btn btn-sm btn-table"
                        title="Nhập IMEI"
                      >
                        <i class="bi bi-upc-scan"></i>
                      </button>
                      <button
                        @click="removeVariant(group.startIndex + variantIndex)"
                        class="btn btn-sm btn-table"
                        title="Xóa"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

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

    <!-- Modals -->
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

    <!-- Form Modal -->
    <div v-if="showFormModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm {{ currentAttributeLabel }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeFormModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="currentAttribute === 'heDieuHanh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Hệ Điều Hành</label>
                <input
                  v-model="entityData.tenHeDieuHanh"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hệ điều hành"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheManHinh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Công Nghệ Màn Hình</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập công nghệ màn hình"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'nhaSanXuat'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Nhà Sản Xuất</label>
                <input
                  v-model="entityData.tenNhaSanXuat"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên nhà sản xuất"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cumCamera'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Thông Số Camera</label>
                <input
                  v-model="entityData.thongSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'sim'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Sim</label>
                <input
                  v-model="entityData.loaiSim"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại sim"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'thietKe'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Thiết Kế</label>
                <input
                  v-model="entityData.loaiThietKe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại thiết kế"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'pin'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng Pin</label>
                <input
                  v-model="entityData.dungLuong"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng pin"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên CPU</label>
                <input
                  v-model="entityData.tenCpu"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên CPU"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'gpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên GPU</label>
                <input
                  v-model="entityData.tenGpu"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên GPU"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheMang'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Công Nghệ Mạng</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên công nghệ mạng"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroCongNgheSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Hỗ Trợ Công Nghệ Sạc</label>
                <input
                  v-model="entityData.tenCongNghe"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hỗ trợ công nghệ sạc"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'chiSoKhangBuiVaNuoc'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chỉ Số Kháng Bụi Nước</label>
                <input
                  v-model="entityData.chiSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chỉ số kháng bụi nước"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'ram'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng RAM</label>
                <input
                  v-model="entityData.dungLuong"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng RAM (ví dụ: 8GB)"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'boNhoTrong'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Dung Lượng Bộ Nhớ Trong</label>
                <input
                  v-model="entityData.dungLuong"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập dung lượng bộ nhớ trong (ví dụ: 128GB)"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'mauSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Màu Sắc</label>
                <input
                  v-model="entityData.tenMau"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên màu sắc (ví dụ: Đen)"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeFormModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="handleAddAttribute"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Selection Modal -->
    <div v-if="showColorModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chọn Màu Sắc</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeColorModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div
                v-for="mau in mauSacOptions"
                :key="mau.id"
                class="col-4"
              >
                <label class="d-flex align-items-center">
                  <input
                    type="checkbox"
                    :value="mau.id"
                    v-model="currentVariant.selectedMauSacs"
                    class="me-2"
                  />
                  <span
                    class="color-swatch me-2"
                    :style="{ backgroundColor: getColorFromName(mau.tenMau) || '#FFFFFF' }"
                  ></span>
                  <span>{{ mau.tenMau }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeColorModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="confirmColorSelection"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- IMEI Input Modal -->
    <div v-if="showImeiModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nhập IMEI</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeImeiModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="filter-label">Nhập IMEI (mỗi IMEI trên một dòng)</label>
              <textarea
                v-model="imeiInput"
                rows="5"
                class="form-control search-input"
                placeholder="Nhập IMEI, mỗi IMEI trên một dòng..."
              ></textarea>
              <div class="mt-2">
                <p
                  v-for="(imei, index) in filteredImeiList"
                  :key="index"
                  class="text-sm"
                >
                  IMEI {{ index + 1 }}: {{ imei.length }} chữ số
                  <span :class="imei.length === 15 ? 'text-success' : 'text-danger'">
                    {{ imei.length === 15 ? '(Đủ 15 số)' : '(Cần 15 số)' }}
                  </span>
                </p>
                <p v-if="!imeiInput.trim()" class="text-sm">Chưa nhập IMEI</p>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-8">
                <label class="filter-label">Nhập từ file Excel</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  @change="handleExcelImport"
                  class="form-control search-input"
                />
              </div>
              <div class="col-4">
                <label class="filter-label">Tải mẫu Excel</label>
                <button
                  @click="downloadImeiTemplate"
                  class="btn btn-action w-100"
                >
                  Tải mẫu IMEI
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-reset"
              @click="closeImeiModal"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-action"
              @click="saveImei"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>

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
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';

// Dữ liệu cứng
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
  name: 'ThemChiTietSanPham',
  components: {
    HeaderCard,
    FilterTableSection,
    NotificationModal,
    ToastNotification,
  },
  setup() {
    const toastNotification = ref(null);
    const notificationModal = ref(null);
    const isSubmitting = ref(false);
    const isLoading = ref(false);

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

    // Options
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
      filteredProductNameOptions.value = productNameOptions.value.filter((product) =>
        product.tenSanPham.toLowerCase().includes(searchTerm)
      );
      isProductSelected.value = false;
    };

    const selectProduct = (product) => {
      productData.value = { ...product };
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
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng chọn ít nhất một RAM, một Bộ Nhớ Trong và một Màu Sắc!',
          duration: 3000,
        });
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
      delete variantImeis.value[index];
      selectedVariants.value = selectedVariants.value.filter((i) => i !== index);
      validateSelections();
    };

    const removeMultipleVariants = () => {
      productVariants.value = productVariants.value.filter(
        (_, index) => !selectedVariants.value.includes(index)
      );
      selectedVariants.value.forEach((index) => {
        delete variantImeis.value[index];
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
        selectedVariants.value = [...new Set([...selectedVariants.value, ...groupIndices])];
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

    const handleExcelImport = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Giả lập xử lý file Excel
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Đã nhập file Excel (giả lập)!',
          duration: 3000,
        });
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

    const handleAddAttribute = () => {
      const newId = `new_${Date.now()}`;
      switch (currentAttribute.value) {
        case 'heDieuHanh':
          heDieuHanhOptions.value.push({ id: newId, tenHeDieuHanh: entityData.value.tenHeDieuHanh });
          break;
        case 'congNgheManHinh':
          congNgheManHinhOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'nhaSanXuat':
          nhaSanXuatOptions.value.push({ id: newId, tenNhaSanXuat: entityData.value.tenNhaSanXuat });
          break;
        case 'cumCamera':
          cumCameraOptions.value.push({ id: newId, thongSo: entityData.value.thongSo });
          break;
        case 'sim':
          simOptions.value.push({ id: newId, loaiSim: entityData.value.loaiSim });
          break;
        case 'thietKe':
          thietKeOptions.value.push({ id: newId, loaiThietKe: entityData.value.loaiThietKe });
          break;
        case 'pin':
          pinOptions.value.push({ id: newId, dungLuong: entityData.value.dungLuong });
          break;
        case 'cpu':
          cpuOptions.value.push({ id: newId, tenCpu: entityData.value.tenCpu });
          break;
        case 'gpu':
          gpuOptions.value.push({ id: newId, tenGpu: entityData.value.tenGpu });
          break;
        case 'congNgheMang':
          congNgheMangOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'hoTroCongNgheSac':
          hoTroCongNgheSacOptions.value.push({ id: newId, tenCongNghe: entityData.value.tenCongNghe });
          break;
        case 'chiSoKhangBuiVaNuoc':
          chiSoKhangBuiVaNuocOptions.value.push({ id: newId, chiSo: entityData.value.chiSo });
          break;
        case 'ram':
          ramOptions.value.push({ id: newId, dungLuong: entityData.value.dungLuong });
          break;
        case 'boNhoTrong':
          boNhoTrongOptions.value.push({ id: newId, dungLuong: entityData.value.dungLuong });
          break;
        case 'mauSac':
          mauSacOptions.value.push({ id: newId, tenMau: entityData.value.tenMau });
          break;
      }
      toastNotification.value?.addToast({
        type: 'success',
        message: `Thêm ${currentAttributeLabel.value} thành công!`,
        duration: 3000,
      });
      closeFormModal();
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
      if (addVariant()) {
        showImageSection.value = true;
        closeColorModal();
        validateSelections();
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

    const handleSubmit = () => {
      if (isSubmitting.value) return;

      if (!productData.value.tenSanPham || !productVariants.value.length) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Vui lòng nhập tên sản phẩm và thêm ít nhất một phiên bản!',
          duration: 3000,
        });
        return;
      }

      isSubmitting.value = true;
      setTimeout(() => {
        console.log('Dữ liệu gửi:', {
          productData: productData.value,
          variants: productVariants.value,
          images: colorImages.value,
          imeis: variantImeis.value,
        });
        toastNotification.value?.addToast({
          type: 'success',
          message: 'Thêm sản phẩm thành công!',
          duration: 3000,
        });
        resetForm();
        isSubmitting.value = false;
      }, 1000);
    };

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
      handleExcelImport,
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
      handleAddAttribute,
    };
  },
});
</script>

<style scoped>
/* Animations */
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

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

/* Gradient Definitions */
.gradient-custom-teal {
  background: #34d399;
}

/* Base Styles */
.product-management {
  min-height: 100vh;
}

/* Filter Label and Inputs */
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
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  flex: 1;
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
  color: white;
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
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  width: 100%;
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  animation: fadeInUp 0.3s ease-out;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(52, 211, 153, 0.1);
}

.table-responsive {
  margin-top: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
}

.table th,
.table td {
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

.table th {
  background: #f1f3f5;
  font-weight: 600;
  color: #1f3a44;
}

.table td {
  color: #1f3a44;
}

.action-buttons-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-table {
  color: #1f3a44;
  border: none;
  background: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.product-card {
  background: #f8f9fa;
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(52, 211, 153, 0.2);
}

.product-card-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.product-code {
  font-weight: 600;
  color: #34d399;
}

.product-card-body {
  padding: 1rem;
}

.image-preview {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  background: #fff;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  animation: zoomIn 0.3s ease-out;
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
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-close {
  color: #6c757d;
}

.btn-close:hover {
  color: #1f3a44;
}

.text-success {
  color: #34d399;
}

.text-danger {
  color: #dc3545;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .table th,
  .table td {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>