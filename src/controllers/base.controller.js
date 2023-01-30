import { db } from '../main'

/**
 * @template {any} T
 * @typedef {{ new (...args: unknown[]) => T }} Type
 */

/**
 * @typedef {Object} OrderBy
 * @property {string} field The field to be sorted.
 * @property {'asc'|'desc'} mode The sorting mode.
 */

/**
 * @typedef {'!='|'<'|'<='|'=='|'>'|'>='|'array-contains'|'array-contains-any'|'in'|'not-in'} Operator
 */

/**
 * @typedef {Object} Where
 * @property {string} field The field name to be used in the filtering.
 * @property {Operator} operator The operator to be used to compare the field with the value.
 * @property {any} value The value to be used on the comparison.
 */

/**
 * @typedef {Object} Query
 * @property {number} limit The amount of items to get.
 * @property {Where[]} where The filters to be applied.
 * @property {OrderBy[]} orderBy A list with all sorting fields.
 */

/**
 * Class that represents the base controller, which will be extended from
 * other controllers to execute its basic functionalities.
 */
export class Controller {
  /**
   * Gets all entities from the given collection.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity to be get.
   * @returns {Promise<T[]>} a list of entities.
   */
  async getAll(collection, entityType) {
    const snap = await db.collection(collection).get()

    return snap.docs.map(doc =>
      entityType.fromMap({ ...doc.data(), id: doc.id }),
    )
  }

  /**
   * Gets an entity according to the given collection and id.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {string} id the document id.
   * @param {Type<T>} entityType the entity to be get.
   * @returns {Promise<T>} the found entity.
   */
  async getOne(collection, id, entityType) {
    const doc = await db
      .collection(collection)
      .doc(id)
      .get()

    var a = await this.getAll('', entityType)
    a[0]

    return entityType.fromMap({ ...doc.data(), id: doc.id })
  }

  /**
   * Makes a query to get data from the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity to be get.
   * @param {Query} query the query to be used.
   * @returns {Promise<T[]>} the found entities.
   */
  async query(collection, entityType, query = {}) {
    let q = db.collection(collection)

    const { orderBy = [], where = [], limit } = query

    orderBy.forEach(({ field, mode = 'asc' }) => {
      q = q.orderBy(field, mode)
    })

    where.forEach(({ field, operator, value }) => {
      q = q.where(field, operator, value)
    })

    if (limit) {
      q = q.limit(limit)
    }

    const snap = await q.get()

    return snap.docs.map(doc =>
      entityType.fromMap({ ...doc.data(), id: doc.id }),
    )
  }

  /**
   * @protected
   */
  async list() {}

  /**
   * @protected
   */
  async listLast() {}

  /**
   * Creates an entity into the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be created.
   * @param {Partial<T>} data the data to be set.
   * @returns {Promise<T>} the created entity with its id.
   */
  async createOne(collection, entityType, data) {
    if (data.id) {
      delete data.id
    }

    const entity = new entityType(data)

    const doc = await db.collection(collection).add(entity.toMap())

    return entityType.fromMap({ ...entity.toMap(), id: doc.id })
  }

  /**
   * Updates an entity according to the given data.
   *
   * @usageNotes
   * Only the given properties will be replaced into the document.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be updated.
   * @param {Partial<T>} data the data to be set.
   * @returns {Promise<T>} the updated entity.
   */
  async updateOne(collection, entityType, data) {
    if (!data.id) {
      throw new Error('bad-request/id-not-provided')
    }

    const id = data.id
    delete data.id

    const doc = db
      .collection(collection)
      .doc(id)
      .update(data)

    return entityType.fromMap({ ...new entityType(data).toMap(), id: doc.id })
  }

  /**
   * Creates/updates an entity into the database.
   *
   * @usageNotes
   * The entity is updated in case its id is defined. Otherwise, it'll be
   * created.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be created/updated.
   * @param {Partial<T>} data the data to be set.
   * @returns {Promise<T>} the created/updated entity.
   */
  async createOrUpdate(collection, entityType, data) {
    if (entityType.id) {
      return this.update(collection, entityType, data)
    }

    return this.create(collection, entityType, data)
  }

  /**
   * Sets an entity into a specific document into the database.
   *
   * @usageNotes
   * In case the entity id is not set, a new document is created.
   * Otherwise, all of the data into the document will be replaced
   * by the given one.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {T} entity the entity to be set.
   * @returns {Promise<T>} the set entity.
   */
  async setOne(collection, entity) {
    const id = entity.id

    if (id) {
      delete entity.id
    }

    const doc = db
      .collection(collection)
      .doc(id)
      .set(entity.toMap())

    return entity.constructor.fromMap({ ...entity, id: doc.id })
  }

  /**
   * Deletes an entity document from the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {T} entity the entity to be deleted.
   * @returns {Promise<T>} the deleted entity.
   */
  async delete(collection, entity) {
    if (!entity.id) {
      throw new Error('bad-request/id-not-provided')
    }

    await db
      .collection(collection)
      .doc(entity.id)
      .delete()

    return entity.constructor.fromMap({ ...entity })
  }
}
