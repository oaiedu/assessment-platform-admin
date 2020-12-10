const functions = require('firebase-functions');
const { deleteAuth, importAuth, setAdminRole, userDefaultRole } = require('./userManagement');
const { copyAuth } = require('./dataCopy');

module.exports = {
    copyAuth: functions.https.onRequest(copyAuth),
    deleteAuth: functions.https.onRequest(deleteAuth),
    importAuth: functions.https.onRequest(importAuth),
    setAdminRole: functions.https.onRequest(setAdminRole),
    userDefaultRole: functions.https.onRequest(userDefaultRole)
}
