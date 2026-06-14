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

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const inputPath = path.join(repoRoot, "cv", "cv_brief.md");
const outputPath = path.join(repoRoot, "cv", "eugene_mirotin_cv.pdf");
const fontPackagePath = path.join(
  repoRoot,
  "node_modules",
  "@fontsource-variable",
  "geist-mono",
);

const markdown = await readFile(inputPath, "utf8");
const fontCss = await readFontCss();
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
  await page.setContent(renderDocument(html, fontCss), { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;

    if (!document.fonts.check('10pt "Geist Mono Variable"', "Eugene Mirotin")) {
      throw new Error("Geist Mono Variable did not load.");
    }
  });
  await page.pdf({
    path: outputPath,
    format: "Letter",
    preferCSSPageSize: true,
    printBackground: true,
  });
} finally {
  await browser.close();
}

console.log(
  `Printed ${path.relative(repoRoot, inputPath)} to ${path.relative(repoRoot, outputPath)}`,
);

async function readFontCss() {
  let css = (
    await Promise.all(
      ["index.css", "wght-italic.css"].map((fileName) =>
        readFile(path.join(fontPackagePath, fileName), "utf8"),
      ),
    )
  ).join("\n");

  const fileNames = [...css.matchAll(/url\(\.\/files\/([^)]+)\)/g)].map(
    (match) => match[1],
  );

  for (const fileName of new Set(fileNames)) {
    const font = await readFile(path.join(fontPackagePath, "files", fileName));
    const fontUrl = `url(data:font/woff2;base64,${font.toString("base64")})`;

    css = css.replaceAll(`url(./files/${fileName})`, fontUrl);
  }

  return css.replaceAll("format('woff2-variations')", "format('woff2')");
}

function renderDocument(content, fontCss) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Eugene Mirotin CV</title>
    <style>
      ${fontCss}

      @page {
        size: Letter;
        margin: 0.5in 0.25in 0.25in 0.5in;
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
        font-family: "Geist Mono Variable", ui-monospace, "SFMono-Regular", Consolas, monospace;
        font-size: 10pt;
        line-height: 1.32;
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
        margin: 0;
        font-size: 24pt;
        font-weight: 750;
      }

      h2 {
        margin: 6pt 0;
        padding-bottom: 1.5pt;
        font-size: 12pt;
        font-weight: 750;
      }

      h3 {
        margin: 6pt 0;
        font-size: 10.7pt;
        font-weight: 750;
      }

      p,
      ul {
        margin: 2.5pt 0;
      }

      ul {
        padding-left: 13pt;
      }

      li {
        margin: 1.5pt 0;
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
