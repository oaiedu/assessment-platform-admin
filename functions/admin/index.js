const admin = require('firebase-admin');

admin.initializeApp();
// const secondaryAdmin = admin.initializeApp(require('../../.env'), 'secondaryAdmin');

const db = admin.firestore();
const storage = admin.storage().bucket();
const auth = admin.auth();

// const secDB = secondaryAdmin.firestore();
// const secStorage = secondaryAdmin.storage().bucket();
// const secAuth = secondaryAdmin.auth();

// const secRDB = secondaryAdmin.database();

module.exports = {
    db,
    storage,
    auth,
    // secDB,
    // secStorage,
    // secAuth,
    // secRDB
}
