import { Controller } from './base.controller'

import { DataSizeEntity } from '../entities/data-size.entity'

const DATA_SIZE_COLLECTION = 'data-size'

/**
 * Class that represents the data size controller.
 */
export class DataSizeController extends Controller {
  /**
   * Gets the data size object from the database.
   *
   * @returns the data size object.
   */
  async getOne() {
    const list = await super._getAll(DATA_SIZE_COLLECTION, DataSizeEntity)

    let dataSize = list[0]

    if (!dataSize) {
      dataSize = await super._createOne(DATA_SIZE_COLLECTION, DataSizeEntity, {
        'question-requests': {
          general: 0,
          users: [],
        },
        questions: {
          general: 0,
          subject: {},
        },
        tests: 0,
        testsByWeek: {},
        users: 0,
      })
    }

    return dataSize
  }

  /**
   * Updates the data size with the given data.
   *
   * @param {Partial<DataSizeEntity>} data the data to be set.
   */
  async updateOne(data) {
    const size = await this.getOne()

    if (!size) {
      return null
    }

    data.id = size.id

    return super._updateOne(DATA_SIZE_COLLECTION, DataSizeEntity, data)
  }
}
