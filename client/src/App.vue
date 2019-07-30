<template>
  <v-app dark>
    <v-content>
      <Header />
      <v-container>
        <v-layout row wrap>
          <v-flex xs12 xl8 offset-xl2>
            <router-view />
          </v-flex>
        </v-layout>
      </v-container>
      <Footer />
    </v-content>
  </v-app>
</template>

<script>
import Header from "./components/layouts/Header.vue";
import Footer from "./components/layouts/Footer.vue";

export default {
  name: "app",
  components: {
    Header,
    Footer
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Lato&display=swap");
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap");

#app {
  font-family: "Avenir Next", "Lato", Arial, sans-serif;
}

.monospace {
  font-family: "Roboto Mono", monospace;
}

/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
} */
</style>
