<template>
  <div>
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const route = useRoute();
    const layout = computed(() => {
      return route.meta.layoutComponent || 'AdminLayout';
    });

    return { layout };
  },
};
</script>