import classnames from "classnames";

import css from "./lcd.scss";

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

export default ({ pixels }) =>
  pixels && (
    <div className={css.grid}>
      {pixels.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </div>
  );
