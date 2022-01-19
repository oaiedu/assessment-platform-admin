<template>
  <div class="sign-page">
    <div class="sign-container">
      <div class="sign-info-container">
        <img
          width="440"
          height="303.19"
          src="../assets/LGlogo.png"
          alt="Liquid Galaxy Logo"
        />
        <div class="sign-info">
          <h1 class="app-name">LG Quiz Generator</h1>
          <p class="app-subtitle">Gerador de questionários</p>
        </div>
      </div>
      <SignUser @forgotPassword="isResetUserPwdModalVisible = true" />
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
import SignUser from "../components/User/SignUser";

export default {
  name: "AuthPage",
  components: {
    SignUser
  },
  data() {
    return {
      mdiEmail,
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
    forgotPassword() {
      this.isResetUserPwdModalVisible = false;
      this.$store.dispatch("resetPassword", { email: this.email });
      this.email = "";
    }
  },
  watch: {
    userInfo() {
      if (this.userInfo) this.$router.push("/");
    }
  },
  mounted() {
    if (this.user) {
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
.sign-page {
  height: 100vh;
  width: 100vw;

  background-color: #ededed;
}

.sign-info-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  flex: 1;
  height: 100%;

  margin: 0 20px;
}

.sign-info-container img {
  object-fit: cover;
}

.sign-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sign-info > .app-subtitle {
  font-size: 1.5rem;
  color: #333;
}

.sign-info > .app-name {
  color: #2196f3;
  line-height: 2rem;
  font-size: 2.4rem;
}

.sign-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;

  width: 100%;
  height: 100%;
}

.sign-card {
  width: 360px;
  height: 86%;

  margin-right: 30px;
}

@media (max-height: 800px) {
  .sign-card {
    width: 360px;
    height: 92%;

    margin-right: 30px;
  }
}

@media (max-width: 1100px) {
  .sign-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 735px) {
  .sign-info-container {
    display: none;
  }

  .sign-container {
    justify-content: center;
  }

  .sign-card {
    margin-right: 0;
  }
}

@media (max-width: 430px) {
  .sign-card {
    width: 100%;
    height: 100%;

    box-shadow: none;
  }
}
</style>
