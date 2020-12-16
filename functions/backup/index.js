const functions = require('firebase-functions');

const {
    backupFirebase,
    backupFirestoreAuth,
    deleteBackup,
    downloadBackup,
    testAPI
} = require('./backupFirebase');

module.exports = {
    backupFirebase: functions.https.onRequest(backupFirebase),
    backupFirestoreAuth: functions.https.onRequest(backupFirestoreAuth),
    deleteBackup: functions.https.onRequest(deleteBackup),
    downloadBackup: functions.https.onRequest(downloadBackup),
    testAPI: functions.https.onRequest(testAPI)
}
