import type React from "react";
import { useState, useMemo } from "react";
import { useInterval } from "react-use";

import LcdText from "./LcdText";

import { fullRowHeight, buildGrid, ROW_COUNT } from "../../util/grid";

const LINE_INTERVAL_MS = 900;

const LcdPlayer: React.FC<{
  lines: readonly string[];
  isPlaying: boolean;
  onDonePlaying?: () => void;
}> = ({ lines, isPlaying, onDonePlaying }) => {
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
          setTimeout(() => {
            onDonePlaying?.();
          });
          return state;
        }

        if (visibleLines < ROW_COUNT) {
          return { offset, visibleLines: visibleLines + 1 };
        } else {
          return { offset: offset + 1, visibleLines };
        }
      });
    },
    isPlaying ? LINE_INTERVAL_MS : null,
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
