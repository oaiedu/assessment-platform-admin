<template>
  <div class="dashboard" :class="className">
    <DisplayProfile v-if="windowWidth > 860" />
    <DataAmount />
    <LastData v-if="userClaims && userClaims['admin']" />
    <LastRequests
      v-else-if="userClaims && userClaims['appraiser']"
      :windowWidth="windowWidth"
    />
    <QuestionBySubject :windowWidth="windowWidth" />
    <TestsByWeek :windowWidth="windowWidth" />
    <PendentRequests
      v-if="userClaims && !userClaims['student']"
      :windowWidth="windowWidth"
    />
    <TestsTable :windowWidth="windowWidth" />
  </div>
</template>

<script>
import DisplayProfile from "./DisplayProfile";
import DataAmount from "./DataAmount";
import LastData from "./Admin/LastData";
import LastRequests from "./Appraiser/LastRequests";
import QuestionBySubject from "./QuestionBySubject";
import TestsByWeek from "./TestsByWeek";
import PendentRequests from "./PendentRequests";
import TestsTable from "./TestsTable";

export default {
  name: "Dashboard",
  components: {
    DisplayProfile,
    DataAmount,
    LastData,
    LastRequests,
    QuestionBySubject,
    TestsByWeek,
    PendentRequests,
    TestsTable
  },
  data() {
    return {
      windowWidth: window.innerWidth
    };
  },
  computed: {
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    userInfo() {
      return this.$store.getters.userInfo;
    },
    className() {
      return this.userInfo.role;
    }
  },
  methods: {
    onWindowResize() {
      this.windowWidth = window.innerWidth;
    }
  },
  mounted() {
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onWindowResize);
  }
};
</script>

<style>
.dashboard {
  display: grid;
  grid-template-columns: 500px 460px 1fr;
  grid-template-rows: 120px 250px 350px;
  grid-template-areas:
    "user-info data-amount data-amount"
    "question-by-subject tests-table tests-table"
    "tests-by-week tests-table tests-table";
  row-gap: 30px;
  column-gap: 30px;

  width: 100%;
  min-height: calc(100vh - 48px);

  padding: 30px;

  /* background-color: #f5f5f5; */
}

.dashboard.admin {
  grid-template-areas:
    "user-info data-amount data-amount"
    "last-data question-by-subject tests-by-week"
    "pendent-requests tests-table tests-table";
}

.dashboard.appraiser {
  grid-template-areas:
    "user-info data-amount data-amount"
    "last-requests question-by-subject tests-by-week"
    "pendent-requests tests-table tests-table";
}

.dashboard.student {
  grid-template-areas:
    "user-info data-amount data-amount"
    "question-by-subject tests-table tests-table"
    "tests-by-week tests-table tests-table";
}

.dashboard .display-profile {
  grid-area: user-info;
}

.dashboard .data-amount {
  grid-area: data-amount;
}

.dashboard .last-data {
  grid-area: last-data;
}

.dashboard .question-by-subject {
  grid-area: question-by-subject;
}

.dashboard .tests-by-week {
  grid-area: tests-by-week;
}

.dashboard .pendent-requests {
  grid-area: pendent-requests;
}

.dashboard .tests-table {
  grid-area: tests-table;
}

.dashboard .last-requests {
  grid-area: last-requests;
}

.dashboard .tests-table .v-data-table.dashboard-tests-table table {
  height: 100%;
}

@media (max-width: 1400px) {
  .dashboard {
    grid-template-columns: 430px 430px 1fr;
    grid-template-rows: 120px 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "user-info data-amount data-amount"
      "last-data question-by-subject tests-by-week"
      "pendent-requests tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "user-info data-amount data-amount"
      "last-requests question-by-subject tests-by-week"
      "pendent-requests tests-table tests-table";
  }

  .dashboard.student {
    grid-template-areas:
      "user-info data-amount data-amount"
      "question-by-subject tests-table tests-table"
      "tests-by-week tests-table tests-table";
  }
}

@media (max-width: 1300px) {
  .dashboard {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 120px 250px 350px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "user-info data-amount"
      "last-data question-by-subject"
      "pendent-requests tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "user-info data-amount"
      "last-requests question-by-subject"
      "pendent-requests tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.student {
    grid-template-rows: 120px 250px 350px;
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject tests-table"
      "tests-by-week tests-table";
  }
}

@media (max-width: 1000px) {
  .dashboard {
    grid-template-columns: 430px minmax(0, 1fr);
    grid-template-rows: 120px 120px 250px auto 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "user-info question-by-subject"
      "data-amount question-by-subject"
      "last-data tests-by-week"
      "pendent-requests pendent-requests"
      "tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "user-info question-by-subject"
      "data-amount question-by-subject"
      "last-requests tests-by-week"
      "pendent-requests pendent-requests"
      "tests-table tests-table";
  }

  .dashboard.student {
    grid-template-rows: 120px 250px 350px;
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject tests-by-week"
      "tests-table tests-table";
  }
}

@media (max-width: 960px) {
  .dashboard {
    grid-template-columns: 400px minmax(0, 1fr);
    grid-template-rows: 120px 250px 300px 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "last-data pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "last-requests pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.student {
    grid-template-rows: 120px 250px 250px 350px;
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 400px minmax(0, 1fr);
    grid-template-rows: 120px 250px auto auto 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "last-data last-data"
      "pendent-requests pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "last-requests last-requests"
      "pendent-requests pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.student {
    grid-template-rows: 120px 250px 250px 350px;
    grid-template-areas:
      "user-info data-amount"
      "question-by-subject question-by-subject"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }
}

@media (max-width: 860px) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 120px 250px auto auto 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "data-amount"
      "question-by-subject"
      "last-data"
      "pendent-requests"
      "tests-by-week"
      "tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "data-amount"
      "question-by-subject"
      "last-requests"
      "pendent-requests"
      "tests-by-week"
      "tests-table";
  }

  .dashboard.student {
    grid-template-rows: 120px 250px 250px 350px;
    grid-template-areas:
      "data-amount data-amount"
      "question-by-subject question-by-subject"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }
}

@media (max-width: 760px) {
  .dashboard {
    grid-template-columns: minmax(276.5px, 1fr) minmax(0, 1fr);
    grid-template-rows: 120px 250px 300px 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "data-amount data-amount"
      "question-by-subject question-by-subject"
      "last-data pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "data-amount data-amount"
      "question-by-subject question-by-subject"
      "last-requests pendent-requests"
      "tests-by-week tests-by-week"
      "tests-table tests-table";
  }
}

@media (max-width: 660px) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 120px 250px 250px auto 250px 350px;
  }

  .dashboard.admin {
    grid-template-areas:
      "data-amount"
      "question-by-subject"
      "last-data"
      "pendent-requests"
      "tests-by-week"
      "tests-table";
  }

  .dashboard.appraiser {
    grid-template-areas:
      "data-amount"
      "question-by-subject"
      "last-requests"
      "pendent-requests"
      "tests-by-week"
      "tests-table";
  }
}

@media (max-width: 500px) {
  .dashboard {
    padding: 20px 10px;
    row-gap: 20px;
  }
}

@media (max-width: 400px) {
  .dashboard {
    grid-template-rows: 200px 400px 300px auto 250px 350px;
  }

  .dashboard.student {
    grid-template-rows: 200px 250px 250px 350px;
  }
}
</style>
