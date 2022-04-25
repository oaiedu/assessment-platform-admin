<template>
  <v-container fluid class="sign__card">
    <div class="sign__pwr">
      <img src="../../assets/LGlogo.svg" alt="Logo" />

      <h2>Cloud Quiz Generator</h2>
    </div>

    <div class="sign__title">
      <h2>
        {{ $t("SIGN_USER.title_" + (showSignIn ? "login" : "register")) }}
      </h2>
    </div>

    <v-form v-if="showSignIn" class="sign__options" @submit.prevent="onSignin">
      <v-row class="pa-0 ma-0">
        <v-text-field
          v-model="email"
          required
          id="email"
          name="email"
          type="email"
          :label="$t('SIGN_USER.FIELD.email')"
          :rules="requiredRule()"
        ></v-text-field>
      </v-row>

      <v-row class="pa-0 ma-0">
        <v-text-field
          v-model="password"
          required
          id="password"
          name="password"
          :label="$t('SIGN_USER.FIELD.password')"
          :rules="requiredRule()"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? mdiEyeOff : mdiEye"
          @click:append="showPassword = !showPassword"
        ></v-text-field>
      </v-row>

      <v-row class="sign__forgot-pw pa-0 ma-0 my-4">
        <v-btn text color="#56b3ec" @click="forgotPassword()">
          {{ $t("SIGN_USER.forget_password") }}
        </v-btn>
      </v-row>

      <v-btn
        rounded
        class="font-weight-bold"
        color="#56b3ec"
        type="submit"
        height="50px"
        width="100%"
        :dark="!!(email && password)"
        :disabled="!(email && password)"
        :loading="loading"
      >
        {{ $t("SIGN_USER.login") }}
        <span class="custom-loader">
          <v-icon light></v-icon>
        </span>
      </v-btn>
    </v-form>

    <v-form v-else class="sign__options" @submit.prevent="onSignup">
      <v-row class="pa-0 ma-0">
        <v-text-field
          v-model="name"
          required
          id="name"
          name="name"
          type="text"
          :label="$t('SIGN_USER.FIELD.name')"
          :rules="requiredRule()"
        ></v-text-field>
      </v-row>

      <v-row class="pa-0 ma-0">
        <v-text-field
          v-model="email"
          required
          id="email"
          name="email"
          type="email"
          :label="$t('SIGN_USER.FIELD.email')"
          :rules="requiredRule()"
        ></v-text-field>
      </v-row>

      <v-row class="pa-0 ma-0">
        <v-text-field
          v-model="password"
          required
          id="password"
          name="password"
          :label="$t('SIGN_USER.FIELD.password')"
          :rules="requiredRule()"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? mdiEyeOff : mdiEye"
          @click:append="showPassword = !showPassword"
        ></v-text-field>
      </v-row>

      <v-row class="pa-0 ma-0 mb-4">
        <v-text-field
          v-model="confirmPassword"
          id="confirmPassword"
          name="confirmPassword"
          :label="$t('SIGN_USER.FIELD.confirm_password')"
          :rules="[...requiredRule(), comparePassword]"
          :type="showPasswordConfirm ? 'text' : 'password'"
          :append-icon="showPasswordConfirm ? mdiEyeOff : mdiEye"
          @click:append="showPasswordConfirm = !showPasswordConfirm"
        ></v-text-field>
      </v-row>

      <v-btn
        rounded
        class="font-weight-bold"
        color="#56b3ec"
        type="submit"
        height="50px"
        width="100%"
        :dark="!!(name && email && password && confirmPassword)"
        :disabled="!(name && email && password && confirmPassword)"
        :loading="loading"
      >
        {{ $t("SIGN_USER.create_account") }}
        <span class="custom-loader">
          <v-icon light></v-icon>
        </span>
      </v-btn>
    </v-form>

    <v-row class="pa-0 ma-0 grey--text" style="flex: 0">
      <span class="sign__or">{{ $t("SIGN_USER.or") }}</span>
    </v-row>

    <v-row class="pa-0 ma-0" style="flex: 0">
      <v-btn
        fab
        dark
        elevation="0"
        color="#f65314"
        :loading="loading"
        @click="googleSign()"
      >
        <v-icon>{{ mdiGoogle }}</v-icon>
      </v-btn>
    </v-row>

    <div class="sign__footer">
      <v-row class="to-sign__in pa-0 ma-0" v-if="showSignUp">
        <span>{{ $t("SIGN_USER.already_have_account") }}</span>

        <v-btn
          style="padding: 0;"
          text
          color="#56b3ec"
          @click="signIn"
          :ripple="false"
        >
          <strong>{{ $t("SIGN_USER.login") }}</strong>
        </v-btn>
      </v-row>

      <v-row class="to-sign__up pa-0 ma-0" v-else>
        <span>{{ $t("SIGN_USER.no_account") }}</span>

        <v-btn
          style="padding: 0;"
          text
          color="#56b3ec"
          @click="signUp"
          :ripple="false"
        >
          <strong>{{ $t("SIGN_USER.register") }}</strong>
        </v-btn>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { mdiGoogle, mdiEye, mdiEyeOff } from "@mdi/js";

export default {
  name: "SignUser",
  data: () => ({
    mdiGoogle,
    mdiEye,
    mdiEyeOff,
    showSignIn: true,
    showSignUp: false,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showPasswordConfirm: false
  }),
  computed: {
    comparePassword() {
      return (
        this.password === this.confirmPassword ||
        this.$t("SIGN_USER.ERROR.password_dont_match")
      );
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    requiredRule() {
      return [
        value =>
          (value && value.length > 0) || this.$t("SIGN_USER.ERROR.required")
      ];
    },
    googleSign() {
      this.$emit("googleSign");
    },
    signUp() {
      this.password = "";
      this.showSignUp = true;
      this.showSignIn = false;
    },
    signIn() {
      this.password = "";
      this.confirmPassword = "";
      this.showSignUp = false;
      this.showSignIn = true;
    },
    onSignin() {
      this.$store.dispatch("signUserIn", {
        email: this.email,
        password: this.password
      });
    },
    onSignup() {
      this.$store.dispatch("signUserUp", {
        name: this.name,
        email: this.email,
        password: this.password
      });
    },
    back() {
      this.$store.commit("clearError");
      this.showSignIn = true;
      this.showSignUp = false;
    },
    forgotPassword() {
      this.$emit("forgotPassword");
    }
  }
};
</script>

<style>
.sign__card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  position: relative;

  height: 100%;

  margin: 0;
  padding: 2rem 6rem;

  border-radius: 50px 0 0 0;

  background-color: #fff;
}

.sign__pwr {
  display: none;
  align-items: center;
  gap: 6px;

  height: 24px;
  width: 100%;

  /* margin-bottom: 0.5rem; */
}

.sign__pwr img {
  height: 100%;
}

.sign__pwr h2 {
  color: #56b3ec;
  font-weight: normal;
  font-size: 1.1rem;
}

.sign__title {
  width: 100%;
}

.sign__title h2 {
  font-weight: 500;
  font-size: 1.2rem;
  color: #1d1d1d;
}

.sign__options {
  width: 100%;
}

.sign__footer {
  width: 100%;
}

.sign__forgot-pw > .v-btn {
  padding: 0 !important;
}

.sign__forgot-pw,
.to-sign__in,
.to-sign__up {
  font-size: 0.9rem;

  text-align: center;
  justify-content: center;
  align-items: center;
}

.sign__forgot-pw {
  justify-content: flex-start;
}

.sign__forgot-pw > span,
.to-sign__in > span,
.to-sign__up > span {
  margin-right: 10px;
}

.sign__forgot-pw > .v-btn::before,
.to-sign__in > .v-btn::before,
.to-sign__up > .v-btn::before {
  background-color: transparent;
}

@media (max-width: 830px) {
  .sign__pwr {
    display: flex;
  }

  .sign__title {
    top: 60px;
  }
}

@media (max-width: 460px) {
  .sign__card {
    padding: 2rem 1rem;
  }
}

@media (max-width: 330px) {
  .sign__forgot-pw,
  .to-sign__in,
  .to-sign__up {
    display: flex;
    flex-direction: column;
  }

  .sign__forgot-pw > span,
  .to-sign__in > span,
  .to-sign__up > span {
    margin: 0;
  }

  .sign__footer {
    bottom: 30px;
  }
}
</style>
