import { DataSizeEntity } from '../entities/data-size.entity'
import { Controller } from './base.controller'

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
    const list = await super.getAll(DATA_SIZE_COLLECTION, DataSizeEntity)

    return list[0]
  }

  /**
   * Updates the data size with the given data.
   *
   * @param {Partial<DataSizeEntity>} data the data to be set.
   */
  async updateOne(data) {
    const size = await this.getOne()

    data.id = size.id

    return super.updateOne(DATA_SIZE_COLLECTION, DataSizeEntity, data)
  }
}
