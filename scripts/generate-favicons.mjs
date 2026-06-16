import { copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_INPUT = "public/images/me.jpg";
const DEFAULT_OUTPUT_DIR = "public";
const APPLE_ICON_SIZE = 180;
const APPLE_IMAGE_SIZE = 140;
const FAVICON_SIZE = 32;
const ICON_SIZE = 512;
const MASKABLE_SAFE_SIZE = 409;
const PWA_ICON_SIZE = 192;
const ICON_BACKGROUND = "#edf1f0";
const PNG_OPTIONS = {
  adaptiveFiltering: true,
  compressionLevel: 9,
  palette: false,
};

const options = parseArgs(process.argv.slice(2));

const icon512 = await buildSquareImage(options.input, ICON_SIZE).png(PNG_OPTIONS).toBuffer();
const icon192 = await buildSquareImage(options.input, PWA_ICON_SIZE).png(PNG_OPTIONS).toBuffer();
const icon32Raw = await buildSquareImage(options.input, FAVICON_SIZE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const appleTouchIcon = await buildInsetImage({
  background: ICON_BACKGROUND,
  canvasSize: APPLE_ICON_SIZE,
  imageSize: APPLE_IMAGE_SIZE,
  input: options.input,
});
const maskableIcon = await buildInsetImage({
  background: ICON_BACKGROUND,
  canvasSize: ICON_SIZE,
  imageSize: MASKABLE_SAFE_SIZE,
  input: options.input,
});
const svgIcon = await buildSvgIcon(options.input);

await writeFile(path.join(options.outputDir, "favicon.ico"), buildIco([icon32Raw]));
await copyFile(path.join(options.outputDir, "favicon.ico"), path.join(options.outputDir, "fav.ico"));
await writeFile(path.join(options.outputDir, "icon.svg"), svgIcon);
await writeFile(path.join(options.outputDir, "apple-touch-icon.png"), appleTouchIcon);
await writeFile(path.join(options.outputDir, "icon-192.png"), icon192);
await writeFile(path.join(options.outputDir, "icon-mask.png"), maskableIcon);
await writeFile(path.join(options.outputDir, "icon-512.png"), icon512);

console.log(`Generated favicon assets in ${options.outputDir} from ${options.input}`);

function parseArgs(args) {
  const options = {
    input: DEFAULT_INPUT,
    outputDir: DEFAULT_OUTPUT_DIR,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--input" && value) {
      options.input = value;
      index += 1;
      continue;
    }

    if (arg === "--output-dir" && value) {
      options.outputDir = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  return options;
}

function buildSquareImage(input, size) {
  return sharp(input)
    .rotate()
    .resize(size, size, {
      fit: "cover",
      kernel: sharp.kernel.lanczos3,
      position: "center",
    })
    .toColorspace("srgb");
}

async function buildInsetImage({ background, canvasSize, imageSize, input }) {
  const resizedImage = await buildSquareImage(input, imageSize).png(PNG_OPTIONS).toBuffer();

  return sharp({
    create: {
      background,
      channels: 4,
      height: canvasSize,
      width: canvasSize,
    },
  })
    .composite([
      {
        input: resizedImage,
        left: Math.round((canvasSize - imageSize) / 2),
        top: Math.round((canvasSize - imageSize) / 2),
      },
    ])
    .png(PNG_OPTIONS)
    .toBuffer();
}

async function buildSvgIcon(input) {
  const jpeg = await buildSquareImage(input, ICON_SIZE)
    .jpeg({ mozjpeg: true, quality: 88 })
    .toBuffer();

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    `<image width="512" height="512" href="data:image/jpeg;base64,${jpeg.toString("base64")}"/>`,
    "</svg>",
    "",
  ].join("\n");
}

function buildIco(images) {
  const headerSize = 6;
  const directoryEntrySize = 16;
  const directorySize = headerSize + directoryEntrySize * images.length;
  const imageBuffers = images.map(({ data, info }) => buildBitmapInfo(data, info));
  const size = directorySize + imageBuffers.reduce((total, buffer) => total + buffer.length, 0);
  const ico = Buffer.alloc(size);

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(images.length, 4);

  let imageOffset = directorySize;

  for (let index = 0; index < images.length; index += 1) {
    const { info } = images[index];
    const imageBuffer = imageBuffers[index];
    const entryOffset = headerSize + directoryEntrySize * index;

    ico.writeUInt8(iconDimension(info.width), entryOffset);
    ico.writeUInt8(iconDimension(info.height), entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(imageBuffer.length, entryOffset + 8);
    ico.writeUInt32LE(imageOffset, entryOffset + 12);
    imageBuffer.copy(ico, imageOffset);
    imageOffset += imageBuffer.length;
  }

  return ico;
}

function iconDimension(size) {
  if (size === 256) {
    return 0;
  }

  if (size < 1 || size > 255) {
    throw new Error(`Unsupported ICO dimension: ${size}`);
  }

  return size;
}

function buildBitmapInfo(data, info) {
  const { height, width } = info;
  const header = Buffer.alloc(40);
  const pixels = Buffer.alloc(width * height * 4);
  const maskStride = Math.ceil(width / 32) * 4;
  const mask = Buffer.alloc(maskStride * height);

  header.writeUInt32LE(40, 0);
  header.writeInt32LE(width, 4);
  header.writeInt32LE(height * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(pixels.length, 20);
  header.writeInt32LE(0, 24);
  header.writeInt32LE(0, 28);
  header.writeUInt32LE(0, 32);
  header.writeUInt32LE(0, 36);

  for (let y = 0; y < height; y += 1) {
    const sourceY = height - y - 1;

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (sourceY * width + x) * 4;
      const targetOffset = (y * width + x) * 4;

      pixels[targetOffset] = data[sourceOffset + 2];
      pixels[targetOffset + 1] = data[sourceOffset + 1];
      pixels[targetOffset + 2] = data[sourceOffset];
      pixels[targetOffset + 3] = data[sourceOffset + 3];
    }
  }

  return Buffer.concat([header, pixels, mask]);
}
