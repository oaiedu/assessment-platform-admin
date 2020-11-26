import { db, storage } from '../../main';

const initialState = () => ({
    deleteQuestionId: null,
    loadedQuestions: [],
    subjects: [
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
});

const state = initialState();

const mutations = {
    setLoadedQuestions(state, payload) {
        state.loadedQuestions = payload;
    },
    setDeletedQuestion(state, payload) {
        state.deleteQuestionId = payload;
    },
    createQuestion(state, payload) {
        state.loadedQuestions.push(payload);
    },
    deleteQuestion(state, payload) {
        state.loadedQuestions.forEach((item, i) => {
            if(item.id === payload)
                state.loadedQuestions.splice(i, 1);
        });
    },
    RESET(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    loadedQuestions({ commit }) {
        commit('setLoading', true);
        let questions = [];
        db.collection('updated-questions').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                questions.push(Object.assign({ id: doc.data().IQ, data: doc.data() }));
            });
            commit('setLoadedQuestions', questions);
            commit('setLoading', false);
        })
    },
    deleteQuestion({ commit }, payload) {
        commit('setLoading', true);
        const id = payload;
        return db.collection("updated-questions").where('IQ', '==', id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    if(doc.data().IMAGENS && doc.data().IMAGENS.length > 0) {
                        const image = doc.data().IMAGENS;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                });
            })
            .then(() => {
                commit('setLoading', false);
                commit('deleteQuestion', id);
                console.log("Document successfully deleted!");
            })
            .catch(error => {
                console.error("Error removing document: ", error);
            });
    },
    uploadImageQuestion({ commit }, payload) {
        const request = new Promise((resolve,reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.images;
                const questionIQ = payload.id;
                const type = file.type.split('/')[1];
                const format = `questions/question-${questionIQ}.${type}`;
                storageRef.child(format).put(file)
                    .then(snapshot => {
                        console.log("Uploaded a file!: ", snapshot)
                        snapshot.ref.getDownloadURL().then(downloadURL => {
                            console.log('File available at', downloadURL);
                            resolve(downloadURL.toString());
                        });
                    })
                    .catch(error => {
                        console.error("Error uploading file", error);
                        resolve(error);
                    });
            } catch{
                reject();
            }
        });
        return request;
    },
    editQuestion({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const question = {
            id: payload.questionData.id,
            questionDescription: payload.questionData.questionDescription,
            subject: payload.questionData.subject,
            knowledge: payload.questionData.knowledge,
            knowledgePWR: payload.questionData.knowledgePWR,
            knowledgeBWR: payload.questionData.knowledgeBWR,
            answers: payload.questionData.answers,
            images: payload.questionData.images,
            imageSize: payload.questionData.imageSize,
        }

        const today = new Date();
        const edition = payload.oldData.edited;
        edition.push({
            id: payload.user,
            date: today,
            question: payload.oldData.id + "-" + (payload.oldData.edited.length + 1)
        });

        db.collection("updated-questions").where('IQ', '==', question.id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update({
                        IQ: question.id,
                        PERGUNTA: question.questionDescription,
                        DISCIPLINA: question.subject,
                        CONHECIMENTO: question.knowledge,
                        RELEVANCIA_OR: question.knowledgePWR,
                        RELEVANCIA_OSR: question.knowledgeBWR,
                        RESPOSTAS: question.answers,
                        IMAGENS: question.images,
                        TAMANHO_IMAGEM: question.imageSize,
                        edited: edition
                    });
                });
            })
            .then(() => {
                dispatch("createdEditedQuestion", payload.oldData);
                console.log("Success edit");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    createdEditedQuestion({ commit }, payload) {
        commit('setLoading', true);

        const editedQuestion = {
            id: payload.id + '-' + payload.edited.length,
            questionDescription: payload.questionDescription,
            subject: payload.subject,
            knowledge: payload.knowledge,
            knowledgePWR: payload.knowledgePWR,
            knowledgeBWR: payload.knowledgeBWR,
            answers: payload.answers,
            images: payload.images,
            imageSize: payload.imageSize
        }
        db.collection("edited questions")
            .add({
                IQ: editedQuestion.id,
                PERGUNTA: editedQuestion.questionDescription,
                DISCIPLINA: editedQuestion.subject,
                CONHECIMENTO: editedQuestion.knowledge,
                RELEVANCIA_OR: editedQuestion.knowledgePWR,
                RELEVANCIA_OSR: editedQuestion.knowledgeBWR,
                RESPOSTAS: editedQuestion.answers,
                IMAGENS: editedQuestion.images,
                TAMANHO_IMAGEM: editedQuestion.imageSize,
            })
            .then(() => {
                commit('setLoading', false);
                console.log("Success create edit");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    createQuestion({ commit }, payload) {
        commit('setLoading', true);

        const question = {
            id: payload.id,
            data: {
                IQ: payload.id,
                PERGUNTA: payload.questionDescription,
                DISCIPLINA: payload.subject,
                CONHECIMENTO: payload.knowledge,
                RELEVANCIA_OR: payload.knowledgePWR,
                RELEVANCIA_OSR: payload.knowledgeBWR,
                RESPOSTAS: payload.answers,
                IMAGENS: payload.images,
                TAMANHO_IMAGEM: payload.imageSize,
                edited: []
            }
        }

        db.collection("updated-questions").add(question.data)
            .then(() => {
                commit('setLoading', false);
                commit('createQuestion', question);
                console.log("Success");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    reset({ commit }) {
        commit('RESET');
    }
}

const getters = {
    getSubjects(state) {
        return state.subjects;
    },
    numberOfQuestions(state) {
        return state.loadedQuestions.length;
    },
    loadedQuestions(state) {
        return state.loadedQuestions;
    },
    getAnswersById(state) {
        let aux = state.loadedQuestions.find(question => question.id === id);
        return Object.assign({}, aux.data.RESPOSTAS);
    },
    getNumberOfQuestionBySubject: state => subject => {
        let counter = 0;
        state.loadedQuestions.forEach(element => {
            if (element.data.DISCIPLINA === subject)
                counter++;
        });
        return counter;
    },
    findQuestionById: state => id => state.loadedQuestions.find(question => question.id === id)
}

export default {
    state,
    mutations,
    actions,
    getters
}
