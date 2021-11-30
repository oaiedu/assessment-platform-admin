import { Store } from 'vuex';
import axios from 'axios';

import { db } from '../../main';
import { getNowISOString } from '../../utils/date';

import { createErrorLog, showErrorMessage } from '../../utils/errors';

/**
 * @typedef {Object} Backup
 * @property {string} id - The backup id.
 * @property {string} cloudId - The backup cloud id (google drive cloud service).
 * @property {string} size - The backup size.
 * @property {string} month - The month that the backup was created.
 * @property {string} start - The iso string of when the backup started.
 * @property {string} end - The iso string of when the backup ended.
 */

/**
 * @typedef {Object} BackupState
 * @property {Object.<string, string>} months - The months object, from 1 to 12.
 * @property {Backup[]} backups - An array of backups.
 * @property {Backup|null} lastBackup - The last backup made.
 */

/**
 * Gets the initial state for backup store.
 *
 * @returns {BackupState} The initial backup state object.
 */
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
    /**
     * Sets to the state a new array of backups.
     *
     * @param {BackupState} state - The backup state.
     * @param {Backup[]} data - An array of backups.
     */
    setBackups(state, data) {
        state.backups = data;
    },
    /**
     * Pushes a new backup to backups list.
     *
     * @param {BackupState} state - The backup state.
     * @param {Backup} data
     */
    newBackup(state, data) {
        state.backups.push(data);
    },
    /**
     * Remove a backup from backups list.
     *
     * @param {BackupState} state - The backup state.
     * @param {Backup} data - The backup to remove.
     */
    removeBackup(state, data) {
        const backups = [...state.backups];
        const ids = state.backups.map((bkp) => bkp.id);
        const index = ids.indexOf(data.id);

        if(index !== -1) {
            backups.splice(index, 1);
        }
        state.backups = [...backups];
    },
    /**
     * Sets the last backup with the given data.
     *
     * @param {BackupState} state - The backup state.
     * @param {Backup} data - The backup to be setted.
     */
    setLastBackup(state, data) {
        state.lastBackup = data;
    },
    /**
     * Resets the backup state to it's initial state.
     *
     * @param {BackupState} state - The backup state.
     */
    RESETBackup(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    /**
     * Backups all Firebase data and sends it to the google drive cloud service.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.now - The iso string of when the backups started.
     */
    async backupFirebase({ commit, state }, payload) {
        commit('setLoading', true);

        const { now } = payload;
        let url = '';

        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'clarice-terui') {
            url = 'https://us-central1-clarice-terui.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
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
    /**
     * Loads all the backups from the last 3 months.
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Downloads a backup according to it's cloudId.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The backup id.
     * @param {string} payload.cloudId - The backup cloud id.
     * @param {string} payload.date - The backup start date.
     */
    downloadBackup({ commit }, payload) {
        commit('setLoading', true);

        let url = ''

        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-downloadBackup?id=' + payload.cloudId;
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'clarice-terui') {
            url = 'https://us-central1-clarice-terui.cloudfunctions.net/backup-downloadBackup?id=' + payload.cloudId;
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
    /**
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The backup cloud id.
     */
    async deleteBackup({ commit }, payload) {
        commit('setLoading', true);

        let url = '';
        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-deleteBackup?id=' + payload.id;
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'clarice-terui') {
            url = 'https://us-central1-clarice-terui.cloudfunctions.net/backup-deleteBackup?id=' + payload.id;
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
    /**
     * Loads the most recent backup.
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Resets the backup state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetBackup({ commit }) {
        commit('RESETBackup');
    }
}

const getters = {
    /**
     * Gets the months object from the backup state.
     *
     * @param {BackupState} state - The backup state.
     * @returns {Object.<string, string>} The months object, from 1 to 12.
     */
    getMonths(state) {
        return state.months;
    },
    /**
     * Gets all the backups from the backup state.
     *
     * @param {BackupState} state - The backup state.
     * @returns {Backup[]} An array of backups.
     */
    getBackups(state) {
        return state.backups;
    },
    /**
     * Gets the most recent backup from the backup state.
     *
     * @param {BackupState} state - The backup state.
     * @returns {Backup} The most recent backup.
     */
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
