<template>
  <div>
    <v-layout align-center justify-center class="mt-3 mb-5">
      <h1>Verge (XVG) Cryptocurrency Blockchain Explorer</h1>
    </v-layout>

    <v-layout row wrap>
      <!-- <Heading v-bind:heading="headingBlocks" /> -->

      <v-flex xs12 md6>
        <Heading v-bind:heading="headingBlocks" />

        <v-flex xs12 class="text-xs-right">
          <v-btn
            flat
            icon
            color="success"
            @click="reloadBlocks"
            :class="{ 'fa-spin': isBlocksSpinnerLoading}"
          >
            <v-icon>fas fa-sync-alt</v-icon>
          </v-btn>
        </v-flex>

        <ProgressCircular v-if="areBlocksLoading"></ProgressCircular>

        <template v-else v-for="(block, index) in blocks">
          <div class="pb-2 break-all" v-bind:key="block.hash">
            <div class="mb-2">
              <v-icon small class="mr-2">fas fa-cube</v-icon>
              {{ block.height }}
            </div>
            <router-link
              class="success--text monospace"
              :to="{ name: 'block', params: { hash: block.hash }}"
            >{{ block.hash }}</router-link>
            <div>{{ block.confirmations }} confirmations</div>
            <!-- <div>
                {{ block.tx.length }}
                <template v-if="block.tx.length == 1">transaction</template>
                <template v-else>transactions</template>
            </div>-->
            <div class="grey--text py-2">{{ block.time | formatTimeAgo }}</div>
            <v-divider class="mx-2" v-if="index != blocks.length - 1"></v-divider>
          </div>
        </template>
      </v-flex>

      <v-flex xs12 md6>
        <Heading v-bind:heading="headingTxs" />

        <v-flex xs12 class="text-xs-right">
          <v-btn
            flat
            icon
            color="info"
            @click="reloadTxs"
            :class="{ 'fa-spin': isTxsSpinnerLoading}"
          >
            <v-icon>fas fa-sync-alt</v-icon>
          </v-btn>
        </v-flex>

        <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

        <template v-else v-for="(tx, index) in txs">
          <div class="pb-2 break-all" v-bind:key="tx.txid">
            <div class="mb-2">
              <v-icon small class="mr-2">fas fa-money-bill</v-icon>
              <router-link
                class="info--text monospace"
                :to="{ name: 'tx', params: { txid: tx.txid }}"
              >{{ tx.txid }}</router-link>
            </div>
            <div>
              {{ tx.amountout | formatAmount }} XVG out
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
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";

export default {
  components: {
    Heading,
    ProgressCircular
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
    blocks: [],
    txs: [],
    areBlocksLoading: true,
    isBlocksSpinnerLoading: false,
    areTxsLoading: true,
    isTxsSpinnerLoading: false
  }),
  async created() {
    try {
      const [blocks, txs] = await Promise.all([
        this.getBlocks(),
        this.getTxs()
      ]);

      this.blocks = blocks;
      this.areBlocksLoading = false;

      this.txs = txs;
      this.areTxsLoading = false;
    } catch (error) {
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
        setTimeout(() => (this.isBlocksSpinnerLoading = false), 500);
        this.isBlocksSpinnerLoading = true;

        this.areBlocksLoading = true;

        this.blocks = await this.getBlocks();

        this.areBlocksLoading = false;
      } catch (error) {
        console.log(error);
      }
    },
    async reloadTxs() {
      try {
        setTimeout(() => (this.isTxsSpinnerLoading = false), 500);
        this.isTxsSpinnerLoading = true;

        this.areTxsLoading = true;

        this.txs = await this.getTxs();

        this.areTxsLoading = false;
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
