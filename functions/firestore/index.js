const functions = require('firebase-functions');
const {
    adjustImagesUrl,
    adjustUsersCreationDate,
    adjustUsersIds,
    auxQuestions,
    compareQuestions,
    countData,
    deleteNonexistentReferences,
    importFirestore,
    importQuestions,
    questionSubjectsIQS,
    rearrangeQuestions
} = require('./collectionManagement');
const { copyFirestore } = require('./dataCopy');

module.exports = {
    adjustImagesUrl: functions.https.onRequest(adjustImagesUrl),
    adjustUsersIds: functions.https.onRequest(adjustUsersIds),
    adjustUsersCreationDate: functions.https.onRequest(adjustUsersCreationDate),
    compareQuestions: functions.https.onRequest(compareQuestions),
    copyFirestore: functions.https.onRequest(copyFirestore),
    countData: functions.https.onRequest(countData),
    deleteNonexistentReferences: functions.https.onRequest(deleteNonexistentReferences),
    importFirestore: functions.https.onRequest(importFirestore),
    importQuestions: functions.https.onRequest(importQuestions),
    auxQuestions: functions.https.onRequest(auxQuestions),
    questionSubjectsIQS: functions.https.onRequest(questionSubjectsIQS),
    rearrangeQuestions: functions.https.onRequest(rearrangeQuestions),
}
