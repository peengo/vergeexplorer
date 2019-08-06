<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-coins</v-icon>Richlist
      </h1>
    </v-layout>

    <v-alert :value="true" color="error" v-if="isError">{{ error }}</v-alert>

    <template v-else>
      <ProgressCircular v-if="isRichlistLoading"></ProgressCircular>

      <template v-else>
        <v-data-table
          :headers="headers"
          :items="richlist"
          :pagination.sync="pagination"
          hide-actions
          class="elevation-1 hidden-sm-and-down"
        >
          <template v-slot:items="props">
            <td class="body-2">#{{ props.index + 1 }}</td>
            <td class="body-2 monospace font-weight-bold">
              <router-link
                :to="{ name: 'address', params: { address: props.item.address }}"
              >{{ props.item.address }}</router-link>
              <v-progress-circular class="ml-4" :value="props.item.percentage" width="10"></v-progress-circular>
            </td>
            <td class="body-2 text-xs-right">{{ props.item.balance | formatAmount }}</td>
            <td class="body-2 text-xs-right">
              <v-progress-circular dark indeterminate v-if="isPriceLoading"></v-progress-circular>
              {{ props.item.usd | formatUSD }}
            </td>
            <td class="body-2 text-xs-right">
              <v-progress-circular dark indeterminate v-if="isInfoLoading"></v-progress-circular>
              {{ props.item.percentage }}
            </td>
          </template>
        </v-data-table>

        <v-container fluid grid-list-md hidden-md-and-up>
          <v-data-iterator :items="richlist" hide-actions content-tag="v-layout" row wrap>
            <template v-slot:item="props">
              <v-flex xs12 sm6 md4 lg3>
                <v-card>
                  <v-list-tile>
                    <v-list-tile-sub-title class="text-xs-center">
                      #{{ props.index + 1 }}
                      <v-progress-circular :value="props.item.percentage" width="10" class="mx-4"></v-progress-circular>
                      <v-progress-circular dark indeterminate v-if="isInfoLoading"></v-progress-circular>
                      {{ props.item.percentage }} %
                    </v-list-tile-sub-title>
                  </v-list-tile>
                  <v-divider></v-divider>
                  <v-list dense>
                    <v-list-tile>
                      <v-list-tile-content>
                        <router-link
                          :to="{ name: 'address', params: { address: props.item.address }}"
                          class="monospace break-all caption font-weight-bold"
                        >{{ props.item.address }}</router-link>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <v-list-tile>
                      <v-list-tile-content>Balance</v-list-tile-content>
                      <v-list-tile-content
                        class="align-end"
                      >{{ props.item.balance | formatAmount }} XVG</v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile>
                      <v-list-tile-content>Estimated Worth</v-list-tile-content>
                      <v-list-tile-content class="align-end">
                        <v-progress-circular dark indeterminate v-if="isPriceLoading"></v-progress-circular>
                        {{ props.item.usd | formatUSD }}
                      </v-list-tile-content>
                    </v-list-tile>
                    <!-- <v-list-tile>
                      <v-list-tile-content>
                        <v-progress-circular :value="props.item.percentage" width="10"></v-progress-circular>
                      </v-list-tile-content>
                      <v-list-tile-content class="align-end">
                        <v-progress-circular dark indeterminate v-if="isInfoLoading"></v-progress-circular>
                        {{ props.item.percentage }} %
                      </v-list-tile-content>
                    </v-list-tile>-->
                  </v-list>
                </v-card>
              </v-flex>
            </template>
          </v-data-iterator>
        </v-container>
      </template>
    </template>
  </div>
</template>

<script>
import ProgressCircular from "../components/ProgressCircular.vue";
import { getUSD } from "../mixins.js";

export default {
  mixins: [getUSD],
  components: {
    ProgressCircular
  },
  data: () => ({
    headers: [
      { text: "#", value: "index", sortable: false },
      { text: "Address", value: "address", sortable: false },
      {
        text: "Balance (XVG)",
        value: "balance",
        sortable: false,
        align: "right"
      },
      {
        text: "Estimated Worth",
        value: "usd",
        sortable: false,
        align: "right"
      },
      { text: "%", value: "percentage", sortable: false, align: "center" }
    ],
    pagination: {
      sortBy: "balance",
      descending: true,
      rowsPerPage: -1
    },
    richlist: [],
    error: "There was an error.",
    isError: false,
    isRichlistLoading: true,
    isInfoLoading: true,
    isPriceLoading: true
  }),
  async created() {
    try {
      this.richlist = await this.getRichlist();

      this.isRichlistLoading = false;

      const [moneysupply, usd] = await Promise.all([
        this.getMoneySupply(),
        this.getUSD()
      ]);

      this.richlist = this.richlist.map(item => ({
        ...item,
        percentage: ((item.balance / moneysupply) * 100).toFixed(2),
        usd: (item.balance * usd).toFixed(2)
      }));

      this.isInfoLoading = false;
      this.isPriceLoading = false;
    } catch (error) {
      this.isError = true;
      console.log(error);
    } finally {
      this.isRichlistLoading = false;
      this.isInfoLoading = false;
      this.isPriceLoading = false;
    }
  },
  methods: {
    async getRichlist() {
      const {
        data: { data: richlist }
      } = await this.$http.get("/api/richlist");

      return richlist;
    },

    async getMoneySupply() {
      const {
        data: {
          data: { moneysupply }
        }
      } = await this.$http.get("/api/info");

      return moneysupply;
    }
  }
};
</script>
<style scoped>
td {
  padding: 0 1em !important;
  height: 3em !important;
}
</style>
