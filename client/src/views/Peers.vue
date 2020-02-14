<template>
  <div>
    <Heading :heading="heading" />

    <Alert v-if="isError" :error="error" />

    <template v-else>
      <ProgressCircular v-if="isLoading"></ProgressCircular>

      <template v-else>
        <v-layout align-center justify-center>
          <p>The Verge network protocol allows full nodes (peers) to collaboratively maintain a peer-to-peer network for block and transaction exchange</p>
        </v-layout>

        <v-flex
          xs12
          sm10
          offset-sm1
          md8
          offset-md2
          v-for="(peer, index) in peers"
          :key="index"
          class="py-1"
        >
          <v-card>
            <v-card-title>
              <div class="subheading mr-5 grey--text">
                <v-icon small left>fas fa-server</v-icon>Address
              </div>
              <div class="break-all monospace accent--text">{{ peer.addr | formatAddress }}</div>
            </v-card-title>
            <v-divider></v-divider>
            <v-list>
              <v-list-tile>
                <v-list-tile-content class="body-1 grey--text">Connection Time</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ peer.conntime | formatTimeAgo}}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="body-1 grey--text">Version</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ peer.version}}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="body-1 grey--text">Subversion</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ peer.subver | formatSubver}}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
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
      icon: "fas fa-network-wired",
      append: ""
    },
    peers: [],
    error: "There was an error.",
    isError: false,
    isLoading: true
  }),
  async created() {
    try {
      const peers = await this.getPeers();
      this.peers = peers
        .filter(peer => !peer.addr.includes("127.0.0.1"))
        .sort((a, b) => a - b);

      this.heading.append = `(${this.peers.length})`;

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
    }
  }
};
</script>

