<template>
  <v-card>
    <v-form ref="formRef">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()" class="mr-2">
            <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <h2>Editar prova</h2>
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
                @click="onEditTest()" >
                <v-icon color="white">{{ mdiContentSave }}</v-icon>
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
                            :append-icon="mdiMagnify"
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
import { mdiClose, mdiContentSave, mdiMagnify } from '@mdi/js';
import Paginator from '../Paginator';
import Ripple from 'vuetify/lib/directives/ripple';

export default {
  name: 'EditTest',
  directives: { Ripple },
  components: { Paginator },
  props: ["test"],
  data() {
    return {
      mdiClose,
      mdiContentSave,
      mdiMagnify,
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
        v => (v <= this.checkNumber) || 'Número de questões inexistente',
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
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.testTitle = aux;
      return aux;
    },
    checkNumber() {
      return this.$store.getters.getDataSize.questions.general;
    },
    pageAmount() {
        const questionAmount = this.$store.getters.getDataSize.questions.general;
        return Math.ceil(questionAmount / this.itemsPerPage);
    },
    userInfo() {
        return this.$store.getters.userInfo;
    }
  },
  watch: {
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
        this.selectedQuestions.push(element);
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
      this.selectedQuestions =  [],
      this.testItems =  [],
      this.testName =  "",
      this.purpose =  "",
      this.showedQuestions =  [],
      this.search =  ""
    },
    onEditTest() {
        if(this.$refs.formRef.validate()) {

        this.$store.dispatch('testExists', this.testTitle)
            .then(exist => {
                if(exist > 1) {
                    this.createErrorSnackBar = true;
                } else {
                    this.selectedQuestions.forEach(element => {
                        this.testItems.push(element);
                    });

                    const testData = {
                        title: this.testTitle,
                        questions: this.testItems,
                        type: this.testType,
                        user: this.test.user,
                        created: this.test.created,
                        editedBy: {
                            name: this.userInfo.name,
                            email: this.userInfo.email
                        },
                        purpose: this.purpose,
                        id: this.test.id
                    }

                    this.close();
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
