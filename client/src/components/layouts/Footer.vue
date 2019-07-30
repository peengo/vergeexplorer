<template>
  <v-footer height="auto">
    <v-dialog v-model="dialog" max-width="768">
      <v-card>
        <v-card-title class="headline">Use Google's location service?</v-card-title>
        <v-card-text>Let Google help apps determine location.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat="flat" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout justify-center row wrap>
      <v-btn v-for="(item, i) in items" :key="i" flat round @click.stop="dialog = true">
        <v-icon left small>{{ item.icon}}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn href="https://github.com/" flat round>
        <v-icon left>fab fa-github</v-icon>GitHub
      </v-btn>
      <v-flex py-3 text-xs-center xs12>
        VergeExplorer
        <v-icon small>fa fa-copyright</v-icon>&nbsp;2019
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    items: [
      { title: "Contact Us", icon: "fas fa-home" },
      { title: "Donations", icon: "fas fa-hand-holding-usd" }
    ],
    dialog: false
  })
};
</script>
