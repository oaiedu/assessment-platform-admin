<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onCreatePaper()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
          <v-btn dark text type="submit">Criar Documento</v-btn>
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
                        <Combined @inputData="updateData"></Combined>
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
                <v-card>
                  <v-card-title>{{paperName}}</v-card-title>
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
        data: () => ({
            paperDescription: null,
            paperName: null,
            images: [],
            paperImage: ""
        }),

        methods: {
            updateData(variable) {
                this.paperDescription = variable;
            },
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

                const id = uuid();
                const paperData = {
                    paperName: this.paperName,
                    paperDescription: this.paperDescription,
                    paperImage: this.paperImage,
                    paperId: id
                };

                if(this.images && this.images[0]) {
                    const imageToUpload = { id, name: this.paperName, images: this.images[0] }
                    this.$store.dispatch("uploadImagePaper", imageToUpload)
                        .then(result => {
                            paperData.paperImage = result;
                            this.$store.dispatch("createPaper", paperData)
                                .then(() => {
                                    this.$emit("load");
                                    this.close();
                            });
                        });
                } else {
                    this.$store.dispatch("createPaper", paperData)
                        .then(() => {
                            this.$emit("load");
                            this.close();
                    });
                }
            }
        }
    }
</script>
