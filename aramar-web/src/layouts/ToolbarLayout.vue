<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary>

    <v-list>
                <v-list-item class="px-2">
                  <v-list-item-avatar>
                    <v-img src="https://randomuser.me/api/portraits/women/85.jpg"></v-img>
                  </v-list-item-avatar>
                </v-list-item>

                <v-list-item link>
                  <v-list-item-content>
                    <v-list-item-title class="title">User.name</v-list-item-title>
                    <v-list-item-subtitle>User.email</v-list-item-subtitle>
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
    </v-navigation-drawer>
    <v-app-bar app color="light-blue darken-4" dark dense absolute>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
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
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
  }),
  computed: {
    drawerItems() {
      let drawerItems = [];
      if (this.userIsAuthenticated()) {
        drawerItems = [
        {
          icon: "mdi-home",
          title: " Home",
          link: "/"
        },
          {
            icon: "mdi-file-question-outline",
            title: "Manage Questions",
            link: "/questions"
          },
          {
            icon: "mdi-file-multiple-outline",
            title: " Manage Tests",
            link: "/tests"
          }
        ];
      }
      return drawerItems;
    },
    menuItems() {
      let menuItems = [
        { icon: "mdi-account-plus", title: "Sign Up", link: "/signup" },
        { icon: "mdi-login-variant", title: "Log In", link: "/signin" }
      ];
      if (this.userIsAuthenticated()) {
        menuItems = [
          { icon: "mdi-account", title: "Profile", link: "/profile" }
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
