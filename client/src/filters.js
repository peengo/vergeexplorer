import Vue from "vue";
import { distanceInWordsStrict, format } from "date-fns";

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

Vue.filter("formatNumberUS", number => {
  if (number) return new Intl.NumberFormat("en-US").format(number);
});

Vue.filter("formatTimeAgo", time =>
  distanceInWordsStrict(Date.now(), new Date(time * 1000), {
    addSuffix: true
  })
);

Vue.filter("formatTime", time =>
  format(new Date(time * 1000), "D MMM YYYY - hh:mm A")
);

Vue.filter("formatSubver", subver =>
  subver.replace(/[/]/g, "")
);

Vue.filter("JSONtoHTML", jsonObj => {
  var library = {};

  library.json = {
    replacer: function (match, pIndent, pKey, pVal, pEnd) {
      var key = "<span class=json-key>";
      var val = "<span class=json-value>";
      var str = "<span class=json-string>";
      var r = pIndent || "";
      if (pKey) r = r + key + pKey.replace(/[": ]/g, "") + "</span>: ";
      if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + "</span>";
      return r + (pEnd || "");
    },
    prettyPrint: function (obj) {
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm;
      return JSON.stringify(obj, null, 3)
        .replace(/&/g, "&amp;")
        .replace(/\\"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(jsonLine, library.json.replacer);
    }
  };

  return library.json.prettyPrint(jsonObj);
});