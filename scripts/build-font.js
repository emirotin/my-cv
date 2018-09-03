const Promise = require("bluebird");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const PNG = require("pngjs").PNG;

const readPng = filePath =>
  new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(
        new PNG({
          filterType: 4
        })
      )
      .on("parsed", function() {
        resolve(this);
      })
      .on("error", reject);
  });

const pngToMatrix = png => {
  const m = [];
  m.width = png.width;
  m.height = png.height;
  for (let i = 0; i < png.height; i++) {
    m[i] = [];
  }

  const d = png.data;
  let t = 0;

  const isWhite = () => d[t] === 255 && d[t + 1] === 255 && d[t + 2] === 255;

  for (let i = 0; i < m.height; i++) {
    for (let j = 0; j < m.width; j++) {
      m[i][j] = isWhite() ? 0 : 1;
      t += 4;
    }
  }

  return m;
};

const separateChars = matrix => {
  const chars = [];

  const w = matrix.width;
  const h = matrix.height;
  const widthInterval = _.range(0, w);

  // vertical trim
  let imin = 0;
  while (!_.some(widthInterval.map(j => matrix[imin][j]))) {
    imin += 1;
  }

  let imax = h - 1;
  while (!_.some(widthInterval.map(j => matrix[imax][j]))) {
    imax -= 1;
  }
  imax += 1;

  // vertical slice
  const slices = [];
  let state = 0; // 0 = whitespace, 1 = in character
  let sliceStart = imin;
  for (let i = imin; i <= imax; i++) {
    const allWhite = i == imax || !_.some(widthInterval.map(j => matrix[i][j]));
    if (state === 0 && !allWhite) {
      state = 1;
      sliceStart = i;
    } else if (state === 1 && allWhite) {
      state = 0;
      slices.push({
        sliceStart,
        sliceEnd: i - 1
      });
    }
  }

  // horizontal slice
  for ({ sliceStart, sliceEnd } of slices) {
    const sliceHeightInterval = _.range(sliceStart, sliceEnd + 1);
    // horizontal trim
    let jmin = 0;
    while (!_.some(sliceHeightInterval.map(i => matrix[i][jmin]))) {
      jmin += 1;
    }

    let jmax = w - 1;
    while (!_.some(sliceHeightInterval.map(i => matrix[i][jmax]))) {
      jmax -= 1;
    }
    jmax += 1;

    let state = 0; // 0 = whitespace, 1 = in character
    let charStart = jmin;
    for (let j = jmin; j <= jmax; j++) {
      const allWhite =
        j == jmax || !_.some(sliceHeightInterval.map(i => matrix[i][j]));
      if (state === 0 && !allWhite) {
        state = 1;
        charStart = j;
      } else if (state === 1 && allWhite) {
        state = 0;

        // extra vertical trim
        let charVertStart = sliceStart;
        while (!_.some(matrix[charVertStart].slice(charStart, j))) {
          charVertStart += 1;
        }

        let charVertEnd = sliceEnd;
        while (!_.some(matrix[charVertEnd].slice(charStart, j))) {
          charVertEnd -= 1;
        }

        chars.push(
          _.range(charVertStart, charVertEnd + 1).map(i =>
            matrix[i].slice(charStart, j)
          )
        );
      }
    }
  }

  return chars;
};

const mapChars = (chars, charMapping) => {
  const res = {};
  const parsedMap = [];
  for (const def of charMapping) {
    let { vOffset, chars: cs } =
      typeof def === "string" ? { vOffset: 0, chars: def } : def;
    for (const c of cs.split("")) {
      parsedMap.push({ char: c, vOffset });
    }
  }
  if (parsedMap.length !== chars.length) {
    throw new Error("Length mismatch between configured chars and detected");
  }
  parsedMap.forEach((def, i) => {
    res[def.char] = {
      char: chars[i],
      vOffset: def.vOffset
    };
  });

  return res;
};

const parseFile = (pngFilePath, charMapping) =>
  readPng(pngFilePath)
    .then(pngToMatrix)
    .then(separateChars)
    .then(chars => mapChars(chars, charMapping));

const buildFont = (pngFilePath, charMapping, config) =>
  parseFile(pngFilePath, charMapping).then(charDefs =>
    Object.assign({}, config, { characterMap: charDefs })
  );

// ---

const PNG_FILE = path.resolve(__dirname, "..", "lcd-font", "alphabet.png");
const CHAR_MAPPING = require("../lcd-font/charmap.json");
const CONFIG = require("../lcd-font/config.json");
const OUT_FILE = path.resolve(__dirname, "..", "lcd-font", "alphabet.json");

buildFont(PNG_FILE, CHAR_MAPPING, CONFIG).then(fontConfig => {
  fs.writeFileSync(OUT_FILE, JSON.stringify(fontConfig));
  console.log("Done, OK");
});
