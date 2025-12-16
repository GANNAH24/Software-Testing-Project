const nodemailer = require('nodemailer');
const logger = require('./logger.util');

// Read SMTP config from env
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM
} = process.env;

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    logger.warn('Email disabled: SMTP env vars not set (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    logger.warn('Skipping email: missing recipient');
    return { skipped: true };
  }

  const tx = getTransporter();
  if (!tx) {
    // Fallback: log to console for development
    logger.info('Email fallback (logged only)', { to, subject, text });
    return { logged: true };
  }

  const from = MAIL_FROM || `Se7ety Healthcare <no-reply@se7ety.local>`;
  const info = await tx.sendMail({ from, to, subject, text, html });
  logger.info('Email sent', { messageId: info.messageId, to });
  return { sent: true, messageId: info.messageId };
}

module.exports = { sendEmail };
