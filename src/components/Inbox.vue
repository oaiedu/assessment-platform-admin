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

            <v-container v-if='(hasDeleteMarkRequests && userClaims["appraiser"] && (markedRequestsByUser ||
                                deleteMarkRequests.filter(r => r.toDelete.userEmail === userInfo.email)))'>
                <v-alert
                    v-if='deleteConfirmed'
                    text
                    prominent
                    type='warning'
                    color="red"
                    icon='mdi-alert' >
                    Exclusão confirmada! Quando deixar esta página, a tabela será atualizada.
                </v-alert>

                <v-alert
                    v-if='hasTrueMarkStatus && markedRequestsByUser'
                    text
                    prominent
                    type='warning'
                    color="red"
                    icon='mdi-alert' >
                    As seguintes questões foram marcadas para exclusão:
                    <br>
                    {{ markedRequestsByUser }}
                </v-alert>

                <v-row justify="start" v-if='hasTrueMarkStatus && markedRequestsByUser'>
                    <v-btn
                        class='ml-10'
                        color='red'
                        dark
                        @click="deleteConfirmed = true; deleteRequests()" >
                        Confirmar
                    </v-btn>
                    <v-btn
                        class='ml-3'
                        color='grey darken-1'
                        dark
                        @click="restoreAll()" >
                        Restaurar
                    </v-btn>
                </v-row>
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
                        :item-class="itemRowStyle"
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
                            <v-row justify="end" v-if='!item.toDelete'>
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
                            </v-row>

                            <v-row justify="end" v-else-if='item.toDelete && item.toDelete.status'>
                                <v-btn
                                    style="padding: 0 !important; font-weight: bold !important;"
                                    color='red'
                                    text
                                    :disabled="!userClaims['appraiser']"
                                    @click='restoreRequest(item)' >
                                    {{ userClaims['appraiser'] ? 'Restaurar' : 'Indisponível' }}
                                </v-btn>
                            </v-row>

                            <v-row justify="end" v-else>
                                <v-btn
                                    style="padding: 0 !important; font-weight: bold !important;"
                                    disabled
                                    text >
                                    Excluída
                                </v-btn>
                            </v-row>
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
                    @click="deleteRequest(deleteItem)" >
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

            <v-snackbar
                v-model="rejectErrorSnackBar"
                light
                color="red darken-2"
                right
                top
                vertical
                :timeout="15000" >
                <span style='color: white; font-size: 1rem'>
                    Esta questão está sendo usada nas seguintes provas:
                    <br>
                    {{ getQuestionTests }}
                    <br><br>
                    Só será possível rejeitá-la quando não se encontrar em nenhum teste.
                </span>
                <template v-slot:action='{ attrs }'>
                    <v-btn
                        dark
                        color="white"
                        text
                        v-bind='attrs'
                        @click="rejectErrorSnackBar = false" >
                        Fechar
                    </v-btn>
                </template>
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
                deleteConfirmed: false,
                deleteRequestSnackBar: false,
                search: '',
                isSearching: false,
                page: 1,
                searchPage: 1,
                itemsPerPage: 8,
                questionTests: [],
                rejectErrorSnackBar: false,
            };
        },
        computed: {
            headers() {
                return this.userClaims['admin']
                    ? [
                        { text: 'IQ', sortable: true, value: 'iq', align: 'left' },
                        { text: 'Usuário', value: 'user.name', sortable: true, align: 'center' },
                        { text: 'E-mail', value: 'user.email', sortable: true, align: 'center' },
                        { text: 'Disciplina', value: 'subject', sortable: true, align: 'center' },
                        { text: 'Status', value: 'status', sortable: true, align: 'center' },
                        { text: 'Ações', value: 'actions', sortable: false, align: 'right' }
                    ]
                    : [
                        { text: 'IQ', sortable: true, value: 'iq', align: 'left' },
                        { text: 'Disciplina', value: 'subject', sortable: true, align: 'center' },
                        { text: 'Status', value: 'status', sortable: true, align: 'center' },
                        { text: 'Ações', value: 'actions', sortable: false, align: 'right' }
                    ]
            },
            loading() {
                return this.$store.getters.loading;
                this.$store.dispatch('clearLoading');
            },
            requests() {
                return this.$store.getters.getCurrentRequestsPage;
            },
            deleteMarkRequests() {
                return this.$store.getters.getDeleteMarkRequests;
            },
            markedRequestsByUser() {
                if(this.hasDeleteMarkRequests) {
                    const requests = this.deleteMarkRequests.filter(r => r.toDelete.userEmail === this.userInfo.email);

                    const iqs = requests.filter(r => r.toDelete && r.toDelete.status);

                    return iqs.map(r => r.iq).join(', ');
                } else {
                    return [];
                }
            },
            hasDeleteMarkRequests() {
                return this.deleteMarkRequests && this.deleteMarkRequests.length > 0;
            },
            hasTrueMarkStatus() {
                const requests = this.deleteMarkRequests.map(q => q.toDelete.status);
                return requests.includes(true);
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
            },
            getQuestionTests() {
                const titles = this.questionTests.map(t => "'" + t.title + "'");
                titles.sort((t1, t2) => t1 > t2 ? 1 : -1);
                return titles.join(', ');
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
            deleteRequest(request) {
                this.deleteRequestSnackBar = false;
                this.deleteItem = null;
                this.$store.dispatch('deleteMarkRequest', {
                    iq: request.iq,
                    isSearching: this.isSearching,
                    userEmail: this.userInfo.email
                });
            },
            deleteRequests() {
                const requests = this.deleteMarkRequests;
                requests.forEach(request => {
                    if(request.toDelete.status && request.toDelete.userEmail === this.userInfo.email) {
                        this.$store.dispatch("changeDeleteStatusRequests", { iq: request.iq, isSearching: this.isSearching });
                    }
                });
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
                this.$store.dispatch('createQuestion', { question: toCreate })
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
            rejectRequest(request) {
                this.$store.dispatch('checkQuestionInTests', { iq: request.iq })
                    .then(result => {
                        this.questionTests = result;
                        if(result.length === 0) {
                            this.$store.dispatch('changeDeleteStatusQuestions', { iq: request.iq, isSearching: false })
                                .then(() => {
                                    this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Rejeitado', request });
                                });
                        } else {
                            this.rejectErrorSnackBar = true;
                        }
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
            },
            itemRowStyle(item) {
                return item.toDelete ? (item.toDelete.status ? 'item-to-delete' : 'item-deleted') : '';
            },
            restoreRequest(item) {
                this.$store.dispatch('restoreMarkedRequest', { iq: item.iq, isSearching: this.isSearching });
            },
            restoreAll() {
                this.$store.dispatch('restoreAllMarkedRequests', { user: this.userInfo, isSearching: this.isSearching });
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
            this.deleteConfirmed = false;
            this.$store.dispatch('checkDeleteMarkRequests');
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

            this.$store.dispatch('deleteQuestions');

            if(this.deleteConfirmed) {
                this.$store.dispatch('deleteRequests');
                this.$store.dispatch('resetRequests');
                this.$store.dispatch('loadDataSize');
            }
        }
    };
</script>

<style scoped>
    .snackbar-text {
        color: black;
        font-size: 1rem;
    }

    .item-to-delete {
        color: #f00;
    }

    .item-deleted {
        color: #c4c4c4;
    }
</style>
