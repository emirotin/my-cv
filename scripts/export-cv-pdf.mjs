import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(repoRoot, "cv", "cv_brief.md");
const outputPath = path.join(repoRoot, "eugene_mirotin_cv.pdf");

const markdown = await readFile(inputPath, "utf8");
const html = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown),
);

const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: {
      width: 816,
      height: 1056,
    },
  });

  await page.emulateMedia({ media: "print" });
  await page.setContent(renderDocument(html), { waitUntil: "load" });
  await page.pdf({
    path: outputPath,
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
  });
} finally {
  await browser.close();
}

console.log(`Printed ${path.relative(repoRoot, inputPath)} to ${path.relative(repoRoot, outputPath)}`);

function renderDocument(content) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Eugene Mirotin CV</title>
    <style>
      @page {
        size: Letter;
        margin: 0.55in 0.62in;
      }

      :root {
        color-scheme: light;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #171717;
        background: #ffffff;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 10.35pt;
        line-height: 1.36;
      }

      main {
        width: 100%;
      }

      h1,
      h2,
      h3 {
        color: #0f172a;
        line-height: 1.15;
      }

      h1 {
        margin: 0 0 4pt;
        font-size: 24pt;
        font-weight: 750;
      }

      h2 {
        margin: 12pt 0 4.5pt;
        padding-bottom: 2.5pt;
        border-bottom: 0.6pt solid #cbd5e1;
        font-size: 12pt;
        font-weight: 750;
      }

      h3 {
        margin: 8pt 0 2pt;
        font-size: 10.7pt;
        font-weight: 750;
      }

      p,
      ul {
        margin: 3.5pt 0;
      }

      ul {
        padding-left: 13pt;
      }

      li {
        margin: 2pt 0;
        padding-left: 1pt;
      }

      strong {
        font-weight: 750;
      }

      em {
        color: #475569;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      hr {
        margin: 8pt 0;
        border: 0;
        border-top: 0.6pt solid #d7dee8;
      }

      h2,
      h3 {
        break-after: avoid;
      }

      li,
      p {
        break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <main>${content}</main>
  </body>
</html>`;
}
