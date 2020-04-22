<template>
    <div>
       <Heading :heading="heading" />
        <v-layout align-center justify-center>
            <v-flex xs12 sm8 >
                <v-card >    
                    <v-card-text >
                        <div style="word-break: break-all; text-align: left">
                            <div v-for="(data) in myJson" :key="data">
                                <li><div class="text"> {{data.api}}  </div></li>                            
                                <div class="text"> {{data.info}}  </div>         
                                <router-link :to="data.example" target="_blank" >{{data.example}}</router-link>        
                                <v-divider></v-divider>
                            </div>              
                        </div>
                    </v-card-text>            
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>
      
<script>
import Heading from "../components/Heading.vue";
import json from "../data/apidoc.json";

export default {
  components: {
    Heading
  },
  data: () => ({      
    heading: {
      title: "API Calls",
      icon: "fas fa-info-circle"
    },    
    myJson: json
  }),
};
</script>

