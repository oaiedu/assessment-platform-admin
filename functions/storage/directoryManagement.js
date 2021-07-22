const { db, storage } = require("../admin");

exports.moveEditedQuestionImages = async (req, res) => {
    await db
        .collection("edited questions")
        .get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().IMAGENS;
                const image =
                    imageURL && imageURL.length > 0
                        ? decodeURIComponent(
                              imageURL.split("?alt=media")[0].split("/o/")[1]
                          )
                        : undefined;
                let type = "bmp";

                const iq = doc.id.includes("-") ? doc.id.split("-")[0] : doc.id;
                const format = `questions/question-${iq}.${type}`;

                if (image && image !== format) {
                    await storage
                        .file(image)
                        .move(format)
                        .catch(console.log);
                    await storage
                        .file(format)
                        .get()
                        .then(files => {
                            files.forEach(file => {
                                const link = file.selfLink;
                                const token =
                                    file.metadata.firebaseStorageDownloadTokens;
                                if (link && token) {
                                    const middle = "?alt=media&token=";
                                    const newLink =
                                        link.replace(
                                            "www.googleapis.com/storage/v1",
                                            "firebasestorage.googleapis.com/v0"
                                        ) +
                                        middle +
                                        token;
                                    db.collection("edited questions")
                                        .doc(doc.id)
                                        .set({
                                            ...doc.data(),
                                            IMAGENS: newLink
                                        });
                                    console.log(
                                        `From: '${image}' to '${format}', available at: ${newLink}\n`
                                    );
                                }
                            });

                            return files;
                        });
                }
            });

            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Edited questions images moved!");
};

exports.moveQuestionImages = async (req, res) => {
    await db
        .collection("questions")
        .get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().image;
                const image =
                    imageURL && imageURL.length > 0
                        ? decodeURIComponent(
                              imageURL.split("?alt=media")[0].split("/o/")[1]
                          )
                        : undefined;
                let type = "";

                if (image && image.length > 0) {
                    const metadata = await storage
                        .file(image)
                        .getMetadata()
                        .catch(console.log);
                    if (metadata[0].contentType)
                        type = metadata[0].contentType.split("/")[1];
                    else {
                        const pieces = image.split(".");
                        type = pieces[pieces.length - 1];
                    }
                }

                const iq = doc.data().iq || doc.id;
                const format = `questions/question-${iq}.${type}`;

                if (image && image !== format) {
                    await storage
                        .file(image)
                        .move(format)
                        .catch(console.log);
                    await storage
                        .file(format)
                        .get()
                        .then(files => {
                            files.forEach(file => {
                                const link = file.selfLink;
                                const token =
                                    file.metadata.firebaseStorageDownloadTokens;
                                if (link && token) {
                                    const middle = "?alt=media&token=";
                                    const newLink =
                                        link.replace(
                                            "www.googleapis.com/storage/v1",
                                            "firebasestorage.googleapis.com/v0"
                                        ) +
                                        middle +
                                        token;
                                    db.collection("questions")
                                        .doc(doc.id)
                                        .update({ image: newLink });
                                    console.log(
                                        `From: '${image}' to '${format}', available at: ${newLink}\n`
                                    );
                                }
                            });

                            return files;
                        })
                        .catch(console.log);
                }
            });

            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Questions images moved!");
};

exports.moveUserImages = async (req, res) => {
    await db
        .collection("users")
        .get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().profileImages;
                const image =
                    imageURL && imageURL.length > 0
                        ? decodeURIComponent(
                              imageURL.split("?alt=media")[0].split("/o/")[1]
                          )
                        : undefined;
                let type = "";

                if (image && image.length > 0) {
                    const metadata = await storage
                        .file(image)
                        .getMetadata()
                        .catch(console.log);
                    if (metadata[0].contentType)
                        type = metadata[0].contentType.split("/")[1];
                    else {
                        const pieces = image.split(".");
                        type = pieces[pieces.length - 1];
                    }
                }

                const format = `users/${doc.id}/avatar.${type}`;

                if (image && image !== format) {
                    await storage
                        .file(image)
                        .move(format)
                        .catch(console.log);
                    await storage
                        .file(format)
                        .get()
                        .then(files => {
                            files.forEach(file => {
                                const link = file.selfLink;
                                const token =
                                    file.metadata.firebaseStorageDownloadTokens;
                                if (link && token) {
                                    const middle = "?alt=media&token=";
                                    const newLink =
                                        link.replace(
                                            "www.googleapis.com/storage/v1",
                                            "firebasestorage.googleapis.com/v0"
                                        ) +
                                        middle +
                                        token;
                                    db.collection("users")
                                        .doc(doc.id)
                                        .update({ profileImages: newLink });
                                    console.log(
                                        `From: '${image}' to '${format}', available at: ${newLink}\n`
                                    );
                                }
                            });

                            return files;
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            });

            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Users images moved!");
};

exports.movePaperImages = async (req, res) => {
    await db
        .collection("papers")
        .get()
        .then(snapshot => {
            snapshot.forEach(async doc => {
                const imageURL = doc.data().image;
                const image =
                    imageURL && imageURL.length > 0
                        ? decodeURIComponent(
                              imageURL.split("?alt=media")[0].split("/o/")[1]
                          )
                        : undefined;
                let type = "";

                if (image && image.length > 0) {
                    const metadata = await storage
                        .file(image)
                        .getMetadata()
                        .catch(console.log);
                    if (metadata[0].contentType)
                        type = metadata[0].contentType.split("/")[1];
                    else {
                        const pieces = image.split(".");
                        type = pieces[pieces.length - 1];
                    }
                }

                const format = `documents/document-$${doc.data().id}.${type}`;

                if (image && image !== format) {
                    await storage
                        .file(image)
                        .move(format)
                        .catch(console.log);
                    await storage
                        .file(format)
                        .get()
                        .then(files => {
                            files.forEach(file => {
                                const link = file.selfLink;
                                const token =
                                    file.metadata.firebaseStorageDownloadTokens;
                                if (link && token) {
                                    const middle = "?alt=media&token=";
                                    const newLink =
                                        link.replace(
                                            "www.googleapis.com/storage/v1",
                                            "firebasestorage.googleapis.com/v0"
                                        ) +
                                        middle +
                                        token;
                                    db.collection("papers")
                                        .doc(doc.id)
                                        .update({ image: newLink });
                                    console.log(
                                        `From: '${image}' to '${format}', available at: ${newLink}\n`
                                    );
                                }
                            });

                            return files;
                        });
                }
            });

            return snapshot;
        })
        .catch(error => {
            console.log(error);
        });

    res.send("Documents images moved!");
};

exports.deleteUnusedImages = async (req, res) => {
    await storage
        .getFiles()
        .then(files => {
            files[0].forEach(async file => {
                if (
                    !(
                        file.name.includes("questions/") ||
                        file.name.includes("users/") ||
                        file.name.includes("documents/") ||
                        file.name.includes("home-background")
                    )
                ) {
                    await storage
                        .file(file.name)
                        .delete()
                        .catch(console.log);
                }
            });

            return files;
        })
        .catch(console.log);

    res.send("Deleted unused images!");
};
