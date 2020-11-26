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
    const timestamp = '2020-11-26T17-32-39.212Z';
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

exports.importQuestions = async (req, res) => {
    const folderRootName = 'backups';
    const timestamp = '2020-11-26T17-32-39.212Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;

    const jsonPath = `${path}/questions-${timestamp}.json`;
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);

    // console.log(cn + ': ' + json.length);

    // await db.collection('questions').get()
    //     .then(snapshot => {
    //         console.log('Len: ' + snapshot.docs.length);
    //     }).catch(console.log);
    // json.forEach(doc => {
    //     if(doc.IMAGENS && doc.IMAGENS.length > 0) {
    //         const imageName = decodeURIComponent(doc.IMAGENS.split('?alt=media')[0].split('/o/')[1]);
    //         if(imageName.includes('vaso')) {
    //             // console.log(imageName.split('_')[0]);
    //             console.log(imageName.split(' ')[1].split('.')[0].replace('p', 'P'));
    //             db.collection('questions').doc(imageName.split(' ')[1].split('.')[0].replace('p', 'P')).set(doc).catch(console.log);

    //         }
    //     }
    // });

    res.send('Firestore data imported!');
}

exports.compareQuestions = async (req, res) => {
    const auxQuestions = [];
    const iqs = [];
    const updatedQuestions = [];
    const subjects = [
        "Teoria do Reator",
        "Termodinâmica",
        "Instrumentação e Controle",
        "Válvulas e Bombas",
        "Eletricidade",
        "Mecânica dos Fluidos",
        "Tratamento Qúimico Refrigerante",
        "Análise Integrada",
        "Instrumentação Nuclear",
        "Física Nuclear",
        "Transferência de Calor",
        "Materiais"
    ]

    await db.collection('questions').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                auxQuestions.push(doc.data());
            });
        })
        .catch(console.log);

    const promises = subjects.map(async sbj => {
        return await db.collection('realtime-questions').where('DISCIPLINA', '==', sbj).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const iq = doc.id;
                    const klg = doc.data().CONHECIMENTO;

                    auxQuestions.forEach(question => {
                        if(question.CONHECIMENTO === klg
                            && question.DISCIPLINA === sbj
                            && !iqs.includes(iq)) {
                            iqs.push(iq);
                            updatedQuestions.push({ ...question, IQ: iq });
                        }
                    });
                });
            })
            .catch(console.log);
        });

        await Promise.all(promises);

        console.log(updatedQuestions.length);
        updatedQuestions.forEach(doc => {
            db.collection('updated-questions').add(doc).catch(console.log);
        });

    res.send('Done!');
}

exports.auxQuestions = async (req, res) => {
    const folderRootName = 'backups';
    const timestamp = '2020-11-26T17-32-39.212Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;

    const jsonPath = `${path}/questions-${timestamp}.json`;
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);


    // json.forEach(doc => {
    //     db.collection('aux-questions').add(doc).catch(console.log);
    // });

    // await db.collection('realtime-questions').get()
    //     .then(snapshot => {
    //         console.log('Length: ' + snapshot.docs.length);
    //     }).catch(console.log);

    await db.collection('edited questions').where('IQ', '==', 'testquestion-1').get()
        .then(snapshot => {
            snapshot.forEach(doc => console.log(doc.id));
        })
        .catch(console.log);

    res.send('Aux questions created!');
}
