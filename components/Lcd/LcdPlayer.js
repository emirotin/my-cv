import Promise from "bluebird";
import { useState, useMemo } from "react";
import { useInterval } from "usehooks-ts";

import LcdText from "./LcdText";

import lcdFont from "../../lcd-font/alphabet.json";

const LINE_INTERVAL_MS = 900;
const COL_COUNT = 20;
const ROW_COUNT = 4;

const fullColWidth = lcdFont.charWidth + lcdFont.letterSpacing;
const fullRowHeight = lcdFont.lineHeight + lcdFont.lineSpacing;
const gridWidth = fullColWidth * COL_COUNT;
const gridHeight = fullRowHeight * ROW_COUNT;
const characterMap = lcdFont.characterMap;

const buildRow = (n) => new Array(n).fill(0);

const buildGrid = (lines) => {
  const grid = [];
  let currCol = 0;
  let currRow = 0;

  const addRows = (n = 1) => {
    const rows = Array.from({ length: n }, () => buildRow(gridWidth));
    grid.push(...rows);
  };

  const addChar = (c) => {
    c = lcdFont.replace[c] || c;
    if (c === " ") {
      currCol += lcdFont.spaceWidth;
      return;
    }
    if (c === "\n") {
      currCol = 0;
      currRow += fullRowHeight;
      return;
    }

    const charDef = characterMap[c];
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

const LcdPlayer = ({ lines, isPlaying, onDonePlaying }) => {
  const [state, setState] = useState({
    offset: 0,
    visibleLines: 0,
  });

  const grid = useMemo(() => buildGrid(lines), [lines]);

  useInterval(
    () => {
      setState((state) => {
        const { offset, visibleLines } = state;

        if (offset + visibleLines >= lines.length) {
          onDonePlaying?.();
          return state;
        }

        if (visibleLines < ROW_COUNT) {
          return { offset, visibleLines: visibleLines + 1 };
        } else {
          return { offset: offset + 1, visibleLines };
        }
      });
    },
    isPlaying ? LINE_INTERVAL_MS : null
  );

  return (
    <LcdText
      pixels={grid}
      offset={state.offset * fullRowHeight}
      visibleLines={state.visibleLines * fullRowHeight}
    />
  );
};

export default LcdPlayer;
