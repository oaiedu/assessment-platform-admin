<template>
  <v-card width="100%" height="100%" class="last-requests">
    <div class="last-requests-container">
      <h1 class="last-requests-title">
        {{ $t('DASHBOARD.LAST_REQUESTS.requests') }}
      </h1>
      <span
        class="see-all"
        v-if="requests && requests.length >= 4"
        @click="pushUrl"
      >
        {{ $t('DASHBOARD.LAST_REQUESTS.see_all') }}
      </span>
      <div
        v-if="requests && requests.length > 0"
        class="last-requests-sub-container"
        :style="getFlexStyle"
      >
        <div
          v-for="item in requests"
          :key="item.id"
          class="request-row"
          @click="$router.push(`/inbox/${item.id}`)"
        >
          <div class="details-container">
            <div class="name">{{ item.name.substring(0, 7) }}</div>
            <div class="subject">{{ item.subject }}</div>
          </div>
          <div
            class="status"
            :style="{
              color: getColor(item.status),
              backgroundColor: getColor(item.status) + '33',
            }"
          >
            {{ $t('REQUESTS.STATUS.' + item.status) }}
          </div>
        </div>
      </div>
      <div v-else class="no-content">
        {{ $t('DASHBOARD.LAST_REQUESTS.no_requests') }}
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'LastRequests',
  computed: {
    requests() {
      return this.$store.getters.getCurrentUserRequests
    },
    getFlexStyle() {
      if (this.requests.length <= 3) {
        return { justifyContent: 'flex-start', gap: '10px' }
      } else if (this.requests.length === 3) {
        return { justifyContent: 'space-between' }
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
  },
  methods: {
    getColor(status) {
      if (status === '0-pendant') {
        return '#ffaa00'
      }

      if (status === '2-approved') {
        return '#00cc44'
      }

      return '#ff2233'
    },
    pushUrl() {
      this.$router.push('/inbox')
    },
  },
  mounted() {
    if (this.userClaims && this.userClaims['appraiser']) {
      this.$store.dispatch('loadUserRequests', {
        userId: this.userInfo.id,
        mode: 'current',
        limit: 4,
      })
    }
  },
}
</script>

<style scoped>
.last-requests-container,
.no-content {
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  padding: 20px;
}

.last-requests-sub-container {
  display: flex;
  flex-direction: column;

  position: relative;

  flex-grow: 1;
  width: 100%;
}

.no-content {
  justify-content: center;
  align-items: center;

  color: #999;
  font-size: 1.2rem;
}

.see-all {
  position: absolute;
  left: 180px;
  top: 25px;

  color: #555;
  font-size: 0.8rem;

  cursor: pointer;

  transition: all 0.2s;
}

.see-all:hover {
  color: #2196f3;
}

.last-requests-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;

  margin-bottom: 5px;
}

.request-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  width: 100%;

  cursor: pointer;
  border-radius: 5px;

  transition: all 0.3s;
}

.request-row:hover {
  background-color: #d4d4d433;
  transform: translateY(-2px);
}

.details-container {
  flex-grow: 1;
  width: 50%;
}

.details-container .name {
  color: #2196f3;
  font-weight: 500;
  font-size: 1.05rem;
}

.details-container .subject {
  color: #777;
  font-weight: 500;
  font-size: 0.9rem;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-row .status {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  min-width: 90px;
  width: 90px;

  border-radius: 5px;
  font-weight: 500;
}

@media (min-width: 761px) and (max-width: 900px) {
  .last-requests-sub-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 20px;
  }

  .request-row {
    flex-direction: row-reverse;
    gap: 20px;
  }
}

@media (max-width: 280px) {
  .see-all {
    display: none;
  }
}
</style>
