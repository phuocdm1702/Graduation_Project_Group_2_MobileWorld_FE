<template>
  <div class="container-fluid py-4">
    <div class="card border-0 shadow-sm datatable-card" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);">
      <h5 class="mb-0 fw-bold text-dark">{{ title }}</h5>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="sticky-header">
              <tr class="text-muted small" style="background: rgba(52, 211, 153, 0.05);">
                <th v-for="(header, index) in headers" :key="index" class="p-3">
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in paginatedData"
                :key="item.id"
                class="table-row"
                :style="`animation-delay: ${index * 0.1}s;`"
              >
                <td v-for="(header, hIndex) in headers" :key="hIndex" class="p-3">
                  <slot :name="header.value" :item="item" :index="index" :globalIndex="(internalCurrentPage - 1) * internalItemsPerPage + index">
                    {{ item[header.value] }}
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small">Hiển thị</span>
          <select
            :value="internalItemsPerPage"
            class="form-select form-select-sm"
            style="width: 80px; background: rgba(248, 249, 250, 0.5);"
            @change="handleItemsPerPageChange($event)"
          >
            <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <span class="text-muted small">mục / trang</span>
        </div>
        <div class="text-muted small">
          Hiển thị {{ (internalCurrentPage - 1) * internalItemsPerPage + 1 }} - {{ Math.min(internalCurrentPage * internalItemsPerPage, data.length) }} / {{ data.length }} mục
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: internalCurrentPage === 1 }">
              <button class="page-link" @click="updateCurrentPage(1)">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: internalCurrentPage === 1 }">
              <button class="page-link" @click="updateCurrentPage(internalCurrentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{ active: page === internalCurrentPage }"
            >
              <button class="page-link" @click="updateCurrentPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: internalCurrentPage === totalPages }">
              <button class="page-link" @click="updateCurrentPage(internalCurrentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: internalCurrentPage === totalPages }">
              <button class="page-link" @click="updateCurrentPage(totalPages)">
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    title: {
      type: String,
      default: ''
    },
    headers: {
      type: Array,
      required: true,
      validator: (headers) => headers.every(h => h.text && h.value)
    },
    data: {
      type: Array,
      required: true,
      validator: (data) => Array.isArray(data)
    },
    pageSizeOptions: {
      type: Array,
      default: () => [5, 10, 15]
    },
    currentPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      internalCurrentPage: this.currentPage,
      internalItemsPerPage: this.itemsPerPage
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.data.length / this.internalItemsPerPage);
    },
    paginatedData() {
      const start = (this.internalCurrentPage - 1) * this.internalItemsPerPage;
      const end = start + this.internalItemsPerPage;
      return this.data.slice(start, end);
    },
    displayedPages() {
      const maxPagesToShow = 5;
      let startPage = Math.max(1, this.internalCurrentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    handleItemsPerPageChange(event) {
      const newValue = Number(event.target.value);
      this.internalItemsPerPage = newValue;
      this.internalCurrentPage = 1; // Reset to first page
      this.$emit('update:itemsPerPage', newValue);
      this.$emit('update:currentPage', 1);
    },
    updateCurrentPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.internalCurrentPage = page;
        this.$emit('update:currentPage', page);
      }
    }
  },
  watch: {
    data() {
      this.internalCurrentPage = 1;
      this.$emit('update:currentPage', 1);
    },
    currentPage(newVal) {
      this.internalCurrentPage = newVal;
    },
    itemsPerPage(newVal) {
      this.internalItemsPerPage = newVal;
    }
  }
};
</script>

<style scoped>
/* Existing styles remain unchanged */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes smoothPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(52, 211, 153, 0.5);
  }
}

.gradient-custom-teal {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.gradient-custom-orange {
  background: linear-gradient(135deg, #fd7e14, #e8590c);
}

.gradient-custom-green {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.datatable-card {
  animation: fadeInUp 0.8s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-row {
  animation: slideInLeft 0.6s ease-out;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(52, 211, 153, 0.05) !important;
}

.page-link {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  color: #1f3a44;
}

.page-link:hover {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: white;
  border-color: transparent;
}

.page-item.disabled .page-link {
  background: rgba(248, 249, 250, 0.5);
  color: #6c757d;
}

.form-select {
  transition: all 0.3s ease;
  border: 2px solid rgba(52, 211, 153, 0.1);
}

.form-select:hover {
  background: rgba(52, 211, 153, 0.1) !important;
}

th, td {
  text-align: center;
}

th {
  font-size: 1.1rem;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.table-responsive {
  max-height: 450px; 
  overflow-y: auto; 
  scrollbar-width: thin; 
  scrollbar-color: rgba(52, 211, 153, 0.5) rgba(0, 0, 0, 0.1); 
}

.table-responsive::-webkit-scrollbar {
  width: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.table-responsive::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.5);
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: rgba(52, 211, 153, 0.8);
}

@media (max-width: 768px) {
  .datatable-card {
    padding: 10px;
  }

  .table-row:hover {
    transform: translateX(3px);
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
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