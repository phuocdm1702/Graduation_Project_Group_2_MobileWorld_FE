<template>
  <div class="header-card">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="header-title sm:text-2xl font-extrabold tracking-tight" :style="{ color: titleColor }">
          {{ displayTitle }}
        </h1>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path"
                class="text-sm font-medium hover:text-green-600"
                :style="{ color: index === 0 ? '#15803d' : '#6b7280' }">
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-sm font-medium text-gray-500" aria-current="page">
                {{ crumb.name }}
              </span>
              <span v-if="index < breadcrumbs.length - 1" class="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

export default {
  name: 'HeaderCard',
  props: {
    title: {
      type: String,
      default: '',
    },
    titleColor: {
      type: String,
      default: '#15803d',
    },
    backgroundOpacity: {
      type: Number,
      default: 0.95,
    },
  },
  setup(props) {
    const route = useRoute();

    // Lấy breadcrumb từ route meta
    const breadcrumbs = computed(() => {
      return route.meta?.breadcrumb || [
        { name: 'Trang chủ', path: '/trangChu' },
        { name: route.name || 'Trang hiện tại', path: route.path }
      ];
    });

    // Lấy title từ route meta hoặc props
    const displayTitle = computed(() => {
      return props.title || route.meta?.title || route.name || 'Không xác định';
    });

    return { 
      breadcrumbs, 
      displayTitle 
    };
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
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  display: flex;
  background-color: rgba(255, 255, 255, v-bind(backgroundOpacity));
}

h1 {
  font-size: 1.7rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.breadcrumb li {
  display: flex;
  align-items: center;
}

.breadcrumb a {
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: #16a34a;
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

  .breadcrumb {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .breadcrumb {
    font-size: 0.75rem;
  }
}
</style>