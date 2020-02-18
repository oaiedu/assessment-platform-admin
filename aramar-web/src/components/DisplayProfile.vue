<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-card ref="form">
        <v-card-text>
          <div class="text-center">
            <v-row>
              <v-col>
                <v-row justify="center">
                  <v-avatar size="100">
                    <img
                      src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      v-if=" user.profileImages === '' || user.profileImages === null "
                    />
                    <img :src="user.profileImages" v-else />
                  </v-avatar>
                </v-row>
                <v-row>
                  <v-card-title>{{user.name}}</v-card-title>
                  <v-card-subtitle>{{user.email}}</v-card-subtitle>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({

  }),
  computed: {
    user() {
      return this.$store.getters.userInfo
    },
    userEmail() {

    }
  }
}
</script>
