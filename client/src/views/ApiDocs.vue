<template>
 <v-container>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8>
        <v-card>    
          <v-card-text>
            <div style="word-break: break-all; text-align: left">
            <h2><strong>API Calls</strong></h2>
            <p>&nbsp;</p>
            
            <p>* <strong>difficulty</strong><br />
            Returns the current difficulty<br />
            <a href="/api/difficulty">/api/difficulty</a></p>

            <p>* <strong>blockcount</strong><br />
            Returns the current block index<br />
            <a href="/api/blockcount">/api/blockcount</a></p>

            <p>* <strong>blockhash </strong>{[block]<br />
            Returns the hash for given block<br />
            <a href="/api/blockhash/3700050">/api/blockhash/3700050</a></p>

            <p>* <strong>block </strong>[hash]<br />
            Returns information about the block with the given hash.<br />
            <a href="/api/block/eae6842875064f49f7d81867e3051d82086eb01175d1bdc45b18109537d6d257">/api/block/eae6842875064f49f7d81867e3051d82086eb01175d1bdc45b18109537d6d257</a></p>

            <p>* <strong>tx </strong>[txid]<br />
            Returns raw transaction representation for given transaction id<br />
            <a href="/api/tx/4ac5d9c51642ab4d94a2a5d460b228d93e4aa6fcf73060f4c21dc881d041c75b">/api/tx/4ac5d9c51642ab4d94a2a5d460b228d93e4aa6fcf73060f4c21dc881d041c75b</a></p>

            <p>* <strong>moneysupply</strong><br />
            Returns current money supply<br />
            <a href="/api/moneysupply">/api/moneysupply</a></p>

            <p>* <strong>moneysupply (plain)</strong><br />
            Returns current money supply as html/plain<br />
            <a href="/api/moneysupply?plain">/api/moneysupply?plain</a></p>

            <p>* <strong>address </strong>[address]<br />
            Returns information for given address<br />
            <a href="/api/address/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S">/api/address/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S</a></p>

            <p>* <strong>balance </strong>[address]<br />
            Returns current balance of given address<br />
            <a href="/api/balance/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S">/api/balance/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S</a></p>

            <p>* <strong>info</strong><br />
            Returns some information<br />
            <a href="/api/info">/api/info</a></p>

            <h2><br />
            <strong>Linking to the block explorer</strong></h2>

            <p>&nbsp;</p>

            <p><strong>transaction </strong>(/tx/txid)<br />
            <a href="/tx/4ac5d9c51642ab4d94a2a5d460b228d93e4aa6fcf73060f4c21dc881d041c75b">/tx/4ac5d9c51642ab4d94a2a5d460b228d93e4aa6fcf73060f4c21dc881d041c75b</a></p>

            <p><strong>block </strong>(/block/hash)<br />
            <a href="/block/eae6842875064f49f7d81867e3051d82086eb01175d1bdc45b18109537d6d257">/block/eae6842875064f49f7d81867e3051d82086eb01175d1bdc45b18109537d6d257</a></p>

            <p><strong>address </strong>(/address/hash)<br />
            <a href="/address/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S">/address/DNvVCjFaic2aWV1zRMeJWxdi6HeVjFmX1S</a></p>

            </div>
          </v-card-text>                    
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
      

