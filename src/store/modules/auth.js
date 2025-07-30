// src/store/modules/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: true, 
    user: null,
  }),
  actions: {
    login(user) {
      this.isAuthenticated = true; 
      this.user = user;
    },
    logout() {
      this.isAuthenticated = false; 
      this.user = null;
    },
  },
});