import { existsSync, readFileSync } from "node:fs";

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

if (!rootHtml.includes("<h1") || !rootHtml.includes("Eugene Mirotin CV")) {
  throw new Error(`${rootMatch} does not contain the expected prerendered root HTML.`);
}

const cvHtml = readFileSync(cvMatch, "utf8");

if (!cvHtml.includes("<h1") || !cvHtml.includes("Eugene Mirotin")) {
  throw new Error(`${cvMatch} does not contain the expected prerendered CV HTML.`);
}

console.log(`Verified prerendered root HTML at ${rootMatch}`);
console.log(`Verified prerendered CV HTML at ${cvMatch}`);
