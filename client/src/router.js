import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Peers from "./views/Peers.vue";
import Richlist from "./views/Richlist.vue";
import Address from "./views/Address.vue";
import NotFound from "./views/NotFound.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/richlist",
      name: "richlist",
      component: Richlist
    },
    {
      path: "/peers",
      name: "peers",
      component: Peers
    },
    {
      path: "/address/:address",
      name: "address",
      component: Address
    },
    {
      path: "*",
      name: "notFound",
      component: NotFound
    }
  ]
});
