const router = require('express').Router();
const dbSchema = require('../schemaModels/dbSchema');

router.get('/:guid', async (req, res) => {
    try {
        const fileData = await dbSchema.findOne({ guid: req.params.guid });
        if (!fileData)
            return res.render('download', { error: 'Link has been modified' });
        return res.render('download', {
            guid: fileData.guid,
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            downloadLink: `${process.env.WEB_HOST_URL}/filesDownload/download/${fileData.guid}`
        })
    } catch (err) {
        return res.render('download', { error: 'Something went wrong' });
    }

});

module.exports = router;