<template>
    <v-container class="fill-height">
        <v-row>
            <v-container>
                <v-form @submit.prevent="onSignup">
                    <v-row>
                      <v-text-field
                          name="email"
                          label="Mail"
                          id="email"
                          v-model="email"
                          type="email"
                          required>
                      </v-text-field>
                    </v-row>
                    <v-row>
                      <v-text-field
                          name="password"
                          label="Password"
                          id="password"
                          v-model="password"
                          type="password"
                          required>
                      </v-text-field>
                    </v-row>
                    <v-row>
                      <v-text-field
                          name="confirmPassword"
                          label="Confirm Password"
                          id="confirmPassword"
                          v-model="confirmPassword"
                          type="password"
                          :rules="[comparePassword]">
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
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  computed: {
    comparePassword () {
      return this.password !== this.confirmPassword ? 'Passwords do not match' : ''
    },
    user () {
      return this.$store.getters.user
    },
    error () {
        return this.$store.getters.error
    },
    loading () {
        return this.$store.getters.loading
        this.$store.dispatch('clearLoading')
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
    onSignup () {
      this.$store.dispatch('signUserUp', {email: this.email, password: this.password})
    },
    onDismissed () {
        console.log('Dismissed Alert!')
        this.$store.dispatch('clearError')
    }
  }
}
</script>
