const functions = require('firebase-functions');
const { deleteAuth, importAuth, setRole, setDefaultRoleToAll, userDefaultRole } = require('./userManagement');
const { copyAuth } = require('./dataCopy');

module.exports = {
    copyAuth: functions.https.onRequest(copyAuth),
    deleteAuth: functions.https.onRequest(deleteAuth),
    importAuth: functions.https.onRequest(importAuth),
    setRole: functions.https.onRequest(setRole),
    setDefaultRoleToAll: functions.https.onRequest(setDefaultRoleToAll),
    userDefaultRole: functions.https.onRequest(userDefaultRole)
}
