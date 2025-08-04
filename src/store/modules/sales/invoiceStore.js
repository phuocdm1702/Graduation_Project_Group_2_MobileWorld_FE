import { defineStore } from 'pinia';
import { debounce } from 'lodash';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    currentInvoice: null,
    paymentMethod: 'cash',
    discountAmount: 0,
    discountInfo: null,
    shippingFee: 0,
    paymentStatus: 'waiting',
    lastUpdate: 0,
    isInitialized: false, // Thêm flag để kiểm tra đã khởi tạo
  }),

  getters: {
    totalItemsPrice: (state) => {
      if (!state.currentInvoice || !state.currentInvoice.items) return 0;
      return state.currentInvoice.items.reduce((total, item) => total + (item.total || 0), 0);
    },

    totalPayment: (state) => {
      const itemsTotal = state.currentInvoice?.items?.reduce((total, item) => total + (item.total || 0), 0) || 0;
      return Math.max(0, itemsTotal - state.discountAmount + state.shippingFee);
    },

    shouldShowQRCode: (state) => {
      return state.currentInvoice && 
             state.currentInvoice.items &&
             state.currentInvoice.items.length > 0 &&
             (state.paymentMethod === 'transfer' || state.paymentMethod === 'both') &&
             state.paymentStatus !== 'completed';
    },

    hasValidInvoice: (state) => {
      return state.currentInvoice && 
             state.currentInvoice.items && 
             state.currentInvoice.items.length > 0;
    },
  },

  actions: {
    setInvoice(invoice) {
      const oldInvoice = this.currentInvoice;
      this.currentInvoice = invoice ? { ...invoice } : null;
      
      // Reset payment status khi thay đổi invoice
      if (!invoice || !invoice.items || invoice.items.length === 0) {
        this.paymentStatus = 'waiting';
      }
      
      this.saveToStorage();
      this.dispatchEvent('invoiceUpdated', { 
        invoice: this.currentInvoice,
        oldInvoice: oldInvoice,
        totalItemsPrice: this.totalItemsPrice,
        totalPayment: this.totalPayment,
        hasValidInvoice: this.hasValidInvoice,
        shouldShowQR: this.shouldShowQRCode
      });
    },

    setPaymentMethod(method) {
      const oldMethod = this.paymentMethod;
      if (method !== oldMethod) {
        this.paymentMethod = method;
        
        // Cập nhật payment status dựa trên method
        if (method === 'cash') {
          this.paymentStatus = 'completed';
        } else if (method === 'transfer' || method === 'both') {
          this.paymentStatus = 'waiting';
        }
        
        this.saveToStorage();
        
        // Dispatch ngay lập tức không debounce
        this.dispatchEventImmediate('paymentMethodUpdated', { 
          paymentMethod: method,
          oldPaymentMethod: oldMethod,
          paymentStatus: this.paymentStatus,
          shouldShowQR: this.shouldShowQRCode,
          totalPayment: this.totalPayment,
          hasValidInvoice: this.hasValidInvoice
        });
        
        this.dispatchEventImmediate('paymentMethodChanged', { 
          paymentMethod: method,
          paymentStatus: this.paymentStatus,
          shouldShowQR: this.shouldShowQRCode,
          hasValidInvoice: this.hasValidInvoice
        });

        console.log('[invoiceStore] Payment method changed:', {
          oldMethod,
          newMethod: method,
          paymentStatus: this.paymentStatus,
          shouldShowQR: this.shouldShowQRCode
        });
      }
    },

    setDiscountAmount(amount, discountInfo = null) {
      const oldAmount = this.discountAmount;
      const oldInfo = this.discountInfo;
      
      if (amount !== oldAmount || JSON.stringify(discountInfo) !== JSON.stringify(oldInfo)) {
        this.discountAmount = amount;
        this.discountInfo = discountInfo ? { ...discountInfo } : null;
        this.saveToStorage();
        
        this.dispatchEvent('discountUpdated', { 
          discountAmount: amount,
          oldDiscountAmount: oldAmount,
          discountInfo: this.discountInfo,
          oldDiscountInfo: oldInfo,
          totalPayment: this.totalPayment,
          totalItemsPrice: this.totalItemsPrice,
          hasValidInvoice: this.hasValidInvoice
        });
        
        this.dispatchEvent('discountChanged', { 
          discountAmount: amount,
          discountInfo: this.discountInfo,
          totalPayment: this.totalPayment,
          hasValidInvoice: this.hasValidInvoice
        });
      }
    },

    setShippingFee(fee) {
      const oldFee = this.shippingFee;
      if (fee !== oldFee) {
        this.shippingFee = fee;
        this.saveToStorage();
        
        this.dispatchEvent('shippingUpdated', { 
          shippingFee: fee,
          oldShippingFee: oldFee,
          totalPayment: this.totalPayment,
          hasValidInvoice: this.hasValidInvoice
        });
        
        this.dispatchEvent('shippingChanged', { 
          shippingFee: fee,
          totalPayment: this.totalPayment,
          hasValidInvoice: this.hasValidInvoice
        });
      }
    },

    setPaymentStatus(status) {
      const oldStatus = this.paymentStatus;
      if (status !== oldStatus) {
        this.paymentStatus = status;
        this.saveToStorage();
        
        this.dispatchEventImmediate('paymentStatusUpdated', { 
          paymentStatus: status,
          oldPaymentStatus: oldStatus,
          shouldShowQR: this.shouldShowQRCode,
          paymentMethod: this.paymentMethod,
          hasValidInvoice: this.hasValidInvoice
        });
        
        this.dispatchEventImmediate('paymentStatusChanged', { 
          paymentStatus: status,
          shouldShowQR: this.shouldShowQRCode,
          paymentMethod: this.paymentMethod,
          hasValidInvoice: this.hasValidInvoice
        });
      }
    },

    clearInvoice() {
      this.currentInvoice = null;
      this.paymentMethod = 'cash';
      this.discountAmount = 0;
      this.discountInfo = null;
      this.shippingFee = 0;
      this.paymentStatus = 'waiting';
      this.lastUpdate = Date.now();
      this.saveToStorage();
      
      this.dispatchEvent('invoiceCleared', {
        currentInvoice: null,
        paymentMethod: 'cash',
        discountAmount: 0,
        discountInfo: null,
        shippingFee: 0,
        paymentStatus: 'waiting',
        hasValidInvoice: false,
        shouldShowQR: false
      });
    },

    addItemToInvoice(item) {
      if (!this.currentInvoice) {
        this.currentInvoice = { 
          invoiceNumber: 'INV-' + Date.now(), 
          cashier: 'Nhân viên bán hàng', 
          items: [] 
        };
      }
      if (!this.currentInvoice.items) {
        this.currentInvoice.items = [];
      }
      this.currentInvoice.items.push({ ...item });
      this.saveToStorage();
      
      this.dispatchEvent('itemAdded', { 
        item: item,
        invoice: this.currentInvoice,
        totalPayment: this.totalPayment,
        totalItemsPrice: this.totalItemsPrice,
        hasValidInvoice: this.hasValidInvoice,
        shouldShowQR: this.shouldShowQRCode
      });
    },

    updateItemInInvoice(itemId, updatedItem) {
      if (this.currentInvoice && this.currentInvoice.items) {
        const index = this.currentInvoice.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
          this.currentInvoice.items[index] = { ...this.currentInvoice.items[index], ...updatedItem };
          this.saveToStorage();
          
          this.dispatchEvent('itemUpdated', { 
            itemId: itemId,
            item: this.currentInvoice.items[index],
            invoice: this.currentInvoice,
            totalPayment: this.totalPayment,
            totalItemsPrice: this.totalItemsPrice,
            hasValidInvoice: this.hasValidInvoice,
            shouldShowQR: this.shouldShowQRCode
          });
        }
      }
    },

    removeItemFromInvoice(itemId) {
      if (this.currentInvoice && this.currentInvoice.items) {
        const removedItem = this.currentInvoice.items.find(item => item.id === itemId);
        this.currentInvoice.items = this.currentInvoice.items.filter(item => item.id !== itemId);
        
        // Nếu không còn item nào, reset payment status
        if (this.currentInvoice.items.length === 0) {
          this.paymentStatus = 'waiting';
        }
        
        this.saveToStorage();
        
        this.dispatchEvent('itemRemoved', { 
          itemId: itemId,
          removedItem: removedItem,
          invoice: this.currentInvoice,
          totalPayment: this.totalPayment,
          totalItemsPrice: this.totalItemsPrice,
          hasValidInvoice: this.hasValidInvoice,
          shouldShowQR: this.shouldShowQRCode
        });
      }
    },

    saveToStorage() {
      try {
        const storeData = {
          currentInvoice: this.currentInvoice,
          paymentMethod: this.paymentMethod,
          discountAmount: this.discountAmount,
          discountInfo: this.discountInfo,
          shippingFee: this.shippingFee,
          paymentStatus: this.paymentStatus,
          timestamp: Date.now(),
          isInitialized: this.isInitialized,
        };
        localStorage.setItem('invoiceStore', JSON.stringify(storeData));
        
        this.dispatchEvent('storeUpdated', {
          ...storeData,
          totalItemsPrice: this.totalItemsPrice,
          totalPayment: this.totalPayment,
          shouldShowQR: this.shouldShowQRCode,
          hasValidInvoice: this.hasValidInvoice
        });
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },

    initializeFromStorage() {
      try {
        const savedData = localStorage.getItem('invoiceStore');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.timestamp > this.lastUpdate) {
            this.currentInvoice = parsed.currentInvoice ? { ...parsed.currentInvoice } : null;
            this.paymentMethod = parsed.paymentMethod || 'cash';
            this.discountAmount = parsed.discountAmount || 0;
            this.discountInfo = parsed.discountInfo || null;
            this.shippingFee = parsed.shippingFee || 0;
            this.paymentStatus = parsed.paymentStatus || 'waiting';
            this.lastUpdate = parsed.timestamp;
            this.isInitialized = true;
            
            this.dispatchEventImmediate('storeInitialized', {
              currentInvoice: this.currentInvoice,
              paymentMethod: this.paymentMethod,
              discountAmount: this.discountAmount,
              discountInfo: this.discountInfo,
              shippingFee: this.shippingFee,
              paymentStatus: this.paymentStatus,
              shouldShowQR: this.shouldShowQRCode,
              totalItemsPrice: this.totalItemsPrice,
              totalPayment: this.totalPayment,
              hasValidInvoice: this.hasValidInvoice,
              isInitialized: true
            });
          }
        } else {
          // Nếu không có dữ liệu saved, đặt isInitialized = true để tránh hiển thị dữ liệu cũ
          this.isInitialized = true;
          this.dispatchEventImmediate('storeInitialized', {
            currentInvoice: null,
            paymentMethod: 'cash',
            discountAmount: 0,
            discountInfo: null,
            shippingFee: 0,
            paymentStatus: 'waiting',
            shouldShowQR: false,
            totalItemsPrice: 0,
            totalPayment: 0,
            hasValidInvoice: false,
            isInitialized: true
          });
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.isInitialized = true;
      }
    },

    // Thêm method dispatch ngay lập tức không debounce
    dispatchEventImmediate(eventName, detail) {
      const event = new CustomEvent(eventName, { 
        detail: {
          ...detail,
          timestamp: Date.now()
        },
        bubbles: true,
        cancelable: true,
      });
      
      window.dispatchEvent(event);
      console.log(`[invoiceStore] Dispatched immediate event: ${eventName}`, detail);
    },

    // Debounced dispatchEvent cho các event khác
    dispatchEvent: debounce(function(eventName, detail) {
      const event = new CustomEvent(eventName, { 
        detail: {
          ...detail,
          timestamp: Date.now()
        },
        bubbles: true,
        cancelable: true,
      });
      
      window.dispatchEvent(event);
      console.log(`[invoiceStore] Dispatched debounced event: ${eventName}`, detail);
    }, 50), // Giảm thời gian debounce xuống 50ms

    setupStorageListener() {
      if (typeof window !== 'undefined') {
        const handleStorageChange = (event) => {
          if (event.key === 'invoiceStore' && event.newValue) {
            try {
              const newData = JSON.parse(event.newValue);
              if (newData.timestamp <= this.lastUpdate) return;
              
              const oldMethod = this.paymentMethod;
              const oldStatus = this.paymentStatus;
              
              this.currentInvoice = newData.currentInvoice ? { ...newData.currentInvoice } : null;
              this.paymentMethod = newData.paymentMethod || 'cash';
              this.discountAmount = newData.discountAmount || 0;
              this.discountInfo = newData.discountInfo || null;
              this.shippingFee = newData.shippingFee || 0;
              this.paymentStatus = newData.paymentStatus || 'waiting';
              this.lastUpdate = newData.timestamp;
              this.isInitialized = newData.isInitialized || true;
              
              // Dispatch payment method change nếu có thay đổi
              if (this.paymentMethod !== oldMethod || this.paymentStatus !== oldStatus) {
                this.dispatchEventImmediate('paymentMethodChanged', {
                  paymentMethod: this.paymentMethod,
                  paymentStatus: this.paymentStatus,
                  shouldShowQR: this.shouldShowQRCode,
                  hasValidInvoice: this.hasValidInvoice
                });
              }
              
              this.dispatchEvent('storeSynced', {
                ...newData,
                shouldShowQR: this.shouldShowQRCode,
                totalItemsPrice: this.totalItemsPrice,
                totalPayment: this.totalPayment,
                hasValidInvoice: this.hasValidInvoice
              });
            } catch (error) {
              console.error('Error parsing storage data:', error);
            }
          }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      }
    },

    forceUpdate() {
      this.dispatchEventImmediate('forceUpdate', {
        currentInvoice: this.currentInvoice,
        paymentMethod: this.paymentMethod,
        discountAmount: this.discountAmount,
        discountInfo: this.discountInfo,
        shippingFee: this.shippingFee,
        paymentStatus: this.paymentStatus,
        shouldShowQR: this.shouldShowQRCode,
        totalItemsPrice: this.totalItemsPrice,
        totalPayment: this.totalPayment,
        hasValidInvoice: this.hasValidInvoice,
        timestamp: Date.now()
      });
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'invoiceStore',
        storage: localStorage,
      },
    ],
  },
});