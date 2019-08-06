<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-wallet</v-icon>Address
      </h1>
    </v-layout>

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
                    <img :src="qrlink" alt="QR Code" class="ma-5" />
                    <!-- <v-img
                      alt="QR Code"
                      :src="qrlink"
                      max-height="256"
                      max-width="256"
                      class="ma-5"
                    ></v-img>-->
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
                <v-list-tile-content class="align-end font-weight-bold">{{ total }}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout align-center justify-center>
        <h1>
          <v-icon large left>fas fa-money-check</v-icon>Transactions
        </h1>
      </v-layout>

      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <v-data-iterator
        :items="txs"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        row
        wrap
        v-else
      >
        <template v-slot:item="props">
          <v-flex xs12>
            <div class="pb-2 break-all" v-bind:key="props.item.txid">
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
                {{ props.item.value | formatAmount }} XVG
              </div>
              <div class="grey--text py-2">{{ props.item.time | formatTime }}</div>
              <v-divider></v-divider>
            </div>
          </v-flex>
        </template>
      </v-data-iterator>

      <!-- <template v-for="tx in txs">
        <div class="pb-2 break-all" v-bind:key="tx.txid">
          <div class="info--text monospace">{{ tx.txid }}</div>
          <div v-if="tx.type ==='vin'" class="error--text">
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
            {{ tx.value | formatAmount }} XVG
          </div>
          <div class="grey--text py-2">{{ tx.time | formatTime }}</div>
          <v-divider></v-divider>
        </div>
      </template>-->
    </template>
  </div>
</template>

<script>
import ProgressCircular from "../components/ProgressCircular.vue";
import { format } from "date-fns";
import { getUSD } from "../mixins.js";

export default {
  mixins: [getUSD],
  components: {
    ProgressCircular
  },
  data: () => ({
    headers: [
      { text: "Address", value: "address", sortable: false },
      { text: "Balance", value: "balance", sortable: false },
      { text: "Received", value: "received", sortable: false },
      { text: "Sent", value: "sent", sortable: false }
    ],
    address: {},
    rowsPerPageItems: [25, 50, 100],
    pagination: {
      rowsPerPage: 50
    },
    txs: [],
    total: 0,
    qrlink: "",
    dialog: false,
    isLoading: true,
    error: "",
    isError: false
  }),
  async created() {
    try {
      this.address = await this.getAddress(this.$route.params.address);
      this.qrlink = `https://chart.googleapis.com/chart?cht=qr&chl=${this.address.address}&chs=256x256&chld=L%7C0`;

      const usd = await this.getUSD();
      this.address.usd = (this.address.balance * usd).toFixed(2);

      ({ txs: this.txs, total: this.total } = await this.getAddressTxs(
        this.$route.params.address,
        this.txs.length
      ));

      this.isLoading = false;
    } catch (error) {
      if (error.response.status == 400 || error.response.status == 404) {
        this.error = error.response.data.error;
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

    async getAddressTxs(address, offset) {
      const {
        data: { data: txs, total }
      } = await this.$http.get(`/api/address/txs/${address}/${offset}`);

      return { txs, total };
    }
  },
  filters: {
    formatTime(time) {
      return format(new Date(time * 1000), "D MMM YYYY - HH:mm A");
    }
  }
};
</script>
