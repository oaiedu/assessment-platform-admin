const { google } = require('googleapis');

const { db } = require('../admin');
const { serviceAccount } = require('../.env');

const { createLog } = require('../utils/errors');

exports.scheduledDelete = async () => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );

    const dv3 = google.drive({ version: 'v3', auth: jwtClient });

    const createErrorLog = async (type, message, payload) => {
        const log = createLog(type, message, payload);

        await db.collection('logs').add(log)
            .catch(error => {
                console.log(error);
            });
    }

    const today = new Date();
    today.setMonth(today.getMonth() - 2);
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const belowDate = `${year}-${month}-01`;

    const backupsIds = [];

    await db.collection('backups').orderBy('start').where('start', '<', belowDate).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                backupsIds.push(doc.data().cloudId);
                doc.ref.delete();
            });
        })
        .catch(error => {
            createErrorLog('Automatic Backup Delete', error.message, { belowDate, backupsIds });
        });

    backupsIds.forEach(fileId => {
        dv3.files.delete({
            fileId
        }, error => {
            if(error) {
                console.log(error);
            }
        });
    });

    await db.collection('logs').orderBy('date').where('date', '<', belowDate).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                doc.ref.delete();
            });
        })
        .catch(error => {
            createErrorLog('Automatic Logs Delete', error.message, { belowDate });
        })
}
