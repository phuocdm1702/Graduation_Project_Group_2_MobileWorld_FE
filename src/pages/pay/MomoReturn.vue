<template>
  <div class="container mt-5">
    <div class="card p-4 shadow-sm text-center">
      <div v-if="loading" class="d-flex flex-column align-items-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Đang xử lý thanh toán Momo...</p>
      </div>
      <div v-else>
        <div v-if="paymentStatus === 'success'">
          <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
          <h2 class="mt-3 text-success">Thanh toán Momo thành công!</h2>
          <p>Mã giao dịch: {{ transactionId }}</p>
          <p>Số tiền: {{ formatPrice(amount) }}</p>
          <p>Cảm ơn bạn đã mua hàng.</p>
        </div>
        <div v-else-if="paymentStatus === 'failed'">
          <i class="bi bi-x-circle-fill text-danger" style="font-size: 3rem;"></i>
          <h2 class="mt-3 text-danger">Thanh toán Momo thất bại!</h2>
          <p>Mã giao dịch: {{ transactionId }}</p>
          <p>Lý do: {{ message }}</p>
          <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
        </div>
        <div v-else>
          <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 3rem;"></i>
          <h2 class="mt-3 text-warning">Lỗi xử lý thanh toán Momo!</h2>
          <p>Lý do: {{ message }}</p>
          <p>Vui lòng liên hệ hỗ trợ nếu vấn đề tiếp diễn.</p>
        </div>
        <button @click="goToSalesPage" class="btn btn-primary mt-4">Quay lại trang bán hàng</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { checkMomoPaymentStatusApi } from '../../store/modules/sales/banHangApi'; // Adjust path as needed
import { formatPrice } from '../../store/modules/sales/banHangUtils'; // Adjust path as needed

export default {
  name: 'MomoReturn',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const paymentStatus = ref('');
    const transactionId = ref('');
    const amount = ref(0);
    const message = ref('');

    const verifyPayment = async () => {
      try {
        const queryParams = route.query;
        const response = await checkMomoPaymentStatusApi(queryParams);

        paymentStatus.value = response.status;
        message.value = response.message;
        transactionId.value = queryParams.orderId || 'N/A';
        amount.value = parseInt(queryParams.amount) || 0;

      } catch (error) {
        paymentStatus.value = 'error';
        message.value = error.message || 'Có lỗi xảy ra khi xác minh thanh toán Momo.';
        console.error('Error verifying Momo payment:', error);
      } finally {
        loading.value = false;
      }
    };

    const goToSalesPage = () => {
      router.push('/banHang'); // Adjust to your sales page route
    };

    onMounted(() => {
      verifyPayment();
    });

    return {
      loading,
      paymentStatus,
      transactionId,
      amount,
      message,
      formatPrice,
      goToSalesPage,
    };
  },
};
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: 50px auto;
  border-radius: 10px;
}
.text-success {
  color: #28a745 !important;
}
.text-danger {
  color: #dc3545 !important;
}
.text-warning {
  color: #ffc107 !important;
}
</style>
