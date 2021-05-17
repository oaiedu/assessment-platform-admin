<template>
    <v-card width="100%" height="100%" class="tests-table">
        <v-data-table
            class="dashboard-tests-table"
            :headers="headers"
            :items="tests"
            :loading="loading"
            no-data-text='Não há provas a serem mostradas'
            loading-text="Carregando provas..."
            hide-default-footer
            style="height: 100% !important;"
            height="100%" >
            <template v-slot:[`item.type`]='{ item }'>
                <div class="type-container">
                    <div class="icon-container" :style="{ backgroundColor: item.type === 'random' ? '#2196F344' : '#6755FA44' }">
                        <v-icon v-if="item.type === 'selected'"
                            size="20"
                            color="#6755FA">{{ mdiCheckboxMultipleMarked }}</v-icon>
                        <v-icon v-else
                            size="20"
                            color="#2196F3">{{ mdiShuffleVariant }}</v-icon>
                    </div>
                    <span class="type-text">
                        {{ item.type === 'selected' ? 'Selecionado' : 'Aleatório' }}
                    </span>
                </div>
            </template>
            <template v-slot:[`item.user`]='{ item }'>
                {{ item.user.name || item.user.email }}
            </template>
            <template v-slot:[`item.updated`]='{ item }'>
                {{ formatDate(item.updated) }}
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    import { mdiCheckboxMultipleMarked, mdiShuffleVariant } from '@mdi/js';

    export default {
        name: 'TestsTable',
        data() {
            return {
                headers: [
                    { text: 'Nome', sortable: false, value: 'title', align: 'left' },
                    { text: 'Tipo', sortable: false, value: 'type', align: 'left' },
                    { text: 'Questões', sortable: false, value: 'questions.length', align: 'left' },
                    { text: 'Usuário', sortable: false, value: 'user', align: 'left' },
                    { text: 'Data de criação', sortable: false, value: 'updated', align: 'left' },
                ],
                mdiCheckboxMultipleMarked,
                mdiShuffleVariant
            }
        },
        computed: {
            tests() {
                return this.$store.getters.getLastTests;
            },
            loading() {
                return this.$store.getters.loading;
            },
            months() {
                return this.$store.getters.getMonths;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            }
        },
        methods: {
            formatDate(date) {
                const year = date.substr(0, 4);
                const month = date.substr(5, 2);
                const day = date.substr(8, 2);

                const today = new Date();
                const testDate = new Date(`${month}/${day}/${year}`);

                const diffDays = Math.floor(Math.abs(today - testDate) / (1000 * 60 * 60 * 24));

                const testTime = date.split('T')[1].split('.')[0].substr(0, 5);

                if (diffDays === 0) {
                    return `Hoje às ${testTime}`;
                } else if (diffDays === 1) {
                    return `Ontem às ${testTime}`
                } else {
                    return `${this.months[parseInt(month)].substr(0, 3)} ${day} ${year}`;
                }
            }
        },
        created() {
            if (this.userClaims['student']) {
                this.$store.dispatch('loadLastTests', 10);
            } else {
                this.$store.dispatch('loadLastTests', 5);
            }
        }
    }
</script>

<style scoped>
    .icon-container {
        display: flex;
        justify-content: center;
        align-items: center;

        height: 30px;
        width: 30px;

        border-radius: 60px;
        margin-right: 5px;

        animation: animate-icon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .type-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    @keyframes animate-icon {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(1);
        }
    }
</style>
