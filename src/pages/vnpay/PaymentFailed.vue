<template>
  <div class="body py-5">
    <div class="container">
      <div class="w-50 m-auto">
        <h1 class="my-3 text-danger text-center">Thanh toán thất bại</h1>
        <h2 class="my-2">Chi tiết đơn hàng</h2>
        <table class="table table-bordered">
          <tbody>
            <tr>
              <td>Thông tin đơn hàng:</td>
              <td>{{ orderId }}</td>
            </tr>
            <tr>
              <td>Tổng tiền:</td>
              <td>{{ totalPrice }}</td>
            </tr>
            <tr>
              <td>Thời gian thanh toán:</td>
              <td>{{ paymentTime }}</td>
            </tr>
            <tr>
              <td>Mã giao dịch:</td>
              <td>{{ transactionId }}</td>
            </tr>
          </tbody>
        </table>
        <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orderId: '[order ID]',
      totalPrice: '[total price]',
      paymentTime: '[payment time]',
      transactionId: '[transaction ID]'
    };
  }
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>