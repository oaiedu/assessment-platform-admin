const axios = require('axios');

import { db } from '../../main';

const state = {
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
    backups: []
}

const mutations = {
    setBackups(state, data) {
        state.backups = data;
    },
    newBackup(state, data) {
        state.backups.push(data);
    }
}

const actions = {
    async backupFirebase({ commit, state }, payload) {
        const now = payload.now;

        let url = '';

        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else if(process.env.NODE_ENV === 'production') {
            url = 'http://localhost:5001/pwr-quiz-generator/us-central1/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        };

        const bkp = {
            id: '',
            size: '',
            start: '',
            end: ''
        }

        await axios.get(url)
            .then(res => {
                bkp.size = res.data.size;
                bkp.end = res.data.endDate;

                alert('Backup available at \'backups/' + now + '/\'');
            }).catch(error => console.log(error));

        db.collection('backups').get()
            .then(snapshot => {
                let lastBkpId;
                let bkpId;

                if(snapshot.docs.length > 0) {
                    snapshot.forEach(doc => {
                        const id = parseInt(doc.data().id.split('p')[1]);
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

                function formatDate(date) {
                    const locale = new Date(date).toLocaleString();
                    const month = locale.split('/')[0];

                    const dateTime = new Date(date).toString();
                    const sub = dateTime.substr(7, 17);
                    const monthName = state.months[month].substr(0, 3);

                    return monthName + sub;
                }

                bkp.id = 'bkp' + bkpId;
                bkp.start = formatDate(now);
                bkp.end = formatDate(bkp.end);

                db.collection('backups').add(bkp)
                    .then(() => {
                        commit('newBackup', bkp);
                    })
                    .catch(error => console.log(error));
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadBackups({ commit }) {
        const data = [];
        db.collection('backups').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setBackups', data);
            })
            .catch(error => {
                console.log(error);
            });
    }
}

const getters = {
    getMonths(state) {
        return state.months;
    },
    getBackups(state) {
        return state.backups;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
