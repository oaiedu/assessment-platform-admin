<template>
  <v-card>
    <v-form ref="formRef">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="onCreateTest()">Criar Teste</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-row>
        <v-col>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  solo
                  rounded
                  flat
                  filled
                  outlined
                  dense
                  :rules="textRule"
                  required
                  label="Título"
                  v-model="testName"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-select
                  solo
                  rounded
                  flat
                  filled
                  outlined
                  dense
                  disabled
                  label="Tipo de prova"
                  v-model="testType"
                  :items="types"
                ></v-select>
              </v-col>

              <v-col v-if="testType=='Aleatório'">
                <v-text-field
                  dense
                  outlined
                  rounded
                  name="randomQuestionsNumber"
                  label="Número de Questões"
                  id="randomQuestionsNumber"
                  v-model="randomQuestionsNumber"
                  type="number"
                  :rules="rule"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-textarea
                  outlined
                  required
                  :rules="textRule"
                  v-model="purpose"
                  label="Propósito"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col>
          <v-container>
            <v-container>
              <v-text-field
                id='searchFieldNew'
                v-model="search"
                @keydown="searchQuery($event)"
                clearable
                filled
                rounded
                dense
                append-icon="mdi-magnify"
                label="Procurar por IQ"
                single-line
                hide-details
              ></v-text-field>
            </v-container>

            <v-container>
              <v-card v-if="selectedSubjects.length == 0 ">
                <v-data-table
                  v-model="selectedQuestions"
                  :headers="headers"
                  :items="isSearching ? filteredQuestions : questions"
                  :page="isSearching ? searchPage : page"
                  :items-per-page="itemsPerPage"
                  :loading='loading'
                  no-data-text='Não há questões a serem mostradas'
                  loading-text="Carregando questões..."
                  show-select
                  item-key="iq"
                  hide-default-footer
                  class="elevation-1"
                ></v-data-table>
              </v-card>

              <!-- <v-card v-else>
                <v-data-table
                  v-model="selectedQuestions"
                  :headers="headers"
                  :items="showedQuestions"
                  :page.sync="page"
                  :items-per-page="itemsPerPage"
                  :loading='loading'
                  show-select
                  item-key="id"
                  hide-default-footer
                  class="elevation-1"
                  @page-count="pageCount = $event"
                ></v-data-table>
              </v-card> -->
            </v-container>
            <div class="text-center pt-2">
              <Paginator
                :page='!isSearching ? page : searchPage'
                :length='!isSearching ? pageAmount : Math.ceil(filteredQuestions.length / itemsPerPage)'
                @pageChange='!isSearching ? page = $event.page : searchPage = $event.page; onPageChange($event)' />
            </div>
          </v-container>
        </v-col>
      </v-row>
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
            Uma prova com este Título já foi criada!
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
    import Paginator from '../Paginator';

    export default {
        components: { Paginator },
        data() {
            return {
                testType: "Selecionado",
                randomQuestionsNumber: null,
                createErrorSnackBar: false,
                selectedSubjects: [],
                selectedQuestions: [],
                testItems: [],
                testName: "",
                purpose: "",
                items: [
                    "Teoria do Reator",
                    "Termodinâmica",
                    "Instrumentação e Controle",
                    "Válvulas e Bombas",
                    "Eletricidade",
                    "Mecânica dos Fluidos",
                    "Tratamento Qúimico Refrigerante",
                    "Análise Integrada",
                    "Instrumentação Nuclear",
                    "Física Nuclear",
                    "Transferência de Calor",
                    "Materiais"
                ],
                types: [
                    "Aleatório",
                    "Selecionado"
                ],
                showedQuestions: [],
                search: "",
                isSearching: false,
                page: 1,
                searchPage: 1,
                pageCount: 15,
                itemsPerPage: 8,
                headers: [
                    { text: "IQ", align: "left", sortable: false, value: "iq" },
                    { text: "Conhecimento", value: "knowledge" },
                    { text: "Relevância OR", value: "knowledgePWR" },
                    { text: "Relevância OSR", value: "knowledgeBWR" },
                    { text: "Disciplina", value: "subject", sortable: false },
                    { text: "", value: "actions", sortable: false }
                ],
                textRule: [
                    v => !!v || 'Necessário'
                ],
                rule: [
                    v => (v <= 50) || 'Máximo de 50 questões',
                    v => (v <= this.questions.length) || 'Número de questões inexistente',
                    v => (v >= 0) || 'Apenas números positivos'
                ]
            }
        },
        computed: {
            loading() {
                return this.$store.getters.loading;
            },
            questions() {
                return this.$store.getters.getCurrentQuestionsPage;
            },
            filteredQuestions() {
                return this.$store.getters.getFilteredQuestions;
            },
            checkNumber() {
                return this.questions.length < this.randomQuestionsNumber ? 'Número de questões não existente' : ''
            },
            pageAmount() {
                const questionAmount = this.$store.getters.getDataSize.questions.general;
                return Math.ceil(questionAmount / this.itemsPerPage);
            }
        },
        watch: {
            selectedSubjects(val) {
                this.questions.forEach(element => {
                    for (let i = 0; i < this.selectedSubjects.length; i++) {
                        if (element.subject == this.selectedSubjects[i]) {
                            let aux = true;
                            for (let k = 0; k < this.showedQuestions.length; k++) {
                                if (element === this.showedQuestions[k]) aux = false;
                            }
                            if (aux == true) this.showedQuestions.push(element);
                        }
                    }
                });
            },
            randomQuestionsNumber(val) {
                if ( val <= this.questions.length) this.randomSelection(val);
            },
            search(text) {
                if((text == null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredQuestions');
                }
            }
        },
        methods: {
            onPageChange(event) {
                const payload = {
                    page: this.page,
                    itemsPerPage: this.itemsPerPage
                }

                if(!this.isSearching) {
                    if(!event.mode) {
                        this.$store.dispatch('loadQuestionPage', { ...payload, type: event.type });
                    } else {
                        this.$store.dispatch('loadFOLQuestionPage', { ...payload, mode: event.mode });
                    }
                }
            },
            searchQuery(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchFieldNew').blur();

                    this.searchPage = 1;
                    this.$store.commit('resetFilteredQuestions');

                    if(this.search.length > 0) {
                        this.isSearching = true;
                        this.$store.dispatch('searchQuestions', this.search);
                    } else {
                        this.isSearching = false;
                    }
                }
            },
            close() {
                this.setInitialData();
                this.$emit("closeDialogNew");
            },
            setInitialData () {
                this.testType =  "Selecionado",
                this.randomQuestionsNumber =  null,
                this.selectedSubjects =  [],
                this.selectedQuestions =  [],
                this.testItems =  [],
                this.testName =  "",
                this.purpose =  "",
                this.showedQuestions =  [],
                this.search =  ""
            },
            randomSelection(i) {
                console.log("i: ",i)
                this.selectedQuestions = []

                let conf = false
                let randomizer = 0
                let aux = ""
                let j = 0

                for ( j = 0 ; j < i ; j++ ) {
                    do{
                        conf = false
                        randomizer = Math.floor(Math.random() * this.questions.length)
                        aux = this.questions[randomizer]
                        this.selectedQuestions.forEach(element => {
                            if ( element === aux )
                            conf = true
                        })
                    } while ( conf == true );

                    this.selectedQuestions.push(aux);
                }

                console.log("hey",this.selectedQuestions)
            },
            removeSelections(i) {
                let aux = this.showedQuestions.length;

                for (let j = 0; j < aux; j++) {
                    if (this.showedQuestions[j].subject == this.selectedSubjects[i]) {
                        this.showedQuestions.splice(j, 1);
                        j--;
                        aux--;
                    }
                }

                this.selectedSubjects.splice(i, 1);
            },
            selections(i) {
                let aux = false;
                for (let j = 0; j < this.selectedSubjects.length; j++) {
                    if (this.items[i] == this.selectedSubjects[j]) aux = true;
                }

                if (aux == false) this.selectedSubjects.push(this.items[i]);
            },
            onCreateTest() {
                if(this.$refs.formRef.validate()) {
                    this.$store.dispatch('testExists', this.testName)
                        .then(exist => {
                            if(exist > 0) {
                                this.createErrorSnackBar = true;
                            } else {
                                if (this.randomQuestionsNumber == null && this.testType === "Aleatório") {
                                    console.log("AAAAA: ",this.questions.length)
                                    if (this.questions.length > 50) {
                                        this.randomSelection(50)
                                    } else {
                                        this.randomSelection(this.questions.length);
                                    }
                                }

                                console.log("selected: ", this.selectedQuestions)

                                if(this.testType == "Aleatório") {
                                    this.testType = "random"
                                } else {
                                    this.testType = "selected"
                                }

                                this.selectedQuestions.forEach(element => {
                                    this.testItems.push(element.iq);
                                });

                                const now = new Date();
                                const createdHour = parseInt(now.toLocaleTimeString().split(':')[0]);
                                const isAfterNoon = now.toLocaleString().split(':')[2].includes('PM');
                                const createdDate = now.toISOString().split('T')[0] + 'T'
                                    + (isAfterNoon ? (createdHour + 12) : (createdHour < 10 ? '0' + createdHour : createdHour))
                                    + now.toISOString().split('T')[1].slice(2);

                                const testData = {
                                    title: this.testName,
                                    questions: this.testItems,
                                    type: this.testType,
                                    user: this.$store.getters.userInfo.name,
                                    created: createdDate,
                                    edited: "",
                                    purpose: this.purpose
                                }

                                this.close()
                                this.$store.dispatch("createTest", testData);
                                this.$store.dispatch("loadedTests");
                            }
                        });
                }
            }
        },
        mounted() {
            this.$store.dispatch('loadFOLQuestionPage', { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredQuestions');
            this.$store.commit('resetCurrentQuestionsPage');
        }
    }
</script>
