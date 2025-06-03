<template>
  <div class="toast-container">
    <transition-group name="toast-slide" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-notification"
        :class="`toast-${toast.type}`"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="toast-header">
          <i :class="toastIcon(toast.type)" class="toast-icon"></i>
          <strong class="toast-title">{{ toastTitle(toast.type) }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
            aria-label="Close"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
          <div v-if="toast.isLoading" class="loading-spinner">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Đang xử lý...</span>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ToastNotification',
  setup() {
    const toasts = ref([]);

    const addToast = ({ type, message, isLoading = false, duration = 3000 }) => {
      const id = Date.now() + Math.random();
      toasts.value.push({ id, type, message, isLoading });
      if (!isLoading && duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id);
    };

    const toastTitle = computed(() => (type) => {
      switch (type) {
        case 'success': return 'Thành công';
        case 'error': return 'Lỗi';
        case 'warning': return 'Cảnh báo';
        default: return 'Thông báo';
      }
    });

    const toastIcon = computed(() => (type) => {
      switch (type) {
        case 'success': return 'bi bi-check-circle-fill';
        case 'error': return 'bi bi-x-circle-fill';
        case 'warning': return 'bi bi-exclamation-triangle-fill';
        default: return 'bi bi-info-circle-fill';
      }
    });

    return {
      toasts,
      addToast,
      removeToast,
      toastTitle,
      toastIcon,
    };
  },
};
</script>

<style scoped>
/* General container styling */
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1050;
  max-width: 400px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Base toast notification styling */
.toast-notification {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Hover effect for toast */
.toast-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

/* Type-specific styling */
.toast-success {
  border-left: 6px solid #2ecc71;
  background: #ffffff;
}

.toast-error {
  border-left: 6px solid #e74c3c;
  background: #ffffff;
}

.toast-warning {
  border-left: 6px solid #f1c40f;
  background: #ffffff;
}

.toast-info {
  border-left: 6px solid #3498db;
  background: #ffffff;
}

/* Toast header styling */
.toast-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;
}

/* Icon styling */
.toast-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

.toast-success .toast-icon { color: #2ecc71; }
.toast-error .toast-icon { color: #e74c3c; }
.toast-warning .toast-icon { color: #f1c40f; }
.toast-info .toast-icon { color: #3498db; }

/* Title styling */
.toast-title {
  font-weight: 700;
  font-size: 1.2rem;
  flex-grow: 1;
}

/* Close button styling */
.btn-close {
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-close:hover {
  color: #2c3e50;
}

/* Toast body styling */
.toast-body {
  padding: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Loading spinner styling */
.loading-spinner {
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
}

.spinner-border {
  color: #3498db;
}

/* Animation for toast entrance/exit */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}

.toast-slide-enter-to,
.toast-slide-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* Responsive design */
@media (max-width: 576px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    max-width: calc(100% - 1rem);
    padding: 0.5rem;
  }

  .toast-notification {
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }

  .toast-header {
    font-size: 0.95rem;
    padding: 0.5rem 0.75rem;
  }

  .toast-body {
    font-size: 0.95rem;
    padding: 0.75rem;
  }

  .toast-icon {
    font-size: 1.2rem;
  }

  .toast-title {
    font-size: 1rem;
  }
}
</style>