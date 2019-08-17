<template>
  <v-container class="pb-0 pt-3">
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
            label="Search by address, txid (transaction id), block hash or block height"
            v-model="search"
            class="subheading"
            :error-messages="searchError"
            @click:append="submitSearch"
            @click:clear="searchError =''"
          ></v-text-field>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    search: "",
    searchError: ""
  }),
  methods: {
    async submitSearch() {
      try {
        this.searchError = "";

        if (this.search.length > 0) {
          if (this.search.length != 51) {
            const search = await this.postSearch();

            if (search.redirect) {
              this.$router.push({ path: search.redirect });
            }

            this.search = "";
          } else {
            this.searchError =
              "Warning! You have entered 51 characters which is usually associated with the length of a Private Key. It is important that these are kept private! For security purposes your search parameter was not sent to the server.";
            this.search = "";
          }
        }
      } catch (error) {
        if (error.response.data.error) {
          this.searchError = error.response.data.error;
        }
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
    $route() {
      this.searchError = "";
    }
  }
};
</script>
