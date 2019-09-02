<template>
  <div>
    <v-toolbar fixed app>
      <router-link :to="{ name: 'home'}">
        <v-toolbar-title class="mr-3 white--text">
          <img style="vertical-align:middle" :src="`${publicPath}logo.png`" alt="logo" class="mr-2" />
          <span class="text-truncate">VergeExplorer</span>
        </v-toolbar-title>
      </router-link>

      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="(item, i) in items" :key="i" :to="item.to">
          <v-icon left color="primary">{{ item.icon }}</v-icon>
          {{item.title}}
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ on }">
          <v-toolbar-side-icon v-on="on" class="hidden-sm-and-up"></v-toolbar-side-icon>
        </template>
        <v-list>
          <v-list-tile v-for="(item, i) in items" :key="i" :to="item.to">
            <v-icon left color="primary">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  data: () => ({
    items: [
      { title: "Home", to: "/", icon: "fas fa-cubes" },
      { title: "Richlist", to: "/richlist", icon: "fas fa-chart-pie" },
      { title: "Peers", to: "/peers", icon: "fas fa-network-wired" }
    ],
    publicPath: process.env.BASE_URL
  })
};
</script>
