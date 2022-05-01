import classnames from "classnames";

import css from "./lcd.module.scss";

const Row = ({ row }) => (
  <div className={css.row}>
    {row.map((bit, j) => (
      <Cell bit={bit} key={j} />
    ))}
  </div>
);

const Cell = ({ bit }) => (
  <span className={classnames(css.cell, { [css.cellOn]: bit })}>
    <span className={css.cellInner}>
      <span className={css.cellInnerInner} />
    </span>
  </span>
);

const LcdText = ({ pixels, offset, visibleLines }) => {
  return pixels ? (
    <div className={css.grid}>
      {pixels.slice(offset, offset + visibleLines).map((row, i) => (
        <Row row={row} key={i + offset} />
      ))}
    </div>
  ) : null;
};

export default LcdText;
