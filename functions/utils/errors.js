const uuid = require('uuid-random');

const { getNowISOString } = require('./date');

const createLog = async (type, message, payload) => {
    const log = {
        id: uuid(),
        type,
        date: getNowISOString(),
        user: {
            id: 'firebase-functions-cloud',
            name: 'Firebase Functions',
            email: 'no@email.com'
        },
        message,
        payload
    }

    return log;
}

module.exports = {
    createLog
}
