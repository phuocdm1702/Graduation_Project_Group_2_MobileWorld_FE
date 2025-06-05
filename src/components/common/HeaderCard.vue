<template>
  <div class="header-card">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="header-title sm:text-2xl font-extrabold tracking-tight" :style="{ color: titleColor }">{{ title }}</h1>
      </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderCard',
  props: {
    title: {
      type: String,
      default: 'Không Xác Định',
    },
    badgeText: {
      type: String,
      default: 'Default',
    },
    titleColor: {
      type: String,
      default: '#1e3a8a',
    },
    badgeClass: {
      type: String,
      default: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    },
    backgroundOpacity: {
      type: Number,
      default: 0.95,
    },
  },
};
</script>

<style scoped>
.header-card {
  animation: slideIn 0.6s ease-out;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.115);
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, 0.075) !important;
  display: flex;
  background-color: rgba(255, 255, 255, 0.95);
}

h1 {
  font-size: 1.7rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .header-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.5rem;
  }
}
</style>