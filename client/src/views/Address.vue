<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-wallet</v-icon>Address
      </h1>
    </v-layout>
    <!-- <h3>{{ $route.params.address }}</h3>
    <h3>{{ txs_total }}</h3>-->

    <!-- <v-data-table :headers="headers" :items="address" hide-actions class="elevation-1">
      <template v-slot:items="props">
        <td class="body-2">{{ props.item.address }}</td>
        <td class="body-2">{{ props.item.balance | formatAmount }}</td>
        <td class="body-2">{{ props.item.received | formatAmount }}</td>
        <td class="body-2">{{ props.item.sent | formatAmount }}</td>
      </template>
    </v-data-table>-->

    <v-alert :value="true" color="error" v-if="isError">{{ error }}</v-alert>

    <template v-else>
      <v-layout align-center justify-center v-if="isLoading">
        <v-progress-circular :size="50" dark indeterminate></v-progress-circular>
      </v-layout>

      <v-layout row wrap v-else>
        <v-flex d-flex xs12 md6>
          <v-card>
            <v-card-title>
              <div class="break-all monospace font-weight-bold">{{ address.address }}</div>
            </v-card-title>
            <!-- <v-divider></v-divider> -->
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
                <!-- <img alt="QR Code" :src="qrlink" /> -->
                <!-- <v-img alt="QR Code" :src="qrlink" max-height="128" max-width="128"></v-img> -->
                <v-btn @click.stop="dialog = true">
                  <v-icon small left>fas fa-qrcode</v-icon>QR Code
                </v-btn>

                <v-dialog v-model="dialog" max-width="400">
                  <v-card>
                    <v-card-title class="headline">Address QR Code</v-card-title>
                    <v-card-text class="break-all text-xs-center">
                      <h3>{{ address.address }}</h3>
                    </v-card-text>
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
                <v-list-tile-content class="align-end font-weight-bold">{{ txs_total }}</v-list-tile-content>
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
    </template>
  </div>
</template>

<script>
import { getUSD } from "../mixins.js";

export default {
  mixins: [getUSD],
  data: () => ({
    headers: [
      { text: "Address", value: "address", sortable: false },
      { text: "Balance", value: "balance", sortable: false },
      { text: "Received", value: "received", sortable: false },
      { text: "Sent", value: "sent", sortable: false }
    ],
    address: {},
    txs: [],
    txs_total: 0,
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

      ({ txs: this.txs, total: this.txs_total } = await this.getAddressTxs(
        this.$route.params.address,
        this.txs.length
      ));

      const usd = await this.getUSD();
      this.address.usd = (this.address.balance * usd).toFixed(2);

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
  }
};
</script>
