import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";

import css from "./lcd.scss";

const EMAIL = "emirotin@gmail.com";
const FA_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

export default ({ hidden }) => (
  <div
    className={classnames(css.buttons, {
      [css.hidden]: hidden
    })}
  >
    <Head>
      <link rel="stylesheet" href={FA_CSS} />
    </Head>

    <a
      className={classnames(css.button, css.buttonMailto)}
      href={`mailto:${EMAIL}`}
    >
      <i className="fa fa-envelope" />
      {EMAIL}
    </a>
    <Link href="/cv">
      <a className={classnames(css.button, css.buttonCv)}>
        <i className="fa fa-address-card" />
        OK, cool, but... Do you have something more boring?
      </a>
    </Link>
  </div>
);
