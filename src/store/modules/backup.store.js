const http = require('http');
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
    }
}

const actions = {
    backupFirebase({ state }, payload) {
        const now = payload.now;
        let url = '';
        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now;
        } else if(process.env.NODE_ENV === 'production') {
            url = 'http://localhost:5001/pwr-quiz-generator/us-central1/backup-backupFirestoreAuth?now=' + now;
        };
        http.get(url, res => {
            res.on('end', () => {
                console.log('Backup available at \'backups/' + now.replace(/:/g, '-') + '/\'');
            })
        });

        console.log(state.months);

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
                } else { bkpId = 1}

                const locale = new Date(now).toLocaleString();
                const month = locale.split('/')[0];

                const dateTime = new Date(now).toString();
                const sub = dateTime.substr(7, 17);
                const monthName = state.months[month].substr(0, 3);

                const startDate = monthName + sub;

                const bkp = {
                    id: 'bkp' + bkpId,
                    size: 1024,
                    start: startDate,
                    end: startDate
                }

                db.collection('backups').add(bkp).catch(error => console.log(error));
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
