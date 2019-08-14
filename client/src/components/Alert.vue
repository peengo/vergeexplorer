<template>
  <v-alert :value="true" color="error">{{ error }}</v-alert>
</template>

<script>
export default {
  props: ["error"]
};
</script>
