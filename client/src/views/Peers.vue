<template>
  <div>
    <v-layout align-center justify-center>
      <h1>
        <v-icon large left>fas fa-network-wired</v-icon>Peers
      </h1>
    </v-layout>

    <v-layout align-center justify-center v-if="isLoading">
      <v-progress-circular :size="50" dark indeterminate></v-progress-circular>
    </v-layout>

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
              <v-card-title>
                <v-list-tile-content>Address</v-list-tile-content>
                <v-list-tile-content>
                  {{
                  props.item.addr | formatAddress
                  }}
                </v-list-tile-content>
              </v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-tile>
                  <v-list-tile-content>Connection Time</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    {{
                    props.item.conntime | formatDate
                    }}
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>Version</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    {{
                    props.item.version
                    }}
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>Subversion</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    {{
                    props.item.subver | formatSubver
                    }}
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </template>
      </v-data-iterator>
      <!-- </v-container> -->
    </template>
  </div>
</template>

<script>
import { /* format, */ distanceInWordsStrict } from "date-fns";

export default {
  data: () => ({
    headers: [
      { text: "Address", value: "addr", sortable: false },
      { text: "Connection Time", value: "conntime", sortable: false },
      { text: "Version", value: "version", sortable: false },
      { text: "Sub-version", value: "subver", sortable: false }
    ],
    peers: [],
    isLoading: true
  }),
  created() {
    this.$http
      .get(`${this.$host}/peers`)
      .then(({ data: { data: peers } }) => {
        this.peers = peers;
        this.isLoading = !this.isLoading;
      })
      .catch(error => console.error(error));
  },
  filters: {
    formatAddress(addr) {
      return addr.split(":")[0];
    },
    formatDate(conntime) {
      // return format(new Date(conntime * 1000), "DD MMM YYYY - HH:mm A");
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
