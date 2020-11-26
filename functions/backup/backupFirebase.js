const fs = require('fs');
// const AdmZip = require('adm-zip');
const { secAuth, secDB, secStorage } = require('../admin');

exports.backupFirebase = async (req, res) => {
    const now = new Date().toISOString().replace(/:/g, '-');
    const fileNameAuth = `auth-${now}.json`;
    const folderRootName = 'backups';
    const folderFirestore = 'firestore';
    const folderStorage = 'storage';
    const path = `../../${folderRootName}/${now}`;

    await secAuth.listUsers()
        .then(snapshot => {
            const users = snapshot.users.map(userRecord => {
                return {...userRecord};
            });
            const jsonAuth = JSON.stringify(users);

            fs.mkdirSync(path, { recursive: true });
            fs.writeFileSync(`${path}/${fileNameAuth}`, jsonAuth);
        })
        .catch(error => {
            console.log(error);
        });

    await secDB.listCollections()
        .then(collections => {
            collections.forEach(async collection => {
                const cn = collection.id;
                const firestoreData = [];

                await secDB.collection(cn).get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            if(cn.includes('question')) {
                                firestoreData.push({ ...doc.data(), IQ: doc.id });
                            } else {
                                firestoreData.push(doc.data());
                            }
                        });
                    })
                    .then(() => {
                        const jsonFirestore = JSON.stringify(firestoreData);
                        const fileName = `${cn}-${now}.json`;

                        fs.mkdirSync(`${path}/${folderFirestore}`, { recursive: true });
                        fs.writeFileSync(`${path}/${folderFirestore}/${fileName}`, jsonFirestore);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
        })
        .catch(console.log);

        await secStorage.getFiles()
            .then(files => {
                files[0].forEach(file => {

                    secStorage.file(file.name).download().then(dlFile => {
                        const image = file.name;
                        let imagePath = '';
                        let imageFile = '';
                        if(image.includes('/')) {
                            const slashSplit = image.split('/');
                            const imageName = slashSplit[slashSplit.length - 1];
                            imageFile = imageName;
                            imagePath = image.split(imageName)[0];

                        } else {
                            imageFile = image;
                        }
                        const pieces = image.split('.');
                        let type = pieces[pieces.length - 1];

                        const hasType = (type != undefined && type.length > 2 && type.length < 5);
                        type = hasType ? type : 'jpeg';

                        const format = imagePath + imageFile + (hasType ? '' : `.${type}`);

                        fs.mkdirSync(`${path}/${folderStorage}/${imagePath}`, { recursive: true });
                        fs.writeFileSync(`${path}/${folderStorage}/${format}`, dlFile[0]);

                        // const zip = new AdmZip();
                        // zip.addLocalFolder(path);
                        // fs.mkdirSync('../../storage-bkp', { recursive: true });
                        // fs.writeFileSync(`../../storage-bkp/storage.zip`, zip.toBuffer());

                        // counter++;
                        // if(counter === files.length - 1) {
                        //     console.log("Finished...");
                        //     fs.rmdir(path, { recursive: true }, (err) => {
                        //         if(err) {
                        //             return console.log(err);
                        //         }
                        //     });
                        // }
                    })
                    .catch(error => {
                        console.log(error);
                    });
                });
            })
            .catch(error => {
                console.log(error);
            });

    res.send('Backup Finished!\nTimestamp: ' + now);
}
