<template>
  <footer class="modern-footer">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="container">
        <div class="row g-4">
          <!-- Brand Section -->
          <div class="col-lg-4 col-md-6">
            <div class="footer-brand">
              <div class="brand-logo">
                <div class="logo-placeholder">
                  <img src="/images/logos/logo3.png" alt="Mobile World Logo">
                </div>
                <h4 class="brand-name">Mobile World</h4>
              </div>
              <p class="brand-description">
                Cửa hàng điện thoại di động hàng đầu Việt Nam với hơn 10 năm kinh nghiệm, 
                mang đến những sản phẩm chất lượng cao và dịch vụ tốt nhất.
              </p>
              <div class="contact-info">
                <div class="contact-item">
                  <i class="contact-icon">📍</i>
                  <span>Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô, phường Phương Canh, quận Nam Từ Liêm, TP Hà Nội</span>
                </div>
                <div class="contact-item">
                  <i class="contact-icon">📞</i>
                  <span>1900 1234</span>
                </div>
                <div class="contact-item">
                  <i class="contact-icon">✉️</i>
                  <span>mobileworlddatn2024@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Services Section -->
          <div class="col-lg-2 col-md-6 col-sm-6">
            <div class="footer-section">
              <h5 class="section-title">Dịch vụ</h5>
              <ul class="footer-links">
                <li><a href="#">Bán điện thoại</a></li>
                <li><a href="#">Sửa chữa</a></li>
                <li><a href="#">Bảo hành</a></li>
                <li><a href="#">Thu cũ đổi mới</a></li>
                <li><a href="#">Trả góp 0%</a></li>
              </ul>
            </div>
          </div>

          <!-- About Section -->
          <div class="col-lg-2 col-md-6 col-sm-6">
            <div class="footer-section">
              <h5 class="section-title">Về chúng tôi</h5>
              <ul class="footer-links">
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Tin tức</a></li>
                <li><a href="#">Tuyển dụng</a></li>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">Hệ thống cửa hàng</a></li>
              </ul>
            </div>
          </div>

          <!-- Policy Section -->
          <div class="col-lg-2 col-md-6 col-sm-6">
            <div class="footer-section">
              <h5 class="section-title">Chính sách</h5>
              <ul class="footer-links">
                <li><a href="#">Chính sách đổi trả</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
                <li><a href="#">Điều khoản sử dụng</a></li>
                <li><a href="#">Chính sách vận chuyển</a></li>
                <li><a href="#">Hướng dẫn mua hàng</a></li>
              </ul>
            </div>
          </div>

          <!-- Development Team Section -->
          <div class="col-lg-2 col-md-6">
            <div class="footer-section">
              <h5 class="section-title">Đội ngũ phát triển</h5>
              <div class="team-info">
                <p class="team-description">
                  Được phát triển bởi đội ngũ IT Mobile World
                </p>
                <div class="team-avatars">
                  <div class="avatar-item" title="Frontend Developer">
                    <img src="/images/avatars/lePhuc2.jfif" alt="Frontend Developer">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                    <img src="/images/avatars/phuoc.jpg" alt="Backend Developer">
                  </div>
                  <div class="avatar-item" title="Frontend Developer">
                    <img src="/images/avatars/khoa.jpg" alt="Frontend Developer">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                    <img src="/images/avatars/minh.jpg" alt="Backend Developer">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                    <img src="/images/avatars/huan1.jpg" alt="Backend Developer">
                  </div>
                </div>
                <div class="social-links">
                  <a href="#" class="social-link" title="Facebook"><i class="bi bi-facebook"></i></a>
                  <a href="#" class="social-link" title="Instagram"><i class="bi bi-instagram"></i></a>
                  <a href="#" class="social-link" title="YouTube"><i class="bi bi-youtube"></i></a>
                  <a href="#" class="social-link" title="Telegram"><i class="bi bi-telegram"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
  border-top: 3px solid transparent;
  border-image: linear-gradient(135deg, #60a5fa 0%, #34d399 100%) 1;
  border-image-slice: 1;
  margin-top: auto;
  transition: all 0.3s ease; /* Smooth transition for layout changes */
}

.footer-main {
  padding: 4vw 0 3vw; /* Use vw for fluid padding */
  transition: padding 0.3s ease;
}

.footer-brand {
  max-width: 100%;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Allow wrapping for smaller screens */
  transition: flex-direction 0.3s ease;
}

.logo-placeholder {
  width: clamp(40px, 5vw, 50px); /* Fluid size */
  height: clamp(40px, 5vw, 50px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Prevent distortion */
}

.brand-name {
  color: #2c3e50;
  font-weight: 700;
  font-size: clamp(1.2rem, 2.5vw, 1.5rem); /* Fluid font size */
  margin: 0;
  transition: font-size 0.3s ease;
}

.brand-description {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  color: #495057;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  flex-wrap: wrap; /* Prevent text overflow */
}

.contact-icon {
  font-size: 1rem;
  margin-top: 0.125rem;
}

.footer-section {
  height: 100%;
  text-align: left;
  transition: text-align 0.3s ease;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: clamp(1rem, 2vw, 1.1rem);
  margin-bottom: 1.5rem;
  padding-bottom: 0.625rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #6c757d;
  text-decoration: none;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  transition: all 0.3s ease;
  position: relative;
}

.footer-links a:hover {
  color: #15803d;
  padding-left: 0.5rem;
}

.footer-links a::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #15803d;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.footer-links a:hover::before {
  opacity: 1;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.team-description {
  color: #6c757d;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  margin: 0;
  line-height: 1.5;
}

.team-avatars {
  display: flex;
  flex-wrap: wrap; /* Allow avatars to wrap */
  gap: 0.5rem;
  justify-content: flex-start;
}

.avatar-item {
  width: clamp(35px, 4vw, 45px);
  height: clamp(35px, 4vw, 45px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 3px solid #fff;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.avatar-item:hover {
  transform: translateY(-3px) scale(1.1);
  border-color: #15803d;
}

.avatar-item:hover img {
  transform: scale(1.05);
  filter: brightness(1.1) contrast(1.1);
}

.avatar-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-item:hover::after {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.social-link {
  width: clamp(30px, 3vw, 36px);
  height: clamp(30px, 3vw, 36px);
  background: linear-gradient(135deg, #60a5fa, #34d399);
  color: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
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
@media (max-width: 992px) {
  .footer-main {
    padding: 3vw 0 2vw;
  }
  
  .brand-logo {
    justify-content: center;
    text-align: center;
  }
  
  .footer-section {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 2.5vw 0 1.5vw;
  }
  
  .brand-logo {
    flex-direction: column;
    gap: 0.625rem;
  }
  
  .logo-placeholder {
    width: clamp(35px, 4vw, 45px);
    height: clamp(35px, 4vw, 45px);
  }
  
  .brand-name {
    font-size: clamp(1.1rem, 2vw, 1.3rem);
  }
  
  .team-avatars {
    justify-content: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
    margin-top: 0.9375rem;
  }
  
  .copyright-text {
    text-align: center;
  }
}

@media (max-width: 576px) {
  .footer-main {
    padding: 2vw 0 1vw;
  }
  
  .contact-item {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  }
  
  .footer-links a {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  }
  
  .section-title {
    font-size: clamp(0.9rem, 1.8vw, 1rem);
  }
  
  .avatar-item {
    width: clamp(30px, 3.5vw, 38px);
    height: clamp(30px, 3.5vw, 38px);
  }
  
  .social-link {
    width: clamp(28px, 3vw, 32px);
    height: clamp(28px, 3vw, 32px);
    font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  }
}

/* Smooth transitions for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>