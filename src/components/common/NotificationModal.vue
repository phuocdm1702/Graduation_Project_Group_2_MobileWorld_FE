<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="notification-modal">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal-content" :class="`modal-${props.type}`">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button
            v-if="type !== 'confirm' && !isLoading"
            class="modal-close-btn"
            @click="closeModal"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="loading-container">
            <loading :size="'2rem'" />
            <div class="message">Đang xử lý...</div>
          </div>
          <div v-else>
            <div class="message">{{ message }}</div>
            <div v-if="type === 'confirm'" class="action-buttons">
              <button class="btn btn-cancel" @click="cancelAction">Hủy</button>
              <button class="btn btn-confirm" @click="confirmAction">
                {{ confirmText }}
              </button>
            </div>
            <div v-else class="btn btn-ok" @click="closeModal">
              <button class="ok">OK</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from "vue";
import Loading from "../common/Loading.vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) =>
      ["success", "error", "warning", "confirm"].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: "Xác nhận",
  },
  onConfirm: {
    type: Function,
    default: () => {},
  },
  onCancel: {
    type: Function,
    default: () => {},
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const isVisible = ref(false);

const title = computed(() => {
  switch (props.type) {
    case "success":
      return "Thành công";
    case "error":
      return "Lỗi";
    case "warning":
      return "Cảnh báo";
    case "confirm":
      return "Xác nhận";
    default:
      return "Thông báo";
  }
});

const openModal = () => {
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  emit("close");
};

const confirmAction = () => {
  props.onConfirm();
  closeModal();
};

const cancelAction = () => {
  props.onCancel();
  closeModal();
};

defineExpose({
  openModal,
});
</script>

<style scoped>
.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 3001;
}

/* Định dạng màu sắc viền cho modal theo type */
.modal-success .modal-header {
  border-left: 4px solid #34d399;
}
.modal-error .modal-header {
  border-left: 4px solid #dc3545;
}
.modal-warning .modal-header {
  border-left: 4px solid #34d399;
}
.modal-confirm .modal-header {
  border-left: 4px solid #34d399;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #6b7280;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #34d399;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #dc3545;
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close-btn:hover {
  color: #34d399;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.message {
  font-size: 1rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  margin-top: 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Màu sắc cho nút OK theo type */
.btn-ok {
  color: #ffffff;
}
.modal-success .btn-ok {
  background: #34d399;
}
.modal-success .btn-ok:hover {
  background: #2cb888;
  color: #ffffff;
}
.modal-error .btn-ok {
  background: #dc3545;
}
.modal-error .btn-ok:hover {
  background: #c5303e;
  color: #ffffff;
}
.modal-warning .btn-ok {
  background: #34d399;
}
.modal-warning .btn-ok:hover {
  background: #2cb888;
  color: #ffffff;
}
.modal-confirm .btn-ok {
  background: #34d399;
}
.modal-confirm .btn-ok:hover {
  background: #2cb888;
  color: #ffffff;
}

/* Nút Cancel */
.btn-cancel {
  background: #6b7280;
  color: #ffffff;
}
.btn-cancel:hover {
  background: #5b616b;
  color: white;
  transform: translateY(-2px);
}

/* Nút Confirm */
.btn-confirm {
  background: #34d399;
  color: #ffffff;
}
.btn-confirm:hover {
  background: #2cb888;
  transform: translateY(-2px);
  color: #ffffff;
}

/* Modal Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}
</style>