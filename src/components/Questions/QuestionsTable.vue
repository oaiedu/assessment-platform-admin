<template>
  <v-container>
    <v-card outlined style="border-radius: 26px; overflow: hidden">
      <v-data-table
        hide-default-footer
        :no-data-text="$t('QUESTIONS.TABLE.no_questions')"
        :loading-text="$t('QUESTIONS.TABLE.loading_questions')"
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :item-class="itemRowStyle"
        :headers="
          isActionsAvailable
            ? [
                ...headers.map(h => ({
                  ...h,
                  text: $t('QUESTIONS.TABLE.HEADERS.' + h.text)
                })),
                {
                  text: $t('QUESTIONS.TABLE.HEADERS.actions'),
                  align: 'right',
                  value: 'actions',
                  sortable: false
                }
              ]
            : headers.map(h => ({
                ...h,
                text: $t('QUESTIONS.TABLE.HEADERS.' + h.text)
              }))
        "
      >
        <template v-slot:[`item.level`]="{ item }">
          {{ $t("TEST.LEVEL." + levels[item.level.index]) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }" v-if="isActionsAvailable">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="blue-grey lighten-1"
                  @click="onPdfClick(item)"
                >
                  {{ pdfIcon }}
                </v-icon>
              </template>
              <span>{{ $t("REQUESTS.TABLE.view_pdf") }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  color="orange"
                  @click="onEditClick(item)"
                >
                  {{ pencilIcon }}
                </v-icon>
              </template>
              <span>{{ $t("REQUESTS.TABLE.edit") }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-2"
                  color="red"
                  @click="onDeleteClick(item)"
                >
                  {{ deleteIcon }}
                </v-icon>
              </template>
              <span>{{ $t("TEST.TESTS_TABLE.delete") }}</span>
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
                $t(
                  "QUESTIONS.TABLE." +
                    (userClaims && userClaims["admin"]
                      ? "restore"
                      : "unavailable")
                )
              }}
            </v-btn>
          </v-row>

          <v-row justify="end" v-else>
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              disabled
              text
            >
              {{ $t("TEST.TESTS_TABLE.deleted") }}
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { mdiFilePdfBox, mdiPencil, mdiDelete } from "@mdi/js";

export default {
  name: "QuestionsTable",
  props: ["items", "itemsPerPage", "page", "isActionsAvailable"],
  data() {
    return {
      pdfIcon: mdiFilePdfBox,
      pencilIcon: mdiPencil,
      deleteIcon: mdiDelete,
      headers: [
        { text: "id", align: "left", value: "name" },
        { text: "subject", align: "left", value: "subject" },
        { text: "level", value: "level" }
      ],
      levels: ["beginner", "intermediary", "advanced", "expert"]
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
