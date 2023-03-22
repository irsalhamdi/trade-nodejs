const nodemailer = require('nodemailer');
const nodeMailer = require('../utils/nodeMailer');

const sendEmail = async({to, subject, html}) => {
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport(nodeMailer);

    return transporter.sendMail({
        from: '"Irsal Hamdi 👻" <irsalhamdi@gmail.com>', 
        to: to,
        subject: subject,
        html: html
      });
}

module.exports = sendEmail;