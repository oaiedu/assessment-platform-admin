import store from '../store/'

export default (to, from, next) => {
  if (!store.getters.user) {
    next({ name: 'auth', params: { to: to.fullPath }, replace: true })
  } else {
    const claims = store.getters.getUserClaims
    if (to.path === '/admin' && !(claims && claims.admin)) {
      next('/')
    } else if (
      to.path.startsWith('/inbox') &&
      !(claims && (claims.appraiser || claims.admin))
    ) {
      next('/')
    } else if (
      to.path.includes('/quiz') &&
      !(claims && (claims.admin || claims.student))
    ) {
      next('/')
    } else if (to.path === '/questions' && claims && claims.student) {
      next('/')
    } else {
      next()
    }
  }
}
