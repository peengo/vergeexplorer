<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-address-card</v-icon>Address
      </h1>
    </v-layout>
    <h3>{{ $route.params.address }}</h3>
    <h3>{{ txs_total }}</h3>
  </div>
</template>

<script>
export default {
  data: () => ({
    address: {},
    txs: [],
    txs_total: 0
  }),
  created() {
    this.$http
      .get(`/api/address/${this.$route.params.address}`)
      .then(({ data: { data: address } }) => (this.address = address))
      .catch(error => console.log(error));

    this.$http
      .get(`/api/address/txs/${this.$route.params.address}/${this.txs.length}`)
      .then(({ data: { data: txs, total } }) => {
        this.txs = txs;
        this.txs_total = total;
      })
      .catch(error => console.log(error));
  },
  filters: {}
};
</script>
