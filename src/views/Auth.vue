<template>
  <div class="sign__page">
    <div class="sign__container">
      <div class="sign__info-container">
        <div class="sign__info-title">
          <img src="../assets/LGlogo.svg" alt="Logo" />

          <h3 class="app-name">Cloud Quiz Generator</h3>
        </div>

        <p class="sign__info-subtitle">
          {{ $t("AUTH.TEXT.intro_1") }}

          <br /><br />

          {{ $t("AUTH.TEXT.intro_2") }}
        </p>
      </div>

      <svg
        v-if="cloudsL3 && windowWidth > 830"
        class="sign__clouds l3"
        v-html="cloudsL3.html"
        :style="{ height: cloudsL3.height }"
      ></svg>
      <svg
        v-if="cloudsL2 && windowWidth > 830"
        class="sign__clouds l2"
        v-html="cloudsL2.html"
        :style="{ height: cloudsL2.height }"
      ></svg>
      <svg
        v-if="cloudsL1 && windowWidth > 830"
        class="sign__clouds l1"
        v-html="cloudsL1.html"
        :style="{ height: cloudsL1.height }"
      ></svg>

      <svg
        v-if="cloudsL3 && windowWidth > 830"
        class="sign__clouds extended l3"
        v-html="cloudsL3.html"
        :style="{ height: cloudsL3.height }"
      ></svg>

      <svg
        v-if="cloudsL2 && windowWidth > 830"
        class="sign__clouds extended l2"
        v-html="cloudsL2.html"
        :style="{ height: cloudsL2.height }"
      ></svg>

      <svg
        v-if="cloudsL1 && windowWidth > 830"
        class="sign__clouds extended l1"
        v-html="cloudsL1.html"
        :style="{ height: cloudsL1.height }"
      ></svg>

      <svg
        v-if="cloudsL3 && windowWidth > 830"
        class="sign__clouds extended-plus l3"
        v-html="cloudsL3.html"
        :style="{ height: cloudsL3.height }"
      ></svg>

      <svg
        v-if="cloudsL2 && windowWidth > 830"
        class="sign__clouds extended-plus l2"
        v-html="cloudsL2.html"
        :style="{ height: cloudsL2.height }"
      ></svg>

      <svg
        v-if="cloudsL1 && windowWidth > 830"
        class="sign__clouds extended-plus l1"
        v-html="cloudsL1.html"
        :style="{ height: cloudsL1.height }"
      ></svg>

      <div
        v-if="(cloudsL1 || cloudsL2 || cloudsL3) && windowWidth > 830"
        class="sign__clouds-fill"
      ></div>

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
        <v-card-title>{{ $t("SIGN_USER.forget_password") }}</v-card-title>
        <v-card-subtitle>{{ $t("SIGN_USER.insert_email") }}</v-card-subtitle>
        <v-card-text>
          <v-row justify="center" class="px-3">
            <v-text-field
              v-model="email"
              required
              type="email"
              id="email-resetpwd"
              name="email-resetpwd"
              :append-icon="mdiEmail"
              :label="$t('SIGN_USER.FIELD.email')"
              :rules="required"
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
            {{ $t("AUTH.SUBJECT.cancel") }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn text color="blue" :disabled="!email" @click="forgotPassword()">
            {{ $t("AUTH.SUBJECT.confirm") }}
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
      cloudsL1: null,
      cloudsL2: null,
      cloudsL3: null,
      windowWidth: 0,
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
    this.windowWidth = window.innerWidth;

    this.cloudsL1 = drawMultiClouds({
      count: 1,
      current: 1,
      width: this.windowWidth
    });

    this.cloudsL2 = drawMultiClouds({
      count: 1,
      current: 2,
      width: this.windowWidth
    });

    this.cloudsL3 = drawMultiClouds({
      count: 1,
      current: 3,
      width: this.windowWidth
    });

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

  overflow: hidden;

  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.sign__clouds.l1 {
  z-index: 2;

  animation-name: clouds-animation-right;
  animation-duration: 30s;
}

.sign__clouds.l2 {
  z-index: 1;

  animation-name: clouds-animation-left;
  animation-duration: 35s;
}

.sign__clouds.l3 {
  z-index: 0;

  animation-name: clouds-animation-right;
  animation-duration: 40s;
}

.sign__clouds.l2 /deep/ path {
  fill: #f2f2f2;
}

.sign__clouds.l3 /deep/ path {
  fill: #e1e1e1;
}

.sign__clouds.extended.l2 {
  transform: translateX(100%) scaleX(-1);
}

.sign__clouds.extended.l1,
.sign__clouds.extended.l3 {
  transform: translateX(-100%) scaleX(-1);
}

.sign__clouds.extended-plus.l2 {
  transform: translateX(200%);
}

.sign__clouds.extended-plus.l1,
.sign__clouds.extended-plus.l3 {
  transform: translateX(-200%);
}

.sign__clouds-fill {
  position: fixed;
  left: 0;
  bottom: 0;

  width: 100%;
  height: 160px;

  z-index: 2;

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

  z-index: 10;
}

@keyframes clouds-animation-left {
  from {
    left: 0;
  }
  to {
    left: -200%;
  }
}

@keyframes clouds-animation-right {
  from {
    left: 0;
  }
  to {
    left: 200%;
  }
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
  .sign__clouds {
    animation-name: none;
  }

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
