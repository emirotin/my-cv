const SITE_TITLE = "Eugene Mirotin - CV Assistant";
const SITE_DESCRIPTION = "Eugene Mirotin CV with an interactive in-browser AI assistant.";
const SITE_IMAGE = "/images/me.jpg";
const GOOGLE_SITE_VERIFICATION = "1a7IQKDRhoR_F_NmvHr3Njs5uB2rXhYaBBpswdcnQO4";
const GOOGLE_ANALYTICS_ID = "G-QJ225E7TQE";

const GOOGLE_ANALYTICS_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "${GOOGLE_ANALYTICS_ID}");
`;

export {
  GOOGLE_ANALYTICS_ID,
  GOOGLE_ANALYTICS_SCRIPT,
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_TITLE,
};
