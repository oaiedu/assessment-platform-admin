<template>
  <v-container>
    <v-card>
      <v-data-table
        hide-default-footer
        class="elevation-1"
        no-data-text="Não há provas a serem mostradas"
        loading-text="Carregando provas..."
        :headers="headers"
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :item-class="itemRowStyle"
      >
        <template v-slot:[`header.actions`]="{ header }">
          <v-row justify="center" class="ma-0 pa-0" style="width: 100px">
            {{ header.text }}
          </v-row>
        </template>

        <template v-slot:[`item.info`]="{ item }">
          <v-row class="test-info" justify="end">
            <span class="grey--text text--darken-2 font-weight-medium">
              <v-icon color="grey--darken-1">{{ mdiClipboardText }}</v-icon>

              {{ item.questionsAmount }}
            </span>

            <span class="grey--text text--darken-2 font-weight-medium ml-4">
              <v-icon color="grey--darken-1">{{ mdiClockOutline }}</v-icon>

              {{ getTime(item) }}
            </span>

            <v-divider vertical class="mx-4 my-0 pa-0"></v-divider>

            <span
              class="font-weight-medium"
              :class="(item.status ? 'green' : 'grey') + '--text'"
            >
              <v-icon :color="item.status ? 'green' : 'grey'">{{
                item.status ? mdiCheckCircle : mdiCancel
              }}</v-icon>

              {{ item.status || "SEM TENTATIVAS" }}
            </span>
          </v-row>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row
            v-if="!item.toDelete"
            class="ma-0 pa-0"
            justify="center"
            style="width: 100px"
          >
            <v-btn
              v-if="userClaims && userClaims['student']"
              rounded
              dark
              height="34px"
              width="100px"
              elevation="0"
              color="indigo lighten-2"
              @click="doExam(item)"
            >
              COMEÇAR
            </v-btn>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="indigo lighten-2"
                  class="ml-2"
                  @click="doExam(item)"
                >
                  {{ mdiFileEdit }}
                </v-icon>
              </template>
              <span>Realizar prova</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="orange"
                  class="ml-2"
                  @click="onEditClick(item)"
                >
                  {{ mdiPencil }}
                </v-icon>
              </template>
              <span>Editar</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="red"
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
            v-else-if="item.toDelete && item.toDelete.status"
            class="ma-0 ml-1 pa-0"
            justify="center"
            style="width: 100px"
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

          <v-row
            v-else
            class="ma-0 ml-1 pa-0"
            justify="center"
            style="width: 100px"
          >
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
import {
  mdiFileEdit,
  mdiPencil,
  mdiDelete,
  mdiCheckCircle,
  mdiCancel,
  mdiClockOutline,
  mdiClipboardText,
  mdiDumbbell
} from "@mdi/js";

export default {
  name: "TestsTable",
  props: ["items", "itemsPerPage", "page"],
  data() {
    return {
      mdiFileEdit,
      mdiPencil,
      mdiDelete,
      mdiCheckCircle,
      mdiCancel,
      mdiClockOutline,
      mdiClipboardText,
      mdiDumbbell,
      headers: [
        { text: "Título", align: "start", value: "title" },
        {
          text: "",
          align: "right",
          value: "info",
          sortable: false
        },
        {
          text: "Ações",
          align: "center",
          value: "actions",
          sortable: false,
          class: "test-actions"
        }
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
    getTime(item) {
      return item.unlimitedTime
        ? "Ilimitado"
        : `${item.time.hours}h ${item.time.minutes}m ${item.time.seconds}s`;
    },
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
      this.$router.push("/quizes/" + item.id);
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

th.test-actions {
  width: 100px;
}

.test-info {
  font-size: 0.9rem;
}
</style>
