<template>
  <v-pagination
    v-model="pagination.page"
    prev-icon="fas fa-angle-left"
    next-icon="fas fa-angle-right"
    :length="Math.ceil(pagination.total/pagination.limit)"
    total-visible="5"
    @input="input"
  ></v-pagination>
</template>

<script>
export default {
  props: ["pagination"],
  data: () => ({
    page: Number
  }),
  methods: {
    input() {
      this.page = this.pagination.page;
      this.$emit("updatePage", this.page);
    }
  }
};
</script>
