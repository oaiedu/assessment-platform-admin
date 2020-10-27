<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onEditPaper()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
          <v-btn dark text type="submit">Editar Documento</v-btn>
      </v-toolbar>
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
                        <Combined :questionDescription="paperDescription" @inputData="updateData"></Combined>
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
  </v-card>
</template>

<script>
    import uuid from 'uuid-random';

    export default {
        props: ["paper"],

        data: () => ({
            paperDescription: "",
            paperName: "",
            images: [],
            paperImage: ""
        }),

        computed: {
            name() {
                var aux = this.paper.data.name
                this.paperName = aux
                return aux
            }
        },

        watch: {
            paperName() {
                this.update();
            }
        },

        methods: {
            update() {
                this.paperDescription = this.paper.data.description
                this.paperImage = this.paper.data.image
            },
            hasImage() {
                if( paperImage !== '' && typeof paperImage !== 'undefined')
                    return true
                else
                    return false
            },
            updateData(variable) {
                this.paperDescription = variable;
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

                const paperData = {
                    paperName: this.paperName,
                    paperDescription: this.paperDescription,
                    paperImage: this.paperImage,
                    paperId: this.paper.id
                };

                if ((this.images && this.images[0])) {
                    const imageToUpload = {
                        name: this.paperName,
                        oldName: this.paper.data.name,
                        images: this.images[0],
                        id: this.paper.id
                    }
                    this.$store.dispatch("uploadImagePaper", imageToUpload)
                        .then(result => {
                            paperData.paperImage = result;
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
        }
    }
</script>
