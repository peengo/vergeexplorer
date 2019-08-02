import Vue from "vue";

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