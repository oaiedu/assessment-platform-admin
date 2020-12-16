<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary>
        <v-main v-if="authUser !== null">
            <v-list>
            <v-list-item class="px-2">
                <v-list-item>
                    <v-row justify="center">
                        <v-avatar size="150">
                            <img
                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                v-if="user.profileImages === '' || user.profileImages === null"
                            />
                            <img :src="user.profileImages" v-else />
                        </v-avatar>
                    </v-row>
                </v-list-item>
            </v-list-item>

            <v-list-item link to="/profile">
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
    <v-app-bar app color="blue darken-1" dark dense absolute>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="authUser !== null"></v-app-bar-nav-icon>
      <v-toolbar-title>PWR Quiz Generator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text v-for="item in menuItems" :key="item.title" :to="item.link">
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn v-if="userIsAuthenticated()" text @click="onLogout">
        <v-icon left>mdi-logout-variant</v-icon> Sair
      </v-btn>
    </v-app-bar>

    <v-main>
      <Error/>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
    import Error from '../components/Error'

    export default {
        props: { source: String },
        components: {Error},
        data: () => ({
            drawer: null,
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
                            icon: "mdi-home",
                            title: "Página Inicial",
                            link: "/",
                            grantAccess: 'all'
                        },
                        {
                            icon: 'mdi-account-cog',
                            title: 'Administração',
                            link: '/admin',
                            grantAccess: ['admin']
                        },
                        {
                            icon: "mdi-file-question-outline",
                            title: "Gerenciar Questões",
                            link: "/questions",
                            grantAccess: ['admin', 'appraiser', 'teacher']
                        },
                        {
                            icon: "mdi-file-multiple-outline",
                            title: "Gerenciar provas",
                            link: "/tests",
                            grantAccess: ['admin', 'teacher', 'student']
                        },
                        {
                            icon: "mdi-file-document",
                            title: "Gerenciar Documentos",
                            link: "/createpaper",
                            grantAccess: ['admin', 'appraiser', 'teacher']
                        },
                        {
                            icon: "mdi-inbox",
                            title: "Solicitações",
                            link: "/inbox",
                            grantAccess: ['admin', 'appraiser']
                        },
                        {
                            icon: "mdi-account",
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
            }
        }
};
</script>
