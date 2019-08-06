<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-network-wired</v-icon>Peers
      </h1>
    </v-layout>

    <v-alert :value="true" color="error" v-if="isError">{{ error }}</v-alert>

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
            <td class="body-2">{{ props.item.conntime | formatDate }}</td>
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
                    <v-list-tile-content class="align-end">{{props.item.conntime | formatDate}}</v-list-tile-content>
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
import ProgressCircular from "../components/ProgressCircular.vue";
import { distanceInWordsStrict } from "date-fns";

export default {
  components: {
    ProgressCircular
  },
  data: () => ({
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
    formatDate(conntime) {
      return distanceInWordsStrict(Date.now(), new Date(conntime * 1000), {
        addSuffix: true
      });
    },
    formatSubver(subver) {
      return subver.replace(/[/]/g, "");
    }
  }
};
</script>

