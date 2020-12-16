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
    const timestamp = '2020-12-09T19-40-40.732Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;
    const collections = ['users', 'questions', 'question requests', 'edited questions', 'tests', 'papers'];
    // const collections = ['users'];

    collections.forEach(cn => {
        const jsonPath = `${path}/${cn}-${timestamp}.json`;
        const file = fs.readFileSync(jsonPath);
        const json = JSON.parse(file);
        const data = [];

        for (const key in json) {
            if(cn.includes('question')) {
                const toPush = {
                    ...json[key],
                    PERGUNTA: decodeURIComponent(json[key].PERGUNTA),
                    DISCIPLINA: decodeURIComponent(json[key].DISCIPLINA),
                    RESPOSTAS: json[key].RESPOSTAS.map(ans => {
                        return {
                            ...ans,
                            text: decodeURIComponent(ans.text)
                        }
                    })
                }

                if(cn === 'question requests') {
                    toPush.NOME = decodeURIComponent(json[key].NOME);
                }

                data.push([key, toPush]);
            } else if(cn.includes('papers')) {
                data.push([key, {
                    image: json[key].image,
                    description: decodeURIComponent(json[key].description),
                    name: decodeURIComponent(json[key].name)
                }]);
            } else if(cn.includes('tests')) {
                data.push([key, {
                    ...json[key],
                    created: decodeURIComponent(json[key].created),
                    purpose: decodeURIComponent(json[key].purpose),
                    title: decodeURIComponent(json[key].title),
                    user: decodeURIComponent(json[key].user)
                }])
            } else if(cn.includes('users')) {
                data.push([key, {
                    email: decodeURIComponent(json[key].email),
                    name: decodeURIComponent(json[key].name),
                    profileImages: json[key].profileImages
                }])
            } else {
                data.push([key, json[key]]);
            }
        }

        data.forEach(doc => {
            db.collection(cn).doc(doc[0]).set(doc[1]).catch(error => console.log(error));
        });
    });

    res.send('Firestore data imported!');
}
