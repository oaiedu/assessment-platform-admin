import firebase from 'firebase/app'

import { db, storage } from '../api/firebase'

import { getNowISOString } from '../utils/date'

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
 * @typedef {Object} PaginationQuery
 * @property {string} orderBy The sorting field name.
 * @property {[string, string]?} lastDoc A 2 position list containing the first and last documents, respectively.
 * @property {number} itemsPerPage The amount of items per page. Defaults to `8`.
 * @property {'forward'|'backward'} direction The loading direction. Defaults to `next`.
 */

/**
 * @template T
 * @typedef {Object} PaginationQueryResponse
 * @property {T[]} data A list of entities.
 * @property {string?} startDoc The starting document of the list.
 * @property {string?} endDoc The ending document of the list.
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
  async _getAll(collection, entityType) {
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
   * @param {Type<T>} entityType the entity to be get.
   * @param {string} id the document id.
   * @returns {Promise<T>} the found entity.
   */
  async _getOne(collection, entityType, id) {
    const doc = await db
      .collection(collection)
      .doc(id)
      .get()

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
  async _query(collection, entityType, query = {}) {
    const q = this._buildQueryRef(collection, query)
    const snap = await q.get()

    return snap.docs.map(doc =>
      entityType.fromMap({ ...doc.data(), id: doc.id }),
    )
  }

  /**
   * Lists some entities from the database according to the given parameters.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {PaginationQuery} query an object that contains the pagination data.
   * @param {Query?} constraints additional constraints to be applied. Defaults to `[]`.
   * @returns {Promise<PaginationQueryResponse<T>>} an object containing the gotten entities and other data.
   */
  async _list(
    collection,
    entityType,
    { orderBy, lastDoc = null, itemsPerPage = 8, direction = 'forward' },
    constraints,
  ) {
    let query = db.collection(collection)

    if (constraints) {
      ;(constraints.orderBy ?? []).forEach(({ field, mode }) => {
        query = query.orderBy(field, mode ?? 'asc')
      })
      ;(constraints.where ?? []).forEach(({ field, operator, value }) => {
        query = query.where(field, operator, value)
      })

      if (constraints.limit) {
        query = query.limit(constraints.limit)
      }
    }

    query = query.orderBy(orderBy)

    let start = lastDoc ? lastDoc[0] : null
    let end = lastDoc ? lastDoc[1] : null

    if (direction === 'forward') {
      if (end) {
        query = query.startAfter(end)
      }

      query = query.limit(itemsPerPage)
    } else {
      if (start) {
        query = query.endBefore(start)
      }

      query = query.limitToLast(itemsPerPage)
    }

    const snap = await query.get()
    const startDoc = snap.size ? snap.docs[0].data()[orderBy] : null
    const endDoc = snap.size ? snap.docs[snap.size - 1].data()[orderBy] : null

    return {
      data: snap.docs.map(doc => new entityType({ ...doc.data(), id: doc.id })),
      startDoc,
      endDoc,
    }
  }

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
  async _createOne(collection, entityType, data) {
    const clone = { ...data }

    if (data.id) {
      delete clone.id
    }

    const entity = new entityType(clone)

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
  async _updateOne(collection, entityType, data) {
    const clone = { ...data }

    if (!data.id) {
      throw new Error('bad-request/id-not-provided')
    }

    clone.updated = getNowISOString()

    const id = data.id
    delete clone.id

    const doc = await db
      .collection(collection)
      .doc(id)
      .get()

    await doc.ref.update(clone)

    for (const key in clone) {
      if (typeof key === firebase.firestore.FieldValue) {
        delete clone[key]
      }
    }

    return entityType.fromMap({
      ...doc.data(),
      ...clone,
      id: doc.id,
    })
  }

  /**
   * Updates one or more entities according to the given query.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {Query} query the query to be used.
   * @param {Partial<T>} data the data to be set.
   * @returns {Promise<T[]>} a list with the updated entities.
   */
  async _updateQuery(collection, entityType, query, data) {
    if (!query.where.length) {
      throw new Error('no-constraints')
    }

    const entities = await this._query(collection, entityType, query)

    return Promise.all(
      entities.map(entity =>
        this._updateOne(collection, entityType, {
          ...data,
          id: entity.id,
        }),
      ),
    )
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
   * @returns the created/updated entity.
   */
  async _createOrUpdate(collection, entityType, data) {
    if (data.id) {
      return this._updateOne(collection, entityType, data)
    }

    return this._createOne(collection, entityType, data)
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
   * @param {Type<T>} entityType the entity type to be used.
   * @param {Partial<T>} data the data to be set.
   * @returns {Promise<T>} the set entity.
   */
  async _setOne(collection, entityType, data) {
    const clone = { ...data }

    const id = data.id

    if (id) {
      delete clone.id
    }

    const doc = db.collection(collection).doc(id)

    const entity = new entityType(clone)

    await doc.set(entity.toMap())

    entity.id = id
    return entity
  }

  /**
   * Soft deletes an entity, meaning it will be marked to be deleted
   * by the user itself or some administrator.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {string} id the entity id.
   * @param {string} userEmail the user that deleted the entity.
   * @returns the soft deleted entity.
   */
  async _softDeleteOne(collection, entityType, id, userEmail) {
    return this._updateOne(collection, entityType, {
      id,
      toDelete: {
        status: true,
        userEmail,
      },
    })
  }

  /**
   * Deletes an entity document from the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {string} id the id of the entity to be deleted.
   * @returns the deleted entity.
   */
  async _deleteOne(collection, entityType, id) {
    const doc = await db
      .collection(collection)
      .doc(id)
      .get()

    if (!doc.exists) {
      return null
    }

    const entity = new entityType({ ...doc.data(), id })
    await doc.ref.delete()

    return entity
  }

  /**
   * Deletes one or more entities according to the given query.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {Query} query the query to be used.
   * @returns {Promise<T[]>} a list with the deleted entities.
   */
  async _deleteQuery(collection, entityType, query) {
    if (!query.where.length) {
      throw new Error('no-constraints')
    }

    const entities = await this._query(collection, entityType, query)

    /**
     * @type {T[]}
     */
    const deleted = []

    for (const entity of entities) {
      const e = await this._deleteOne(collection, entityType, entity.id)

      deleted.push(e)
    }

    return deleted
  }

  /**
   * Restores an entity from the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {string} id the entity id.
   * @returns the restored entity.
   */
  async _restoreOne(collection, entityType, id) {
    return this._updateOne(collection, entityType, {
      id,
      toDelete: null,
    })
  }

  /**
   * Restores all entities from a collection into the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entityType the entity type to be used.
   * @param {string?} userEmail the user email.
   * @returns the restored entities.
   */
  async _restoreAll(collection, entityType, userEmail) {
    /**
     * @type {Where[]}
     */
    const where = [
      {
        field: 'toDelete.status',
        operator: '==',
        value: true,
      },
    ]

    if (userEmail) {
      where.push({
        field: 'toDelete.userEmail',
        operator: '==',
        value: userEmail,
      })
    }

    return this._updateQuery(
      collection,
      entityType,
      {
        where,
      },
      {
        toDelete: null,
      },
    )
  }

  /**
   * Deletes a file from the storage.
   *
   * @protected
   *
   * @param {string?} child the storage child path.
   */
  async _deleteFile(child) {
    if (!child) {
      return
    }

    if (child.includes('/o/')) {
      child = child.split('?alt=media')[0].split('/o/')[1]
    }

    child = decodeURIComponent(child)

    await storage
      .ref()
      .child(child)
      .delete()
  }

  /**
   * Uploads a file to the storage.
   *
   * @protected
   *
   * @param {File} file the file to be uploaded.
   * @param {string?} filename the name of the file.
   * @returns the file URL.
   */
  async _uploadFile(file, filename) {
    if (!file) {
      return null
    }

    const name = filename ?? file.name
    const type = file.type.split('/')[1]

    const result = await storage
      .ref()
      .child(`${name}.${type}`)
      .put(file)

    return result.ref.getDownloadURL()
  }

  /**
   * Builds a query based on the given parameters.
   *
   * @private
   *
   * @param {string} collection the collection name.
   * @param {Query} query the query to be set.
   * @returns a built Firebase query.
   */
  _buildQueryRef(collection, query) {
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

    return q
  }
}
