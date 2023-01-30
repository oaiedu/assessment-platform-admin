import { SubjectEntity } from '../entities/subject.entity'
import { Controller } from './base.controller'

const SUBJECT_COLLECTION = 'subjects'

/**
 * Class that represents the subject controller.
 */
export class SubjectController extends Controller {
  /**
   * Gets all subjects from the database.
   *
   * @returns a list with all subjects.
   */
  async getAll() {
    return super.getAll(SUBJECT_COLLECTION, SubjectEntity)
  }

  /**
   * Creates a new subject into the database.
   *
   * @param {Partial<SubjectEntity>} data the subject to be created.
   * @returns the created subject with its id.
   */
  async createOne(data) {
    const subject = await super.createOne(
      SUBJECT_COLLECTION,
      SubjectEntity,
      data,
    )

    analytics.logEvent('create_subject', {
      name: subject.name,
    })

    return subject
  }

  /**
   * Deletes a subject according to the given id.
   *
   * @param {string} id the subject id.
   * @returns the deleted entity.
   */
  async deleteOne(id) {
    return super.deleteOne(SUBJECT_COLLECTION, SubjectEntity, id)
  }
}
