<template>
  <v-container class="mt-4">
    <v-row justify="end" class="ma-0 mr-2">
      <v-btn
        dark
        rounded
        color="green lighten-1"
        :loading="loading"
        @click="backup()"
      >
        {{ $t("ADMIN.BACKUPS_TABLE.backup") }}
        <v-icon right dark>{{ mdiCloudUpload }}</v-icon>
      </v-btn>
    </v-row>

    <v-card outlined class="mt-5" style="border-radius: 26px; overflow: hidden">
      <v-data-table
        hide-default-footer
        :loading-text="$t('ADMIN.BACKUPS_TABLE.loading_backups')"
        :no-data-text="$t('ADMIN.BACKUPS_TABLE.no_backups')"
        :items="getBackupsByMonth(currentMonth)"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('ADMIN.BACKUPS_TABLE.HEADERS.' + h.text)
          }))
        "
        :loading="loading"
        :sort-by="['start']"
        :sort-desc="[true]"
      >
        <template v-slot:top>
          <v-toolbar flat dense>
            <v-toolbar-title class="blue--text font-weight-medium">
              {{ $t("ADMIN.BACKUPS_TABLE.current_month") }}
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="blue"
                :disabled="loading"
                @click="downloadBkp(item)"
              >
                {{ mdiDownload }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.download") }}</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                class="ml-1"
                color="red"
                :disabled="loading"
                @click="
                  deleteBackupSnackBar = true;
                  deleteItem = item;
                "
              >
                {{ mdiDelete }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.delete") }}</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.start`]="{ item }">
          <span>{{ formatDate(item.start) }}</span>
        </template>
        <template v-slot:[`item.end`]="{ item }">
          <span>{{ formatDate(item.end) }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-card
      outlined
      class="mt-10"
      style="border-radius: 26px; overflow: hidden"
    >
      <v-data-table
        hide-default-footer
        :loading-text="$t('ADMIN.BACKUPS_TABLE.loading_backups')"
        :no-data-text="$t('ADMIN.BACKUPS_TABLE.no_backups')"
        :items="getBackupsByMonth(lastMonth)"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('ADMIN.BACKUPS_TABLE.HEADERS.' + h.text)
          }))
        "
        :loading="loading"
        :sort-by="['start']"
        :sort-desc="[true]"
      >
        <template v-slot:top>
          <v-toolbar flat dense>
            <v-toolbar-title>{{ pastMonths[0] }}</v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="blue"
                @click="downloadBkp(item)"
              >
                {{ mdiDownload }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.download") }}</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                class="ml-1"
                color="red"
                @click="
                  deleteBackupSnackBar = true;
                  deleteItem = item;
                "
              >
                {{ mdiDelete }}
              </v-icon>
            </template>
            <span>Excluir</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.start`]="{ item }">
          <span>{{ formatDate(item.start) }}</span>
        </template>
        <template v-slot:[`item.end`]="{ item }">
          <span>{{ formatDate(item.end) }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-card
      outlined
      class="mt-10"
      style="border-radius: 26px; overflow: hidden"
    >
      <v-data-table
        hide-default-footer
        :loading-text="$t('ADMIN.BACKUPS_TABLE.loading_backups')"
        :no-data-text="$t('ADMIN.BACKUPS_TABLE.no_backups')"
        :items="getBackupsByMonth(twoMonthsAgo)"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('ADMIN.BACKUPS_TABLE.HEADERS.' + h.text)
          }))
        "
        :loading="loading"
        :sort-by="['start']"
        :sort-desc="[true]"
      >
        <template v-slot:top>
          <v-toolbar flat dense>
            <v-toolbar-title>{{ pastMonths[1] }}</v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="blue"
                @click="downloadBkp(item)"
              >
                {{ mdiDownload }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.download") }}</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                class="ml-1"
                color="red"
                @click="
                  deleteBackupSnackBar = true;
                  deleteItem = item;
                "
              >
                {{ mdiDelete }}
              </v-icon>
            </template>
            <span>{{ $t("ADMIN.delete") }}</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.start`]="{ item }">
          <span>{{ formatDate(item.start) }}</span>
        </template>
        <template v-slot:[`item.end`]="{ item }">
          <span>{{ formatDate(item.end) }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar
      v-model="deleteBackupSnackBar"
      light
      right
      top
      color="white"
      :timeout="15000"
    >
      {{ $t("ADMIN.BACKUPS_TABLE.warning") }}

      <v-btn dark text class="ml-3" color="blue" @click="deleteBkp(deleteItem)">
        {{ $t("ADMIN.delete") }}
      </v-btn>

      <v-btn
        dark
        text
        color="grey"
        @click="
          deleteBackupSnackBar = false;
          deleteItem = null;
        "
      >
        {{ $t("ADMIN.cancel") }}
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mdiDownload, mdiDelete, mdiCloudUpload } from "@mdi/js";
import { getNowISOString } from "../../utils/date";

export default {
  name: "BackupsTable",
  data() {
    return {
      mdiDownload,
      mdiDelete,
      mdiCloudUpload,
      deleteBackupSnackBar: false,
      deleteItem: null,
      months: null,
      headers: [
        {
          text: "id",
          value: "id",
          align: "left",
          sortable: true
        },
        {
          text: "size",
          value: "size",
          align: "center",
          sortable: true
        },
        {
          text: "start_date",
          value: "start",
          align: "center",
          sortable: true
        },
        {
          text: "end_date",
          value: "end",
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
    backups() {
      return this.$store.getters.getBackups;
    },
    loading() {
      return this.$store.getters.loading;
    },
    currentMonth() {
      return new Date().getMonth() + 1;
    },
    lastMonth() {
      return this.currentMonth - 1 === 0 ? 12 : this.currentMonth - 1;
    },
    twoMonthsAgo() {
      return this.currentMonth - 2 <= 0
        ? this.currentMonth + 12 - 2
        : this.currentMonth - 2;
    },
    pastMonths() {
      return [
        this.$t("SHARED.DATE.MONTH." + this.months[this.lastMonth]),
        this.$t("SHARED.DATE.MONTH." + this.months[this.twoMonthsAgo])
      ];
    }
  },
  methods: {
    formatDate(date) {
      const month = new Date(date).getMonth() + 1;

      const dateTime = new Date(date).toString();
      const sub = dateTime.substr(7, 17);
      const monthName = this.$t(
        "SHARED.DATE.MONTH." + this.months[month]
      ).substr(0, 3);

      return monthName + sub;
    },
    getBackupsByMonth(month) {
      const backups = this.backups;
      const bkps = [];

      backups.forEach(bkp => {
        const bkpMon = bkp.month;
        const months = [];

        for (const key in this.months) {
          const mon = this.months[key].substr(0, 3);

          if (bkpMon === mon) {
            months.push(key);
          }
        }

        months.forEach(m => {
          if (m == month) {
            bkps.push(bkp);
          }
        });
      });

      return bkps;
    },
    backup() {
      const now = getNowISOString();
      this.$store.dispatch("backupFirebase", { now });
    },
    downloadBkp(backup) {
      this.$store.dispatch("downloadBackup", {
        date: backup.start,
        cloudId: backup.cloudId,
        id: backup.id
      });
    },
    deleteBkp(backup) {
      this.$store.dispatch("deleteBackup", { id: backup.cloudId });
      this.deleteBackupSnackBar = false;
    }
  },
  created() {
    this.months = this.$store.getters.getMonths;
  }
};
</script>
