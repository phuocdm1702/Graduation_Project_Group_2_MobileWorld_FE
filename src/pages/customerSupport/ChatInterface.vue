<template>
  <div class="container-fluid py-4">
    <HeaderCard title="Hỗ Trợ Khách Hàng" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" 
      :backgroundOpacity="0.95" />

    <!-- Main Chat Container -->
    <div class="chat-container animate__animated animate__fadeIn">
      <div class="row g-0 h-100">
        <!-- Customer List Sidebar -->
        <div class="col-lg-4 col-md-5">
          <div class="customer-sidebar">
            <!-- Search Filter -->
            <div class="search-filter p-3">
              <div class="search-group">
                <div class="search-input-wrapper">
                  <i class="bi bi-search search-icon"></i>
                  <input type="text" class="form-control search-input" placeholder="Tìm kiếm khách hàng..." 
                    v-model="searchKeyword" @input="filterCustomers" />
                </div>
              </div>
            </div>

            <!-- Customer List -->
            <div class="customer-list">
              <div v-for="customer in filteredCustomerList" :key="customer.id" 
                class="customer-item" 
                :class="{ 'active': activeCustomer?.id === customer.id }"
                @click="selectCustomer(customer)">
                <div class="customer-avatar">
                  <img :src="customer.anhKhachHang || defaultAvatar" alt="Avatar" class="avatar-img">
                  <span class="status-badge" :class="getStatusClass(customer.idTaiKhoan.deleted)"></span>
                </div>
                <div class="customer-info">
                  <div class="customer-name">{{ customer.ten }}</div>
                  <div class="customer-last-msg">
                    {{ getLastMessagePreview(customer.id) }}
                  </div>
                </div>
                <div class="customer-meta">
                  <div class="last-time">{{ formatTime(getLastMessageTime(customer.id)) }}</div>
                  <div v-if="hasUnreadMessages(customer.id)" class="unread-badge">
                    {{ getUnreadCount(customer.id) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="col-lg-8 col-md-7">
          <div class="chat-area" v-if="activeCustomer">
            <!-- Chat Header -->
            <div class="chat-header">
              <div class="chat-user-info">
                <div class="user-avatar">
                  <img :src="activeCustomer.anhKhachHang || defaultAvatar" alt="Avatar" class="avatar-img">
                  <span class="status-badge" :class="getStatusClass(activeCustomer.idTaiKhoan.deleted)"></span>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ activeCustomer.ten }}</div>
                  <div class="user-status">
                    {{ activeCustomer.idTaiKhoan.deleted ? 'Online' : 'Offline' }}
                  </div>
                </div>
              </div>
              <div class="chat-actions">
                <button class="btn btn-sm btn-table" title="Thông tin khách hàng" @click="showCustomerInfo">
                  <i class="bi bi-info-circle-fill"></i>
                </button>
                <button class="btn btn-sm btn-table" title="Tải lịch sử chat" @click="downloadChatHistory">
                  <i class="bi bi-download"></i>
                </button>
              </div>
            </div>

            <!-- Messages Container -->
            <div class="messages-container" ref="messagesContainer">
              <div v-for="(message, index) in messages" :key="index" 
                class="message" 
                :class="{ 'outgoing': message.sender === 'employee', 'incoming': message.sender === 'customer' }">
                <div class="message-content">
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Nhập tin nhắn..." 
                  v-model="newMessage" @keyup.enter="sendMessage">
                <button class="btn btn-action" @click="sendMessage">
                  <i class="bi bi-send-fill"></i>
                </button>
              </div>
              <div class="input-actions">
                <button class="btn btn-sm btn-table" title="Gửi file">
                  <i class="bi bi-paperclip"></i>
                  <input type="file" class="d-none" @change="handleFileUpload">
                </button>
                <button class="btn btn-sm btn-table" title="Gửi ảnh">
                  <i class="bi bi-image"></i>
                  <input type="file" accept="image/*" class="d-none" @change="handleImageUpload">
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-chat" v-else>
            <div class="empty-content animate__animated animate__fadeIn">
              <i class="bi bi-chat-square-text"></i>
              <h4>Chọn khách hàng để bắt đầu trò chuyện</h4>
              <p>Nhắn tin hỗ trợ khách hàng trực tiếp từ hệ thống POS</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Info Modal -->
    <div class="modal fade" id="customerInfoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thông tin khách hàng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="activeCustomer">
            <div class="customer-info-modal">
              <div class="info-avatar">
                <img :src="activeCustomer.anhKhachHang || defaultAvatar" alt="Avatar" class="avatar-img-lg">
              </div>
              <div class="info-details">
                <div class="info-row">
                  <span class="info-label">Mã KH:</span>
                  <span class="info-value">{{ activeCustomer.ma }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Họ tên:</span>
                  <span class="info-value">{{ activeCustomer.ten }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">SĐT:</span>
                  <span class="info-value">{{ activeCustomer.idTaiKhoan.soDienThoai }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ activeCustomer.idTaiKhoan.email }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value" v-if="activeCustomer.idDiaChiKhachHang">
                    {{ activeCustomer.idDiaChiKhachHang.diaChiCuThe }}, {{ activeCustomer.idDiaChiKhachHang.phuong }}, 
                    {{ activeCustomer.idDiaChiKhachHang.quan }}, {{ activeCustomer.idDiaChiKhachHang.thanhPho }}
                  </span>
                  <span class="info-value" v-else>Không có địa chỉ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Trạng thái:</span>
                  <span class="info-value status-badge" 
                    :class="getStatusBadgeClass(activeCustomer.idTaiKhoan.deleted)">
                    {{ activeCustomer.idTaiKhoan.deleted ? "Kích Hoạt" : "Đã Hủy" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-reset" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-action" @click="goToCustomerDetail">
              <i class="bi bi-box-arrow-up-right me-1"></i> Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification ref="toastNotification" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import HeaderCard from "@/components/common/HeaderCard.vue"
import ToastNotification from "@/components/common/ToastNotification.vue"
import { fetchKhachHang } from "../../store/modules/customers/khachHang"

const router = useRouter()
const toastNotification = ref(null)
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

// Data
const customers = ref([])
const searchKeyword = ref('')
const activeCustomer = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

// Mock data for demonstration
const mockMessages = {
  'KH001': [
    { text: 'Xin chào, tôi cần hỗ trợ về đơn hàng số 12345', sender: 'customer', time: new Date(Date.now() - 3600000) },
    { text: 'Chào bạn, tôi có thể giúp gì cho bạn?', sender: 'employee', time: new Date(Date.now() - 3500000) },
    { text: 'Đơn hàng của tôi khi nào sẽ được giao?', sender: 'customer', time: new Date(Date.now() - 3400000) },
    { text: 'Đơn hàng của bạn sẽ được giao trong vòng 2 ngày tới', sender: 'employee', time: new Date(Date.now() - 3300000) },
  ],
  'KH002': [
    { text: 'Tôi muốn hỏi về sản phẩm mới', sender: 'customer', time: new Date(Date.now() - 7200000) },
    { text: 'Chào bạn, sản phẩm mới đã có hàng chưa?', sender: 'customer', time: new Date(Date.now() - 7100000) },
    { text: 'Chào bạn, sản phẩm đã có hàng và sẵn sàng giao', sender: 'employee', time: new Date(Date.now() - 7000000) },
  ],
  'KH003': [
    { text: 'Tôi cần hủy đơn hàng số 67890', sender: 'customer', time: new Date(Date.now() - 1800000) },
  ]
}

// Computed
const filteredCustomerList = computed(() => {
  if (!searchKeyword.value) return customers.value
  return customers.value.filter(customer => 
    customer.ten.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    customer.ma.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    customer.idTaiKhoan.soDienThoai.includes(searchKeyword.value)
  )
})

// Methods
const filterCustomers = () => {
  // Debounce could be added here for performance
}

const selectCustomer = (customer) => {
  activeCustomer.value = customer
  // Load messages for this customer
  messages.value = mockMessages[customer.ma] || []
  // Mark messages as read
  markMessagesAsRead(customer.id)
  // Scroll to bottom
  nextTick(() => {
    scrollToBottom()
  })
}

const getLastMessagePreview = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (!customer) return ''
  const lastMsg = (mockMessages[customer.ma] || []).slice(-1)[0]
  return lastMsg ? lastMsg.text : 'Chưa có tin nhắn'
}

const getLastMessageTime = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (!customer) return null
  const lastMsg = (mockMessages[customer.ma] || []).slice(-1)[0]
  return lastMsg ? lastMsg.time : null
}

const hasUnreadMessages = (customerId) => {
  // In a real app, this would check for unread messages
  return false
}

const getUnreadCount = (customerId) => {
  // In a real app, this would return the count of unread messages
  return 0
}

const markMessagesAsRead = (customerId) => {
  // In a real app, this would mark messages as read
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !activeCustomer.value) return
  
  const message = {
    text: newMessage.value,
    sender: 'employee',
    time: new Date()
  }
  
  // Add to local messages
  messages.value.push(message)
  
  // In a real app, this would send to server
  if (!mockMessages[activeCustomer.value.ma]) {
    mockMessages[activeCustomer.value.ma] = []
  }
  mockMessages[activeCustomer.value.ma].push(message)
  
  // Clear input and scroll to bottom
  newMessage.value = ''
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const showCustomerInfo = () => {
  const modal = new Modal(document.getElementById('customerInfoModal'))
  modal.show()
}

const goToCustomerDetail = () => {
  if (activeCustomer.value) {
    router.push(`/khachHang/form/${activeCustomer.value.id}`)
    const modal = Modal.getInstance(document.getElementById('customerInfoModal'))
    modal.hide()
  }
}

const downloadChatHistory = () => {
  if (!activeCustomer.value) return
  
  toastNotification.value.addToast({
    type: 'success',
    message: `Đã tải lịch sử chat với ${activeCustomer.value.ten}`
  })
}

const handleFileUpload = (event) => {
  // Handle file upload
  const file = event.target.files[0]
  if (file) {
    toastNotification.value.addToast({
      type: 'info',
      message: `Đã chọn file: ${file.name}`
    })
    event.target.value = '' // Reset input
  }
}

const handleImageUpload = (event) => {
  // Handle image upload
  const file = event.target.files[0]
  if (file) {
    toastNotification.value.addToast({
      type: 'info',
      message: `Đã chọn ảnh: ${file.name}`
    })
    event.target.value = '' // Reset input
  }
}

const getStatusClass = (status) => {
  return status ? 'status-online' : 'status-offline'
}

const getStatusBadgeClass = (status) => {
  return {
    'badge-waiting': status,
    'badge-canceled': !status,
  }
}

// Lifecycle
onMounted(async () => {
  const data = await fetchKhachHang()
  customers.value = data
})
</script>

<style scoped>
/* Base Styles */
.chat-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: calc(100vh - 200px);
  overflow: hidden;
}

/* Customer Sidebar */
.customer-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(52, 211, 153, 0.1);
}

.search-filter {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: #f8f9fa;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.customer-list {
  flex: 1;
  overflow-y: auto;
}

.customer-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(52, 211, 153, 0.05);
}

.customer-item:hover {
  background-color: rgba(52, 211, 153, 0.05);
}

.customer-item.active {
  background-color: rgba(52, 211, 153, 0.1);
  border-left: 3px solid #34d399;
}

.customer-avatar {
  position: relative;
  margin-right: 12px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-online {
  background-color: #34d399;
}

.status-offline {
  background-color: #6c757d;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name {
  font-weight: 600;
  color: #1f3a44;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-last-msg {
  font-size: 0.8rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 8px;
}

.last-time {
  font-size: 0.7rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.unread-badge {
  background-color: #34d399;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Area */
.chat-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.empty-content {
  text-align: center;
  color: #6c757d;
}

.empty-content i {
  font-size: 3rem;
  color: rgba(52, 211, 153, 0.3);
  margin-bottom: 1rem;
}

.empty-content h4 {
  color: #1f3a44;
  margin-bottom: 0.5rem;
}

.chat-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  background-color: white;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f3a44;
}

.user-status {
  font-size: 0.8rem;
  color: #6c757d;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.message-text {
  word-wrap: break-word;
}

.message-time {
  font-size: 0.7rem;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
}

.incoming .message-content {
  background-color: white;
  border-top-left-radius: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.outgoing .message-content {
  background-color: #34d399;
  color: white;
  border-top-right-radius: 0;
  margin-left: auto;
}

.outgoing .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-input {
  padding: 16px;
  background-color: white;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
}

.input-group {
  display: flex;
  margin-bottom: 8px;
}

.input-group .form-control {
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.input-group .form-control:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.input-group .btn-action {
  border-radius: 8px;
  margin-left: 8px;
  padding: 0 16px;
}

.input-actions {
  display: flex;
  gap: 8px;
}

/* Customer Info Modal */
.customer-info-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-avatar {
  margin-bottom: 16px;
}

.avatar-img-lg {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #34d399;
}

.info-details {
  width: 100%;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-label {
  font-weight: 600;
  color: #1f3a44;
  min-width: 100px;
}

.info-value {
  flex: 1;
  color: #6c757d;
}

/* Badges */
.badge-waiting {
  background: #34d399;
  color: white;
}

.badge-canceled {
  background: #dc3545;
  color: white;
}

/* Buttons */
.btn-reset, .btn-action {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-reset:hover {
  background: #5c636a;
  color: white;
  box-shadow: 0 0 15px rgba(108, 117, 125, 0.3);
}

.btn-action {
  background: #34d399;
  color: white;
  border: none;
}

.btn-action:hover {
  background: #16a34a;
  color: white;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.btn-table {
  color: #1f3a44;
  border: none;
}

.btn-table:hover {
  color: #16a34a;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gentleGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .chat-container {
    height: calc(100vh - 180px);
  }
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 160px);
  }
  
  .customer-name {
    font-size: 0.9rem;
  }
  
  .customer-last-msg {
    font-size: 0.75rem;
  }
  
  .message-content {
    max-width: 80%;
  }
}
</style>