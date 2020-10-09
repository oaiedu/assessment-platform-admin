import { db, storage } from '../../main';

const initialState = () => ({
    loadedTests: [],
});

const state = initialState();

const mutations = {
    setLoadedTests(state, payload) {
        state.loadedTests = payload
    },
    RESET(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    loadedTests({ commit }) {
        commit('setLoading', true);
        let tests = []
        db.collection("tests").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                tests.push(Object.assign({ id: doc.id, data: doc.data() }));
            });
            commit('setLoadedTests', tests);
            commit('setLoading', false);
        })
    },
    findImageTests({ commit },payload) {
        const pathReference = storage.refFromURL(`gs://pwr-quiz-generator.appspot.com/${payload}`);

        const imageURL =  pathReference.getDownloadURL()
            .then(url => {
                console.log("URL",url);
                return url;
            })
            .catch(error => {
                console.error("Error downloading the image", error);
            });

        console.log("After Download: ", imageURL);
        return imageURL;
    },
    deleteTest({ commit, dispatch }, payload) {
        commit('setLoading', true);
        const id = payload;
        db.collection("tests").doc(id).delete()
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedTests");
                console.log("Document successfully deleted!");
            })
            .catch(error => {
                console.error("Error removing document: ", error);
            });
    },
    createTest({ commit, dispatch }, payload) {
        const test = {
            title: payload.title,
            questions: payload.questions,
            type: payload.type,
            user: payload.user,
            created: payload.created,
            edited: payload.edited,
            purpose: payload.purpose
        }
        db.collection("tests").doc()
            .set({
                title: test.title,
                questions: test.questions,
                type: test.type,
                user: test.user,
                created: test.created,
                edited: test.edited,
                purpose: test.purpose
            })
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedTests");
                console.log("Success");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    updateTest({ commit, dispatch }, payload) {
        const test = {
            title: payload.title,
            questions: payload.questions,
            type: payload.type,
            user: payload.user,
            created: payload.created,
            edited: payload.edited,
            purpose: payload.purpose,
            id: payload.id
        }
        db.collection("tests").doc(test.id)
            .update({
                title: test.title,
                questions: test.questions,
                type: test.type,
                user: test.user,
                created: test.created,
                edited: test.edited,
                purpose: test.purpose
            })
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedTests");
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
    loadedTests(state) {
        return state.loadedTests;
    },
    getNumberOfQuestionBySubjectOnTest: state => (subject, questions) => {
        let counter = 0;
        questions.forEach(element => {
            if (element.data.DISCIPLINA === subject)
                counter++;
        })
        return counter;
    },
    findTestById: state => id => state.loadedTests.find(test => test.id === id)
}

export default {
    state,
    mutations,
    actions,
    getters
}
