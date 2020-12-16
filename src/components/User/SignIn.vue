<template>
    <v-container class="fill-height">
        <v-row>
            <v-container>
                <v-form @submit.prevent="onSignin">
                    <v-row>
                        <v-text-field
                            name="email"
                            label="Email"
                            id="email"
                            v-model="email"
                            type="email"
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
                          required>
                      </v-text-field>
                    </v-row>
                    <v-row>
                        <v-btn type="submit" :disabled="loading" :loading="loading">
                            Sign In
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
      email: '',
      password: ''
    }
  },
  computed: {
    user () {
        return this.$store.getters.user;
    },
    error () {
        return this.$store.getters.error;
    },
    loading () {
        return this.$store.getters.loading;
        this.$store.dispatch('clearLoading');
    }
  },
  methods: {
    onSignin () {
      this.$store.dispatch('signUserIn', {email: this.email, password: this.password});
      if(window.location.pathname !== '/') {
        this.$router.push('/');
      }
    },
    onDismissed () {
        console.log('Dismissed Alert!');
        this.$store.dispatch('clearError');
    }
  }
}
</script>
