const http = require('http');

const state = {}

const mutations = {}

const actions = {
    backupFirebase(state, payload) {
        const now = payload.now;
        const url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupUsers?now=' + now;
        http.get(url, res => {
            res.on('end', resolve('Backup saved in \'backups/' + now + '/\''));
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
