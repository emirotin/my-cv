import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";

import css from "./lcd.module.scss";

const EMAIL = "emirotin@gmail.com";
const FA_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

const Buttons = ({ hidden }) => (
  <div
    className={classnames(css.buttons, {
      [css.hidden]: hidden,
    })}
  >
    <Head>
      <link rel="stylesheet" href={FA_CSS} />
    </Head>

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
