<template>
    <v-container>
        <div class="text-center mt-5 mb-5">
            <h1 class="blue--text">Administração</h1>
        </div>

        <template>
            <v-tabs
                v-model='tab'
                background-color="white" >
                <v-tab>
                    <v-icon left>
                        mdi-database
                    </v-icon>
                    Backups
                </v-tab>
                <v-tab>
                    <v-icon left>
                        mdi-account
                    </v-icon>
                    Usuários
                </v-tab>
                <v-tab>
                    <v-icon left>
                        mdi-file-document
                    </v-icon>
                    Logs
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab" >
                <v-tab-item>
                    <v-card>
                        <BackupsTable />
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card>
                        <UsersTable />
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card>
                        <LogsTable />
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </template>
    </v-container>
</template>

<script>
    import BackupsTable from './BackupsTable';
    import UsersTable from './UsersTable';
    import LogsTable from './LogsTable';

    export default {
        name: 'Management',
        components: { BackupsTable, UsersTable, LogsTable },
        data() {
            return {
                tab: null
            }
        },
        created() {
            this.$store.dispatch('loadBackups');
            this.$store.dispatch('loadUsers');
            this.$store.dispatch('loadLogs');
        }
    }
</script>

<style>

</style>
