import Vue from "vue";

export const getMarketData = {
  methods: {
    async getMarketData() {
      const CoinGeckoURL =
        "https://api.coingecko.com/api/v3/simple/price?ids=verge&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";

      const {
        data: {
          verge
        }
      } = await Vue.prototype.$http.get(CoinGeckoURL);

      return verge;
    }
  }
}

export const getInfo = {
  methods: {
    async getInfo() {
      const { data: { data } } = await this.$http.get("/api/info");

      return data;
    }
  }
}

export const scrollTop = {
  methods: {
    scrollTop() {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
  }
}