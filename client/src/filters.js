import Vue from "vue";
import { distanceInWordsStrict } from "date-fns";

Vue.filter("formatAmount", value =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(value)
);

Vue.filter("formatMuted", value => {
  let i = 0;

  for (let j = value.length - 1; j >= 1; j--) {
    if (value[j] === '0') { i++; } else { break; }
  }

  let normal = value.substring(0, value.length - i);
  let muted = value.substring(value.length - i, value.length);

  // mute after the dot
  if (normal.slice(-1) === '.') {
    muted = normal.slice(-1) + muted;
    normal = normal.slice(0, -1);
  }

  value = `${normal}<span class="grey--text text--darken-3">${muted}</span>`;

  return value;
});

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