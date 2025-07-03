<template>
  <div class="container">
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <img src="/images/vnpay-logo.png" style="width: 200px">
            <h2 class="card-title">Thanh Toán Đơn Hàng</h2>
            <form @submit.prevent="submitOrder">
              <div class="form-group">
                <label for="amount">Số tiền:</label>
                <input type="number" class="form-control" id="amount" v-model="amount" required value="299999">
              </div>
              <div class="form-group">
                <label for="orderInfo">Thông tin đơn hàng:</label>
                <input type="text" class="form-control" id="orderInfo" v-model="orderInfo" required value="Thanh toan don hang 2923">
              </div>
              <button type="submit" class="btn btn-primary">Thanh toán</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      amount: 299999,
      orderInfo: 'Thanh toan don hang 2923'
    };
  },
  methods: {
    submitOrder() {
      // Logic to submit order
      this.$router.push('/submitOrder');
    }
  }
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>