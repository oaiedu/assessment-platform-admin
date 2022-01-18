<template>
  <v-container>
    <v-data-table
      class="elevation-1 mt-2"
      loading-text="Carregando usuários..."
      :items="users"
      :headers="headers"
      :loading="loading"
    >
      <template v-slot:[`item.role`]="{ item }">
        <span :class="item.email === currentUser.email && 'highlight'">{{
          getRoleName(item.role)
        }}</span>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <span :class="item.email === currentUser.email && 'highlight'">{{
          item.name
        }}</span>
      </template>

      <template v-slot:[`item.email`]="{ item }">
        <span :class="item.email === currentUser.email && 'highlight'">{{
          item.email
        }}</span>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              :disabled="currentUser.email === item.email"
              @click="
                editDialog = true;
                setEditItem(item);
              "
            >
              {{ mdiAccountEdit }}
            </v-icon>
          </template>
          <span>Editar função</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              class="ml-3"
              :disabled="currentUser.email === item.email"
              @click="sendEmail(item.email)"
            >
              {{ mdiEmail }}
            </v-icon>
          </template>
          <span>Enviar e-mail</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editItem.name || editItem.email }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="editRole"
            :items="roles"
            label="Selecione a função"
            item-value="value"
            item-text="text"
            menu-props="auto"
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
            Cancelar
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
            Salvar
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
      editItem: {
        email: null,
        role: null,
        name: null
      },
      editRole: null,
      editDialog: false,
      roles: [
        { text: "Administrador", value: "admin" },
        { text: "Aluno", value: "student" },
        { text: "Avaliador", value: "appraiser" },
        { text: "Professor", value: "teacher" }
      ],
      headers: [
        {
          text: "Função",
          value: "role",
          align: "left",
          sortable: true
        },
        {
          text: "Nome",
          value: "name",
          align: "center",
          sortable: true
        },
        {
          text: "E-mail",
          value: "email",
          align: "center",
          sortable: true
        },
        {
          text: "Ações",
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
    getRoleName(role) {
      if (role === "admin") return "Administrador";
      else if (role === "appraiser") return "Avaliador";
      else if (role === "teacher") return "Professor";
      else return "Aluno";
    },
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

<style scoped>
.highlight {
  font-weight: bold;
  color: #1e88e5;
}
</style>
