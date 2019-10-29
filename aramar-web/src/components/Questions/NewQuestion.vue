<template>
        <v-container
            class="fill-height"
            fluid>
            <v-row
                align="center">
                <v-flex xs12 sm6 offset-sm3>
                    <v-card>
                        <v-card-text>
                            <v-container>
                                <form>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="assunto"
                                                label="Assunto"
                                                id="assunto"
                                                v-model="assunto"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row> 
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="conhecimento"
                                                label="Conhecimento"
                                                id="conhecimento"
                                                v-model="conhecimento"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                            <v-text-field
                                                name="id"
                                                label="ID"
                                                id="id"
                                                v-model="id"
                                                required>
                                            </v-text-field>
                                        </v-flex>
                                    </v-row>
                                    <v-row>
                                        <v-flex xs12>
                                             <v-container fluid>   
                                                <p>Questão</p>
                                                <v-textarea
                                                    outlined
                                                    filled>
                                                </v-textarea>
                                            </v-container>
                                        </v-flex>
                                    </v-row>
                                </form>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-row>
        </v-container>
</template>