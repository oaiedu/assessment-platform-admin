<template>
    <v-container>
        <div class="text-center mt-5">
            <h1 class="blue--text">Administração</h1>
        </div>

        <v-tooltip left>
            <template v-slot:activator='{ on, attrs }' >
                <v-btn
                    color="green"
                    dark
                    x-large
                    fab
                    v-bind='attrs'
                    v-on='on'
                    fixed
                    style="bottom: 30px; right: 30px;"
                    @click="backup()" >
                    <v-icon>mdi-cloud-upload</v-icon>
                </v-btn>
            </template>
            <span>Fazer Backup</span>
        </v-tooltip>

        <!-- <v-btn
            color="orange"
            dark
            x-large
            fab
            fixed
            style="bottom: 120px; right: 30px;"
            @click="testAPI" >
            <v-icon>mdi-share</v-icon>
        </v-btn> -->

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
            </v-tabs-items>
        </template>
    </v-container>
</template>

<script>
    import BackupsTable from './BackupsTable';
    import UsersTable from './UsersTable';

    export default {
        name: 'Management',
        components: { BackupsTable, UsersTable },
        data() {
            return {
                tab: null
            }
        },
        methods: {
            backup() {
                const now = new Date().toISOString();
                this.$store.dispatch('backupFirebase', { now });
            },
            testAPI() {
                this.$store.dispatch('testAPI');
            }
        },
        created() {
            this.$store.dispatch('loadBackups');
            this.$store.dispatch('loadUsers');
        }
    }
</script>

<style>

</style>
