import { db } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';
import { getWeekInterval } from '../../utils/date';

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
                createErrorLog('Data Size Load', error.message, { data });
            });
    },
    updateQuestionsByWeek({ commit, state }) {
        const thisWeek = getWeekInterval(new Date())[0];

        let data = {...state.dataSize.questionsByWeek};

        const lastWeeks = Object.keys(data);

        if (lastWeeks.includes(thisWeek)) {
            data[thisWeek] += 1;
        } else {
            const numberOfWeeks = 5;
            const today = new Date();

            let newData = {};

            for (let i = numberOfWeeks - 1; i > 0; i--) {
                const week = new Date(today);
                week.setDate(week.getDate() - (i * 7));
                const currentWeek = getWeekInterval(week)[0];

                if (lastWeeks.includes(currentWeek)) {
                    newData[currentWeek] = data[currentWeek];
                } else {
                    newData[currentWeek] = 0;
                }
            }

            data = { ...newData, [thisWeek]: 1 };
        }

        console.log(data);

        db.collection('data-size').get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                if (doc) {
                    doc.ref.update({ questionsByWeek: data });
                }
            })
            .then(() => {
                commit('addRemoveSize', { key: 'questionsByWeek', data });
            })
            .catch(error => {
                const errorModel = showErrorMessage('edition', 'Data Size', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Data Size Update', error.message, { data });
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
    getQuestionsByWeek(state) {
        return Object.fromEntries(Object.entries(state.dataSize.questionsByWeek).sort((a, b) => a[0] < b[0] ? -1 : 1));
    },
    getQuestionsByWeekInterval(state) {
        const intervals = [];
        Object.entries(state.dataSize.questionsByWeek).sort((a, b) => a[0] < b[0] ? -1 : 1).forEach(week => {
            const interval = getWeekInterval(new Date(`${week[0].substr(5, 2)}/${week[0].substr(8, 2)}/${week[0].substr(0, 4)}`));
            intervals.push(`${interval[0].substr(8, 2)}/${interval[0].substr(5, 2)} - ${interval[1].substr(8, 2)}/${interval[1].substr(5, 2)}`);
        });
        return intervals;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
