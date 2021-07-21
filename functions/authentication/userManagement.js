const fs = require("fs");
const { auth, db } = require("../admin");
const { hash } = require("../.env");

exports.checkAuthUser = async (req, res) => {
    const uid = req.body["uid"];

    await auth
        .getUser(uid)
        .then(user => {
            console.log(user);
            return user;
        })
        .catch(error => {
            console.log(error);
        });

    res.send({ uid });
};

exports.userDefaultRole = async (req, res) => {
    const uid = req.headers["uid"];

    if (uid) {
        await auth
            .setCustomUserClaims(uid, {
                admin: false,
                appraiser: false,
                teacher: false,
                student: true
            })
            .catch(error => {
                console.log(error);
            });
    }

    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Content-Type", "uid"]);
    res.send({ endDate: new Date().toISOString() });
};

exports.setRole = async (req, res) => {
    let email = "";
    let role = "";
    if (req.body.data) {
        email = req.body.data["email"];
        role = req.body.data["role"];
    }

    let uid = null;

    if (email && role) {
        await auth
            .getUserByEmail(email)
            .then(user => {
                uid = user.uid;
                customClaims = {
                    student: false,
                    admin: false,
                    appraiser: false,
                    teacher: false
                };
                auth.setCustomUserClaims(user.uid, {
                    ...customClaims,
                    [role]: true
                }).catch(error => {
                    console.log(error);
                });
                return { ...user, customClaims };
            })
            .catch(error => {
                console.log(error);
            });
    }

    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", "Content-Type, email, role");
    res.send({ uid });
};

exports.setDefaultRoleToAll = async (req, res) => {
    await db
        .collection("users")
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                if (!doc.data().role || doc.data().role === "student") {
                    doc.ref.update({ role: "student" });

                    auth.setCustomUserClaims(doc.id, {
                        admin: false,
                        appraiser: false,
                        teacher: false,
                        student: true
                    }).catch(error => {
                        console.log(error);
                    });
                }
            });

            return true;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Roles Updated!");
};

exports.importAuth = async (req, res) => {
    const folderRootName = "backups";
    const timestamp = "2020-11-27T16-43-04.696Z";
    const path = `../../${folderRootName}/${timestamp}`;

    const jsonPath = `${path}/auth-${timestamp}.json`;
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);

    await json.forEach(user => {
        user.passwordHash = Buffer.from(user.passwordHash, "base64");
        user.passwordSalt = Buffer.from(user.passwordSalt, "base64");
    });

    await auth
        .importUsers(json, { hash })
        .then(results => {
            const error =
                results.errors.length > 0 ? results.errors[0].error : "Ok!";
            console.log(error);
            return error;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Authentication users imported!");
};

exports.deleteAuth = async (req, res) => {
    await auth
        .listUsers()
        .then(snapshot => {
            snapshot.users.forEach(user => {
                auth.deleteUser(user.uid);
            });
            return snapshot.users;
        })
        .catch(console.log);

    res.send("Authentication registers deleted!");
};
