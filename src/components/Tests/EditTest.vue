<template>
  <v-card>
    <v-form ref="formRef">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()" class="mr-2">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <h2>Editar prova</h2>
        <v-spacer></v-spacer>
        <!-- <v-toolbar-items>
            <v-btn dark text @click="onEditTest()" height="100">Editar Teste</v-btn>
        </v-toolbar-items> -->
      </v-toolbar>

      <v-tooltip left>
        <template v-slot:activator='{ on }'>
            <v-btn
                color="blue darken-2"
                v-on="on"
                large
                dark
                fab
                fixed
                bottom
                right
                @click="onEditTest()" >
                <v-icon color="white">mdi-content-save</v-icon>
            </v-btn>
        </template>
        <h3>Salvar</h3>
      </v-tooltip>

      <v-container fluid class="pa-15 pt-10">
        <v-row>
            <v-col>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-card-title>{{ name }}</v-card-title>
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
                            id='searchFieldEdit'
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
                        <v-card>
                            <v-data-table
                                v-model="selectedQuestions"
                                :headers="headers"
                                :items="isSearching ? filteredQuestions : questions"
                                :page="isSearching ? searchPage : page"
                                :items-per-page="itemsPerPage"
                                :loading="loading"
                                no-data-text="Não há questões a serem mostradas"
                                loading-text="Carregando questões..."
                                show-select
                                @toggle-select-all="selectAllToggle"
                                item-key="iq"
                                :item-class="itemRowStyle"
                                hide-default-footer
                                class="elevation-1"
                                @page-count="pageCount = $event" >
                                <template v-slot:[`item.data-table-select`]='{ item, isSelected, select }'>
                                    <v-simple-checkbox
                                        :value='isSelected'
                                        :readonly='!!item.toDelete'
                                        :disabled='!!item.toDelete'
                                        @input='select($event)' >
                                    </v-simple-checkbox>
                                </template>
                                </v-data-table>
                        </v-card>
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
import Ripple from 'vuetify/lib/directives/ripple';

export default {
  name: 'EditTest',
  directives: { Ripple },
  components: { Paginator },
  props: ["test"],
  data() {
    return {
      randomQuestionsNumber: null,
      createErrorSnackBar: false,
      selectedQuestions: [],
      testItems: [],
      testTitle: "",
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
      isSearching: '',
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
    };
  },
  computed: {
    loading() {
        return this.$store.getters.loading;
    },
    questions() {
        return this.$store.getters.getCurrentQuestionsPage;
    },
    disabledCount() {
        return this.questions.filter(q => !!q.toDelete).length;
    },
    filteredQuestions() {
        return this.$store.getters.getFilteredQuestions;
    },
    name() {
      let aux = this.test.title;
      this.testTitle = aux;
      return aux;
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
    randomQuestionsNumber(val) {
      if ( val <= this.questions.length)
        this.randomSelection(val)
    },
    testTitle(val) {
      this.update();
    },
    search(text) {
        if((text === null || text.length === 0) && this.isSearching) {
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
            document.getElementById('searchFieldEdit').blur();

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
    update(){
      this.test.questions.forEach(element => {
        this.$store.dispatch('getQuestionByIQ', element)
            .then(question => {
                this.selectedQuestions.push(question);
            });
      });
      this.testType = this.test.type;
      this.testName = this.test.title;
      this.purpose = this.test.purpose;
    },
    close() {
      this.setInitialData();
      this.$emit("closeDialogNew");
    },
    setInitialData () {
      this.testType =  "Selecionado",
      this.randomQuestionsNumber =  null,
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
    onEditTest() {
        if(this.$refs.formRef.validate()){

        // if (this.randomQuestionsNumber == null && this.testType === "Aleatório") {
        //   console.log("AAAAA: ",this.questions.length)
        //   if (this.questions.length > 50) {
        //     this.randomSelection(50)
        //   }
        //
        //   else {
        //     this.randomSelection(this.questions.length)
        //   }
        // }

        this.$store.dispatch('testExists', this.testTitle)
            .then(exist => {
                if(exist > 1) {
                    this.createErrorSnackBar = true;
                } else {
                    console.log("selected: ", this.selectedQuestions)

                    this.selectedQuestions.forEach(element => {
                      this.testItems.push(element.iq);
                    });

                    const now = new Date();
                    const editedHour = parseInt(now.toLocaleTimeString().split(':')[0]);
                    const isAfterNoon = now.toLocaleString().split(':')[2].includes('PM');
                    const editedDate = now.toISOString().split('T')[0] + 'T'
                        + (isAfterNoon ? (editedHour + 12) : (editedHour < 10 ? '0' + editedHour : editedHour))
                        + now.toISOString().split('T')[1].slice(2);

                    const testData = {
                      title: this.testTitle,
                      questions: this.testItems,
                      type: this.testType,
                      user: this.test.user,
                      created: this.test.created,
                      edited: `${this.$store.getters.userInfo.name}`+'/'+`${editedDate}`,
                      purpose: this.purpose,
                      id: this.test.id
                    }

                    this.close()
                    this.$store.dispatch("updateTest", testData);
                }
            });
        }
    },
    itemRowStyle(item) {
        return item.toDelete ? (item.toDelete.status ? 'item-to-delete' : 'item-deleted') : '';
    },
    selectAllToggle(props) {
        if(this.selectedQuestions.length != this.questions.length - this.disabledCount) {
            this.selectedQuestions = [];
            props.items.forEach(item => {
            if(!item.toDelete) {
                this.selectedQuestions.push(item);
            }
            });
        } else this.selectedQuestions = [];
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
};
</script>
