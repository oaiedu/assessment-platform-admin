const fs = require('fs');
// const AdmZip = require('adm-zip');
const { auth, db, storage } = require('../admin');

exports.backupFirestoreAuth = async (req, res) => {
    const collections = [
        'edited questions',
        'papers',
        'question requests',
        'questions',
        'tests',
        'users'
    ];
    const now = req.query.now;
    const path = '../../backups';

    fs.mkdirSync(`${path}/${now}/firestore`, { recursive: true });

    await auth.listUsers()
        .then(snapshot => {
            const users = {}
            snapshot.users.forEach(userRecord => {
                users[userRecord.uid] = userRecord;
            });
            const jsonAuth = JSON.stringify(users);

            fs.writeFileSync(`${path}/${now}/auth-${now}.json`, jsonAuth);
        })
        .catch(error => {
            console.log(error);
        });

    const promises = collections.map(collection => {
        db.collection(collection).get()
            .then(snapshot => {
                const dbData = {}
                snapshot.forEach(doc => {
                    const id = doc.id;
                    const data = doc.data();

                    if(collection.includes('question')) {
                        if(!data.IQ) {
                            dbData[id] = {
                                ...data,
                                IQ: id
                            };
                        } else if(data.IQ.length > 0) {
                            dbData[data.IQ] = data;
                        }
                    } else {
                        dbData[id] = data;
                    }
                });

                const json = JSON.stringify(dbData);
                fs.writeFileSync(`${path}/${now}/firestore/${collection}-${now}.json`, json);
            })
            .catch(error => {
                console.log(error);
            });
    });

    Promise.all(promises);

    res.status(200).end();
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
                        })
                        .then(() => {
                            const jsonFirestore = JSON.stringify(firestoreData);
                            const fileName = `${cn}-${now}.json`;

                            fs.mkdirSync(`${path}/${folderFirestore}`, { recursive: true });
                            fs.writeFileSync(`${path}/${folderFirestore}/${fileName}`, jsonFirestore);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            });
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

                        const hasType = (type != undefined && type.length > 2 && type.length < 5);
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
                    })
                    .catch(error => {
                        console.log(error);
                    });
                });
            })
            .catch(error => {
                console.log(error);
            });

    res.send('Backup Finished!\nTimestamp: ' + now);
}
