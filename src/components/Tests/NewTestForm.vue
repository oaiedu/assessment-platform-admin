<template>
  <v-card>
    <v-form ref="formRef">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()" class="mr-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <h2>Criar nova prova</h2>
        <v-spacer></v-spacer>
        <!-- <v-toolbar-items>
          <v-btn dark text @click="onCreateTest()">Criar Teste</v-btn>
        </v-toolbar-items> -->
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
                :loading="loading && testType === 'Aleatório'"
                @click="onCreateTest()" >
                <v-icon color="white">mdi-content-save</v-icon>
            </v-btn>
        </template>
        <h3>Salvar</h3>
      </v-tooltip>

      <v-container fluid class="pa-15 pt-10">
        <v-row>
            <v-col>
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
                            label="Tipo de prova"
                            v-model="testType"
                            :items="types" >
                        </v-select>
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
                    <v-col v-if="testType=='Aleatório'">
                        <v-select
                            solo
                            rounded
                            flat
                            filled
                            outlined
                            dense
                            multiple
                            label="Disciplina"
                            v-model="testSubjects"
                            :items="items" >
                            <template v-slot:selection="{ item, index }">
                                <span
                                    v-if="index === 0"
                                    style="margin-right: 5px;" >
                                    {{ item }}
                                </span>
                                <span
                                    v-if="index === 1"
                                    class="grey--text caption" >
                                    (+{{ testSubjects.length - 1 }} others)
                                </span>
                            </template>
                            <template v-slot:prepend-item>
                                <v-list-item
                                    ripple
                                    @click="toggle" >
                                <v-list-item-action>
                                    <v-icon :color="testSubjects.length > 0 ? 'blue darken-1' : ''">
                                        {{ selectIcon }}
                                    </v-icon>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        Selecionar todos
                                    </v-list-item-title>
                                </v-list-item-content>
                                </v-list-item>
                                <v-divider class="mt-2"></v-divider>
                            </template>
                        </v-select>
                    </v-col>
                </v-row>

                <v-row
                    v-if="testType=='Aleatório'"
                    justify="center"
                    class="pb-10" >
                    <v-btn
                        color="blue darken-1"
                        :dark="!(testSubjects.length === 0
                            || randomQuestionsNumber > 50
                            || randomQuestionsNumber < 1
                            || randomQuestionsNumber > checkNumber)"
                        :loading="loading"
                        :disabled="testSubjects.length === 0
                            || randomQuestionsNumber > 50
                            || randomQuestionsNumber < 1
                            || randomQuestionsNumber > checkNumber"
                        @click="selectRandom()" >
                        Começar Seleção
                    </v-btn>
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
            </v-col>

            <v-col v-if="testType === 'Aleatório'">
                <v-container>
                    <v-data-table
                        v-model="selectedRandom"
                        :items="selectedRandomQuestions"
                        :headers='randomHeaders'
                        :items-per-page="itemsPerPage"
                        :loading='loading'
                        :page="randomizedPage"
                        no-data-text='Não há questões a serem mostradas'
                        loading-text="Carregando questões..."
                        item-key="iq"
                        show-select
                        :item-class="itemRowStyle"
                        hide-default-footer
                        class="elevation-1" >
                    </v-data-table>
                </v-container>

                <div class="text-center pt-2">
                    <Paginator
                        :page='randomizedPage'
                        :length='Math.ceil(selectedRandomQuestions.length / itemsPerPage)'
                        @pageChange='randomizedPage = $event.page' />
                </div>
            </v-col>

            <v-col v-if="testType === 'Selecionado'">
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
                    <v-card v-if="selectedSubjects.length == 0">
                        <v-data-table
                            v-model="selectedQuestions"
                            :headers='headers'
                            :items="isSearching ? filteredQuestions : questions"
                            :page="isSearching ? searchPage : page"
                            :items-per-page="itemsPerPage"
                            :loading='loading'
                            no-data-text='Não há questões a serem mostradas'
                            loading-text="Carregando questões..."
                            show-select
                            @toggle-select-all="selectAllToggle"
                            item-key="iq"
                            :item-class="itemRowStyle"
                            hide-default-footer
                            class="elevation-1" >
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
        directives: { Ripple },
        components: { Paginator },
        data() {
            return {
                testType: "Selecionado",
                randomizedPage: 1,
                randomQuestionsNumber: 1,
                createErrorSnackBar: false,
                selectedSubjects: [],
                selectedRandom: [],
                selectedRandomQuestions: [],
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
                testSubjects: ["Teoria do Reator"],
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
                randomHeaders: [
                    { text: "IQ", align: "center", value: "iq" },
                    { text: "Disciplina", align: "center", value: "subject" }
                ],
                textRule: [
                    v => !!v || 'Necessário'
                ],
                rule: [
                    v => (v <= 50) || 'Máximo de 50 questões',
                    v => (v >= 1) || 'Apenas números positivos',
                    v => (v <= this.checkNumber) || 'Não há questões suficientes para o número escolhido'
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
            disabledCount() {
                return this.questions.filter(q => !!q.toDelete).length;
            },
            filteredQuestions() {
                return this.$store.getters.getFilteredQuestions;
            },
            checkNumber() {
                const subjects = this.testSubjects;
                let amount = 0;
                subjects.forEach(sub => {
                    amount += this.$store.getters.getNumberOfQuestionBySubject(sub);
                });
                return amount;
            },
            pageAmount() {
                const questionAmount = this.$store.getters.getDataSize.questions.general;
                return Math.ceil(questionAmount / this.itemsPerPage);
            },
            selectedAllSubjects () {
                return this.testSubjects.length === this.items.length;
            },
            selectedSomeSubject () {
                return this.testSubjects.length > 0 && !this.selectedAllSubjects;
            },
            selectIcon () {
                if (this.selectedAllSubjects) return 'mdi-close-box';
                if (this.selectedSomeSubject) return 'mdi-minus-box';
                return 'mdi-checkbox-blank-outline';
            },
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
            toggle() {
                this.$nextTick(() => {
                    if (this.selectedAllSubjects) {
                        this.testSubjects = []
                    } else {
                        this.testSubjects = this.items.slice();
                    }
                });
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
                this.selectedRandom = [];
                this.selectedRandomQuestions = [];
                this.selectedQuestions =  [],
                this.testItems =  [],
                this.testName =  "",
                this.purpose =  "",
                this.showedQuestions =  [],
                this.search =  ""
            },
            async selectRandom() {
                const amount = this.randomQuestionsNumber;
                const subjects = this.testSubjects;
                const selected = [];
                const allQuestions = [];

                this.selectedRandomQuestions = [];

                this.$store.commit('setLoading', true);

                const promises = subjects.map(subject => {
                    return (
                        this.$store.dispatch('getSubjectIQS', subject)
                            .then(questions => {
                                questions.forEach(question => {
                                    allQuestions.push({ iq: question, subject });
                                });
                            })
                    );
                });

                await Promise.all(promises);

                while(selected.length < amount && selected.length < allQuestions.length) {
                    const index = Math.floor(Math.random() * allQuestions.length);
                    if(!selected.includes(allQuestions[index].iq)) {
                        const question = allQuestions[index];
                        selected.push(question.iq);
                        this.selectedRandomQuestions.push({ iq: question.iq, subject: question.subject });
                    }
                }
                this.selectedRandom = [...this.selectedRandomQuestions];
                this.$store.commit('setLoading', false);
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
                    this.$store.commit('setLoading', true);

                    this.$store.dispatch('testExists', this.testName)
                        .then(async exist => {
                            if(exist > 0) {
                                this.createErrorSnackBar = true;
                            } else {
                                if (this.testType === "Aleatório") {
                                    this.selectedQuestions = [];
                                    const promises = this.selectedRandom.map(question => {
                                        return (
                                            this.$store.dispatch('getQuestionByIQ', question.iq)
                                                .then(q => {
                                                    this.selectedQuestions.push(q);
                                                })
                                        );
                                    });

                                    await Promise.all(promises);
                                }

                                if(this.testType == "Aleatório") {
                                    this.testType = "random";
                                } else {
                                    this.testType = "selected";
                                }

                                this.selectedQuestions.forEach(element => {
                                    this.testItems.push(element);
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
                                    user: {
                                        name: this.$store.getters.userInfo.name,
                                        email: this.$store.getters.userInfo.email
                                    },
                                    created: createdDate,
                                    edited: "",
                                    purpose: this.purpose
                                }

                                this.$store.commit('setLoading', false);
                                this.close();
                                this.$store.dispatch("createTest", testData);
                                this.$store.dispatch("loadedTests");
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
    }
</script>

<style>
    .item-to-delete {
        color: #f00;
    }

    .item-deleted {
        color: #c4c4c4;
    }
</style>
