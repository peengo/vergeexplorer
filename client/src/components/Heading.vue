<template>
  <v-layout align-center justify-center my-3>
    <h2>
      <v-icon left>{{ heading.icon }}</v-icon>
      {{ heading.title }}
      <template v-if="heading.append">&nbsp;{{ heading.append }}</template>
    </h2>
  </v-layout>
</template>

<script>
export default {
  props: ["heading"]
};
</script>
