<template>
    <v-flex xs12>
        <v-container fluid>   
            <p>Respostas</p>
            <v-radio-group v-model="teste">
                <v-row>
                    <v-radio
                    value="radio-1">
                    </v-radio>
                    <v-text-field v-model="respostas[0].text">
                    </v-text-field>
                </v-row>
                <v-row>
                    <v-radio
                    value="radio-2">
                    </v-radio>
                    <v-text-field v-model="respostas[1].text">
                    </v-text-field>
                </v-row>
                <v-row>
                    <v-radio
                    value="radio-3">
                    </v-radio>
                    <v-text-field v-model="respostas[2].text">
                    </v-text-field>
                </v-row>
                <v-row>
                    <v-radio
                    value="radio-4">
                    </v-radio>
                    <v-text-field v-model="respostas[3].text">
                    </v-text-field>
                </v-row>
            </v-radio-group>
        </v-container>
    </v-flex>
</template>

<script>
export default {
    data: () => ({
        teste: null,
        radios: 'aaaa',
        collumns: 2,
        respostas: [
          { text: [], ansId: 'radio-1', value: false },
          { text: '', ansId: 'radio-2', value: false },
          { text: '', ansId: 'radio-3', value: false },
          { text: '', ansId: 'radio-4', value: false }
        ],

    }),
    watch:{
      teste(val){
        this.radios=val
        this.respostas.forEach(element => {
          if(element.ansId===val){
            element.value=true
          }
          else{
            element.value=false
          }
        
        });
      }
    },
}
</script>