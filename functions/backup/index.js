const functions = require('firebase-functions');
const { backupFirebase, backupUsers } = require('./backupFirebase');

module.exports = {
    backupFirebase: functions.https.onRequest(backupFirebase),
    backupUsers: functions.https.onRequest(backupUsers)
}
