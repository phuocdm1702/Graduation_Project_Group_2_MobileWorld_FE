<template>
  <div class="section mb-4">
    <div class="section-card">
      <div class="section-header">
        <h5 class="section-title">
          <i :class="icon" class="me-2"></i>
          {{ title }}
        </h5>
      </div>
      <div class="section-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.section {
  animation: fadeInUp 0.4s ease-out 0.2s both;
  display: flex;
  flex-direction: column;
}

.section-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, 0.075) !important;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

}

.section-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  flex-shrink: 0;
}

.section-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

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

/* Responsive */
@media (max-width: 768px) {
  .section {
    animation: fadeInUp 0.4s ease;
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