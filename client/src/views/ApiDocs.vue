<template>
  <div>
    <Heading :heading="heading" />
    <v-layout align-center justify-center>
      <v-flex xs12 sm8>
        <v-card>
          <v-card-text class="break-all">
            <div v-for="(doc, index) in apiDocs" :key="doc.url">
              <div class="accent--text">{{doc.title}}</div>
              <div>{{doc.description}}</div>
              <div class="my-3 monospace">
                <v-icon small class="mr-2">fas fa-link</v-icon>
                <router-link :to="doc.url" target="_blank">{{doc.url}}</router-link>
              </div>
              <v-divider class="mb-2" v-if="index != apiDocs.length - 1"></v-divider>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>
      
<script>
import Heading from "../components/Heading.vue";
import apiDocs from "../data/apiDocs.json";

export default {
  components: {
    Heading
  },
  data: () => ({
    heading: {
      title: "API Documentation",
      icon: "fas fa-book"
    },
    apiDocs
  })
};
</script>

