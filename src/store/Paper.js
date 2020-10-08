import { db } from '../main';

export default {
    state: {
        loadedPapers: [],
        deletePaperId: null
    },
    mutations: {
        setLoadedPapers(state,payload){
            state.loadedPapers = payload;
        },
        createPaper(state,payload){
            state.loadedPapers.push(payload);
        },
        deletePaper(state,payload){
            state.deletePaper = payload;
        }
    },
    actions: {
        deletePaper({ commit, dispatch }, payload) {
            commit('setLoading', true);
            const id = payload;
            return db.collection("papers").doc(id).delete()
                .then(() => {
                    commit('setLoading', false);
                    dispatch("loadedPapers");
                    console.log("Document successfully deleted!");
                })
                .catch(function (error) {
                    console.error("Error removing document: ", error);
                });
        },
        loadedPapers({ commit }) {
            commit('setLoading', true);
            let papers = [];
            db.collection("papers").get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        papers.push(Object.assign({id: doc.id, data: doc.data()}));
                });
                commit('setLoadedPapers', papers);
                commit('setLoading', false);
            });
        },
        createPaper({ commit, dispatch }, payload) {
            const paper = {
                name: payload.paperName,
                image: payload.paperImage,
                description: payload.paperDescription
            }
            db.collection("papers").doc().set({
                name: paper.name,
                image: paper.image,
                description: paper.description
            })
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedPapers");
                console.log("Sucess");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
        },
        updatePaper({ commit, dispatch }, payload) {
            const paper = {
                name: payload.paperName,
                image: payload.paperImage,
                description: payload.paperDescription,
                id: payload.id
            }
            db.collection("papers").doc(paper.id)
                .update({
                    name: paper.name,
                    image: paper.image,
                    description: paper.description
                })
                .then(() => {
                    commit('setLoading', false);
                    dispatch("loadedPapers");
                    console.log("Sucess");
                })
                .catch(error => {
                    console.error("Error writing document: ", error);
                });
        }
    },
    getters: {
        loadedPapers(state) {
            return state.loadedPapers;
        }
    }
}
