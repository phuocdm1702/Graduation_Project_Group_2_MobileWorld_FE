<template>
  <div class="container-fluid">
    <!-- Header -->
    <HeaderCard title="Thêm Chi Tiết Sản Phẩm" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal"
      :backgroundOpacity="0.95" />

    <!-- Main Form Section -->
    <FilterTableSection title="Thông Tin Sản Phẩm" icon="bi bi-box-seam">
      <div class="m-3">
        <div class="row g-4">
          <!-- Tên Sản Phẩm -->
          <div class="col-lg-12">
            <div class="search-group">
              <label class="filter-label">Tên Sản Phẩm</label>
              <div class="search-input-wrapper">
                <input v-model.trim="searchTerms.tenSanPham" type="text" placeholder="Nhập hoặc chọn tên sản phẩm"
                  class="form-control search-input" @focus="showDropdown('tenSanPham')"
                  @blur="delayHideDropdown('tenSanPham')" @input="filterOptions('tenSanPham')" />
                <div v-if="dropdownState.tenSanPham && filteredOptions.tenSanPham.length > 0"
                  class="dropdown-menu show">
                  <div v-for="product in filteredOptions.tenSanPham" :key="product.id" class="dropdown-item"
                    @mousedown="selectProduct(product)">
                    {{ product.tenSanPham }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hệ Điều Hành -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hệ Điều Hành</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.heDieuHanh" type="text" :placeholder="getPlaceholder('heDieuHanh')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('heDieuHanh')"
                    @blur="delayHideDropdown('heDieuHanh')" @input="filterOptions('heDieuHanh')" />
                  <div v-if="dropdownState.heDieuHanh && filteredOptions.heDieuHanh.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.heDieuHanh" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('heDieuHanh', option)">
                      {{ option.heDieuHanh }} {{ option.phienBan }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('heDieuHanh')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Công Nghệ Màn Hình -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Màn Hình</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.congNgheManHinh" type="text" :placeholder="getPlaceholder('congNgheManHinh')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('congNgheManHinh')"
                    @blur="delayHideDropdown('congNgheManHinh')" @input="filterOptions('congNgheManHinh')" />
                  <div v-if="dropdownState.congNgheManHinh && filteredOptions.congNgheManHinh.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.congNgheManHinh" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('congNgheManHinh', option)">
                      {{ option.congNgheManHinh }} {{ option.chuanManHinh }} {{ option.kichThuoc }} {{ option.doPhanGiai }}
                      {{ option.doSangToiDa }} {{ option.tanSoQuet }} {{ option.kieuManHinh }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('congNgheManHinh')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Nhà Sản Xuất -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Nhà Sản Xuất</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.nhaSanXuat" type="text" :placeholder="getPlaceholder('nhaSanXuat')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('nhaSanXuat')"
                    @blur="delayHideDropdown('nhaSanXuat')" @input="filterOptions('nhaSanXuat')" />
                  <div v-if="dropdownState.nhaSanXuat && filteredOptions.nhaSanXuat.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.nhaSanXuat" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('nhaSanXuat', option)">
                      {{ option.nhaSanXuat }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('nhaSanXuat')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Cụm Camera -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Cụm Camera</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.cumCamera" type="text" :placeholder="getPlaceholder('cumCamera')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('cumCamera')"
                    @blur="delayHideDropdown('cumCamera')" @input="filterOptions('cumCamera')" />
                  <div v-if="dropdownState.cumCamera && filteredOptions.cumCamera.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.cumCamera" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('cumCamera', option)">
                      {{ option.thongSoCameraSau }} {{ option.thongSoCameraTruoc }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('cumCamera')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Sim -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Sim</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.sim" type="text" :placeholder="getPlaceholder('sim')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('sim')"
                    @blur="delayHideDropdown('sim')" @input="filterOptions('sim')" />
                  <div v-if="dropdownState.sim && filteredOptions.sim.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.sim" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('sim', option)">
                      {{ option.soLuongSimHoTro }} {{ option.cacLoaiSimHoTro }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('sim')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Thiết Kế -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Thiết Kế</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.thietKe" type="text" :placeholder="getPlaceholder('thietKe')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('thietKe')"
                    @blur="delayHideDropdown('thietKe')" @input="filterOptions('thietKe')" />
                  <div v-if="dropdownState.thietKe && filteredOptions.thietKe.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.thietKe" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('thietKe', option)">
                      {{ option.chatLieuKhung }} {{ option.chatLieuMatLung }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('thietKe')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pin -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Pin</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.pin" type="text" :placeholder="getPlaceholder('pin')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('pin')"
                    @blur="delayHideDropdown('pin')" @input="filterOptions('pin')" />
                  <div v-if="dropdownState.pin && filteredOptions.pin.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.pin" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('pin', option)">
                      {{ option.loaiPin }} {{ option.dungLuongPin }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('pin')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- CPU -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">CPU</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.cpu" type="text" :placeholder="getPlaceholder('cpu')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('cpu')"
                    @blur="delayHideDropdown('cpu')" @input="filterOptions('cpu')" />
                  <div v-if="dropdownState.cpu && filteredOptions.cpu.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.cpu" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('cpu', option)">
                      {{ option.tenCpu }} ({{ option.soNhan }} nhân)
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('cpu')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- GPU -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">GPU</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.gpu" type="text" :placeholder="getPlaceholder('gpu')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('gpu')"
                    @blur="delayHideDropdown('gpu')" @input="filterOptions('gpu')" />
                  <div v-if="dropdownState.gpu && filteredOptions.gpu.length > 0" class="dropdown-menu show">
                    <div v-for="option in filteredOptions.gpu" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('gpu', option)">
                      {{ option.tenGpu }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('gpu')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Công Nghệ Mạng -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Công Nghệ Mạng</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.congNgheMang" type="text" :placeholder="getPlaceholder('congNgheMang')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('congNgheMang')"
                    @blur="delayHideDropdown('congNgheMang')" @input="filterOptions('congNgheMang')" />
                  <div v-if="dropdownState.congNgheMang && filteredOptions.congNgheMang.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.congNgheMang" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('congNgheMang', option)">
                      {{ option.tenCongNgheMang }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('congNgheMang')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Hỗ Trợ Công Nghệ Sạc -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hỗ Trợ Công Nghệ Sạc</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.hoTroCongNgheSac" type="text"
                    :placeholder="getPlaceholder('hoTroCongNgheSac')" :disabled="!isNewProduct"
                    class="form-control search-input" @focus="showDropdown('hoTroCongNgheSac')"
                    @blur="delayHideDropdown('hoTroCongNgheSac')" @input="filterOptions('hoTroCongNgheSac')" />
                  <div v-if="dropdownState.hoTroCongNgheSac && filteredOptions.hoTroCongNgheSac.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.hoTroCongNgheSac" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('hoTroCongNgheSac', option)">
                      {{ option.congSac }} {{ option.congNgheHoTro }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('hoTroCongNgheSac')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Kháng Bụi Nước -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Kháng Bụi Nước</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.chiSoKhangBuiVaNuoc" type="text"
                    :placeholder="getPlaceholder('chiSoKhangBuiVaNuoc')" :disabled="!isNewProduct"
                    class="form-control search-input" @focus="showDropdown('chiSoKhangBuiVaNuoc')"
                    @blur="delayHideDropdown('chiSoKhangBuiVaNuoc')" @input="filterOptions('chiSoKhangBuiVaNuoc')" />
                  <div v-if="dropdownState.chiSoKhangBuiVaNuoc && filteredOptions.chiSoKhangBuiVaNuoc.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.chiSoKhangBuiVaNuoc" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('chiSoKhangBuiVaNuoc', option)">
                      {{ option.tenChiSo }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('chiSoKhangBuiVaNuoc')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Hỗ Trợ Bộ Nhớ Ngoài -->
          <div class="col-lg-4 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Hỗ Trợ Bộ Nhớ Ngoài</label>
              <div class="input-group">
                <div class="search-input-wrapper">
                  <input v-model="searchTerms.hoTroBoNhoNgoai" type="text" :placeholder="getPlaceholder('hoTroBoNhoNgoai')"
                    :disabled="!isNewProduct" class="form-control search-input" @focus="showDropdown('hoTroBoNhoNgoai')"
                    @blur="delayHideDropdown('hoTroBoNhoNgoai')" @input="filterOptions('hoTroBoNhoNgoai')" />
                  <div v-if="dropdownState.hoTroBoNhoNgoai && filteredOptions.hoTroBoNhoNgoai.length > 0"
                    class="dropdown-menu show">
                    <div v-for="option in filteredOptions.hoTroBoNhoNgoai" :key="option.id" class="dropdown-item"
                      @mousedown="selectOption('hoTroBoNhoNgoai', option)">
                      {{ option.hoTroBoNhoNgoai }}
                    </div>
                  </div>
                </div>
                <button v-if="isNewProduct" @click="openAddModal('hoTroBoNhoNgoai')" class="btn btn-action">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Ghi Chú -->
          <div class="col-lg-12">
            <div class="filter-group">
              <label class="filter-label">Ghi Chú</label>
              <textarea v-model="productData.ghiChu" class="form-control search-input" placeholder="Nhập ghi chú"
                rows="3"></textarea>
            </div>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Form Modal -->
    <div v-if="showFormModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm {{ currentAttributeLabel }}</h5>
            <button type="button" class="btn-close" @click="closeFormModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="currentAttribute === 'heDieuHanh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Hệ Điều Hành</label>
                <input v-model="entityData.heDieuHanh" type="text" class="form-control search-input"
                  placeholder="Nhập tên hệ điều hành" />
              </div>
              <div class="col-12">
                <label class="filter-label">Phiên Bản</label>
                <input v-model="entityData.phienBan" type="text" class="form-control search-input"
                  placeholder="Nhập phiên bản" />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheManHinh'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Công Nghệ Màn Hình</label>
                <input v-model="entityData.congNgheManHinh" type="text" class="form-control search-input"
                  placeholder="Nhập công nghệ màn hình" />
              </div>
              <div class="col-12">
                <label class="filter-label">Chuẩn Màn Hình</label>
                <input v-model="entityData.chuanManHinh" type="text" class="form-control search-input"
                  placeholder="Nhập chuẩn màn hình" />
              </div>
              <div class="col-12">
                <label class="filter-label">Kích Thước</label>
                <input v-model="entityData.kichThuoc" type="text" class="form-control search-input"
                  placeholder="Nhập kích thước màn hình" />
              </div>
              <div class="col-12">
                <label class="filter-label">Độ Phân Giải</label>
                <input v-model="entityData.doPhanGiai" type="text" class="form-control search-input"
                  placeholder="Nhập độ phân giải" />
              </div>
              <div class="col-12">
                <label class="filter-label">Độ Sáng Tối Đa</label>
                <input v-model="entityData.doSangToiDa" type="text" class="form-control search-input"
                  placeholder="Nhập độ sáng tối đa" />
              </div>
              <div class="col-12">
                <label class="filter-label">Tần Số Quét</label>
                <input v-model="entityData.tanSoQuet" type="text" class="form-control search-input"
                  placeholder="Nhập tần số quét" />
              </div>
              <div class="col-12">
                <label class="filter-label">Kiểu Màn Hình</label>
                <input v-model="entityData.kieuManHinh" type="text" class="form-control search-input"
                  placeholder="Nhập kiểu màn hình" />
              </div>
            </div>
            <div v-if="currentAttribute === 'nhaSanXuat'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Nhà Sản Xuất</label>
                <input v-model="entityData.nhaSanXuat" type="text" class="form-control search-input"
                  placeholder="Nhập tên nhà sản xuất" />
              </div>
            </div>
            <div v-if="currentAttribute === 'cumCamera'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Thông Số Camera Sau</label>
                <input v-model="entityData.thongSoCameraSau" type="text" class="form-control search-input"
                  placeholder="Nhập thông số camera sau" />
              </div>
              <div class="col-12">
                <label class="filter-label">Thông Số Camera Trước</label>
                <input v-model="entityData.thongSoCameraTruoc" type="text" class="form-control search-input"
                  placeholder="Nhập thông số camera trước" />
              </div>
            </div>
            <div v-if="currentAttribute === 'sim'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Sim</label>
                <input v-model="entityData.cacLoaiSimHoTro" type="text" class="form-control search-input"
                  placeholder="Nhập loại sim" />
              </div>
              <div class="col-12">
                <label class="filter-label">Số Lượng Sim</label>
                <input v-model="entityData.soLuongSimHoTro" type="text" class="form-control search-input"
                  placeholder="Nhập số lượng sim hỗ trợ" />
              </div>
            </div>
            <div v-if="currentAttribute === 'thietKe'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chất Liệu Khung</label>
                <input v-model="entityData.chatLieuKhung" type="text" class="form-control search-input"
                  placeholder="Nhập chất liệu khung" />
              </div>
              <div class="col-12">
                <label class="filter-label">Chất Liệu Mặt Lưng</label>
                <input v-model="entityData.chatLieuMatLung" type="text" class="form-control search-input"
                  placeholder="Nhập chất liệu mặt lưng" />
              </div>
            </div>
            <div v-if="currentAttribute === 'pin'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Loại Pin</label>
                <input v-model="entityData.loaiPin" type="text" class="form-control search-input"
                  placeholder="Nhập loại pin" />
              </div>
              <div class="col-12">
                <label class="filter-label">Dung Lượng Pin</label>
                <input v-model="entityData.dungLuongPin" type="text" class="form-control search-input"
                  placeholder="Nhập dung lượng pin" />
              </div>
            </div>
            <div v-if="currentAttribute === 'cpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên CPU</label>
                <input v-model="entityData.tenCpu" type="text" class="form-control search-input"
                  placeholder="Nhập tên CPU" />
              </div>
              <div class="col-12">
                <label class="filter-label">Số Nhân</label>
                <input v-model="entityData.soNhan" type="number" class="form-control search-input"
                  placeholder="Nhập số nhân" />
              </div>
            </div>
            <div v-if="currentAttribute === 'gpu'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên GPU</label>
                <input v-model="entityData.tenGpu" type="text" class="form-control search-input"
                  placeholder="Nhập tên GPU" />
              </div>
            </div>
            <div v-if="currentAttribute === 'congNgheMang'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Tên Công Nghệ Mạng</label>
                <input v-model="entityData.tenCongNgheMang" type="text" class="form-control search-input"
                  placeholder="Nhập tên công nghệ mạng" />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroCongNgheSac'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Cổng Sạc</label>
                <input v-model="entityData.congSac" type="text" class="form-control search-input"
                  placeholder="Nhập cổng sạc" />
              </div>
              <div class="col-12">
                <label class="filter-label">Công Nghệ Sạc</label>
                <input v-model="entityData.congNgheHoTro" type="text" class="form-control search-input"
                  placeholder="Nhập công nghệ sạc" />
              </div>
            </div>
            <div v-if="currentAttribute === 'chiSoKhangBuiVaNuoc'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Chỉ Số Kháng Bụi Nước</label>
                <input v-model="entityData.tenChiSo" type="text" class="form-control search-input"
                  placeholder="Nhập chỉ số kháng bụi nước" />
              </div>
            </div>
            <div v-if="currentAttribute === 'hoTroBoNhoNgoai'" class="row g-3">
              <div class="col-12">
                <label class="filter-label">Hỗ Trợ Bộ Nhớ Ngoài</label>
                <input v-model="entityData.hoTroBoNhoNgoai" type="text" class="form-control search-input"
                  placeholder="Nhập hỗ trợ bộ nhớ ngoài" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-reset" @click="closeFormModal">
              Đóng
            </button>
            <button v-if="isNewProduct" type="button" class="btn btn-action" :disabled="isSubmitting" @click="handleAddAttribute">
              {{ isSubmitting ? 'Đang thêm...' : 'Thêm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import {
  getHeDieuHanh, addHeDieuHanh, getCongNgheManHinh, addCongNgheManHinh,
  getNhaSanXuat, addNhaSanXuat, getCumCamera, addCumCamera,
  getSim, addSim, getThietKe, addThietKe, getPin, addPin,
  getCpu, addCpu, getGpu, addGpu, getCongNgheMang, addCongNgheMang,
  getHoTroCongNgheSac, addHoTroCongNgheSac, getChiSoKhangBuiVaNuoc, addChiSoKhangBuiVaNuoc,
  getHoTroBoNhoNgoai, addHoTroBoNhoNgoai,
  getProducts,
} from '@/store/modules/products/chiTietSanPham';

export default defineComponent({
  name: 'ProductInfo',
  components: {
    HeaderCard,
    FilterTableSection,
    ToastNotification,
  },
  props: {
    productData: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:productData'],
  setup(props, { emit }) {
    const toastNotification = ref(null);
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const localProductData = ref({ ...props.productData });
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
    const hoTroBoNhoNgoaiOptions = ref([]);
    const productNameOptions = ref([]);

    const searchTerms = ref({
      tenSanPham: '',
      heDieuHanh: '',
      congNgheManHinh: '',
      nhaSanXuat: '',
      cumCamera: '',
      sim: '',
      thietKe: '',
      pin: '',
      cpu: '',
      gpu: '',
      congNgheMang: '',
      hoTroCongNgheSac: '',
      chiSoKhangBuiVaNuoc: '',
      hoTroBoNhoNgoai: '',
    });

    const dropdownState = ref({
      tenSanPham: false,
      heDieuHanh: false,
      congNgheManHinh: false,
      nhaSanXuat: false,
      cumCamera: false,
      sim: false,
      thietKe: false,
      pin: false,
      cpu: false,
      gpu: false,
      congNgheMang: false,
      hoTroCongNgheSac: false,
      chiSoKhangBuiVaNuoc: false,
      hoTroBoNhoNgoai: false,
    });

    const filteredOptions = ref({
      tenSanPham: [],
      heDieuHanh: [],
      congNgheManHinh: [],
      nhaSanXuat: [],
      cumCamera: [],
      sim: [],
      thietKe: [],
      pin: [],
      cpu: [],
      gpu: [],
      congNgheMang: [],
      hoTroCongNgheSac: [],
      chiSoKhangBuiVaNuoc: [],
      hoTroBoNhoNgoai: [],
    });

    const isNewProduct = ref(true);
    const showFormModal = ref(false);
    const currentAttribute = ref('');
    const entityData = ref({});

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
        hoTroBoNhoNgoai: 'Hỗ Trợ Bộ Nhớ Ngoài',
      };
      return labels[currentAttribute.value] || currentAttribute.value;
    });

    watch(() => props.productData, (newData) => {
      if (newData.tenSanPham === localProductData.value.tenSanPham) return;
      localProductData.value = { ...newData };
      searchTerms.value.tenSanPham = newData.tenSanPham || '';
      updateSearchTerms();
      if (productNameOptions.value.some(p => p.tenSanPham === newData.tenSanPham)) {
        filterOptions('tenSanPham');
      }
    }, { deep: true });

    watch(() => searchTerms.value.tenSanPham, (newValue) => {
      if (!newValue || newValue.trim() === '') {
        isNewProduct.value = true;
        localProductData.value = {
          ...localProductData.value,
          id: null,
          idHeDieuHanh: heDieuHanhOptions.value[0]?.id || '',
          idCongNgheManHinh: congNgheManHinhOptions.value[0]?.id || '',
          idNhaSanXuat: nhaSanXuatOptions.value[0]?.id || '',
          idCumCamera: cumCameraOptions.value[0]?.id || '',
          idSim: simOptions.value[0]?.id || '',
          idThietKe: thietKeOptions.value[0]?.id || '',
          idPin: pinOptions.value[0]?.id || '',
          idCpu: cpuOptions.value[0]?.id || '',
          idGpu: gpuOptions.value[0]?.id || '',
          idCongNgheMang: congNgheMangOptions.value[0]?.id || '',
          idHoTroCongNgheSac: hoTroCongNgheSacOptions.value[0]?.id || '',
          idChiSoKhangBuiVaNuoc: chiSoKhangBuiVaNuocOptions.value[0]?.id || '',
          idHoTroBoNhoNgoai: hoTroBoNhoNgoaiOptions.value[0]?.id || '',
          ghiChu: '',
        };
        emit('update:productData', localProductData.value);
      } else if (!filteredOptions.value.tenSanPham.some(p => p.tenSanPham === newValue)) {
        isNewProduct.value = true;
        localProductData.value = {
          ...localProductData.value,
          tenSanPham: newValue,
          id: null,
        };
        emit('update:productData', localProductData.value);
      } else {
        isNewProduct.value = false;
      }
    });

    const fetchData = async () => {
      try {
        isLoading.value = true;
        const [
          heDieuHanhRes,
          congNgheManHinhRes,
          nhaSanXuatRes,
          cumCameraRes,
          simRes,
          thietKeRes,
          pinRes,
          cpuRes,
          gpuRes,
          congNgheMangRes,
          hoTroCongNgheSacRes,
          chiSoKhangBuiVaNuocRes,
          hoTroBoNhoNgoaiRes,
          productsRes,
        ] = await Promise.all([
          getHeDieuHanh(),
          getCongNgheManHinh(),
          getNhaSanXuat(),
          getCumCamera(),
          getSim(),
          getThietKe(),
          getPin(),
          getCpu(),
          getGpu(),
          getCongNgheMang(),
          getHoTroCongNgheSac(),
          getChiSoKhangBuiVaNuoc(),
          getHoTroBoNhoNgoai(),
          getProducts(),
        ]);

        heDieuHanhOptions.value = heDieuHanhRes.data || [];
        congNgheManHinhOptions.value = congNgheManHinhRes.data || [];
        nhaSanXuatOptions.value = nhaSanXuatRes.data || [];
        cumCameraOptions.value = cumCameraRes.data || [];
        simOptions.value = simRes.data || [];
        thietKeOptions.value = thietKeRes.data || [];
        pinOptions.value = pinRes.data || [];
        cpuOptions.value = cpuRes.data || [];
        gpuOptions.value = gpuRes.data || [];
        congNgheMangOptions.value = congNgheMangRes.data || [];
        hoTroCongNgheSacOptions.value = hoTroCongNgheSacRes.data || [];
        chiSoKhangBuiVaNuocOptions.value = chiSoKhangBuiVaNuocRes.data || [];
        hoTroBoNhoNgoaiOptions.value = hoTroBoNhoNgoaiRes.data || [];
        productNameOptions.value = productsRes.data || [];

        filteredOptions.value = {
          tenSanPham: [...productNameOptions.value],
          heDieuHanh: [...heDieuHanhOptions.value],
          congNgheManHinh: [...congNgheManHinhOptions.value],
          nhaSanXuat: [...nhaSanXuatOptions.value],
          cumCamera: [...cumCameraOptions.value],
          sim: [...simOptions.value],
          thietKe: [...thietKeOptions.value],
          pin: [...pinOptions.value],
          cpu: [...cpuOptions.value],
          gpu: [...gpuOptions.value],
          congNgheMang: [...congNgheMangOptions.value],
          hoTroCongNgheSac: [...hoTroCongNgheSacOptions.value],
          chiSoKhangBuiVaNuoc: [...chiSoKhangBuiVaNuocOptions.value],
          hoTroBoNhoNgoai: [...hoTroBoNhoNgoaiOptions.value],
        };

        if (heDieuHanhOptions.value.length > 0 && !localProductData.value.idHeDieuHanh) {
          localProductData.value.idHeDieuHanh = heDieuHanhOptions.value[0].id;
          searchTerms.value.heDieuHanh = getOptionText('heDieuHanh', heDieuHanhOptions.value[0]);
        }
        if (congNgheManHinhOptions.value.length > 0 && !localProductData.value.idCongNgheManHinh) {
          localProductData.value.idCongNgheManHinh = congNgheManHinhOptions.value[0].id;
          searchTerms.value.congNgheManHinh = getOptionText('congNgheManHinh', congNgheManHinhOptions.value[0]);
        }
        if (nhaSanXuatOptions.value.length > 0 && !localProductData.value.idNhaSanXuat) {
          localProductData.value.idNhaSanXuat = nhaSanXuatOptions.value[0].id;
          searchTerms.value.nhaSanXuat = getOptionText('nhaSanXuat', nhaSanXuatOptions.value[0]);
        }
        if (cumCameraOptions.value.length > 0 && !localProductData.value.idCumCamera) {
          localProductData.value.idCumCamera = cumCameraOptions.value[0].id;
          searchTerms.value.cumCamera = getOptionText('cumCamera', cumCameraOptions.value[0]);
        }
        if (simOptions.value.length > 0 && !localProductData.value.idSim) {
          localProductData.value.idSim = simOptions.value[0].id;
          searchTerms.value.sim = getOptionText('sim', simOptions.value[0]);
        }
        if (thietKeOptions.value.length > 0 && !localProductData.value.idThietKe) {
          localProductData.value.idThietKe = thietKeOptions.value[0].id;
          searchTerms.value.thietKe = getOptionText('thietKe', thietKeOptions.value[0]);
        }
        if (pinOptions.value.length > 0 && !localProductData.value.idPin) {
          localProductData.value.idPin = pinOptions.value[0].id;
          searchTerms.value.pin = getOptionText('pin', pinOptions.value[0]);
        }
        if (cpuOptions.value.length > 0 && !localProductData.value.idCpu) {
          localProductData.value.idCpu = cpuOptions.value[0].id;
          searchTerms.value.cpu = getOptionText('cpu', cpuOptions.value[0]);
        }
        if (gpuOptions.value.length > 0 && !localProductData.value.idGpu) {
          localProductData.value.idGpu = gpuOptions.value[0].id;
          searchTerms.value.gpu = getOptionText('gpu', gpuOptions.value[0]);
        }
        if (congNgheMangOptions.value.length > 0 && !localProductData.value.idCongNgheMang) {
          localProductData.value.idCongNgheMang = congNgheMangOptions.value[0].id;
          searchTerms.value.congNgheMang = getOptionText('congNgheMang', congNgheMangOptions.value[0]);
        }
        if (hoTroCongNgheSacOptions.value.length > 0 && !localProductData.value.idHoTroCongNgheSac) {
          localProductData.value.idHoTroCongNgheSac = hoTroCongNgheSacOptions.value[0].id;
          searchTerms.value.hoTroCongNgheSac = getOptionText('hoTroCongNgheSac', hoTroCongNgheSacOptions.value[0]);
        }
        if (chiSoKhangBuiVaNuocOptions.value.length > 0 && !localProductData.value.idChiSoKhangBuiVaNuoc) {
          localProductData.value.idChiSoKhangBuiVaNuoc = chiSoKhangBuiVaNuocOptions.value[0].id;
          searchTerms.value.chiSoKhangBuiVaNuoc = getOptionText('chiSoKhangBuiVaNuoc', chiSoKhangBuiVaNuocOptions.value[0]);
        }
        if (hoTroBoNhoNgoaiOptions.value.length > 0 && !localProductData.value.idHoTroBoNhoNgoai) {
          localProductData.value.idHoTroBoNhoNgoai = hoTroBoNhoNgoaiOptions.value[0].id;
          searchTerms.value.hoTroBoNhoNgoai = getOptionText('hoTroBoNhoNgoai', hoTroBoNhoNgoaiOptions.value[0]);
        }

        emit('update:productData', localProductData.value);
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: 'Lỗi khi tải dữ liệu: ' + error.message,
          duration: 3000,
        });
        productNameOptions.value = [];
        filteredOptions.value.tenSanPham = [];
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchData);

    const showDropdown = (field) => {
      if (isNewProduct.value) {
        dropdownState.value[field] = true;
        // Reset filtered options to show all options when focusing
        switch (field) {
          case 'tenSanPham':
            filteredOptions.value[field] = [...productNameOptions.value];
            break;
          case 'heDieuHanh':
            filteredOptions.value[field] = [...heDieuHanhOptions.value];
            break;
          case 'congNgheManHinh':
            filteredOptions.value[field] = [...congNgheManHinhOptions.value];
            break;
          case 'nhaSanXuat':
            filteredOptions.value[field] = [...nhaSanXuatOptions.value];
            break;
          case 'cumCamera':
            filteredOptions.value[field] = [...cumCameraOptions.value];
            break;
          case 'sim':
            filteredOptions.value[field] = [...simOptions.value];
            break;
          case 'thietKe':
            filteredOptions.value[field] = [...thietKeOptions.value];
            break;
          case 'pin':
            filteredOptions.value[field] = [...pinOptions.value];
            break;
          case 'cpu':
            filteredOptions.value[field] = [...cpuOptions.value];
            break;
          case 'gpu':
            filteredOptions.value[field] = [...gpuOptions.value];
            break;
          case 'congNgheMang':
            filteredOptions.value[field] = [...congNgheMangOptions.value];
            break;
          case 'hoTroCongNgheSac':
            filteredOptions.value[field] = [...hoTroCongNgheSacOptions.value];
            break;
          case 'chiSoKhangBuiVaNuoc':
            filteredOptions.value[field] = [...chiSoKhangBuiVaNuocOptions.value];
            break;
          case 'hoTroBoNhoNgoai':
            filteredOptions.value[field] = [...hoTroBoNhoNgoaiOptions.value];
            break;
        }
      }
    };

    const delayHideDropdown = (field) => {
      setTimeout(() => {
        dropdownState.value[field] = false;
        // Reset search term when closing dropdown
        if (!searchTerms.value[field]) {
          const selectedOption = getSelectedOption(field);
          searchTerms.value[field] = selectedOption ? getOptionText(field, selectedOption) : '';
        }
      }, 200);
    };

    const filterOptions = (field) => {
      if (!isNewProduct.value) return;

      const searchTerm = searchTerms.value[field]?.toLowerCase().trim() || '';
      const optionsMap = {
        tenSanPham: productNameOptions.value,
        heDieuHanh: heDieuHanhOptions.value,
        congNgheManHinh: congNgheManHinhOptions.value,
        nhaSanXuat: nhaSanXuatOptions.value,
        cumCamera: cumCameraOptions.value,
        sim: simOptions.value,
        thietKe: thietKeOptions.value,
        pin: pinOptions.value,
        cpu: cpuOptions.value,
        gpu: gpuOptions.value,
        congNgheMang: congNgheMangOptions.value,
        hoTroCongNgheSac: hoTroCongNgheSacOptions.value,
        chiSoKhangBuiVaNuoc: chiSoKhangBuiVaNuocOptions.value,
        hoTroBoNhoNgoai: hoTroBoNhoNgoaiOptions.value,
      };

      // Show all options if search term is empty
      if (!searchTerm) {
        filteredOptions.value[field] = [...optionsMap[field]];
        return;
      }

      // Filter options based on search term
      filteredOptions.value[field] = optionsMap[field].filter((option) => {
        const text = getOptionText(field, option).toLowerCase();
        return text.includes(searchTerm);
      });
    };

    const getOptionText = (field, option) => {
      if (!option) return '';
      switch (field) {
        case 'tenSanPham':
          return option.tenSanPham || '';
        case 'heDieuHanh':
          return `${option.heDieuHanh || ''} ${option.phienBan || ''}`.trim();
        case 'congNgheManHinh':
          return `${option.congNgheManHinh || ''} ${option.chuanManHinh || ''} ${option.kichThuoc || ''} ${option.doPhanGiai || ''} ${option.doSangToiDa || ''} ${option.tanSoQuet || ''} ${option.kieuManHinh || ''}`.trim();
        case 'nhaSanXuat':
          return option.nhaSanXuat || '';
        case 'cumCamera':
          return `${option.thongSoCameraSau || ''} ${option.thongSoCameraTruoc || ''}`.trim();
        case 'sim':
          return `${option.soLuongSimHoTro || ''} ${option.cacLoaiSimHoTro || ''}`.trim();
        case 'thietKe':
          return `${option.chatLieuKhung || ''} ${option.chatLieuMatLung || ''}`.trim();
        case 'pin':
          return `${option.loaiPin || ''} ${option.dungLuongPin || ''}`.trim();
        case 'cpu':
          return `${option.tenCpu || ''} (${option.soNhan || ''} nhân)`.trim();
        case 'gpu':
          return option.tenGpu || '';
        case 'congNgheMang':
          return option.tenCongNgheMang || '';
        case 'hoTroCongNgheSac':
          return `${option.congSac || ''} ${option.congNgheHoTro || ''}`.trim();
        case 'chiSoKhangBuiVaNuoc':
          return option.tenChiSo || '';
        case 'hoTroBoNhoNgoai':
          return option.hoTroBoNhoNgoai || '';
        default:
          return '';
      }
    };

    const getPlaceholder = (field) => {
      const selectedOption = getSelectedOption(field);
      return selectedOption ? getOptionText(field, selectedOption) : `Tìm hoặc chọn ${currentAttributeLabel.value[field] || field}`;
    };

    const getSelectedOption = (field) => {
      const optionsMap = {
        heDieuHanh: heDieuHanhOptions.value,
        congNgheManHinh: congNgheManHinhOptions.value,
        nhaSanXuat: nhaSanXuatOptions.value,
        cumCamera: cumCameraOptions.value,
        sim: simOptions.value,
        thietKe: thietKeOptions.value,
        pin: pinOptions.value,
        cpu: cpuOptions.value,
        gpu: gpuOptions.value,
        congNgheMang: congNgheMangOptions.value,
        hoTroCongNgheSac: hoTroCongNgheSacOptions.value,
        chiSoKhangBuiVaNuoc: chiSoKhangBuiVaNuocOptions.value,
        hoTroBoNhoNgoai: hoTroBoNhoNgoaiOptions.value,
      };
      const fieldMap = {
        heDieuHanh: 'idHeDieuHanh',
        congNgheManHinh: 'idCongNgheManHinh',
        nhaSanXuat: 'idNhaSanXuat',
        cumCamera: 'idCumCamera',
        sim: 'idSim',
        thietKe: 'idThietKe',
        pin: 'idPin',
        cpu: 'idCpu',
        gpu: 'idGpu',
        congNgheMang: 'idCongNgheMang',
        hoTroCongNgheSac: 'idHoTroCongNgheSac',
        chiSoKhangBuiVaNuoc: 'idChiSoKhangBuiVaNuoc',
        hoTroBoNhoNgoai: 'idHoTroBoNhoNgoai',
      };
      return optionsMap[field]?.find(option => option.id === localProductData.value[fieldMap[field]]);
    };

    const updateSearchTerms = () => {
      const fields = [
        'heDieuHanh', 'congNgheManHinh', 'nhaSanXuat', 'cumCamera', 'sim',
        'thietKe', 'pin', 'cpu', 'gpu', 'congNgheMang', 'hoTroCongNgheSac',
        'chiSoKhangBuiVaNuoc', 'hoTroBoNhoNgoai'
      ];
      fields.forEach(field => {
        const selectedOption = getSelectedOption(field);
        searchTerms.value[field] = selectedOption ? getOptionText(field, selectedOption) : '';
      });
    };

    const selectProduct = (product) => {
      isNewProduct.value = !product.id;
      localProductData.value = {
        ...localProductData.value,
        id: product.id || null,
        tenSanPham: product.tenSanPham,
        idHeDieuHanh: product.idHeDieuHanh || (heDieuHanhOptions.value[0]?.id || ''),
        idCongNgheManHinh: product.idCongNgheManHinh || (congNgheManHinhOptions.value[0]?.id || ''),
        idNhaSanXuat: product.idNhaSanXuat || (nhaSanXuatOptions.value[0]?.id || ''),
        idCumCamera: product.idCumCamera || (cumCameraOptions.value[0]?.id || ''),
        idSim: product.idSim || (simOptions.value[0]?.id || ''),
        idThietKe: product.idThietKe || (thietKeOptions.value[0]?.id || ''),
        idPin: product.idPin || (pinOptions.value[0]?.id || ''),
        idCpu: product.idCpu || (cpuOptions.value[0]?.id || ''),
        idGpu: product.idGpu || (gpuOptions.value[0]?.id || ''),
        idCongNgheMang: product.idCongNgheMang || (congNgheMangOptions.value[0]?.id || ''),
        idHoTroCongNgheSac: product.idHoTroCongNgheSac || (hoTroCongNgheSacOptions.value[0]?.id || ''),
        idChiSoKhangBuiVaNuoc: product.idChiSoKhangBuiVaNuoc || (chiSoKhangBuiVaNuocOptions.value[0]?.id || ''),
        idHoTroBoNhoNgoai: product.idHoTroBoNhoNgoai || (hoTroBoNhoNgoaiOptions.value[0]?.id || ''),
        ghiChu: product.ghiChu || '',
      };
      searchTerms.value.tenSanPham = product.tenSanPham;
      updateSearchTerms();
      dropdownState.value.tenSanPham = false;
      emit('update:productData', localProductData.value);
      toastNotification.value?.addToast({
        type: 'success',
        message: 'Đã chọn sản phẩm: ' + product.tenSanPham,
        duration: 3000,
      });
    };

    const selectOption = (field, option) => {
      if (!isNewProduct.value) return;
      const fieldMap = {
        heDieuHanh: 'idHeDieuHanh',
        congNgheManHinh: 'idCongNgheManHinh',
        nhaSanXuat: 'idNhaSanXuat',
        cumCamera: 'idCumCamera',
        sim: 'idSim',
        thietKe: 'idThietKe',
        pin: 'idPin',
        cpu: 'idCpu',
        gpu: 'idGpu',
        congNgheMang: 'idCongNgheMang',
        hoTroCongNgheSac: 'idHoTroCongNgheSac',
        chiSoKhangBuiVaNuoc: 'idChiSoKhangBuiVaNuoc',
        hoTroBoNhoNgoai: 'idHoTroBoNhoNgoai',
      };
      if (fieldMap[field]) {
        localProductData.value[fieldMap[field]] = option.id;
        searchTerms.value[field] = getOptionText(field, option);
        dropdownState.value[field] = false;
        emit('update:productData', localProductData.value);
        toastNotification.value?.addToast({
          type: 'success',
          message: `Đã chọn ${currentAttributeLabel.value[field] || field}: ${searchTerms.value[field]}`,
          duration: 3000,
        });
      }
    };

    const openAddModal = (attribute) => {
      if (!isNewProduct.value) {
        toastNotification.value?.addToast({
          type: 'info',
          message: 'Không thể thêm thuộc tính cho sản phẩm đã tồn tại.',
          duration: 3000,
        });
        return;
      }
      currentAttribute.value = attribute;
      entityData.value = {};
      showFormModal.value = true;
    };

    const closeFormModal = () => {
      showFormModal.value = false;
      currentAttribute.value = '';
      entityData.value = {};
    };

    const validateEntityData = () => {
      const requiredFields = {
        heDieuHanh: ['heDieuHanh', 'phienBan'],
        congNgheManHinh: [
          'congNgheManHinh',
          'chuanManHinh',
          'kichThuoc',
          'doPhanGiai',
          'doSangToiDa',
          'tanSoQuet',
          'kieuManHinh',
        ],
        nhaSanXuat: ['nhaSanXuat'],
        cumCamera: ['thongSoCameraSau', 'thongSoCameraTruoc'],
        sim: ['cacLoaiSimHoTro', 'soLuongSimHoTro'],
        thietKe: ['chatLieuKhung', 'chatLieuMatLung'],
        pin: ['loaiPin', 'dungLuongPin'],
        cpu: ['tenCpu', 'soNhan'],
        gpu: ['tenGpu'],
        congNgheMang: ['tenCongNgheMang'],
        hoTroCongNgheSac: ['congSac', 'congNgheHoTro'],
        chiSoKhangBuiVaNuoc: ['tenChiSo'],
        hoTroBoNhoNgoai: ['hoTroBoNhoNgoai'],
      };

      const fields = requiredFields[currentAttribute.value] || [];
      const emptyFields = fields.filter(field => {
        const val = entityData.value[field];
        return val === undefined || val === null || (typeof val === 'string' && !val.trim());
      });

      if (emptyFields.length > 0) {
        const fieldLabels = {
          heDieuHanh: 'Tên Hệ Điều Hành',
          phienBan: 'Phiên Bản',
          congNgheManHinh: 'Công Nghệ Màn Hình',
          chuanManHinh: 'Chuẩn Màn Hình',
          kichThuoc: 'Kích Thước',
          doPhanGiai: 'Độ Phân Giải',
          doSangToiDa: 'Độ Sáng Tối Đa',
          tanSoQuet: 'Tần Số Quét',
          kieuManHinh: 'Kiểu Màn Hình',
          nhaSanXuat: 'Tên Nhà Sản Xuất',
          thongSoCameraSau: 'Thông Số Camera Sau',
          thongSoCameraTruoc: 'Thông Số Camera Trước',
          cacLoaiSimHoTro: 'Loại Sim',
          soLuongSimHoTro: 'Số Lượng Sim',
          chatLieuKhung: 'Chất Liệu Khung',
          chatLieuMatLung: 'Chất Liệu Mặt Lưng',
          loaiPin: 'Loại Pin',
          dungLuongPin: 'Dung Lượng Pin',
          tenCpu: 'Tên CPU',
          soNhan: 'Số Nhân',
          tenGpu: 'Tên GPU',
          tenCongNgheMang: 'Tên Công Nghệ Mạng',
          congSac: 'Cổng Sạc',
          congNgheHoTro: 'Công Nghệ Sạc',
          tenChiSo: 'Chỉ Số Kháng Bụi Nước',
          hoTroBoNhoNgoai: 'Hỗ Trợ Bộ Nhớ Ngoài',
        };
        const emptyFieldLabels = emptyFields.map(field => fieldLabels[field] || field);
        toastNotification.value?.addToast({
          type: 'warning',
          message: `Vui lòng nhập ${emptyFieldLabels.join(', ')}!`,
          duration: 3000,
        });
        return false;
      }
      return true;
    };

    const handleAddAttribute = async () => {
      if (isSubmitting.value) return;
      if (!validateEntityData()) return;
      isSubmitting.value = true;
      try {
        let response;
        // Bỏ phần tạo newId tạm thời
        const data = { ...entityData.value };

        switch (currentAttribute.value) {
          case 'heDieuHanh':
            response = await addHeDieuHanh(data);
            // Lấy ID từ response API
            const newItem = response.data;
            heDieuHanhOptions.value.push(newItem);
            localProductData.value.idHeDieuHanh = newItem.id; // Sử dụng ID thực từ response
            searchTerms.value.heDieuHanh = `${newItem.heDieuHanh} ${newItem.phienBan}`.trim();
            filteredOptions.value.heDieuHanh.push(newItem);
            break;

          case 'congNgheManHinh':
            response = await addCongNgheManHinh(data);
            const newItemCnh = response.data;
            congNgheManHinhOptions.value.push(newItemCnh);
            localProductData.value.idCongNgheManHinh = newItemCnh.id;
            searchTerms.value.congNgheManHinh = `${newItemCnh.congNgheManHinh} ${newItemCnh.chuanManHinh} ${newItemCnh.kichThuoc} ${newItemCnh.doPhanGiai} ${newItemCnh.doSangToiDa} ${newItemCnh.tanSoQuet} ${newItemCnh.kieuManHinh}`.trim();
            filteredOptions.value.congNgheManHinh.push(newItemCnh);
            break;
          case 'nhaSanXuat':
            response = await addNhaSanXuat(data);
            const newItemNsx = response.data;
            nhaSanXuatOptions.value.push(newItemNsx);
            localProductData.value.idNhaSanXuat = newItemNsx.id;
            searchTerms.value.nhaSanXuat = newItemNsx.nhaSanXuat;
            filteredOptions.value.nhaSanXuat.push(newItemNsx);
            break;
          case 'cumCamera':
            response = await addCumCamera(data);
            const newItemCc = response.data;
            cumCameraOptions.value.push(newItemCc);
            localProductData.value.idCumCamera = newItemCc.id;
            searchTerms.value.cumCamera = `${newItemCc.thongSoCameraSau} ${newItemCc.thongSoCameraTruoc}`.trim();
            filteredOptions.value.cumCamera.push(newItemCc);
            break;
          case 'sim':
            response = await addSim(data);
            const newItemSim = response.data;
            simOptions.value.push(newItemSim);
            localProductData.value.idSim = newItemSim.id;
            searchTerms.value.sim = `${newItemSim.soLuongSimHoTro} ${newItemSim.cacLoaiSimHoTro}`.trim();
            filteredOptions.value.sim.push(newItemSim);
            break;
          case 'thietKe':
            response = await addThietKe(data);
            const newItemTk = response.data;
            thietKeOptions.value.push(newItemTk);
            localProductData.value.idThietKe = newItemTk.id;
            searchTerms.value.thietKe = `${newItemTk.chatLieuKhung} ${newItemTk.chatLieuMatLung}`.trim();
            filteredOptions.value.thietKe.push(newItemTk);
            break;
          case 'pin':
            response = await addPin(data);
            const newItemPin = response.data;
            pinOptions.value.push(newItemPin);
            localProductData.value.idPin = newItemPin.id;
            searchTerms.value.pin = `${newItemPin.loaiPin} ${newItemPin.dungLuongPin}`.trim();
            filteredOptions.value.pin.push(newItemPin);
            break;
          case 'cpu':
            response = await addCpu(data);
            const newItemCpu = response.data;
            cpuOptions.value.push({ id: newItemCpu.id, tenCpu: newItemCpu.tenCpu, soNhan: newItemCpu.soNhan });
            localProductData.value.idCpu = newItemCpu.id;
            searchTerms.value.cpu = `${newItemCpu.tenCpu} (${newItemCpu.soNhan} nhân)`.trim();
            filteredOptions.value.cpu.push(newItemCpu);
            break;
          case 'gpu':
            response = await addGpu(data);
            const newItemGpu = response.data;
            gpuOptions.value.push(newItemGpu);
            localProductData.value.idGpu = newItemGpu.id;
            searchTerms.value.gpu = newItemGpu.tenGpu;
            filteredOptions.value.gpu.push(newItemGpu);
            break;
          case 'congNgheMang':
            response = await addCongNgheMang(data);
            const newItemCnm = response.data;
            congNgheMangOptions.value.push(newItemCnm);
            localProductData.value.idCongNgheMang = newItemCnm.id;
            searchTerms.value.congNgheMang = newItemCnm.tenCongNgheMang;
            filteredOptions.value.congNgheMang.push(newItemCnm);
            break;
          case 'hoTroCongNgheSac':
            response = await addHoTroCongNgheSac(data);
            const newItemHtcns = response.data;
            hoTroCongNgheSacOptions.value.push(newItemHtcns);
            localProductData.value.idHoTroCongNgheSac = newItemHtcns.id;
            searchTerms.value.hoTroCongNgheSac = `${newItemHtcns.congSac} ${newItemHtcns.congNgheHoTro}`.trim();
            filteredOptions.value.hoTroCongNgheSac.push(newItemHtcns);
            break;
          case 'chiSoKhangBuiVaNuoc':
            response = await addChiSoKhangBuiVaNuoc(data);
            const newItemCskbn = response.data;
            chiSoKhangBuiVaNuocOptions.value.push(newItemCskbn);
            localProductData.value.idChiSoKhangBuiVaNuoc = newItemCskbn.id;
            searchTerms.value.chiSoKhangBuiVaNuoc = newItemCskbn.tenChiSo;
            filteredOptions.value.chiSoKhangBuiVaNuoc.push(newItemCskbn);
            break;
          case 'hoTroBoNhoNgoai':
            response = await addHoTroBoNhoNgoai(data);
            const newItemHtbnn = response.data;
            hoTroBoNhoNgoaiOptions.value.push(newItemHtbnn);
            localProductData.value.idHoTroBoNhoNgoai = newItemHtbnn.id;
            searchTerms.value.hoTroBoNhoNgoai = newItemHtbnn.hoTroBoNhoNgoai;
            filteredOptions.value.hoTroBoNhoNgoai.push(newItemHtbnn);
            break;
        }
        toastNotification.value?.addToast({
          type: 'success', 
          message: `Thêm ${currentAttributeLabel.value} thành công!`,
          duration: 3000,
        });
        emit('update:productData', localProductData.value);
        closeFormModal();
      } catch (error) {
        toastNotification.value?.addToast({
          type: 'error',
          message: `Lỗi khi thêm ${currentAttributeLabel.value}: ${error.message}`,
          duration: 3000, 
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      toastNotification,
      productData: localProductData,
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
      hoTroBoNhoNgoaiOptions,
      productNameOptions,
      searchTerms,
      dropdownState,
      filteredOptions,
      isNewProduct,
      isLoading,
      isSubmitting,
      showFormModal,
      currentAttribute,
      currentAttributeLabel,
      entityData,
      showDropdown,
      delayHideDropdown,
      filterOptions,
      selectProduct,
      selectOption,
      openAddModal,
      closeFormModal,
      handleAddAttribute,
      getPlaceholder,
    };
  },
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

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

.gradient-custom-teal {
  background: #34d399;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.search-group,
.filter-group {
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
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.search-input:disabled {
  background: #e9ecef;
  cursor: not-allowed;
}

.form-control {
  padding: 7px 14px;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .search-input-wrapper {
  flex: 1;
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-action:disabled {
  background: #a3e4d7;
  cursor: not-allowed;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 250px; /* Increased max height */
  overflow-y: auto;
  animation: fadeInUp 0.3s ease-out;
  scrollbar-width: thin;
  scrollbar-color: #34d399 #f8f9fa;
}

.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #34d399;
  border-radius: 6px;
}

.dropdown-item {
  white-space: normal; /* Allow text wrapping */
  word-break: break-word;
  padding: 8px 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #1f3a44;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #16a34a;
}

.dropdown-item:active {
  background: rgba(52, 211, 153, 0.2);
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

.text-info {
  color: #3498db;
}
</style>