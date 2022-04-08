<template>
  <v-container>
    <template>
      <v-tabs v-model="tab" color="blue" class="mt-4" background-color="white">
        <v-tab>
          <v-icon left>
            {{ mdiDatabase }}
          </v-icon>
          Backups
        </v-tab>
        <v-tab>
          <v-icon left>
            {{ mdiBallot }}
          </v-icon>
          {{ $t('TEST.QUIZ.subjects') }}
        </v-tab>
        <v-tab>
          <v-icon left>
            {{ mdiAccount }}
          </v-icon>
          {{ $t('DASHBOARD.DATA_AMOUNT.users') }}
        </v-tab>
        <v-tab>
          <v-icon left>
            {{ mdiFileDocument }}
          </v-icon>
          Logs
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card>
            <BackupsTable />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <Subjects />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <UsersTable />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <LogsTable />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </template>
  </v-container>
</template>

<script>
import { mdiFileDocument, mdiAccount, mdiDatabase, mdiBallot } from "@mdi/js";
import BackupsTable from "./BackupsTable";
import Subjects from "./Subjects";
import UsersTable from "./UsersTable";
import LogsTable from "./LogsTable";

export default {
  name: "Management",
  components: { BackupsTable, Subjects, UsersTable, LogsTable },
  data() {
    return {
      mdiDatabase,
      mdiAccount,
      mdiFileDocument,
      mdiBallot,
      tab: null,
      isBackupsLoaded: false,
      isSubjectsLoaded: false,
      isUsersLoaded: false,
      isLogsLoaded: false
    };
  },
  watch: {
    tab(number) {
      if (number === 0 && !this.isBackupsLoaded) {
        this.$store.dispatch("loadBackups");
        this.isBackupsLoaded = true;
      } else if (
        number === 1 &&
        !this.isSubjectsLoaded &&
        this.$store.state.Subject.subjects.length === 0
      ) {
        this.$store.dispatch("loadSubjects");
        this.isSubjectsLoaded = true;
      } else if (number === 2 && !this.isUsersLoaded) {
        this.$store.dispatch("loadUsers");
        this.isUsersLoaded = true;
      } else if (number === 3 && !this.isLogsLoaded) {
        this.$store.dispatch("loadLogs");
        this.isLogsLoaded = true;
      }
    }
  },
  created() {
    const queryTab = this.$route.query.tab;
    if (queryTab) {
      switch (queryTab) {
        case "backups":
          this.tab = 0;
          break;
        case "subjects":
          this.tab = 1;
          break;
        case "users":
          this.tab = 2;
          break;
        case "logs":
          this.tab = 3;
          break;
        default:
          this.tab = 0;
      }
    } else {
      this.tab = 0;
    }
  }
};
</script>
