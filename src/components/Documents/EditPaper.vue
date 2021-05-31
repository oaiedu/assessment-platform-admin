<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onEditPaper()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()" class="mr-2">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <h2>Editar documento</h2>
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
                          label="Paper name"
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
            <v-row fill-width>
              <v-col cols="12">
                <v-card>
                  <v-card-title>{{name}}</v-card-title>
                  <v-row justify="center">
                    <img v-if="hasImage" :src="paperImage" style="max-width: 400px">
                  </v-row>
                  <v-card-text>{{paperDescription}}</v-card-text>
                </v-card>
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
    import 'simplemde/dist/simplemde.min.css';
    import VueSimplemde from 'vue-simplemde';
    import { mdiClose, mdiContentSave } from '@mdi/js';

    export default {
        props: ["paper"],
        components: { VueSimplemde },
        data() {
            return {
                mdiClose,
                mdiContentSave,
                createErrorSnackBar: false,
                paperDescription: "",
                paperName: "",
                images: [],
                paperImage: ""
            }
        },

        computed: {
            name() {
                const aux = this.paper.name;
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.paperName = aux;
                return aux;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            }
        },

        watch: {
            paperName() {
                this.update();
            }
        },

        methods: {
            update() {
                this.paperDescription = this.paper.description;
                this.paperImage = this.paper.image;
            },
            hasImage() {
                return !!this.paperImage;
            },
            close() {
                this.setInitialData();
                this.update();
                this.$emit("closeDialogEdit");
            },
            setInitialData() {
                this.paperDescription = null,
                this.paperName = null,
                this.paperImage = "",
                this.image = []
            },
            onEditPaper() {
                if((this.paperName === "" && this.paperDescription === "") || (this.paperName === "" && typeof this.images[0] === 'undefined')){
                    alert('Todos os campos devem ser preenchidos!');
                    return;
                }

                this.$store.dispatch('paperExists', this.paperName)
                    .then(paper => {
                        if(paper.exist && paper.id !== this.paper.id) {
                            this.createErrorSnackBar = true;
                        } else {
                            const paperData = {
                                name: this.paperName,
                                description: this.paperDescription,
                                image: this.paperImage,
                                id: this.paper.id,
                                created: this.paper.created,
                                editedBy: this.userInfo.id,
                                userId: this.paper.userId
                            };

                            if ((this.images && this.images[0])) {
                                const imageToUpload = {
                                    name: this.paperName,
                                    oldName: this.paper.name,
                                    images: this.images[0],
                                    id: this.paper.id
                                }
                                this.$store.dispatch("uploadImagePaper", imageToUpload)
                                    .then(result => {
                                        paperData.image = result;
                                        this.$store.dispatch("updatePaper", paperData)
                                        .then(()=>{
                                            this.$emit("load");
                                            this.close();
                                        });
                                    });
                            } else {
                                this.$store.dispatch("updatePaper", paperData)
                                    .then(()=>{
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
