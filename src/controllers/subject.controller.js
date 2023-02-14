import { analytics } from '../api/firebase'

import { Controller } from './base.controller'

import { QuestionEntity } from '../entities/question.entity'
import { SubjectEntity } from '../entities/subject.entity'

/**
 * @typedef {import('./base.controller').Query} Query
 */

const SUBJECT_COLLECTION = 'subjects'

/**
 * Class that represents the subject controller.
 */
export class SubjectController extends Controller {
  /**
   * Gets a subject by its name
   *
   * @param {string} name the subject name.
   * @returns {Promise<SubjectEntity | null>} the found subject.
   */
  async getByName(name) {
    const [subject] = await super._query(SUBJECT_COLLECTION, SubjectEntity, {
      where: [
        {
          field: 'name',
          operator: '==',
          value: name,
        },
      ],
    })

    return subject ?? null
  }

  /**
   * Gets all subjects from the database.
   *
   * @returns a list with all subjects.
   */
  async getAll() {
    return super._getAll(SUBJECT_COLLECTION, SubjectEntity)
  }

  /**
   * Creates a new subject into the database.
   *
   * @param {Partial<SubjectEntity>} data the subject to be created.
   * @returns the created subject with its id.
   */
  async createOne(data) {
    const subject = await super._createOne(
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
    return super._deleteOne(SUBJECT_COLLECTION, SubjectEntity, id)
  }

  /**
   * Updates a subject with the given data.
   *
   * @param {Partial<SubjectEntity>} data the data to be set.
   * @returns the updated subject.
   */
  async updateOne(data) {
    return super._updateOne(SUBJECT_COLLECTION, SubjectEntity, data)
  }

  /**
   * Gets some subjects according to the given query.
   *
   * @param {Query} query the query to be used.
   * @returns a list of subjects.
   */
  async query(query) {
    return super._query(SUBJECT_COLLECTION, SubjectEntity, query)
  }

  /**
   * Updates one or more subjects according to the given query.
   *
   * @param {Query} query the query to be used.
   * @param {Partial<SubjectEntity>} data the data to be set.
   * @returns a list with the updated subjects.
   */
  async updateQuery(query, data) {
    return super._updateQuery(SUBJECT_COLLECTION, SubjectEntity, query, data)
  }

  /**
   * Removes the given question from the subject's questions list.
   *
   * @param {Partial<QuestionEntity>} question the subject question.
   * @returns {Promise<{
   *  subject: SubjectEntity | null
   *  questionRemoved: boolean
   * }>} the question subject.
   */
  async deleteSubjectQuestion(question) {
    const response = {
      subject: null,
      questionRemoved: false,
    }

    if (!question) {
      return response
    }

    const subject = await this.getByName(question.subject)
    response.subject = subject

    if (!subject) {
      return response
    }

    const questionIndex = subject.questions.findIndex(
      q => q.name === question.name,
    )

    if (questionIndex === -1) {
      return response
    }

    subject.questions.splice(questionIndex, 1)

    await this.updateOne({
      id: subject.id,
      questions: subject.questions,
    })

    response.questionRemoved = true

    return response
  }

  /**
   * Adds the given question to the subject's questions list.
   *
   * @param {Partial<QuestionEntity>[]} questions a list of questions.
   * @returns an object containing the subjects entities and the questions by subject.
   */
  async restoreSubjectQuestions(...questions) {
    const response = {
      /**
       * @type {SubjectEntity[]}
       */
      subjects: [],

      /**
       * @type {Record<string, QuestionEntity[]}
       */
      questionsBySubject: {},
    }

    if (!questions.length) {
      return response
    }

    for (const question of questions) {
      /**
       * @type {SubjectEntity}
       */
      let subject = response.subjects.find(s => s.name === question.subject)

      let hasSubject = true

      if (!subject) {
        hasSubject = false
        subject = await this.getByName(question.subject)
      }

      if (!subject) {
        continue
      }

      const subjectQuestion = subject.questions.find(
        q => q.name === question.name,
      )

      if (subjectQuestion) {
        continue
      }

      subject.questions.push({
        level: question.level.index,
        name: question.name,
      })

      subject.questions.sort((q1, q2) => (q1.name > q2.name ? 1 : -1))

      if (!hasSubject) {
        response.subjects.push(subject)
        response.questionsBySubject[subject.id] = []
      }

      response.questionsBySubject[subject.id].push(question)
    }

    for (const subject of response.subjects) {
      await this.updateOne({
        id: subject.id,
        questions: subject.questions,
      })
    }

    return response
  }
}
