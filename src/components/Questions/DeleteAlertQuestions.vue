<template>
    <div>
        <v-alert
            v-if='confirmCondition'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            Exclusão confirmada! Quando deixar esta página, a tabela será atualizada.
        </v-alert>

        <v-alert
            v-if='itemsCondition'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            {{ itemsText }}
            <br>
            {{ items }}
        </v-alert>
    </div>
</template>

<script>
    export default {
        name: 'DeleteAlertQuestions',
        props:['confirmCondition', 'itemsCondition', 'itemsText', 'items']
    }
</script>
