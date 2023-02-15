<template>
  <v-container>
    <v-card flat outlined style="border-radius: 26px; overflow: hidden">
      <v-data-table
        hide-default-footer
        :loading-text="$t('REQUESTS.TABLE.loading_requests')"
        :no-data-text="$t('REQUESTS.TABLE.no_requests')"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('REQUESTS.TABLE.HEADERS.' + h.text),
          }))
        "
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading || rejectLoading"
        :item-class="itemRowStyle"
      >
        <template
          v-slot:[`item.status`]="{ item }"
          v-if="items && items.length > 0"
        >
          <span
            class="font-weight-medium"
            :style="{
              color:
                item.status === '0-pendant'
                  ? '#ffaa00'
                  : item.status === '2-approved'
                  ? '#00cc66'
                  : '#ff3333',
            }"
          >
            {{ $t('REQUESTS.STATUS.' + item.status) }}
          </span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row justify="end" v-if="!item.toDelete">
            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="blue-grey lighten-1"
                  @click="onEmailClick(item)"
                >
                  {{ mdiEmail }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.send_email') }}</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="blue-grey lighten-1"
                  @click="onPdfClick(item)"
                >
                  {{ mdiFilePdfBox }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.view_pdf') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['admin']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="green"
                  :disabled="
                    item.status === '2-approved' || loading || rejectLoading
                  "
                  @click="onCheckClick(item)"
                >
                  {{ mdiCheckBold }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.approve') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && userClaims['appraiser']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="orange"
                  :disabled="
                    item.status === '2-approved' || loading || rejectLoading
                  "
                  @click="onEditClick(item)"
                >
                  {{ mdiPencil }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.edit') }}</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  class="ml-3"
                  color="red"
                  :disabled="
                    loading ||
                      rejectLoading ||
                      (userClaims && userClaims['admin']
                        ? item.status === '1-rejected'
                        : item.status === '2-approved')
                  "
                  @click="
                    userClaims && userClaims['admin']
                      ? onRejectClick(item)
                      : onDeleteClick(item)
                  "
                >
                  {{ userClaims && userClaims['admin'] ? mdiClose : mdiDelete }}
                </v-icon>
              </template>
              <span>{{
                $t(
                  'REQUESTS.TABLE.' +
                    (userClaims && userClaims['admin'] ? 'reject' : 'delete'),
                )
              }}</span>
            </v-tooltip>
          </v-row>

          <v-row
            justify="end"
            v-else-if="item.toDelete && item.toDelete.status"
          >
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              color="red"
              text
              :disabled="userClaims && !userClaims['appraiser']"
              @click="onRestoreClick(item)"
            >
              {{
                $t(
                  'QUESTIONS.TABLE.' +
                    (userClaims && userClaims['appraiser']
                      ? 'restore'
                      : 'unavailable'),
                )
              }}
            </v-btn>
          </v-row>

          <v-row justify="end" v-else>
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              disabled
              text
            >
              {{ $t('TEST.TESTS_TABLE.deleted') }}
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import {
  mdiClose,
  mdiDelete,
  mdiPencil,
  mdiCheckBold,
  mdiFilePdfBox,
  mdiEmail,
} from '@mdi/js'

export default {
  name: 'RequestsTable',
  props: ['items', 'page', 'itemsPerPage', 'rejectLoading'],
  data() {
    return {
      mdiClose,
      mdiDelete,
      mdiPencil,
      mdiCheckBold,
      mdiFilePdfBox,
      mdiEmail,
    }
  },
  computed: {
    headers() {
      return this.userClaims && this.userClaims['admin']
        ? [
            { text: 'id', sortable: true, value: 'name', align: 'left' },
            {
              text: 'user',
              value: 'user.name',
              sortable: true,
              align: 'center',
            },
            {
              text: 'email',
              value: 'user.email',
              sortable: true,
              align: 'center',
            },
            {
              text: 'subject',
              value: 'subject',
              sortable: true,
              align: 'center',
            },
            {
              text: 'status',
              value: 'status',
              sortable: true,
              align: 'center',
            },
            {
              text: 'actions',
              value: 'actions',
              sortable: false,
              align: 'right',
            },
          ]
        : [
            { text: 'id', sortable: true, value: 'name', align: 'left' },
            {
              text: 'subject',
              value: 'subject',
              sortable: true,
              align: 'center',
            },
            {
              text: 'status',
              value: 'status',
              sortable: true,
              align: 'center',
            },
            {
              text: 'actions',
              value: 'actions',
              sortable: false,
              align: 'right',
            },
          ]
    },
    loading() {
      return this.$store.getters.loading
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
  },
  methods: {
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : ''
    },
    onEmailClick(item) {
      this.$emit('emailClick', item.user.email)
    },
    onPdfClick(item) {
      this.$emit('pdfClick', item)
    },
    onEditClick(item) {
      this.$emit('editClick', item)
    },
    onCheckClick(item) {
      this.$emit('checkClick', item)
    },
    onRejectClick(item) {
      this.$emit('rejectClick', item)
    },
    onDeleteClick(item) {
      this.$emit('deleteClick', item)
    },
    onRestoreClick(item) {
      this.$emit('restoreClick', item)
    },
  },
}
</script>

<style>
.item-to-delete {
  color: #f00;
}

.item-deleted {
  color: #c4c4c4;
}
</style>
