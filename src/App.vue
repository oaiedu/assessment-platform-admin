<template>
  <v-app> 
    <v-navigation-drawer
      v-model="drawer"
      clipped
      absolute>
    </v-navigation-drawer>
    <div>  
      <v-app-bar
        app
        color="light-blue darken-4"
        dark
        dense>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>PWR Quiz Generator</v-toolbar-title>
        <v-spacer></v-spacer>
        <router-link to="/profile" tag="span"> 
          <v-btn 
            text>
            <v-icon left>mdi-account
            </v-icon>
            Profile
          </v-btn>
        </router-link>
        <router-link to="/signup" tag="span">
          <v-btn 
            text>
            Sign Up
          </v-btn> 
        </router-link>
        <router-link to="/signin" tag="span">
          <v-btn 
            text>
            Sign In
          </v-btn> 
        </router-link>
      </v-app-bar>
    </div>
    <main>
      <div>
        <router-view></router-view>
      </div>
    </main>
  </v-app>
</template>

<script>
  export default { 
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
    }),
  }

</script>
© 2019 GitHub, Inc.