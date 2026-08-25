const nodemailer = require("nodemailer");

/**
 * Sends an email via SMTP using credentials from backend/.env.
 *
 * Required .env variables: EMAIL_HOST, EMAIL_USER, EMAIL_PASS
 * Optional: EMAIL_PORT (defaults to 587), EMAIL_FROM (defaults to EMAIL_USER)
 *
 * Throws if the required config is missing or if sending fails — callers
 * are expected to catch this and decide what to do (e.g. fall back to
 * logging the content instead, as authController.js does for password resets).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "Email service is not configured — set EMAIL_HOST, EMAIL_USER and EMAIL_PASS in backend/.env"
    );
  }

  const port = Number(EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465, // true for port 465 (SSL), false for 587/others (STARTTLS)
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
