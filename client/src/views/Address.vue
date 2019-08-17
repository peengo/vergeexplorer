<template>
  <div>
    <Heading :heading="headingAddress" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <v-layout row wrap v-else>
        <v-flex d-flex xs12 md6>
          <v-card>
            <v-card-title>
              <div class="break-all monospace font-weight-bold">{{ address.address }}</div>
            </v-card-title>
            <v-list>
              <v-list-tile>
                <v-list-tile-content>Balance</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ address.balance | formatAmount }} XVG</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Received</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ address.received | formatAmount }} XVG</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Sent</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ address.sent | formatAmount }} XVG</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>

        <v-flex d-flex xs12 md6>
          <v-card>
            <v-list>
              <v-card-title>
                <v-btn @click.stop="dialog = true">
                  <v-icon small left>fas fa-qrcode</v-icon>QR Code
                </v-btn>

                <v-dialog v-model="dialog" max-width="400">
                  <v-card>
                    <v-card-title class="headline">Address QR Code</v-card-title>
                    <v-card-text class="break-all text-xs-center">
                      <h3>{{ address.address }}</h3>
                    </v-card-text>
                    <!-- <img :src="qrlink" alt="QR Code" class="ma-5" /> -->
                    <v-img
                      alt="QR Code"
                      :src="qrlink"
                      max-height="256"
                      max-width="256"
                      class="ma-5"
                    ></v-img>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn flat @click="dialog = false">Close</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-title>
              <v-list-tile>
                <v-list-tile-content>Estimated Worth</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ address.usd | formatUSD }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Transactions</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ total }}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>

      <Heading :heading="headingTxs" />

      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

      <template v-else>
        <template v-for="tx in txs">
          <div class="pb-2 break-all" :key="tx.txid">
            <v-layout align-center justify-space-between row wrap>
              <v-flex xs12 md8>
                <router-link
                  class="monospace info--text"
                  :to="{ name: 'tx', params: { txid: tx.txid }}"
                >{{ tx.txid }}</router-link>
              </v-flex>

              <v-flex xs12 md4>
                <div v-if="tx.type ==='vin'" class="error--text text-xs-right">
                  <v-icon small left color="error">fas fa-minus-square</v-icon>
                  <span :inner-html.prop="tx.value | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">XVG</span>
                </div>
                <div v-else-if="tx.type ==='vout'" class="success--text text-xs-right">
                  <v-icon small left color="success">fas fa-plus-square</v-icon>
                  <span :inner-html.prop="tx.value | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">XVG</span>
                </div>
                <div v-else-if="tx.type ==='both'" class="info--text text-xs-right">
                  <v-icon
                    v-if="tx.value.charAt(0) === '-'"
                    small
                    left
                    color="info"
                  >fas fa-minus-square</v-icon>
                  <v-icon v-else small left color="info">fas fa-plus-square</v-icon>
                  <span :inner-html.prop="tx.value | removeMinus | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">XVG</span>
                </div>
              </v-flex>

              <v-flex xs12 md12>
                <div class="grey--text py-1">{{ tx.time | formatTime }}</div>
                <v-divider class="mx-1"></v-divider>
              </v-flex>
            </v-layout>
          </div>
        </template>
      </template>

      <div v-if="!isLoading" class="text-xs-center">
        <v-layout justify-center>
          <v-flex xs12>
            <Pagination :pagination="{page,total,limit}" @updatePage="updatePage($event)" />
          </v-flex>
        </v-layout>
      </div>
    </template>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";
import Pagination from "../components/Pagination.vue";

import { format } from "date-fns";
import { getMarketData } from "../mixins.js";

export default {
  mixins: [getMarketData],
  components: {
    Heading,
    ProgressCircular,
    Alert,
    Pagination
  },
  data: () => ({
    // headers: [
    //   { text: "Address", value: "address", sortable: false },
    //   { text: "Balance", value: "balance", sortable: false },
    //   { text: "Received", value: "received", sortable: false },
    //   { text: "Sent", value: "sent", sortable: false }
    // ],
    headingAddress: {
      title: "Address",
      icon: "fas fa-address-card"
    },
    headingTxs: {
      title: "Transactions",
      icon: "fas fa-money-check"
    },
    address: {},
    txs: [],
    total: 0,
    page: 1,
    limit: 50,
    qrlink: "",
    dialog: false,
    isLoading: true,
    areTxsLoading: false,
    error: "There was an error.",
    isError: false
  }),
  async created() {
    try {
      this.address = await this.getAddress(this.$route.params.address);
      this.qrlink = `https://chart.googleapis.com/chart?cht=qr&chl=${this.address.address}&chs=256x256&chld=L%7C0`;

      const marketData = await this.getMarketData();
      this.address.usd = (this.address.balance * marketData.usd).toFixed(2);

      ({ txs: this.txs, total: this.total } = await this.getAddressTxs(
        this.$route.params.address,
        this.txs.length,
        this.limit
      ));

      this.isLoading = false;
    } catch (error) {
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
    async getAddress(address) {
      const {
        data: { data: addressData }
      } = await this.$http.get(`/api/address/${address}`);

      return addressData;
    },
    async getAddressTxs(address, skip, limit) {
      const {
        data: { data: txs, total }
      } = await this.$http.get(`/api/address/txs/${address}/${skip}/${limit}`);

      return { txs, total };
    },
    async updatePage(page) {
      this.areTxsLoading = true;

      this.page = page;

      ({ txs: this.txs, total: this.total } = await this.getAddressTxs(
        this.$route.params.address,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areTxsLoading = false;
    }
  },
  async beforeRouteUpdate(to, from, next) {
    try {
      this.isLoading = true;

      this.address = await this.getAddress(to.params.address);
      this.qrlink = `https://chart.googleapis.com/chart?cht=qr&chl=${this.address.address}&chs=256x256&chld=L%7C0`;

      const marketData = await this.getMarketData();
      this.address.usd = (this.address.balance * marketData.usd).toFixed(2);

      this.areTxsLoading = true;
      this.page = 1;

      ({ txs: this.txs, total: this.total } = await this.getAddressTxs(
        to.params.address,
        this.page * this.limit - this.limit,
        this.limit
      ));

      this.areTxsLoading = false;
      this.isLoading = false;
    } catch (error) {
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

      next();
    }
  },
  filters: {
    formatTime(time) {
      return format(new Date(time * 1000), "D MMM YYYY - HH:mm A");
    },
    removeMinus(str) {
      return str.charAt(0) === "-" ? str.slice(1) : str;
    }
  }
};
</script>
