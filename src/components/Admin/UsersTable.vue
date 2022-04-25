<template>
  <v-container class="users-table mt-4">
    <v-row class="pa-0 ma-0">
      <v-text-field
        v-model="search"
        clearable
        dense
        outlined
        rounded
        color="blue"
        style="max-width: 400px"
        :label="$t('ADMIN.search')"
      ></v-text-field>
    </v-row>

    <v-card outlined class="mt-5" style="border-radius: 26px; overflow: hidden">
      <v-data-table
        v-if="currentUser"
        :loading-text="$t('ADMIN.USERS_TABLE.loading_users')"
        :no-data-text="$t('ADMIN.USERS_TABLE.no_users')"
        :items="users"
        locale="pt"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('ADMIN.USERS_TABLE.HEADERS.' + h.text)
          }))
        "
        :loading="loading"
        :search="search"
      >
        <template v-slot:[`item.role`]="{ item }">
          <span
            :class="
              item.email === currentUser.email && 'users-table__highlight'
            "
          >
            {{ $t("USER.ROLE." + item.role) }}
          </span>
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <span
            :class="
              item.email === currentUser.email && 'users-table__highlight'
            "
            >{{ item.name }}</span
          >
        </template>

        <template v-slot:[`item.email`]="{ item }">
          <span
            :class="
              item.email === currentUser.email && 'users-table__highlight'
            "
            >{{ item.email }}</span
          >
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="orange"
                :disabled="currentUser.email === item.email"
                @click="
                  editDialog = true;
                  setEditItem(item);
                "
              >
                {{ mdiAccountEdit }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.USERS_TABLE.edit_role") }}</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                class="ml-3"
                color="blue-grey lighten-1"
                :disabled="!item.email || currentUser.email === item.email"
                @click="sendEmail(item.email)"
              >
                {{ mdiEmail }}
              </v-icon>
            </template>
            <span>{{ $t("REQUESTS.TABLE.send_email") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editItem.name || editItem.email }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="editRole"
            item-value="value"
            item-text="text"
            menu-props="auto"
            :label="$t('ADMIN.USERS_TABLE.select_role')"
            :items="roles.map(r => ({ ...r, text: $t('USER.ROLE.' + r.text) }))"
          >
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="grey"
            @click="
              editDialog = false;
              editRole = null;
            "
            text
          >
            {{ $t("AUTH.SUBJECT.cancel") }}
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn
            color="green"
            @click="
              setRole();
              editDialog = false;
            "
            text
            :disabled="!editRole"
          >
            {{ $t("TEST.TEST_FORM.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mdiAccountEdit, mdiEmail } from "@mdi/js";

export default {
  name: "UsersTable",
  data() {
    return {
      mdiEmail,
      mdiAccountEdit,
      search: "",
      editItem: {
        email: null,
        role: null,
        name: null
      },
      editRole: null,
      editDialog: false,
      roles: [
        { text: "admin", value: "admin" },
        { text: "student", value: "student" },
        { text: "appraiser", value: "appraiser" }
      ],
      headers: [
        {
          text: "role",
          value: "role",
          align: "left",
          sortable: true
        },
        {
          text: "name",
          value: "name",
          align: "center",
          sortable: true
        },
        {
          text: "email",
          value: "email",
          align: "center",
          sortable: true
        },
        {
          text: "actions",
          value: "actions",
          align: "center",
          sortable: false
        }
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    users() {
      return this.$store.getters.users;
    },
    currentUser() {
      return this.$store.getters.userInfo;
    }
  },
  methods: {
    sendEmail(email) {
      const a = document.createElement("a");
      a.href = "mailto:" + email;
      a.click();
      a.remove();
    },
    setEditItem(item) {
      this.editItem = {
        email: item.email,
        name: item.name,
        role: item.role
      };
    },
    setRole() {
      if (this.editRole && this.editRole !== this.editItem.role) {
        this.$store.dispatch("setUserRole", {
          email: this.editItem.email,
          role: this.editRole
        });
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.$store.dispatch("clearLoading");
    }, 1000);
  },
  watch: {
    editDialog(isShowing) {
      if (!isShowing) {
        this.editItem = {
          email: null,
          role: null,
          name: null
        };
        this.editRole = null;
      }
    }
  }
};
</script>

<style>
.users-table__highlight {
  font-weight: bold;
  color: #2196f3;
}

.users-table .v-text-field__details {
  display: none !important;
}
</style>
