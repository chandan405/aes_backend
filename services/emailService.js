require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = (options) => {
    const email = process.env.EMAIL || 'laurel.lowe@ethereal.email';
    const password = process.env.PASSWORD || '5N2VD9AueG2whkHn3j';

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: email,
            pass: password
        }
    });

    const mailOptions = {
        from: email,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending mail:', err);
                resolve({ success: false, error: err.message });
            } else {
                console.log('Email sent successfully:', info.response);
                resolve({ success: true, info });
            }
        });
    });
};

module.exports = { sendMail };
