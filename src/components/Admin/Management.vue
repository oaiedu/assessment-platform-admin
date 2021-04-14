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
                        {{ mdiDatabase }}
                    </v-icon>
                    Backups
                </v-tab>
                <v-tab>
                    <v-icon left>
                        {{ mdiAccount }}
                    </v-icon>
                    Usuários
                </v-tab>
                <v-tab>
                    <v-icon left>
                        {{ mdiFileDocument }}
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
    import { mdiFileDocument, mdiAccount, mdiDatabase } from '@mdi/js';
    import BackupsTable from './BackupsTable';
    import UsersTable from './UsersTable';
    import LogsTable from './LogsTable';

    export default {
        name: 'Management',
        components: { BackupsTable, UsersTable, LogsTable },
        data() {
            return {
                mdiDatabase,
                mdiAccount,
                mdiFileDocument,
                tab: 0,
                isUsersLoaded: false,
                isLogsLoaded: false
            }
        },
        watch: {
            tab(number) {
                if (number === 1 && !this.isUsersLoaded) {
                    this.$store.dispatch('loadUsers');
                    this.isUsersLoaded = true;
                } else if (number === 2 && !this.isLogsLoaded) {
                    this.$store.dispatch('loadLogs');
                    this.isLogsLoaded = true;
                }
            }
        },
        created() {
            this.$store.dispatch('loadBackups');
        }
    }
</script>

<style>

</style>
