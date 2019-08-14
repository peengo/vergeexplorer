<template>
  <div>
    <Heading :heading="headingTx" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <template v-else v-for="(value, name) in tx">
        <p v-if="name !=='vin' && name !=='vout'" :key="name">{{ name }}: {{ value }}</p>
      </template>

      <v-layout row wrap>
        <v-flex xs12 md6>
          <heading :heading="headingInputs" />

          <ProgressCircular v-if="isLoading"></ProgressCircular>

          <ProgressCircular v-if="areInputsLoading"></ProgressCircular>

          <template v-else>
            <template v-for="(value, name) in inputs">
              <p :key="name">{{ name }}: {{ value }}</p>
            </template>

            <v-layout justify-center class="text-xs-center">
              <v-flex xs12>
                <Pagination
                  :pagination="{page: pageInputs,total: totalInputs,limit}"
                  @updatePage="updateInputsPage($event)"
                />
              </v-flex>
            </v-layout>
          </template>
        </v-flex>

        <v-flex xs12 md6>
          <heading :heading="headingRecipients" />

          <ProgressCircular v-if="isLoading"></ProgressCircular>

          <ProgressCircular v-if="areRecipientsLoading"></ProgressCircular>
          <template v-else>
            <template v-for="(value, name) in recipients">
              <p :key="name">{{ name }}: {{ value }}</p>
            </template>

            <v-layout justify-center class="text-xs-center">
              <v-flex xs12>
                <Pagination
                  :pagination="{page: pageRecipients,total: totalRecipients,limit}"
                  @updatePage="updateRecipientsPage($event)"
                />
              </v-flex>
            </v-layout>
          </template>
        </v-flex>
      </v-layout>
    </template>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";
import Pagination from "../components/Pagination.vue";

export default {
  components: {
    Heading,
    ProgressCircular,
    Alert,
    Pagination
  },
  data: () => ({
    headingTx: {
      title: "Transaction",
      icon: "fas fa-money-check"
    },
    headingInputs: {
      title: "Inputs",
      icon: "fas fa-sign-in-alt"
    },
    headingRecipients: {
      title: "Recipients",
      icon: "fas fa-sign-out-alt"
    },
    tx: {},
    inputs: [],
    recipients: [],
    totalInputs: 0,
    totalRecipients: 0,
    pageInputs: 1,
    pageRecipients: 1,
    limit: 50,
    isLoading: true,
    areInputsLoading: false,
    areRecipientsLoading: false,
    error: "There was an error.",
    isError: false
  }),
  async created() {
    try {
      this.tx = await this.getTx(this.$route.params.txid);

      const [inputsObj, recipientsObj] = await Promise.all([
        this.getInputs(this.$route.params.txid, this.inputs.length, this.limit),
        this.getRecipients(
          this.$route.params.txid,
          this.recipients.length,
          this.limit
        )
      ]);

      ({ inputs: this.inputs, total: this.totalInputs } = inputsObj);
      ({
        recipients: this.recipients,
        total: this.totalRecipients
      } = recipientsObj);

      this.isLoading = false;
    } catch (error) {
      console.log(error);
      if (error.response.status == 400 || error.response.status == 404) {
        this.error = error.response.data.error;
        this.isError = true;
      } else if (error.response.status == 500) {
        this.isError = true;
      } else {
        this.$router.push({ path: "/404" });
      }
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async getTx(txid) {
      const {
        data: { data: tx }
      } = await this.$http.get(`/api/tx/${txid}`);

      return tx;
    },
    async getInputs(txid, skip, limit) {
      const {
        data: { data: inputs, total }
      } = await this.$http.get(`/api/tx/inputs/${txid}/${skip}/${limit}`);

      return { inputs, total };
    },
    async getRecipients(txid, skip, limit) {
      const {
        data: { data: recipients, total }
      } = await this.$http.get(`/api/tx/recipients/${txid}/${skip}/${limit}`);

      return { recipients, total };
    },
    async updateInputsPage(page) {
      this.areInputsLoading = true;

      this.pageInputs = page;

      ({ inputs: this.inputs, total: this.totalInputs } = await this.getInputs(
        this.$route.params.txid,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areInputsLoading = false;
    },
    async updateRecipientsPage(page) {
      this.areRecipientsLoading = true;

      this.pageRecipients = page;

      ({
        recipients: this.recipients,
        total: this.totalRecipients
      } = await this.getRecipients(
        this.$route.params.txid,
        page * this.limit - this.limit,
        this.limit
      ));

      this.areRecipientsLoading = false;
    }
  }
};
</script>