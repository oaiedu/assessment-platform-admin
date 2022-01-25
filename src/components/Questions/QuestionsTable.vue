<template>
  <v-container>
    <v-card>
      <v-data-table
        :headers="
          isActionsAvailable
            ? [
                ...headers,
                {
                  text: 'Ações',
                  align: 'right',
                  value: 'actions',
                  sortable: false
                }
              ]
            : headers
        "
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        no-data-text="Não há questões a serem mostradas"
        loading-text="Carregando questões..."
        hide-default-footer
        :item-class="itemRowStyle"
        class="elevation-1"
      >
        <template v-slot:[`item.actions`]="{ item }" v-if="isActionsAvailable">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-on="on" v-bind="attrs" @click="onPdfClick(item)">
                  {{ pdfIcon }}
                </v-icon>
              </template>
              <span>Visualizar PDF</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  @click="onEditClick(item)"
                >
                  {{ pencilIcon }}
                </v-icon>
              </template>
              <span>Editar</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  @click="onDeleteClick(item)"
                >
                  {{ deleteIcon }}
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
              :disabled="userClaims && !userClaims['admin']"
              @click="onRestoreClick(item)"
            >
              {{
                userClaims && userClaims["admin"] ? "Restaurar" : "Indisponível"
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
import { mdiPdfBox, mdiPencil, mdiDelete } from "@mdi/js";

export default {
  name: "QuestionsTable",
  props: ["items", "itemsPerPage", "page", "isActionsAvailable"],
  data() {
    return {
      pdfIcon: mdiPdfBox,
      pencilIcon: mdiPencil,
      deleteIcon: mdiDelete,
      headers: [
        { text: "Nome", align: "left", value: "name" },
        { text: "Disciplina", value: "subject" }
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
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
    onPdfClick(item) {
      this.$emit("pdfClick", item);
    },
    onEditClick(item) {
      this.$emit("editClick", item);
    },
    onDeleteClick(item) {
      this.$emit("deleteClick", item);
    },
    onRestoreClick(item) {
      this.$emit("restoreClick", item);
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
