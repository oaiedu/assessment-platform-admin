const functions = require('firebase-functions');
const { scheduledBackup } = require('./scheduleBackup');
const { scheduledDelete } = require('./scheduleDelete');

module.exports = {
    scheduledBackup: functions.pubsub.schedule('0 0 * * *').onRun(scheduledBackup),
    scheduledDelete: functions.pubsub.schedule('0 1 * * *').onRun(scheduledDelete)
}
