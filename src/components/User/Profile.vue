<template>
  <v-container>
    <v-container>
      <h1 class="text-center blue--text">Perfil</h1>
    </v-container>

    <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
        <v-card ref="form">
            <v-card-text>
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
                        <v-container>
                            <h4 class="text-center grey--text">{{ roleName }}</h4>
                        </v-container>
                    </v-row>
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
                    <v-content v-if="showChangePassword">
                    <v-form @submit.prevent="onChangePassword">
                        <v-text-field
                        label="Senha antiga"
                        type="password"
                        v-model="confirmOldPassword"
                        ></v-text-field>
                        <v-text-field
                        label="Nova senha"
                        v-model="editedPassword"
                        type="password"
                        ></v-text-field>
                        <v-text-field
                        label="Confirmar nova senha"
                        v-model="confirmNewPassword"
                        type="password"
                        :rules="[comparePassword]"
                        ></v-text-field>
                    </v-form>
                    </v-content>
                </transition>
            </v-card-text>

            <v-row justify="center">
                <v-progress-circular
                    v-if="loading"
                    :width="3"
                    color="blue darken-1"
                    indeterminate >
                </v-progress-circular>
            </v-row>

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
                @click="submit()"
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
        changedImage: false,
        nickName: null,
        hasImage: false,
        imagesAsURL: null,
        editedPassword: "",
        confirmNewPassword: "",
        confirmOldPassword: "",
        showChangePassword: false
    }),
    computed: {
        loading() {
            return this.$store.getters.loading;
        },
        comparePassword () {
            return this.editedPassword !== this.confirmNewPassword ? 'Passwords do not match' : ''
        },
        user() {
            const user = this.$store.getters.userInfo;

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            if(user.name !== "") this.nickName = user.name;

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            if(user.profileImages !== "") this.imagesAsURL = user.profileImages;

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
            this.$store.commit('setLoading', false);
            this.changedImage = false;
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
                this.changedImage = true;
                this.imagesAsURL = e.target.result;
            }
            reader.readAsDataURL(imageFile);
        },
        submit() {
            const imageToUpload = { images: this.avatarImage };
            this.$store.commit('setLoading', true);

            if(this.changedImage) {
                const URL = this.$store.dispatch("uploadAvatar", imageToUpload);
                URL.then(result => {
                    this.imagesAsURL = result;
                    this.hasImage = false;
                    const updateChanges = {
                        name: this.nickName,
                        profileImages: result
                    }
                    this.$store.dispatch("updateUser", updateChanges);
                    this.$router.push("/");
                });
            } else {
                const updateChanges = {
                    name: this.nickName,
                    profileImages: this.user.profileImages || ''
                }
                this.$store.dispatch("updateUser", updateChanges);
                this.$router.push("/");
            }
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
