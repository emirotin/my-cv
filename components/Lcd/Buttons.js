import Link from "next/link";
import classnames from "classnames";

import css from "./lcd.module.scss";

const EMAIL = "emirotin@gmail.com";

const Buttons = ({ hidden }) => (
  <div
    className={classnames(css.buttons, {
      [css.hidden]: hidden,
    })}
  >
    <a
      className={classnames(css.button, css.buttonMailto)}
      href={`mailto:${EMAIL}`}
    >
      <span>
        <i className="fa fa-envelope" />
        {EMAIL}
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
