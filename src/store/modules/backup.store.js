const axios = require('axios');

import { db } from '../../main';
import { getNowISOString } from '../../utils/date';

import { createErrorLog, showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    months: {
        '1': 'Janeiro',
        '2': 'Fevereiro',
        '3': 'Março',
        '4': 'Abril',
        '5': 'Maio',
        '6': 'Junho',
        '7': 'Julho',
        '8': 'Agosto',
        '9': 'Setembro',
        '10': 'Outubro',
        '11': 'Novembro',
        '12': 'Dezembro'
    },
    backups: [],
    lastBackup: null
});

const state = initialState();

const mutations = {
    setBackups(state, data) {
        state.backups = data;
    },
    newBackup(state, data) {
        state.backups.push(data);
    },
    removeBackup(state, data) {
        const backups = state.backups;
        const ids = state.backups.map((bkp) => bkp.id);
        const index = ids.indexOf(data.id);

        if(index !== -1) {
            backups.splice(index, 1);
        }
        state.backups = backups;
    },
    setLastBackup(state, data) {
        state.lastBackup = data;
    },
    RESETBackup(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    async backupFirebase({ commit, state }, payload) {
        commit('setLoading', true);
        const now = payload.now;

        let url = '';

        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        }

        const bkp = {
            id: '',
            size: '',
            start: '',
            end: '',
            cloudId: '',
            month: ''
        }

        await axios.get(url)
            .then(res => {
                bkp.size = res.data.size;
                bkp.end = getNowISOString();
                bkp.cloudId = res.data.cloudId;
            }).catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('creation', 'Backup', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Backup Url GET', error.message, { payload, bkp, url });
            });

        db.collection('backups').get()
            .then(snapshot => {
                let lastBkpId;
                let bkpId;

                if(snapshot.docs.length > 0) {
                    snapshot.forEach(doc => {
                        const id = parseInt(doc.data().id.substr(3, 4));
                        if(!lastBkpId) {
                            lastBkpId = id;
                        } else {
                            if(id > lastBkpId) {
                                lastBkpId = id;
                            }
                        }
                    });

                    bkpId = lastBkpId + 1;
                } else bkpId = 1;

                bkp.id = 'mb' + (bkpId >= 1000 ? bkpId : bkpId.toString().padStart(4, '0'));
                bkp.start = now;
                bkp.month = state.months[new Date(bkp.start).getMonth() + 1].substr(0, 3);

                db.collection('backups').add(bkp)
                    .then(() => {
                        commit('newBackup', bkp);
                        commit('setLoading', false);
                        commit('setSuccess', 'Backup realizado com sucesso!');
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('creation', 'Backup', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Backup DB Insert', error.message, { payload, bkp });
            });
    },
    loadBackups({ commit, state }) {
        commit('setLoading', true);

        const data = [];
        const currentMonth = new Date().getMonth() + 1;
        const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
        const twoMonthsAgo = currentMonth - 2 <= 0 ? currentMonth + 12 - 2 : currentMonth - 2;

        const months = [
            state.months[currentMonth].substr(0, 3),
            state.months[lastMonth].substr(0, 3),
            state.months[twoMonthsAgo].substr(0, 3)
        ];

        db.collection('backups').where('month', 'in', months).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setBackups', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Backup', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Backups Load', error.message, { data });
            });
    },
    downloadBackup({ commit }, payload) {
        commit('setLoading', true);

        let url = ''

        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-downloadBackup?id=' + payload.cloudId;
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-downloadBackup?id=' + payload.cloudId;
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-downloadBackup?id=' + payload.cloudId;
        }

        axios.get(url)
            .then(res => {
                const data = res.data.backup;

                if (data && res.data.error) {
                    const error = res.data.error;
                    const errorModel = showErrorMessage('connection', '', 'Download error - ' + error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Backup Download', error.message, { payload, url });
                } else {
                    const url = 'data:application/zip;base64,' + data;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${payload.id.toUpperCase()}-${payload.date.replace(/\s/g, '_')}.zip`;
                    a.click();
                    a.remove();
                }

                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', 'Download error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Backup Download', error.message, { payload, url });
            });
    },
    async deleteBackup({ commit }, payload) {
        commit('setLoading', true);

        let url = '';
        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-deleteBackup?id=' + payload.id;
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-deleteBackup?id=' + payload.id;
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-deleteBackup?id=' + payload.id;
        }

        await axios.get(url)
            .then(res => {
                const deleted = res.data.deleted;
                if(deleted) {
                    db.collection('backups').where('cloudId', '==', payload.id).get()
                        .then(snapshot => {
                            snapshot.forEach(doc => {
                                doc.ref.delete();
                                commit('removeBackup', doc.data());
                                commit('setLoading', false);
                                commit('setSuccess', 'Backup excluído com sucesso!');
                            });
                        })
                        .catch(error => {
                            commit('setLoading', false);
                            commit('setError', error);
                        });
                } else {
                    const error = res.data.error;
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('exclusion', 'Backup', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Backup Delete', error.message, { payload, deleted, url });
                }
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', 'Delete error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Backup Url Delete', error.message, { payload, url });
            });
    },
    loadLastBackup({ commit }) {
        commit('setLoading', true);

        db.collection('backups').orderBy('start', 'desc').limit(1).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    commit('setLastBackup', doc.data());
                    commit('setLoading', false);
                });
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Backup', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Last Backup Loading', error.message, null);
            });
    },
    resetBackup({ commit }) {
        commit('RESETBackup');
    }
}

const getters = {
    getMonths(state) {
        return state.months;
    },
    getBackups(state) {
        return state.backups;
    },
    getLastBackup(state) {
        return state.lastBackup;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
