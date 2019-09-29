<template>
  <v-footer height="auto" class="mt-5">
    <v-dialog v-model="contactDialog" max-width="400">
      <v-card>
        <v-card-title class="headline justify-center info">Contact</v-card-title>
        <v-card-text class="text-xs-center py-5">
          <v-img :src="`${publicPath}contact.png`" alt="contact" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="contactDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="donationsDialog" max-width="768">
      <v-card>
        <v-card-title class="headline justify-center warning">Donations</v-card-title>
        <v-card-text class="subheading">
          This website was built from scratch. Source code is available on
          <a
            alt="GitHub"
            href="https://github.com/peengo/vergeexplorer"
          >GitHub</a>. Donations are not necesarry but are greatly appreciated. Donations keep this website online. All donations are non-refundable. To show the support you can also use the Binance exchange referral link below.
        </v-card-text>
        <v-card-text class="subheading text-xs-center">VERGE ({{ $CURRENCY }})</v-card-text>
        <v-card-text
          class="text-xs-center monospace success break-all"
        >DEHYYiNA4fb7h59DGPyrDNNoRRF5ZtMmy9</v-card-text>
        <v-card-title class="justify-center">
          <v-img alt="QR Code" :src="qrlink" max-height="256" max-width="256" class="ma-5"></v-img>
        </v-card-title>
        <v-card-text class="text-xs-center">
          <v-btn
            small
            color="warning"
            dark
            flat
            href="https://www.binance.com/?ref=23129601"
          >Buy/Sell @ Binance</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="donationsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-layout justify-center row wrap>
      <v-btn href="https://vergecurrency.com/" flat round><v-icon left>fas fa-globe</v-icon>Official VERGE Website</v-btn>
      <v-btn flat round @click.stop="contactDialog = true">
        <v-icon left small>fas fa-home</v-icon>Contact Us
      </v-btn>
      <v-btn flat round @click.stop="donationsDialog = true">
        <v-icon left small>fas fa-hand-holding-usd</v-icon>Donations
      </v-btn>
      <v-btn href="https://github.com/peengo/vergeexplorer" flat round>
        <v-icon left>fab fa-github</v-icon>GitHub
      </v-btn>
      <v-flex py-3 text-xs-center xs12 class="accent--text">
        VergeExplorer
        <v-icon small>fa fa-copyright</v-icon>&nbsp;2019
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    publicPath: process.env.BASE_URL,
    contactDialog: false,
    donationsDialog: false,
    qrlink: `https://chart.googleapis.com/chart?cht=qr&chl=DEHYYiNA4fb7h59DGPyrDNNoRRF5ZtMmy9&chs=256x256&chld=L%7C0`
  })
};
</script>
