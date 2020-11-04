import Layout from "../components/Layout.js";

import Lcd from "../components/Lcd";

import css from "./lcd.module.scss";

const IndexPage = () => (
  <Layout>
    <div className={css.index}>
      <Lcd />
    </div>
  </Layout>
);

export default IndexPage;
