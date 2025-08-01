if (typeof global === 'undefined') {
  window.global = window;
}

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');