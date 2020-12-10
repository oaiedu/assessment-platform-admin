const fs = require('fs');
const { auth } = require('../admin');

exports.userDefaultRole = async (req, res) => {
    const uid = req.headers['uid'];

    await auth.setCustomUserClaims(uid, { common: true })
        .catch(error => {
            console.log(error);
        });

    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Headers', ['Content-Type', 'uid']);
    res.send({ endDate: new Date().toISOString() });
}

exports.setAdminRole = async (req, res) => {
    await auth.getUserByEmail('role@user.com')
        .then(user => {
            console.log(user);
        })
        .catch(error => {
            console.log(error);
        })

    res.end();
}

exports.importAuth = async (req, res) => {
    const folderRootName = 'backups';
    const timestamp = '2020-11-25T16-23-01.553Z';
    const path = `../../${folderRootName}/${timestamp}`;

    const jsonPath = `${path}/auth-${timestamp}.json`;
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);

    await json.forEach(user => {
        user.passwordHash = Buffer.from(user.passwordHash, 'base64');
        user.passwordSalt = Buffer.from(user.passwordSalt, 'base64');
    });

    await auth.importUsers(
        json,
        {
            // pick from firebase authentication password hash config
            hash: {
                algorithm: "",
                key: Buffer.from("", 'base64'),
                saltSeparator: Buffer.from("", 'base64'),
                rounds: 0,
                memoryCost: 0
            }
        })
        .then(results => {
            const error = results.errors.length > 0 ? results.errors[0].error : 'Ok!';
            console.log(error);
        })
        .catch(console.log);

    res.send('Authentication users imported!');
}

exports.deleteAuth = async (req, res) => {
    await auth.listUsers()
        .then(snapshot => {
            snapshot.users.forEach(user => {
                auth.deleteUser(user.uid);
            });
        })
        .catch(console.log);

    res.send('Authentication registers deleted!');
}
