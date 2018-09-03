import Head from "next/head";
import { Fragment } from "react";

import "./style.scss";

const Layout = props => (
  <Fragment>
    <Head>
      <title>Eugene Mirotin CV</title>
    </Head>
    <main>{props.children}</main>
  </Fragment>
);

export default Layout;
