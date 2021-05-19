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
    addTestsByWeek({ commit, state }) {
        const thisWeek = getWeekInterval(new Date())[0];

        let data = {...state.dataSize.testsByWeek};

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

        db.collection('data-size').get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                if (doc) {
                    doc.ref.update({ testsByWeek: data });
                }
            })
            .then(() => {
                commit('addRemoveSize', { key: 'testsByWeek', data });
            })
            .catch(error => {
                const errorModel = showErrorMessage('edition', 'Data Size', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Data Size Update', error.message, { data });
            });
    },
    async removeTestsByWeek({ commit, state }, payload) {
        const { tests } = payload;

        let data = {...state.dataSize.testsByWeek};

        const lastWeeks = Object.keys(data);

        const promises = tests.map(test => {
            const date = test.created;
            const year = date.substr(0, 4);
            const month = date.substr(5, 2);
            const day = date.substr(8, 2);

            const removeWeek = getWeekInterval(new Date(`${year}/${month}/${day}`))[[0]];

            if (lastWeeks.includes(removeWeek)) {
                data[removeWeek] -= data[removeWeek] - 1 < 0 ? 0 : 1;
            }

            return removeWeek;
        });

        await Promise.all(promises);

        db.collection('data-size').get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                if (doc) {
                    doc.ref.update({ testsByWeek: data });
                }
            })
            .then(() => {
                commit('addRemoveSize', { key: 'testsByWeek', data });
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
    getTestsByWeek(state) {
        return Object.fromEntries(Object.entries(state.dataSize.testsByWeek).sort((a, b) => a[0] < b[0] ? -1 : 1));
    },
    getTestsByWeekInterval(state) {
        const intervals = [];
        Object.entries(state.dataSize.testsByWeek).sort((a, b) => a[0] < b[0] ? -1 : 1).forEach(week => {
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
