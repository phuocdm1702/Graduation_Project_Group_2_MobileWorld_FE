<!-- src/views/Hoadon.vue -->
<template>
  <div class="container-fluid py-4 invoice-management">
    <HeaderCard
      title="Quản Lý Hóa Đơn"
      badgeText="Hệ Thống POS"
      titleColor="#002962"
      badgeClass="gradient-primary"
      :backgroundOpacity="0.95"
    />

    <!-- Filter Section -->
    <FilterTableSection title="Bộ Lọc Tìm Kiếm" icon="bi bi-funnel">
      <div class="m-3">
        <!-- Search Row -->
        <div class="row g-3">
          <div class="col-lg-4 col-md-6">
            <div class="search-group">
              <label class="filter-label">Tìm kiếm</label>
              <div class="search-input-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  placeholder="Mã hóa đơn, khách hàng, SĐT..."
                  :value="keyword"
                  @input="debouncedSearch($event.target.value)"
                />
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="filter-group">
              <label class="filter-label">Loại đơn hàng</label>
              <select v-model="selectedOrderType" class="form-select filter-select">
                <option value="">Tất cả loại đơn</option>
                <option value="online">Online</option>
                <option value="trực tiếp">Trực tiếp</option>
              </select>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="filter-group">
              <label class="filter-label">Khoảng thời gian</label>
              <div class="date-range-wrapper">
                <input
                  type="date"
                  v-model="startDate"
                  class="form-control date-input"
                  placeholder="Từ ngày"
                />
                <span class="date-separator">đến</span>
                <input
                  type="date"
                  v-model="endDate"
                  class="form-control date-input"
                  placeholder="Đến ngày"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Price Range Row -->
        <div class="row g-3 mb-3">
          <div class="col-lg-6">
            <div class="filter-group">
              <label class="filter-label">Khoảng giá trị</label>
              <div class="price-range-wrapper">
                <input
                  type="number"
                  v-model.number="minAmount"
                  class="form-control price-input"
                  placeholder="Giá tối thiểu"
                />
                <span class="price-separator">-</span>
                <input
                  type="number"
                  v-model.number="maxAmount"
                  class="form-control price-input"
                  placeholder="Giá tối đa"
                />
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="filter-stats">
              <div class="stat-item">
                <span class="stat-label">Tổng số hóa đơn:</span>
                <span class="stat-value">{{ filteredInvoices.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Tổng giá trị:</span>
                <span class="stat-value text-success">{{ formatPrice(totalValue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <button class="btn btn-reset" @click="resetFilters">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Đặt lại bộ lọc
          </button>

          <div class="action-buttons">
            <button class="btn btn-action" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Xuất Excel
            </button>
            <button class="btn btn-action" @click="scanQR">
              <i class="bi bi-qr-code me-2"></i>
              Quét QR
            </button>
            <router-link to="/create-hoa-don" class="btn btn-action">
              <i class="bi bi-plus-circle me-2"></i>
              Tạo Hóa Đơn
            </router-link>
          </div>
        </div>
      </div>
    </FilterTableSection>

    <!-- Tab Navigation -->
    <div class="tab-section mb-4">
      <ul class="nav nav-tabs invoice-tabs">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ 'active': activeTab === 'all' }"
            @click="setActiveTab('all')"
          >
            <i class="bi bi-receipt me-2"></i>
            Tất cả hóa đơn
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ 'active': activeTab === 'in-store' }"
            @click="setActiveTab('in-store')"
          >
            <i class="bi bi-shop me-2"></i>
            Hóa đơn tại quầy
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ 'active': activeTab === 'online' }"
            @click="setActiveTab('online')"
          >
            <i class="bi bi-globe me-2"></i>
            Hóa đơn online
          </button>
        </li>
      </ul>
    </div>

    <!-- Status Filter Section -->
    <FilterTableSection title="Bộ Lọc Trạng Thái Hóa Đơn" icon="bi bi-funnel">
      <div class="status-badge d-flex gap-3 m-3" style="width: max-content;">
        <button
          type="button"
          class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Chờ xác nhận')"
        >
          Chờ xác nhận
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning"
            v-if="statusCounts['Chờ xác nhận']"
          >
            {{ statusCounts['Chờ xác nhận'] > 99 ? '99+' : statusCounts['Chờ xác nhận'] }}
            <span class="visually-hidden">hóa đơn chờ xác nhận</span>
          </span>
        </button>
        <button
          type="button"
          class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Chờ giao hàng')"
        >
          Chờ giao hàng
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning"
            v-if="statusCounts['Chờ giao hàng']"
          >
            {{ statusCounts['Chờ giao hàng'] > 99 ? '99+' : statusCounts['Chờ giao hàng'] }}
            <span class="visually-hidden">hóa đơn chờ giao hàng</span>
          </span>
        </button>
        <button
          type="button"
          class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Đang giao')"
        >
          Đang giao
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning"
            v-if="statusCounts['Đang giao']"
          >
            {{ statusCounts['Đang giao'] > 99 ? '99+' : statusCounts['Đang giao'] }}
            <span class="visually-hidden">hóa đơn đang giao</span>
          </span>
        </button>
        <button
          type="button"
          class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Hoàn thành')"
        >
          Hoàn thành
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
            v-if="statusCounts['Hoàn thành']"
          >
            {{ statusCounts['Hoàn thành'] > 99 ? '99+' : statusCounts['Hoàn thành'] }}
            <span class="visually-hidden">hóa đơn hoàn thành</span>
          </span>
        </button>
        <button
          type="button"
          class="btn btn-outline-primary position-relative"
          @click="setActiveTabByStatus('Đã hủy')"
        >
          Đã hủy
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            v-if="statusCounts['Đã hủy']"
          >
            {{ statusCounts['Đã hủy'] > 99 ? '99+' : statusCounts['Đã hủy'] }}
            <span class="visually-hidden">hóa đơn đã hủy</span>
          </span>
        </button>
      </div>
    </FilterTableSection>

    <!-- Table Section -->
    <FilterTableSection title="Danh Sách Hóa Đơn" icon="bi bi-table">
      <div class="table-header">
        <div class="table-title-wrapper">
          <span class="table-count">{{ filteredInvoices.length }} hóa đơn</span>
        </div>
        <div class="table-controls">
          <div class="view-toggle">
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'table', 'btn-outline-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'"
            >
              <i class="bi bi-table"></i>
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': viewMode === 'card', 'btn-outline-secondary': viewMode !== 'card' }"
              @click="viewMode = 'card'"
            >
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-body">
        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <DataTable title="" :headers="headers" :data="filteredInvoices" :pageSizeOptions="[5, 10]">
            <template #code="{ item }">
              <div class="code-cell">
                <span class="code-text">{{ item.code }}</span>
                <small class="code-date">{{ item.createdAt }}</small>
              </div>
            </template>

            <template #employee="{ item }">
              <div class="employee-cell">
                <div class="employee-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
                <span class="employee-name">{{ item.employee }}</span>
              </div>
            </template>

            <template #customer="{ item }">
              <div class="customer-cell">
                <div class="customer-name">{{ item.customer }}</div>
                <div class="customer-phone">{{ item.phone }}</div>
              </div>
            </template>

            <template #total="{ item }">
              <div class="amount-cell">
                <div class="total-amount">{{ formatPrice(item.total) }}</div>
                <div class="discount-info" v-if="item.discount > 0">
                  <small class="text-muted">Giảm: {{ formatPrice(item.discount) }}</small>
                </div>
              </div>
            </template>

            <template #type="{ item }">
              <span class="type-badge" :class="getTypeBadgeClass(item.type)">
                <i :class="getTypeIcon(item.type)" class="me-1"></i>
                {{ item.type }}
              </span>
            </template>

            <template #status="{ item }">
              <span class="status-badge" :class="getStatusBadgeClass(item.status)">
                <i :class="getStatusIcon(item.status)" class="me-1"></i>
                {{ item.status }}
              </span>
            </template>

            <template #actions="{ item }">
              <div class="action-buttons-cell">
                <button class="btn btn-sm btn-table" @click="viewInvoice(item)" title="Xem chi tiết">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" @click="editInvoice(item)" title="Xuất Hóa Đơn">
                  <i class="bi bi-printer-fill"></i>
                </button>
                <button
                  class="btn btn-sm btn-table"
                  @click="confirmDeleteInvoice(item)"
                  title="Tải QR"
                >
                  <i class="bi bi-qr-code"></i>
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Card View -->
        <div v-else class="card-grid">
          <div v-for="invoice in paginatedInvoices" :key="invoice.id" class="invoice-card">
            <div class="invoice-card-header">
              <div class="invoice-code">{{ invoice.code }}</div>
              <span class="status-badge" :class="getStatusBadgeClass(invoice.status)">
                {{ invoice.status }}
              </span>
            </div>

            <div class="invoice-card-body">
              <div class="customer-info">
                <div class="customer-name">{{ invoice.customer }}</div>
                <div class="customer-phone">{{ invoice.phone }}</div>
              </div>

              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Nhân viên:</span>
                  <span class="detail-value">{{ invoice.employee }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Loại đơn:</span>
                  <span class="type-badge" :class="getTypeBadgeClass(invoice.type)">
                    {{ invoice.type }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ngày tạo:</span>
                  <span class="detail-value">{{ invoice.createdAt }}</span>
                </div>
              </div>

              <div class="invoice-amounts">
                <div class="total-amount">{{ formatPrice(invoice.total) }}</div>
                <div class="amount-details">
                  <small class="text-muted">Giảm: {{ formatPrice(invoice.discount) }}</small>
                  <small class="text-muted">Phí: {{ formatPrice(invoice.fee) }}</small>
                </div>
              </div>
            </div>

            <div class="invoice-card-actions">
              <button class="btn btn-sm btn-view" @click="viewInvoice(invoice)">
                <i class="bi bi-eye me-1"></i>Xem
              </button>
              <button class="btn btn-sm btn-edit" @click="editInvoice(invoice)">
                <i class="bi bi-pencil me-1"></i>Sửa
              </button>
              <button class="btn btn-sm btn-delete" @click="confirmDeleteInvoice(invoice)">
                <i class="bi bi-trash me-1"></i>Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination for Card View -->
        <div v-if="viewMode === 'card'" class="card-pagination">
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import NotificationModal from '@/components/common/NotificationModal.vue';
import ToastNotification from '@/components/common/ToastNotification.vue';
import HeaderCard from '@/components/common/HeaderCard.vue';
import FilterTableSection from '@/components/common/FilterTableSection.vue';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const router = useRouter();

// State
const keyword = ref('');
const selectedOrderType = ref('');
const minAmount = ref(null);
const maxAmount = ref(null);
const startDate = ref('');
const endDate = ref('');
const viewMode = ref('table');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const activeTab = ref('all'); // Tab for in-store/online/all

// Sample data
const invoices = ref([
  {
    id: 1,
    code: 'HD001',
    employee: 'Nguyễn Văn Nam',
    customer: 'Nguyễn Văn A',
    phone: '0123456789',
    total: 25000000,
    discount: 2500000,
    fee: 500000,
    createdAt: '22/01/2024',
    type: 'Online',
    status: 'Chờ xác nhận',
  },
  {
    id: 2,
    code: 'HD002',
    employee: 'Trần Thị Lan',
    customer: 'Trần Thị B',
    phone: '0987654321',
    total: 15000000,
    discount: 1500000,
    fee: 300000,
    createdAt: '23/01/2024',
    type: 'Trực tiếp',
    status: 'Chờ giao hàng',
  },
  {
    id: 3,
    code: 'HD003',
    employee: 'Lê Văn Minh',
    customer: 'Phạm Văn C',
    phone: '0369874521',
    total: 8500000,
    discount: 850000,
    fee: 200000,
    createdAt: '24/01/2024',
    type: 'Online',
    status: 'Đang giao',
  },
  {
    id: 4,
    code: 'HD004',
    employee: 'Hoàng Thị Mai',
    customer: 'Vũ Thị D',
    phone: '0147258369',
    total: 32000000,
    discount: 3200000,
    fee: 650000,
    createdAt: '25/01/2024',
    type: 'Trực tiếp',
    status: 'Hoàn thành',
  },
  {
    id: 5,
    code: 'HD005',
    employee: 'Đặng Văn Hùng',
    customer: 'Bùi Văn E',
    phone: '0789123456',
    total: 18750000,
    discount: 1875000,
    fee: 375000,
    createdAt: '26/01/2024',
    type: 'Online',
    status: 'Đã hủy',
  },
  {
    id: 6,
    code: 'HD006',
    employee: 'Nguyễn Văn Nam',
    customer: 'Nguyễn Văn A',
    phone: '0123456789',
    total: 25000000,
    discount: 2500000,
    fee: 500000,
    createdAt: '22/01/2024',
    type: 'Online',
    status: 'Chờ xác nhận',
  },
  {
    id: 7,
    code: 'HD007',
    employee: 'Trần Thị Lan',
    customer: 'Trần Thị B',
    phone: '0987654321',
    total: 15000000,
    discount: 1500000,
    fee: 300000,
    createdAt: '23/01/2024',
    type: 'Trực tiếp',
    status: 'Chờ xác nhận',
  },
  {
    id: 8,
    code: 'HD008',
    employee: 'Lê Văn Minh',
    customer: 'Phạm Văn C',
    phone: '0369874521',
    total: 8500000,
    discount: 850000,
    fee: 200000,
    createdAt: '24/01/2024',
    type: 'Online',
    status: 'Hoàn thành',
  },
  {
    id: 9,
    code: 'HD009',
    employee: 'Hoàng Thị Mai',
    customer: 'Vũ Thị D',
    phone: '0147258369',
    total: 32000000,
    discount: 3200000,
    fee: 650000,
    createdAt: '25/01/2024',
    type: 'Trực tiếp',
    status: 'Hoàn thành',
  },
  {
    id: 10,
    code: 'HD010',
    employee: 'Đặng Văn Hùng',
    customer: 'Bùi Văn E',
    phone: '0789123456',
    total: 18750000,
    discount: 1875000,
    fee: 375000,
    createdAt: '26/01/2024',
    type: 'Online',
    status: 'Đã hủy',
  },
  {
    id: 11,
    code: 'HD011',
    employee: 'Nguyễn Văn Nam',
    customer: 'Nguyễn Văn A',
    phone: '0123456789',
    total: 25000000,
    discount: 2500000,
    fee: 500000,
    createdAt: '22/01/2024',
    type: 'Online',
    status: 'Hoàn thành',
  },
  {
    id: 12,
    code: 'HD012',
    employee: 'Trần Thị Lan',
    customer: 'Trần Thị B',
    phone: '0987654321',
    total: 15000000,
    discount: 1500000,
    fee: 300000,
    createdAt: '23/01/2024',
    type: 'Trực tiếp',
    status: 'Hoàn thành',
  },
  {
    id: 13,
    code: 'HD013',
    employee: 'Lê Văn Minh',
    customer: 'Phạm Văn C',
    phone: '0369874521',
    total: 8500000,
    discount: 850000,
    fee: 200000,
    createdAt: '24/01/2024',
    type: 'Online',
    status: 'Đã hủy',
  },
]);

// Notification state
const notificationType = ref('confirm');
const notificationMessage = ref('');
const isNotificationLoading = ref(false);
const notificationOnConfirm = ref(() => {});
const notificationOnCancel = ref(() => {});
const notificationModal = ref(null);
const toastNotification = ref(null);

// Headers for DataTable
const headers = ref([
  { text: 'Mã hóa đơn', value: 'code' },
  { text: 'Nhân viên', value: 'employee' },
  { text: 'Khách hàng', value: 'customer' },
  { text: 'Tổng giá trị', value: 'total' },
  { text: 'Loại đơn', value: 'type' },
  { text: 'Trạng thái', value: 'status' },
  { text: 'Thao tác', value: 'actions' },
]);

// Computed properties
const filteredInvoices = computed(() => {
  let filtered = invoices.value;

  // Apply tab filter
  if (activeTab.value === 'in-store') {
    filtered = filtered.filter((inv) => inv.type.toLowerCase() === 'trực tiếp');
  } else if (activeTab.value === 'online') {
    filtered = filtered.filter((inv) => inv.type.toLowerCase() === 'online');
  }

  // Search filter
  if (keyword.value) {
    const query = keyword.value.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        inv.code.toLowerCase().includes(query) ||
        inv.customer.toLowerCase().includes(query) ||
        inv.phone.includes(query) ||
        inv.employee.toLowerCase().includes(query)
    );
  }

  // Order type filter (from select dropdown)
  if (selectedOrderType.value) {
    filtered = filtered.filter(
      (inv) => inv.type.toLowerCase() === selectedOrderType.value.toLowerCase()
    );
  }

  // Amount range filter
  if (minAmount.value !== null && minAmount.value !== '') {
    filtered = filtered.filter((inv) => inv.total >= minAmount.value);
  }
  if (maxAmount.value !== null && maxAmount.value !== '') {
    filtered = filtered.filter((inv) => inv.total <= maxAmount.value);
  }

  // Date range filter
  if (startDate.value) {
    filtered = filtered.filter((inv) => {
      const invDate = new Date(inv.createdAt.split('/').reverse().join('-'));
      return invDate >= new Date(startDate.value);
    });
  }
  if (endDate.value) {
    filtered = filtered.filter((inv) => {
      const invDate = new Date(inv.createdAt.split('/').reverse().join('-'));
      return invDate <= new Date(endDate.value);
    });
  }

  return filtered;
});

const totalValue = computed(() => {
  return filteredInvoices.value.reduce((sum, inv) => sum + inv.total, 0);
});

const totalPages = computed(() => {
  return Math.ceil(filteredInvoices.value.length / itemsPerPage.value);
});

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInvoices.value.slice(start, end);
});

const statusCounts = computed(() => {
  return filteredInvoices.value.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});
});

// Methods
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const debouncedSearch = debounce((query) => {
  keyword.value = query;
  currentPage.value = 1; // Reset to first page when searching
}, 300);

const resetFilters = () => {
  keyword.value = '';
  selectedOrderType.value = '';
  minAmount.value = null;
  maxAmount.value = null;
  startDate.value = '';
  endDate.value = '';
  activeTab.value = 'all'; // Reset tab to 'all'
  currentPage.value = 1;

  toastNotification.value?.addToast({
    type: 'info',
    message: 'Đã đặt lại tất cả bộ lọc và tab',
    duration: 2000,
  });
};

const exportExcel = () => {
  toastNotification.value?.addToast({
    type: 'success',
    message: `Đã xuất ${filteredInvoices.value.length} hóa đơn ra Excel`,
    duration: 3000,
  });
};

const scanQR = () => {
  toastNotification.value?.addToast({
    type: 'warning',
    message: 'Chức năng quét QR đang được phát triển',
    duration: 3000,
  });
};

const viewInvoice = (invoice) => {
  router.push(`/hoa-don/${invoice.id}`);
};

const editInvoice = (invoice) => {
  router.push(`/hoa-don/${invoice.id}/edit`);
};

const confirmDeleteInvoice = (invoice) => {
  notificationType.value = 'confirm';
  notificationMessage.value = `Bạn có chắc chắn muốn xóa hóa đơn ${invoice.code}?\nThao tác này không thể hoàn tác.`;
  notificationOnConfirm.value = () => deleteInvoice(invoice);
  notificationOnCancel.value = () => {};
  isNotificationLoading.value = false;
  notificationModal.value?.openModal();
};

const deleteInvoice = (invoice) => {
  isNotificationLoading.value = true;

  setTimeout(() => {
    invoices.value = invoices.value.filter((inv) => inv.id !== invoice.id);
    isNotificationLoading.value = false;

    toastNotification.value?.addToast({
      type: 'success',
      message: `Đã xóa hóa đơn ${invoice.code} thành công`,
      duration: 3000,
    });

    resetNotification();
  }, 1000);
};

const resetNotification = () => {
  notificationType.value = 'confirm';
  notificationMessage.value = '';
  isNotificationLoading.value = false;
  notificationOnConfirm.value = () => {};
  notificationOnCancel.value = () => {};
};

const setActiveTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 1; // Reset to first page when switching tabs
  toastNotification.value?.addToast({
    type: 'info',
    message: `Đã chuyển sang tab ${
      tab === 'all' ? 'Tất cả hóa đơn' : tab === 'in-store' ? 'Hóa đơn tại quầy' : 'Hóa đơn online'
    }`,
    duration: 2000,
  });
};

const setActiveTabByStatus = (status) => {
  // Filter invoices by status and determine the most appropriate tab
  const statusInvoices = filteredInvoices.value.filter((inv) => inv.status === status);
  if (statusInvoices.length > 0) {
    const firstType = statusInvoices[0].type.toLowerCase();
    activeTab.value = firstType === 'trực tiếp' ? 'in-store' : firstType === 'online' ? 'online' : 'all';
    toastNotification.value?.addToast({
      type: 'info',
      message: `Đã lọc theo trạng thái ${status}`,
      duration: 2000,
    });
  }
  currentPage.value = 1; // Reset to first page
};

// Badge and icon helpers
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận':
      return 'badge-waiting';
    case 'Chờ giao hàng':
      return 'badge-shipping';
    case 'Đang giao':
      return 'badge-delivering';
    case 'Hoàn thành':
      return 'badge-completed';
    case 'Đã hủy':
      return 'badge-canceled';
    default:
      return 'badge-secondary';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Chờ xác nhận':
      return 'bi bi-clock';
    case 'Chờ giao hàng':
      return 'bi bi-truck';
    case 'Đang giao':
      return 'bi bi-arrow-left-right';
    case 'Hoàn thành':
      return 'bi bi-check-circle';
    case 'Đã hủy':
      return 'bi bi-x-circle';
    default:
      return 'bi bi-question-circle';
  }
};

const getTypeBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case 'online':
      return 'badge-info';
    case 'trực tiếp':
      return 'badge-primary';
    default:
      return 'badge-secondary';
  }
};

const getTypeIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'online':
      return 'bi bi-globe';
    case 'trực tiếp':
      return 'bi bi-shop';
    default:
      return 'bi bi-question-circle';
  }
};

// Lifecycle
onMounted(() => {
  console.log('Invoice Management loaded with', invoices.value.length, 'invoices');
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes gentleGlow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(0, 82, 204, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(0, 82, 204, 0.5);
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

/* Gradient Definitions */
.gradient-primary {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: white;
}

/* Base Styles */
.invoice-management {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Page Header */
.page-header {
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
  align-items: center !important;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #002962;
  letter-spacing: -0.025em;
}

/* Filter Label and Inputs */
.filter-label {
  display: block;
  font-weight: 600;
  color: #002962;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Search Input */
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
  border: 2px solid rgba(0, 82, 204, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #0052cc;
  box-shadow: 0 0 10px rgba(0, 82, 204, 0.2);
}

/* Filter Select */
.filter-select {
  border: 2px solid rgba(0, 82, 204, 0.1);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.filter-select:focus {
  border-color: #0052cc;
  box-shadow: 0 0 10px rgba(0, 82, 204, 0.2);
}

/* Date Range */
.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  border: 2px solid rgba(0, 82, 204, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.date-input:focus {
  border-color: #0052cc;
  box-shadow: 0 0 10px rgba(0, 82, 204, 0.2);
}

.date-separator {
  color: #002962;
  font-weight: 500;
}

/* Price Range */
.price-range-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  border: 2px solid rgba(0, 82, 204, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.price-input:focus {
  border-color: #0052cc;
  box-shadow: 0 0 10px rgba(0, 82, 204, 0.2);
}

.price-separator {
  color: #002962;
  font-weight: 500;
}

/* Filter Stats */
.filter-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  height: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #002962;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #002962;
}

.stat-value.text-success {
  color: #81c784 !important;
}

/* Filter Actions */
.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset,
.btn-action {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: white;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-action:hover {
  background: linear-gradient(135deg, #003ba3, #0066ff);
  box-shadow: 0 0 15px rgba(0, 82, 204, 0.3);
}

/* Tab Section */
.tab-section {
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

.invoice-tabs {
  border-bottom: 2px solid rgba(0, 82, 204, 0.2);
  margin-bottom: 1rem;
}

.nav-tabs .nav-link {
  color: #002962;
  font-weight: 500;
  border: none;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: white;
  border-bottom: 3px solid #0052cc;
}

.nav-tabs .nav-link:hover {
  background: rgba(0, 82, 204, 0.1);
  color: #0052cc;
}

.nav-tabs .nav-link.active:hover {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: white;
  cursor: default;
}

/* Status Badges */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-waiting {
  background: #ffcc80;
  color: #002962;
}

.badge-shipping {
  background: #ffb74d;
  color: #002962;
}

.badge-delivering {
  background: #ffa726;
  color: #002962;
}

.badge-completed {
  background: #81c784;
  color: white;
}

.badge-canceled {
  background: #ef9a9a;
  color: white;
}

/* Table Header (within FilterTableSection) */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 82, 204, 0.1);
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
  background: linear-gradient(135deg, #002962, #0052cc);
  border: none;
}

.view-toggle .btn-primary:hover {
  background: linear-gradient(135deg, #003ba3, #0066ff);
}

.view-toggle .btn-outline-secondary {
  border: 1px solid rgba(0, 82, 204, 0.2);
  color: #002962;
}

.view-toggle .btn-outline-secondary:hover {
  background: rgba(0, 82, 204, 0.1);
  color: #0052cc;
}

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-text {
  font-weight: 600;
  color: #0052cc;
}

.code-date {
  font-size: 0.75rem;
  color: #6c757d;
}

.employee-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.employee-avatar {
  font-size: 1.25rem;
  color: #6c757d;
}

.employee-name {
  font-weight: 500;
  color: #002962;
}

.customer-cell {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #002962;
}

.customer-phone {
  font-size: 0.75rem;
  color: #6c757d;
}

.amount-cell {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.total-amount {
  font-weight: 600;
  color: #00b309 !important;
}

.discount-info {
  font-size: 0.75rem;
  color: #6c757d;
}

.type-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  width: 130px;
  display: flex;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.badge-primary {
  background: linear-gradient(135deg, #002962, #0052cc);
  color: white;
}

.badge-info {
  background: #f8f9fa;
  color: #002962;
  border: 1px solid #0052cc;
}

.badge-secondary {
  background: #6c757d;
  color: white;
}

/* Action Buttons */
.action-buttons-cell {
  display: flex;
  justify-content: center;
}

.btn-view,
.btn-edit,
.btn-delete {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-table {
  color: #003ba3;
  border: none;
}

.btn-table i{
  font-size: 1.2rem;
  font-weight: 800;
}

.btn-table:hover {
  color: #0046bf;
  text-shadow: 0 0 15px rgba(0, 82, 204, 0.3);
}
/* Card View */
.card-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.invoice-card {
  background: #f8f9fa;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 82, 204, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: zoomIn 0.3s ease-out;
}

.invoice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 82, 204, 0.2);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 82, 204, 0.1);
}

.invoice-code {
  font-weight: 600;
  color: #0052cc;
}

.invoice-card-body {
  padding: 1rem;
}

.customer-info {
  margin-bottom: 1rem;
}

.customer-name {
  font-weight: 600;
  color: #002962;
}

.customer-phone {
  font-size: 0.875rem;
  color: #6c757d;
}

.invoice-details {
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
  color: #002962;
}

.invoice-amounts {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 82, 204, 0.1);
}

.total-amount {
  font-weight: 600;
  color: #81c784;
  font-size: 1.1rem;
}

.amount-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.amount-details small {
  color: #6c757d;
}

.invoice-card-actions {
  padding: 1rem;
  border-top: 1px solid rgba(0, 82, 204, 0.1);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Pagination */
.card-pagination {
  padding: 1.5rem;
}

.pagination {
  margin: 0;
  justify-content: center;
}

.page-item .page-link {
  border-radius: 8px;
  margin: 0 0.25rem;
  color: #002962;
  border: 1px solid rgba(0, 82, 204, 0.2);
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #002962, #0052cc);
  border-color: #0052cc;
  color: white;
}

.page-item:not(.disabled) .page-link:hover {
  background: linear-gradient(135deg, #003ba3, #0066ff);
  border-color: #0066ff;
  color: white;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: rgba(0, 82, 204, 0.2);
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

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

  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .date-range-wrapper,
  .price-range-wrapper {
    flex-direction: column;
    gap: 0.75rem;
  }

  .date-separator,
  .price-separator {
    display: none;
  }

  .tab-section {
    animation: fadeInUp 0.4s ease;
  }

  .btn-reset,
  .btn-action {
    padding: 0.5rem 1rem;
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .status-badge {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .invoice-tabs {
    flex-direction: column;
  }

  .nav-item {
    width: 100%;
  }

  .nav-tabs .nav-link {
    width: 100%;
    text-align: left;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .status-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
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

.animate__animated {
  --animate-duration: 0.2s;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__zoomIn {
  animation-name: zoomIn;
}
</style>