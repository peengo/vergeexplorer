import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css"; // Ensure you are using css-loader

import "./filters";

import axios from "axios";

Vue.prototype.$http = axios;

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: {
      base: "#37BDE2",
      darken1: "#112134"
    },
    secondary: {
      base: "#647886",
      darken1: "#193D55"
    },
    accent: {
      base: "#DCF0FD",
      lighten1: "#f8f7f7"
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
