<template>
  <div class="login-container">
    <!-- Background Elements -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="floating-particles">
        <div class="particle" v-for="n in 20" :key="n"></div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="loading-text">Signing you in...</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="login-content">
      <!-- Left Side - Branding -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-container">
            <div class="logo-icon">
              <img src="/images/logos/logo3.png" alt="Logo">
            </div>
            <h1 class="brand-title">Mobile World</h1>
          </div>
          <p class="brand-subtitle">Welcome to the future of mobile technology</p>
          <div class="feature-highlights">
            <div class="feature-item">
              <i class="bi bi-shield-check"></i>
              <span>Secure & Reliable</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-lightning-charge"></i>
              <span>Fast Performance</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-heart"></i>
              <span>User Friendly</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">Sign In</h2>
            <p class="form-subtitle">Access your account to continue</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  id="username"
                  class="form-input"
                  v-model="username"
                  placeholder="Enter your username"
                  required
                  :disabled="isLoading"
                />
                <div class="input-border"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  class="form-input"
                  v-model="password"
                  placeholder="Enter your password"
                  required
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :disabled="isLoading"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <div class="input-border"></div>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="rememberMe" :disabled="isLoading">
                <span class="checkmark"></span>
                Remember me
              </label>
            </div>

            <div v-if="error" class="error-message">
              <i class="bi bi-exclamation-triangle"></i>
              {{ error }}
            </div>

            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Sign In</span>
              <span v-else class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <i class="bi bi-arrow-right button-icon"></i>
            </button>
          </form>

          <div class="form-footer">
            <router-link 
              to="/forgot-password" 
              class="forgot-link"
              :class="{ 'disabled': isLoading }"
            >
              <i class="bi bi-question-circle"></i>
              Forgot your password?
            </router-link>

            <div class="social-login">
              <p class="social-text">Or continue with</p>
              <div class="social-buttons">
                <button class="social-btn google" :disabled="isLoading">
                  <i class="bi bi-google"></i>
                </button>
                <button class="social-btn facebook" :disabled="isLoading">
                  <i class="bi bi-facebook"></i>
                </button>
                <button class="social-btn apple" :disabled="isLoading">
                  <i class="bi bi-apple"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/modules/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'ModernLogin',
  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const isLoading = ref(false);
    const showPassword = ref(false);
    const rememberMe = ref(false);
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
      isLoading.value = true;
      error.value = '';

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const validUsername = 'admin';
      const validPassword = '123456';

      if (username.value === validUsername && password.value === validPassword) {
        authStore.login({ username: username.value });
        router.push('/trangChu');
      } else {
        error.value = 'Invalid username or password. Please try again.';
      }

      isLoading.value = false;
    };

    return { 
      username, 
      password, 
      error, 
      isLoading, 
      showPassword,
      rememberMe,
      handleLogin 
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Background Shapes */
.bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #34d399, #60a5fa);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 4s;
}

/* Floating Particles */
.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #34d399, #60a5fa);
  border-radius: 50%;
  opacity: 0.6;
  animation: particleFloat 8s linear infinite;
}

.particle:nth-child(odd) {
  animation-delay: -4s;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner-ring {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(52, 211, 153, 0.3);
  border-top: 4px solid #34d399;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
}

/* Main Content Layout */
.login-content {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 1100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5rem;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
}

.brand-content {
  max-width: 400px;
  text-align: center;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: white;
  animation: logoFloat 3s ease-in-out infinite;
}

.logo-icon img {
    width: 200px;
  height: 200px;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #34d399, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  opacity: 0.9;
  color: #34d399;
}

.feature-item i {
  font-size: 1.2rem;
  color: #34d399;
}

/* Form Section */
.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.form-container {
  width: 500px;
  animation: slideUp 0.8s ease-out;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Form Styling */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.form-input:focus + .input-icon {
  color: #60a5fa;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #60a5fa;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #34d399, #60a5fa);
  transition: width 0.3s ease;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-container input:checked + .checkmark {
  background: linear-gradient(135deg, #34d399, #60a5fa);
  border-color: #34d399;
}

.checkbox-container input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Error Message */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s ease-in-out;
}

/* Submit Button */
.submit-button {
  background: linear-gradient(135deg, #34d399, #60a5fa);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-button:hover:not(:disabled)::before {
  left: 100%;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(52, 211, 153, 0.4);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-icon {
  transition: transform 0.3s ease;
}

.submit-button:hover:not(:disabled) .button-icon {
  transform: translateX(4px);
}

/* Loading Dots */
.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: loadingDot 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Form Footer */
.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.forgot-link {
  color: #60a5fa;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.forgot-link:hover:not(.disabled) {
  color: #34d399;
  text-decoration: underline;
}

.forgot-link.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Social Login */
.social-login {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.social-text {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.social-btn.google:hover:not(:disabled) {
  border-color: #ea4335;
  color: #ea4335;
}

.social-btn.facebook:hover:not(:disabled) {
  border-color: #1877f2;
  color: #1877f2;
}

.social-btn.apple:hover:not(:disabled) {
  border-color: #000;
  color: #000;
}

.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-10px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .brand-section {
    padding: 2rem 1rem 1rem;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .form-container {
    padding: 2rem 1.5rem;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .feature-highlights {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .social-buttons {
    gap: 0.5rem;
  }
  
  .social-btn {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
}

/* Generate random positions for particles */
.particle:nth-child(1) { left: 10%; animation-duration: 8s; }
.particle:nth-child(2) { left: 20%; animation-duration: 7s; }
.particle:nth-child(3) { left: 30%; animation-duration: 9s; }
.particle:nth-child(4) { left: 40%; animation-duration: 6s; }
.particle:nth-child(5) { left: 50%; animation-duration: 8s; }
.particle:nth-child(6) { left: 60%; animation-duration: 7s; }
.particle:nth-child(7) { left: 70%; animation-duration: 9s; }
.particle:nth-child(8) { left: 80%; animation-duration: 6s; }
.particle:nth-child(9) { left: 90%; animation-duration: 8s; }
.particle:nth-child(10) { left: 15%; animation-duration: 7s; }
.particle:nth-child(11) { left: 25%; animation-duration: 9s; }
.particle:nth-child(12) { left: 35%; animation-duration: 6s; }
.particle:nth-child(13) { left: 45%; animation-duration: 8s; }
.particle:nth-child(14) { left: 55%; animation-duration: 7s; }
.particle:nth-child(15) { left: 65%; animation-duration: 9s; }
.particle:nth-child(16) { left: 75%; animation-duration: 6s; }
.particle:nth-child(17) { left: 85%; animation-duration: 8s; }
.particle:nth-child(18) { left: 95%; animation-duration: 7s; }
.particle:nth-child(19) { left: 5%; animation-duration: 9s; }
.particle:nth-child(20) { left: 95%; animation-duration: 6s; }
</style>