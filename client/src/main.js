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
    primary: "#112134",
    secondary: "37BDE2",
    accent: "#DCF0FD"
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
