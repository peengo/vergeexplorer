<template>
  <div>
    <v-toolbar fixed app>
      <v-toolbar-title to="/" class="mr-3">
        <v-avatar tile size="34" class="mr-2">
          <img :src="`${publicPath}logo.png`" alt="logo" />
        </v-avatar>VergeExplorer
      </v-toolbar-title>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="(item, i) in items" :key="i" :to="item.to">
          <v-icon left>{{ item.icon }}</v-icon>
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
            <v-icon left>{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <v-container>
      <v-layout row wrap>
        <v-flex xs12 sm10 offset-sm1 md8 offset-md2 xl6 offset-xl3>
          <v-form @submit.prevent="submitSearch">
            <v-text-field
              outline
              autofocus
              clearable
              counter
              solo
              color="white"
              append-icon="fas fa-search"
              label="Search by address, transaction id (txid), block hash or block height"
              v-model="search"
              class="subheading"
            ></v-text-field>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
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
    publicPath: process.env.BASE_URL,
    search: ""
  }),
  methods: {
    async submitSearch() {
      try {
        const search = await this.postSearch();

        console.log(search);
      } catch (error) {
        console.log(error.request);
        console.log(error.response);
      }
    },
    async postSearch() {
      const {
        data: { data: search }
      } = await this.$http.post("/api/search", {
        search: this.search
      });

      return search;
    }
  },
  watch: {
    search(val) {
      // TODO
      if (val) console.log(val.length);
    }
  }
};
</script>
