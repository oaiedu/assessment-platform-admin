const path = require('path');
const os = require('os');
const fs = require('fs');
const { Readable } = require('stream');

const AdmZip = require('adm-zip');
const { google } = require('googleapis');

const { auth, db, storage } = require('../admin');
const { serviceAccount } = require('../.env');
const { getNowISOString } = require('../utils/date');

exports.downloadBackup = async (req, res) => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );

    const drive = google.drive({ version: 'v3', auth: jwtClient });
    const zip = new AdmZip();

    const fileId = req.query.id;

    const filePath = path.join(os.tmpdir(), `${fileId}.zip`);

    await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then(async response => {
            const dest = fs.createWriteStream(filePath);

            await response.data
                .on('end', () => {
                    setTimeout(async () => {
                        zip.addLocalFile(filePath);

                        const data = zip.getEntries()[0].getData();

                        res.append('Access-Control-Allow-Origin', '*');
                        res.send({ backup: data.toString('base64') });
                    }, 1000);
                })
                .on('error', err => {
                    console.log('Error downloading file: ', err);
                    res.send({ backup: null, error: err });
                })
                .pipe(dest);

            return true;
        })
        .catch(error => console.log(error));
}

exports.deleteBackup = async (req, res) => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );

    const dv3 = google.drive({ version: 'v3', auth: jwtClient });

    const fileId = req.query.id;
    let deleted = false;

    dv3.files.delete({
        fileId
    }, (error, response) => {
        if(error) console.log(error);
        else {
            deleted = true;
        }

        res.append('Access-Control-Allow-Origin', '*');
        res.send({ deleted });
    });

}

exports.testAPI = async (req, res) => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );

    const dv3 = google.drive({ version: 'v3', auth: jwtClient });

    dv3.files.list({}, (error, response) => {
        if(error) console.log(error);
        else {
            response.data.files.forEach(file => {
                console.log(file.name + ' - ' + file.id);
            });
        }

        res.append('Access-Control-Allow-Origin', '*');
        res.send('Ok');
    });
}

exports.backupFirestoreAuth = async (req, res) => {
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );

    const dv3 = google.drive({ version: 'v3', auth: jwtClient });

    const zip = new AdmZip();

    const collections = [];

    await db.listCollections().then(colls => {
        colls.forEach(async collection => {
            collections.push(collection.id);
        });
    });

    const now = req.query.now;

    let size = 0;

    await auth.listUsers()
        .then(snapshot => {
            const users = {}
            snapshot.users.forEach(userRecord => {
                users[userRecord.uid] = userRecord;
            });
            const jsonAuth = JSON.stringify(users);

            zip.addFile(`auth-${now}.json`, jsonAuth);
            size += encodeURI(jsonAuth).split(/%..|./).length - 1;

            return jsonAuth;
        })
        .catch(error => {
            console.log(error);
        });

    const promises = collections.map(async collection => {
        return db.collection(collection).get()
            .then(snapshot => {
                const dbData = {}
                snapshot.forEach(doc => {
                    const id = doc.id;
                    const data = doc.data();

                    if(collection.includes('question')) {
                        if (collections !== 'question-subjects') {
                            dbData[id] = {
                                ...data,
                            };
                            if(!data.IQ) {
                                dbData[id] = {
                                    ...dbData[id],
                                    IQ: id
                                }
                            }
                        } else {
                            dbData[id] = {
                                ...data
                            }
                        }
                    } else {
                        dbData[id] = data;
                    }
                });
                const json = encodeURI(JSON.stringify(dbData));

                zip.addFile(`db-${collection}-${now}.json`, json);
                size += json.split(/%..|./).length - 1;

                return json;
            })
            .catch(error => {
                console.log(error);
            });
    });

    await Promise.all(promises);

    if(size < 1024) size = size + ' B';
    else if(size < 1048576) size = (size / 1024).toFixed(2) + ' KB';
    else if(size < 1073741824) size = (size / 1048576).toFixed(2) + ' MB';
    else size = (size / 1073741824).toFixed(2) + ' GB';

    const zipFileName = `backup-${now}.zip`;
    const contentType = 'application/zip';

    const file = await dv3.files.create({
        requestBody: {
            name: zipFileName,
            mimeType: contentType
        },
        media: {
            mimeType: contentType,
            body: Readable.from(zip.toBuffer())
        }
    });

    res.append('Access-Control-Allow-Origin', '*');
    res.send({ endDate: getNowISOString(), size, cloudId: file.data.id });
}

exports.backupFirebase = async (req, res) => {
    const now = new Date().toISOString().replace(/:/g, '-');
    const fileNameAuth = `auth-${now}.json`;
    const folderRootName = 'backups';
    const folderFirestore = 'firestore';
    const folderStorage = 'storage';
    const path = `../../${folderRootName}/${now}`;

    await auth.listUsers()
        .then(snapshot => {
            const users = {}
            snapshot.users.forEach(userRecord => {
                users[userRecord.uid] = userRecord;
            });
            const jsonAuth = JSON.stringify(users);

            fs.mkdirSync(path, { recursive: true });
            fs.writeFileSync(`${path}/${fileNameAuth}`, jsonAuth);

            return jsonAuth;
        })
        .catch(error => {
            console.log(error);
        });

    await db.listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const cn = collection.id;
                const firestoreData = {};

                if(cn !== 'aux-questions' && cn !== 'realtime-questions') {
                    await db.collection(cn).get()
                        .then(snapshot => {
                            snapshot.forEach(doc => {
                                if(cn.includes('question') && !doc.data().IQ) {
                                    firestoreData[doc.id] = {
                                        ...doc.data(),
                                        IQ: doc.id
                                    };
                                } else if(cn.includes('question') && doc.data().IQ && doc.data().IQ.length > 0) {
                                    firestoreData[doc.data().IQ] = doc.data();
                                } else {
                                    firestoreData[doc.id] = doc.data();
                                }
                            });

                            return firestoreData;
                        })
                        .then(() => {
                            const jsonFirestore = JSON.stringify(firestoreData);
                            const fileName = `${cn}-${now}.json`;

                            fs.mkdirSync(`${path}/${folderFirestore}`, { recursive: true });
                            fs.writeFileSync(`${path}/${folderFirestore}/${fileName}`, jsonFirestore);

                            return jsonFirestore;
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            });

            return collections;
        })
        .catch(console.log);

        await storage.getFiles()
            .then(files => {
                files[0].forEach(file => {

                    storage.file(file.name).download().then(dlFile => {
                        const image = file.name;
                        let imagePath = '';
                        let imageFile = '';
                        if(image.includes('/')) {
                            const slashSplit = image.split('/');
                            const imageName = slashSplit[slashSplit.length - 1];
                            imageFile = imageName;
                            imagePath = image.split(imageName)[0];

                        } else {
                            imageFile = image;
                        }
                        const pieces = image.split('.');
                        let type = pieces[pieces.length - 1];

                        const hasType = (type !== undefined && type.length > 2 && type.length < 5);
                        type = hasType ? type : 'jpeg';

                        const format = imagePath + imageFile + (hasType ? '' : `.${type}`);

                        fs.mkdirSync(`${path}/${folderStorage}/${imagePath}`, { recursive: true });
                        fs.writeFileSync(`${path}/${folderStorage}/${format}`, dlFile[0]);

                        // const zip = new AdmZip();
                        // zip.addLocalFolder(path);
                        // fs.mkdirSync('../../storage-bkp', { recursive: true });
                        // fs.writeFileSync(`../../storage-bkp/storage.zip`, zip.toBuffer());

                        // counter++;
                        // if(counter === files.length - 1) {
                        //     console.log("Finished...");
                        //     fs.rmdir(path, { recursive: true }, (err) => {
                        //         if(err) {
                        //             return console.log(err);
                        //         }
                        //     });
                        // }

                        return format;
                    })
                    .catch(error => {
                        console.log(error);
                    });
                });

                return files;
            })
            .catch(error => {
                console.log(error);
            });

    res.send('Backup Finished!\nTimestamp: ' + now);
}
