import type React from "react";

import Header from "./Header";
import GithubCard from "./GithubCard";
import Links from "./Links";
import Bio from "./Bio";

import css from "./cv.module.scss";

const Cv: React.FC = () => (
  <article className={css.root}>
    <Header />

    <section className="links">
      <div className="pull-right">
        <GithubCard username="emirotin" />
      </div>
      <div className="code-links">
        <h2 className="h3">Code Examples</h2>
        <Links />
      </div>
      <div className="clearfix" />
    </section>

    <hr className={css.separator} />

    <Bio />
  </article>
);

export default Cv;
