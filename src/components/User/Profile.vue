<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-card ref="form">
        <v-card-text>
          <p style="visibility: hidden; max-height: 1px">{{user}}</p>
          <div class="text-center">
            <v-row>
              <v-col>
                <v-row justify="center">
                  <v-file-input id="fileUpload" @change="sendImage()" v-model="avatarImage" style="visibility: hidden; max-height: 1px" />
                </v-row>
                <v-row justify="center">
                  <v-avatar size="100" @click="addImage()" clickable :class="{ 'avatar-edit': this.$route.path == '/profile' }">
                    <img
                      src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      v-if=" imagesAsURL === null "
                    />
                    <img :src="imagesAsURL" v-else />
                  </v-avatar>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-text>
          <v-text-field
            ref="nickName"
            v-model="nickName"
            :rules="[() => !!nickName || 'This field is required']"
            label="Nome completo"
            placeholder="Fill with firebase"
            required
          ></v-text-field>
          <transition
            name="fade"
            mode="out-in"
          >
            <v-content v-if="showChangePassword === true">
              <v-form @submit.prevent="onChangePassword">
                <v-text-field
                  label="New Password"
                  v-model="editedPassword"
                  type="password"
                ></v-text-field>
                <v-text-field
                  label="Confirm New Password"
                  v-model="confirmNewPassword"
                  type="password"
                  :rules="[comparePassword]"
                ></v-text-field>
                <v-text-field
                  label="Old Password"
                  type="password"
                  v-model="confirmOldPassword"
                ></v-text-field>
              </v-form>
            </v-content>
          </transition>
          <!-- <v-text-field
            ref="name"
            v-model="nickName"
            :rules="[() => !!name || 'This field is required']"
            :error-messages="errorMessages"
            label="Nome completo"
            placeholder="Fill with firebase"
            required
          ></v-text-field> -->
        </v-card-text>

        <v-divider class="mt-12"></v-divider>

        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click="cancel()"
          >
            Cancelar
          </v-btn>

          <v-spacer/>

          <v-btn
            color="primary"
            text
            @click="submit()"
          >
            Salvar Alterações
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    avatarImage: [],
    nickName: null,
    hasImage: false,
    imagesAsURL: null,
    editedPassword: "",
    confirmNewPassword: "",
    confirmOldPassword: "",
    showChangePassword: false
  }),
  computed: {
    comparePassword () {
      return this.editedPassword !== this.confirmNewPassword ? 'Passwords do not match' : ''
    },
    user() {
      var val = this.$store.getters.userInfo

      if ( val.name !== "")
        this.nickName = val.name

      if ( val.profileImages !== "")
        this.imagesAsURL = val.profileImages

      return val;
    },
  },
  methods: {
    cancel(){
      this.$router.push('/');
    },
    addImage() {
      document.getElementById("fileUpload").click();
    },
    sendImage() {
      const imageToUpload = { images: this.avatarImage };
      console.log("sla mano: ", imageToUpload);
      var URL = this.$store.dispatch("uploadAvatar", imageToUpload);
      URL.then(result => {
        this.imagesAsURL = result;
        this.hasImage = false;
        console.log("Image as URL: ", this.imagesAsURL);
      });
    },
    submit() {
      var updateChanges = {
        name: this.nickName,
        profileImages: this.imagesAsURL
      }
      this.$store.dispatch("updateUser", updateChanges)
      this.$router.push("/")
    }
  }
};
</script>

<style>
    .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to{
    opacity: 0;
    }

    .v-avatar.avatar-edit:hover {
        cursor: pointer;
        opacity: 0.8;
    }
</style>
