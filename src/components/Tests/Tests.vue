<template>
  <div>
    <v-container>
      <v-container class="mt-10 mb-5">
        <SearchBox
          label="Procurar por Nome"
          @enter="searchQuery($event)"
          @textChange="searchTextChange($event)"
        />
      </v-container>

      <v-container
        v-if="
          hasDeleteMarkTests &&
            ((userClaims && userClaims['admin']) ||
              (markedTestsByUser && markedTestsByUser.length > 0) ||
              deleteMarkTests.filter(
                t => userInfo && t.toDelete.userEmail === userInfo.email
              ).length > 0)
        "
      >
        <DeleteAlert
          :confirmCondition="deleteConfirmed"
          :itemsCondition="hasTrueMarkStatus"
          itemsText="As seguintes provas foram marcadas para exclusão:"
          :items="markedTestsByUser"
          :isAdmin="userClaims && userClaims['admin']"
          :adminItems="markedTestsAdmin"
        />

        <v-row
          justify="start"
          v-if="
            hasTrueMarkStatus &&
              ((userClaims && userClaims['admin']) || markedTestsByUser)
          "
        >
          <v-btn
            class="ml-10"
            color="red"
            :dark="
              !(
                userClaims &&
                userClaims['admin'] &&
                markedTestsAdmin.length === 0
              )
            "
            :disabled="
              userClaims && userClaims['admin'] && markedTestsAdmin.length === 0
            "
            @click="
              deleteConfirmed = true;
              deleteTests(false);
            "
          >
            {{
              userClaims && userClaims["admin"] ? "Confirmar Meus" : "Confirmar"
            }}
          </v-btn>
          <v-btn
            v-if="userClaims && userClaims['admin']"
            class="ml-3"
            color="red"
            dark
            @click="
              deleteConfirmed = true;
              deleteTests(true);
            "
          >
            Confirmar Todos
          </v-btn>
          <v-btn
            class="ml-3"
            color="grey darken-1"
            :dark="
              !(
                userClaims &&
                userClaims['admin'] &&
                markedTestsAdmin.length === 0
              )
            "
            :disabled="
              userClaims && userClaims['admin'] && markedTestsAdmin.length === 0
            "
            @click="restoreAll(false)"
          >
            {{
              userClaims && userClaims["admin"] ? "Restaurar Meus" : "Restaurar"
            }}
          </v-btn>
          <v-btn
            v-if="userClaims && userClaims['admin']"
            class="ml-3"
            color="grey darken-1"
            dark
            @click="restoreAll(true)"
          >
            Restaurar Todos
          </v-btn>
        </v-row>
      </v-container>

      <TestsTable
        :items="isSearching ? filteredTests : tests"
        :page="isSearching ? searchPage : page"
        :itemsPerPage="itemsPerPage"
        @doExam="
          generatedTest = $event;
          dialogExam = true;
        "
        @editClick="
          dialogEditTest = true;
          selectedTest = $event;
        "
        @deleteClick="
          deleteTestSnackBar = true;
          deleteSelect = $event;
        "
        @restoreClick="restoreTest($event)"
      />

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue darken-1"
            @click.stop="
              userClaims && !userClaims['student']
                ? (dialogTestForm = true)
                : (dialogGenerateTest = true)
            "
          >
            <v-icon>{{
              userClaims && !userClaims["student"] ? mdiPlus : mdiTextBoxPlus
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{
          userClaims && !userClaims["student"] ? "Criar Prova" : "Gerar Prova"
        }}</span>
      </v-tooltip>

      <v-dialog v-model="dialogGenerateTest" width="500px" persistent>
        <GenerateCard
          @generated="generateExam($event)"
          @closeDialog="dialogGenerateTest = false"
        ></GenerateCard>
      </v-dialog>

      <v-dialog
        v-model="dialogTestForm"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <TestForm
          v-if="dialogTestForm"
          @closeDialogNew="dialogTestForm = false"
        ></TestForm>
      </v-dialog>

      <v-dialog
        v-model="dialogEditTest"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <TestForm
          v-if="dialogEditTest"
          :test="selectedTest"
          @closeDialogNew="dialogEditTest = false"
          @updateTest="updateTest($event)"
        ></TestForm>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
          :page="!isSearching ? page : searchPage"
          :length="
            !isSearching
              ? pageAmount
              : Math.ceil(filteredTests.length / itemsPerPage)
          "
          @pageChange="
            !isSearching ? (page = $event.page) : (searchPage = $event.page);
            onPageChange($event);
          "
        />
      </div>

      <DeleteWarning
        label="Tem certeza de que deseja excluir esta prova?"
        :state="deleteTestSnackBar"
        @confirm="
          deleteTest(deleteSelect.id);
          deleteTestSnackBar = false;
        "
        @cancel="deleteTestSnackBar = false"
      />
    </v-container>
  </div>
</template>

<script>
import { mdiPlus, mdiTextBoxPlus } from "@mdi/js";
import GenerateCard from "./GenerateCard";
import TestForm from "./TestForm";
import Paginator from "../Paginator";
import TestsTable from "./TestsTable";
import DeleteWarning from "../Shared/DeleteWarning";
import DeleteAlert from "./DeleteAlertTests";
import SearchBox from "../Shared/SearchBox";

export default {
  name: "Tests",
  components: {
    GenerateCard,
    TestForm,
    Paginator,
    TestsTable,
    DeleteWarning,
    DeleteAlert,
    SearchBox
  },
  data() {
    return {
      mdiPlus,
      mdiTextBoxPlus,
      isSearching: false,
      deleteConfirmed: false,
      deleteTestSnackBar: false,
      dialogTestForm: false,
      dialogEditTest: false,
      dialogGenerateTest: false,
      page: 1,
      searchPage: 1,
      itemsPerPage: 10,
      selectedTest: null,
      generatedTest: null,
      headers: [
        { text: "Nome", align: "start", value: "title" },
        { text: "Questões", align: "left", value: "questions.length" },
        { text: "Tipo", align: "left", value: "type" },
        { text: "Ações", align: "right", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    tests() {
      return this.$store.getters.getCurrentTestsPage;
    },
    deleteMarkTests() {
      return this.$store.getters.getDeleteMarkTests;
    },
    markedTestsAdmin() {
      const tests = this.deleteMarkTests.filter(
        t => this.userInfo && t.toDelete.userEmail === this.userInfo.email
      );
      const titles = tests.filter(t => t.toDelete && t.toDelete.status);
      return titles.map(t => t.title).join(", ");
    },
    markedTestsByUser() {
      const isAdmin = this.userClaims && this.userClaims["admin"];
      const tests = isAdmin
        ? this.deleteMarkTests
        : this.deleteMarkTests.filter(
            t => this.userInfo && t.toDelete.userEmail === this.userInfo.email
          );

      const titles = [];

      titles.push(...tests.filter(t => t.toDelete && t.toDelete.status));

      return titles
        .map(t => (isAdmin ? `${t.title} (${t.toDelete.userEmail})` : t.title))
        .join(", ");
    },
    hasDeleteMarkTests() {
      return this.deleteMarkTests && this.deleteMarkTests.length > 0;
    },
    hasTrueMarkStatus() {
      const tests = this.deleteMarkTests.map(t => t.toDelete.status);
      return tests.includes(true);
    },
    filteredTests() {
      return this.$store.getters.getFilteredTests;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    userInfo() {
      return this.$store.getters.userInfo;
    },
    pageAmount() {
      const testsAmount = this.$store.getters.getDataSize.tests;
      return Math.ceil(testsAmount / this.itemsPerPage) || 1;
    }
  },
  methods: {
    generateExam(questions) {
      this.$router.push({
        name: "quiz.details",
        params: {
          id: "generated",
          test: { name: "Prova gerada", questions },
          mode: "practice"
        }
      });
    },
    updateTest(testData) {
      this.$store.dispatch("updateTest", {
        testData,
        isSearching: this.isSearching
      });
    },
    deleteTest(id) {
      this.deleteTestSnackBar = false;
      this.$store.dispatch("deleteMarkTest", {
        id,
        isSearching: this.isSearching,
        userEmail: this.userInfo.email
      });
    },
    deleteTests(all) {
      const tests = this.deleteMarkTests;
      tests.forEach(test => {
        if (
          test.toDelete.status &&
          (this.userInfo.email === test.toDelete.userEmail || all)
        ) {
          this.$store.dispatch("changeDeleteStatusTests", {
            id: test.id,
            isSearching: this.isSearching
          });
        }
      });
    },
    onPageChange(event) {
      const payload = {
        page: this.page,
        itemsPerPage: this.itemsPerPage
      };

      if (!this.isSearching) {
        if (!event.mode) {
          this.$store.dispatch("loadTestPage", {
            ...payload,
            type: event.type
          });
        } else {
          this.$store.dispatch("loadFOLTestPage", {
            ...payload,
            mode: event.mode
          });
        }
      }
    },
    searchTextChange(text) {
      if ((text === null || text.length === 0) && this.isSearching) {
        this.isSearching = false;
        this.searchPage = 1;
        this.$store.commit("resetFilteredTests");
      }
    },
    searchQuery(text) {
      this.searchPage = 1;
      this.$store.commit("resetFilteredTests");

      if (text && text.length > 0) {
        this.isSearching = true;
        this.$store.dispatch("searchTests", text);
      } else {
        this.isSearching = false;
      }
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? "item-to-delete"
          : "item-deleted"
        : "";
    },
    restoreTest(item) {
      this.$store.dispatch("restoreMarkedTest", {
        id: item.id,
        isSearching: this.isSearching
      });
    },
    restoreAll(all) {
      this.$store.dispatch("restoreAllMarkedTests", {
        all,
        user: this.userInfo,
        isSearching: this.isSearching
      });
    }
  },
  mounted() {
    this.deleteConfirmed = false;
    this.$store.dispatch("checkDeleteMarkTests");
    this.$store.dispatch("loadFOLTestPage", {
      page: 1,
      itemsPerPage: this.itemsPerPage,
      mode: "first"
    });
  },
  beforeDestroy() {
    this.search = "";
    this.isSearching = false;
    this.page = 1;
    this.$store.commit("resetFilteredTests");
    this.$store.commit("resetCurrentTestsPage");

    if (this.deleteConfirmed) {
      this.$store.dispatch("deleteTests");
      this.$store.dispatch("resetTests");
      this.$store.dispatch("loadDataSize");
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
