<template>
  <div>
    <Heading :heading="headingBlock" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>
      <template v-else v-for="(value, name) in block">
        <p v-if="name !=='tx'" :key="name">{{ name }}: {{ value }}</p>
      </template>
    </template>

    <Heading :heading="headingTxs" />

    <ProgressCircular v-if="isLoading"></ProgressCircular>

    <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

    <template v-else>
      <template v-for="tx in txs">
        <div class="pb-2 break-all" :key="tx.txid">
          <v-tooltip top open-delay="0" close-delay="0">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <router-link
                  class="monospace info--text"
                  :to="{ name: 'tx', params: { txid: tx.txid }}"
                >{{ tx.txid }}</router-link>
              </div>
            </template>
            <span>Transaction txid</span>
          </v-tooltip>

          <!-- <router-link
            class="monospace info--text"
            :to="{ name: 'tx', params: { txid: tx.txid }}"
          >{{ tx.txid }}</router-link>-->
          <div class="grey--text">
            <v-icon v-if="tx.vout.length == 1" small left color="grey">fas fa-user</v-icon>
            <v-icon v-else-if="tx.vout.length == 2" small left color="grey">fas fa-user-friends</v-icon>
            <v-icon v-else small left color="grey">fas fa-users</v-icon>
            {{ tx.vout.length }}
            <template v-if="tx.vout.length == 1">recipient</template>
            <template v-else>recipients</template>
          </div>
          <div class="monospace text-xs-right">{{ tx.amountout | formatAmount}} XVG</div>

          <!-- <div v-if="tx.type ==='vin'" class="error--text">
              <v-icon small left color="error">fas fa-minus-square</v-icon>
              {{ tx.value | formatAmount }} XVG
            </div>
            <div v-else-if="tx.type ==='vout'" class="success--text">
              <v-icon small left color="success">fas fa-plus-square</v-icon>
              {{ tx.value | formatAmount }} XVG
            </div>
            <div v-else-if="tx.type ==='both'" class="info--text">
              <v-icon v-if="tx.value.charAt(0) === '-'" small left color="info">fas fa-minus-square</v-icon>
              <v-icon v-else small left color="info">fas fa-plus-square</v-icon>
              {{ tx.value | removeMinus | formatAmount }} XVG
          </div>-->
          <!-- <div class="grey--text py-2">{{ tx.time | formatTime }}</div> -->
          <v-divider></v-divider>
        </div>
      </template>
    </template>

    <v-layout v-if="!isLoading" justify-center class="text-xs-center">
      <v-flex xs12>
        <v-pagination
          v-model="page"
          prev-icon="fas fa-angle-left"
          next-icon="fas fa-angle-right"
          :length="Math.ceil(total/50)"
          total-visible="5"
          @input="input"
        ></v-pagination>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";

export default {
  components: {
    Heading,
    ProgressCircular,
    Alert
  },
  data: () => ({
    headingBlock: {
      title: "Block",
      icon: "fas fa-cube"
    },
    headingTxs: {
      title: "Transactions",
      icon: "fas fa-money-check"
    },
    block: {},
    txs: [],
    total: 0,
    page: 1,
    limit: 50,
    isLoading: true,
    areTxsLoading: false,
    error: "There was an error.",
    isError: false
  }),
  async created() {
    try {
      this.block = await this.getBlock(this.$route.params.hash);

      ({ txs: this.txs, total: this.total } = await this.getBlockTxs(
        this.$route.params.hash,
        this.txs.length,
        this.limit
      ));

      this.isLoading = false;
    } catch (error) {
      console.log(error);
      if (error.response.status == 400 || error.response.status == 404) {
        this.error = error.response.data.error;
        this.isError = true;
      } else if (error.response.status == 500) {
        this.isError = true;
      } else {
        this.$router.push({ path: "/404" });
      }
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async getBlock(hash) {
      const {
        data: { data: block }
      } = await this.$http.get(`/api/block/${hash}`);

      return block;
    },
    async getBlockTxs(hash, skip, limit) {
      const {
        data: { data: txs, total }
      } = await this.$http.get(`/api/block/txs/${hash}/${skip}/${limit}`);

      return { txs, total };
    },
    async input(page) {
      this.areTxsLoading = true;

      ({ txs: this.txs, total: this.total } = await this.getBlockTxs(
        this.$route.params.hash,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areTxsLoading = false;
    }
  }
};
</script>