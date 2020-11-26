const functions = require('firebase-functions');
const {
    adjustImagesUrl,
    adjustUsersIds,
    auxQuestions,
    compareQuestions,
    importFirestore,
    importQuestions,
    deleteNonexistentReferences
} = require('./collectionManagement');
const { copyFirestore } = require('./dataCopy');

module.exports = {
    adjustImagesUrl: functions.https.onRequest(adjustImagesUrl),
    adjustUsersIds: functions.https.onRequest(adjustUsersIds),
    copyFirestore: functions.https.onRequest(copyFirestore),
    deleteNonexistentReferences: functions.https.onRequest(deleteNonexistentReferences),
    importFirestore: functions.https.onRequest(importFirestore),
    importQuestions: functions.https.onRequest(importQuestions),
    auxQuestions: functions.https.onRequest(auxQuestions),
    compareQuestions: functions.https.onRequest(compareQuestions)
}
