<template>
  <div>
    <Heading :heading="headingAddress" />

    <v-alert :value="true" color="error" v-if="isError">{{ error }}</v-alert>

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

      <!-- <v-data-iterator
        :items="txs"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        row
        wrap
        v-else
      >
        <template v-slot:item="props">
          <v-flex xs12>
            <div class="pb-2 break-all" :key="props.item.txid">
              <div class="info--text monospace">{{ props.item.txid }}</div>
              <div v-if="props.item.type ==='vin'" class="error--text">
                <v-icon small left color="error">fas fa-minus-square</v-icon>
                {{ props.item.value | formatAmount }} XVG
              </div>
              <div v-else-if="props.item.type ==='vout'" class="success--text">
                <v-icon small left color="success">fas fa-plus-square</v-icon>
                {{ props.item.value | formatAmount }} XVG
              </div>
              <div v-else-if="props.item.type ==='both'" class="info--text">
                <v-icon
                  v-if="props.item.value.charAt(0) === '-'"
                  small
                  left
                  color="info"
                >fas fa-minus-square</v-icon>
                <v-icon v-else small left color="info">fas fa-plus-square</v-icon>
                {{ props.item.value | removeMinus | formatAmount }} XVG
              </div>
              <div class="grey--text py-2">{{ props.item.time | formatTime }}</div>
              <v-divider></v-divider>
            </div>
          </v-flex>
        </template>
      </v-data-iterator>-->

      <!-- <div v-else class="text-xs-center">
        <v-layout justify-center>
          <v-flex xs12>
            <v-card>
              <v-card-text>
                <v-pagination
                  v-model="page"
                  prev-icon="fas fa-angle-left"
                  next-icon="fas fa-angle-right"
                  :length="Math.ceil(total/50)"
                  total-visible="4"
                  @input="input"
                ></v-pagination>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </div>-->

      <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

      <template v-else>
        <template v-for="tx in txs">
          <div class="pb-2 break-all" :key="tx.txid">
            <router-link
              class="monospace info--text"
              :to="{ name: 'tx', params: { txid: tx.txid }}"
            >{{ tx.txid }}</router-link>
            <div v-if="tx.type ==='vin'" class="error--text monospace text-xs-right">
              <v-icon small left color="error">fas fa-minus-square</v-icon>
              {{ tx.value | formatAmount }} XVG
            </div>
            <div v-else-if="tx.type ==='vout'" class="success--text monospace text-xs-right">
              <v-icon small left color="success">fas fa-plus-square</v-icon>
              {{ tx.value | formatAmount }} XVG
            </div>
            <div v-else-if="tx.type ==='both'" class="info--text monospace text-xs-right">
              <v-icon v-if="tx.value.charAt(0) === '-'" small left color="info">fas fa-minus-square</v-icon>
              <v-icon v-else small left color="info">fas fa-plus-square</v-icon>
              {{ tx.value | removeMinus | formatAmount }} XVG
            </div>
            <div class="grey--text py-2">{{ tx.time | formatTime }}</div>
            <v-divider></v-divider>
          </div>
        </template>
      </template>

      <div v-if="!isLoading" class="text-xs-center">
        <v-layout justify-center>
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
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import { format } from "date-fns";
import { getMarketData } from "../mixins.js";

export default {
  mixins: [getMarketData],
  components: {
    Heading,
    ProgressCircular
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
    rowsPerPageItems: [25, 50, 100],
    pagination: {
      rowsPerPage: 50
    },
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

    // prevPage() {
    //   console.log("prev");
    // },
    // nextPage() {
    //   console.log("next");
    // },
    async input(page) {
      this.areTxsLoading = true;

      ({ txs: this.txs, total: this.total } = await this.getAddressTxs(
        this.$route.params.address,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areTxsLoading = false;
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
