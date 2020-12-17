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
            if(item.iq === payload)
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
        db.collection('questions').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                questions.push(doc.data());
            });
            commit('setLoadedQuestions', questions);
            commit('setLoading', false);
        })
    },
    deleteQuestion({ commit }, payload) {
        commit('setLoading', true);
        const iq = payload;
        return db.collection("questions").where('iq', '==', iq).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                });
            })
            .then(() => {
                commit('setLoading', false);
                commit('deleteQuestion', iq);
                console.log("Document successfully deleted!");
            })
            .catch(error => {
                console.error("Error removing document: ", error);
            });
    },
    async uploadImageQuestion({ commit }, payload) {
        return new Promise((resolve,reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.image;
                const questionIQ = payload.iq;
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
            } catch {
                reject();
            }
        });
    },
    editQuestion({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const question = {
            iq: payload.questionData.iq,
            question: payload.questionData.question,
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
            question: payload.oldData.iq + "-" + (payload.oldData.edited.length + 1)
        });

        db.collection("questions").where('iq', '==', question.iq).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update({ ...question, edited: edition });
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
            ...question,
            iq: payload.iq + '-' + payload.edited.length
        }
        db.collection("edited questions")
            .add(editedQuestion)
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

        const question = { ...payload, edited: [] }

        db.collection("questions").add(question)
            .then(() => {
                commit('setLoading', false);
                commit('createQuestion', question);
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
        let aux = state.loadedQuestions.find(question => question.iq === iq);
        return { ...aux.answers }
    },
    getNumberOfQuestionBySubject: state => subject => {
        let counter = 0;
        state.loadedQuestions.forEach(question => {
            if (question.subject === subject)
                counter++;
        });
        return counter;
    },
    findQuestionByIq: state => iq => state.loadedQuestions.find(question => question.iq === iq)
}

export default {
    state,
    mutations,
    actions,
    getters
}
