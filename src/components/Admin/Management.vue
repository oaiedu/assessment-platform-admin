<template>
    <v-container>
        <div class="text-center mt-5">
            <h1 class="blue--text">Administração</h1>
        </div>

        <div class="text-center">
            <v-btn color="green" dark fab @click="backup()">
                <v-icon>mdi-cloud-upload</v-icon>
            </v-btn>
        </div>

        <v-data-table
            :items='getBackupsByMonth(currentMonth)'
            class="elevation-1 mt-10"
            :headers="headers"
            :loading="loading"
            :sort-by="['start']"
            :sort-desc="[true]"
            loading-text="Carregando backups..." >
            <template v-slot:top>
                <v-toolbar flat color="blue">
                    <v-toolbar-title class="white--text">Mês Atual</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-icon
                    color="green"
                    @click="downloadBkp(item)" >
                    mdi-download
                </v-icon>
                <v-icon
                    class="ml-1"
                    color="red"
                    @click="deleteBkp(item)" >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>

        <v-data-table
            :items='getBackupsByMonth(lastMonth)'
            class="elevation-1 mt-10"
            :headers="headers"
            :loading="loading"
            loading-text="Carregando backups..." >
            <template v-slot:top>
                <v-toolbar flat color="blue">
                    <v-toolbar-title class="white--text">{{ pastMonths[0] }}</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-icon
                    color="green"
                    @click="downloadBkp(item)" >
                    mdi-download
                </v-icon>
                <v-icon
                    class="ml-1"
                    color="red"
                    @click="deleteBkp(item)" >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>

        <v-data-table
            :items='getBackupsByMonth(twoMonthsAgo)'
            class="elevation-1 mt-10"
            :headers="headers"
            :loading="loading"
            loading-text="Carregando backups..." >
            <template v-slot:top>
                <v-toolbar flat color="blue">
                    <v-toolbar-title class="white--text">{{ pastMonths[1] }}</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]='{ item }'>
                <v-icon
                    color="green"
                    @click="downloadBkp(item)" >
                    mdi-download
                </v-icon>
                <v-icon
                    class="ml-1"
                    color="red"
                    @click="deleteBkp(item)" >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
    export default {
        name: 'Management',
        data() {
            return {
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
                        value: 'actions',
                        align: 'center',
                        sortable: false
                    }
                ]
            }
        },
        computed: {
            loading() {
                return this.$store.getters.loading;
            },
            currentMonth() {
                return parseInt(new Date().toISOString().split('-')[1]);
            },
            lastMonth() {
                return this.currentMonth - 1 === 0 ? 12 : this.currentMonth - 1;
            },
            twoMonthsAgo() {
                return this.currentMonth - 2 === 0 ? 12 : this.currentMonth - 2;
            },
            pastMonths() {
                return [this.months[this.lastMonth], this.months[this.twoMonthsAgo]];
            },
            backups() {
                return this.$store.getters.getBackups;
            }
        },
        methods: {
            backup() {
                const now = new Date().toISOString();
                this.$store.dispatch('backupFirebase', { now });
            },
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
            downloadBkp(bkp) {
                const iso = new Date().toISOString().replace(/:/g, '-');
                const date = iso.split('T')[0];
                const time = iso.split('T')[1].replace(/-/g, ':');

                const newDate = date + 'T' + time;

                const locale = new Date(newDate).toLocaleString();
                const month = locale.split('/')[0];

                const dateTime = new Date(newDate).toString();
                const sub = dateTime.substr(7, 17);
                const monthName = this.months[month].substr(0, 3);

                const fullDate = monthName + sub;

                console.log(bkp);
            },
            deleteBkp(backup) {

            }
        },
        mounted() {
            this.months = this.$store.getters.getMonths;
            setTimeout(() => {
                this.$store.dispatch('clearLoading');
            }, 2000);
        },
        created() {
            this.$store.dispatch('loadBackups');
        }
    }
</script>

<style>

</style>
