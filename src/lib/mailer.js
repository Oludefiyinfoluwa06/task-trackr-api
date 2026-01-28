const nodemailer = require('nodemailer');

async function sendMail({ to, subject, text, html }) {
  try {
    const port = process.env.SMTP_PORT;
      const secure = port === 465;
      const auth = process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth,
    });

    const from = process.env.FROM_EMAIL;
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (err) {
    console.error('Mailer error', err);
    throw err;
  }
}

module.exports = { sendMail };
