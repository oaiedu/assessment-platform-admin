const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

exports.moveImages = functions.https.onRequest(async (req, res) => {
    const data = [];
    await db.collection('questions').get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().IMAGENS;
                const image = decodeURIComponent(imageURL.split('?alt=media')[0].split('/o/')[1]);
                const format = `questions/question-${doc.data().IQ}`;
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
