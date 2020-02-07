<template>
  <transition
    name="fade"
    mode="out-in"
  >
    <v-content v-if="showSignOption">
      <v-row justify="center" class="pb-4">
        <v-btn
          rounded
          class="primary"
          width="10vw"
          @click="SignIn"
        >
          Sign In
        </v-btn>
      </v-row>
      <v-row justify="center" class="pb-4">
        <v-btn
          rounded
          class="primary"
          width="10vw"
          @click="SignUp"
        >
          Sign Up
        </v-btn>
      </v-row>
    </v-content>

    <div v-else>
      <SignIn v-if="showSignIn"/>
      <SignUp v-if="showSignUp"/>
      <v-btn
        v-if="!showSignOption"
        fixed
        fab
        bottom
        left
        @click="back()"
      >
        <v-icon>
          mdi-arrow-left
        </v-icon>
      </v-btn>
    </div>

  </transition>
</template>

<script>
import SignIn from '@/components/User/SignIn'
import SignUp from '@/components/User/SignUp'

export default {
  data: () => ({
    showSignIn: false,
    showSignUp: false,
    showSignOption: true,
  }),
  components: {
    SignIn,
    SignUp
  },
  methods: {
    SignUp() {
      this.showSignOption = false;
      this.showSignUp = true;
    },
    SignIn() {
      this.showSignOption = false;
      this.showSignIn = true;
    },
    back() {
      this.$store.commit("clearError")
      this.showSignIn = false;
      this.showSignUp = false;
      this.showSignOption = true;
    }
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to{
  opacity: 0;
}

</style>
