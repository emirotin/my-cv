import type React from "react";
import clsx from "clsx";

import css from "./lcd.module.scss";

const Row: React.FC<{ row: number[] }> = ({ row }) => (
  <div className={css.row}>
    {row.map((bit, j) => (
      <Cell bit={bit} key={j} />
    ))}
  </div>
);

const Cell: React.FC<{ bit: number }> = ({ bit }) => (
  <span className={clsx(css.cell, { [css.cellOn]: bit })}>
    <span className={css.cellInner}>
      <span className={css.cellInnerInner} />
    </span>
  </span>
);

const LcdText: React.FC<{
  pixels: number[][] | undefined;
  offset: number;
  visibleLines: number;
}> = ({ pixels, offset, visibleLines }) => {
  return pixels ? (
    <div className={css.grid}>
      {pixels.slice(offset, offset + visibleLines).map((row, i) => (
        <Row row={row} key={i + offset} />
      ))}
    </div>
  ) : null;
};

export default LcdText;
