<template>
    <v-container>
        <v-data-table
            :items='logs'
            class="elevation-1 mt-2"
            :headers="headers"
            :loading="loading"
            loading-text="Carregando logs..."
            no-data-text="Não há logs a serem exibidos" >
            <template v-slot:top>
                <v-toolbar flat color="blue">
                    <v-toolbar-title class="white--text">Logs</v-toolbar-title>
                </v-toolbar>
            </template>

            <template v-slot:[`item.id`]='{ item }'>
                {{ getIdPart(item.id) }}
            </template>

            <template v-slot:[`item.userInfo`]='{ item }'>
                {{ item.user.name || item.user.email }}
            </template>

            <template v-slot:[`item.date`]='{ item }'>
                {{ formatDate(item.date) }}
            </template>

            <template v-slot:[`item.actions`]='{ item }'>
                <v-tooltip top>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-icon
                            v-on='on'
                            v-bind='attrs'
                            @click="downloadLog(item);" >
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
                            class="ml-3"
                            :disabled='item.user.email === userInfo.email'
                            @click="sendEmail(item.user.email)" >
                            mdi-email
                        </v-icon>
                    </template>
                    <span>Enviar e-mail</span>
                </v-tooltip>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
    export default {
        name: 'LogsTable',
        data() {
            return {
                headers: [
                    { text: "ID", align: "left",  value: "id", sortable: true },
                    { text: "Tipo", align: "center",  value: "type", sortable: true },
                    { text: "Usuário", align: "center", value: "userInfo", sortable: true },
                    { text: "Data", align: "center",  value: "date", sortable: true },
                    { text: "Ações", align:"center", value: "actions", sortable: false }
                ]
            }
        },
        computed : {
            logs() {
                const logs = this.$store.getters.logs;
                logs.sort((l1, l2) => l1.date < l2.date ? 1 : -1);
                return logs;
            },
            loading() {
                return this.$store.getters.loading;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            }
        },
        methods: {
            formatDate(date) {
                const dateParts = date.split('T')[0].split('-');
                const time = date.split('T')[1].split('.')[0];

                const year = dateParts[0];
                const month = dateParts[1];
                const day = dateParts[2];

                return `${time} - ${day}/${month}/${year}`;
            },
            getIdPart(id) {
                const parts = id.split('-');
                return `${parts[0]}-${parts[1]}...`;
            },
            sendEmail(email) {
                const a = document.createElement('a');
                a.href = 'mailto:' + email;
                a.click();
                a.remove();
            },
            downloadLog(item) {
                const template = 'ID: ' + item.id
                               + '\nDate: ' + item.date
                               + '\nType: ' + item.type
                               + '\nUser: ' + item.user.id + ' - ' + item.user.email
                               + '\nError: ' + item.message
                               + '\nPayload: ' + JSON.stringify(item.payload);

                const a = document.createElement('a');
                a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(template);
                a.download = 'log_' + item.type.replace(/\s/g, '_').toLowerCase()
                    + '_' + item.id + '_' + item.date + '.txt';
                a.click();
                a.remove();
            }
        }
    }
</script>
