<template>
  <v-container>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        no-data-text="Não há provas a serem mostradas"
        loading-text="Carregando provas..."
        hide-default-footer
        :item-class="itemRowStyle"
        class="elevation-1"
      >
        <template v-slot:[`item.type`]="{ item }">
          {{ item.type === "selected" ? "Selecionado" : "Aleatório" }}
        </template>

        <template v-slot:[`item.user`]="{ item }">
          {{ item.user.name || item.user.email }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  @click="doExam(item)"
                >
                  {{ mdiFileEdit }}
                </v-icon>
              </template>
              <span>Realizar prova</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-if="userClaims && !userClaims['student']"
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  @click="onEditClick(item)"
                >
                  {{ mdiPencil }}
                </v-icon>
              </template>
              <span>Editar</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-if="userClaims && !userClaims['student']"
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  @click="onDeleteClick(item)"
                >
                  {{ mdiDelete }}
                </v-icon>
              </template>
              <span>Excluir</span>
            </v-tooltip>
          </v-row>

          <v-row
            justify="end"
            v-else-if="item.toDelete && item.toDelete.status"
          >
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              color="red"
              text
              :disabled="
                userClaims && item.toDelete.userEmail !== userInfo.email
              "
              @click="onRestoreClick(item)"
            >
              {{
                userClaims && item.toDelete.userEmail !== userInfo.email
                  ? "Indisponível"
                  : "Restaurar"
              }}
            </v-btn>
          </v-row>

          <v-row justify="end" v-else>
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              disabled
              text
            >
              Excluída
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { mdiFileEdit, mdiPencil, mdiDelete } from "@mdi/js";

export default {
  name: "TestsTable",
  props: ["items", "itemsPerPage", "page"],
  data() {
    return {
      mdiFileEdit,
      mdiPencil,
      mdiDelete,
      headers: [
        { text: "Nome", align: "start", value: "title" },
        { text: "Questões", align: "left", value: "questions.length" },
        { text: "Tipo", align: "left", value: "type" },
        { text: "Usuário", align: "left", value: "user" },
        { text: "Ações", align: "right", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    userInfo() {
      return this.$store.getters.userInfo;
    }
  },
  methods: {
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? "item-to-delete"
          : "item-deleted"
        : "";
    },
    onEditClick(item) {
      this.$emit("editClick", item);
    },
    onDeleteClick(item) {
      this.$emit("deleteClick", item);
    },
    onRestoreClick(item) {
      this.$emit("restoreClick", item);
    },
    doExam(item) {
      const questions = [...item.questions];
      const randomQuestions = [];

      let i = 0;

      while (i < questions.length) {
        const rand = Math.floor(Math.random() * questions.length);

        if (!randomQuestions.find(q => q.name === questions[rand].name)) {
          randomQuestions.push(questions[rand]);
          i++;
        }
      }

      this.$emit("doExam", { name: item.title, questions: randomQuestions });
    }
  }
};
</script>

<style>
.item-to-delete {
  color: #f00;
}

.item-deleted {
  color: #c4c4c4;
}
</style>
