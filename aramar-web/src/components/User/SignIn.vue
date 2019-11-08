<template>
    <v-container
        class="fill-height"
        fluid>
        <v-row v-if="error">
            <v-flex xs 12 sm6 offset-sm3>
                <app-alert @dismiss="onDismissed" :text="error.message"></app-alert>
            </v-flex>
        </v-row>
        <v-row>
            <v-flex xs12 sm6 offset-sm3>
                <v-card>
                    <v-card-text>
                        <v-container>
                            <v-form @submit.prevent="onSignin">
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
                                        <v-btn type="submit" :disabled="loading" :loading="loading">
                                            Sign In
                                            <span class="custom-loader">
                                                <v-icon light></v-icon>
                                            </span>
                                        </v-btn>
                                    </v-flex>
                                </v-row>
                            </v-form>
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
      password: ''
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    error () {
        return this.$store.getters.error
    },
    loading () {
        return this.$store.getters.loading
    }
  },
  watch: {
    user (value) {
      if (value !== null & value !== undefined) {
          this.$router.push('/')
      }
    }
  },
  methods: {
    onSignin () {
      this.$store.dispatch('signUserIn', {email: this.email, password: this.password})
    },
    onDismissed () {
        console.log('Dismissed Alert!')
        this.$store.dispatch('clearError')
    }
  }
}
</script>
