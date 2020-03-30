import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Block from "./views/Block.vue";
import Transaction from "./views/Transaction.vue";
import Peers from "./views/Peers.vue";
import Richlist from "./views/Richlist.vue";
import Address from "./views/Address.vue";
import Pending from "./views/Pending.vue";
import APIinfo from "./views/APIinfo.vue";

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
      path: "/block/:hash",
      name: "block",
      component: Block
    },
    {
      path: "/tx/:txid",
      name: "tx",
      component: Transaction
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
      path: "/pending",
      name: "pending",
      component: Pending
    },
    {
      path: "/APIinfo",
      name: "APIinfo",
      component: APIinfo
    },

    {
      path: "*",
      component: NotFound,
    },
    {
      path: "/404",
      component: NotFound,
    }
  ]
});
