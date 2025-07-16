<template>
  <footer class="modern-footer">
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="copyright-text">
              © 2025 Mobile World. Tất cả quyền được bảo lưu.
            </p>
          </div>
          <div class="col-md-6">
            <div class="footer-bottom-links">
              <a href="#">Sitemap</a>
              <span class="divider">|</span>
              <a href="#">RSS</a>
              <span class="divider">|</span>
              <a href="#">Góp ý</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No script logic needed for a static footer
</script>

<style scoped>
.modern-footer {
  background: linear-gradient(135deg, #e6e7e8 0%, #eef0f1 100%);
  border-image-slice: 1;
  margin-top: auto;
  transition: all 0.3s ease;
}

.footer-bottom {
  background: #fff;
  border-top: 1px solid #dee2e6;
  padding: 1.5vw 0;
  transition: padding 0.3s ease;
}

.copyright-text {
  color: #6c757d;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  margin: 0;
  transition: text-align 0.3s ease;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.9375rem;
  flex-wrap: wrap;
  transition: justify-content 0.3s ease;
}

.footer-bottom-links a {
  color: #6c757d;
  text-decoration: none;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #15803d;
}

.divider {
  color: #dee2e6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-bottom-links {
    justify-content: center;
    margin-top: 0.9375rem;
  }
  
  .copyright-text {
    text-align: center;
  }
}

/* Smooth transitions for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>