<template>
  <v-tooltip v-model="copyTooltipShow" left>
    <template v-slot:activator="{ on }">
      <v-btn
        flat
        class="warning--text"
        v-clipboard:copy="JSON.stringify(json, null, 3)"
        v-clipboard:success="onCopy"
        v-on="on"
      >
        <v-icon small left>fas fa-copy</v-icon>Copy
      </v-btn>
    </template>
    <span>Copied</span>
  </v-tooltip>
</template>

<script>
export default {
  props: ["json"],
  data: () => ({
    copyTooltipShow: false
  }),
  methods: {
    onCopy() {
      this.copyTooltipShow = true;
      setTimeout(() => {
        this.copyTooltipShow = false;
      }, 750);
    }
  }
};
</script>
