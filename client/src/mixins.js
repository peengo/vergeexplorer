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

import { pools } from "./utils/pools.js";

export const matchPool = {
  methods: {
    matchPool(coinbase) {
      const decodedHex = this.$filters.coinbaseToMiner(coinbase);
      const unknown = { name: "Unknown" };

      for (const poolKey of Object.keys(pools)) {
        if (decodedHex.includes(poolKey)) return pools[poolKey];
      }

      return unknown;
    }
  }
}

export const handleErrors = {
  methods: {
    handleErrors(error) {
      if (error.response.status == 400 || error.response.status == 404) {
        this.error = error.response.data.error;
        this.isError = true;
      } else if (error.response.status == 500) {
        this.isError = true;
      } else {
        this.$router.push({ path: "/404" });
      }
    }
  }
}
