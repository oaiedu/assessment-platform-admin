<template>
    <v-card>
        <v-card-title>
            Documentos Prontos
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="items"
            hide-default-footer
            class="elevation-1">
            <template small v-slot:[`item.actions`]="{ item }">
                <v-tooltip top>
                    <template v-slot:activator='{ on }'>
                        <v-icon
                            v-on="on"
                            @click="eyeClicked(item)" >
                            mdi-eye
                        </v-icon>
                    </template>
                    <span>Visualizar</span>
                </v-tooltip>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    export default {
        name: 'PremadePapersTable',
        data() {
            return {
                headers: [
                    { text: "Nome", align: "left",  value: "name", sortable: true },
                    { text: "Ações", align:"right", value: "actions", sortable: false }
                ],
                items: [
                    { name: "Introdução" },
                    { name: "Questões" },
                    { name: "Estatísticas" },
                    { name: "Gabarito" }
                ]
            }
        },
        methods: {
            eyeClicked(item) {
                this.$emit('eyeClick', item.name);
            }
        }
    }
</script>
