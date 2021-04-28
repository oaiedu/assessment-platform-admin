const functions = require('firebase-functions');
const { scheduledBackup } = require('./scheduleBackup');
const { scheduledDelete } = require('./scheduleDelete');

module.exports = {
    scheduledBackup: functions.pubsub.schedule('0 0 * * 0').timeZone('America/Sao_Paulo').onRun(scheduledBackup),
    scheduledDelete: functions.pubsub.schedule('0 0 5 * *').timeZone('America/Sao_Paulo').onRun(scheduledDelete)
}
