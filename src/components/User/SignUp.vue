<template>
    <v-container class="fill-height">
        <v-row>
            <v-container>
                <v-form @submit.prevent="onSignup">
                    <v-row>
                      <v-text-field
                          name="name"
                          label="Name"
                          id="name"
                          v-model="name"
                          type="text"
                          :rules='required'
                          required>
                      </v-text-field>
                    </v-row>
                    <v-row>
                      <v-text-field
                          name="email"
                          label="Email"
                          id="email"
                          v-model="email"
                          type="email"
                          :rules='required'
                          required>
                      </v-text-field>
                    </v-row>
                    <v-row>
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
                    <v-row>
                      <v-text-field
                          name="confirmPassword"
                          label="Confirmar senha"
                          id="confirmPassword"
                          v-model="confirmPassword"
                          type="password"
                          :rules="[...required, comparePassword]">
                      </v-text-field>
                    </v-row>
                    <v-row>
                      <v-btn type="submit" :disabled="loading" :loading="loading">
                          Sign Up
                          <span class="custom-loader">
                              <v-icon light></v-icon>
                          </span>
                      </v-btn>
                    </v-row>
                </v-form>
            </v-container>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data () {
        return {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            required: [
                value => (value && value.length > 0) || 'Este campo é obrigatório!'
            ]
        }
    },
    computed: {
        comparePassword() {
            return this.password === this.confirmPassword || 'As senhas não correspondem!';
        },
        user() {
            return this.$store.getters.user
        },
        error() {
            return this.$store.getters.error
        },
        loading() {
            return this.$store.getters.loading
            this.$store.dispatch('clearLoading')
        }
    },
    methods: {
        onSignup() {
            this.$store.dispatch('signUserUp', {name: this.name, email: this.email, password: this.password});
            if(window.location.pathname !== '/') {
                this.$router.push('/');
            }
        },
        onDismissed() {
            console.log('Dismissed Alert!');
            this.$store.dispatch('clearError');
        }
  }
}
</script>
