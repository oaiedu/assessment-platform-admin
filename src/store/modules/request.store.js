import { db, storage } from '../../main';

const initialState = () => ({
    questionRequests: []
});

const state = initialState();

const mutations = {
    setQuestionRequests(state, data) {
        state.questionRequests = data;
    },
    addQuestionRequest(state, data) {
        state.questionRequests.push(data);
    },
    updateQuestionRequest(state, data) {
        const requests = state.questionRequests;
        for(let index = 0; index < requests.length; index++) {
            if(requests[index].iq === data.iq) {
                state.questionRequests[index] = data;
            }
        }
    },
    removeQuestionRequest (state, data) {
        const index = state.questionRequests.indexOf(data);
        console.log(index);
        if(index !== -1) {
            state.questionRequests.splice(index, 1);
        }
    },
    RESET(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    createQuestionRequest({ commit }, payload) {
        commit('setLoading', true);

        const question = {
            iq: payload.iq,
            user: {
                name: payload.name,
                email: payload.email
            },
            status: payload.status,
            question: payload.question,
            subject: payload.subject,
            knowledge: payload.knowledge,
            knowledgePWR: payload.knowledgePWR,     // RELEVANCIA_OR
            knowledgeBWR: payload.knowledgeBWR,     // RELEVANCIA_OSR
            answers: payload.answers,
            image: payload.image,
            imageSize: payload.imageSize,
            edited: []
        }

        db.collection('question-requests').add(question)
            .then(() => {
                commit('addQuestionRequest', question);
                commit('setLoading', false);
            })
            .catch(error => {
                console.error("Error writing request: ", error);
            });
    },
    updateQuestionRequest({ commit }, payload) {
        commit('setLoading', true);
        const { mode, question } = payload;

        db.collection('question-requests').where('iq', '==', question.iq).get()
            .then(snapshot => {
                if(mode === 'sttUpdate') {
                    snapshot.docs[0].ref.update({ status: payload.status })
                        .then(() => {
                            question.status = payload.status;
                            commit('updateQuestionRequest', question);
                            commit('setLoading', false);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                } else {
                    snapshot.docs[0].ref.update(question)
                        .then(() => {
                            commit('updateQuestionRequest', question);
                            commit('setLoading', false);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadQuestionRequests({ commit }, payload) {
        commit('setLoading', true);
        const { claims, userInfo } = payload;

        const data = [];
        let dbRequest = null;

        if(claims['admin']) {
            dbRequest = db.collection('question-requests').get();
        } else {
            dbRequest = db.collection('question-requests').where('user.email', '==', userInfo.email).get();
        }

        dbRequest.then(snapshot => {
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
        })
        .then(() => {
            commit('setQuestionRequests', data);
            commit('setLoading', false);
        })
        .catch(error => {
            console.log(error);
        });
    },
    deleteQuestionRequest({ commit }, payload) {
        commit('setLoading', true);

        db.collection('question-requests').where('iq', '==', payload.iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                doc.ref.delete()
                    .then(() => {
                        commit('removeQuestionRequest', payload);
                        if(doc.data().image && doc.data().image.length > 0) {
                            const image = doc.data().image;
                            const childImage = image.split('?alt=media')[0].split('/o/')[1];
                            const child = decodeURIComponent(childImage);
                            storage.ref().child(child).delete();
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            });
    }
}

const getters = {
    getRequests(state) {
        return state.questionRequests;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
