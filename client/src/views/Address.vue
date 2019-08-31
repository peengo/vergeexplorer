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
              <v-flex xs12 class="text-xs-center">
                <div class="break-all monospace primary--text">
                  <v-icon small left>fas fa-user</v-icon>
                  {{ address.address }}
                </div>
              </v-flex>
            </v-card-title>
            <v-divider></v-divider>

            <v-card-title class="py-2">
              <v-flex xs12 sm4 class="text-xs-left">
                <div class="subheading mr-5 accent--text">Balance</div>
              </v-flex>
              <v-flex xs12 sm8 class="text-xs-right">
                <div
                  class="subheading break-all"
                >{{ address.balance | formatAmount }} {{ $CURRENCY }}</div>
              </v-flex>
            </v-card-title>

            <v-card-title class="py-2">
              <v-flex xs12 sm4 class="text-xs-left">
                <div class="subheading mr-5 accent--text">Received</div>
              </v-flex>
              <v-flex xs12 sm8 class="text-xs-right">
                <div
                  class="subheading success--text break-all"
                >{{ address.received | formatAmount }} {{ $CURRENCY }}</div>
              </v-flex>
            </v-card-title>

            <v-card-title class="py-2">
              <v-flex xs12 sm4 class="text-xs-left">
                <div class="subheading mr-5 accent--text">Sent</div>
              </v-flex>
              <v-flex xs12 sm8 class="text-xs-right">
                <div
                  class="subheading error--text break-all"
                >{{ address.sent | formatAmount }} {{ $CURRENCY }}</div>
              </v-flex>
            </v-card-title>

            <!-- <v-list>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Balance</v-list-tile-content>
                <v-list-tile-content
                  class="align-end"
                >{{ address.balance | formatAmount }} {{ $CURRENCY }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Received</v-list-tile-content>
                <v-list-tile-content
                  class="align-end success--text"
                >{{ address.received | formatAmount }} {{ $CURRENCY }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Sent</v-list-tile-content>
                <v-list-tile-content
                  class="align-end error--text"
                >{{ address.sent | formatAmount }} {{ $CURRENCY }}</v-list-tile-content>
              </v-list-tile>
            </v-list>-->
          </v-card>
        </v-flex>

        <v-flex d-flex xs12 md6>
          <v-card>
            <v-list>
              <v-card-title class="justify-center">
                <v-btn color="secondary" @click.stop="dialog = true">
                  <v-icon small left>fas fa-qrcode</v-icon>QR Code
                </v-btn>

                <v-dialog v-model="dialog" max-width="400">
                  <v-card>
                    <v-card-title class="headline justify-center primary">Address QR Code</v-card-title>
                    <v-card-text class="break-all text-xs-center">
                      <h3>{{ address.address }}</h3>
                    </v-card-text>
                    <v-card-title class="justify-center">
                      <v-img
                        alt="QR Code"
                        :src="qrlink"
                        max-height="256"
                        max-width="256"
                        class="ma-5"
                      ></v-img>
                    </v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn flat @click="dialog = false">Close</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-title>

              <v-card-title class="py-2">
                <v-flex xs12 sm4 class="text-xs-left">
                  <div class="subheading mr-5 accent--text">Estimated Worth</div>
                </v-flex>
                <v-flex xs12 sm8 class="text-xs-right">
                  <div class="subheading warning--text break-all">{{ address.usd | formatUSD }}</div>
                </v-flex>
              </v-card-title>

              <!-- <v-list-tile>
                <v-list-tile-content class="accent--text">Estimated Worth</v-list-tile-content>
                <v-list-tile-content class="align-end warning--text">{{ address.usd | formatUSD }}</v-list-tile-content>
              </v-list-tile>-->
              <!-- <v-list-tile>
                <v-list-tile-content class="accent--text">Transactions</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ total }}</v-list-tile-content>
              </v-list-tile> -->
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>

      <Heading :heading="headingTxs" class="mt-5 mb-3" />

      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

      <template v-else>
        <template v-for="(tx, index) in txs">
          <div class="pb-2 break-all" :key="tx.txid">
            <v-layout align-center justify-space-between row wrap>
              <v-flex xs12 md8>
                <router-link
                  class="monospace primary--text"
                  :to="{ name: 'tx', params: { txid: tx.txid }}"
                >{{ tx.txid }}</router-link>
              </v-flex>

              <v-flex xs12 md4>
                <div v-if="tx.type ==='vin'" class="error--text text-xs-right">
                  <v-icon small left color="error">fas fa-minus-square</v-icon>
                  <span :inner-html.prop="tx.value | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">{{ $CURRENCY }}</span>
                </div>
                <div v-else-if="tx.type ==='vout'" class="success--text text-xs-right">
                  <v-icon small left color="success">fas fa-plus-square</v-icon>
                  <span :inner-html.prop="tx.value | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">{{ $CURRENCY }}</span>
                </div>
                <div v-else-if="tx.type ==='both'" class="primary--text text-xs-right">
                  <v-icon
                    v-if="tx.value.charAt(0) === '-'"
                    small
                    left
                    color="primary"
                  >fas fa-minus-square</v-icon>
                  <v-icon v-else small left color="primary">fas fa-plus-square</v-icon>
                  <span :inner-html.prop="tx.value | removeMinus | formatAmount | formatMuted"></span>
                  <span class="white--text ml-1">{{ $CURRENCY }}</span>
                </div>
              </v-flex>

              <v-flex xs12 md12>
                <div class="grey--text py-2">{{ tx.time | formatTime }}</div>
                <v-divider class="mx-1" v-if="index != txs.length - 1"></v-divider>
              </v-flex>
            </v-layout>
          </div>
        </template>
      </template>

      <div v-if="!isLoading && (total > limit)" class="text-xs-center">
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
    headingAddress: {
      title: "Address",
      icon: "fas fa-address-card"
    },
    headingTxs: {
      title: "Transactions",
      icon: "fas fa-money-check",
      append: ""
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

      this.headingTxs.append = `(${this.total})`;

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

      this.headingTxs.append = `(${this.total})`;

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
    removeMinus(str) {
      return str.charAt(0) === "-" ? str.slice(1) : str;
    }
  }
};
</script>
