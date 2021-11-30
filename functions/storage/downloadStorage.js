const fs = require("fs");

const { secStorage } = require("../admin");

exports.downloadFiles = async (req, res) => {
    fs.mkdirSync("./storage/images", { recursive: true });

    const strgFiles = await secStorage.getFiles({ directory: "questions" });

    const promises = strgFiles[0].map(async file => {
        fs.mkdirSync("./storage/images/questions", {
            recursive: true
        });

        const buffer = (await file.download())[0].buffer;
        const base64 = Buffer.from(buffer).toString("base64");
        fs.writeFileSync("./storage/images/" + file.name, base64, "base64");
    });

    await Promise.all(promises);

    res.send("Downloaded " + strgFiles[0].length + " files!");
};
