<template>
  <v-app dark>
    <v-content>
      <Header />
      <Search />
      <v-container class="py-0">
        <v-layout row wrap>
          <v-flex xs12 xl8 offset-xl2>
            <transition name="fade" mode="out-in">
              <router-view />
            </transition>
          </v-flex>
        </v-layout>
      </v-container>
      <Footer />
    </v-content>
  </v-app>
</template>

<script>
import Header from "./components/layouts/Header.vue";
import Search from "./components/layouts/Search.vue";
import Footer from "./components/layouts/Footer.vue";

export default {
  name: "app",
  components: {
    Header,
    Search,
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

.break-all {
  word-break: break-all;
}

a {
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
