<template>
    <div>
        <v-container>
            <v-container>
                <h1 class="text-center blue--text">Solicitações</h1>
            </v-container>

            <v-container>
                <v-container>
                    <v-text-field
                        id='searchField'
                        v-model="search"
                        @keydown="searchQuery($event)"
                        clearable
                        filled
                        rounded
                        dense
                        append-icon="mdi-magnify"
                        label="Procurar por IQ"
                        single-line
                        hide-details >
                    </v-text-field>
                </v-container>
            </v-container>

            <v-container v-if='hasApprovedRequests && userClaims["appraiser"]'>
                <v-alert
                    text
                    prominent
                    type='warning'
                    color="red"
                    icon='mdi-alert' >
                    Solicitações aprovadas serão excluídas automaticamente quando sair desta página!
                </v-alert>
            </v-container>

            <v-container>
                <v-card>
                    <v-data-table
                        :headers="headers"
                        :items="isSearching ? filteredRequests : requests"
                        :page="isSearching ? searchPage : page"
                        :items-per-page="itemsPerPage"
                        :search="search"
                        :loading="loading"
                        loading-text="Carregando solicitações..."
                        no-data-text="Não há solicitações"
                        hide-default-footer
                        class="elevation-1"
                        @page-count="pageCount = $event"
                    >
                        <template v-slot:[`item.status`]='{ item }' v-if="requests && requests.length > 0">
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
                                        color="grey darken-1"
                                        @click="printRequest(item)" >
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
                                        @click="checkRequest(item)" >
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
                                        @click="editRequest(item)" >
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
                                        :disabled='userClaims["admin"] ? item.status === "Rejeitado" : item.status === "Aprovado"'
                                        @click="userClaims['admin']
                                            ? rejectRequest(item)
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
                <Paginator
                    :page='!isSearching ? page : searchPage'
                    :length='!isSearching ? pageAmount : Math.ceil(filteredRequests.length / itemsPerPage)'
                    @pageChange='!isSearching ? page = $event.page : searchPage = $event.page; onPageChange($event)' />
            </div>

            <v-dialog
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition"
                v-model="dialogEditRequest" >
                <EditQuestion
                    :question="editItem"
                    :userClaims='userClaims'
                    :userInfo='userInfo'
                    @closeDialogEdit="dialogEditRequest = false" >
                </EditQuestion>
            </v-dialog>

            <v-dialog
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition"
                v-model="dialogPDF" >
                <Body
                    :question="editItem"
                    @closeDialogPrint="dialogPDF = false" >
                </Body>
            </v-dialog>

            <v-snackbar
                v-model="deleteRequestSnackBar"
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
                    @click="deleteRequestSnackBar = false; deleteItem = null" >
                    Cancelar
                </v-btn>
            </v-snackbar>
        </v-container>
    </div>
</template>

<script>
    import Body from './Questions/PrintQuestion/Body';
    import EditQuestion from './Questions/EditQuestion';
    import Paginator from './Paginator';

    export default {
        components: { Body, EditQuestion, Paginator },
        data() {
            return {
                deleteApproved: false,
                page: 1,
                pageCount: 15,
                dialogPDF: false,
                editItem: null,
                dialogEditRequest: false,
                deleteItem: null,
                deleteRequestSnackBar: false,
                search: '',
                isSearching: false,
                page: 1,
                searchPage: 1,
                itemsPerPage: 8
            };
        },
        computed: {
            headers() {
                return this.userClaims['admin']
                    ? [
                        { text: 'IQ', sortable: true, value: 'iq', align: 'center' },
                        { text: 'Usuário', value: 'user.name', sortable: true, align: 'center' },
                        { text: 'E-mail', value: 'user.email', sortable: true, align: 'center' },
                        { text: 'Disciplina', value: 'subject', sortable: true, align: 'center' },
                        { text: 'Status', value: 'status', sortable: true, align: 'center' },
                        { text: 'Ações', value: 'actions', sortable: false, align: 'center' }
                    ]
                    : [
                        { text: 'IQ', sortable: true, value: 'iq', align: 'center' },
                        { text: 'Disciplina', value: 'subject', sortable: true, align: 'center' },
                        { text: 'Status', value: 'status', sortable: true, align: 'center' },
                        { text: 'Ações', value: 'actions', sortable: false, align: 'center' }
                    ]
            },
            loading() {
                return this.$store.getters.loading;
                this.$store.dispatch('clearLoading');
            },
            requests() {
                return this.$store.getters.getCurrentRequestsPage;
            },
            filteredRequests() {
                return this.$store.getters.getFilteredRequests;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            },
            hasApprovedRequests() {
                let itHas = false;
                this.requests.forEach(request => {
                    if(request.status === 'Aprovado') {
                        itHas = true;
                    }
                });
                return itHas;
            },
            pageAmount() {
                const requestAmount = this.$store.getters.getDataSize['question-requests'];
                const amount = this.userClaims['admin'] ? requestAmount.general : requestAmount.users[this.userInfo.email];
                return Math.ceil(amount / this.itemsPerPage);
            }
        },
        methods: {
            sendEmail(email) {
                const a = document.createElement('a');
                a.href = 'mailto:' + email;
                a.click();
                a.remove();
            },
            printRequest(request) {
                this.dialogPDF = true;
                this.editItem = request;
            },
            checkRequest(request) {
                const toCreate = {
                    iq: request.iq,
                    question: request.question,
                    subject: request.subject,
                    knowledge: request.knowledge,
                    knowledgePWR: request.knowledgePWR,     // RELEVANCIA_OR
                    knowledgeBWR: request.knowledgeBWR,     // RELEVANCIA_OSR
                    answers: request.answers,
                    image: request.image,
                    imageSize: request.imageSize,
                    edited: []
                }
                this.$store.dispatch('createQuestion', toCreate)
                    .then(() => {
                        this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Aprovado', request });
                    });
            },
            editRequest(request) {
                this.dialogEditRequest = true;
                this.editItem = request;
            },
            askDelete(request) {
                this.deleteRequestSnackBar = true;
                this.deleteItem = request;
            },
            deleteRequest(request) {
                this.deleteRequestSnackBar = false;
                this.deleteItem = null;
                this.$store.dispatch('deleteQuestionRequest', { request, isSearching: this.isSearching });
            },
            rejectRequest(request) {
                this.$store.dispatch('deleteQuestion', { iq: request.iq, isSearching: false })
                    .then(() => {
                        this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Rejeitado', request });
                    });
            },
            onPageChange(event) {
                const payload = {
                    page: this.page,
                    itemsPerPage: this.itemsPerPage
                }

                if(!this.isSearching) {
                    if(!event.mode) {
                        this.$store.dispatch('loadRequestPage', {
                            ...payload,
                            type: event.type,
                            claims: this.userClaims,
                            userInfo: this.userInfo
                        });
                    } else {
                        this.$store.dispatch('loadFOLRequestPage', {
                            ...payload,
                            mode: event.mode,
                            claims: this.userClaims,
                            userInfo: this.userInfo
                        });
                    }
                }
            },
            searchQuery(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchField').blur();

                    this.searchPage = 1;
                    this.$store.commit('resetFilteredRequests');

                    if(this.search.length > 0) {
                        this.isSearching = true;
                        this.$store.dispatch('searchRequests', {
                            key: this.search,
                            claims: this.userClaims,
                            userInfo: this.userInfo
                        });
                    } else {
                        this.isSearching = false;
                    }
                }
            }
        },
        watch: {
            search(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredRequests');
                }
            }
        },
        mounted() {
            this.$store.dispatch('loadFOLRequestPage', {
                    claims: this.userClaims,
                    userInfo: this.userInfo,
                    page: 1, itemsPerPage: this.itemsPerPage, mode: 'first'
                })
                .then(() => {
                    if(this.userClaims['appraiser'] && this.hasApprovedRequests) {
                        this.deleteApproved = true;
                    } else {
                        this.deleteApproved = false;
                    }
                });
        },
        beforeDestroy() {
            if(this.deleteApproved) {
                this.$store.dispatch('deleteApprovedRequests', { userInfo: this.userInfo });
            }
        }
    };
</script>

<style scoped>
    .snackbar-text {
        color: black;
        font-size: 1rem;
    }
</style>
