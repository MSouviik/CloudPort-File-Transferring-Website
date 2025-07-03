const nodemailer = require('nodemailer');

async function sendEmail({ from, to, emailSubject, emailTextReciever, emailTextSender, htmlTemplate }) {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_AUTH_USERNAME,
                pass: process.env.SMTP_AUTH_PASSWORD
            }
        });

        //sending the reciever download link
        let mailInfo = await transporter.sendMail({
            from: `fileShare ${from}`,
            to: to,
            subject: emailSubject,
            text: emailTextReciever,
            html: htmlTemplate
        });
        //sending the sender confirmation
        mailInfo = await transporter.sendMail({
            from: `fileShare fileShare.io`,
            to: from,
            subject: emailSubject,
            text: emailTextSender,
        });
    } catch (err) {
        throw err;
    }

}

module.exports = sendEmail;