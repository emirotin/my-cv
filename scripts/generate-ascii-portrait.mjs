import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MIN_SIZE = 10;
const MAX_SIZE = 160;
const DENSITY_CHARSET = " .:-=+*#%@";
const DEFAULT_INPUT = "public/images/me.jpg";
const DEFAULT_OUTPUT = "src/lib/ascii-portrait.ts";
const TERMINAL_PORTRAIT_CONFIG = "src/lib/terminal-portrait-config.json";
const terminalConfig = await readTerminalPortraitConfig();
const DEFAULT_CHARSET_NAME = terminalConfig.portraitCharset;
const DEFAULT_CELL_WIDTH = terminalConfig.glyphCellWidth;
const DEFAULT_CELL_HEIGHT = terminalConfig.glyphCellHeight;
const DEFAULT_FONT_FAMILY = terminalConfig.fontFamily;
const DEFAULT_FONT_SIZE = terminalConfig.fontSize;
const DEFAULT_HEIGHT = terminalConfig.portraitHeight;
const DEFAULT_RENDERER = terminalConfig.portraitRenderer;
const DEFAULT_WIDTH = terminalConfig.portraitWidth;
const DEFAULT_CONTRAST_WEIGHT = terminalConfig.portraitContrastWeight;
const DEFAULT_INK_CEILING = terminalConfig.portraitInkCeiling;
const DEFAULT_INK_FLOOR = terminalConfig.portraitInkFloor;
const DEFAULT_INK_SCALE = terminalConfig.portraitInkScale;
const DEFAULT_NEIGHBOR_REPEAT_PENALTY = terminalConfig.portraitNeighborRepeatPenalty;
const DEFAULT_NEIGHBOR_SIMILARITY_THRESHOLD = terminalConfig.portraitNeighborSimilarityThreshold;
const DEFAULT_SHAPE_WEIGHT = terminalConfig.portraitShapeWeight;
const DEFAULT_SHIMMER_DARK_THRESHOLD = terminalConfig.portraitShimmerDarkThreshold;
const DEFAULT_SHIMMER_STRENGTH = terminalConfig.portraitShimmerStrength;
const DEFAULT_TONE_GAMMA = terminalConfig.portraitToneGamma;
const DEFAULT_TONE_HIGH_PERCENTILE = terminalConfig.portraitToneHighPercentile;
const DEFAULT_TONE_LOW_PERCENTILE = terminalConfig.portraitToneLowPercentile;
const DEFAULT_TONE_WEIGHT = terminalConfig.portraitToneWeight;
const MATCHER = "glyph";

const options = parseArgs(process.argv.slice(2));
const ascii = await imageToAscii(options);

if (options.output === "-") {
  process.stdout.write(`${ascii}\n`);
} else {
  await writePortraitModule(options.output, ascii, options);
  console.log(
    `Wrote ${options.width}x${options.height} ASCII portrait to ${options.output} from ${options.input}`,
  );
}

async function imageToAscii(options) {
  const { cellHeight, cellWidth, height, input, width } = options;
  const glyphTemplates = await renderGlyphTemplates(options);
  const glyphSimilarity = buildGlyphSimilarity(glyphTemplates);
  const { data, info } = await sharp(input)
    .resize(width * cellWidth, height * cellHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const targetInk = buildTargetInkBuffer(data, info, options);

  const lines = [];

  for (let y = 0; y < height; y += 1) {
    let line = "";

    for (let x = 0; x < width; x += 1) {
      const char = findClosestGlyph({
        cellHeight,
        cellWidth,
        glyphTemplates,
        glyphSimilarity,
        targetInk,
        imageWidth: info.width,
        leftChar: line.at(-1),
        options,
        previousLine: lines.at(-1),
        previousLineIndex: x,
        x: x * cellWidth,
        y: y * cellHeight,
      });

      line += char;
    }

    lines.push(line);
  }

  return lines.join("\n");
}

async function renderGlyphTemplates(options) {
  if (options.renderer === "browser") {
    return renderBrowserGlyphTemplates(options);
  }

  return renderSvgGlyphTemplates(options);
}

async function renderBrowserGlyphTemplates({ cellHeight, cellWidth, charset, fontFamily, fontSize }) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: {
        height: cellHeight,
        width: cellWidth,
      },
    });

    const rendered = await page.evaluate(
      ({ cellHeight, cellWidth, chars, fontFamily, fontSize }) => {
        const canvas = document.createElement("canvas");
        canvas.height = cellHeight;
        canvas.width = cellWidth;

        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!context) {
          throw new Error("Could not create a 2D canvas context.");
        }

        return chars.map((char) => {
          context.clearRect(0, 0, cellWidth, cellHeight);
          context.fillStyle = "#000";
          context.fillRect(0, 0, cellWidth, cellHeight);
          context.fillStyle = "#fff";
          context.font = `${fontSize}px ${fontFamily}`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(char, cellWidth / 2, cellHeight / 2);

          const rgba = context.getImageData(0, 0, cellWidth, cellHeight).data;
          const grayscale = [];

          for (let index = 0; index < rgba.length; index += 4) {
            grayscale.push(
              Math.round(
                0.2126 * rgba[index] + 0.7152 * rgba[index + 1] + 0.0722 * rgba[index + 2],
              ),
            );
          }

          return {
            char,
            data: grayscale,
          };
        });
      },
      {
        cellHeight,
        cellWidth,
        chars: Array.from(charset),
        fontFamily,
        fontSize,
      },
    );

    return rendered.map(({ char, data }) => buildGlyphTemplate(char, Uint8Array.from(data)));
  } finally {
    await browser.close();
  }
}

async function renderSvgGlyphTemplates({ cellHeight, cellWidth, charset, fontFamily, fontSize }) {
  const templates = [];

  for (const char of charset) {
    const data = await renderGlyphBitmap({
      cellHeight,
      cellWidth,
      char,
      fontFamily,
      fontSize,
    });

    templates.push(buildGlyphTemplate(char, data));
  }

  return templates;
}

async function renderGlyphBitmap({ cellHeight, cellWidth, char, fontFamily, fontSize }) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cellWidth}" height="${cellHeight}" viewBox="0 0 ${cellWidth} ${cellHeight}">`,
    '<rect width="100%" height="100%" fill="#000"/>',
    `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" fill="#fff">${escapeXml(char)}</text>`,
    "</svg>",
  ].join("");

  const { data } = await sharp(Buffer.from(svg)).grayscale().raw().toBuffer({
    resolveWithObject: true,
  });

  return data;
}

function findClosestGlyph({
  cellHeight,
  cellWidth,
  glyphSimilarity,
  glyphTemplates,
  imageWidth,
  leftChar,
  options,
  previousLine,
  previousLineIndex,
  targetInk,
  x,
  y,
}) {
  const targetStats = readCellStats({
    cellHeight,
    cellWidth,
    imageWidth,
    targetInk,
    x,
    y,
  });
  let bestChar = " ";
  let bestError = Number.POSITIVE_INFINITY;

  for (const { char, data, meanInk, stdevInk } of glyphTemplates) {
    let error = 0;

    for (let row = 0; row < cellHeight; row += 1) {
      for (let col = 0; col < cellWidth; col += 1) {
        const imageOffset = (y + row) * imageWidth + x + col;
        const templateOffset = row * cellWidth + col;
        const difference = (targetInk[imageOffset] ?? 0) - (data[templateOffset] ?? 0);

        error += difference * difference;
      }
    }

    const shapeError = error / (cellWidth * cellHeight);
    const toneError = (targetStats.mean - meanInk) ** 2;
    const contrastError = (targetStats.stdev - stdevInk) ** 2;
    const totalError =
      options.shapeWeight * shapeError +
      options.toneWeight * toneError +
      options.contrastWeight * contrastError +
      readNeighborSimilarityPenalty({
        char,
        glyphSimilarity,
        leftChar,
        options,
        previousLine,
        previousLineIndex,
        targetMean: targetStats.mean,
      });

    if (totalError < bestError) {
      bestChar = char;
      bestError = totalError;
    }
  }

  return bestChar;
}

function buildTargetInkBuffer(data, info, options) {
  const luminance = new Float32Array(info.width * info.height);

  for (let pixel = 0; pixel < luminance.length; pixel += 1) {
    const offset = pixel * info.channels;
    luminance[pixel] = data[offset] ?? 255;
  }

  const sorted = Array.from(luminance).sort((left, right) => left - right);
  const blackPoint = readPercentile(sorted, options.toneLowPercentile);
  const whitePoint = readPercentile(sorted, options.toneHighPercentile);
  const span = Math.max(1, whitePoint - blackPoint);
  const targetInk = new Float32Array(luminance.length);

  for (let pixel = 0; pixel < luminance.length; pixel += 1) {
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    const normalized = clamp((luminance[pixel] - blackPoint) / span, 0, 1);
    const curve = Math.pow(1 - normalized, options.toneGamma);
    const scaledCurve = clamp(curve * options.inkScale, 0, 1);
    const baseInk =
      options.inkFloor + scaledCurve * (options.inkCeiling - options.inkFloor);
    const darkness = smoothstep(options.shimmerDarkThreshold, 1, curve);
    const cellX = Math.floor(x / options.cellWidth);
    const cellY = Math.floor(y / options.cellHeight);
    const shimmer = (hashToUnit(cellX, cellY) * 2 - 1) * options.shimmerStrength * darkness;

    targetInk[pixel] = clamp(baseInk + shimmer, options.inkFloor, options.inkCeiling);
  }

  return targetInk;
}

function readNeighborSimilarityPenalty({
  char,
  glyphSimilarity,
  leftChar,
  options,
  previousLine,
  previousLineIndex,
  targetMean,
}) {
  if (options.neighborRepeatPenalty === 0 || targetMean < options.inkFloor + 6) {
    return 0;
  }

  let penalty = 0;

  penalty += readGlyphSimilarityPenalty({
    char,
    glyphSimilarity,
    neighborChar: leftChar,
    options,
    weight: 1,
  });
  penalty += readGlyphSimilarityPenalty({
    char,
    glyphSimilarity,
    neighborChar: previousLine?.[previousLineIndex],
    options,
    weight: 1,
  });
  penalty += readGlyphSimilarityPenalty({
    char,
    glyphSimilarity,
    neighborChar: previousLineIndex > 0 ? previousLine?.[previousLineIndex - 1] : undefined,
    options,
    weight: 0.5,
  });
  penalty += readGlyphSimilarityPenalty({
    char,
    glyphSimilarity,
    neighborChar: previousLine?.[previousLineIndex + 1],
    options,
    weight: 0.5,
  });

  return penalty;
}

function readGlyphSimilarityPenalty({ char, glyphSimilarity, neighborChar, options, weight }) {
  if (!neighborChar) {
    return 0;
  }

  const distance = glyphSimilarity.get(char)?.get(neighborChar);

  if (!Number.isFinite(distance)) {
    return 0;
  }

  const similarity = clamp(1 - distance / options.neighborSimilarityThreshold, 0, 1);

  return similarity * weight * options.neighborRepeatPenalty;
}

function buildGlyphSimilarity(glyphTemplates) {
  const similarity = new Map();

  for (const left of glyphTemplates) {
    const distances = new Map();

    for (const right of glyphTemplates) {
      distances.set(
        right.char,
        left.char === right.char ? 0 : readMeanSquaredDifference(left.data, right.data),
      );
    }

    similarity.set(left.char, distances);
  }

  return similarity;
}

function readMeanSquaredDifference(left, right) {
  let error = 0;

  for (let index = 0; index < left.length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);

    error += difference * difference;
  }

  return error / left.length;
}

function buildGlyphTemplate(char, data) {
  const { mean, stdev } = readStats(data);

  return {
    char,
    data,
    meanInk: mean,
    stdevInk: stdev,
  };
}

function readCellStats({ cellHeight, cellWidth, imageWidth, targetInk, x, y }) {
  let count = 0;
  let sum = 0;
  let sumSquares = 0;

  for (let row = 0; row < cellHeight; row += 1) {
    for (let col = 0; col < cellWidth; col += 1) {
      const value = targetInk[(y + row) * imageWidth + x + col] ?? 0;
      count += 1;
      sum += value;
      sumSquares += value * value;
    }
  }

  return statsFromSums(sum, sumSquares, count);
}

function readStats(data) {
  let sum = 0;
  let sumSquares = 0;

  for (const value of data) {
    sum += value;
    sumSquares += value * value;
  }

  return statsFromSums(sum, sumSquares, data.length);
}

function statsFromSums(sum, sumSquares, count) {
  const mean = count === 0 ? 0 : sum / count;
  const variance = count === 0 ? 0 : Math.max(0, sumSquares / count - mean * mean);

  return {
    mean,
    stdev: Math.sqrt(variance),
  };
}

async function writePortraitModule(output, ascii, options) {
  const { charset, charsetName, height, input, renderer, width } = options;
  const outputPath = path.resolve(output);
  const source = [
    "// Generated by scripts/generate-ascii-portrait.mjs.",
    "// Re-run `pnpm generate:portrait`; use `node scripts/generate-ascii-portrait.mjs --size 120 --output -` for a 120x120 matrix.",
    `export const ASCII_PORTRAIT_SOURCE = ${JSON.stringify(toPosixPath(input))};`,
    `export const ASCII_PORTRAIT_WIDTH = ${width};`,
    `export const ASCII_PORTRAIT_HEIGHT = ${height};`,
    `export const ASCII_PORTRAIT_MATCHER = ${JSON.stringify(MATCHER)};`,
    `export const ASCII_PORTRAIT_RENDERER = ${JSON.stringify(renderer)};`,
    `export const ASCII_PORTRAIT_CHARSET_NAME = ${JSON.stringify(charsetName)};`,
    `export const ASCII_PORTRAIT_CHARSET = ${JSON.stringify(charset)};`,
    `export const ASCII_PORTRAIT = ${JSON.stringify(ascii)};`,
    "",
  ].join("\n");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, source);
}

function parseArgs(argv) {
  const parsed = {
    cellHeight: DEFAULT_CELL_HEIGHT,
    cellWidth: DEFAULT_CELL_WIDTH,
    charset: buildCharset(DEFAULT_CHARSET_NAME),
    charsetName: DEFAULT_CHARSET_NAME,
    contrastWeight: DEFAULT_CONTRAST_WEIGHT,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    height: DEFAULT_HEIGHT,
    inkCeiling: DEFAULT_INK_CEILING,
    inkFloor: DEFAULT_INK_FLOOR,
    inkScale: DEFAULT_INK_SCALE,
    input: DEFAULT_INPUT,
    neighborRepeatPenalty: DEFAULT_NEIGHBOR_REPEAT_PENALTY,
    neighborSimilarityThreshold: DEFAULT_NEIGHBOR_SIMILARITY_THRESHOLD,
    output: DEFAULT_OUTPUT,
    renderer: DEFAULT_RENDERER,
    shapeWeight: DEFAULT_SHAPE_WEIGHT,
    shimmerDarkThreshold: DEFAULT_SHIMMER_DARK_THRESHOLD,
    shimmerStrength: DEFAULT_SHIMMER_STRENGTH,
    toneGamma: DEFAULT_TONE_GAMMA,
    toneHighPercentile: DEFAULT_TONE_HIGH_PERCENTILE,
    toneLowPercentile: DEFAULT_TONE_LOW_PERCENTILE,
    toneWeight: DEFAULT_TONE_WEIGHT,
    width: DEFAULT_WIDTH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const { name, value } = readOption(argv, index);

    if (value.consumedNext) {
      index += 1;
    }

    switch (name) {
      case "cell-height":
      case "glyph-height":
        parsed.cellHeight = parsePositiveInteger(value.text, name);
        break;
      case "cell-width":
      case "glyph-width":
        parsed.cellWidth = parsePositiveInteger(value.text, name);
        break;
      case "charset":
        parsed.charset = buildCharset(value.text);
        parsed.charsetName = value.text;
        break;
      case "chars":
        parsed.charset = value.text;
        parsed.charsetName = "custom";
        break;
      case "contrast-weight":
        parsed.contrastWeight = parseNonNegativeNumber(value.text, "contrast-weight");
        break;
      case "font-family":
        parsed.fontFamily = value.text;
        break;
      case "font-size":
        parsed.fontSize = parsePositiveInteger(value.text, "font-size");
        break;
      case "height":
        parsed.height = parseSize(value.text, "height");
        break;
      case "ink-ceiling":
        parsed.inkCeiling = parseInkLimit(value.text, "ink-ceiling");
        break;
      case "ink-floor":
        parsed.inkFloor = parseInkLimit(value.text, "ink-floor");
        break;
      case "ink-scale":
        parsed.inkScale = parsePositiveNumber(value.text, "ink-scale");
        break;
      case "input":
        parsed.input = value.text;
        break;
      case "neighbor-repeat-penalty":
      case "repeat-penalty":
        parsed.neighborRepeatPenalty = parseNonNegativeNumber(value.text, name);
        break;
      case "neighbor-similarity-threshold":
        parsed.neighborSimilarityThreshold = parsePositiveNumber(value.text, name);
        break;
      case "matrix": {
        const { height, width } = parseMatrix(value.text);
        parsed.height = height;
        parsed.width = width;
        break;
      }
      case "output":
        parsed.output = value.text;
        break;
      case "renderer":
        parsed.renderer = parseRenderer(value.text);
        break;
      case "shape-weight":
        parsed.shapeWeight = parseNonNegativeNumber(value.text, "shape-weight");
        break;
      case "shimmer-dark-threshold":
        parsed.shimmerDarkThreshold = parseUnitInterval(value.text, "shimmer-dark-threshold");
        break;
      case "shimmer-strength":
        parsed.shimmerStrength = parseNonNegativeNumber(value.text, "shimmer-strength");
        break;
      case "size": {
        const size = parseSize(value.text, "size");
        parsed.height = size;
        parsed.width = size;
        break;
      }
      case "tone-gamma":
        parsed.toneGamma = parsePositiveNumber(value.text, "tone-gamma");
        break;
      case "tone-high-percentile":
        parsed.toneHighPercentile = parseUnitInterval(value.text, "tone-high-percentile");
        break;
      case "tone-low-percentile":
        parsed.toneLowPercentile = parseUnitInterval(value.text, "tone-low-percentile");
        break;
      case "tone-weight":
        parsed.toneWeight = parseNonNegativeNumber(value.text, "tone-weight");
        break;
      case "width":
        parsed.width = parseSize(value.text, "width");
        break;
      default:
        throw new Error(`Unknown option: --${name}`);
    }
  }

  if (parsed.charset.length < 2) {
    throw new Error("The glyph charset must contain at least two characters.");
  }

  if (parsed.toneLowPercentile >= parsed.toneHighPercentile) {
    throw new Error("--tone-low-percentile must be lower than --tone-high-percentile.");
  }

  if (parsed.inkFloor >= parsed.inkCeiling) {
    throw new Error("--ink-floor must be lower than --ink-ceiling.");
  }

  return parsed;
}

async function readTerminalPortraitConfig() {
  const rawConfig = await readFile(path.resolve(TERMINAL_PORTRAIT_CONFIG), "utf8");
  const parsed = JSON.parse(rawConfig);

  return {
    fontFamily: readStringProperty(parsed, "fontFamily"),
    fontSize: parsePositiveInteger(String(parsed.fontSize), "terminal config fontSize"),
    glyphCellHeight: parsePositiveInteger(
      String(parsed.glyphCellHeight),
      "terminal config glyphCellHeight",
    ),
    glyphCellWidth: parsePositiveInteger(
      String(parsed.glyphCellWidth),
      "terminal config glyphCellWidth",
    ),
    portraitCharset: readStringProperty(parsed, "portraitCharset"),
    portraitContrastWeight: readNonNegativeNumberProperty(parsed, "portraitContrastWeight"),
    portraitHeight: parseSize(String(parsed.portraitHeight), "terminal config portraitHeight"),
    portraitInkCeiling: readInkLimitProperty(parsed, "portraitInkCeiling"),
    portraitInkFloor: readInkLimitProperty(parsed, "portraitInkFloor"),
    portraitInkScale: readPositiveNumberProperty(parsed, "portraitInkScale"),
    portraitNeighborRepeatPenalty: readNonNegativeNumberProperty(
      parsed,
      "portraitNeighborRepeatPenalty",
    ),
    portraitNeighborSimilarityThreshold: readPositiveNumberProperty(
      parsed,
      "portraitNeighborSimilarityThreshold",
    ),
    portraitRenderer: parseRenderer(readStringProperty(parsed, "portraitRenderer")),
    portraitShapeWeight: readNonNegativeNumberProperty(parsed, "portraitShapeWeight"),
    portraitShimmerDarkThreshold: readUnitIntervalProperty(parsed, "portraitShimmerDarkThreshold"),
    portraitShimmerStrength: readNonNegativeNumberProperty(parsed, "portraitShimmerStrength"),
    portraitToneGamma: readPositiveNumberProperty(parsed, "portraitToneGamma"),
    portraitToneHighPercentile: readUnitIntervalProperty(parsed, "portraitToneHighPercentile"),
    portraitToneLowPercentile: readUnitIntervalProperty(parsed, "portraitToneLowPercentile"),
    portraitToneWeight: readNonNegativeNumberProperty(parsed, "portraitToneWeight"),
    portraitWidth: parseSize(String(parsed.portraitWidth), "terminal config portraitWidth"),
  };
}

function readStringProperty(value, key) {
  const property = value?.[key];

  if (typeof property !== "string" || property.trim().length === 0) {
    throw new Error(`${TERMINAL_PORTRAIT_CONFIG} must define a non-empty ${key} string.`);
  }

  return property;
}

function readNonNegativeNumberProperty(value, key) {
  return parseNonNegativeNumber(String(value?.[key]), `terminal config ${key}`);
}

function readPositiveNumberProperty(value, key) {
  return parsePositiveNumber(String(value?.[key]), `terminal config ${key}`);
}

function readUnitIntervalProperty(value, key) {
  return parseUnitInterval(String(value?.[key]), `terminal config ${key}`);
}

function readInkLimitProperty(value, key) {
  return parseInkLimit(String(value?.[key]), `terminal config ${key}`);
}

function buildCharset(name) {
  switch (name) {
    case "density":
      return DENSITY_CHARSET;
    case "latin1":
    case DEFAULT_CHARSET_NAME:
      return buildPrintableLatin1Charset();
    default:
      throw new Error(
        `Unknown charset: ${name}. Use "latin1", "${DEFAULT_CHARSET_NAME}", "density", or --chars for a custom set.`,
      );
  }
}

function buildPrintableLatin1Charset() {
  const chars = [" "];

  for (let codePoint = 0x21; codePoint <= 0x7e; codePoint += 1) {
    chars.push(String.fromCodePoint(codePoint));
  }

  for (let codePoint = 0xa1; codePoint <= 0xff; codePoint += 1) {
    if (codePoint !== 0xad) {
      chars.push(String.fromCodePoint(codePoint));
    }
  }

  return chars.join("");
}

function readOption(argv, index) {
  const argument = argv[index];

  if (!argument?.startsWith("--")) {
    throw new Error(`Expected an option, received: ${argument ?? "<missing>"}`);
  }

  const equalsIndex = argument.indexOf("=");

  if (equalsIndex >= 0) {
    return {
      name: argument.slice(2, equalsIndex),
      value: {
        consumedNext: false,
        text: argument.slice(equalsIndex + 1),
      },
    };
  }

  const next = argv[index + 1];

  if (!next || next.startsWith("--")) {
    throw new Error(`Missing value for ${argument}`);
  }

  return {
    name: argument.slice(2),
    value: {
      consumedNext: true,
      text: next,
    },
  };
}

function parseSize(value, name) {
  const size = Number(value);

  if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE) {
    throw new Error(`--${name} must be an integer between ${MIN_SIZE} and ${MAX_SIZE}.`);
  }

  return size;
}

function parsePositiveInteger(value, name) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`--${name} must be a positive integer.`);
  }

  return number;
}

function parsePositiveNumber(value, name) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`--${name} must be a positive number.`);
  }

  return number;
}

function parseNonNegativeNumber(value, name) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`--${name} must be a non-negative number.`);
  }

  return number;
}

function parseUnitInterval(value, name) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new Error(`--${name} must be a number between 0 and 1.`);
  }

  return number;
}

function parseInkLimit(value, name) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 255) {
    throw new Error(`--${name} must be a number between 0 and 255.`);
  }

  return number;
}

function parseRenderer(value) {
  if (value === "browser" || value === "svg") {
    return value;
  }

  throw new Error('--renderer must be "browser" or "svg".');
}

function parseMatrix(value) {
  const match = /^(?<width>\d+)x(?<height>\d+)$/i.exec(value);

  if (!match?.groups) {
    throw new Error("--matrix must use WIDTHxHEIGHT format.");
  }

  return {
    height: parseSize(match.groups.height, "matrix height"),
    width: parseSize(match.groups.width, "matrix width"),
  };
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function readPercentile(sortedValues, percentile) {
  const index = Math.round((sortedValues.length - 1) * percentile);

  return sortedValues[index] ?? 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, value) {
  const normalized = clamp((value - edge0) / Math.max(Number.EPSILON, edge1 - edge0), 0, 1);

  return normalized * normalized * (3 - 2 * normalized);
}

function hashToUnit(x, y) {
  let value = Math.imul(x + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(y + 0xc2b2ae35, 0x27d4eb2f);
  value ^= value >>> 15;
  value = Math.imul(value, 0x2c1b3c6d);
  value ^= value >>> 12;
  value = Math.imul(value, 0x297a2d39);
  value ^= value >>> 15;

  return (value >>> 0) / 0x100000000;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
