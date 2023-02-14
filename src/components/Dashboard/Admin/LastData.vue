<template>
  <v-card outlined width="100%" height="100%" class="last-data">
    <div class="last-data-container">
      <h1 class="last-data-title">
        {{ $t('DASHBOARD.LAST_DATA.latest_records') }}

        <v-hover v-slot="{ hover }">
          <v-btn
            text
            to="/admin"
            class="see-more-button pa-0 ma-0 ml-2"
            :ripple="false"
            :color="hover ? '#2196f3' : '#888888'"
          >
            {{ $t('DASHBOARD.LAST_DATA.see_more') }}
          </v-btn>
        </v-hover>
      </h1>
      <div class="last-data-sub-container">
        <div
          class="last-backup info-row"
          :class="lastBackup ? 'clickable' : ''"
          @click="lastBackup && pushUrl('backups')"
        >
          <div class="icon-container">
            <v-icon size="26" color="#219653">{{ mdiCloud }}</v-icon>
          </div>
          <div class="data-info">
            <span class="info-title">Backup</span>
            <span class="backup-id info-id" v-if="lastBackup">
              {{ lastBackup.id }}
              <span class="creation-date">{{
                formatDate(lastBackup.start)
              }}</span>
            </span>
            <span class="backup-id info-id" v-else>{{
              $t('DASHBOARD.LAST_DATA.no_backup')
            }}</span>
          </div>
          <div class="creation-date" v-if="lastBackup">
            {{ formatDate(lastBackup.start) }}
          </div>
        </div>
        <div
          class="last-error-log info-row"
          :class="lastLog ? 'clickable' : ''"
          @click="lastLog && pushUrl('logs')"
        >
          <div class="icon-container">
            <v-icon size="26" color="#FF2233">{{ mdiFileAlertOutline }}</v-icon>
          </div>
          <div class="data-info">
            <span class="info-title">{{
              $t('DASHBOARD.LAST_DATA.error_log')
            }}</span>
            <span class="log-type info-id" v-if="lastLog">
              {{ lastLog.type }}
              <span class="creation-date">{{ formatDate(lastLog.date) }}</span>
            </span>
            <span class="log-type info-id" v-else>{{
              $t('DASHBOARD.LAST_DATA.no_error')
            }}</span>
          </div>
          <div class="creation-date" v-if="lastLog">
            {{ formatDate(lastLog.date) }}
          </div>
        </div>
        <div
          class="last-user info-row"
          :class="lastUser ? 'clickable' : ''"
          @click="lastUser && pushUrl('users')"
        >
          <div class="icon-container">
            <v-icon size="30" color="#2F80ED">{{ mdiAccount }}</v-icon>
          </div>
          <div class="data-info">
            <span class="info-title">{{
              $t('DASHBOARD.LAST_DATA.user_created')
            }}</span>
            <span class="user-name info-id" v-if="lastUser">
              {{ lastUser.name }}
              <span class="creation-date">{{
                formatDate(lastUser.created)
              }}</span>
            </span>
            <span class="user-name info-id" v-else>{{
              $t('DASHBOARD.LAST_DATA.no_user')
            }}</span>
          </div>
          <div class="creation-date" v-if="lastUser">
            {{ formatDate(lastUser.created) }}
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mdiAccount, mdiCloud, mdiFileAlertOutline } from '@mdi/js'

export default {
  name: 'LastData',
  data() {
    return {
      mdiAccount,
      mdiCloud,
      mdiFileAlertOutline,
    }
  },
  computed: {
    lastBackup() {
      return this.$store.getters.getLastBackup
    },
    lastLog() {
      return this.$store.getters.getLastLog
    },
    lastUser() {
      return this.$store.getters.getLastUser
    },
    months() {
      return this.$store.getters.getMonths
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
  },
  methods: {
    formatDate(date) {
      const year = date.substr(0, 4)
      const month = date.substr(5, 2)
      const day = date.substr(8, 2)

      const today = new Date()
      const backupDate = new Date(`${month}/${day}/${year}`)

      const diffDays = Math.floor(
        Math.abs(today - backupDate) / (1000 * 60 * 60 * 24),
      )

      const backupTime = date
        .split('T')[1]
        .split('.')[0]
        .substr(0, 5)

      if (diffDays === 0) {
        return `${this.$t('SHARED.DATE.today_at')} ${backupTime}`
      } else if (diffDays === 1) {
        return `${this.$t('SHARED.DATE.yesterday_at')} ${backupTime}`
      } else {
        return `${this.$t(
          'SHARED.DATE.MONTH.' + this.months[parseInt(month)],
        ).substr(0, 3)} ${day} ${year}`
      }
    },
    pushUrl(param) {
      this.$router.push('/admin?tab=' + param)
    },
  },
  mounted() {
    if (this.userClaims && this.userClaims['admin']) {
      this.$store.dispatch('loadLastBackup')
      this.$store.dispatch('loadLastLog')
      this.$store.dispatch('loadLastUser')
    }
  },
}
</script>

<style scoped>
.last-data {
  border-radius: 26px;
  overflow: hidden;
}

.last-data-container {
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  padding: 20px;
}

.last-data-sub-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.last-data-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;

  margin-bottom: 10px;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 50px;
  min-width: 50px;
  width: 50px;

  margin-right: 10px;

  border-radius: 5px;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.info-row.clickable {
  cursor: pointer;
  border-radius: 5px;

  transition: all 0.3s;
}

.info-row.clickable:hover {
  background-color: #d4d4d433;
  transform: translateY(-2px);
}

.last-backup .icon-container {
  background-color: #21965355;
}

.last-error-log .icon-container {
  background-color: #ff223355;
}

.last-user .icon-container {
  background-color: #2f80ed55;
}

.data-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  width: 50%;
}

.info-id {
  font-size: 0.95rem;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.data-info .creation-date {
  display: none;
}

.backup-id {
  color: #219653;
}

.log-type {
  color: #ff2233;
}

.user-name {
  color: #2f80ed;
}

.info-title {
  color: #555;
  font-weight: 500;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.creation-date {
  color: #555;
  font-size: 0.95rem;
  text-align: end;
}

.see-more-button {
  font-size: 0.75rem;
}

.see-more-button::before {
  background: transparent;
}

@media (max-width: 960px) {
  .creation-date {
    display: none;
  }

  .data-info .creation-date {
    display: block;
  }

  .info-row {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .last-data-sub-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .info-row {
    width: 32%;
  }

  .last-backup {
    width: 28%;
  }
}

@media (max-width: 760px) {
  .last-data-sub-container {
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .info-row {
    width: 100%;
  }
}

@media (max-width: 660px) {
  .data-info {
    flex-grow: 1;
  }

  .creation-date {
    display: block;
  }

  .data-info .creation-date {
    display: none;
  }
}

@media (max-width: 400px) {
  .creation-date {
    display: none;
  }

  .data-info .creation-date {
    display: block;
  }
}

@media (max-width: 300px) {
  .info-title {
    font-size: 0.9rem;
  }

  .info-id {
    font-size: 0.85rem;
  }

  .data-info .creation-date {
    font-size: 0.85rem;
  }
}
</style>
