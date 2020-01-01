import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueAnalytics from 'vue-analytics'

import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';

import { VLayout } from 'vuetify/lib';

import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);

import "./filters";

import axios from "axios";

Vue.prototype.$http = axios;
Vue.prototype.$filters = Vue.options.filters;
Vue.prototype.$CURRENCY = 'XVG';

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

Vue.use(VueAnalytics, {
  id: 'UA-131786424-1',
  router
})

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
