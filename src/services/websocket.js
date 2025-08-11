import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/hoa-don', (message) => {
      onMessageReceived(JSON.parse(message.body));
      console.log('Received message:', message.body);
      console.log('kết nối web socket thành công');
    });
  });
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect();
  }
};