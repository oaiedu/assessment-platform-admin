<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      absolute>
      <v-content>
        <v-container fluid>
          <router-link to="/newquestion" tag="span">
            <v-btn
              text>
              <v-icon left>
                mdi-pencil
              </v-icon>
              Manage Questions
            </v-btn>
          </router-link>
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
      <router-link to="/profile" tag="span">
        <v-flex xs12 sm6 offset-sm3>  
          <v-btn
            text>
            <v-icon left>mdi-account
            </v-icon>
            Profile
          </v-btn>
        </v-flex>
      </router-link>
      <router-link to="/signup" tag="span">
        <v-flex xs12 sm6 offset-sm3>
          <v-btn
            text>
            Sign Up
          </v-btn>
        </v-flex>
      </router-link>
      <router-link to="/signin" tag="span">
        <v-flex xs12 sm6 offset-sm3>  
          <v-btn
            text>
            Sign In
          </v-btn>
        </v-flex>
      </router-link>
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
  })
}
</script>
