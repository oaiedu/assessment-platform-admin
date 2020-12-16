<template>
    <div>
        <v-container>
            <v-container>
                <h1 class="text-center blue--text">Solicitações</h1>
            </v-container>

            <v-container>
                <v-container>
                    <v-text-field
                        v-model="search"
                        filled
                        rounded
                        dense
                        append-icon="mdi-magnify"
                        label="Search for IQ"
                        single-line
                        hide-details
                    ></v-text-field>
                </v-container>
            </v-container>

            <v-container>
                <v-card>
                    <v-data-table
                        :headers="headers"
                        :items="questions"
                        :page.sync="page"
                        :items-per-page="itemsPerPage"
                        :search="search"
                        :loading="loading"
                        loading-text="Carregando solicitações..."
                        no-data-text="Não há solicitações"
                        hide-default-footer
                        class="elevation-1"
                        @page-count="pageCount = $event"
                    >
                        <template v-slot:[`item.status`]='{ item }' v-if="questions && questions.length > 0">
                            <span
                                :style='{ "color": item.status === "Pendente"
                                    ? "#ffaa00" : item.status === "Aprovado"
                                    ? "#00cc66" : "#ff0000" }'
                                >{{ item.status }}</span>
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                            <v-tooltip top v-if='userClaims["admin"]'>
                                <template v-slot:activator='{ on, attrs }'>
                                    <v-icon
                                        v-on='on'
                                        v-bind='attrs'
                                        color="teal darken-2"
                                        @click="sendEmail(item.user.email)" >
                                        mdi-email
                                    </v-icon>
                                </template>
                                <span>Enviar e-mail</span>
                            </v-tooltip>

                            <v-tooltip top>
                                <template v-slot:activator='{ on, attrs }'>
                                    <v-icon
                                        v-on='on'
                                        v-bind='attrs'
                                        class="ml-3"
                                        color="grey darken-2"
                                        @click="printQuestion(item)" >
                                        mdi-pdf-box
                                    </v-icon>
                                </template>
                                <span>Gerar PDF</span>
                            </v-tooltip>

                            <v-tooltip top v-if='userClaims["admin"]'>
                                <template v-slot:activator='{ on, attrs }'>
                                    <v-icon
                                        v-on='on'
                                        v-bind='attrs'
                                        class="ml-3"
                                        color="green"
                                        :disabled='item.status === "Aprovado"'
                                        @click="checkQuestion(item)" >
                                        mdi-check-bold
                                    </v-icon>
                                </template>
                                <span>Aprovar</span>
                            </v-tooltip>

                            <v-tooltip top v-if='userClaims["appraiser"]'>
                                <template v-slot:activator='{ on, attrs }'>
                                    <v-icon
                                        v-on='on'
                                        v-bind='attrs'
                                        class="ml-3"
                                        color="amber darken-2"
                                        :disabled='item.status === "Aprovado"'
                                        @click="editQuestion(item)" >
                                        mdi-pencil
                                    </v-icon>
                                </template>
                                <span>Editar</span>
                            </v-tooltip>

                            <v-tooltip top>
                                <template v-slot:activator='{ on, attrs }'>
                                    <v-icon
                                        v-on='on'
                                        v-bind='attrs'
                                        class="ml-3"
                                        color="red"
                                        :disabled='userClaims["admin"] ? item.status === "Rejeitado" : false'
                                        @click="userClaims['admin']
                                            ? rejectQuestion(item)
                                            : askDelete(item)" >
                                        {{ userClaims['admin'] ? 'mdi-close' : 'mdi-delete' }}
                                    </v-icon>
                                </template>
                                <span>{{ userClaims['admin'] ? 'Rejeitar' : 'Excluir' }}</span>
                            </v-tooltip>
                        </template>
                    </v-data-table>
                </v-card>
            </v-container>

            <div class="text-center pt-2">
                <v-pagination v-model="page" :length="pageCount" total-visible="7"></v-pagination>
            </div>

            <v-snackbar
                v-model="deleteQuestionSnackBar"
                color="white"
                right
                top
                :timeout="15000" >
                <span class="snackbar-text">Tem certeza de que deseja excluir esta solicitação?</span>

                <v-btn
                    dark
                    class="ml-3"
                    color="blue"
                    text
                    @click="deleteQuestion(deleteItem)" >
                    Excluir
                </v-btn>

                <v-btn
                    dark
                    color="grey"
                    text
                    @click="deleteQuestionSnackBar = false; deleteItem = null" >
                    Cancelar
                </v-btn>
            </v-snackbar>
        </v-container>
    </div>
</template>

<script>
    import EditQuestion from './Questions/EditQuestion';

    export default {
        components: { EditQuestion },
        data() {
            return {
                deleteItem: null,
                deleteQuestionSnackBar: false,
                search: '',
                page: 1,
                pageCount: 15,
                itemsPerPage: 8,
                headers: [
                    { text: 'IQ', sortable: true, value: 'iq', align: 'center' },
                    { text: 'Usuário', value: 'user.name', sortable: true, align: 'center' },
                    { text: 'E-mail', value: 'user.email', sortable: true, align: 'center' },
                    { text: 'Disciplina', value: 'subject', sortable: true, align: 'center' },
                    { text: 'Status', value: 'status', sortable: true, align: 'center' },
                    { text: 'Ações', value: 'actions', sortable: false, align: 'center' }
                ]
            };
        },
        computed: {
            loading() {
                return this.$store.getters.loading;
                this.$store.dispatch('clearLoading');
            },
            questions() {
                return this.$store.getters.getRequests;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            }
        },
        methods: {
            sendEmail(email) {
                const a = document.createElement('a');
                a.href = 'mailto:' + email;
                a.click();
                a.remove();
            },
            printQuestion(question) {
                console.log(question);
            },
            checkQuestion(question) {
                this.$store.dispatch('createQuestion', question)
                    .then(() => {
                        this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Aprovado', question });
                    });
            },
            editQuestion(question) {
                // TODO
                this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Pendente', question });
            },
            askDelete(question) {
                this.deleteQuestionSnackBar = true;
                this.deleteItem = question;
            },
            deleteQuestion(question) {
                this.$store.dispatch('deleteQuestionRequest', question);
            },
            rejectQuestion(question) {
                this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Rejeitado', question });
            }
        },
        mounted() {
            this.$store.dispatch('loadQuestionRequests', { claims: this.userClaims, userInfo: this.userInfo });
        }
    };
</script>

<style scoped>
    .snackbar-text {
        color: black;
        font-size: 1rem;
    }
</style>
