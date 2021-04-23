const axios = require('axios');

const { db } = require('../admin');

const { getNowISOString } = require('../utils/date');
const { createLog } = require('../utils/error');

const months = {
    '1': 'Janeiro',
    '2': 'Fevereiro',
    '3': 'Março',
    '4': 'Abril',
    '5': 'Maio',
    '6': 'Junho',
    '7': 'Julho',
    '8': 'Agosto',
    '9': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro'
};

exports.scheduledBackup = async context => {
    const now = getNowISOString();

    const createErrorLog = async (type, message, payload) => {
        const log = createLog(type, message, payload);

        await db.collection('logs').add(log)
            .catch(error => {
                console.log(error);
            });
    }

    let url = '';

    if (context && context.name && context.name.includes('stage-pwr-quiz-generator')) {
        url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
    } else {
        url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
    }

    const bkp = {
        id: '',
        size: '',
        start: '',
        end: '',
        cloudId: '',
        month: ''
    }

    await axios.get(url)
        .then(res => {
            bkp.size = res.data.size;
            bkp.end = res.data.endDate;
            bkp.cloudId = res.data.cloudId;
        })
        .catch(error => {
            createErrorLog('Automatic Backup', error.message, { url });
        });

    db.collection('backups').get()
        .then(snapshot => {
            let lastBkpId;
            let bkpId;

            if(snapshot.docs.length > 0) {
                snapshot.forEach(doc => {
                    const id = parseInt(doc.data().id.substr(3, 4));
                    if(!lastBkpId) {
                        lastBkpId = id;
                    } else {
                        if(id > lastBkpId) {
                            lastBkpId = id;
                        }
                    }
                });

                bkpId = lastBkpId + 1;
            } else bkpId = 1;

            const formatDate = (date) => {
                const month = new Date(date).getMonth() + 1;

                const dateTime = new Date(date).toString();
                const sub = dateTime.substr(7, 17);
                const monthName = months[month].substr(0, 3);

                return monthName + sub;
            }

            bkp.id = 'ab' + (bkpId >= 1000 ? bkpId : bkpId.toString().padStart(4, '0'));
            bkp.start = formatDate(now);
            bkp.end = formatDate(bkp.end);
            bkp.month = bkp.start.substr(0, 3);

            db.collection('backups').add(bkp)
                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            createErrorLog('Backup DB Insert', error.message, { bkp });
        });
}
