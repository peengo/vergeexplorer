import Vue from "vue";

export const getUSD = {
  methods: {
    async getUSD() {
      const CoinGeckoURL =
        "https://api.coingecko.com/api/v3/simple/price?ids=verge&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";

      const {
        data: {
          verge: { usd }
        }
      } = await Vue.prototype.$http.get(CoinGeckoURL);

      return usd;
    }
  }
}