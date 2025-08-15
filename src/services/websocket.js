import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let reconnectDelay = 5000;  // 5 giây retry
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

// Biến để theo dõi đơn hàng được chọn
let selectedOrderId = null;

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

    // === TOPICS CHO SINGLE ORDER MODE ===

    // Lắng nghe danh sách hóa đơn chờ (để hiển thị list chọn)
    stompClient.subscribe('/topic/hoa-don-list', (message) => {
      const hoaDonList = JSON.parse(message.body);
      console.log('Received order list:', hoaDonList);
      onMessageReceived('hoa-don-list', hoaDonList);
    });

    // Lắng nghe đơn hàng được chọn từ web
    stompClient.subscribe('/topic/selected-order', (message) => {
      const selectedOrder = JSON.parse(message.body);
      console.log('Received selected order:', selectedOrder);
      selectedOrderId = selectedOrder.id;
      onMessageReceived('selected-order', selectedOrder);
    });

    // Lắng nghe thông báo xóa hóa đơn
    stompClient.subscribe('/topic/hoa-don-delete', (message) => {
      const deleteInfo = JSON.parse(message.body);
      console.log('Received order delete:', deleteInfo);
      
      // Nếu đơn hàng hiện tại bị xóa
      if (selectedOrderId && deleteInfo.hoaDonId === selectedOrderId) {
        selectedOrderId = null;
        onMessageReceived('order-deleted', deleteInfo);
      }
    });

    // Lắng nghe cập nhật đơn hàng đơn lẻ
    stompClient.subscribe('/topic/single-hoa-don', (message) => {
      const singleHoaDonUpdate = JSON.parse(message.body);
      console.log('Received single order update:', singleHoaDonUpdate);
      
      // Chỉ xử lý nếu là đơn hàng đang được chọn
      if (selectedOrderId && singleHoaDonUpdate.hoaDon && 
          singleHoaDonUpdate.hoaDon.id === selectedOrderId) {
        onMessageReceived('single-hoa-don', singleHoaDonUpdate);
      }
    });

    // Lắng nghe thông báo thanh toán thành công
    stompClient.subscribe('/topic/payment-success', (message) => {
      const paymentData = JSON.parse(message.body);
      console.log('Received payment success:', paymentData);
      
      // Chỉ xử lý nếu là đơn hàng đang được chọn
      if (selectedOrderId && paymentData.hoaDon && 
          paymentData.hoaDon.id === selectedOrderId) {
        onMessageReceived('payment-success', paymentData);
      }
    });

    // Lắng nghe thông tin khách hàng (chỉ cho đơn hàng hiện tại)
    stompClient.subscribe('/topic/khach-hang-update', (message) => {
      const khachHangUpdate = JSON.parse(message.body);
      console.log('Received customer update:', khachHangUpdate);
      onMessageReceived('khach-hang-update', khachHangUpdate);
    });

    // Lắng nghe cập nhật voucher cho đơn hàng
    stompClient.subscribe('/topic/voucher-order-update', (message) => {
      const voucherOrderUpdate = JSON.parse(message.body);
      console.log('Received voucher order update:', voucherOrderUpdate);
      
      // Chỉ xử lý nếu là đơn hàng đang được chọn
      if (selectedOrderId && voucherOrderUpdate.hoaDonId === selectedOrderId) {
        onMessageReceived('voucher-order-update', voucherOrderUpdate);
      }
    });

    console.log('All WebSocket subscriptions established for single order mode');
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
      selectedOrderId = null;
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

// Function để chọn đơn hàng từ web
export const selectOrder = (orderId) => {
  if (stompClient && stompClient.connected) {
    const message = {
      action: 'select',
      orderId: orderId,
      timestamp: new Date().toISOString()
    };
    
    stompClient.send('/app/select-order', {}, JSON.stringify(message));
    selectedOrderId = orderId;
    console.log(`Order ${orderId} selected and sent to mobile app`);
  } else {
    console.error('WebSocket not connected. Cannot select order.');
  }
};

// Function để hủy chọn đơn hàng
export const deselectOrder = () => {
  if (stompClient && stompClient.connected) {
    const message = {
      action: 'deselect',
      orderId: selectedOrderId,
      timestamp: new Date().toISOString()
    };
    
    stompClient.send('/app/deselect-order', {}, JSON.stringify(message));
    selectedOrderId = null;
    console.log('Order deselected');
  } else {
    console.error('WebSocket not connected. Cannot deselect order.');
  }
};

// Function để gửi thông báo xóa đơn hàng
export const notifyOrderDeleted = (orderId) => {
  if (stompClient && stompClient.connected) {
    const message = {
      action: 'delete',
      hoaDonId: orderId,
      timestamp: new Date().toISOString()
    };
    
    stompClient.send('/topic/hoa-don-delete', {}, JSON.stringify(message));
    
    // Nếu đơn hàng bị xóa là đơn hiện tại thì clear
    if (selectedOrderId === orderId) {
      selectedOrderId = null;
    }
    
    console.log(`Notified order ${orderId} deleted`);
  } else {
    console.error('WebSocket not connected. Cannot notify order deletion.');
  }
};

// Function để gửi cập nhật customer
export const sendCustomerUpdate = (customerData) => {
  if (stompClient && stompClient.connected) {
    stompClient.send('/topic/khach-hang-update', {}, JSON.stringify(customerData));
    console.log('Customer update sent:', customerData);
  } else {
    console.error('WebSocket not connected. Cannot send customer update.');
  }
};

// Function để gửi cập nhật voucher
export const sendVoucherUpdate = (voucherData) => {
  if (stompClient && stompClient.connected) {
    stompClient.send('/topic/voucher-order-update', {}, JSON.stringify(voucherData));
    console.log('Voucher update sent:', voucherData);
  } else {
    console.error('WebSocket not connected. Cannot send voucher update.');
  }
};

// Utility function để gửi message tùy chỉnh
export const sendMessage = (destination, message) => {
  if (stompClient && stompClient.connected) {
    stompClient.send(destination, {}, JSON.stringify(message));
    console.log(`Message sent to ${destination}:`, message);
  } else {
    console.error('WebSocket not connected. Cannot send message.');
  }
};

// Function để lấy trạng thái kết nối
export const getConnectionStatus = () => {
  return {
    connected: isWebSocketConnected(),
    connecting: isConnecting,
    reconnectAttempts: reconnectAttempts,
    maxReconnectAttempts: maxReconnectAttempts,
    selectedOrderId: selectedOrderId
  };
};

// Function để lấy ID đơn hàng hiện tại
export const getSelectedOrderId = () => {
  return selectedOrderId;
};