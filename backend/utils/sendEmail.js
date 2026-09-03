/**
 * Sends transactional email via Brevo's HTTP API (https://www.brevo.com).
 *
 * We deliberately use an HTTPS API instead of raw SMTP (nodemailer) here:
 * free hosting platforms like Render often block or heavily throttle
 * outbound SMTP ports (25/465/587), which made emails silently hang
 * or fail there. A plain HTTPS POST request is not affected by that, so
 * this is the reliable option for a hosted deployment.
 *
 * Setup (free): create a Brevo account -> Settings -> SMTP & API -> API
 * Keys -> generate one, then verify a sender email under Senders &
 * Domains. Put both in backend/.env (see .env.example).
 */
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async ({ to, subject, text, html }) => {
  const { BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME } = process.env;

  if (!BREVO_API_KEY || !EMAIL_FROM) {
    const err = new Error(
      "Email sending isn't configured yet — set BREVO_API_KEY and EMAIL_FROM in backend/.env"
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // fail fast, never hang

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: EMAIL_FROM_NAME || "Independence Day Portal", email: EMAIL_FROM },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Email provider error (${response.status}): ${errorBody}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = sendEmail;
