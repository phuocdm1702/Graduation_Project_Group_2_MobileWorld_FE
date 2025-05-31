<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg p-4" style="width: 100%; max-width: 400px;">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
};
</script>