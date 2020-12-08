const http = require('http');

const state = {}

const mutations = {}

const actions = {
    backupFirebase(state, payload) {
        const now = payload.now;
        let url = '';
        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now;
        } else if(process.env.NODE_ENV === 'production') {
            url = 'http://localhost:5001/pwr-quiz-generator/us-central1/backup-backupFirestoreAuth?now=' + now;
        };
        http.get(url, res => {
            res.on('end', () => {
                console.log('Backup available at \'backups/' + now + '/\'');
            })
        });
    }
}

const getters = {}

export default {
    state,
    mutations,
    actions,
    getters
}
