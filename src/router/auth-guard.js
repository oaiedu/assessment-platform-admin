import store from '../store/'

export default (to, from, next) => {
    if (!store.getters.user) {
        next('/signin');
    } else {
        const claims = store.getters.getUserClaims;
        if(to.path === '/admin' && !(claims && claims.admin)) {
            next('/');
        } else if(to.path === '/inbox' && !(claims && (claims.appraiser || claims.admin))) {
            next('/');
        } else if(to.path === '/tests' && !(claims && (claims.teacher || claims.admin || claims.student))) {
            next('/');
        } else if(to.path === '/questions' && claims && claims.student) {
            next('/');
        } else {
            next();
        }
    }
}
