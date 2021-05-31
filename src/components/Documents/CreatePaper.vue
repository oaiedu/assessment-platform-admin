<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onCreatePaper()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()" class="mr-2">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <h2>Criar novo documento</h2>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-tooltip left>
        <template v-slot:activator='{ on }'>
            <v-btn
                color="blue darken-1"
                class="mr-4"
                v-on="on"
                dark
                fab
                fixed
                bottom
                right
                type="submit" >
                <v-icon color="white">{{ mdiContentSave }}</v-icon>
            </v-btn>
        </template>
        <h3>Salvar</h3>
      </v-tooltip>

      <v-container fluid>
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <h1>Formulário</h1>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-text-field
                          solo
                          flat
                          filled
                          outlined
                          dense
                          label="Título"
                          v-model="paperName"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                          <v-file-input
                            chips
                            multiple
                            dense
                            label="Imagem"
                            v-model="images"
                          />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <VueSimplemde v-model="paperDescription"/>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <h1>Preview</h1>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <Preview
                    :title='paperName'
                    :description='paperDescription' />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <v-snackbar
        v-model="createErrorSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000" >
        <span style='color: white; font-size: 1rem'>
            Um documento com este Título já foi criado!
            <br>
            Por favor, mude o Título.
        </span>
        <template v-slot:action='{ attrs }'>
            <v-btn
                dark
                color="white"
                text
                v-bind='attrs'
                @click="createErrorSnackBar = false" >
                Fechar
            </v-btn>
        </template>
      </v-snackbar>
  </v-card>
</template>

<script>
    import uuid from 'uuid-random';
    import 'simplemde/dist/simplemde.min.css';
    import VueSimplemde from 'vue-simplemde';
    import { mdiClose, mdiContentSave } from '@mdi/js';
    import Preview from './Preview';

    export default {
        name: 'CreatePaper',
        components: { Preview, VueSimplemde },
        data() {
            return {
                mdiClose,
                mdiContentSave,
                createErrorSnackBar: false,
                paperDescription: null,
                paperName: null,
                images: [],
                paperImage: ""
            }
        },
        computed: {
            userInfo() {
                return this.$store.getters.userInfo;
            }
        },
        methods: {
            close() {
                this.setInitialData();
                this.$emit("closeDialogNew");
            },
            setInitialData() {
                this.paperDescription = null,
                this.paperName = null,
                this.paperImage = "",
                this.image = []
            },
            onCreatePaper() {
                if((this.paperName === "" && this.paperDescription === "") || (this.paperName === "" && typeof this.images[0] === 'undefined')){
                    alert('Todos os campos devem ser preenchidos!');
                    return;
                }

                this.$store.dispatch('paperExists', this.paperName)
                    .then(paper => {
                        if(paper.exist) {
                            this.createErrorSnackBar = true;
                        } else {
                            const id = uuid();
                            const paperData = {
                                name: this.paperName,
                                description: this.paperDescription,
                                image: this.paperImage,
                                id,
                                editedBy: null,
                                userId: this.userInfo.id
                            };

                            if(this.images && this.images[0]) {
                                const imageToUpload = { id, name: this.paperName, images: this.images[0] }
                                this.$store.dispatch("uploadImagePaper", imageToUpload)
                                    .then(result => {
                                        paperData.paperImage = result;
                                        this.$store.dispatch("createPaper", { paperData, userInfo: this.userInfo })
                                            .then(() => {
                                                this.$emit("load");
                                                this.close();
                                        });
                                    });
                            } else {
                                this.$store.dispatch("createPaper", { paperData, userInfo: this.userInfo })
                                    .then(() => {
                                        this.$emit("load");
                                        this.close();
                                });
                            }
                        }
                    });
            }
        }
    }
</script>
