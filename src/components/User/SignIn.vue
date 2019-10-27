<template>
    <v-container fluid> 
        <v-row align="center">    
            <v-flex xs12 sm6 offset-sm3>    
                <v-card>
                    <v-card-text>
                        <v-container>
                            <form>
                                <v-row>
                                    <v-flex xs12>    
                                        <v-text-field
                                            name="email"
                                            label="Mail"
                                            id="email"
                                            v-model="email"
                                            type="email"
                                            required>
                                        </v-text-field>
                                    </v-flex>
                                </v-row>
                                <v-row>
                                    <v-flex xs12>
                                        <v-text-field
                                            name="password"
                                            label="Password"
                                            id="password"
                                            v-model="password"
                                            type="password"
                                            required>
                                        </v-text-field>
                                    </v-flex>
                                </v-row>
                                <v-row>
                                    <v-flex xs12>
                                        <v-btn type="submit">
                                            Sign In
                                        </v-btn>
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

<script>
</script>