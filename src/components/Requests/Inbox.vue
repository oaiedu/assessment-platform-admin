<template>
    <div>
        <v-container>
            <v-container>
                <h1 class="text-center blue--text">Solicitações</h1>
            </v-container>

            <v-container>
                <v-container>
                    <SearchBox
                        label='Procurar por IQ'
                        @enter='searchQuery($event)'
                        @textChange='searchTextChange($event)' />
                </v-container>
            </v-container>

            <v-container v-if='hasApprovedRequests && userClaims["appraiser"]'>
                <v-alert
                    text
                    prominent
                    type='warning'
                    color="red"
                    :icon='mdiAlert' >
                    Solicitações aprovadas serão excluídas automaticamente quando sair desta página!
                </v-alert>
            </v-container>

            <v-container v-if='(hasDeleteMarkRequests && userClaims["appraiser"] && (markedRequestsByUser ||
                                deleteMarkRequests.filter(r => r.toDelete.userId === userInfo.id)))'>
                <DeleteAlert
                    :confirmCondition='deleteConfirmed'
                    :itemsCondition='hasTrueMarkStatus && markedRequestsByUser'
                    itemsText='As seguintes solicitações foram marcadas para exclusão:'
                    :items='markedRequestsByUser' />

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

            <RequestsTable
                :items='isSearching ? filteredRequests : requests'
                :page='isSearching ? searchPage : page'
                :itemsPerPage='itemsPerPage'
                @emailClick='sendEmail($event)'
                @pdfClick='printRequest($event)'
                @checkClick='checkRequest($event)'
                @editClick='editRequest($event)'
                @rejectClick='rejectRequest($event)'
                @deleteClick='askDelete($event)'
                @restoreClick='restoreRequest($event)' />

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

            <DeleteWarning
                label='Tem certeza de que deseja excluir esta solicitação?'
                :state='deleteRequestSnackBar'
                @confirm='deleteRequest(deleteItem); deleteRequestSnackBar = false;'
                @cancel='deleteRequestSnackBar = false; deleteItem = null' />

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
    import { mdiAlert } from '@mdi/js';
    import Body from '../Questions/PrintQuestion';
    import EditQuestion from '../Questions/EditQuestion';
    import RequestsTable from './RequestsTable';
    import Paginator from '../Paginator';
    import DeleteWarning from '../Shared/DeleteWarning';
    import DeleteAlert from './DeleteAlertRequests';
    import SearchBox from '../Shared/SearchBox';

    export default {
        components: {
            Body,
            EditQuestion,
            Paginator,
            RequestsTable,
            DeleteWarning,
            DeleteAlert,
            SearchBox
        },
        data() {
            return {
                mdiAlert,
                deleteApproved: false,
                page: 1,
                pageCount: 15,
                dialogPDF: false,
                editItem: null,
                dialogEditRequest: false,
                deleteItem: null,
                deleteConfirmed: false,
                deleteRequestSnackBar: false,
                isSearching: false,
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
            },
            requests() {
                return this.$store.getters.getCurrentRequestsPage;
            },
            deleteMarkRequests() {
                return this.$store.getters.getDeleteMarkRequests;
            },
            markedRequestsByUser() {
                if(this.hasDeleteMarkRequests) {
                    const requests = this.deleteMarkRequests.filter(r => r.toDelete.userId === this.userInfo.id);

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
                    userId: this.userInfo.id
                });
            },
            deleteRequests() {
                const requests = this.deleteMarkRequests;
                requests.forEach(request => {
                    if(request.toDelete.status && request.toDelete.userId === this.userInfo.id) {
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
                this.$store.dispatch('getQuestionByIQ', request.iq)
                    .then(fQuestion => {
                        if(fQuestion && fQuestion.toDelete && !fQuestion.toDelete.status) {
                            this.$store.dispatch('restoreMarkedQuestion', { iq: fQuestion.iq, isSearching: false, isRequest: true })
                                .then(() => {
                                    this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Aprovado', request, user: this.userInfo });
                                    this.$store.commit('setSuccess', 'Solicitação aprovada com sucesso!');
                                })
                        } else {
                            this.$store.dispatch('createQuestion', { question: toCreate, isRequest: true })
                                .then(async () => {
                                    await this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Aprovado', request, user: this.userInfo });
                                    this.$store.commit('setSuccess', 'Solicitação aprovada com sucesso!');
                                });
                        }
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
                                .then(async () => {
                                    await this.$store.dispatch('updateQuestionRequest', { mode: 'sttUpdate', status: 'Rejeitado', request, user: this.userInfo });
                                    this.$store.commit('setSuccess', 'Solicitação rejeitada com sucesso!');
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
            searchTextChange(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredRequests');
                }
            },
            searchQuery(text) {
                this.searchPage = 1;
                this.$store.commit('resetFilteredRequests');

                if(text && text.length > 0) {
                    this.isSearching = true;
                    this.$store.dispatch('searchRequests', {
                        key: text,
                        claims: this.userClaims,
                        userInfo: this.userInfo
                    });
                } else {
                    this.isSearching = false;
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
                    page: 1,
                    itemsPerPage: this.itemsPerPage,
                    mode: 'first'
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
