<template>
  <v-card outlined width="100%" height="100%" class="display-profile">
    <div class="display-container" v-if="user">
      <div class="avatar-container">
        <v-avatar size="90">
          <img
            class="display-profile-image-home"
            rel="preload"
            src="../../assets/no-profile-pic.jpg"
            alt="Profile Image"
          />
        </v-avatar>
      </div>
      <div class="user-info" v-if="user">
        <h3 class="user-name">{{ user.name }}</h3>
        <span class="user-email">{{ user.email }}</span>
        <span class="user-role">{{ $t("USER.ROLE." + user.role) }}</span>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.getters.userInfo;
    }
  },
  methods: {
    setImage() {
      if (
        this.user &&
        this.user.profileImages &&
        this.user.profileImages.length > 0
      ) {
        const image = document.getElementsByClassName(
          "display-profile-image-home"
        );
        if (image && image[0]) image[0].src = this.user.profileImages;
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
};
</script>

<style scoped>
.display-profile {
  border-radius: 26px;
  overflow: hidden;
}

.display-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;

  height: 100%;
  width: 100%;

  padding: 20px;
}

.avatar-container .display-profile-image-home {
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-info > h3.user-name {
  color: #222;
  font-size: 1.2rem;
  font-weight: normal;
}

.user-info > span.user-email {
  color: #777;
  font-size: 1rem;
  font-weight: normal;
}

.user-info > span.user-role {
  color: #2f80ed;
  font-size: 1rem;
  font-weight: 500;
}
</style>
