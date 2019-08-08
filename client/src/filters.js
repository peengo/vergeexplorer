import Vue from "vue";
import { distanceInWordsStrict } from "date-fns";

Vue.filter("formatAmount", value =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(value)
);

Vue.filter("formatUSD", usd => {
  if (usd) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(usd)
  }
});

Vue.filter("formatTimeAgo", time =>
  distanceInWordsStrict(Date.now(), new Date(time * 1000), {
    addSuffix: true
  })
);