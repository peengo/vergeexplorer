<template>
  <div>
    <Heading :heading="headingTx" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <template v-else>
        <v-layout row wrap>
          <v-flex d-flex xs12 md10 offset-md1>
            <v-card>
              <v-card-title>
                <div class="subheading mr-5 accent--text">
                  <v-icon small left>fas fa-hashtag</v-icon>Transaction ID (txid)
                </div>
                <div class="break-all monospace accent--text">{{ tx.txid }}</div>
              </v-card-title>
              <v-list class="pb-0">
                <v-list-tile v-if="tx.confirmations">
                  <v-list-tile-content class="accent--text">
                    <div>
                      <v-icon small left>fas fa-check</v-icon>Confirmations
                    </div>
                  </v-list-tile-content>
                  <v-list-tile-content
                    class="align-end"
                    :class="{ 'success--text': tx.confirmations >= confirmationSuccess}"
                  >
                    <div>
                      <v-icon
                        v-if="tx.confirmations >= confirmationSuccess"
                        small
                        left
                        color="success"
                      >fas fa-check-double</v-icon>
                      {{ tx.confirmations }}
                    </div>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-else>
                  <v-list-tile-content class="grey--text">
                    <div>
                      <v-icon small left class="grey--text">far fa-hourglass</v-icon>Pending Transaction (still in
                      <router-link :to="{ name: 'pending'}">mempool</router-link>)
                    </div>
                  </v-list-tile-content>
                </v-list-tile>
                <v-card-title>
                  <div class="subheading mr-5 accent--text">
                    <v-icon small left>far fa-clock</v-icon>Time |
                    <span class="caption">Epoch</span>
                  </div>
                  <div class="break-all grey--text">
                    {{ tx.time | formatTime }} |
                    <span class="caption">{{ tx.time }}</span>
                  </div>
                </v-card-title>
                <v-card-title v-if="tx.blockhash">
                  <div class="subheading mr-5 accent--text">
                    <v-icon small left>fas fa-cube</v-icon>Block Hash
                  </div>
                  <div class="break-all monospace primary--text">
                    <router-link
                      :to="{ name: 'block', params: { hash: tx.blockhash }}"
                    >{{ tx.blockhash }}</router-link>
                  </div>
                </v-card-title>
                <v-expansion-panel class="elevation-0" focusable expand v-model="panels">
                  <v-expansion-panel-content>
                    <template v-slot:header>
                      <div class="subheading accent--text">
                        <v-icon small left>fas fa-file-invoice</v-icon>Hex
                      </div>
                    </template>
                    <v-card>
                      <div class="break-all monospace grey--text pa-3 caption">{{ tx.hex }}</div>
                    </v-card>
                    <v-btn flat small block @click="panels = []">
                      <v-icon>fas fa-chevron-up</v-icon>
                    </v-btn>
                  </v-expansion-panel-content>
                  <v-expansion-panel-content>
                    <template v-slot:header>
                      <div class="subheading">
                        <v-icon small left>fas fa-file-alt</v-icon>JSON
                      </div>
                    </template>
                    <v-card>
                      <div align="right">
                        <CopyToClipboard :json="tx" />
                      </div>
                      <code class="break-all pa-3" :inner-html.prop="tx | JSONtoHTML"></code>
                    </v-card>
                    <v-btn flat small block @click="panels = []">
                      <v-icon>fas fa-chevron-up</v-icon>
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout>
      </template>

      <v-layout row wrap>
        <v-flex xs12 md6>
          <heading :heading="headingInputs" class="mt-5" />

          <ProgressCircular v-if="isLoading"></ProgressCircular>

          <ProgressCircular v-if="areInputsLoading"></ProgressCircular>

          <template v-else>
            <template v-for="(input, index) in inputs">
              <div class="break-all" :key="input.address">
                <v-layout align-center justify-space-between row wrap px-2>
                  <template v-if="input.coinbase">
                    <v-flex xs12 class="monospace">
                      <v-icon small left color="warning">fas fa-coins</v-icon>
                      <span class="accent--text">Newly Generated Coins</span>
                      <span class="warning--text ml-2">[coinbase]</span>
                    </v-flex>
                  </template>
                  <template v-else>
                    <v-flex xs12 sm7>
                      <v-tooltip top open-delay="0" close-delay="0">
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <router-link
                              class="monospace error--text"
                              :to="{ name: 'address', params: { address: input.address }}"
                            >{{ input.address }}</router-link>
                          </div>
                        </template>
                        <span>Address</span>
                      </v-tooltip>
                    </v-flex>
                    <v-flex xs12 sm5 class="text-xs-right pa-1">
                      <span :inner-html.prop="input.value | formatAmount | formatMuted"></span>
                      <span class="white--text ml-1">{{ $CURRENCY }}</span>
                    </v-flex>
                    <v-divider class="ma-1" v-if="index != inputs.length - 1"></v-divider>
                  </template>
                </v-layout>
              </div>
            </template>

            <v-layout v-if="totalInputs > limit" justify-center class="text-xs-center mt-3">
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
          <heading :heading="headingRecipients" class="mt-5" />

          <ProgressCircular v-if="isLoading"></ProgressCircular>

          <ProgressCircular v-if="areRecipientsLoading"></ProgressCircular>
          <template v-else>
            <template v-for="(recipient, index) in recipients">
              <div class="break-all" :key="recipient.address">
                <v-layout align-center justify-space-between row wrap px-2>
                  <v-flex xs12 sm7>
                    <v-tooltip top open-delay="0" close-delay="0">
                      <template v-slot:activator="{ on }">
                        <div v-on="on">
                          <router-link
                            class="monospace success--text"
                            :to="{ name: 'address', params: { address: recipient.address }}"
                          >{{ recipient.address }}</router-link>
                        </div>
                      </template>
                      <span>Address</span>
                    </v-tooltip>
                  </v-flex>
                  <v-flex xs12 sm5 class="text-xs-right pa-1">
                    <span :inner-html.prop="recipient.value | formatAmount | formatMuted"></span>
                    <span class="white--text ml-1">{{ $CURRENCY }}</span>
                  </v-flex>
                  <v-divider class="ma-1" v-if="index != recipients.length - 1"></v-divider>
                </v-layout>
              </div>
            </template>

            <v-layout v-if="totalRecipients > limit" justify-center class="text-xs-center mt-3">
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
import CopyToClipboard from "../components/CopyToClipboard.vue";

export default {
  components: {
    Heading,
    ProgressCircular,
    Alert,
    Pagination,
    CopyToClipboard
  },
  data: () => ({
    headingTx: {
      title: "Transaction",
      icon: "fas fa-money-check"
    },
    headingInputs: {
      title: "Inputs",
      icon: "fas fa-sign-in-alt",
      append: ""
    },
    headingRecipients: {
      title: "Recipients",
      icon: "fas fa-sign-out-alt",
      append: ""
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
    confirmationSuccess: 20,
    error: "There was an error.",
    isError: false,
    panels: []
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

      this.headingInputs.append = `(${this.totalInputs})`;
      this.headingRecipients.append = `(${this.totalRecipients})`;

      this.isLoading = false;
    } catch (error) {
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
  },
  async beforeRouteUpdate(to, from, next) {
    try {
      this.isLoading = true;

      this.tx = await this.getTx(to.params.txid);

      this.areInputsLoading = true;
      this.areRecipientsLoading = true;

      this.pageInputs = 1;
      this.pageRecipients = 1;

      const [inputsObj, recipientsObj] = await Promise.all([
        this.getInputs(
          to.params.txid,
          this.pageInputs * this.limit - this.limit,
          this.limit
        ),
        this.getRecipients(
          to.params.txid,
          this.pageRecipients * this.limit - this.limit,
          this.limit
        )
      ]);

      ({ inputs: this.inputs, total: this.totalInputs } = inputsObj);
      ({
        recipients: this.recipients,
        total: this.totalRecipients
      } = recipientsObj);

      this.headingInputs.append = `(${this.totalInputs})`;
      this.headingRecipients.append = `(${this.totalRecipients})`;

      this.areInputsLoading = false;
      this.areRecipientsLoading = false;
      this.isLoading = false;
    } catch (error) {
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

      next();
    }
  }
};
</script>

<style>
code {
  background-color: #252525 !important;
  color: #fff !important;
}
.json-key {
  color: #647886;
}
.json-value {
  color: #dcf0fd;
}
.json-string {
  color: #37bde2;
}
</style>