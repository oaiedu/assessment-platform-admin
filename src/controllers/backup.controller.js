import axios from 'axios'

import { Controller } from './base.controller'

import { BackupEntity } from '../entities/backup.entity'

import { getNowISOString, months } from '../utils/date'

const BACKUP_COLLECTION = 'backups'

/**
 * Class that represents the backup controller.
 */
export class BackupController extends Controller {
  /**
   * Creates a backup from the database into the cloud.
   */
  async backup() {
    let url = ''

    const now = getNowISOString()

    if (process.env.NODE_ENV === 'production') {
      url =
        'https://us-central1-cloud-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' +
        now.replace(/:/g, '-')
    } else {
      return null
    }

    const res = await axios.get(url)

    const backup = new BackupEntity({
      start: now,
      end: getNowISOString(),
      size: res.data.size,
      cloudId: res.data.cloudId,
    })

    const lastBackup = await this.getLast()

    let registry = 0
    if (lastBackup) {
      registry = +lastBackup.registry.substring(3) + 1
    } else {
      registry = 1
    }

    backup.registry = `mb${registry.toString().padStart(4, '0')}`

    backup.month = months[new Date(now).getMonth()].substring(0, 3)

    return super._createOne(BACKUP_COLLECTION, BackupEntity, backup)
  }

  /**
   * Downloads a backup according to its cloudId.
   *
   * @param {Object} payload An object containing some main data from the backup.
   * @param {string} payload.registry Defines the backup registry code.
   * @param {string} payload.cloudId Defines the backup cloud ID.
   * @param {string} payload.date Defines the backup start date.
   * @returns {{url?: string, error?: Object}|null} an object containing whether the URL or the error.
   */
  async download(payload) {
    let url = ''

    if (process.env.NODE_ENV === 'production') {
      url =
        'https://us-central1-cloud-quiz-generator.cloudfunctions.net/backup-downloadBackup?id=' +
        payload.cloudId
    } else {
      return null
    }

    const res = await axios.get(url)
    const { backup, error } = res.data

    if (!backup && error) {
      return { error }
    }

    return { url: `data:application/zip;base64,${backup}` }
  }

  /**
   * Gets the last backup from the database.
   */
  async getLast() {
    const backups = await super._query(BACKUP_COLLECTION, BackupEntity, {
      limit: 1,
      orderBy: [
        {
          field: 'start',
          mode: 'desc',
        },
      ],
    })

    return backups[0] ?? null
  }

  /**
   * Gets the backups from the last 3 months, including the current one.
   */
  async getLastMonths() {
    const date = new Date()

    const currentMonth = date.getMonth()

    date.setMonth(currentMonth - 1)
    const lastMonth = date.getMonth()

    date.setMonth(currentMonth - 1)
    const twoMonthsAgo = date.getMonth()

    const filteredMonths = [
      months[currentMonth].substring(0, 3),
      months[lastMonth].substring(0, 3),
      months[twoMonthsAgo].substring(0, 3),
    ]

    return super._query(BACKUP_COLLECTION, BackupEntity, {
      where: [
        {
          field: 'month',
          operator: 'in',
          value: filteredMonths,
        },
      ],
    })
  }

  /**
   * Deletes a backup from the cloud.
   *
   * @param {string} cloudId the backup cloud ID.
   * @returns an object containing the deletion status.
   */
  async delete(cloudId) {
    let url = ''

    const data = {
      backup: null,
      success: false,
      error: {},
    }

    if (process.env.NODE_ENV === 'production') {
      url =
        'https://us-central1-cloud-quiz-generator.cloudfunctions.net/backup-deleteBackup?id=' +
        cloudId
    } else {
      return data
    }

    const res = await axios.get(url)
    const { deleted } = res.data

    if (!deleted) {
      return data
    }

    try {
      const backup = await super._query(BACKUP_COLLECTION, BackupEntity, {
        where: [
          {
            field: 'cloudId',
            operator: '==',
            value: cloudId,
          },
        ],
      })[0]

      if (!backup) {
        return data
      }

      await super._delete(BACKUP_COLLECTION, backup)

      data.backup = backup
      data.success = true
    } catch (error) {
      data.error = error
    } finally {
      return data
    }
  }
}
