<template>
    <v-container>
        <Definition
            :title='title'
            :creator='creator'
            :editedDate='editedDate'
            :purpose='purpose' />

        <v-tooltip right>
            <template v-slot:activator='{ on, attrs }'>
                <v-btn
                    v-on="on"
                    v-bind="attrs"
                    fixed
                    fab
                    bottom
                    left
                    @click="back()" >
                    <v-icon>{{ mdiArrowLeft }}</v-icon>
                </v-btn>
            </template>
            <span>Voltar</span>
        </v-tooltip>
    </v-container>
</template>

<script>
    import { mdiArrowLeft } from '@mdi/js';
    import Definition from '../../Tests/Definition';

    export default {
        name: 'Intro',
        components: { Definition },
        data() {
            return {
                mdiArrowLeft,
                title: 'Título',
                creator: 'Criador',
                editedDate: 'Usuário - 01/01/2021',
                purpose: 'Propósito'
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogIntro');
            }
        }
    }
</script>

<style>

</style>
