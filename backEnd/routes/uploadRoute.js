const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const dbSchema = require('../schemaModels/dbSchema');
const { v4: uuid4 } = require('uuid');

//multer configuration
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploadedFiles/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-file${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 * 100 }, //100mb
}).single('uploadedFile_');

//post method call server side
router.post('/', (req, res) => {
    //TODO: storing the file
    upload(req, res, async (err) => {
        //TODO: validate request
        if (!req.file)
            return res.json({ error: 'All fields are required' });

        if (err)
            return res.status(500).send({ error: err.message });
        //TODO: data to be stored in db
        const fileData = new dbSchema({
            fileName: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            guid: uuid4()
            // sender: req.body.contact,
            // receiver: encrypted.password
        });

        const response = await fileData.save();
        //TODO: response link to get the file
        return res.json({ file: `${process.env.WEB_HOST_URL}/filesDownload/${response.guid}` });
    })
});

router.post('/sendMail', async (req, res) => {
    const { guid, toEmail, fromEmail } = req.body;
    //validation
    if (!guid || !toEmail || !fromEmail)
        return res.status(422).send({ error: "All fields are required" })

    //getting data from database
    const fileData = await dbSchema.findOne({ guid: guid });

    //if email sender is already there for the file then not to send the mail again 
    if (fileData.sender)
        return res.status(422).send({ error: "Email has already been sent" });

    //mail sending
    const sendEmail = require('../services/emailService');
    try {
        await sendEmail({
            from: fromEmail,
            to: toEmail,
            emailSubject: "CloudPort - File Sharing",
            emailTextReciever: `${fromEmail} has shared a file with you`,
            emailTextSender: `File has been shared successfully to: ${toEmail}`,
            htmlTemplate: require('../services/emailTemplate')({
                fromEmail: fromEmail,
                downloadLink: `${process.env.WEB_HOST_URL}/filesDownload/${fileData.guid}`,
                fileSize: parseInt(fileData.fileSize / 1000) + ' KB',
                expiresIn: '24 Hours'
            })
        });
        //updating the value in the database if email is not sent
        fileData.sender = fromEmail;
        fileData.receiver = toEmail;
        //FIXME:// const response = 
        await fileData.save();
        return res.status(200).send({ success: "Mail has been sent successfully" });
    } catch (err) {
        console.log("Error occured while sending mail, Error: ", err);
        return res.status(409).send({ error: "Error occured while sending mail" });
    }
});

module.exports = router;