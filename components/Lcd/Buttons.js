import Link from "next/link";
import classnames from "classnames";

import config from "../../config";

import css from "./lcd.module.scss";

const Buttons = ({ hidden }) => (
  <div
    className={classnames(css.buttons, {
      [css.hidden]: hidden,
    })}
  >
    <a
      className={classnames(css.button, css.buttonMailto)}
      href={`mailto:${config.EMAIL}`}
    >
      <span>
        <i className="fa fa-envelope" />
        {config.EMAIL}
      </span>
    </a>
    <Link href="/cv">
      <a className={classnames(css.button, css.buttonCv)}>
        <span>
          <i className="fa fa-address-card" />
          OK, cool, but... Do you have something more boring?
        </span>
      </a>
    </Link>
  </div>
);

export default Buttons;
