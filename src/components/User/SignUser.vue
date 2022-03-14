<template>
  <v-container fluid class="sign__card fill-height">
    <div class="sign__pwr">
      <h2>Cloud Quiz Generator</h2>
    </div>
    <div class="sign__title">
      <h2>
        {{ showSignIn ? "Entrar em minha conta" : "Criar uma conta" }}
      </h2>
    </div>
    <v-row
      class="sign__options"
      justify="center"
      align="center"
      style="padding: 0; margin: 0;"
    >
      <v-col cols="10" style="padding: 0; margin: 0;">
        <v-form @submit.prevent="onSignin" v-if="showSignIn">
          <v-row justify="center">
            <v-text-field
              name="email"
              label="E-mail"
              id="email"
              v-model="email"
              type="email"
              required
              :rules="required"
            >
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
              :rules="required"
            >
            </v-text-field>
          </v-row>
          <v-row justify="center">
            <v-btn text color="blue" @click="forgotPassword()"
              >Esqueceu a senha?</v-btn
            >
          </v-row>
          <div class="confirm-button-container">
            <v-btn
              color="blue"
              :dark="!loading"
              type="submit"
              :disabled="loading"
              :loading="loading"
            >
              Entrar
              <span class="custom-loader">
                <v-icon light></v-icon>
              </span>
            </v-btn>
          </div>
        </v-form>

        <v-form @submit.prevent="onSignup" v-else>
          <v-row justify="center">
            <v-text-field
              name="name"
              label="Nome"
              id="name"
              v-model="name"
              type="text"
              :rules="required"
              required
            >
            </v-text-field>
          </v-row>
          <v-row justify="center">
            <v-text-field
              name="email"
              label="E-mail"
              id="email"
              v-model="email"
              type="email"
              :rules="required"
              required
            >
            </v-text-field>
          </v-row>
          <v-row justify="center">
            <v-text-field
              name="password"
              label="Senha"
              id="password"
              v-model="password"
              type="password"
              :rules="required"
              required
            >
            </v-text-field>
          </v-row>
          <v-row justify="center">
            <v-text-field
              name="confirmPassword"
              label="Confirmar senha"
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :rules="[...required, comparePassword]"
            >
            </v-text-field>
          </v-row>
          <div class="confirm-button-container">
            <v-btn
              color="blue"
              :dark="!loading"
              type="submit"
              :disabled="loading"
              :loading="loading"
            >
              Registrar
              <span class="custom-loader">
                <v-icon light></v-icon>
              </span>
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>

    <div class="sign__footer">
      <v-row class="to-sign__in" v-if="showSignUp">
        <span>Já possui uma conta?</span>
        <v-btn
          style="padding: 0;"
          text
          color="blue"
          @click="signIn"
          :ripple="false"
        >
          <strong>Entrar</strong>
        </v-btn>
      </v-row>
      <v-row class="to-sign__up" v-else>
        <span>Não possui uma conta?</span>
        <v-btn
          style="padding: 0;"
          text
          color="blue"
          @click="signUp"
          :ripple="false"
        >
          <strong>Registrar-se</strong>
        </v-btn>
      </v-row>
    </div>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    showSignIn: true,
    showSignUp: false,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    required: [
      value => (value && value.length > 0) || "Este campo é obrigatório!"
    ]
  }),
  computed: {
    comparePassword() {
      return (
        this.password === this.confirmPassword || "As senhas não correspondem!"
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
  position: relative;

  height: 100%;
  margin: 0;

  border-radius: 50px 0 0 0;

  background-color: #fff;
}

.confirm-button-container {
  position: absolute;
  left: 50%;
  bottom: 120px;

  transform: translateX(-50%);
}

.sign__pwr {
  display: none;

  position: absolute;
  left: 50%;
  top: 100px;

  width: 100%;

  text-align: center;

  transform: translateX(-50%);
}

.sign__pwr h2 {
  color: #2196f3;
  font-weight: normal;
  font-size: 1.1rem;
}

.sign__title {
  position: absolute;
  left: 50%;
  top: 80px;

  transform: translateX(-50%);
}

.sign__title h2 {
  font-weight: 500;
  color: #2d2d2d;
}

.sign__options {
  width: 100%;
}

.sign__footer {
  position: absolute;
  left: 50%;
  bottom: 50px;

  width: 100%;

  transform: translateX(-50%);
}

.to-sign__in,
.to-sign__up {
  font-size: 0.9rem;

  text-align: center;
  justify-content: center;
  align-items: center;
}

.to-sign__in > span,
.to-sign__up > span {
  margin-right: 10px;
}

.to-sign__in > .v-btn::before,
.to-sign__up > .v-btn::before {
  background-color: transparent;
}

@media (max-width: 830px) {
  .sign__pwr {
    display: block;
  }

  .sign__title {
    top: 60px;
  }
}

@media (max-width: 330px) {
  .to-sign__in,
  .to-sign__up {
    display: flex;
    flex-direction: column;
  }

  .to-sign__in > span,
  .to-sign__up > span {
    margin: 0;
  }

  .sign__footer {
    bottom: 30px;
  }
}
</style>
