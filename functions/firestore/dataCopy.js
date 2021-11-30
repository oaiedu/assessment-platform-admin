const { db, secDB } = require("../admin");

exports.copyFirestore = async (req, res) => {
    let dataLength = 0;
    let counter = 0;

    await secDB
        .listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const collectionName = collection.id;

                await secDB
                    .collection(collectionName)
                    .get()
                    .then(snapshot => {
                        dataLength += snapshot.docs.length;
                        snapshot.forEach(doc => {
                            counter++;
                            db.collection(collectionName)
                                .doc(doc.id)
                                .set(doc.data())
                                .catch(error => {
                                    console.log("Remaining Error");
                                    console.log(error);
                                });
                        });

                        return snapshot;
                    })
                    .catch(error => {
                        console.log("Secondary DB Error");
                        console.log(error);
                    });
            });

            return collections;
        })
        .catch(error => {
            console.log("DB Error");
            console.log(error);
        });

    res.send(
        `Origin Data Length: ${dataLength}\nCopied Data Length: ${counter}`
    );
};
