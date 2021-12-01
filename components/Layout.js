import Head from "next/head";

const Layout = (props) => (
  <>
    <Head>
      <title>Eugene Mirotin CV</title>
    </Head>
    <main>{props.children}</main>
  </>
);

export default Layout;
