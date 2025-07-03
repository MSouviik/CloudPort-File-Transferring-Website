const router = require('express').Router();
const dbSchema = require('../schemaModels/dbSchema');

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

    //updating the value in the database if email is not sent
    fileData.sender = fromEmail;
    fileData.receiver = toEmail;
    // const response = 
    await fileData.save();

    //mail sending
    try {
        const sendEmail = require('../services/emailService');
        sendEmail({
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
        return res.status(200).send({ success: "Mail has been sent successfully" });

    } catch (err) {
        return res.status(409).send({ error: "Error occured while sending mails" });
    }
});

module.exports = router;