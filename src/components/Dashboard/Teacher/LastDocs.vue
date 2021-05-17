<template>
    <v-card width="100%" height="100%" class="last-docs">
        <div class="last-docs-container">
            <h2 class="card-title">Documentos recentes</h2>
            <div v-if="documents && documents.length > 0" class="documents" :style="getFlexStyle">
                <div v-for="item in documents" :key="item.id" class="document-row">
                    <div class="name">{{ item.name }}</div>
                    <div class="date">{{ formatDate(item.updated) }}</div>
                </div>
            </div>
            <div v-else class="no-content">
                Não há documentos no momento
            </div>
        </div>
    </v-card>
</template>

<script>
    export default {
        name: 'LastDocs',
        computed: {
            documents() {
                return this.$store.getters.getLastPapers;
            },
            getFlexStyle() {
                if (this.documents.length <= 4) {
                    return { justifyContent: 'flex-start', gap: '10px' };
                } else {
                    return { justifyContent: 'space-between' };
                }
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            months() {
                return this.$store.getters.getMonths;
            }
        },
        methods : {
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
        mounted() {
            if (this.userClaims['teacher']) {
                this.$store.dispatch('loadLastPapers');
            }
        }
    }
</script>

<style scoped>
    .last-docs-container, .no-content {
        display: flex;
        flex-direction: column;

        position: relative;

        width: 100%;
        height: 100%;

        padding: 20px;
        padding-bottom: 10px;
    }

    .no-content {
        justify-content: center;
        align-items: center;

        margin-bottom: 20px;
        padding-bottom: 20px;

        color: #999;
        font-size: 1.2rem;
    }

    .card-title {
        color: #555;
        font-size: 1.2rem;
        font-weight: 500;

        margin-bottom: 10px;
    }

    .documents {
        display: flex;
        flex-direction: column;

        flex-grow: 1;
    }

    .document-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        width: 100%;
    }

    .document-row .name {
        color: #333;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        transition: all 0.3s;
    }

    .document-row .date {
        color: #777;
        font-weight: 500;
        font-size: 0.9rem;

        min-width: 81px;

        transition: all 0.3s;
    }

    .document-row:hover .name,
    .document-row:hover .date {
        color: #2196F3;
    }

    @media (min-width: 761px) and (max-width: 900px) {
        .documents {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: 1fr 1fr 1fr;
            grid-auto-flow: column;
            row-gap: 10px;
            column-gap: 40px;
        }

        .last-docs-container {
            padding-bottom: 20px;
        }
    }
</style>
