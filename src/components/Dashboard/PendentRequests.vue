<template>
  <v-card outlined width="100%" height="100%" class="pendent-requests">
    <div class="pendent-requests-container">
      <h2 class="card-title">
        {{ cardTitle }}

        <v-hover v-if="userClaims && userClaims['admin']" v-slot="{ hover }">
          <v-btn
            text
            to="/inbox"
            class="see-more-button pa-0 ma-0 ml-2"
            :ripple="false"
            :color="hover ? '#2196f3' : '#888888'"
          >
            {{ $t('DASHBOARD.LAST_DATA.see_more') }}
          </v-btn>
        </v-hover>
      </h2>

      <div
        v-if="requests && requests.length > 0"
        class="requests"
        :style="getFlexStyle"
      >
        <div
          v-for="item in requests"
          :key="item.id"
          class="request-row"
          @click="$router.push(`/inbox/${item.id}`)"
        >
          <div class="name-container">{{ item.name.substring(0, 7) }}</div>
          <div class="details-container">
            <div class="request-subject">{{ item.subject }}</div>

            <div class="request-user">
              {{ item.user.name || item.user.email }}
            </div>
          </div>
        </div>
      </div>
      <div class="no-content" v-else>
        {{ $t('DASHBOARD.LAST_REQUESTS.no_requests') }}
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PendentRequests',
  props: {
    windowWidth: Number,
  },
  computed: {
    limit() {
      return this.windowWidth > 1000 || this.windowWidth <= 660
        ? 5
        : this.windowWidth > 960 ||
          (this.windowWidth <= 900 && this.windowWidth > 760)
        ? 6
        : 4
    },
    requests() {
      return this.userClaims && this.userClaims['appraiser']
        ? this.$store.getters.getOtherUserRequests
        : this.$store.getters.getLastPendentRequests
    },
    getFlexStyle() {
      if (
        (this.windowWidth <= 1000 && this.windowWidth > 960) ||
        (this.windowWidth <= 900 && this.windowWidth > 760)
      ) {
        return {}
      }

      if (
        this.requests &&
        (this.requests.length === 2 || this.requests.length === 3)
      ) {
        return { justifyContent: 'flex-start', gap: '18px' }
      } else {
        return { justifyContent: 'space-between' }
      }
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    cardTitle() {
      if (
        this.userClaims &&
        (this.userClaims['admin'] || this.userClaims['appraiser'])
      ) {
        return this.$t('DASHBOARD.LAST_REQUESTS.latest_requests')
      } else {
        return this.$t('DASHBOARD.LAST_REQUESTS.latest_questions')
      }
    },
  },
  created() {
    if (this.userClaims && this.userClaims['appraiser']) {
      this.$store.dispatch('loadUserRequests', {
        userId: this.userInfo.id,
        mode: 'other',
        limit: this.limit,
      })
    } else {
      this.$store.dispatch('loadLastPendentRequests', { limit: this.limit })
    }
  },
}
</script>

<style scoped>
.pendent-requests {
  border-radius: 26px;
  overflow: hidden;
}

.pendent-requests-container,
.no-content {
  display: flex;
  flex-direction: column;

  position: relative;

  height: 100%;
  width: 100%;

  padding: 20px;
}

.no-content {
  justify-content: center;
  align-items: center;

  color: #999;
  font-size: 1.2rem;
}

.card-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;

  margin-bottom: 20px;
}

.see-more-button {
  font-size: 0.75rem;
}

.see-more-button::before {
  background: transparent;
}

.requests {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  flex-grow: 1;
}

.request-row {
  display: flex;
  flex-direction: row;
  align-items: center;

  width: 100%;
  height: 40px;
  max-height: 42px;

  cursor: pointer;
  border-radius: 5px;

  transition: all 0.3s;
}

.request-row:hover {
  background-color: #d4d4d433;
  transform: translateY(-2px);
}

.name-container {
  display: flex;
  justify-content: center;
  align-items: center;

  min-width: 80px;
  width: 80px;
  height: 40px;

  color: #2196f3;
  font-weight: 500;

  background-color: #2196f333;
  border-radius: 5px;
}

.details-container {
  margin: 0 10px;
  flex-grow: 1;
}

.request-subject {
  color: #222;
  font-weight: 500;
  font-size: 0.85rem;

  text-overflow: ellipsis;
}

.request-user {
  color: #aaa;
  font-size: 0.8rem;

  text-overflow: ellipsis;
}

@media (max-width: 1000px) {
  .requests {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 20px;
    column-gap: 30px;
  }
}

@media (max-width: 960px) {
  .requests {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 900px) {
  .requests {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 20px;
    column-gap: 30px;
  }
}

@media (max-width: 760px) {
  .requests {
    display: flex;
    flex-direction: column;
  }

  .details-container {
    overflow: hidden;
  }

  .request-subject,
  .request-user {
    width: 100%;

    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
