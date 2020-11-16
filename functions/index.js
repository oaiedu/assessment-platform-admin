const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const AdmZip = require('adm-zip');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();
const auth = admin.auth();

exports.backupAuth = functions.https.onRequest(async (req, res) => {
    const fileName = 'auth.json';
    const folderName = 'auth-backup';
    const path = `../../${folderName}`;

    await auth.listUsers()
        .then(snapshot => {
            const json = JSON.stringify(snapshot.users);

            fs.mkdirSync(path, { recursive: true });
            fs.writeFileSync(`${path}/${fileName}`, json);
        })
        .catch(error => {
            console.log(error);
        });
    res.send('Data wrote into \'' + fileName + '\'');
});

exports.backupFirestore = functions.https.onRequest(async (req, res) => {
    const collection = 'question requests';
    const fileName = collection + '.json';
    const folderName = 'firestore-backup';
    const path = `../../${folderName}`;

    const data = [];

    await db.collection(collection).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
        })
        .then(() => {
            const json = JSON.stringify(data);

            fs.mkdirSync(path, { recursive: true });
            fs.writeFileSync(`${path}/${fileName}`, json);
        })
        .catch(error => {
            console.log(error);
        });
    res.send('Data wrote into \'' + fileName + '\'');
});

exports.moveImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('questions').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().IMAGENS;
                const image = decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1]);
                let type = '';
                if(image && image.length > 0) {
                    const pieces = image.split('.');
                    type = pieces[pieces.length - 1];
                    type = type && type.length > 2 && type.length < 5 ? type : 'jpeg';
                }
                const format = `questions/question-${doc.data().IQ}.${type}`;
                if(image && image !== format) {
                    storage.file(image).move(format);
                    await storage.file(format).get().then(files => {
                        files.forEach(file => {
                            const link = file.selfLink;
                            const token = file.metadata.firebaseStorageDownloadTokens;
                            if(link && token) {
                                const middle = '?alt=media&token=';
                                const newLink = link.replace('www.googleapis.com/storage/v1', 'firebasestorage.googleapis.com/v0')
                                    + middle + token;
                                db.collection('questions').doc(doc.id).set({...doc.data(), IMAGENS: newLink});
                                console.log(`From: '${image}' to '${format}', available at: ${newLink}\n`);
                            }
                        });
                    });
                    data.push({...doc.data(), IMAGENS: newLink});
                } else {
                    data.push(doc.data());
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    res.send(data);
});

exports.compressFiles = functions.https.onRequest(async (req, res) => {
    const folderName = 'storage-backup';
    const collection = 'users';
    let counter = 0;

    await storage.getFiles().then(files => {
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
                const path = '../../' + folderName;

                fs.mkdirSync(`${path}/${imagePath}`, { recursive: true });
                fs.writeFileSync(`${path}/${format}`, dlFile[0]);

                const zip = new AdmZip();
                zip.addLocalFolder(path);
                fs.mkdirSync('../../storage-bkp', { recursive: true });
                fs.writeFileSync(`../../storage-bkp/storage.zip`, zip.toBuffer());

                counter++;
                if(counter === files.length - 1) {
                    console.log("Finished...");
                    fs.rmdir(path, { recursive: true }, (err) => {
                        if(err) {
                            return console.log(err);
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
        });
    })
    .catch(error => {
        console.log(error);
    });

    // await db.collection(collection).get()
    //     .then(snapshot => {
    //         snapshot.forEach(doc => {
    //             const imageURL = collection === 'users'
    //                 ? doc.data().profileImages
    //                 : (collection === 'questions' || collection === 'edited questions'
    //                     ? doc.data().IMAGENS
    //                     : doc.data().image);

    //             if(imageURL && imageURL.length > 0) {
    //                 const image = decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1]);
    //                 storage.file(image).download().then(file => {
    //                     const pieces = image.split('.');
    //                     let type = pieces[pieces.length - 1];

    //                     const hasType = (type != undefined && type.length > 2 && type.length < 5);
    //                     type = hasType ? type : 'jpeg';

    //                     const format = image + (hasType ? '' : `.${type}`);
    //                     const imageType = collection !== 'papers' ? collection : 'documents'
    //                     const path = '../../' + folderName;

    //                     // const userId = collection === 'users'
    //                     //     && format.includes(`avatar.${type}`)
    //                     //         ? format.split('users')[1].split('/avatar.' + type)[0]
    //                     //         : '';

    //                     const userId = '';

    //                     fs.mkdirSync(`${path}/${imageType + userId}`, { recursive: true });
    //                     fs.writeFileSync(`${path}/${format}`, file[0]);

    //                     const zip = new AdmZip();
    //                     zip.addLocalFolder(`${path}/${imageType}`);
    //                     fs.mkdirSync('../../storage-bkp-dev', { recursive: true });
    //                     fs.writeFileSync(`../../storage-bkp-dev/${imageType}.zip`, zip.toBuffer());

    //                     counter++;
    //                     if(counter === 50) {
    //                         console.log('50');
    //                     }
    //                     if(counter === snapshot.docs.length - 1) {

    //                         fs.rmdir(path, { recursive: true }, (err) => {
    //                             if(err) {
    //                                 return console.log(err);
    //                             }
    //                         });
    //                     }
    //                 })
    //                 .catch(error => {
    //                     console.log(error);
    //                 });
    //             }
    //         });
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });
    res.send('Files downloaded at \'storage-backup.zip\'');
})
