const mongoose = require('mongoose');
const collectionSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    guid: { type: String, required: true },
    sender: { type: String, required: false },
    receiver: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('fileSharingData', collectionSchema, 'fileSharingData');