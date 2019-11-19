<template>
  <div>
    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <template v-else>
        <v-layout justify-space-between row>
          <v-btn
            v-if="block.previousblockhash"
            fab
            icon
            :to="{ name: 'block', params: { hash: block.previousblockhash }}"
            class="primary--text"
            aria-label="Previous Block"
          >
            <v-icon>fas fa-angle-left</v-icon>
          </v-btn>

          <Heading :heading="headingBlock" />

          <v-btn
            v-if="block.nextblockhash"
            fab
            icon
            :to="{ name: 'block', params: { hash: block.nextblockhash }}"
            class="primary--text"
            aria-label="Next Block"
          >
            <v-icon>fas fa-angle-right</v-icon>
          </v-btn>
        </v-layout>
      </template>

      <v-layout row wrap>
        <v-flex d-flex xs12 md6>
          <v-card>
            <v-card-title>
              <div class="subheading mr-5 accent--text">
                <v-icon small left>fas fa-hashtag</v-icon>Hash
              </div>
              <div class="break-all monospace primary--text">{{ block.hash }}</div>
            </v-card-title>
            <v-list>
              <v-list-tile>
                <v-list-tile-content class="accent--text">
                  <div>
                    <v-icon small left>fas fa-level-up-alt</v-icon>Height
                  </div>
                </v-list-tile-content>
                <v-list-tile-content class="align-end">{{ block.height }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="accent--text">
                  <div>
                    <v-icon small left>fas fa-check</v-icon>Confirmations
                  </div>
                </v-list-tile-content>
                <v-list-tile-content
                  class="align-end"
                  :class="{ 'success--text': block.confirmations >= confirmationSuccess}"
                >
                  <div>
                    <v-icon
                      v-if="block.confirmations >= confirmationSuccess"
                      small
                      left
                      color="success"
                    >fas fa-check-double</v-icon>
                    {{ block.confirmations }}
                  </div>
                </v-list-tile-content>
              </v-list-tile>
              <v-card-title>
                <div class="subheading mr-5 accent--text">
                  <v-icon small left>far fa-clock</v-icon>Time |
                  <span class="caption">Epoch</span>
                </div>
                <div class="break-all grey--text">
                  {{ block.time | formatTime }} |
                  <span class="caption">{{ block.time }}</span>
                </div>
              </v-card-title>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Nonce</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ block.nonce }}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>

        <v-flex d-flex xs12 md6>
          <v-card>
            <v-list>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Bits</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ block.bits }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Version</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ block.version }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="accent--text">Size</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ block.size | toKilobyte }}</v-list-tile-content>
              </v-list-tile>
              <v-card-title>
                <div class="subheading mr-5 accent--text">Difficulty</div>
                <div class="break-all">{{ block.difficulty }}</div>
              </v-card-title>
              <v-card-title>
                <div class="subheading mr-5 accent--text">Merkle Root</div>
                <div class="break-all monospace grey--text">{{ block.merkleroot }}</div>
              </v-card-title>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </template>

    <Heading :heading="headingTxs" class="mt-5 mb-3" />

    <ProgressCircular v-if="isLoading"></ProgressCircular>

    <ProgressCircular v-if="areTxsLoading"></ProgressCircular>

    <template v-else>
      <template v-for="tx in txs">
        <div class="pb-2 break-all" :key="tx.txid">
          <v-layout align-center justify-space-between row wrap>
            <v-flex xs12 md8>
              <v-tooltip top open-delay="0" close-delay="0">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <router-link
                      class="monospace accent--text"
                      :to="{ name: 'tx', params: { txid: tx.txid }}"
                    >{{ tx.txid }}</router-link>
                  </div>
                </template>
                <span>Transaction Id (txid)</span>
              </v-tooltip>
            </v-flex>
            <v-flex xs12 md4>
              <div class="text-xs-right">
                <span :inner-html.prop="tx.amountout | formatAmount | formatMuted"></span>
                {{ $CURRENCY }}
              </div>
            </v-flex>
            <v-flex xs12 md12>
              <div class="grey--text py-1">
                <v-icon v-if="tx.vout.length == 1" small left color="grey">fas fa-user</v-icon>
                <v-icon v-else-if="tx.vout.length == 2" small left color="grey">fas fa-user-friends</v-icon>
                <v-icon v-else small left color="grey">fas fa-users</v-icon>
                {{ tx.vout.length }}
                <template v-if="tx.vout.length == 1">recipient</template>
                <template v-else>recipients</template>
              </div>
            </v-flex>
          </v-layout>
          <v-divider class="ma-1"></v-divider>
        </div>
      </template>
    </template>

    <v-layout v-if="!isLoading && (total > limit)" justify-center class="text-xs-center">
      <v-flex xs12>
        <Pagination :pagination="{page,total,limit}" @updatePage="updatePage($event)" />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";
import Pagination from "../components/Pagination.vue";

export default {
  components: {
    Heading,
    ProgressCircular,
    Alert,
    Pagination
  },
  data: () => ({
    headingBlock: {
      title: "Block",
      icon: "fas fa-cube"
    },
    headingTxs: {
      title: "Transactions",
      icon: "fas fa-money-check",
      append: ""
    },
    block: {},
    txs: [],
    total: 0,
    page: 1,
    limit: 50,
    isLoading: true,
    areTxsLoading: false,
    confirmationSuccess: 20,
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

      this.headingTxs.append = `(${this.txs.length})`;

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
      this.areTxsLoading = false;
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
    async updatePage(page) {
      this.areTxsLoading = true;

      this.page = page;

      ({ txs: this.txs, total: this.total } = await this.getBlockTxs(
        this.$route.params.hash,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areTxsLoading = false;
    }
  },
  async beforeRouteUpdate(to, from, next) {
    try {
      this.block = {};
      this.txs = [];

      this.isLoading = true;

      this.block = await this.getBlock(to.params.hash);

      this.areTxsLoading = true;
      this.page = 1;

      ({ txs: this.txs, total: this.total } = await this.getBlockTxs(
        to.params.hash,
        this.page * this.limit - this.limit,
        this.limit
      ));

      this.headingTxs.append = `(${this.txs.length})`;

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
      this.areTxsLoading = false;

      next();
    }
  },
  filters: {
    toKilobyte(size) {
      return `${(size / 1024).toFixed(2)} kB`;
    }
  }
};
</script>