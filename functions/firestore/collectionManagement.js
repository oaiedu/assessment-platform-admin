const fs = require('fs');
const { auth, db } = require('../admin');

exports.adjustImagesUrl = async (req, res) => {
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

    res.send('Adjusted images URL!');
}

exports.adjustUsersIds = async (req, res) => {
    await auth.listUsers()
        .then(snapshot => {
            snapshot.users.forEach(async user => {
                const email = user.email;
                const uid = user.uid;

                await db.collection('users').where('email', '==', email).get()
                    .then(userDoc => {
                        userDoc.forEach(doc => {
                            db.collection('users').doc(uid).set(doc.data())
                                .then(() => {
                                    doc.ref.delete();
                                })
                                .catch(console.log);
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
        })
        .catch(error => {
            console.log(error);
        });

    res.send('Adjusted users ids!');
}

exports.deleteNonexistentReferences = async (req, res) => {
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
                                    if(image.includes('questions/') || image.includes('users/') || image.includes('documents/') || image.includes('home-background')) {

                                    } else {
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

    res.send('Deleted nonexistent references!');
}

exports.importFirestore = async (req, res) => {
    const folderRootName = 'backups';
    const timestamp = '2020-11-25T16-23-01.553Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;
    const collections = ['users', 'questions', 'question requests', 'edited questions', 'tests', 'papers'];

    collections.forEach(cn => {
        const jsonPath = `${path}/${cn}-${timestamp}.json`;
        const file = fs.readFileSync(jsonPath);
        const json = JSON.parse(file);

        console.log(cn + ': ' + json.length);

        json.forEach(doc => {
            db.collection(cn).add(doc).catch(console.log);
        });
    });

    res.send('Firestore data imported!');
}
