import { db } from "../main";

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
   * @param {Type<T>} entity the entity to be get.
   * @returns {Promise<T[]>} a list of entities.
   */
  async getAll(collection, entity) {
    const snap = await db.collection(collection).get();

    return snap.docs.map(doc => entity.fromMap({ ...doc.data(), id: doc.id }));
  }

  /**
   * Gets an entity according to the given collection and id.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {string} id the document id.
   * @param {Type<T>} entity the entity to be get.
   * @returns {Promise<T>} the found entity.
   */
  async getOne(collection, id, entity) {
    const doc = await db
      .collection(collection)
      .doc(id)
      .get();

    var a = await this.getAll("", entity);
    a[0];

    return entity.fromMap({ ...doc.data(), id: doc.id });
  }

  /**
   * Makes a query to get data from the database.
   *
   * @template T
   * @protected
   *
   * @param {string} collection the collection name.
   * @param {Type<T>} entity the entity to be get.
   * @param {Query} query the query to be used.
   * @returns {Promise<T[]>} the found entities.
   */
  async query(collection, entity, query = {}) {
    let q = db.collection(collection);

    const { orderBy = [], where = [], limit } = query;

    orderBy.forEach(({ field, mode = "asc" }) => {
      q = q.orderBy(field, mode);
    });

    where.forEach(({ field, operator, value }) => {
      q = q.where(field, operator, value);
    });

    if (limit) {
      q = q.limit(limit);
    }

    const snap = await q.get();

    return snap.docs.map(doc => entity.fromMap({ ...doc.data(), id: doc.id }));
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
   * @param {T} entity the entity to be created.
   * @returns {Promise<T>} the created entity with its id.
   */
  async createOne(collection, entity) {
    if (entity.id) {
      delete entity.id;
    }

    const doc = await db.collection(collection).add(entity.toMap());

    return entity.constructor.fromMap({ ...entity, id: doc.id });
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
   * @param {T} entity the entity to be updated.
   * @returns {Promise<T>} the updated entity.
   */
  async updateOne(collection, entity) {
    if (!entity.id) {
      throw new Error("bad-request/id-not-provided");
    }

    const id = entity.id;
    delete entity.id;

    const doc = db
      .collection(collection)
      .doc(id)
      .update(entity.toMap());

    return entity.constructor.fromMap({ ...entity, id: doc.id });
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
   * @param {T} entity the entity to be set.
   * @returns {Promise<T>} the created/updated entity.
   */
  async createOrUpdate(collection, entity) {
    if (entity.id) {
      return this.update(collection, entity);
    }

    return this.create(collection, entity);
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
    const id = entity.id;

    if (id) {
      delete entity.id;
    }

    const doc = db
      .collection(collection)
      .doc(id)
      .set(entity.toMap());

    return entity.constructor.fromMap({ ...entity, id: doc.id });
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
      throw new Error("bad-request/id-not-provided");
    }

    await db
      .collection(collection)
      .doc(entity.id)
      .delete();

    return entity.constructor.fromMap({ ...entity });
  }
}
