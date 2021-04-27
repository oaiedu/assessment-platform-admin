<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary>
        <v-main v-if="authUser !== null">
            <v-list>
                <v-list-item class="px-2">
                    <v-list-item>
                        <v-row justify="center">
                            <v-avatar size="150">
                                <img class="display-profile-image"
                                    rel='preload'
                                    src="../assets/no-profile-pic.jpg"
                                    alt="Profile Image" />
                            </v-avatar>
                        </v-row>
                    </v-list-item>
                </v-list-item>

                <v-list-item v-if="user">
                    <v-list-item-content>
                        <v-list-item-title class="title">{{user.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{user.email}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list nav dense>
                <v-list-item v-for="item in drawerItems" :key="item.title" :to="item.link">
                    <v-list-item-icon>
                    <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-main>
    </v-navigation-drawer>
    <v-app-bar app v-if="authUser" color="blue darken-1" dark dense absolute>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>PWR Quiz Generator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text v-for="item in menuItems" :key="item.title" :to="item.link">
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn v-if="userIsAuthenticated()" text @click="onLogout">
        <v-icon left>{{ logoutIcon }}</v-icon> Sair
      </v-btn>
    </v-app-bar>

    <v-main>
      <Error />
      <Success />
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
    import Error from '../components/Error';
    import Success from '../components/Success';
    import {
        mdiLogoutVariant,
        mdiHome,
        mdiAccountCog,
        mdiFileQuestionOutline,
        mdiFileMultipleOutline,
        mdiFileDocument,
        mdiInbox,
        mdiAccount
    } from '@mdi/js';

    export default {
        props: { source: String },
        components: {
            Error,
            Success
        },
        data: () => ({
            drawer: null,
            logoutIcon: mdiLogoutVariant
        }),
        computed: {
            currentUserClaims() {
                return this.$store.getters.getUserClaims;
            },
            authUser() {
                return this.$store.getters.user;
            },
            user(){
                return this.$store.getters.userInfo;
            },
            drawerItems() {
                let drawerItems = [];
                let items = [];
                if (this.userIsAuthenticated()) {
                    drawerItems = [
                        {
                            icon: mdiHome,
                            title: "Página Inicial",
                            link: "/",
                            grantAccess: 'all'
                        },
                        {
                            icon: mdiAccountCog,
                            title: 'Administração',
                            link: '/admin',
                            grantAccess: ['admin']
                        },
                        {
                            icon: mdiFileQuestionOutline,
                            title: "Gerenciar Questões",
                            link: "/questions",
                            grantAccess: ['admin', 'appraiser', 'teacher']
                        },
                        {
                            icon: mdiFileMultipleOutline,
                            title: "Gerenciar Provas",
                            link: "/tests",
                            grantAccess: ['admin', 'teacher', 'student']
                        },
                        {
                            icon: mdiFileDocument,
                            title: "Gerenciar Documentos",
                            link: "/papers",
                            grantAccess: ['admin', 'teacher']
                        },
                        {
                            icon: mdiInbox,
                            title: "Solicitações",
                            link: "/inbox",
                            grantAccess: ['admin', 'appraiser']
                        },
                        {
                            icon: mdiAccount,
                            title: "Perfil",
                            link: "/profile",
                            grantAccess: 'all'
                        }
                    ];

                    const claims = this.currentUserClaims;
                    let role = null;

                    const roles = ['admin', 'appraiser', 'teacher', 'student'];

                    for(let key in claims) {
                        if(claims[key] && roles.includes(key)) {
                            role = key;
                        }
                    }

                    items = drawerItems.filter(item => {
                        return (item.grantAccess === 'all' || item.grantAccess.includes(role));
                    });
                }

                return items;
            },
            menuItems() {
                let menuItems = [];

                if (this.userIsAuthenticated()) {
                    menuItems = [];
                }

                return menuItems;
            }
        },
        methods: {
            userIsAuthenticated() {
                return (
                    this.$store.getters.user !== null &&
                    this.$store.getters.user !== undefined
                );
            },
            onLogout() {
                this.$store.dispatch("logout");
                if(window.location.pathname !== '/') {
                    this.$router.push('/');
                }
            },
            setImage() {
                if (this.authUser && this.user && this.user.profileImages && this.user.profileImages.length > 0) {
                    const image = document.getElementsByClassName('display-profile-image')[0];
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
};
</script>
