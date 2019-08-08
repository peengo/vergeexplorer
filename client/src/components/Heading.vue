<template>
  <v-layout align-center justify-center>
    <h2>
      <v-icon left>{{ heading.icon }}</v-icon>
      {{ heading.title}}
    </h2>
  </v-layout>
</template>

<script>
export default {
  props: ["heading"]
};
</script>
