const router = require('express').Router();
const dbSchema = require('../schemaModels/dbSchema');

router.get('/:guid', async (req, res) => {
    try {
        const fileData = await dbSchema.findOne({ guid: req.params.guid });
        if (!fileData)
            return res.render('download', { error: 'Link has been modified' });
        const downloadPath = `${__dirname}/../${fileData.filePath}`
        res.download(downloadPath);
    } catch (err) {
        return res.render('download', { error: 'Something went wrong' });
    }
})

module.exports = router;