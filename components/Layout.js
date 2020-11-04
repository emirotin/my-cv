import Head from "next/head";
import { Fragment } from "react";

const Layout = (props) => (
  <Fragment>
    <Head>
      <title>Eugene Mirotin CV</title>
    </Head>
    <main>{props.children}</main>
  </Fragment>
);

export default Layout;
