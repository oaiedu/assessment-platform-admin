<template>
    <div>
        <v-alert
            v-if='confirmCondition'
            text
            prominent
            type='warning'
            color="red"
            :icon='mdiAlert' >
            Exclusão confirmada! Quando deixar esta página, a tabela será atualizada.
        </v-alert>

        <v-alert
            v-if='itemsCondition'
            text
            prominent
            type='warning'
            color="red"
            :icon='mdiAlert' >
            {{ itemsText }}
            <br>
            {{ items }}


            <div v-if="isAdmin">
                <br>
                Marcadas por você:
                <br>
                {{ adminItems }}
            </div>
        </v-alert>
    </div>
</template>

<script>
    import { mdiAlert } from '@mdi/js';

    export default {
        name: 'DeleteAlertPapers',
        props:['confirmCondition', 'itemsCondition', 'itemsText', 'items', 'isAdmin', 'adminItems'],
        data() {
            return {
                mdiAlert
            }
        }
    }
</script>
