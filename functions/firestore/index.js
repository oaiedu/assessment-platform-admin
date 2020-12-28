const functions = require('firebase-functions');
const {
    adjustImagesUrl,
    adjustUsersIds,
    auxQuestions,
    compareQuestions,
    countData,
    deleteNonexistentReferences,
    importFirestore,
    importQuestions,
    rearrangeQuestions
} = require('./collectionManagement');
const { copyFirestore } = require('./dataCopy');

module.exports = {
    adjustImagesUrl: functions.https.onRequest(adjustImagesUrl),
    adjustUsersIds: functions.https.onRequest(adjustUsersIds),
    compareQuestions: functions.https.onRequest(compareQuestions),
    copyFirestore: functions.https.onRequest(copyFirestore),
    countData: functions.https.onRequest(countData),
    deleteNonexistentReferences: functions.https.onRequest(deleteNonexistentReferences),
    importFirestore: functions.https.onRequest(importFirestore),
    importQuestions: functions.https.onRequest(importQuestions),
    auxQuestions: functions.https.onRequest(auxQuestions),
    rearrangeQuestions: functions.https.onRequest(rearrangeQuestions),
}
