const { secAuth } = require('../admin');

exports.copyAuth = async (req, res) => {
    let dataLength = 0;
    let counter = 0;

    await secAuth.listUsers()
        .then(async snapshot => {
            dataLength = snapshot.users.length;
            const users = snapshot.users.map(userRecord => {
                return { ...userRecord };
            });

            users.forEach(user => {
                user.passwordHash = Buffer.from(user.passwordHash, 'base64');
                user.passwordSalt = Buffer.from(user.passwordSalt, 'base64');
            });

            await auth.importUsers(
                users,
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
                    counter++;
                    const error = results.errors.length > 0 ? results.errors[0].error : 'Ok!';
                    console.log(error);
                    return error;
                })
                .catch(error => {
                    console.log(error);
                });

            return users;
        })
        .catch(error => {
            console.log(error);
        });

    res.send(`Origin Data Length: ${dataLength}\nCopied Data Length: ${counter}`);
}
