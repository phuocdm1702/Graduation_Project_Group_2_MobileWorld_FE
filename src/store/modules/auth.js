import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: true,
    user: null,
  }),
  actions: {
    login(user) {
      this.isAuthenticated = false;
      this.user = user;
    },
    logout() {
      this.isAuthenticated = true;
      this.user = null;
    },
  },
});