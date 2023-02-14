import { analytics } from '../api/firebase'

import { Controller } from './base.controller'
import { DataSizeController } from './data-size.controller'
import { SubjectController } from './subject.controller'

import { DataSizeEntity } from '../entities/data-size.entity'
import { QuestionEntity } from '../entities/question.entity'
import { SubjectEntity } from '../entities/subject.entity'

/**
 * @typedef {import('./base.controller').Where} Where
 */

/**
 * @typedef {import('./base.controller').Query} Query
 */

/**
 * @typedef {import('./base.controller').PaginationQuery} PaginationQuery
 */

const QUESTION_COLLECTION = 'questions'

/**
 * Defines the subject controller.
 */
const subjectController = new SubjectController()

/**
 * Defines the data size controller.
 */
const dataSizeController = new DataSizeController()

/**
 * Class that represents the question controller.
 */
export class QuestionController extends Controller {
  /**
   * Gets a question by its name.
   *
   * @param {string} name the question name.
   * @returns {Promise<QuestionEntity | null>} the found question.
   */
  async getByName(name) {
    const [question] = await this.query({
      where: [
        {
          field: 'name',
          operator: '==',
          value: name,
        },
      ],
      limit: 1,
    })

    return question ?? null
  }

  /**
   * Gets one question by its id.
   *
   * @param {string} id the question id.
   * @returns the found question.
   */
  async getOne(id) {
    return super._getOne(QUESTION_COLLECTION, QuestionEntity, id)
  }

  /**
   * Creates a question into the database.
   *
   * @param {Partial<QuestionEntity>} data the question to be created.
   * @returns an object containing the question, the new data size and the subject.
   */
  async createOne(data) {
    const question = await super._createOne(
      QUESTION_COLLECTION,
      QuestionEntity,
      data,
    )

    analytics.logEvent('create_question', {
      subject: question.subject,
      level: question.level.index,
    })

    const dataSize = await dataSizeController.getOne()

    const { general, subject } = dataSize.questions

    const updatedSize = await dataSizeController.updateOne({
      questions: {
        general: general + 1,
        subject: {
          ...subject,
          [question.subject]: (subject[question.subject] ?? 0) + 1,
        },
      },
    })

    const { subjects } = await subjectController.restoreSubjectQuestions(
      question,
    )

    return {
      question,
      dataSize: updatedSize,
      subject: subjects[0],
    }
  }

  /**
   * Updates a question according to the given data.
   *
   * @param {Partial<QuestionEntity>} data the data to be set. Must contain the id.
   * @param {Partial<QuestionEntity>?} old the data to be replaced.
   * @returns {Promise<{
   *  question: QuestionEntity,
   *  dataSize: DataSizeEntity | null,
   *  oldSubject: SubjectEntity | null,
   *  newSubject: SubjectEntity | null,
   * }>} the updated question.
   */
  async updateOne(data, old) {
    const question = await super._updateOne(
      QUESTION_COLLECTION,
      QuestionEntity,
      data,
    )

    if (
      !old ||
      ((!old.subject || old.subject === data.subject) &&
        old.level.index === data.level.index)
    ) {
      return {
        question,
        dataSize: null,
        oldSubject: null,
        newSubject: null,
      }
    }

    const {
      subject: oldSubject,
      questionRemoved,
    } = await subjectController.deleteSubjectQuestion(old)

    const { subjects } = await subjectController.restoreSubjectQuestions(data)

    const dataSize = await dataSizeController.getOne()

    const { general, subject } = dataSize.questions

    const oldSize = questionRemoved
      ? subject[old.subject] - 1
      : subject[old.subject]

    const newSize = subjects[0]
      ? subject[data.subject] + 1
      : subject[data.subject]

    const updatedSize = await dataSizeController.updateOne({
      questions: {
        general,
        subject: {
          ...subject,
          [old.subject]: oldSize,
          [data.subject]: newSize,
        },
      },
    })

    return {
      question,
      dataSize: updatedSize,
      oldSubject,
      newSubject: subjects[0] ?? null,
    }
  }

  /**
   * Lists some question from the database according to the given parameters.
   *
   * @param {PaginationQuery} query an object that contains the pagination data.
   * @returns an object containing the gotten question and other data.
   */
  async list(query) {
    return super._list(QUESTION_COLLECTION, QuestionEntity, query)
  }

  /**
   * Searches questions from the database by their name and subject.
   *
   * @param {string} query the question name query.
   * @param {string?} subject the subject name.
   * @returns the found questions.
   */
  async search(query = '', subject) {
    const field = 'name'

    /**
     * @type {Where[]}
     */
    const where = [
      {
        field,
        operator: '>=',
        value: query.toUpperCase(),
      },
    ]

    if (query) {
      where.push({
        field,
        operator: '<=',
        value: `${query.toUpperCase()}~`,
      })
    }

    if (subject) {
      where.push({ field: 'subject', operator: '==', value: subject })
    }

    return this.query({
      orderBy: [
        {
          field,
          mode: 'asc',
        },
      ],
      where,
    })
  }

  /**
   * Makes a query to get questions from the database.
   *
   * @param {Query} query the query to be used.
   * @returns the found questions.
   */
  async query(query) {
    return super._query(QUESTION_COLLECTION, QuestionEntity, query)
  }

  /**
   * Updates one or more questions according to the given query.
   *
   * @param {Query} query the query to be used.
   * @param {Partial<QuestionEntity>} data the data to be set.
   * @returns a list with the updated questions.
   */
  async updateQuery(query, data) {
    return super._updateQuery(QUESTION_COLLECTION, QuestionEntity, query, data)
  }

  /**
   * Soft deletes a question from the database, meaning it will be marked
   * to be deleted by the user itself or some administrator.
   *
   * @param {string} id the question id.
   * @param {string} userEmail the user that deleted the question.
   * @returns an object container the soft deleted question and subject.
   */
  async softDeleteOne(id, userEmail) {
    const question = await super._softDeleteOne(
      QUESTION_COLLECTION,
      QuestionEntity,
      id,
      userEmail,
    )

    const {
      subject,
      questionRemoved,
    } = await subjectController.deleteSubjectQuestion(question)

    return {
      question,
      subject,
      subjectQuestionRemoved: questionRemoved,
    }
  }

  /**
   * Restores one question from being deleted. Also, updates the question
   * subject's list to contain the restored question.
   *
   * @param {string} id the question id.
   * @returns an object container the restored question and subject.
   */
  async restoreOne(id) {
    const question = await super._restoreOne(
      QUESTION_COLLECTION,
      QuestionEntity,
      id,
    )

    const { subjects } = await subjectController.restoreSubjectQuestions(
      question,
    )

    return {
      question,
      subject: subjects[0] ?? null,
    }
  }

  /**
   * Restores all questions from the database.
   *
   * @returns an object containing a list of questions by each subject id.
   */
  async restoreAll() {
    const questions = await super._restoreAll(
      QUESTION_COLLECTION,
      QuestionEntity,
    )

    return subjectController.restoreSubjectQuestions(...questions)
  }

  /**
   * Deletes all questions from the database that are marked to deletion.
   *
   * @returns the deleted questions.
   */
  async deleteMarked() {
    const questions = await super._deleteQuery(
      QUESTION_COLLECTION,
      QuestionEntity,
      {
        where: [
          {
            field: 'toDelete.status',
            operator: '==',
            value: false,
          },
        ],
      },
    )

    for (const question of questions) {
      await super._deleteFile(question.image)
    }

    const dataSize = await dataSizeController.getOne()

    if (!dataSize || !questions.length) {
      return { questions, questionsSize: null }
    }

    const general = dataSize.questions.general

    const questionsSize = {
      general: general - questions.length,
      subject: {
        ...dataSize.questions.subject,
      },
    }

    questions.forEach(q => {
      questionsSize.subject[q.subject]--
    })

    await dataSizeController.updateOne({
      questions: questionsSize,
    })

    return { questions, questionsSize }
  }

  /**
   * Uploads an image to the storage with the given name (no ext.).
   *
   * @param {Object} data
   * @param {File} data.image the image file.
   * @param {string} data.name the file name (no ext.).
   * @returns the image URL.
   */
  async uploadImage({ image, name }) {
    return super._uploadFile(image, `questions/question-${name}`)
  }
}
