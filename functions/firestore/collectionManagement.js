const fs = require("fs");
const { auth, db } = require("../admin");

exports.adjustImagesUrl = async (req, res) => {
    await db
        .collection("edited questions")
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const imageUrl = doc.data().IMAGENS;

                if (imageUrl && imageUrl.length > 0) {
                    // if(!imageUrl.includes('generator-develop.appspot.com')) {
                    //     const newUrl = imageUrl.replace('generator.appspot.com', 'generator-develop.appspot.com');
                    db.collection("edited questions")
                        .doc(doc.id)
                        .set({ ...doc.data(), image: newUrl })
                        .catch(error => {
                            console.log("Set Data Error");
                            console.log(error);
                        });
                    // }
                }
            });
            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Adjusted images URL!");
};

exports.adjustUsersCreationDate = async (req, res) => {
    await auth
        .listUsers()
        .then(snapshot => {
            snapshot.users.forEach(async user => {
                const uid = user.uid;

                const createdAt = user.metadata.creationTime;
                const date = new Date(createdAt);

                const day = date
                    .getDate()
                    .toString()
                    .padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                const time = date.toLocaleTimeString("pt-BR");
                const milliseconds = date
                    .getMilliseconds()
                    .toString()
                    .padStart(3, "0");

                const isoString = `${year}-${month}-${day}T${time}.${milliseconds}Z`;

                await db
                    .collection("users")
                    .doc(uid)
                    .update({ created: isoString, updated: isoString })
                    .catch(error => {
                        console.log(error);
                    });
            });

            return snapshot.users;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Adjusted users creation date!");
};

exports.adjustUsersIds = async (req, res) => {
    await auth
        .listUsers()
        .then(snapshot => {
            snapshot.users.forEach(async user => {
                const email = user.email;
                const uid = user.uid;

                await db
                    .collection("users")
                    .where("email", "==", email)
                    .get()
                    .then(userDoc => {
                        userDoc.forEach(doc => {
                            db.collection("users")
                                .doc(uid)
                                .set(doc.data())
                                .then(() => {
                                    doc.ref.delete();

                                    return true;
                                })
                                .catch(console.log);
                        });

                        return userDoc;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });

            return snapshot.users;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Adjusted users ids!");
};

exports.deleteNonexistentReferences = async (req, res) => {
    await db
        .listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const cn = collection.id;

                if (cn === "users" || cn === "questions" || cn === "papers") {
                    await db
                        .collection(cn)
                        .get()
                        .then(snapshot => {
                            snapshot.forEach(async doc => {
                                let imageUrl = "";
                                if (cn === "users") {
                                    imageUrl = doc.data().profileImages;
                                } else {
                                    imageUrl = doc.data().image;
                                }

                                const image =
                                    imageUrl && imageUrl.length > 0
                                        ? decodeURIComponent(
                                              imageUrl
                                                  .split("?alt=media")[0]
                                                  .split("/o/")[1]
                                          )
                                        : undefined;

                                if (image && image.length > 0) {
                                    if (
                                        !(
                                            image.includes("questions/") ||
                                            image.includes("users/") ||
                                            image.includes("documents/") ||
                                            image.includes("home-background")
                                        )
                                    ) {
                                        if (cn === "users") {
                                            db.collection(cn)
                                                .doc(doc.id)
                                                .set({
                                                    ...doc.data(),
                                                    profileImages: ""
                                                })
                                                .catch(console.log);
                                        } else {
                                            db.collection(cn)
                                                .doc(doc.id)
                                                .set({
                                                    ...doc.data(),
                                                    image: ""
                                                })
                                                .catch(console.log);
                                        }
                                    }
                                }
                            });

                            return snapshot;
                        })
                        .catch(console.log);
                }
            });

            return collections;
        })
        .catch(console.log);

    res.send("Deleted nonexistent references!");
};

exports.importFirestore = async (req, res) => {
    const folderRootName = "backups";
    const timestamp = "2020-11-27T16-43-04.696Z";
    const path = `../../${folderRootName}/${timestamp}/firestore`;
    const collections = [
        "users",
        "questions",
        "question requests",
        "edited questions",
        "tests",
        "papers"
    ];
    // const collections = ['edited questions'];

    collections.forEach(cn => {
        const jsonPath = `${path}/${cn}-${timestamp}.json`;
        const file = fs.readFileSync(jsonPath);
        const json = JSON.parse(file);
        const data = [];

        // for (const key in json) {
        //     if(cn.includes('question')) {
        //         const toPush = {
        //             ...json[key],
        //             question: decodeURIComponent(json[key].question),
        //             subject: decodeURIComponent(json[key].subject),
        //             answers: json[key].answers.map(ans => {
        //                 return {
        //                     ...ans,
        //                     text: decodeURIComponent(ans.text)
        //                 }
        //             })
        //         }

        //         if(cn === 'question requests') {
        //             toPush.user.name = decodeURIComponent(json[key].user.name);
        //         }

        //         data.push([key, toPush]);
        //     } else if(cn.includes('papers')) {
        //         data.push([key, {
        //             image: json[key].image,
        //             description: decodeURIComponent(json[key].description),
        //             name: decodeURIComponent(json[key].name)
        //         }]);
        //     } else if(cn.includes('tests')) {
        //         data.push([key, {
        //             ...json[key],
        //             created: decodeURIComponent(json[key].created),
        //             purpose: decodeURIComponent(json[key].purpose),
        //             title: decodeURIComponent(json[key].title),
        //             user: decodeURIComponent(json[key].user)
        //         }])
        //     } else if(cn.includes('users')) {
        //         data.push([key, {
        //             email: decodeURIComponent(json[key].email),
        //             name: decodeURIComponent(json[key].name),
        //             profileImages: json[key].profileImages
        //         }])
        //     } else {
        //         data.push([key, json[key]]);
        //     }
        // }

        for (const key in json) {
            if (cn.includes("question")) {
                const toPush = {
                    ...json[key]
                };

                data.push([key, toPush]);
            } else if (cn.includes("papers")) {
                data.push([
                    key,
                    {
                        image: json[key].image,
                        description: json[key].description,
                        name: json[key].name
                    }
                ]);
            } else if (cn.includes("tests")) {
                data.push([
                    key,
                    {
                        ...json[key],
                        created: json[key].created,
                        purpose: json[key].purpose,
                        title: json[key].title,
                        user: json[key].user
                    }
                ]);
            } else if (cn.includes("users")) {
                data.push([
                    key,
                    {
                        email: json[key].email,
                        name: json[key].name,
                        profileImages: json[key].profileImages
                    }
                ]);
            } else {
                data.push([key, json[key]]);
            }
        }

        data.forEach(doc => {
            db.collection(cn)
                .doc(doc[0])
                .set(doc[1])
                .catch(error => console.log(error));
        });
    });

    res.send("Firestore data imported!");
};

exports.rearrangeQuestions = async (req, res) => {
    const cn = "edited questions";
    await db
        .collection(cn)
        .get()
        .then(snapshot => {
            console.log(snapshot.docs.length);
            snapshot.forEach(doc => {
                const data = doc.data();
                const newData = {
                    iq: data.iq || data.IQ || doc.id,
                    created: data.created || null,
                    updated: data.updated || null,
                    question: data.question || data.PERGUNTA,
                    subject: data.subject || data.DISCIPLINA,
                    knowledge: data.knowledge || data.CONHECIMENTO,
                    knowledgePWR: data.knowledgePWR || data.RELEVANCIA_OR,
                    knowledgeBWR: data.knowledgeBWR || data.RELEVANCIA_OSR,
                    answers: data.answers || data.RESPOSTAS,
                    image: data.image || data.IMAGENS || "",
                    imageSize: data.imageSize || data.TAMANHO_IMAGEM || "1x",
                    edited: data.edited || []
                };

                doc.ref.set(newData);
            });

            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Done!");
};

exports.countData = async (req, res) => {
    const collections = [
        "users",
        "questions",
        "question-requests",
        "tests",
        "papers"
    ];
    // const collections = ['question-requests'];
    const data = {};
    const questionsCounter = {
        general: 0,
        subject: {
            "Teoria do Reator": 0,
            Termodinâmica: 0,
            "Instrumentação e Controle": 0,
            "Válvulas e Bombas": 0,
            Eletricidade: 0,
            "Mecânica dos Fluidos": 0,
            "Tratamento Qúimico Refrigerante": 0,
            "Análise Integrada": 0,
            "Instrumentação Nuclear": 0,
            "Física Nuclear": 0,
            "Transferência de Calor": 0,
            Materiais: 0
        }
    };

    const qRequestCounter = {
        general: 0,
        users: {}
    };

    const promises = collections.map(collection => {
        return db
            .collection(collection)
            .get()
            .then(snapshot => {
                if (collection === "questions") {
                    questionsCounter.general = snapshot.docs.length;
                    snapshot.forEach(doc => {
                        if (doc.data().subject) {
                            questionsCounter.subject[doc.data().subject] += 1;
                        } else {
                            questionsCounter.subject[
                                doc.data().DISCIPLINA
                            ] += 1;
                        }
                    });
                    data["questions"] = questionsCounter;
                } else if (collection === "question-requests") {
                    qRequestCounter.general = snapshot.docs.length;
                    snapshot.forEach(doc => {
                        if (qRequestCounter.users[doc.data().user.email]) {
                            qRequestCounter.users[doc.data().user.email] += 1;
                        } else {
                            qRequestCounter.users[doc.data().user.email] = 1;
                        }
                    });
                    data["question-requests"] = qRequestCounter;
                } else {
                    data[collection] = snapshot.docs.length;
                }

                data["testsByWeek"] = {
                    "2021-06-27": 0,
                    "2021-07-04": 0,
                    "2021-07-11": 0,
                    "2021-07-18": 0,
                    "2021-07-25": 0
                };

                return snapshot;
            })
            .catch(error => {
                console.log(error);
            });
    });

    await Promise.all(promises);

    await db
        .collection("data-size")
        .add(data)
        .catch(error => {
            console.log(error);
        });

    res.send(data);
};

exports.questionSubjectsIQS = async (req, res) => {
    const subjects = {
        "Teoria do Reator": [],
        Termodinâmica: [],
        "Instrumentação e Controle": [],
        "Válvulas e Bombas": [],
        Eletricidade: [],
        "Mecânica dos Fluidos": [],
        "Tratamento Qúimico Refrigerante": [],
        "Análise Integrada": [],
        "Instrumentação Nuclear": [],
        "Física Nuclear": [],
        "Transferência de Calor": [],
        Materiais: []
    };

    await db
        .collection("questions")
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                subjects[doc.data().subject].push(doc.data().iq);
            });

            return subjects;
        })
        .catch(error => {
            console.log(error);
        });

    for (let key in subjects) {
        await db
            .collection("question-subjects")
            .add({ name: key, questions: subjects[key] })
            .catch(error => {
                console.log(error);
            });
    }

    res.send(subjects);
};
