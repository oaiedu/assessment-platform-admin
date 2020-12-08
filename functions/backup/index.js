const functions = require('firebase-functions');
const { backupFirebase, backupFirestoreAuth } = require('./backupFirebase');

module.exports = {
    backupFirebase: functions.https.onRequest(backupFirebase),
    backupFirestoreAuth: functions.https.onRequest(backupFirestoreAuth)
}
