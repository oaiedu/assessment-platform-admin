const axios = require('axios');
const unzip = require('unzip-js');
const AdmZip = require('adm-zip');

import { db } from '../../main';

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
    backups: []
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
        const index = state.backups.indexOf(data);
        console.log(index);
        if(index !== -1) {
            state.backups.splice(index, 1);
            console.log(this.getBackups);
        }
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
        const now = payload.now;

        let url = '';

        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else if(process.env.NODE_ENV === 'production') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-backupFirestoreAuth?now=' + now.replace(/:/g, '-');
        }

        const bkp = {
            id: '',
            size: '',
            start: '',
            end: '',
            cloudId: ''
        }

        await axios.get(url)
            .then(res => {
                bkp.size = res.data.size;
                bkp.end = res.data.endDate;
                bkp.cloudId = res.data.cloudId;

                console.log('Backup realizado com sucesso!');
            }).catch(error => console.log(error));

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

                function formatDate(date) {
                    const month = new Date(date).getMonth() + 1;

                    const dateTime = new Date(date).toString();
                    const sub = dateTime.substr(7, 17);
                    const monthName = state.months[month].substr(0, 3);

                    return monthName + sub;
                }

                bkp.id = 'mb' + (bkpId >= 1000 ? bkpId : bkpId.toString().padStart(4, '0'));
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
        commit('setLoading', true);

        const data = [];
        db.collection('backups').get()
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
                console.log(error);
            });
    },
    downloadBackup(store, payload) {
        let url = ''

        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-downloadBackup?id=' + payload.cloudId;
        } else if(process.env.NODE_ENV === 'production') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/backup-downloadBackup?id=' + payload.cloudId;
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/backup-downloadBackup?id=' + payload.cloudId;
        }

        axios.get(url)
            .then(res => {
                const data = res.data.backup;

                unzip(new Blob([Buffer.from(data)], { type: 'application/zip' }), (err, zipFile) => {
                    if(err) {
                        console.log(err);
                    }

                    zipFile.readEntries((err, entries) => {
                        if(err) {
                            console.log(err);
                        }

                        const zip = new AdmZip();

                        let counter = 0;
                        let len = 0;
                        entries.forEach(entry => {
                            zipFile.readEntryData(entry, false, (err, readStream) => {
                                if(err) {
                                    console.log(err);
                                }

                                readStream.on('data', async chunk => {
                                    const chars = [];
                                    const promises = chunk.map(dataIn => chars.push(dataIn));

                                    await Promise.all(promises);

                                    const fromCharCode = String.fromCharCode(...chars);

                                    const json = JSON.stringify(fromCharCode);

                                    zip.addFile('file' + ++counter + '.json', json);
                                });
                                readStream.on('error', error => {
                                    console.log(error);
                                });
                                readStream.on('end', () => {
                                    len++;
                                    if(entries.length === len) {
                                        const toBlob = zip.toBuffer();
                                        const contentType = 'application/zip';
                                        const blob = new Blob([toBlob], { type: contentType });

                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${payload.id.toUpperCase()}-${payload.date}.zip`;
                                        a.click();
                                        a.remove();
                                    }
                                });
                            });
                        });
                    });
                });

                // if(data) {
                //     const toBlob = Buffer.from(data);
                //     const contentType = 'application/zip';
                //     const blob = new Blob([toBlob], { type: contentType });

                //     if(data) {
                //         const url = URL.createObjectURL(blob);
                //         const a = document.createElement('a');
                //         a.href = url;
                //         a.download = `${payload.id.toUpperCase()}-${payload.date}.zip`;
                //         a.click();
                //         a.remove();
                //     }
                // } else {
                //     const error = res.data.error;
                //     alert('Ocorrou um erro ao baixar o arquivo: ', error);
                // }
            })
            .catch(error => {
                console.log(error + '');
            });
    },
    async deleteBackup({ commit }, payload) {
        let url = '';
        if(process.env.NODE_ENV === 'development') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-deleteBackup?id=' + payload.id;
        } else if(process.env.NODE_ENV === 'production') {
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
                                alert('Backup excluído com sucesso!');
                            });
                        })
                        .catch(error => {
                            console.log(error);
                        });
                } else {
                    alert('Um erro ocorreu ao excluir o backup!');
                }
            })
            .catch(error => {
                console.log(error + '');
            });
    },
    testAPI(store) {
        const url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/backup-testAPI';

        axios.get(url)
            .then(res => {
                console.log(res.data.file);
            })
            .catch(error => {
                console.log(error + '');
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
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
