<template>
  <v-container>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        loading-text="Carregando solicitações..."
        no-data-text="Não há solicitações"
        hide-default-footer
        :item-class="itemRowStyle"
        class="elevation-1"
      >
        <template
          v-slot:[`item.status`]="{ item }"
          v-if="items && items.length > 0"
        >
          <span
            :style="{
              color:
                item.status === 'Pendente'
                  ? '#ffaa00'
                  : item.status === 'Aprovado'
                  ? '#00cc66'
                  : '#ff0000'
            }"
            >{{ item.status }}</span
          >
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-on="on" v-bind="attrs" @click="onEmailClick(item)">
                  {{ mdiEmail }}
                </v-icon>
              </template>
              <span>Enviar e-mail</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  @click="onPdfClick(item)"
                >
                  {{ mdiPdfBox }}
                </v-icon>
              </template>
              <span>Visualizar PDF</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  :disabled="item.status === 'Aprovado'"
                  @click="onCheckClick(item)"
                >
                  {{ mdiCheckBold }}
                </v-icon>
              </template>
              <span>Aprovar</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['appraiser']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  :disabled="item.status === 'Aprovado'"
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
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  :disabled="
                    userClaims && userClaims['admin']
                      ? item.status === 'Rejeitado'
                      : item.status === 'Aprovado'
                  "
                  @click="
                    userClaims && userClaims['admin']
                      ? onRejectClick(item)
                      : onDeleteClick(item)
                  "
                >
                  {{ userClaims && userClaims["admin"] ? mdiClose : mdiDelete }}
                </v-icon>
              </template>
              <span>{{
                userClaims && userClaims["admin"] ? "Rejeitar" : "Excluir"
              }}</span>
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
              :disabled="userClaims && !userClaims['appraiser']"
              @click="onRestoreClick(item)"
            >
              {{
                userClaims && userClaims["appraiser"]
                  ? "Restaurar"
                  : "Indisponível"
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
import {
  mdiClose,
  mdiDelete,
  mdiPencil,
  mdiCheckBold,
  mdiPdfBox,
  mdiEmail
} from "@mdi/js";

export default {
  name: "RequestsTable",
  props: ["items", "page", "itemsPerPage"],
  computed: {
    headers() {
      return this.userClaims && this.userClaims["admin"]
        ? [
            { text: "Nome", sortable: true, value: "name", align: "left" },
            {
              text: "Usuário",
              value: "user.name",
              sortable: true,
              align: "center"
            },
            {
              text: "E-mail",
              value: "user.email",
              sortable: true,
              align: "center"
            },
            {
              text: "Disciplina",
              value: "subject",
              sortable: true,
              align: "center"
            },
            {
              text: "Status",
              value: "status",
              sortable: true,
              align: "center"
            },
            { text: "Ações", value: "actions", sortable: false, align: "right" }
          ]
        : [
            { text: "Nome", sortable: true, value: "name", align: "left" },
            {
              text: "Disciplina",
              value: "subject",
              sortable: true,
              align: "center"
            },
            {
              text: "Status",
              value: "status",
              sortable: true,
              align: "center"
            },
            { text: "Ações", value: "actions", sortable: false, align: "right" }
          ];
    },
    loading() {
      return this.$store.getters.loading;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    }
  },
  data() {
    return {
      mdiClose,
      mdiDelete,
      mdiPencil,
      mdiCheckBold,
      mdiPdfBox,
      mdiEmail
    };
  },
  methods: {
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? "item-to-delete"
          : "item-deleted"
        : "";
    },
    onEmailClick(item) {
      this.$emit("emailClick", item.user.email);
    },
    onPdfClick(item) {
      this.$emit("pdfClick", item);
    },
    onEditClick(item) {
      this.$emit("editClick", item);
    },
    onCheckClick(item) {
      this.$emit("checkClick", item);
    },
    onRejectClick(item) {
      this.$emit("rejectClick", item);
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
