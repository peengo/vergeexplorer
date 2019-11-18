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
          sm8
          offset-sm2
          md6
          offset-md3
          v-for="(peer, index) in peers"
          :key="index"
          class="py-1"
        >
          <v-card>
            <v-list>
              <v-list-tile>
                <v-list-tile-content class="body-1 grey--text monospace">Address</v-list-tile-content>
                <v-list-tile-content
                  class="align-end monospace accent--text"
                >{{ peer.addr | formatAddress }}</v-list-tile-content>
              </v-list-tile>
              <v-divider class="mx-2"></v-divider>
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
      icon: "fas fa-network-wired"
    },
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
    }
  }
};
</script>

