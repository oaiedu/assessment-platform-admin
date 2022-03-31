<template>
  <v-card height="100%" width="100%">
    <v-card-title>Antes de continuar...</v-card-title>
    <v-card-text>
      Esta conta ainda não possui um nome de usuário!<br />
      Para usar o aplicativo, é necessário preencher o campo abaixo.
    </v-card-text>
    <v-text-field
      v-model="userName"
      class="px-6"
      :append-icon="mdiAccount"
      clearable
      label="Nome de usuário"
      :rules="rules"
    >
    </v-text-field>
    <v-alert dense text type="info" class="mx-6 mt-3 name-alert">
      O nome de usuário pode ser mudado na página de Perfil.
    </v-alert>
    <v-card-actions>
      <v-spacer />
      <v-progress-circular v-if="loading" color="blue" indeterminate>
      </v-progress-circular>
      <v-btn
        v-else
        text
        color="blue"
        class="mx-2"
        :disabled="disabled"
        @click="onContinueClick"
      >
        Continuar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiAccount } from "@mdi/js";
import { nameValidation } from "@/utils/validations";

export default {
  name: "UserNameModal",
  data() {
    return {
      mdiAccount,
      rules: [v => (v && nameValidation(v)) || "Nome de usuário inválido!"],
      userName: ""
    };
  },
  computed: {
    disabled() {
      return !this.userName || !nameValidation(this.userName);
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    onContinueClick() {
      this.$emit("continueClick", this.userName);
    }
  }
};
</script>

<style scoped>
.v-alert {
  font-size: 0.94rem;
}
</style>
