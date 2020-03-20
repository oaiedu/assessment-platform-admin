<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-content v-if="authUser !== null">
        <v-list>
          <v-list-item class="px-2">
            <v-list-item-avatar>
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                v-if=" user.profileImages === '' || user.profileImages === null "
              />
              <img :src="user.profileImages" v-else />
            </v-list-item-avatar>
          </v-list-item>

          <v-list-item link>
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
      </v-content>
    </v-navigation-drawer>
    <v-app-bar app color="light-blue darken-4" dark dense absolute>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="authUser !== null"></v-app-bar-nav-icon>
      <v-toolbar-title>PWR Quiz Generator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text v-for="item in menuItems" :key="item.title" :to="item.link">
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn v-if="userIsAuthenticated()" text @click="onLogout">
        <v-icon left>mdi-logout-variant</v-icon>Log Out
      </v-btn>
    </v-app-bar>

    <v-content>
      <Error/>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import Error from '../components/Error'


export default {
  props: {
    source: String
  },
  components: {Error},
  data: () => ({
    drawer: null,
  }),
  computed: {
    authUser() {
      return this.$store.getters.user
    },
    user(){
      return this.$store.getters.userInfo
    },
    drawerItems() {
      let drawerItems = [];
      if (this.userIsAuthenticated()) {
        drawerItems = [
        {
          icon: "mdi-home",
          title: "Página Inicial",
          link: "/"
        },
          {
            icon: "mdi-file-question-outline",
            title: "Gerenciar Questões",
            link: "/questions"
          },
          {
            icon: "mdi-file-multiple-outline",
            title: "Gerenciar provas",
            link: "/tests"
          },
          {
            icon: "mdi-file-document",
            title: "Gerenciar Documentos",
            link: "/createpaper"
          },
          {
            icon: "mdi-account",
            title: "Perfil",
            link: "/profile"
          }
        ];
      }
      return drawerItems;
    },
    menuItems() {
      let menuItems = [
      ];
      if (this.userIsAuthenticated()) {
        menuItems = [
        ];
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
      this.$router.push("/");
    }
  }
};
</script>
