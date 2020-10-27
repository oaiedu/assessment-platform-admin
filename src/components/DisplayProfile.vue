<template>
  <v-card max-width="250" class="mx-auto" @click="() => this.$router.push('/profile')">
    <v-container>
      <v-row justify="center" class="ma-4">
        <v-avatar size="150">
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            v-if=" user.profileImages === '' || user.profileImages === null "
          />
          <img :src="user.profileImages" v-else />
        </v-avatar>
      </v-row>

      <v-row justify="start">
        <v-card-title class="pb-0">{{user.name}}</v-card-title>
        <v-card-text>{{user.email}}</v-card-text>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
    computed: {
        user() {
            return this.$store.getters.userInfo
        }
    }
}
</script>
