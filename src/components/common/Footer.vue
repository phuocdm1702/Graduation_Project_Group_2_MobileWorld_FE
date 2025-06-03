<!-- src/components/common/Footer.vue -->
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
                  <img src="/images/logos/logo2.png" alt="">
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
                  <span>Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô,
                  phường Phương Canh, quận Nam Từ Liêm, TP Hà Nội</span>
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
                    <img src="/images/avatars/lePhuc2.jfif" alt="">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                     <img src="/images/avatars/phuoc.jpg" alt="">
                  </div>
                  <div class="avatar-item" title="Frontend Developer">
                     <img src="/images/avatars/khoa.jpg" alt="">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                     <img src="/images/avatars/minh.jpg" alt="">
                  </div>
                  <div class="avatar-item" title="Backend Developer">
                     <img src="/images/avatars/huan1.jpg" alt="">
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
  border-image: linear-gradient(135deg, #002962 0%, #0052cc 100%) 1;
  border-image-slice: 1;
  margin-top: auto;
}

.footer-main {
  padding: 60px 0 40px;
}

.footer-brand {
  max-width: 100%;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-placeholder img {
    width: 50px;
  height: 50px;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.brand-name {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
}

.brand-description {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 25px;
  font-size: 0.95rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #495057;
  font-size: 0.9rem;
}

.contact-icon {
  font-size: 16px;
  margin-top: 2px;
}

.footer-section {
  height: 100%;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 1px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
}

.footer-links a:hover {
  color: #005aba;
  padding-left: 8px;
}

.footer-links a::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #005aba;
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
  gap: 20px;
}

.team-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.team-avatars {
  display: flex;
  width: max-content;
  gap: 8px;
}

.avatar-item {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 3px 12px rgba(0, 123, 255, 0.25);
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
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
  border-color: #005aba;
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
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.05));
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.avatar-item:hover::after {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-links a {
  color: #005aba;
}

.social-link {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
}

.social-link:hover {
  border-color: #005aba;
  background: #005aba;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.footer-bottom {
  background: #fff;
  border-top: 1px solid #dee2e6;
  padding: 20px 0;
}

.copyright-text {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}

.footer-bottom-links a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #005aba;
}

.divider {
  color: #dee2e6;
}

/* Responsive Design */
@media (max-width: 992px) {
  .footer-main {
    padding: 40px 0 30px;
  }
  
  .brand-logo {
    justify-content: center;
    text-align: center;
  }
  
  .footer-section {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 30px 0 20px;
  }
  
  .brand-logo {
    flex-direction: column;
    gap: 10px;
  }
  
  .logo-placeholder {
    width: 50px;
    height: 50px;
  }
  
  .brand-name {
    font-size: 1.3rem;
  }
  
  .team-avatars {
    justify-content: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
    margin-top: 15px;
  }
  
  .copyright-text {
    text-align: center;
  }
}

@media (max-width: 576px) {
  .footer-main {
    padding: 25px 0 15px;
  }
  
  .contact-item {
    font-size: 0.85rem;
  }
  
  .footer-links a {
    font-size: 0.85rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .avatar-item {
    width: 38px;
    height: 38px;
  }
  
  .social-link {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>