<template>
    <v-container fluid class="sign-card fill-height">
        <v-row class="sign-title" justify="center" align="center">
            <h2>{{ showSignIn ? 'Entrar' : 'Registrar' }}</h2>
        </v-row>
        <v-row class="sign-options fill-height" justify="center" align="center">
            <v-col cols="11">
                <v-form @submit.prevent="onSignin" v-if="showSignIn">
                    <v-row justify="center">
                        <v-text-field
                            name="email"
                            label="E-mail"
                            id="email"
                            v-model="email"
                            type="email"
                            required
                            :rules="required" >
                        </v-text-field>
                    </v-row>
                    <v-row justify="center">
                        <v-text-field
                            name="password"
                            label="Senha"
                            id="password"
                            v-model="password"
                            type="password"
                            required
                            :rules="required" >
                        </v-text-field>
                    </v-row>
                    <v-row style="margin-top: 10px" justify="end">
                        <v-btn color='blue' :dark='!loading' type="submit" :disabled="loading" :loading="loading">
                            Entrar
                            <span class="custom-loader">
                                <v-icon light></v-icon>
                            </span>
                        </v-btn>
                    </v-row>
                </v-form>

                <v-form @submit.prevent="onSignup" v-else>
                    <v-row justify="center">
                        <v-text-field
                            name="name"
                            label="Nome"
                            id="name"
                            v-model="name"
                            type="text"
                            :rules='required'
                            required>
                        </v-text-field>
                    </v-row>
                    <v-row justify="center">
                        <v-text-field
                            name="email"
                            label="E-mail"
                            id="email"
                            v-model="email"
                            type="email"
                            :rules='required'
                            required>
                        </v-text-field>
                    </v-row>
                    <v-row justify="center">
                        <v-text-field
                            name="password"
                            label="Senha"
                            id="password"
                            v-model="password"
                            type="password"
                            :rules='required'
                            required>
                        </v-text-field>
                    </v-row>
                    <v-row justify="center">
                        <v-text-field
                            name="confirmPassword"
                            label="Confirmar senha"
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            :rules="[...required, comparePassword]">
                        </v-text-field>
                    </v-row>
                    <v-row style="margin-top: 10px" justify="end">
                        <v-btn color='blue' :dark='!loading' type="submit" :disabled="loading" :loading="loading">
                            Registrar
                            <span class="custom-loader">
                                <v-icon light></v-icon>
                            </span>
                        </v-btn>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>

        <v-row class="sign-footer" cols="12">
            <v-row class="to-sign-in" v-if="showSignUp">
                <span>Já possui uma conta?</span>
                <v-btn
                    text
                    color='blue'
                    @click="SignIn"
                    :ripple="false" >
                    <strong>Entrar</strong>
                </v-btn>
            </v-row>
            <v-row class="to-sign-up" v-else>
                <span>Não possui uma conta?</span>
                <v-btn
                    text
                    color='blue'
                    @click="SignUp"
                    :ripple="false" >
                    <strong>Registrar-se</strong>
                </v-btn>
            </v-row>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        data: () => ({
            showSignIn: true,
            showSignUp: false,
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            required: [
                value => (value && value.length > 0) || 'Este campo é obrigatório!'
            ]
        }),
        computed: {
            comparePassword() {
                return this.password === this.confirmPassword || 'As senhas não correspondem!';
            },
            user () {
                return this.$store.getters.user;
            },
            error () {
                return this.$store.getters.error;
            },
            loading () {
                return this.$store.getters.loading;
            }
        },
        methods: {
            SignUp() {
                this.password = '';
                this.showSignUp = true;
                this.showSignIn = false;
            },
            SignIn() {
                this.password = '';
                this.confirmPassword = '';
                this.showSignUp = false;
                this.showSignIn = true;
            },
            onSignin () {
                this.$store.dispatch('signUserIn', {email: this.email, password: this.password});
                if(window.location.pathname !== '/') {
                    this.$router.push('/');
                }
            },
            onSignup() {
                this.$store.dispatch('signUserUp', {name: this.name, email: this.email, password: this.password});
                if(window.location.pathname !== '/') {
                    this.$router.push('/');
                }
            },
            back() {
                this.$store.commit("clearError")
                this.showSignIn = true;
                this.showSignUp = false;
            }
        }
    }
</script>

<style>
    .sign-card {
        position: relative;

        min-height: 600px;
        margin: 0;

        border-radius: 5px;

        background-color: #fff;
        box-shadow: 0px 4px 8px 0px #0005;
    }

    .sign-title {
        color: #444;
    }

    .sign-options {
        width: 100%;
        margin: 10px 0 10px 0;
        padding: 20px;
    }

    .sign-footer {
        bottom: 10px;
    }

    .to-sign-in {
        text-align: center;
        justify-content: center;
        align-items: center;
    }

    .to-sign-up {
        text-align: center;
        justify-content: center;
        align-items: center;
    }
</style>
