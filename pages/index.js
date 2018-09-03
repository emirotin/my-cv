import Layout from "../components/Layout.js";
import Link from "next/link";

import Lcd from "../components/Lcd";

import css from "./lcd.scss";

export default () => (
  <Layout>
    <div className={css.index}>
      <Lcd />
    </div>
  </Layout>
);
