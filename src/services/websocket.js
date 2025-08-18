import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let isConnecting = false;

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
}