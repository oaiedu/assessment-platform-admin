import { db } from '../../main';
import { showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    dataSize: null
});

const state = initialState();

const mutations = {
    setDataSize (state, data) {
        state.dataSize = data;
    },
    addRemoveSize(state, data) {
        state.dataSize[data.key] = data.data;
    },
    RESETDataSize(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    loadDataSize({ commit }) {
        commit('setLoading', true);

        const data = {};

        db.collection('data-size').get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                for(let key in doc.data()) {
                    data[key] = doc.data()[key];
                }
            })
            .then(() => {
                commit('setDataSize', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Data Size', error.message);
                commit('setError', { message: errorModel });
            });
    },
    resetDataSize({ commit }) {
        commit('RESETDataSize');
    }
}

const getters = {
    getDataSize(state) {
        return state.dataSize;
    },
    getNumberOfQuestionBySubject: state => subjectName => {
        return state.dataSize.questions.subject[subjectName];
    },
}

export default {
    state,
    mutations,
    actions,
    getters
}
