<template>
  <v-container>
    <v-row justify="end" class="mr-2">
      <v-btn
        color="green"
        dark
        class="mt-2"
        :loading="loading"
        @click="backup()"
      >
        Fazer Backup
        <v-icon right dark>{{ mdiCloudUpload }}</v-icon>
      </v-btn>
    </v-row>

    <v-data-table
      :items="getBackupsByMonth(currentMonth)"
      class="elevation-1 mt-5"
      :headers="headers"
      :loading="loading"
      :sort-by="['start']"
      :sort-desc="[true]"
      loading-text="Carregando backups..."
      no-data-text="Não há backups neste mês"
    >
      <template v-slot:top>
        <v-toolbar flat dense>
          <v-toolbar-title class="blue--text font-weight-medium"
            >Mês Atual</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              :disabled="loading"
              @click="downloadBkp(item)"
            >
              {{ mdiDownload }}
            </v-icon>
          </template>
          <span>Download</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              class="ml-1"
              :disabled="loading"
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

    <v-data-table
      :items="getBackupsByMonth(lastMonth)"
      class="elevation-1 mt-10"
      :headers="headers"
      :loading="loading"
      :sort-by="['start']"
      :sort-desc="[true]"
      loading-text="Carregando backups..."
      no-data-text="Não há backups neste mês"
    >
      <template v-slot:top>
        <v-toolbar flat dense>
          <v-toolbar-title class="blue--text font-weight-medium">{{
            pastMonths[0]
          }}</v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-on="on" v-bind="attrs" @click="downloadBkp(item)">
              {{ mdiDownload }}
            </v-icon>
          </template>
          <span>Download</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              class="ml-1"
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

    <v-data-table
      :items="getBackupsByMonth(twoMonthsAgo)"
      class="elevation-1 mt-10"
      :headers="headers"
      :loading="loading"
      :sort-by="['start']"
      :sort-desc="[true]"
      loading-text="Carregando backups..."
      no-data-text="Não há backups neste mês"
    >
      <template v-slot:top>
        <v-toolbar flat dense>
          <v-toolbar-title class="blue--text font-weight-medium">{{
            pastMonths[1]
          }}</v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-on="on" v-bind="attrs" @click="downloadBkp(item)">
              {{ mdiDownload }}
            </v-icon>
          </template>
          <span>Download</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-on="on"
              v-bind="attrs"
              class="ml-1"
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

    <v-snackbar
      v-model="deleteBackupSnackBar"
      color="white"
      light
      right
      top
      :timeout="15000"
    >
      Tem certeza de que deseja excluir este Backup?

      <v-btn dark class="ml-3" color="blue" text @click="deleteBkp(deleteItem)">
        Excluir
      </v-btn>

      <v-btn
        dark
        color="grey"
        text
        @click="
          deleteBackupSnackBar = false;
          deleteItem = null;
        "
      >
        Cancelar
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
          text: "ID",
          value: "id",
          align: "left",
          sortable: true
        },
        {
          text: "Tamanho",
          value: "size",
          align: "center",
          sortable: true
        },
        {
          text: "Data de Início",
          value: "start",
          align: "center",
          sortable: true
        },
        {
          text: "Data de Término",
          value: "end",
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
      return [this.months[this.lastMonth], this.months[this.twoMonthsAgo]];
    }
  },
  methods: {
    formatDate(date) {
      const month = new Date(date).getMonth() + 1;

      const dateTime = new Date(date).toString();
      const sub = dateTime.substr(7, 17);
      const monthName = this.months[month].substr(0, 3);

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
