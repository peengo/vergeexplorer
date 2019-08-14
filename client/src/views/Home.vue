<template>
  <div>
    <v-layout align-center justify-center text-xs-center class="mt-3 mb-5">
      <h1>Verge (XVG) Cryptocurrency Blockchain Explorer</h1>
    </v-layout>

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isInfoAndMarketLoading"></ProgressCircular>

      <v-layout v-else row wrap text-xs-center break-all>
        <v-flex xs12 sm2 md2 py-2>
          <div>{{ info.blocks_rpc }}</div>
          <div class="grey--text">Blocks</div>
          <!-- <div class="d-block mt-4">{{ info.sync | formatPercent }} %</div>
          <div class="grey--text">Synced</div>-->
        </v-flex>
        <v-flex xs12 sm6 md3 py-2>
          <span :inner-html.prop="info.moneysupply | formatAmount | formatMuted"></span> XVG
          <div class="grey--text">Circulating Supply</div>
        </v-flex>
        <v-flex xs12 sm2 md2 py-2>
          <div>{{ marketData.usd_market_cap | formatUSD }}</div>
          <div class="grey--text">Market Cap</div>
        </v-flex>
        <v-flex xs12 sm4 md2 py-2>
          <div>{{ marketData.usd_24h_vol | formatUSD }}</div>
          <div class="grey--text">24h volume</div>
        </v-flex>
        <v-flex xs12 sm3 md3 py-2>
          <span class="mr-2">${{ marketData.usd }}</span>
          <span
            v-if="marketData.usd_24h_change > 0"
            class="success--text"
          >{{ marketData.usd_24h_change.toFixed(2) }} %</span>
          <span v-else class="error--text">{{ marketData.usd_24h_change.toFixed(2) }} %</span>
          <div class="grey--text">Price</div>
        </v-flex>
        <v-flex xs12 sm3 md2 py-2>
          <div>{{ info.sync | formatPercent }} %</div>
          <div class="grey--text">Synced</div>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        <v-flex xs12 md6>
          <Heading :heading="headingBlocks" />

          <v-flex xs12 class="text-xs-right">
            <v-btn
              flat
              icon
              color="success"
              @click="reloadBlocks"
              :class="{ 'fast-spin': isBlocksSpinnerLoading}"
              v-if="!areBlocksLoading"
            >
              <v-icon>fas fa-sync-alt</v-icon>
            </v-btn>
          </v-flex>

          <ProgressCircular v-if="areBlocksLoading"></ProgressCircular>

          <template v-else v-for="(block, index) in blocks">
            <div class="pb-2 break-all" :key="block.hash">
              <div class="mb-2">
                <v-icon small class="mr-2">fas fa-cube</v-icon>
                {{ block.height }}
              </div>

              <v-tooltip top open-delay="0" close-delay="0">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <router-link
                      class="success--text monospace"
                      :to="{ name: 'block', params: { hash: block.hash }}"
                    >{{ block.hash }}</router-link>
                  </div>
                </template>
                <span>Block hash</span>
              </v-tooltip>

              <!-- <router-link
                class="success--text monospace"
                :to="{ name: 'block', params: { hash: block.hash }}"
              >{{ block.hash }}</router-link>-->
              <div>{{ block.confirmations }} confirmations</div>
              <div>
                {{ block.tx.length }}
                <template v-if="block.tx.length == 1">transaction</template>
                <template v-else>transactions</template>
              </div>
              <div class="grey--text py-2">{{ block.time | formatTimeAgo }}</div>
              <v-divider class="mx-2" v-if="index != blocks.length - 1"></v-divider>
            </div>
          </template>
        </v-flex>

        <v-flex xs12 md6>
          <Heading :heading="headingTxs" />

          <v-flex xs12 class="text-xs-right">
            <v-btn
              flat
              icon
              color="info"
              @click="reloadTxs"
              :class="{ 'fast-spin': isTxsSpinnerLoading}"
              v-if="!areTxsLoading"
            >
              <v-icon>fas fa-sync-alt</v-icon>
            </v-btn>
          </v-flex>

          <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

          <template v-else v-for="(tx, index) in txs">
            <div class="pb-2 break-all" :key="tx.txid">
              <div class="mb-2">
                <v-icon small class="mr-2">fas fa-money-bill</v-icon>

                <v-tooltip top open-delay="0" close-delay="0">
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <router-link
                        class="info--text monospace"
                        :to="{ name: 'tx', params: { txid: tx.txid }}"
                      >{{ tx.txid }}</router-link>
                    </div>
                  </template>
                  <span>Transaction txid</span>
                </v-tooltip>

                <!-- <router-link
                  class="info--text monospace"
                  :to="{ name: 'tx', params: { txid: tx.txid }}"
                >{{ tx.txid }}</router-link>-->
              </div>
              <div>
                <span :inner-html.prop="tx.amountout | formatAmount | formatMuted"></span> XVG out
                <v-icon small right>fas fa-long-arrow-alt-right</v-icon>
              </div>
              <!-- <div>{{ tx.confirmations}} confirmations</div> -->
              <div>
                {{ tx.vout.length}}
                <template v-if="tx.vout.length == 1">recipient</template>
                <template v-else>recipients</template>
              </div>
              <div class="grey--text py-2">{{ tx.time | formatTimeAgo }}</div>
              <v-divider class="mx-2" v-if="index != txs.length - 1"></v-divider>
            </div>
          </template>
        </v-flex>
      </v-layout>
    </template>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";

import { getInfo, getMarketData } from "../mixins.js";

export default {
  mixins: [getInfo, getMarketData],
  components: {
    Heading,
    ProgressCircular,
    Alert
  },
  data: () => ({
    headingBlocks: {
      title: "Blocks",
      icon: "fas fa-cubes"
    },
    headingTxs: {
      title: "Transactions",
      icon: "fas fa-money-check"
    },
    info: {},
    marketData: {},
    blocks: [],
    txs: [],
    isInfoAndMarketLoading: true,
    areBlocksLoading: true,
    isBlocksSpinnerLoading: false,
    areTxsLoading: true,
    isTxsSpinnerLoading: false,
    error: "There was an error.",
    isError: false
  }),
  async created() {
    try {
      const [info, marketData, blocks, txs] = await Promise.all([
        this.getInfo(),
        this.getMarketData(),
        this.getBlocks(),
        this.getTxs()
      ]);

      this.info = info;
      this.info.sync = (this.info.blocks_db / this.info.blocks_rpc) * 100;

      this.marketData = marketData;

      this.isInfoAndMarketLoading = false;

      this.blocks = blocks;

      this.areBlocksLoading = false;

      this.txs = txs;
      this.areTxsLoading = false;
    } catch (error) {
      this.isError = true;
      console.log(error);
    }
  },
  methods: {
    async getBlocks() {
      const {
        data: { data: blocks }
      } = await this.$http.get("/api/latest/blocks");

      return blocks;
    },
    async getTxs() {
      const {
        data: { data: txs }
      } = await this.$http.get("/api/latest/txs");

      return txs;
    },
    async reloadBlocks() {
      try {
        this.areBlocksLoading = true;
        this.isBlocksSpinnerLoading = true;

        this.blocks = await this.getBlocks();

        this.areBlocksLoading = false;
      } catch (error) {
        this.isError = true;
        console.log(error);
      }
    },
    async reloadTxs() {
      try {
        this.areTxsLoading = true;
        this.isTxsSpinnerLoading = true;

        this.txs = await this.getTxs();

        this.areTxsLoading = false;
      } catch (error) {
        this.isError = true;
        console.log(error);
      }
    }
  },
  filters: {
    formatPercent(percent) {
      if (percent) {
        return (Math.floor(percent * 100) / 100).toFixed(2);
      }
    }
  }
};
</script>

<style scoped>
.fast-spin {
  -webkit-animation: fa-spin 0.25s 1 linear;
  animation: fa-spin 0.25s 1 linear;
}
</style>