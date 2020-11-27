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
    const timestamp = '2020-11-27T16-43-04.696Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;
    const collections = ['users', 'questions', 'question requests', 'edited questions', 'tests', 'papers'];

    collections.forEach(cn => {
        const jsonPath = `${path}/${cn}-${timestamp}.json`;
        const file = fs.readFileSync(jsonPath);
        const json = JSON.parse(file);
        const data = [];

        for (const key in json) {
            data.push([key, json[key]]);
        }

        console.log(cn + ': ' + json.length);

        data.forEach(doc => {
            db.collection(cn).doc(doc[0]).set(doc[1]).catch(error => console.log(error));
        });
    });

    res.send('Firestore data imported!');
}

exports.importQuestions = async (req, res) => {
    const folderRootName = 'backups';
    const timestamp = '2020-11-27T16-43-04.696Z';
    const path = `../../${folderRootName}/${timestamp}/firestore`;

    const jsonPath = `${path}/prod-questions-${timestamp}.json`;
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);
    const data = [];

    for (const key in json) {
        data.push([key, json[key]]);
    }

    db.collection('questions').get().then(snapshot => console.log(snapshot.docs.length)).catch(console.log);

    res.send('Firestore questions imported!');
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




    await Promise.all(promises);

    console.log(updatedQuestions.length);
    // updatedQuestions.forEach(doc => {
    //     recDB.collection('updated-questions').doc(doc.IQ).set(doc).catch(console.log);
    // });

    res.send('Done!');
}

exports.auxQuestions = async (req, res) => {
    const folderRootName = 'rdb-backups';
    const timestamp = '2020-11-27T16-43-04.696Z';
    const path = `../../${folderRootName}/${timestamp}`;

    // const jsonPath = `${path}/rdb-${timestamp}.json`;
    // const file = fs.readFileSync(jsonPath);
    // const json = JSON.parse(file);
    // const dataRDB = [];

    const fileBkp = fs.readFileSync('../../backups/2020-11-27T16-43-04.696Z/firestore/questions-2020-11-27T16-43-04.696Z.json');
    const jsonBkp = JSON.parse(fileBkp);
    const dataBkp = [];

    const prodTimestamp = '2020-11-25T16-23-01.553Z';
    const prodPath = `../../backups/${prodTimestamp}/firestore-prod/prod-questions.json`;
    const prodData = [];

    const fileProd = fs.readFileSync(prodPath);
    const jsonProd = JSON.parse(fileProd);

    // for (const key in jsonBkp) {
    //     // dataBkp.push([key, jsonBkp[key]]);
    // }

    // console.log('Prod length: ' + prodData.length);

    // prodData.forEach(doc => {
    //     db.collection('questions').doc(doc[0]).set(doc[1]).catch(error => console.log(error));
    // });

    const p3633 = {
        CONHECIMENTO: 'C1.12',
        DISCIPLINA: 'Transferência de Calor',
        IMAGENS: '',
        IQ: 'P3633',
        PERGUNTA: 'O conjunto turbina + gerador principal opera com 80% de carga. O trocador de calor do sistema de óleo lubrificante da turbina principal apresentava as seguintes temperaturas iniciais em regime permanente: Temperatura do óleo lubrificante na entrada do trocador (To-e) = 79ºC Temperatura do óleo lubrificante na saída do trocador (To-s) = 45ºC Temperatura da água de resfriamento na entrada do trocador (Ta-e) = 29ºC Temperatura da água de resfriamento na saída do trocador (Ta-s) = 46ºC Passaram-se seis meses de operação. O trocador de calor do sistema de óleo lubrificante da turbina principal apresenta agora as seguintes temperaturas <u>atuais</u> em regime permanente: To-e = 82ºC To-s = 48ºC Ta-e = 29ºC Ta-s = 46ºC Presuma que ao longo dos seis meses de operação as vazões e os calores específicos da água de resfriamento e do óleo lubrificante permaneceram inalteradas. Qual das seguintes situações pode ter sido responsável pela diferença observada no trocador de calor entre as temperaturas em regime permanente iniciais e atuais?',
        RELEVANCIA_OR: '2.5',
        RELEVANCIA_OSR: '2.7',
        RESPOSTAS: [
            {
                ansId: 'radio-1',
                text: 'Houve crescimento de incrustação nos tubos do trocador de calor.',
                value: true
            },
            {
                ansId: 'radio-2',
                text: 'A temperatura da fonte de água de resfriamento aumentou.',
                value: false
            },
            {
                ansId: 'radio-3',
                text: 'Aumentou a carga sobre o conjunto turbina + gerador principal.',
                value: false
            },
            {
                ansId: 'radio-4',
                text: 'Diminuiu a carga sobre o conjunto turbina + gerador principal.',
                value: false
            }
        ],
        edited: []
    }

    jsonBkp['P3633'] = p3633;

    const prodBkp = JSON.stringify(jsonBkp);

    fs.writeFileSync(`../../backups/2020-11-27T16-43-04.696Z/firestore/prod-questions-${timestamp}.json`, prodBkp);

    // for (const key in json) {
    //     dataRDB.push([key, json[key]]);
    // }

    // prodData.push(...Object.values(jsonProd));

    // const updated = prodData.map(doc => doc.PERGUNTA);

    // Promise.all(updated);

    // const data = [];
    // dataRDB.forEach(doc => {
    //     if(!updated.includes(doc[1].PERGUNTA)) {
    //         data.push(doc);
    //         console.log(doc[0]);
    //     }
    // });
    // console.log(data.length);

    // data.forEach(doc => {
    //     console.log(doc[0]);
    // });

    // data.forEach(doc => {
    //     // console.log(doc.PERGUNTA);
    //     db.collection('questions').where('PERGUNTA', '==', doc.PERGUNTA).get()
    //         .then(snapshot => {
    //             snapshot.forEach(doc => {
    //                 console.log(doc.id);
    //             });
    //         })
    //         .catch(error => console.log(error));
    // });

    // const promises = jsonBkp.map(doc => {
    //     if(doc.edited && doc.edited.length > 0) {
    //         const iq = doc.edited[0].question.split('-')[0];

    //         prodData[iq] = { ...doc, IQ: iq }
    //     } else {
    //         const question = doc.PERGUNTA;

    //         dataRDB.forEach(docRDB => {
    //             const iq = docRDB[0];

    //             if(question === docRDB[1].PERGUNTA) {
    //                 prodData[iq] = { ...doc, IQ: iq }
    //             }
    //         });
    //     }
    // });

    // await Promise.all(promises);

    // const prodTimestamp = '2020-11-25T16-23-01.553Z';
    // const prodPath = `../../backups/${prodTimestamp}/firestore-prod`;
    // const prodJson = JSON.stringify(prodData);

    // fs.mkdirSync(prodPath, { recursive: true });
    // fs.writeFileSync(`${prodPath}/prod-questions.json`, prodJson);

    // data.forEach(doc => {
    //     recDB.collection('rdb-questions').doc(doc[0]).set(doc[1])
    //         .catch(console.log);
    // });

    // await db.collection('realtime-questions').get()
    //     .then(snapshot => {
    //         console.log('Length: ' + snapshot.docs.length);
    //     }).catch(console.log);

    res.send('Aux questions created!');
}
