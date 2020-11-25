const functions = require('firebase-functions');
const { scheduleFunction } = require('./scheduleBackup');

module.exports = {
    scheduleFunction: functions.pubsub.schedule('2 * * * *').onRun(scheduleFunction)
}
