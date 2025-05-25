const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html, attachments }) => {
  await transporter.sendMail({
    from: `"Sistema de Pagamento" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};
