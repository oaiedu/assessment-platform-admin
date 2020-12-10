import store from '../store/'

export default (to, from, next) => {
    if (!store.getters.user) {
        next('/signin');
    } else {
        const claims = store.getters.getUserClaims;
        if(to.path === '/admin' && !(claims && claims.admin)) {
            next('/');
        } else {
            next();
        }
    }
}
