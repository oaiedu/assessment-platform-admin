<template>
        <v-container
            class="fill-height"
            fluid>
            <v-row
                align="center">
                <v-flex xs12 sm6 offset-sm3>
                    <v-card>
                        <v-card-text>
                            <v-container>
                                <form @submit.prevent="onCreateQuestion">
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="id"
                                                label="ID"
                                                id="id"
                                                v-model="id"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="conhecimento"
                                                label="Conhecimento"
                                                id="conhecimento"
                                                v-model="conhecimento"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="conhecimentoPWR"
                                                label="Conhecimento PWR"
                                                id="conhecimentoPWR"
                                                v-model="conhecimentoPWR"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="conhecimentoBWR"
                                                label="Conhecimento BWR"
                                                id="conhecimentoBWR"
                                                v-model="conhecimentoBWR"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-select
                                            :items="items"
                                            name="assunto"
                                            id="assunto"
                                            v-model="assunto"
                                            solo
                                            ></v-select>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                             <v-container fluid>   
                                                <p>Questão</p>
                                                <v-textarea
                                                    outlined
                                                    filled
                                                    name="description"
                                                    id="description"
                                                    v-model="description">
                                                </v-textarea>
                                            </v-container>
                                        </v-flex>
                                    </v-row>
                                    <v-btn
                                        class="primary"
                                        :disabled="!formIsValid"
                                        type="submit">
                                        Create Question
                                    </v-btn>
                                </form>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-row>
        </v-container>
</template>

<script>
  export default {
    data () {
      return {
        description: '',
        id: '',
        assunto: '',
        conhecimento: '',
        conhecimentoPWR: '',
        conhecimentoBWR: '',
        items: [ 
            'Teoria do Reator',
            'Termodinâmica',
            'Instrumentação e Controle',
            'Válvulas e Bombas',
            'Eletricidade',
            'Mecânica dos Fluidos',
            'Tratamento Qúimico Refrigerante',
            'Análise Integrada',
            'Instrumentação Nuclear',
            'Física Nuclear',
            'Transferência de Calor',
            'Materiais'
        ]
      }
    },
    computed: {
      formIsValid () {
        return this.id !== '' &&
          this.description !== '' &&
          this.conhecimento !== '' &&
          this.conhecimentoPWR !== '' &&
          this.conhecimentoBWR !== '' &&
          this.assunto !== ''
      }
    },
    methods: {
      onCreateQuestion () {
        if (!this.formIsValid) {
          return
        }
        const questionData = {
          id: this.id,
          assunto: this.assunto,
          description: this.description,
          conhecimento: this.conhecimento,
          conhecimentoPWR: this.conhecimentoPWR,
          conhecimentoBWR: this.conhecimentoBWR
        }
        this.$store.dispatch('createQuestion', questionData)
        this.$router.push('/questions')
      }
    }
  }
</script>