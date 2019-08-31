import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';

import { VLayout } from 'vuetify/lib';

import "./filters";

import axios from "axios";

Vue.prototype.$http = axios;
Vue.prototype.$CURRENCY = process.env.VUE_APP_CURRENCY;

Vue.use(Vuetify, {
  components: { VLayout },
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
