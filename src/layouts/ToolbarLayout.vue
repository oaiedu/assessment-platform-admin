<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary width="300px">
      <v-main v-if="user" class="pt-0">
        <v-list>
          <v-list-item class="px-2">
            <v-avatar size="50">
              <img
                class="display-profile-image"
                rel="preload"
                style="object-fit: cover"
                alt="Profile Image"
                :src="profileImage"
              />
            </v-avatar>

            <v-list-item-content class="pl-4">
              <v-list-item-title style="font-weight: 500;">{{
                user.name
              }}</v-list-item-title>
              <v-list-item-subtitle>{{
                $t("USER.ROLE." + user.role)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-row class="ma-0 pa-0 mb-2" justify="space-between">
          <LanguagePicker />
        </v-row>

        <v-divider></v-divider>

        <v-list nav dense>
          <v-list-item
            v-for="item in drawerItems"
            :key="item.title"
            :to="item.link"
          >
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

    <v-app-bar v-if="user" app dark dense absolute flat color="blue">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title
        style="cursor: pointer"
        @click="$route.path !== '/' && $router.push('/')"
      >
        Cloud Quiz Generator
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text v-for="item in menuItems" :key="item.title" :to="item.link">
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>

      <v-btn v-if="userIsAuthenticated()" text @click="onLogout">
        <v-icon left>{{ logoutIcon }}</v-icon> {{ $t("TOOLBAR.sign_out") }}
      </v-btn>
    </v-app-bar>

    <v-main>
      <Error />
      <Success />
      <v-dialog
        v-if="user && !user.name"
        v-model="userNameModal"
        persistent
        width="500"
      >
        <UserNameModal @continueClick="updateUserName($event)" />
      </v-dialog>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Error from "../components/Error";
import Success from "../components/Success";
import LanguagePicker from "../components/LanguagePicker";
import UserNameModal from "../components/User/UserNameModal";
import {
  mdiLogoutVariant,
  mdiHome,
  mdiAccountCog,
  mdiFileQuestionOutline,
  mdiFileMultipleOutline,
  mdiInbox,
  mdiAccount
} from "@mdi/js";

export default {
  props: { source: String },
  components: {
    Error,
    Success,
    LanguagePicker,
    UserNameModal
  },
  data: () => ({
    drawer: null,
    logoutIcon: mdiLogoutVariant,
    userNameModal: true,
    profileImage: require("../assets/no-profile-pic.jpg")
  }),
  computed: {
    currentUserClaims() {
      return this.$store.getters.getUserClaims;
    },
    authUser() {
      return this.$store.getters.user;
    },
    user() {
      return this.$store.getters.userInfo;
    },
    drawerItems() {
      let drawerItems = [];
      let items = [];
      if (this.userIsAuthenticated()) {
        drawerItems = [
          {
            icon: mdiHome,
            title: this.$t("TOOLBAR.DRAWER.home"),
            link: "/",
            grantAccess: "all"
          },
          {
            icon: mdiAccountCog,
            title: this.$t("TOOLBAR.DRAWER.admin"),
            link: "/admin",
            grantAccess: ["admin"]
          },
          {
            icon: mdiFileQuestionOutline,
            title: this.$t("TOOLBAR.DRAWER.questions"),
            link: "/questions",
            grantAccess: ["admin", "appraiser"]
          },
          {
            icon: mdiFileMultipleOutline,
            title: this.$t("TOOLBAR.DRAWER.quizzes"),
            link: "/quizzes",
            grantAccess: ["admin", "student"]
          },
          {
            icon: mdiInbox,
            title: this.$t("TOOLBAR.DRAWER.requests"),
            link: "/inbox",
            grantAccess: ["admin", "appraiser"]
          },
          {
            icon: mdiAccount,
            title: this.$t("TOOLBAR.DRAWER.profile"),
            link: "/profile",
            grantAccess: "all"
          }
        ];

        const claims = this.currentUserClaims;
        let role = null;

        const roles = ["admin", "appraiser", "student"];

        for (let key in claims) {
          if (claims[key] && roles.includes(key)) {
            role = key;
          }
        }

        items = drawerItems.filter(item => {
          return item.grantAccess === "all" || item.grantAccess.includes(role);
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
    async onLogout() {
      await this.$store.dispatch("logout");
      if (window.location.pathname !== "/auth") {
        this.$router.push("/auth");
      }
    },
    setImage() {
      if (this.authUser && this.user && this.user.profileImages) {
        this.profileImage = this.user.profileImages;
      }
    },
    updateUserName(name) {
      this.$store.dispatch("updateUser", {
        name,
        profileImages: this.user.profileImages
      });
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
