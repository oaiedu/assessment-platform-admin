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
                            <form @submit.prevent="onSignup">
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
                                        <v-text-field
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            id="confirmPassword"
                                            v-model="confirmPassword"
                                            type="password"
                                            :rules="[comparePassword]">
                                        </v-text-field>
                                    </v-flex>
                                </v-row>
                                <v-row>
                                    <v-flex xs12>
                                        <v-btn type="submit">
                                            Sign Up
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
    export default {
        data () {
            return {
                email: '',
                password: '',
                confirmPassword: ''
            }
        },
        computed: {
            comparePassword () {
                return this.password != this.confirmPassword ? 'Passwords do not match' : ''
            }
        },
        methods: {
            onSignup(){
                console.log(this.email)
            }
        }
    }
</script>