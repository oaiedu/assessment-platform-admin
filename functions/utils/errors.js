const uuid = require('uuid-random');

const { getNowISOString } = require('./date');

const createLog = (type, message, payload) => {
    const id = uuid();
    const date = getNowISOString();
    const user = {
        id: 'firebase-functions-cloud',
        name: 'Firebase Functions',
        email: 'no@email.com'
    }

    const log = {
        id,
        type,
        date,
        user,
        message,
        payload
    }

    return log;
}

module.exports = {
    createLog
}
