<template>
  <div class="container-fluid py-4">
    <HeaderCard title="Hỗ Trợ Khách Hàng" badgeText="Hệ Thống POS" badgeClass="gradient-custom-teal" 
      :backgroundOpacity="0.95" />

    <!-- Main Chat Container -->
    <div class="chat-container animate__animated animate__fadeIn">
      <div class="row g-0 h-100">
        <!-- Customer List Sidebar -->
        <div class="col-lg-4 col-md-5 sidebar-col">
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
                  <span class="status-badge" :class="getStatusClass(customer.idTaiKhoan?.deleted)"></span>
                </div>
                <div class="customer-info">
                  <div class="customer-name">{{ customer.ten || 'N/A' }}</div>
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
        <div class="col-lg-8 col-md-7 chat-col">
          <div class="chat-area" v-if="activeCustomer">
            <!-- Chat Header - Fixed -->
            <div class="chat-header">
              <div class="chat-user-info">
                <div class="user-avatar">
                  <img :src="activeCustomer.anhKhachHang || defaultAvatar" alt="Avatar" class="avatar-img">
                  <span class="status-badge" :class="getStatusClass(activeCustomer.idTaiKhoan?.deleted)"></span>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ activeCustomer.ten || 'N/A' }}</div>
                  <div class="user-status">
                    {{ activeCustomer.idTaiKhoan?.deleted ? 'Online' : 'Offline' }}
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

            <!-- Messages Container - Scrollable -->
            <div class="messages-wrapper">
              <div class="messages-container" ref="messagesContainer">
                <div v-for="(message, index) in messages" :key="index" 
                  class="message" 
                  :class="{ 'outgoing': message.sender === 'employee', 'incoming': message.sender === 'customer' }">
                  <div class="message-content">
                    <div v-if="message.type === 'text'" class="message-text">{{ message.text }}</div>
                    <div v-else-if="message.type === 'image'" class="message-image">
                      <img :src="message.url" alt="Sent image" class="chat-image">
                      <div class="message-time">{{ formatTime(message.time) }}</div>
                    </div>
                    <div v-else-if="message.type === 'file'" class="message-file">
                      <a :href="message.url" :download="message.name" class="file-link">
                        <i class="bi bi-file-earmark"></i> {{ message.name }}
                      </a>
                      <div class="message-time">{{ formatTime(message.time) }}</div>
                    </div>
                    <div v-if="message.type === 'text'" class="message-time">{{ formatTime(message.time) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input - Fixed -->
            <div class="message-input">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Nhập tin nhắn..." 
                  v-model="newMessage" @keyup.enter="sendMessage">
                <button class="btn btn-action" @click="sendMessage" :disabled="!newMessage.trim()">
                  <i class="bi bi-send-fill"></i>
                </button>
              </div>
              <div class="input-actions">
                <label class="btn btn-sm btn-table" title="Gửi file">
                  <i class="bi bi-paperclip"></i>
                  <input type="file" class="d-none" ref="fileInput" @change="handleFileUpload">
                </label>
                <label class="btn btn-sm btn-table" title="Gửi ảnh">
                  <i class="bi bi-image"></i>
                  <input type="file" accept="image/*" class="d-none" ref="imageInput" @change="handleImageUpload">
                </label>
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
                  <span class="info-value">{{ activeCustomer.ma || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Họ tên:</span>
                  <span class="info-value">{{ activeCustomer.ten || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">SĐT:</span>
                  <span class="info-value">{{ activeCustomer.idTaiKhoan?.soDienThoai || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ activeCustomer.idTaiKhoan?.email || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value" v-if="activeCustomer.idDiaChiKhachHang">
                    {{ activeCustomer.idDiaChiKhachHang.diaChiCuThe || 'N/A' }}, 
                    {{ activeCustomer.idDiaChiKhachHang.phuong || 'N/A' }}, 
                    {{ activeCustomer.idDiaChiKhachHang.quan || 'N/A' }}, 
                    {{ activeCustomer.idDiaChiKhachHang.thanhPho || 'N/A' }}
                  </span>
                  <span class="info-value" v-else>Không có địa chỉ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Trạng thái:</span>
                  <span class="info-value status-badge" 
                    :class="getStatusBadgeClass(activeCustomer.idTaiKhoan?.deleted)">
                    {{ activeCustomer.idTaiKhoan?.deleted ? "Kích Hoạt" : "Đã Hủy" }}
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
const fileInput = ref(null)
const imageInput = ref(null)

// Data
const customers = ref([])
const searchKeyword = ref('')
const activeCustomer = ref(null)
const messages = ref([])
const newMessage = ref('')
const isScrolling = ref(false)

// Messages Container reference
const messagesContainer = ref(null)

// Mock data for demonstration with varied messages
const mockMessages = {
  'KH001': [
    { type: 'text', text: 'Xin chào, tôi cần hỗ trợ về đơn hàng số 12345', sender: 'customer', time: new Date(Date.now() - 3600000) },
    { type: 'text', text: 'Chào bạn, tôi có thể giúp gì cho bạn?', sender: 'employee', time: new Date(Date.now() - 3500000) },
    { type: 'text', text: 'Đơn hàng của tôi khi nào sẽ được giao?', sender: 'customer', time: new Date(Date.now() - 3400000) },
    { type: 'file', name: 'invoice_12345.pdf', url: '/files/invoice_12345.pdf', sender: 'employee', time: new Date(Date.now() - 3350000) },
    { type: 'text', text: 'Đơn hàng của bạn sẽ được giao trong vòng 2 ngày tới', sender: 'employee', time: new Date(Date.now() - 3300000) },
    { type: 'image', name: 'product_image.jpg', url: 'https://via.placeholder.com/150', sender: 'customer', time: new Date(Date.now() - 3200000) },
    { type: 'text', text: 'Cảm ơn bạn, tôi sẽ chờ!', sender: 'customer', time: new Date(Date.now() - 3100000) },
  ],
  'KH002': [
    { type: 'text', text: 'Tôi muốn hỏi về sản phẩm mới', sender: 'customer', time: new Date(Date.now() - 7200000) },
    { type: 'text', text: 'Chào bạn, sản phẩm mới đã có hàng chưa?', sender: 'customer', time: new Date(Date.now() - 7100000) },
    { type: 'image', name: 'new_product.jpg', url: 'https://via.placeholder.com/200', sender: 'employee', time: new Date(Date.now() - 7050000) },
    { type: 'text', text: 'Chào bạn, sản phẩm đã có hàng và sẵn sàng giao', sender: 'employee', time: new Date(Date.now() - 7000000) },
    { type: 'text', text: 'Tuyệt vời! Giá bao nhiêu vậy?', sender: 'customer', time: new Date(Date.now() - 6900000) },
  ],
  'KH003': [
    { type: 'text', text: 'Tôi cần hủy đơn hàng số 67890', sender: 'customer', time: new Date(Date.now() - 1800000) },
    { type: 'text', text: 'Chào bạn, vui lòng cung cấp lý do hủy đơn', sender: 'employee', time: new Date(Date.now() - 1700000) },
    { type: 'file', name: 'cancel_request.docx', url: '/files/cancel_request.docx', sender: 'customer', time: new Date(Date.now() - 1600000) },
    { type: 'text', text: 'Đã nhận, chúng tôi sẽ xử lý trong 24 giờ', sender: 'employee', time: new Date(Date.now() - 1500000) },
  ],
  'KH004': [
    { type: 'text', text: 'Chào, tôi muốn kiểm tra trạng thái bảo hành', sender: 'customer', time: new Date(Date.now() - 5000000) },
    { type: 'text', text: 'Vui lòng gửi mã sản phẩm để tôi kiểm tra', sender: 'employee', time: new Date(Date.now() - 4900000) },
    { type: 'text', text: 'Mã là PRD789', sender: 'customer', time: new Date(Date.now() - 4800000) },
    { type: 'image', name: 'warranty_card.jpg', url: 'https://via.placeholder.com/150', sender: 'customer', time: new Date(Date.now() - 4700000) },
  ]
}

// Computed
const filteredCustomerList = computed(() => {
  if (!searchKeyword.value) return customers.value
  return customers.value.filter(customer => 
    (customer.ten || '').toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    (customer.ma || '').toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    (customer.idTaiKhoan?.soDienThoai || '').includes(searchKeyword.value)
  )
})

// Methods
const filterCustomers = () => {
  // Debounce could be added here for performance
}

const selectCustomer = (customer) => {
  // Force reactive update
  activeCustomer.value = null
  nextTick(() => {
    activeCustomer.value = customer
    // Load messages for this customer
    messages.value = [...(mockMessages[customer.ma] || [])]
    // Mark messages as read
    markMessagesAsRead(customer.id)
    // Scroll to bottom with delay to ensure DOM is updated
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })
  })
}

const getLastMessagePreview = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (!customer) return ''
  const lastMsg = (mockMessages[customer.ma] || []).slice(-1)[0]
  if (!lastMsg) return 'Chưa có tin nhắn'
  if (lastMsg.type === 'text') return lastMsg.text
  if (lastMsg.type === 'image') return 'Đã gửi một ảnh'
  if (lastMsg.type === 'file') return `Đã gửi tệp: ${lastMsg.name}`
  return 'Chưa có tin nhắn'
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
    type: 'text',
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
    setTimeout(() => {
      scrollToBottom(true)
    }, 50)
  })
}

const scrollToBottom = (smooth = false) => {
  if (messagesContainer.value && !isScrolling.value) {
    const container = messagesContainer.value
    const scrollOptions = {
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    }
    container.scrollTo(scrollOptions)
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
    message: `Đã tải lịch sử chat với ${activeCustomer.value.ten || 'N/A'}`
  })
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file || !activeCustomer.value) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng chọn tệp và khách hàng trước khi gửi'
    })
    return
  }

  // Create a URL for the file (in a real app, this would be uploaded to a server)
  const fileUrl = URL.createObjectURL(file)
  const message = {
    type: 'file',
    name: file.name,
    url: fileUrl,
    sender: 'employee',
    time: new Date()
  }

  // Add to local messages
  messages.value.push(message)
  
  // Update mockMessages
  if (!mockMessages[activeCustomer.value.ma]) {
    mockMessages[activeCustomer.value.ma] = []
  }
  mockMessages[activeCustomer.value.ma].push(message)

  // Show toast notification
  toastNotification.value.addToast({
    type: 'info',
    message: `Đã gửi tệp: ${file.name}`
  })

  // Reset input and scroll to bottom
  event.target.value = ''
  nextTick(() => {
    setTimeout(() => {
      scrollToBottom(true)
    }, 50)
  })
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file || !activeCustomer.value) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng chọn ảnh và khách hàng trước khi gửi'
    })
    return
  }

  // Validate image type
  if (!file.type.startsWith('image/')) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Vui lòng chọn một tệp ảnh'
    })
    return
  }

  // Create a URL for the image (in a real app, this would be uploaded to a server)
  const imageUrl = URL.createObjectURL(file)
  const message = {
    type: 'image',
    name: file.name,
    url: imageUrl,
    sender: 'employee',
    time: new Date()
  }

  // Add to local messages
  messages.value.push(message)
  
  // Update mockMessages
  if (!mockMessages[activeCustomer.value.ma]) {
    mockMessages[activeCustomer.value.ma] = []
  }
  mockMessages[activeCustomer.value.ma].push(message)

  // Show toast notification
  toastNotification.value.addToast({
    type: 'info',
    message: `Đã gửi ảnh: ${file.name}`
  })

  // Reset input and scroll to bottom
  event.target.value = ''
  nextTick(() => {
    setTimeout(() => {
      scrollToBottom(true)
    }, 50)
  })
}

const getStatusClass = (status) => {
  return status ? 'status-online' : 'status-offline'
}

const getStatusBadgeClass = (status) => {
  return {
    'badge-waiting': status === true,
    'badge-canceled': status === false
  }
}

// Watch for messages changes to auto-scroll
watch(messages, () => {
  nextTick(() => {
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  })
}, { deep: true })

// Handle scroll events to prevent auto-scroll when user is scrolling manually
const handleScroll = () => {
  isScrolling.value = true
  clearTimeout(handleScroll.timeout)
  handleScroll.timeout = setTimeout(() => {
    isScrolling.value = false
  }, 150)
}

// Lifecycle
onMounted(async () => {
  try {
    const data = await fetchKhachHang()
    customers.value = data.map(customer => ({
      ...customer,
      ma: customer.ma || 'N/A',
      ten: customer.ten || 'N/A',
      idTaiKhoan: customer.idTaiKhoan || {
        email: '',
        soDienThoai: '',
        deleted: false
      }
    }))

    // Add scroll event listener to messages container
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.addEventListener('scroll', handleScroll)
      }
    })
  } catch (error) {
    toastNotification.value.addToast({
      type: 'error',
      message: 'Lỗi khi tải dữ liệu khách hàng'
    })
    console.error('Error fetching customers:', error)
  }
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

/* Sidebar and Chat Layout */
.sidebar-col, .chat-col {
  height: 100%;
  overflow: hidden;
}

/* Customer Sidebar */
.customer-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(52, 211, 153, 0.1);
  background: white;
}

.search-filter {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  padding-left: 2.5rem;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: white;
}

.search-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  background: white;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: .9rem;
  transform: translateY(-.5rem);
  color: #6c757d;
  z-index: 2;
}

.customer-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: .5rem;
  object-fit: cover;
}

.status-badge {
  border-radius: .5rem;
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
  flex-shrink: 0;
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
  border-radius: .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Area */
.chat-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
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
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #34d399;
}

.empty-content h4 {
  color: #1f3a44;
  margin-bottom: 0.5rem;
}

/* Chat Header */
.chat-header {
  background: white;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.avatar-img {
  width: 45px;
  height: 45px;
  border-radius: .5rem;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f3a44;
  font-size: 1rem;
}

.user-status {
  font-size: 0.8rem;
  color: #6c757d;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

/* Messages Container */
.messages-wrapper {
  flex: 1;
  overflow: hidden;
  background: #f8f9fa;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

/* Message Styles */
.message {
  margin-bottom: 16px;
  display: flex;
  animation: fadeInUp 0.3s ease-out;
}

.message.outgoing {
  justify-content: flex-end;
}

.message.incoming {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  position: relative;
}

.message-text {
  background: white;
  padding: 8px 12px;
  border-radius: .5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message.outgoing .message-text {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.incoming .message-text {
  background: white;
  color: #1f3a44;
  border-bottom-left-radius: 6px;
}

.message-time {
  font-size: 0.7rem;
  color: #6c757d !important;
  margin-top: 4px;
  text-align: right;
}

.message.incoming .message-time {
  text-align: left;
}

.message.outgoing .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* Image Messages */
.message-image {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-image {
  width: 100%;
  height: auto;
  max-width: 250px;
  display: block;
}

.message.outgoing .message-image {
  background: none;
}

.message.outgoing .chat-image {
  border-radius: 12px;
}

/* File Messages */
.message-file {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.outgoing .message-file {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.file-link {
  color: #34d399;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.message.outgoing .file-link {
  color: white;
}

.file-link:hover {
  color: #10b981;
}

.message.outgoing .file-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

.file-link i {
  font-size: 1.2rem;
}

/* Message Input */
.message-input {
  background: white;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.input-group {
  flex: 1;
  display: flex;
}

.input-group .form-control {
  flex: 1;
  border: 2px solid rgba(52, 211, 153, 0.1);
  border-radius: .5rem;
  padding: 12px 16px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input-group .form-control:focus {
  border-color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.btn-action {
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  color: white;
  border-radius: .5rem;
padding: 12px 16px;
    font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: scale(1.05);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.input-actions .btn {
  border-radius: .5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Customer Info Modal */
.customer-info-modal {
  text-align: center;
}

.info-avatar {
  margin-bottom: 20px;
}

.avatar-img-lg {
  width: 80px;
  height: 80px;
  border-radius: .5rem;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-details {
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #1f3a44;
  min-width: 80px;
}

.info-value {
  color: #6c757d;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.info-value.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-waiting {
  color: #065f46;
}

.badge-canceled {
  color: #991b1b;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar Styling */
.customer-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.customer-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.customer-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #34d399;
  border-radius: 3px;
}

.customer-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #10b981;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 150px);
  }
  
  .sidebar-col {
    display: none;
  }
  
  .sidebar-col.show {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: white;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .messages-container {
    padding: 16px;
  }
  
  .message-input {
    padding: 12px 16px;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
  
  .user-status {
    font-size: 0.7rem;
  }
  
  .input-group .form-control {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .btn-action {
    width: 40px;
    height: 40px;
  }
  
  .input-actions .btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .chat-container {
    border-radius: 0;
    height: calc(100vh - 120px);
  }
  
  .customer-name {
    font-size: 0.9rem;
  }
  
  .customer-last-msg {
    font-size: 0.75rem;
  }
  
  .message-text {
    font-size: 0.85rem;
    padding: 10px 14px;
  }
  
  .avatar-img {
    width: 35px;
    height: 35px;
  }
  
  .chat-header .avatar-img {
    width: 40px;
    height: 40px;
  }
}

/* Loading States */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #34d399;
  border-radius: .5rem;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus States */
.customer-item:focus {
  outline: 2px solid #34d399;
  outline-offset: -2px;
}

.btn:focus {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .message-text {
    border: 2px solid currentColor;
  }
  
  .customer-item.active {
    border-left-width: 4px;
  }
  
  .status-badge {
    border-width: 3px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .message {
    animation: none;
  }
  
  .messages-container {
    scroll-behavior: auto;
  }
  
  * {
    transition: none !important;
  }
}
</style>