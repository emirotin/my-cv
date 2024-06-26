import type React from "react";
import clsx from "clsx";

import config from "../../config";

import css from "./lcd.module.scss";

const Buttons: React.FC<{ hidden: boolean }> = ({ hidden }) => (
  <div
    className={clsx(css.buttons, {
      [css.hidden]: hidden,
    })}
  >
    <a
      className={clsx(css.button, css.buttonMailto)}
      href={`mailto:${config.EMAIL}`}
    >
      <span>
        <i className="fa fa-envelope" />
        {config.EMAIL}
      </span>
    </a>
    <a href="/cv" className={clsx(css.button, css.buttonCv)}>
      <span>
        <i className="fa fa-address-card" />
        OK, cool, but... Do you have something more boring?
      </span>
    </a>
  </div>
);

export default Buttons;
