import lcdFont from "../lcd-font/alphabet.json";

export const COL_COUNT = 20;
export const ROW_COUNT = 4;

export const fullColWidth = lcdFont.charWidth + lcdFont.letterSpacing;
export const fullRowHeight = lcdFont.lineHeight + lcdFont.lineSpacing;
export const gridWidth = fullColWidth * COL_COUNT;
export const characterMap = lcdFont.characterMap;

const buildRow = (n: number) => new Array(n).fill(0) as number[];

export const buildGrid = (lines: string[] | readonly string[]) => {
  const grid: number[][] = [];
  let currCol = 0;
  let currRow = 0;

  const addRows = (n = 1) => {
    const rows = Array.from({ length: n }, () => buildRow(gridWidth));
    grid.push(...rows);
  };

  const addChar = (c: string) => {
    c = lcdFont.replace[c as keyof typeof lcdFont.replace] || c;
    if (c === " ") {
      currCol += lcdFont.spaceWidth;
      return;
    }
    if (c === "\n") {
      currCol = 0;
      currRow += fullRowHeight;
      return;
    }

    const charDef = characterMap[c as keyof typeof characterMap];
    if (!charDef) return;

    const { char } = charDef;
    if (currCol + char[0].length >= gridWidth) {
      currCol = 0;
      currRow += fullRowHeight;
    }

    while (currRow >= grid.length) {
      addRows(fullRowHeight);
    }

    const vOffset =
      currRow + lcdFont.lineHeight - char.length + charDef.vOffset;
    char.forEach((row, i) => {
      i += vOffset;
      if (i < 0 || i >= grid.length) return;

      row.forEach((bit, j) => {
        grid[i][currCol + j] = bit;
      });
    });

    currCol += char[0].length + lcdFont.letterSpacing;
  };

  lines.forEach((line) => {
    (line + "\n").split("").forEach((c) => addChar(c));
  });

  return grid;
};
