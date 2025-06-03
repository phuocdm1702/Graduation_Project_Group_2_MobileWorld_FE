<template>
  <div class="header-card relative bg-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    <div class="relative card-body p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="header-title sm:text-2xl font-extrabold tracking-tight" :style="{ color: titleColor }">{{ title }}</h1>
      </div>
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
  display: flex;
  align-items: center;
}

h1 {
  font-size: 1.5rem;
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