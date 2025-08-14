import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let reconnectDelay = 5000;  // 5 giây retry
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

export const connectWebSocket = (onMessageReceived) => {
  if (isConnecting) {
    console.log('Already connecting, skipping');
    return;
  }
  isConnecting = true;

  console.log('Attempting to connect to WebSocket...');
  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = Stomp.over(socket);

  stompClient.debug = (str) => {
    console.log('STOMP Debug:', str);
  };

  const connectCallback = () => {
    console.log('WebSocket connection established successfully');
    isConnecting = false;
    reconnectAttempts = 0;

    // === BAN HANG SERVICE TOPICS ===
    
    // Lắng nghe danh sách hóa đơn chờ
    stompClient.subscribe('/topic/hoa-don-list', (message) => {
      const hoaDonList = JSON.parse(message.body);
      console.log('Received on /topic/hoa-don-list:', hoaDonList);
      onMessageReceived('hoa-don-list', hoaDonList);
    });

    // Lắng nghe hóa đơn mới được tạo
    stompClient.subscribe('/topic/hoa-don-create', (message) => {
      const hoaDonDTO = JSON.parse(message.body);
      console.log('Received on /topic/hoa-don-create:', hoaDonDTO);
      onMessageReceived('hoa-don-create', hoaDonDTO);
    });

    // Lắng nghe thông báo xóa hóa đơn
    stompClient.subscribe('/topic/hoa-don-delete', (message) => {
      const deleteInfo = JSON.parse(message.body);
      console.log('Received on /topic/hoa-don-delete:', deleteInfo);
      onMessageReceived('hoa-don-delete', deleteInfo);
    });

    // Lắng nghe chi tiết hóa đơn chờ
    stompClient.subscribe('/topic/hoa-don-detail', (message) => {
      const hoaDonDTO = JSON.parse(message.body);
      console.log('Received on /topic/hoa-don-detail:', hoaDonDTO);
      onMessageReceived('hoa-don-detail', hoaDonDTO);
    });

    // Lắng nghe thông tin hóa đơn đơn lẻ
    stompClient.subscribe('/topic/single-hoa-don', (message) => {
      const singleHoaDonUpdate = JSON.parse(message.body);
      console.log('Received on /topic/single-hoa-don:', singleHoaDonUpdate);
      onMessageReceived('single-hoa-don', singleHoaDonUpdate);
    });

    // Lắng nghe cập nhật giỏ hàng
    stompClient.subscribe('/topic/gio-hang-update', (message) => {
      const gioHangData = JSON.parse(message.body);
      console.log('Received on /topic/gio-hang-update:', gioHangData);
      onMessageReceived('gio-hang-update', gioHangData);
    });

    // Lắng nghe thông báo xóa giỏ hàng
    stompClient.subscribe('/topic/gio-hang-delete', (message) => {
      const deleteInfo = JSON.parse(message.body);
      console.log('Received on /topic/gio-hang-delete:', deleteInfo);
      onMessageReceived('gio-hang-delete', deleteInfo);
    });

    // Lắng nghe thông báo thanh toán thành công
    stompClient.subscribe('/topic/payment-success', (message) => {
      const paymentData = JSON.parse(message.body);
      console.log('Received on /topic/payment-success:', paymentData);
      onMessageReceived('payment-success', paymentData);
    });

    // Lắng nghe thông tin khách hàng
    stompClient.subscribe('/topic/khach-hang-update', (message) => {
      const khachHangUpdate = JSON.parse(message.body);
      console.log('Received on /topic/khach-hang-update:', khachHangUpdate);
      onMessageReceived('khach-hang-update', khachHangUpdate);
    });

    // === PHIEU GIAM GIA SERVICE TOPICS ===
    
    // Lắng nghe danh sách tất cả phiếu giảm giá
    stompClient.subscribe('/topic/all-pgg', (message) => {
      const allPggUpdate = JSON.parse(message.body);
      console.log('Received on /topic/all-pgg:', allPggUpdate);
      onMessageReceived('all-pgg', allPggUpdate);
    });

    // === PHIEU GIAM GIA CA NHAN SERVICE TOPICS ===
    
    // Lắng nghe danh sách tất cả phiếu giảm giá cá nhân
    stompClient.subscribe('/topic/all-pgg-ca-nhan', (message) => {
      const allPggCaNhanUpdate = JSON.parse(message.body);
      console.log('Received on /topic/all-pgg-ca-nhan:', allPggCaNhanUpdate);
      onMessageReceived('all-pgg-ca-nhan', allPggCaNhanUpdate);
    });

    // Lắng nghe kết quả kiểm tra mã giảm giá
    stompClient.subscribe('/topic/discount-code-check', (message) => {
      const discountCheckUpdate = JSON.parse(message.body);
      console.log('Received on /topic/discount-code-check:', discountCheckUpdate);
      onMessageReceived('discount-code-check', discountCheckUpdate);
    });

    console.log('All WebSocket subscriptions established successfully');
  };

  const errorCallback = (error) => {
    console.error('WebSocket connection error:', error);
    isConnecting = false;
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
      setTimeout(() => connectWebSocket(onMessageReceived), reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
    }
  };

  stompClient.connect({}, connectCallback, errorCallback);

  socket.onopen = () => {
    console.log('SockJS connection opened');
  };
  
  socket.onclose = (event) => {
    console.log('SockJS connection closed:', event);
    if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Connection lost, attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
      setTimeout(() => connectWebSocket(onMessageReceived), reconnectDelay);
    }
  };
  
  socket.onerror = (error) => {
    console.error('SockJS error:', error);
  };
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    console.log('Disconnecting WebSocket...');
    stompClient.disconnect(() => {
      console.log('WebSocket disconnected successfully');
      stompClient = null;
    });
  } else {
    console.log('No active WebSocket connection to disconnect');
  }
  isConnecting = false;
  reconnectAttempts = 0;
};

export const isWebSocketConnected = () => {
  return stompClient && stompClient.connected;
};

// Utility function để send message (nếu cần thiết)
export const sendMessage = (destination, message) => {
  if (stompClient && stompClient.connected) {
    stompClient.send(destination, {}, JSON.stringify(message));
    console.log(`Message sent to ${destination}:`, message);
  } else {
    console.error('WebSocket not connected. Cannot send message.');
  }
};

// Function để check connection status
export const getConnectionStatus = () => {
  return {
    connected: isWebSocketConnected(),
    connecting: isConnecting,
    reconnectAttempts: reconnectAttempts,
    maxReconnectAttempts: maxReconnectAttempts
  };
};