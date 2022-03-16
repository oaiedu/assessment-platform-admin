<template>
  <div class="sign__page">
    <div class="sign__container">
      <div class="sign__info-container">
        <div class="sign__info-title">
          <img src="../assets/LGlogo.svg" alt="Logo" />

          <h3 class="app-name">Cloud Quiz Generator</h3>
        </div>

        <p class="sign__info-subtitle">
          Se está procurando por um lugar para aprender Cloud... você encontrou!
          Nossos questionários são totalmente gratuitos e te levarão ao seu
          limite, fortificando seus conhecimentos.

          <br /><br />

          Comece agora mesmo, não há tempo a perder!
        </p>
      </div>

      <svg
        v-if="clouds"
        class="sign__clouds"
        v-html="clouds.html"
        :style="{ height: clouds.height }"
      ></svg>

      <div v-if="clouds" class="sign__clouds-fill"></div>

      <SignUser
        @forgotPassword="isResetUserPwdModalVisible = true"
        @googleSign="googleSign()"
      />
    </div>
    <v-dialog
      persistent
      v-model="isResetUserPwdModalVisible"
      width="500px"
      max-width="100%"
    >
      <v-card>
        <v-card-title>Esqueceu a senha?</v-card-title>
        <v-card-subtitle>Insira seu e-mail no campo abaixo.</v-card-subtitle>
        <v-card-text>
          <v-row justify="center" class="px-3">
            <v-text-field
              :append-icon="mdiEmail"
              name="email-resetpwd"
              label="E-mail"
              id="email-resetpwd"
              v-model="email"
              type="email"
              :rules="required"
              required
            >
            </v-text-field>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="grey darken-1"
            @click="
              isResetUserPwdModalVisible = false;
              email = '';
            "
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn text color="blue" :disabled="!email" @click="forgotPassword()">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mdiEmail } from "@mdi/js";

import { drawMultiClouds } from "../utils/cloud-generator";
import SignUser from "../components/User/SignUser";

export default {
  name: "AuthPage",
  components: {
    SignUser
  },
  data() {
    return {
      mdiEmail,
      clouds: null,
      isResetUserPwdModalVisible: false,
      email: "",
      required: [
        value => (value && value.length > 0) || "O e-mail é obrigatório!"
      ]
    };
  },
  computed: {
    statistics() {
      let statisticsObj = [];
      const subjects = this.$store.getters.Subject.subjects;
      subjects.forEach(element => {
        const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubject(
          element.name
        );
        statisticsObj.push({
          name: element.name,
          questions: numberOfQuestions
        });
      });
      return statisticsObj;
    },
    numberOfQuestions() {
      return this.$store.getters.getDataSize.questions.general;
    },
    user() {
      return this.$store.getters.userInfo;
    },
    userInfo() {
      return this.$store.getters.userInfo;
    }
  },
  methods: {
    googleSign() {
      this.$store.dispatch("signWithGoogle");
    },
    forgotPassword() {
      this.isResetUserPwdModalVisible = false;
      this.$store.dispatch("resetPassword", { email: this.email });
      this.email = "";
    }
  },
  watch: {
    userInfo() {
      if (this.userInfo) this.$router.push(this.$route.params.to || "/");
    }
  },
  mounted() {
    this.clouds = drawMultiClouds({ width: window.innerWidth });

    if (this.user) {
      this.$router.push(this.$route.params.to || "/");
    }
  }
};
</script>

<style scoped>
.sign__clouds {
  position: absolute;
  left: 0;
  bottom: 140px;

  width: 100%;
  /* height: 110px; */

  overflow: visible;
}

.sign__clouds-fill {
  position: fixed;
  left: 0;
  bottom: 0;

  width: 100%;
  height: 160px;

  background: linear-gradient(white, #f5f5f5);
}

.sign__page {
  height: 100vh;
  width: 100vw;

  background: linear-gradient(to bottom, #6be, rgb(58, 117, 235));
}

.sign__info-container {
  display: flex;
  flex-direction: column;
  flex: 1;

  height: 50%;

  margin: 100px 40px;
}

.sign__info-title {
  display: flex;
  align-items: center;
  gap: 6px;

  height: 40px;
  width: 100%;
}

.sign__info-container img {
  height: 100%;
}

.sign__info-subtitle {
  font-size: 1.1rem;
  color: #f5f5f5;

  margin-top: 1rem;

  max-width: 600px;
}

.sign__info-title > .app-name {
  color: white;
  line-height: 2rem;
  font-size: 1.6rem;
}

.sign__container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;

  width: 100%;
  height: 100%;
}

.sign__card {
  width: 530px;
}

@media (max-width: 1000px) {
  .sign__clouds {
    bottom: 100px;
  }

  .sign__clouds-fill {
    height: 120px;
  }
}

@media (max-width: 830px) {
  .sign__info-container {
    display: none;
  }

  .sign__container {
    justify-content: center;
  }

  .sign__card {
    width: 100%;

    margin-right: 0;

    border-radius: 0;
  }
}

@media (max-width: 430px) {
  .sign__card {
    width: 100%;
    height: 100%;

    box-shadow: none;
  }
}
</style>
