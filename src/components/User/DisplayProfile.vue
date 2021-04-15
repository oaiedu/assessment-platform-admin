<template>
  <v-card max-width="250" class="mx-auto" @click="() => this.$router.push('/profile')">
    <v-container>
      <v-row justify="center" class="ma-4">
        <v-avatar size="150">
          <img
            class="display-profile-image-home"
            rel='preload'
            src="../../assets/no-profile-pic.jpg"
            alt="Profile Image" />
        </v-avatar>
      </v-row>

      <v-row justify="start" v-if="user">
        <v-card-title class="pb-0">{{user.name}}</v-card-title>
        <v-card-text>{{user.email}}</v-card-text>
        <v-card-subtitle>{{ roleName }}</v-card-subtitle>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
    computed: {
        user() {
            return this.$store.getters.userInfo
        },
        roleName() {
            const role = this.user.role;
            if(role === 'admin') return 'Administrador';
            else if(role === 'appraiser') return 'Avaliador';
            else if(role === 'teacher') return 'Professor';
            else return 'Aluno';
        }
    },
    methods: {
        setImage() {
            if (this.user && this.user.profileImages && this.user.profileImages.length > 0) {
                const image = document.getElementsByClassName('display-profile-image-home')[0];
                image.src = this.user.profileImages;
            }
        }
    },
    watch: {
        user() {
            this.setImage();
        }
    },
    mounted() {
        this.setImage();
    }
}
</script>
