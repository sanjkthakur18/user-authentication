const nodemailer = require("nodemailer");

const sendEmail = async (data, req, res) => { // Data needs to be passed before req. If the data is passed after res it won't work.

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD
        },
    });

    let info = await transporter.sendMail({
        from: '"Hey 👻 <abc@gmail.com>',
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.htm,
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendEmail };