const functions = require('firebase-functions');
const { scheduledBackup } = require('./scheduleBackup');

module.exports = {
    scheduledBackup: functions.pubsub.schedule('0 0 * * *').onRun(scheduledBackup)
}
