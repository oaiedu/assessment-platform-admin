<template>
    <v-card width="100%" height="100%" class="last-data">
        <div class="last-data-container">
            <div class="last-backup" v-if="lastBackup">
                <div class="icon-container">
                    <v-icon size="26" color="#219653">{{ mdiCloud }}</v-icon>
                </div>
                <div class="data-info">
                    <span class="info-title">Último Backup</span>
                    <span class="backup-id">
                        {{ lastBackup.id }}
                        <span class="creation-date">{{ formatDate(lastBackup.start) }}</span>
                    </span>
                </div>
                <div class="creation-date">{{ formatDate(lastBackup.start) }}</div>
            </div>
            <div class="last-error-log" v-if="lastLog">
                <div class="icon-container">
                    <v-icon size="26" color="#FF2233">{{ mdiFileAlertOutline }}</v-icon>
                </div>
                <div class="data-info">
                    <span class="info-title">Último Registro de Erro</span>
                    <span class="log-type">
                        {{ lastLog.type }}
                        <span class="creation-date">{{ formatDate(lastLog.date) }}</span>
                    </span>
                </div>
                <div class="creation-date">{{ formatDate(lastLog.date) }}</div>
            </div>
            <div class="last-user" v-if="lastUser">
                <div class="icon-container">
                    <v-icon size="30" color="#2F80ED">{{ mdiAccount }}</v-icon>
                </div>
                <div class="data-info">
                    <span class="info-title">Último Usuário Criado</span>
                    <span class="user-name">
                        {{ lastUser.name }}
                        <span class="creation-date">{{ formatDate(lastUser.created) }}</span>
                    </span>
                </div>
                <div class="creation-date">{{ formatDate(lastUser.created) }}</div>
            </div>
        </div>
    </v-card>
</template>

<script>
    import { mdiAccount, mdiCloud, mdiFileAlertOutline } from '@mdi/js';

    export default {
        name: 'LastData',
        data() {
            return {
                mdiAccount,
                mdiCloud,
                mdiFileAlertOutline
            }
        },
        computed: {
            lastBackup() {
                return this.$store.getters.getLastBackup;
            },
            lastLog() {
                return this.$store.getters.getLastLog;
            },
            lastUser() {
                return this.$store.getters.getLastUser;
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
                const backupDate = new Date(`${month}/${day}/${year}`);

                const diffDays = Math.floor(Math.abs(today - backupDate) / (1000 * 60 * 60 * 24));

                const backupTime = date.split('T')[1].split('.')[0].substr(0, 5);

                if (diffDays === 0) {
                    return `Hoje às ${backupTime}`;
                } else if (diffDays === 1) {
                    return `Ontem às ${backupTime}`
                } else {
                    return `${this.months[parseInt(month)].substr(0, 3)} ${day} ${year}`;
                }
            }
        },
        mounted() {
            if (this.userClaims['admin']) {
                this.$store.dispatch('loadLastBackup');
                this.$store.dispatch('loadLastLog');
                this.$store.dispatch('loadLastUser');
            }
        }
    }
</script>

<style scoped>
    .last-data-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        width: 100%;
        height: 100%;

        padding: 20px;
    }

    .icon-container {
        display: flex;
        justify-content: center;
        align-items: center;

        height: 50px;
        width: 50px;

        margin-right: 10px;

        border-radius: 5px;
    }

    .last-backup,
    .last-error-log,
    .last-user {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .last-backup .icon-container {
        background-color: #21965355;
    }

    .last-error-log .icon-container {
        background-color: #FF223355;
    }

    .last-user .icon-container {
        background-color: #2F80ED55;
    }

    .data-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
    }

    .backup-id,
    .log-type,
    .user-name {
        font-size: 0.95rem;
    }

    .data-info .creation-date {
        display: none;
    }

    .backup-id {
        color: #219653;
    }

    .log-type {
        color: #FF2233;
    }

    .user-name {
        color: #2F80ED;
    }

    .info-title {
        color: #555;
        font-weight: 500;
    }

    .creation-date {
        color: #555;
        font-size: 0.95rem;
    }

    @media(max-width: 960px) {
        .creation-date {
            display: none;
        }

        .data-info .creation-date {
            display: block;
        }
    }

    @media(max-width: 900px) {
        .last-data-container {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
    }

    @media(max-width: 760px) {
        .last-data-container {
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
        }
    }

    @media(max-width: 660px) {
        .data-info {
            flex-grow: 1;
        }

        .creation-date {
            display: block;
        }

        .data-info .creation-date {
            display: none;
        }

        .last-backup,
        .last-error-log,
        .last-user {
            width: 100%;
        }
    }

    @media (max-width: 400px) {
        .creation-date {
            display: none;
        }

        .data-info .creation-date {
            display: block;
        }
    }

    @media (max-width: 300px) {
        .info-title {
            font-size: 0.9rem;
        }

        .backup-id,
        .log-type,
        .user-name {
            font-size: 0.85rem;
        }

        .data-info .creation-date {
            font-size: 0.85rem;
        }
    }
</style>
