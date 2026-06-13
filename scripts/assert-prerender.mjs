import { existsSync, readFileSync } from "node:fs";

const candidates = [
  "dist/client/cv/index.html",
  "dist/client/cv.html",
  "dist/public/cv/index.html",
  ".output/public/cv/index.html",
  ".output/public/cv.html",
];

const match = candidates.find((candidate) => existsSync(candidate));

if (!match) {
  throw new Error(`Could not find prerendered /cv HTML. Checked: ${candidates.join(", ")}`);
}

const html = readFileSync(match, "utf8");

if (!html.includes("<h1") || !html.includes("Eugene Mirotin")) {
  throw new Error(`${match} does not contain the expected prerendered CV HTML.`);
}

console.log(`Verified prerendered CV HTML at ${match}`);
