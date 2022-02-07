<template>
  <v-card width="100%" height="100%" class="tests-table">
    <v-data-table
      class="dashboard-tests-table"
      :headers="headers"
      :items="tests"
      :loading="loading"
      no-data-text="Não há provas a serem mostradas"
      loading-text="Carregando provas..."
      hide-default-footer
      style="height: calc(100% - 48px) !important;"
      height="100%"
      :item-class="itemRowStyle"
      @click:row="onRowClick"
    >
      <template v-slot:top>
        <v-toolbar dense flat color="white">
          <h1 class="table-title">Provas recentes</h1>
        </v-toolbar>
        <div class="title-divider" />
      </template>
      <template v-slot:[`item.type`]="{ item }">
        <div class="type-container">
          <div
            class="icon-container"
            :style="{ backgroundColor: getItemIconColor(item) + '44' }"
          >
            <v-icon
              v-if="item.type === 'selected'"
              size="20"
              :color="getItemIconColor(item)"
              >{{ mdiCheckboxMultipleMarked }}</v-icon
            >
            <v-icon v-else size="20" :color="getItemIconColor(item)">{{
              mdiShuffleVariant
            }}</v-icon>
          </div>
          <span class="type-text">
            {{ item.type === "selected" ? "Selecionado" : "Aleatório" }}
          </span>
        </div>
      </template>
      <template v-slot:[`item.user`]="{ item }">
        {{ item.user.name || item.user.email }}
      </template>
      <template v-slot:[`item.updated`]="{ item }">
        {{ formatDate(item.updated) }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mdiCheckboxMultipleMarked, mdiShuffleVariant } from "@mdi/js";

export default {
  name: "TestsTable",
  data() {
    return {
      headers: [
        { text: "Nome", sortable: false, value: "title", align: "left" },
        { text: "Tipo", sortable: false, value: "type", align: "left" },
        {
          text: "Questões",
          sortable: false,
          value: "questions.length",
          align: "left"
        },
        { text: "Usuário", sortable: false, value: "user", align: "left" },
        {
          text: "Última atualização",
          sortable: false,
          value: "updated",
          align: "left"
        }
      ],
      mdiCheckboxMultipleMarked,
      mdiShuffleVariant
    };
  },
  computed: {
    tests() {
      return this.$store.getters.getLastTests;
    },
    loading() {
      return this.$store.getters.loading;
    },
    months() {
      return this.$store.getters.getMonths;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    className() {
      return this.userClaims
        ? Object.entries(this.userClaims).filter(role => role[1])[0][0]
        : "";
    }
  },
  methods: {
    getItemIconColor(item) {
      if (item.toDelete) {
        if (item.toDelete.status) {
          return "#ff0000";
        } else {
          return "#c4c4c4";
        }
      }
      return item.type === "random" ? "#2196F3" : "#6755FA";
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? "item-to-delete"
          : "item-deleted"
        : "item-active " + this.className;
    },
    formatDate(date) {
      const year = date.substr(0, 4);
      const month = date.substr(5, 2);
      const day = date.substr(8, 2);

      const today = new Date();
      const testDate = new Date(`${month}/${day}/${year}`);

      const diffDays = Math.floor(
        Math.abs(today - testDate) / (1000 * 60 * 60 * 24)
      );

      const testTime = date
        .split("T")[1]
        .split(".")[0]
        .substr(0, 5);

      if (diffDays === 0) {
        return `Hoje às ${testTime}`;
      } else if (diffDays === 1) {
        return `Ontem às ${testTime}`;
      } else {
        return `${this.months[parseInt(month)].substr(0, 3)} ${day} ${year}`;
      }
    },
    onRowClick() {
      this.$router.push("/tests");
    }
  },
  created() {
    if (this.userClaims && this.userClaims["student"]) {
      this.$store.dispatch("loadLastTests", 10);
    } else {
      this.$store.dispatch("loadLastTests", 5);
    }
  }
};
</script>

<style scoped>
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  border-radius: 60px;
  margin-right: 5px;

  animation: animate-icon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.table-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;
}

.title-divider {
  height: 1px;
  width: 100%;

  background-color: #6755fa44;
}

.type-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

@keyframes animate-icon {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>

<style>
.dashboard-tests-table .item-to-delete {
  color: #f00;
  background-color: white !important;
}

.dashboard-tests-table .item-deleted {
  color: #c4c4c4;
  background-color: white !important;
}

.dashboard-tests-table .item-active.admin {
  cursor: pointer !important;
}
</style>
