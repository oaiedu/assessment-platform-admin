<template>
  <v-container class="logs-table mt-4">
    <v-row class="ma-0 pa-0">
      <v-text-field
        v-model="search"
        clearable
        dense
        outlined
        rounded
        color="blue"
        style="max-width: 400px"
        :label="$t('ADMIN.search')"
      ></v-text-field>
    </v-row>

    <v-card outlined class="mt-5" style="border-radius: 26px; overflow: hidden">
      <v-data-table
        :loading-text="$t('ADMIN.LOGS.loading_logs')"
        :no-data-text="$t('ADMIN.LOGS.no_logs')"
        :items="logs"
        :headers="
          headers.map(h => ({ ...h, text: $t('ADMIN.LOGS.HEADERS.' + h.text) }))
        "
        :loading="loading"
        :search="search"
      >
        <template v-slot:[`item.userInfo`]="{ item }">
          {{ item.user.name || item.user.email }}
        </template>

        <template v-slot:[`item.date`]="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="blue"
                @click="downloadLog(item)"
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
                class="ml-3"
                color="blue-grey lighten-1"
                :disabled="
                  !item.user.email || item.user.email === userInfo.email
                "
                @click="sendEmail(item.user.email)"
              >
                {{ mdiEmail }}
              </v-icon>
            </template>
            <span>{{ $t('REQUESTS.TABLE.send_email') }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { mdiDownload, mdiEmail } from '@mdi/js'

export default {
  name: 'LogsTable',
  data() {
    return {
      mdiDownload,
      mdiEmail,
      search: '',
      headers: [
        { text: 'id', align: 'left', value: 'id', sortable: true },
        { text: 'type', align: 'center', value: 'type', sortable: true },
        { text: 'user', align: 'center', value: 'userInfo', sortable: true },
        { text: 'date', align: 'center', value: 'date', sortable: true },
        { text: 'actions', align: 'center', value: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    logs() {
      const logs = this.$store.getters.logs
      logs.sort((l1, l2) => (l1.date < l2.date ? 1 : -1))
      return logs
    },
    loading() {
      return this.$store.getters.loading
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
  },
  methods: {
    formatDate(date) {
      const dateParts = date.split('T')[0].split('-')
      const time = date.split('T')[1].split('.')[0]

      const year = dateParts[0]
      const month = dateParts[1]
      const day = dateParts[2]

      return `${time} - ${day}/${month}/${year}`
    },
    sendEmail(email) {
      const a = document.createElement('a')
      a.href = 'mailto:' + email
      a.click()
      a.remove()
    },
    downloadLog(item) {
      const template =
        'ID: ' +
        item.id +
        '\nDate: ' +
        item.date +
        '\nType: ' +
        item.type +
        '\nUser: ' +
        item.user.id +
        ' - ' +
        item.user.email +
        '\nError: ' +
        item.message +
        '\nPayload: ' +
        JSON.stringify(JSON.parse(item.payload))

      const a = document.createElement('a')
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(template)
      a.download =
        'log_' +
        item.type.replace(/\s/g, '_').toLowerCase() +
        '_' +
        item.id +
        '_' +
        item.date +
        '.txt'
      a.click()
      a.remove()
    },
  },
}
</script>

<style>
.logs-table .v-text-field__details {
  display: none !important;
}
</style>
