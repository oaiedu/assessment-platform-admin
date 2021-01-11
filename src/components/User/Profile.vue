<template>
  <v-container>
    <v-container>
      <h1 class="text-center blue--text">Perfil</h1>
    </v-container>

    <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
        <v-card ref="form">
            <v-card-text>
            <p style="visibility: hidden; max-height: 1px">{{user}}</p>
            <div class="text-center">
                <v-row>
                <v-col>
                    <v-row justify="center">
                    <v-file-input id="fileUpload" @change="readUrl" v-model="avatarImage" style="visibility: hidden; max-height: 1px" />
                    </v-row>
                    <v-row justify="center">
                        <v-avatar size="150" @click="addImage()" clickable :class="{ 'avatar-edit': this.$route.path == '/profile' }">
                            <img
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                            v-if=" imagesAsURL === null "
                            />
                            <img :src="imagesAsURL" v-else />
                        </v-avatar>
                    </v-row>
                    <v-container>
                        <h4 class="text-center grey--text">{{ roleName }}</h4>
                    </v-container>
                </v-col>
                </v-row>
            </div>
            </v-card-text>

            <v-card-text>
            <v-text-field
                ref="nickName"
                v-model="nickName"
                :rules="[() => !!nickName || 'Este campo é obrigatório!']"
                label="Nome"
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

            <v-spacer/>

            <v-btn
                color="primary"
                text
                @click="submit(); sendImage();"
            >
                Salvar
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-col>
    </v-row>
  </v-container>
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
      const user = this.$store.getters.userInfo

      if ( user.name !== "")
        this.nickName = user.name

      if ( user.profileImages !== "")
        this.imagesAsURL = user.profileImages

      return user;
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
    cancel() {
      this.$router.back();
    },
    addImage() {
      document.getElementById("fileUpload").click();
    },
    readUrl(imageFile) {
        if(!imageFile.type.match(/image.*/)) {
            alert('The file is not an image!');
            return;
        } else if (imageFile.size > 2000000) {
            alert('O tamanho da imagem deve ser no MÁXIMO 2 MB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            this.imagesAsURL = e.target.result;
        }
        reader.readAsDataURL(imageFile);
    },
    sendImage() {
      const imageToUpload = { images: this.avatarImage };
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
