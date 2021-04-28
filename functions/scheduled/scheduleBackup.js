const axios = require('axios');

const { db, projectId } = require('../admin');

const { getNowISOString } = require('../utils/date');
const { createLog } = require('../utils/errors');

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

    const url = `https://us-central1-${projectId}.cloudfunctions.net/backup-backupFirestoreAuth?now=${now.replace(/:/g, '-')}`

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
            bkp.end = getNowISOString();
            bkp.cloudId = res.data.cloudId;
        })
        .catch(error => {
            createErrorLog('Automatic Backup', error.message, { url, projectId });
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

            bkp.id = 'ab' + (bkpId >= 1000 ? bkpId : bkpId.toString().padStart(4, '0'));
            bkp.start = now;
            bkp.month = months[new Date(bkp.start).getMonth() + 1].substr(0, 3);

            db.collection('backups').add(bkp)
                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            createErrorLog('Backup DB Insert', error.message, { bkp });
        });
}
