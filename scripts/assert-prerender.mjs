import { existsSync, readFileSync } from "node:fs";

const analyticsId = "G-QJ225E7TQE";
const googleSiteVerification = "1a7IQKDRhoR_F_NmvHr3Njs5uB2rXhYaBBpswdcnQO4";

const cvCandidates = [
  "dist/client/cv/index.html",
  "dist/client/cv.html",
  "dist/public/cv/index.html",
  ".output/public/cv/index.html",
  ".output/public/cv.html",
];

const rootCandidates = [
  "dist/client/index.html",
  "dist/public/index.html",
  ".output/public/index.html",
];

const cvMatch = cvCandidates.find((candidate) => existsSync(candidate));
const rootMatch = rootCandidates.find((candidate) => existsSync(candidate));

if (!rootMatch) {
  throw new Error(`Could not find prerendered / HTML. Checked: ${rootCandidates.join(", ")}`);
}

if (!cvMatch) {
  throw new Error(`Could not find prerendered /cv HTML. Checked: ${cvCandidates.join(", ")}`);
}

const rootHtml = readFileSync(rootMatch, "utf8");

assertIncludes(rootMatch, rootHtml, "<h1");
assertIncludes(rootMatch, rootHtml, "Eugene Mirotin CV");

const cvHtml = readFileSync(cvMatch, "utf8");

assertIncludes(cvMatch, cvHtml, "<h1");
assertIncludes(cvMatch, cvHtml, "Eugene Mirotin");

for (const [match, html] of [
  [rootMatch, rootHtml],
  [cvMatch, cvHtml],
]) {
  assertIncludes(match, html, `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`);
  assertIncludes(match, html, `gtag("config", "${analyticsId}")`);
  assertIncludes(match, html, `content="${googleSiteVerification}"`);
  assertIncludes(match, html, `href="/fav.ico"`);
  assertIncludes(match, html, `property="og:image" content="/images/me.jpg"`);
  assertIncludes(match, html, `name="twitter:image" content="/images/me.jpg"`);
}

console.log(`Verified prerendered root HTML at ${rootMatch}`);
console.log(`Verified prerendered CV HTML at ${cvMatch}`);

function assertIncludes(match, html, expected) {
  if (!html.includes(expected)) {
    throw new Error(`${match} does not contain expected HTML: ${expected}`);
  }
}
