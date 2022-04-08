<template>
  <v-container>
    <v-card flat outlined style="border-radius: 26px; overflow: hidden">
      <v-data-table
        hide-default-footer
        loading-text="Carregando solicitações..."
        no-data-text="Não há solicitações"
        :headers="headers"
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading || rejectLoading"
        :item-class="itemRowStyle"
      >
        <template
          v-slot:[`item.status`]="{ item }"
          v-if="items && items.length > 0"
        >
          <span
            class="font-weight-medium"
            :style="{
              color:
                item.status === 'pendant'
                  ? '#ffaa00'
                  : item.status === 'approved'
                  ? '#00cc66'
                  : '#ff3333'
            }"
          >
            {{ $t("REQUESTS.STATUS." + item.status) }}
          </span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="blue-grey lighten-1"
                  @click="onEmailClick(item)"
                >
                  {{ mdiEmail }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.send_email') }}</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="blue-grey lighten-1"
                  @click="onPdfClick(item)"
                >
                  {{ mdiFilePdfBox }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.view_pdf') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="green"
                  :disabled="
                    item.status === 'approved' || loading || rejectLoading
                  "
                  @click="onCheckClick(item)"
                >
                  {{ mdiCheckBold }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.aprove') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['appraiser']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="orange"
                  :disabled="
                    item.status === 'approved' || loading || rejectLoading
                  "
                  @click="onEditClick(item)"
                >
                  {{ mdiPencil }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.edit') }}</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="red"
                  :disabled="
                    loading ||
                      rejectLoading ||
                      (userClaims && userClaims['admin']
                        ? item.status === 'rejected'
                        : item.status === 'approved')
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
              {{ $t('TEST.TEST_TABLE.deleted') }}
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
  mdiFilePdfBox,
  mdiEmail
} from "@mdi/js";

export default {
  name: "RequestsTable",
  props: ["items", "page", "itemsPerPage", "rejectLoading"],
  data() {
    return {
      mdiClose,
      mdiDelete,
      mdiPencil,
      mdiCheckBold,
      mdiFilePdfBox,
      mdiEmail
    };
  },
  computed: {
    headers() {
      return this.userClaims && this.userClaims["admin"]
        ? [
            { text: "ID", sortable: true, value: "name", align: "left" },
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
            { text: "ID", sortable: true, value: "name", align: "left" },
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
