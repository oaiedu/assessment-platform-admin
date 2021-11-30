const functions = require("firebase-functions");
const {
    deleteUnusedImages,
    moveEditedQuestionImages,
    movePaperImages,
    moveQuestionImages,
    moveUserImages
} = require("./directoryManagement");
const { downloadFiles } = require("./downloadStorage");

module.exports = {
    deleteUnusedImages: functions.https.onRequest(deleteUnusedImages),
    moveEditedQuestionImages: functions.https.onRequest(
        moveEditedQuestionImages
    ),
    movePaperImages: functions.https.onRequest(movePaperImages),
    moveQuestionImages: functions.https.onRequest(moveQuestionImages),
    moveUserImages: functions.https.onRequest(moveUserImages),
    downloadFiles: functions.https.onRequest(downloadFiles)
};
