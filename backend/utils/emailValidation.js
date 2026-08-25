const validator = require("validator");

// Only these email providers are accepted at signup. Add/remove domains
// here as needed — this is the single source of truth for the whitelist.
const TRUSTED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
];

/**
 * Validates that a string is (a) a well-formed email address, and
 * (b) on a trusted/major provider's domain. Used to keep out throwaway or
 * fake email addresses at signup.
 */
const validateTrustedEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!TRUSTED_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      message: "Please sign up using a Gmail, Yahoo, Outlook, iCloud, or other major email provider.",
    };
  }

  return { valid: true };
};

module.exports = { validateTrustedEmail, TRUSTED_EMAIL_DOMAINS };
