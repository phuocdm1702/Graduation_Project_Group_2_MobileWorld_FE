<template>
  <div class="d-flex justify-content-center align-items-center" :style="{ width: size, height: size }">
    <div
      class="spinner-border animate-spin"
      :style="{ width: size, height: size, borderColor: color, borderRightColor: 'transparent' }"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    size: {
      type: String,
      default: '3rem',
    },
    color: {
      type: String,
      default: '#15803d',
    },
  },
};
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.spinner-border {
  transition: all 0.3s ease-in-out;
}

.d-flex {
  display: flex !important;
}
</style>