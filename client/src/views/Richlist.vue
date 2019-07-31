<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-coins</v-icon>Richlist
      </h1>
    </v-layout>

    <v-layout align-center justify-center v-if="isRichlistLoading">
      <v-progress-circular :size="50" dark indeterminate></v-progress-circular>
    </v-layout>

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
            <a :href="`/address/${props.item.address }`">{{ props.item.address }}</a>
            <v-progress-circular class="ml-4" :value="props.item.percentage" width="10"></v-progress-circular>
          </td>
          <td class="body-2 text-xs-right">{{ props.item.balance | formatBalance }}</td>
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
                  <v-list-tile-content class="align-center font-weight-bold">#{{ props.index + 1 }}</v-list-tile-content>
                </v-list-tile>
                <v-divider></v-divider>
                <v-list dense>
                  <v-list-tile>
                    <v-list-tile-content class="align-center font-weight-bold">Address</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content class="align-center monospace font-weight-bold">
                      <a :href="`/address/${props.item.address }`">{{ props.item.address }}</a>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-divider></v-divider>
                  <v-list-tile>
                    <v-list-tile-content>Balance</v-list-tile-content>
                    <v-list-tile-content
                      class="align-end"
                    >{{ props.item.balance | formatBalance }} XVG</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Estimated Worth</v-list-tile-content>
                    <v-list-tile-content class="align-end">
                      <v-progress-circular dark indeterminate v-if="isPriceLoading"></v-progress-circular>
                      {{ props.item.usd | formatUSD }}
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <v-progress-circular :value="props.item.percentage" width="10"></v-progress-circular>
                    </v-list-tile-content>
                    <v-list-tile-content class="align-end">
                      <v-progress-circular dark indeterminate v-if="isInfoLoading"></v-progress-circular>
                      {{ props.item.percentage }} %
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-flex>
          </template>
        </v-data-iterator>
      </v-container>
    </template>
  </div>
</template>

<script>
export default {
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
    isRichlistLoading: true,
    isInfoLoading: true,
    isPriceLoading: true
  }),
  async created() {
    try {
      let {
        data: { data: richlist }
      } = await this.$http.get('/api/richlist');

      this.richlist = richlist;
      this.isRichlistLoading = false;

      const {
        data: {
          data: { moneysupply }
        }
      } = await this.$http.get('/api/info');

      this.richlist = this.richlist.map(item => ({
        ...item,
        percentage: ((item.balance / moneysupply) * 100).toFixed(2)
      }));

      this.isInfoLoading = false;

      const coingeckoUrl =
        'https://api.coingecko.com/api/v3/simple/price?ids=verge&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true';

      const {
        data: {
          verge: { usd }
        }
      } = await this.$http.get(coingeckoUrl);

      this.richlist = this.richlist.map(item => ({
        ...item,
        usd: (item.balance * usd).toFixed(2)
      }));

      this.isPriceLoading = false;
    } catch (error) {
      console.log(error);
    }
  },
  filters: {
    formatBalance(balance) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8
      }).format(balance);
    },
    formatUSD(usd) {
      if (usd) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(usd);
      }
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
