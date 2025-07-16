<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-message">Oops! Trang bạn đang tìm kiếm không tồn tại.</p>
      <router-link to="/trangChu" class="home-button">Quay về trang chủ</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.not-found-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease-in-out;
}

.not-found-title {
  font-size: 6rem;
  font-weight: 900;
  color: #34d399;
  margin: 0;
  line-height: 1;
  animation: scaleIn 0.6s ease-in-out;
}

.not-found-message {
  font-size: 1.25rem;
  color: #333;
  margin: 20px 0 30px;
  line-height: 1.5;
}

.home-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #16a34a;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.home-button:hover {
  background-color: #34d399;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .not-found-card {
    padding: 20px;
  }

  .not-found-title {
    font-size: 4rem;
  }

  .not-found-message {
    font-size: 1rem;
  }

  .home-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>