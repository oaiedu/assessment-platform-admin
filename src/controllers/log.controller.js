import { Controller } from './base.controller'

import { LogEntity } from '../entities/log.entity'

const LOG_COLLECTION = 'logs'

/**
 * Class that represents the error log controller.
 */
export class LogController extends Controller {
  /**
   * Gets all logs from the database.
   */
  async getAll() {
    return super._getAll(LOG_COLLECTION, LogEntity)
  }

  /**
   * Gets the last error log.
   */
  async getLast() {
    const logs = await super._query(LOG_COLLECTION, LogEntity, {
      limit: 1,
      orderBy: [
        {
          field: 'date',
          mode: 'desc',
        },
      ],
    })

    return logs[0] ?? null
  }

  /**
   * Creates a log into the database.
   *
   * @param {Partial<LogEntity>} data the log to be created.
   */
  async createOne(data) {
    return super._createOne(LOG_COLLECTION, LogEntity, data)
  }
}
