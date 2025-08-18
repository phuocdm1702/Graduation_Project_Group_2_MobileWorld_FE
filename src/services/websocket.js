import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let reconnectDelay = 5000;
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
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

    // Subscribe to essential topics only
    const subscriptions = [
      {
        topic: '/topic/hoa-don-list',
        handler: (message) => {
          const hoaDonList = JSON.parse(message.body);
          console.log('Received order list:', hoaDonList);
          onMessageReceived('hoa-don-list', hoaDonList);
        }
      },
      {
        topic: '/topic/selected-order',
        handler: (message) => {
          const selectedOrder = JSON.parse(message.body);
          console.log('Received selected order:', selectedOrder);
          selectedOrderId = selectedOrder.id;
          onMessageReceived('selected-order', selectedOrder);
        }
      },
      {
        topic: '/topic/hoa-don-delete',
        handler: (message) => {
          const deleteInfo = JSON.parse(message.body);
          console.log('Received order delete:', deleteInfo);
          
          if (selectedOrderId && deleteInfo.hoaDonId === selectedOrderId) {
            selectedOrderId = null;
            onMessageReceived('order-deleted', deleteInfo);
          }
        }
      },
      {
        topic: '/topic/single-hoa-don',
        handler: (message) => {
          const singleHoaDonUpdate = JSON.parse(message.body);
          console.log('Received single order update:', singleHoaDonUpdate);
          
          if (selectedOrderId && singleHoaDonUpdate.hoaDon?.id === selectedOrderId) {
            onMessageReceived('single-hoa-don', singleHoaDonUpdate);
          }
        }
      },
      {
        topic: '/topic/payment-success',
        handler: (message) => {
          const paymentData = JSON.parse(message.body);
          console.log('Received payment success:', paymentData);
          
          if (selectedOrderId && paymentData.hoaDon?.id === selectedOrderId) {
            onMessageReceived('payment-success', paymentData);
          }
        }
      },
      {
        topic: '/topic/khach-hang-update',
        handler: (message) => {
          const khachHangUpdate = JSON.parse(message.body);
          console.log('Received customer update:', khachHangUpdate);
          onMessageReceived('khach-hang-update', khachHangUpdate);
        }
      },
      {
        topic: '/topic/voucher-order-update',
        handler: (message) => {
          const voucherUpdate = JSON.parse(message.body);
          console.log('Received voucher order update:', voucherUpdate);
          onMessageReceived('voucher-order-update', voucherUpdate);
        }
      }
    ];

    // Subscribe to all topics
    subscriptions.forEach(({ topic, handler }) => {
      stompClient.subscribe(topic, handler);
    });

    console.log('All WebSocket subscriptions established');
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
  if (stompClient?.connected) {
    console.log('Disconnecting WebSocket...');
    stompClient.disconnect(() => {
      console.log('WebSocket disconnected successfully');
      stompClient = null;
      selectedOrderId = null;
    });
  }
  isConnecting = false;
  reconnectAttempts = 0;
};

export const isWebSocketConnected = () => {
  return stompClient?.connected || false;
};

export const selectOrder = (orderId) => {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected. Cannot select order.');
    return;
  }

  const message = {
    action: 'select',
    orderId: orderId,
    timestamp: new Date().toISOString()
  };
  
  stompClient.send('/app/select-order', {}, JSON.stringify(message));
  selectedOrderId = orderId;
  console.log(`Order ${orderId} selected and sent to mobile app`);
};

export const deselectOrder = () => {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected. Cannot deselect order.');
    return;
  }

  const message = {
    action: 'deselect',
    orderId: selectedOrderId,
    timestamp: new Date().toISOString()
  };
  
  stompClient.send('/app/deselect-order', {}, JSON.stringify(message));
  selectedOrderId = null;
  console.log('Order deselected');
};

export const notifyOrderDeleted = (orderId) => {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected. Cannot notify order deletion.');
    return;
  }

  const message = {
    action: 'delete',
    hoaDonId: orderId,
    timestamp: new Date().toISOString()
  };
  
  stompClient.send('/topic/hoa-don-delete', {}, JSON.stringify(message));
  
  if (selectedOrderId === orderId) {
    selectedOrderId = null;
  }
  
  console.log(`Notified order ${orderId} deleted`);
};

export const sendMessage = (destination, message) => {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected. Cannot send message.');
    return;
  }

  stompClient.send(destination, {}, JSON.stringify(message));
  console.log(`Message sent to ${destination}:`, message);
};

export const getConnectionStatus = () => {
  return {
    connected: isWebSocketConnected(),
    connecting: isConnecting,
    reconnectAttempts: reconnectAttempts,
    maxReconnectAttempts: maxReconnectAttempts,
    selectedOrderId: selectedOrderId
  };
};

export const getSelectedOrderId = () => {
  return selectedOrderId;
};