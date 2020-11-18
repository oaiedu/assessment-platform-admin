const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const AdmZip = require('adm-zip');

admin.initializeApp();
const secondaryAdmin = admin.initializeApp(require('../.env'), 'secondaryAdmin');

const db = admin.firestore();
const storage = admin.storage().bucket();
const auth = admin.auth();

const secDB = secondaryAdmin.firestore();
const secStorage = secondaryAdmin.storage().bucket();
const secAuth = secondaryAdmin.auth();

exports.scheduleFunction = functions.pubsub.schedule('2 * * * *').onRun(async context => {
    // const data = [];

    // await db.collection('events').get()
    //     .then(snapshot => {
    //         snapshot.forEach(doc => {
    //             data.push(doc.data());
    //         });
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });

    // console.log('Finished...');
    // console.log(data);
});

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

exports.backupStorage = functions.https.onRequest(async (req, res) => {
    const folderName = 'storage-backup';
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
    res.send('Files downloaded at \'storage-backup.zip\'');
})

exports.moveEditedQuestionImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('edited questions').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().IMAGENS;
                const image = imageURL && imageURL.length > 0
                    ? decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1])
                    : undefined;
                let type = 'bmp';

                const iq = doc.id.includes('-') ? doc.id.split('-')[0] : doc.id;
                const format = `questions/question-${iq}.${type}`;

                if(image && image !== format) {
                    // await storage.file(image).move(format).catch(console.log);
                    await storage.file(format).get().then(files => {
                        files.forEach(file => {
                            const link = file.selfLink;
                            const token = file.metadata.firebaseStorageDownloadTokens;
                            if(link && token) {
                                const middle = '?alt=media&token=';
                                const newLink = link.replace('www.googleapis.com/storage/v1', 'firebasestorage.googleapis.com/v0')
                                    + middle + token;
                                db.collection('edited questions').doc(doc.id).set({...doc.data(), IMAGENS: newLink});
                                data.push({...doc.data(), IMAGENS: newLink});
                                console.log(`From: '${image}' to '${format}', available at: ${newLink}\n`);
                            }
                        });
                    });
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

exports.moveQuestionImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('questions').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().IMAGENS;
                const image = imageURL && imageURL.length > 0
                    ? decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1])
                    : undefined;
                let type = '';

                if(image && image.length > 0) {
                    const metadata = await storage.file(image).getMetadata().catch(console.log);
                    if(metadata[0].contentType) type = metadata[0].contentType.split('/')[1];
                    else {
                        const pieces = image.split('.');
                        type = pieces[pieces.length - 1];
                    }
                }

                const format = `questions/question-${iq}.${type}`;

                if(image && image !== format) {
                    await storage.file(image).move(format).catch(console.log);
                    await storage.file(format).get().then(files => {
                        files.forEach(file => {
                            const link = file.selfLink;
                            const token = file.metadata.firebaseStorageDownloadTokens;
                            if(link && token) {
                                const middle = '?alt=media&token=';
                                const newLink = link.replace('www.googleapis.com/storage/v1', 'firebasestorage.googleapis.com/v0')
                                    + middle + token;
                                db.collection('questions').doc(doc.id).set({...doc.data(), IMAGENS: newLink});
                                data.push({...doc.data(), IMAGENS: newLink});
                                console.log(`From: '${image}' to '${format}', available at: ${newLink}\n`);
                            }
                        });
                    })
                    .catch(console.log);
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

exports.moveUserImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('users').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().profileImages;
                const image = imageURL && imageURL.length > 0
                    ? decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1])
                    : undefined;
                let type = '';

                if(image && image.length > 0) {
                    const metadata = await storage.file(image).getMetadata().catch(console.log);
                    if(metadata[0].contentType) type = metadata[0].contentType.split('/')[1];
                    else {
                        const pieces = image.split('.');
                        type = pieces[pieces.length - 1];
                    }
                }

                const format = `users/${doc.id}/avatar.${type}`;

                if(image && image !== format) {
                    await storage.file(image).move(format).catch(console.log);
                    await storage.file(format).get().then(files => {
                        files.forEach(file => {
                            const link = file.selfLink;
                            const token = file.metadata.firebaseStorageDownloadTokens;
                            if(link && token) {
                                const middle = '?alt=media&token=';
                                const newLink = link.replace('www.googleapis.com/storage/v1', 'firebasestorage.googleapis.com/v0')
                                    + middle + token;
                                db.collection('users').doc(doc.id).set({...doc.data(), profileImages: newLink});
                                data.push({...doc.data(), profileImages: newLink});
                                console.log(`From: '${image}' to '${format}', available at: ${newLink}\n`);
                            }
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
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

exports.movePaperImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('papers').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().image;
                const image = imageURL && imageURL.length > 0
                    ? decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1])
                    : undefined;
                let type = '';

                if(image && image.length > 0) {
                    const metadata = await storage.file(image).getMetadata().catch(console.log);
                    if(metadata[0].contentType) type = metadata[0].contentType.split('/')[1];
                    else {
                        const pieces = image.split('.');
                        type = pieces[pieces.length - 1];
                    }
                }

                const format = `documents/document-$${doc.data().id}.${type}`;

                if(image && image !== format) {
                    await storage.file(image).move(format).catch(console.log);
                    await storage.file(format).get().then(files => {
                        files.forEach(file => {
                            const link = file.selfLink;
                            const token = file.metadata.firebaseStorageDownloadTokens;
                            if(link && token) {
                                const middle = '?alt=media&token=';
                                const newLink = link.replace('www.googleapis.com/storage/v1', 'firebasestorage.googleapis.com/v0')
                                    + middle + token;
                                db.collection('papers').doc(doc.id).set({...doc.data(), image: newLink});
                                data.push({...doc.data(), image: newLink});
                                console.log(`From: '${image}' to '${format}', available at: ${newLink}\n`);
                            }
                        });
                    });
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

exports.countData = functions.https.onRequest(async (req, res) => {
    let length = 0;

    await db.collection('users').get()
        .then(snapshot => {
            length = snapshot.docs.length;
        })
        .catch(error => {
            console.log(error);
        });

    res.send('Length: ' + length);
});

exports.adjustImagesUrl = functions.https.onRequest(async (req, res) => {
    const data = [];

    await db.collection('edited questions').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const imageUrl = doc.data().IMAGENS;

                if(imageUrl && imageUrl.length > 0) {
                    // if(!imageUrl.includes('generator-develop.appspot.com')) {
                    //     const newUrl = imageUrl.replace('generator.appspot.com', 'generator-develop.appspot.com');
                        db.collection('edited questions').doc(doc.id).set({ ...doc.data(), image: newUrl })
                            .catch(error => {
                                console.log('Set Data Error');
                                console.log(error);;
                            });
                    // }
                }
            });
        })
        .catch(error => {
            console.log(error);
        });

    res.send(data);
});

exports.copyStorage = functions.https.onRequest(async (req, res) => {
    const data = [];

    await db.listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const collectionName = collection.id;

                await secDB.collection(collectionName).get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            let imageUrl = '';

                            if(collectionName === 'questions' || collectionName === 'edited questions') {
                                imageUrl = doc.data().IMAGENS;
                            } else if(collectionName === 'users') {
                                imageUrl = doc.data().profileImages;
                            } else if(collectionName === 'papers') {
                                imageUrl = doc.data().image;
                            } else {
                                imageUrl = undefined;
                            }

                            if(imageUrl && imageUrl.length > 0) {
                                const image = decodeURIComponent(imageUrl.split('?alt=media')[0].split('/o/')[1])
                                secStorage.file(image).download().then(dlFile => {
                                    storage.file(image).save(dlFile[0])
                                        .catch(error => {
                                            console.log('Insert Error');
                                            console.log(error);
                                        });
                                })
                                .catch(error => {
                                    console.log('Download error');
                                    console.log(error);
                                });
                            }
                        });
                    })
                    .catch(error => {
                        console.log('Get Files Error');
                        console.log(error);
                    });
            });
        })
        .catch(error => {
            console.log(error);
        });

    console.log(data.length);
    res.send(data);
});

exports.copyFirestore = functions.https.onRequest(async (req, res) => {
    let counter = 0;

    await db.listCollections().then(collections => {
        collections.forEach(async collection => {
            const collectionName = collection.id;

            await secDB.collection(collectionName).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        counter++;
                        db.collection(collectionName).doc(doc.id).set(doc.data())
                            .catch(error => {
                                console.log('Remaining Error');
                                console.log(error);
                            });
                    });
                })
                .catch(error => {
                    console.log('Secondary DB Error');
                    console.log(error);
                });
        });
    })
    .catch(error => {
        console.log('DB Error');
        console.log(error);
    });

    res.send('Counter: ' + counter);
});

exports.copyAuth = functions.https.onRequest(async (req, res) => {
    const data = [];
    const secData = [];

    await secAuth.listUsers()
        .then(snapshot => {
            const users = snapshot.users;
            let counter = 0;
            users.forEach(user => {
                auth.createUser({...user});
                secData.push({...user});
                console.log(++counter);
            });
        })
        .catch(error => {
            console.log(error);
        });

    console.log("Data Length: " + data.length);
    console.log("Sec Data Length: " + secData.length);
    res.send(secData);
});

exports.deleteEditedImages = functions.https.onRequest(async (req, res) => {
    await db.collection('edited questions').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const iq = doc.id.includes('-') ? doc.id : null;

                const imageURL = doc.data().IMAGENS;
                const image = imageURL && imageURL.length > 0
                    ? decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1])
                    : undefined;

                if(iq && iq.length > 0) {
                    if(image && image.length > 0) {
                        const type = 'png';
                        const format = `questions/question-${iq}.${type}`;

                        await storage.file(format).delete().catch(console.log);
                    }
                }
            });
        })
        .catch(console.log);

    res.send('<h1 style="color: #5a5;">Done!</h1>');
});

exports.deleteNonExistingReferences = functions.https.onRequest(async (req, res) => {
    const data =[];

    await db.listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const cn = collection.id;

                if(cn === 'users' || cn === 'questions' || cn === 'edited questions' || cn === 'papers') {
                    await db.collection(cn).get()
                        .then(snapshot => {
                            snapshot.forEach(async doc => {
                                let imageUrl = '';
                                if(cn === 'users') {
                                    imageUrl = doc.data().profileImages;
                                } else if(cn === 'papers') {
                                    imageUrl = doc.data().image;
                                } else {
                                    imageUrl = doc.data().IMAGENS;
                                }

                                const image = imageUrl && imageUrl.length > 0
                                    ? decodeURIComponent(imageUrl.split('?alt=media')[0].split('/o/')[1])
                                    : undefined;

                                if(image && image.length > 0) {
                                    if(image.includes('questions/') || image.includes('users/') || image.includes('documents/')) {

                                    } else {
                                        console.log(`${cn} - ${doc.id} - ${image}`);
                                        db.collection(cn).doc(doc.id).set({ ...doc.data(), IMAGENS: '' }).catch(console.log);
                                    }
                                }
                            });
                        })
                        .catch(console.log);
                }
            })
        })
        .catch(console.log);

    res.send(data);
});

exports.deleteUnusedImages = functions.https.onRequest(async (req, res) => {
    const data = [];

    await storage.getFiles()
        .then(files => {
            files[0].forEach(async file => {
                if(file.name.includes('questions/') || file.name.includes('users/') || file.name.includes('documents/')) {

                } else {
                    await storage.file(file.name).delete().catch(console.log);
                }
            });
        })
        .catch(console.log);

    res.send(data);
})
