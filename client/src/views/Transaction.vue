<template>
  <div>
    <Heading :heading="heading" />
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";

export default {
  components: {
    Heading
  },
  data: () => ({
    heading: {
      title: "Transaction",
      icon: "fas fa-money-check"
    }
  })
};
</script>