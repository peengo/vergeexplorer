<template>
  <div>
    <v-layout align-center justify-center text-xs-center mb-5 mt-3>
      <h1>Verge ({{ $CURRENCY }}) Cryptocurrency Blockchain Explorer</h1>
    </v-layout>

    <v-divider class="my-3 mx-2"></v-divider>

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isInfoAndMarketLoading"></ProgressCircular>

      <v-layout v-else row wrap text-xs-center break-all>
        <v-flex xs12 sm2 md2 py-2>
          <div class="primary--text">{{ info.blocks_rpc | formatNumberUS }}</div>
          <div class="grey--text">Blocks</div>
        </v-flex>

        <v-flex xs12 sm2 md2 py-2>
          <div class="primary--text">{{ info.transactions | formatNumberUS }}</div>
          <div class="grey--text">Transactions</div>
        </v-flex>

        <v-flex xs12 sm3 md2 py-2>
          <div class="primary--text">{{ info.sync | formatPercent }} %</div>
          <div class="grey--text">Synced</div>
        </v-flex>

        <v-flex xs12 sm6 md3 py-2>
          <span
            class="primary--text"
            :inner-html.prop="info.moneysupply | formatAmount | formatMuted"
          ></span>
          &nbsp;
          {{ $CURRENCY }}
          <div class="grey--text">Circulating Supply</div>
        </v-flex>

        <v-flex xs12 sm2 md2 py-2>
          <div class="primary--text">{{ info.subversion | formatSubver }}</div>
          <div class="grey--text">Version</div>
        </v-flex>

        <v-flex xs12 sm2 md2 py-2>
          <div class="warning--text">{{ marketData.usd_market_cap | formatUSD }}</div>
          <div class="grey--text">Market Cap</div>
        </v-flex>

        <v-flex xs12 sm4 md2 py-2>
          <div class="warning--text">{{ marketData.usd_24h_vol | formatUSD }}</div>
          <div class="grey--text">24h volume</div>
        </v-flex>

        <v-flex xs12 sm3 md3 py-2>
          <span class="mr-2 warning--text">${{ marketData.usd }}</span>
          <span
            v-if="marketData.usd_24h_change > 0"
            class="success--text"
          >+{{ marketData.usd_24h_change.toFixed(2) }} %</span>
          <span v-else class="error--text">{{ marketData.usd_24h_change.toFixed(2) }} %</span>
          <div class="grey--text">Price</div>
        </v-flex>
      </v-layout>

      <v-divider class="mt-3 mb-5 mx-2"></v-divider>

      <v-layout row wrap>
        <v-flex xs12 md6 pr-2>
          <Heading :heading="headingBlocks" />

          <v-flex xs12 class="text-xs-right">
            <v-btn
              flat
              icon
              color="primary"
              @click="reloadBlocks"
              :class="{ 'fast-spin': isBlocksSpinnerLoading}"
              v-if="!areBlocksLoading"
              aria-label="Reload Block"
            >
              <v-icon>fas fa-sync-alt</v-icon>
            </v-btn>
          </v-flex>

          <ProgressCircular v-if="areBlocksLoading"></ProgressCircular>

          <template v-else v-for="(block, index) in blocks">
            <div class="pb-2 break-all" :key="block.hash">
              <div class="mb-2">
                <v-icon small class="mr-2">fas fa-cube</v-icon>
                <router-link
                  class="primary--text monospace"
                  :to="{ name: 'block', params: { hash: block.hash }}"
                >{{ block.height }}</router-link>
              </div>

              <v-tooltip top open-delay="0" close-delay="0">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <router-link
                      class="primary--text monospace"
                      :to="{ name: 'block', params: { hash: block.hash }}"
                    >{{ block.hash }}</router-link>
                  </div>
                </template>
                <span>Block hash</span>
              </v-tooltip>

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

        <v-flex xs12 md6 pr-2>
          <Heading :heading="headingTxs" />

          <v-flex xs12 class="text-xs-right">
            <v-btn
              flat
              icon
              color="accent"
              @click="reloadTxs"
              :class="{ 'fast-spin': isTxsSpinnerLoading}"
              v-if="!areTxsLoading"
              aria-label="Reload Transactions"
            >
              <v-icon>fas fa-sync-alt</v-icon>
            </v-btn>
          </v-flex>

          <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

          <template v-else v-for="(tx, index) in txs">
            <div class="pb-2 break-all" :key="tx.txid">
              <div class="mb-2">
                <v-icon small class="mr-2">fas fa-money-check</v-icon>

                <v-tooltip top open-delay="0" close-delay="0">
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <router-link
                        class="accent--text monospace"
                        :to="{ name: 'tx', params: { txid: tx.txid }}"
                      >{{ tx.txid }}</router-link>
                    </div>
                  </template>
                  <span>Transaction Id (txid)</span>
                </v-tooltip>
              </div>
              <div class="text-xs-right">
                <span :inner-html.prop="tx.amountout | formatAmount | formatMuted"></span>
                {{ $CURRENCY }} out
                <v-icon small class="ml-1">fas fa-long-arrow-alt-right</v-icon>
              </div>
              <div class="text-xs-right">
                {{ tx.vout.length}}
                <template v-if="tx.vout.length == 1">recipient</template>
                <template v-else>recipients</template>
              </div>
              <div class="grey--text py-2 text-xs-right">{{ tx.time | formatTimeAgo }}</div>
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
      const [info, blocks, txs] = await Promise.all([
        this.getInfo(),
        this.getBlocks(),
        this.getTxs()
      ]);

      this.info = info;
      this.info.sync = (this.info.blocks_db / this.info.blocks_rpc) * 100;

      if (this.info.sync > 100) this.info.sync = 100;

      this.blocks = blocks;

      this.areBlocksLoading = false;

      this.txs = txs;
      this.areTxsLoading = false;

      this.marketData = await this.getMarketData();
      this.isInfoAndMarketLoading = false;
    } catch (error) {
      this.isError = true;
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
