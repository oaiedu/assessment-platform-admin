const functions = require('firebase-functions');
const { backupFirebase } = require('./backupFirebase');

module.exports = {
    backupFirebase: functions.https.onRequest(backupFirebase)
}
