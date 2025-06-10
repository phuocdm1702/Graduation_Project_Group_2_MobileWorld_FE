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
                  class="dropdown-menu"
                >
                  <div
                    v-for="product in filteredProductNameOptions"
                    :key="product.id"
                    class="dropdown-item"
                    @click="selectProduct(product)"
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
                    {{ option.heDieuHanh }} {{ option.phienBan }}
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
                    {{ option.chuanManHinh }} {{ option.congNgheManHinh }}
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
                    {{ option.nhaSanXuat }}
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
                    {{ option.cameraTruoc || 'N/A' }} ({{ option.cameraSau ? option.cameraSau.split(',').slice(0, 2).join(', ') : 'N/A' }})
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
                    {{ option.cacLoaiSimHoTro }} ({{ option.soLuongSimHoTro }} sim)
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
                    {{ option.chatLieuKhung }} ({{ option.chatLieuMatLung }})
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
                    {{ option.loaiPin }} {{ option.dungLuongPin }}
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
                    {{ option.tenCpu }} ({{ option.soNhan }} lõi)
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
                    {{ option.tenCongNgheMang }}
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
                    {{ option.congSac || 'N/A' }} ({{ option.congNgheHoTro ? option.congNgheHoTro.split(',').slice(0, 2).join(', ') : 'N/A' }})
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
                    {{ option.tenChiSo }}
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
                  class="dropdown-menu"
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
                  class="dropdown-menu"
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
            <div class="flex justify-between align-items-center mb-2">
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
                      <div class="flex align-items-center">
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
                      {{
                        (variantImeis && variantImeis[group.startIndex + variantIndex])
                          ? variantImeis[group.startIndex + variantIndex].length
                          : 0
                      }}
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
                  v-model="entityData.heDieuHanh"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hệ điều hành"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Phiên Bản</label>
                <input
                  v-model="entityData.phienBan"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập phiên bản"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheManHinh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Kích Thước Màn Hình</label>
                <input
                  v-model="entityData.kichThuoc"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập kích thước màn hình"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Độ Phân Giải</label>
                <input
                  v-model="entityData.doPhanGiai"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập độ phân giải"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'nhaSanXuat'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Nhà Sản Xuất</label>
                <input
                  v-model="entityData.nhaSanXuat"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên nhà sản xuất"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'cumCamera'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Camera Trước</label>
                <input
                  v-model="entityData.cameraTruoc"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera trước"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Camera Sau</label>
                <input
                  v-model="entityData.cameraSau"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập thông số camera sau"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'sim'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Các Loại Sim Hỗ Trợ</label>
                <input
                  v-model="entityData.cacLoaiSimHoTro"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại sim"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Số Lượng Sim Hỗ Trợ</label>
                <input
                  v-model="entityData.soLuongSimHoTro"
                  type="number"
                  class="form-control search-input"
                  placeholder="Nhập số lượng sim"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'thietKe'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chất Liệu Khung</label>
                <input
                  v-model="entityData.chatLieuKhung"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chất liệu khung"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Chất Liệu Mặt Lưng</label>
                <input
                  v-model="entityData.chatLieuMatLung"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập chất liệu mặt lưng"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'pin'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Pin</label>
                <input
                  v-model="entityData.loaiPin"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập loại pin"
                />
              </div>
              <div class="col-12">
                <label class="filter-label">Dung Lượng Pin</label>
                <input
                  v-model="entityData.dungLuongPin"
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
              <div class="col-12">
                <label class="filter-label">Số Nhân</label>
                <input
                  v-model="entityData.soNhan"
                  type="number"
                  class="form-control search-input"
                  placeholder="Nhập số nhân"
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
                  v-model="entityData.tenCongNgheMang"
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
                  v-model="entityData.tenCongNgheSac"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên hỗ trợ công nghệ sạc"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'chiSoKhangBuiVaNuoc'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Chỉ Số Kháng Bụi Nước</label>
                <input
                  v-model="entityData.tenChiSo"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập tên chỉ số kháng bụi nước"
                />
              </div>
            </div>
            <div v-if="currentAttribute === 'ram'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Mã RAM</label>
                <input
                  v-model="entityData.ma"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập mã RAM"
                />
              </div>
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
                <label class="filter-label">Mã Bộ Nhớ Trong</label>
                <input
                  v-model="entityData.ma"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập mã bộ nhớ trong"
                />
              </div>
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
                <label class="filter-label">Mã Màu Sắc</label>
                <input
                  v-model="entityData.ma"
                  type="text"
                  class="form-control search-input"
                  placeholder="Nhập mã màu sắc (ví dụ: #000000 cho Đen)"
                />
              </div>
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
                <label class="flex align-items-center">
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
import AddChiTietSanPham from './ThemChiTietSanPham.js';

export default AddChiTietSanPham;
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