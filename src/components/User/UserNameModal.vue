<template>
  <v-card height="100%" width="100%">
    <v-card-title>{{ $t('USERNAME_MODAL.TEXT.before_continue') }}</v-card-title>
    <v-card-text>
      {{ $t('USERNAME_MODAL.WARNING.accont_without_name_1') }}<br />
      {{ $t('USERNAME_MODAL.WARNING.accont_without_name_2') }}
    </v-card-text>
    <v-text-field
      v-model="userName"
      class="px-6"
      :append-icon="mdiAccount"
      clearable
      :label="$t('USERNAME_MODAL.user_name')"
      :rules="rules()"
    >
    </v-text-field>
    <v-alert dense text type="info" class="mx-6 mt-3 name-alert">
      {{ $t('USERNAME_MODAL.TEXT.username_change') }}
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
        {{ $t('USERNAME_MODAL.TEXT.continue') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiAccount } from '@mdi/js'
import { nameValidation } from '@/utils/validations'

export default {
  name: 'UserNameModal',
  data() {
    return {
      mdiAccount,
      userName: '',
    }
  },
  computed: {
    disabled() {
      return !this.userName || !nameValidation(this.userName)
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  methods: {
    rules() {
      return [
        v => (v && nameValidation(v)) || this.$t('USERNAME_MODAL.invalid'),
      ]
    },
    onContinueClick() {
      this.$emit('continueClick', this.userName)
    },
  },
}
</script>

<style scoped>
.v-alert {
  font-size: 0.94rem;
}
</style>
