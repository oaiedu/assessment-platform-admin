<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      absolute>
      <v-content>
        <v-container fluid>
          <v-list>
            <v-btn 
              text
              v-for="item in drawerItems"
              :key="item.title"
              :to="item.link">
              <v-icon>{{ item.icon }}</v-icon>
              {{ item.title }}
            </v-btn>
          </v-list>
        </v-container>
      </v-content>
    </v-navigation-drawer>
    <v-app-bar
      app
      color="light-blue darken-4"
      dark
      dense
      absolute>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>PWR Quiz Generator</v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn
          text
          v-for="item in menuItems"
          :key="item.title"
          :to="item.link">
          <v-icon left>{{ item.icon }}
          </v-icon>
          {{ item.title }}
        </v-btn>
        <v-btn
          v-if="userIsAuthenticated()"
          text
          @click="onLogout">
          <v-icon left>
            mdi-logout-variant
          </v-icon>
          Log Out
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
    drawer: null
  }),
  computed: {
    drawerItems () {
      let drawerItems = []
      if (this.userIsAuthenticated()) {
        drawerItems = [
          {icon: 'mdi-pencil', title: 'Manage Questions', link: '/questions'}
        ]
      }
      return drawerItems
    },
    menuItems () {
      let menuItems = [
        {icon: 'mdi-account-plus', title: 'Sign Up', link: '/signup'},
        {icon: 'mdi-login-variant', title: 'Log In', link: '/signin'}
      ]
      if (this.userIsAuthenticated()) {
        menuItems = [
          {icon: 'mdi-account', title: 'Profile', link: '/profile'}
        ]
      }
      return menuItems
    },
  },
  methods: {
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    onLogout () {
      this.$store.dispatch('logout')
      this.$router.push('/')
    }
  }
}
</script>
