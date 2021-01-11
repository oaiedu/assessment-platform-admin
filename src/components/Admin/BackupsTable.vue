<template>
    <v-container>
        <v-row justify="end" class="mr-2">
            <v-btn
                color="green"
                dark
                class="mt-2"
                @click="backup()" >
                Fazer Backup
                <v-icon right dark>mdi-cloud-upload</v-icon>
            </v-btn>
        </v-row>

        <v-data-table
            :items='getBackupsByMonth(currentMonth)'
            class="elevation-1 mt-5"
            :headers="headers"
            :loading="loading"
            :sort-by="['start']"
            :sort-desc="[true]"
            loading-text="Carregando backups..."
            no-data-text="Não há backups neste mês" >
            <template v-slot:top>
                <v-toolbar flat color="blue darken-1">
                    <v-toolbar-title class="white--text">Mês Atual</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            @click="downloadBkp(item)" >
                            mdi-download
                        </v-icon>
                    </template>
                    <span>Download</span>
                </v-tooltip>

                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            class="ml-1"
                            @click="deleteBackupSnackBar = true; deleteItem = item" >
                            mdi-delete
                        </v-icon>
                    </template>
                    <span>Excluir</span>
                </v-tooltip>
            </template>
        </v-data-table>

        <v-data-table
            :items='getBackupsByMonth(lastMonth)'
            class="elevation-1 mt-10"
            :headers="headers"
            :loading="loading"
            :sort-by="['start']"
            :sort-desc="[true]"
            loading-text="Carregando backups..."
            no-data-text="Não há backups neste mês" >
            <template v-slot:top>
                <v-toolbar flat color="blue darken-1">
                    <v-toolbar-title class="white--text">{{ pastMonths[0] }}</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            @click="downloadBkp(item)" >
                            mdi-download
                        </v-icon>
                    </template>
                    <span>Download</span>
                </v-tooltip>

                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            class="ml-1"
                            @click="deleteBackupSnackBar = true; deleteItem = item" >
                            mdi-delete
                        </v-icon>
                    </template>
                    <span>Excluir</span>
                </v-tooltip>
            </template>
        </v-data-table>

        <v-data-table
            :items='getBackupsByMonth(twoMonthsAgo)'
            class="elevation-1 mt-10"
            :headers="headers"
            :loading="loading"
            :sort-by="['start']"
            :sort-desc="[true]"
            loading-text="Carregando backups..."
            no-data-text="Não há backups neste mês" >
            <template v-slot:top>
                <v-toolbar flat color="blue darken-1">
                    <v-toolbar-title class="white--text">{{ pastMonths[1] }}</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            @click="downloadBkp(item)" >
                            mdi-download
                        </v-icon>
                    </template>
                    <span>Download</span>
                </v-tooltip>

                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            class="ml-1"
                            @click="deleteBackupSnackBar = true; deleteItem = item" >
                            mdi-delete
                        </v-icon>
                    </template>
                    <span>Excluir</span>
                </v-tooltip>
            </template>
        </v-data-table>

        <v-snackbar
                v-model="deleteBackupSnackBar"
                color="white"
                light
                right
                top
                :timeout="15000" >
                Tem certeza de que deseja excluir este Backup?

                <v-btn
                    dark
                    class="ml-3"
                    color="blue"
                    text
                    @click="deleteBkp(deleteItem)" >
                    Excluir
                </v-btn>

                <v-btn
                    dark
                    color="grey"
                    text
                    @click="deleteBackupSnackBar = false; deleteItem = null" >
                    Cancelar
                </v-btn>
            </v-snackbar>
    </v-container>
</template>

<script>
    export default {
        name: 'BackupsTable',
        data() {
            return {
                deleteBackupSnackBar: false,
                deleteItem: null,
                months: {},
                headers: [
                    {
                        text: 'ID',
                        value: 'id',
                        align: 'center',
                        sortable: true
                    },
                    {
                        text: 'Tamanho',
                        value: 'size',
                        align: 'center',
                        sortable: true
                    },
                    {
                        text: 'Data de Início',
                        value: 'start',
                        align: 'center',
                        sortable: true
                    },
                    {
                        text: 'Data de Término',
                        value: 'end',
                        align: 'center',
                        sortable: true
                    },
                    {
                        text: 'Ações',
                        value: 'actions',
                        align: 'center',
                        sortable: false
                    }
                ]
            }
        },
        computed: {
            backups() {
                return this.$store.getters.getBackups;
            },
            loading() {
                return this.$store.getters.loading;
            },
            currentMonth() {
                return new Date().getMonth() + 1;
            },
            lastMonth() {
                return this.currentMonth - 1 === 0 ? 12 : this.currentMonth - 1;
            },
            twoMonthsAgo() {
                return this.currentMonth - 2 === 0 ? 12 : (this.currentMonth - 2 < 0 ? 11 : this.currentMonth - 2);
            },
            pastMonths() {
                return [this.months[this.lastMonth], this.months[this.twoMonthsAgo]];
            }
        },
        methods: {
            getBackupsByMonth(month) {
                const backups = this.backups;
                const bkps = [];
                const wanted = month;

                backups.forEach(bkp => {
                    const start = bkp.start;
                    const bkpMon = start.substr(0, 3);
                    const months = [];

                    for (const key in this.months) {
                        const mon = this.months[key].substr(0, 3);

                        if(bkpMon === mon) {
                            months.push(key);
                        }
                    }

                    months.forEach(m => {
                        if(m == wanted) {
                            bkps.push(bkp);
                        }
                    });
                });

                return bkps;
            },
            backup() {
                const now = new Date().toISOString();
                this.$store.dispatch('backupFirebase', { now });
            },
            downloadBkp(backup) {
                this.$store.dispatch('downloadBackup', { date: backup.start, cloudId: backup.cloudId, id: backup.id });
            },
            deleteBkp(backup) {
                this.$store.dispatch('deleteBackup', { id: backup.cloudId });
            }
        },
        mounted() {
            this.months = this.$store.getters.getMonths;
        }
    }
</script>

<style>

</style>
