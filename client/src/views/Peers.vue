<template>
  <div>
    <Heading :heading="heading" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <template v-else>
        <v-data-table
          :headers="headers"
          :items="peers"
          hide-actions
          class="elevation-1 hidden-xs-only"
        >
          <template v-slot:items="props">
            <td class="body-2 monospace">{{ props.item.addr | formatAddress }}</td>
            <td class="body-2">{{ props.item.conntime | formatTimeAgo }}</td>
            <td class="body-2">{{ props.item.version }}</td>
            <td class="body-2">{{ props.item.subver | formatSubver }}</td>
          </template>
        </v-data-table>

        <!-- <v-container fluid grid-list-md hidden-sm-and-up> -->
        <v-data-iterator
          :items="peers"
          fluid
          grid-list-md
          hidden-sm-and-up
          hide-actions
          row
          wrap
          content-tag="v-layout"
        >
          <template v-slot:item="props">
            <v-flex xs12 class="pa-1">
              <v-card>
                <v-list>
                  <v-list-tile>
                    <v-list-tile-content>Address</v-list-tile-content>
                    <v-list-tile-content
                      class="align-end monospace"
                    >{{props.item.addr | formatAddress }}</v-list-tile-content>
                  </v-list-tile>
                  <v-divider></v-divider>
                  <v-list-tile>
                    <v-list-tile-content>Connection Time</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{props.item.conntime | formatTimeAgo}}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Version</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{props.item.version}}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>Subversion</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{props.item.subver | formatSubver}}</v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-flex>
          </template>
        </v-data-iterator>
        <!-- </v-container> -->
      </template>
    </template>
  </div>
</template>

<script>
import Heading from "../components/Heading.vue";
import ProgressCircular from "../components/ProgressCircular.vue";
import Alert from "../components/Alert.vue";

export default {
  components: {
    Heading,
    ProgressCircular,
    Alert
  },
  data: () => ({
    heading: {
      title: "Peers",
      icon: "fas fa-network-wired"
    },
    headers: [
      { text: "Address", value: "addr", sortable: false },
      { text: "Connection Time", value: "conntime", sortable: false },
      { text: "Version", value: "version", sortable: false },
      { text: "Sub-version", value: "subver", sortable: false }
    ],
    peers: [],
    error: "There was an error.",
    isError: false,
    isLoading: true
  }),
  async created() {
    try {
      this.peers = await this.getPeers();
      this.isLoading = false;
    } catch (error) {
      this.isError = true;
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async getPeers() {
      const {
        data: { data: peers }
      } = await this.$http.get("/api/peers");

      return peers;
    }
  },
  filters: {
    formatAddress(addr) {
      return addr.split(":")[0];
    },
    formatSubver(subver) {
      return subver.replace(/[/]/g, "");
    }
  }
};
</script>

