import type React from "react";
import classnames from "classnames";

import { Media, Button } from "reactstrap";

import Skills from "./Skills";
import MailMe from "./MailMe";

import { getAge, getProgrammingExp, getTotalExp } from "../../util";

import css from "./cv.module.scss";

const Header: React.FC = () => (
  <header itemScope itemType="http://schema.org/Person">
    <div className={classnames(css.print, "pull-right")}>
      <Button size="small" color="dark" id="print-button">
        <i className="fa fa-print" /> Print
      </Button>
    </div>
    <Media>
      <div className={classnames(css.myPhoto, "pull-left", "thumbnail")}>
        <img src="/images/me.jpg" alt="Eugene Mirotin" itemProp="image" />
      </div>
      <Media body>
        <Media heading tag="h1" className={css.name}>
          <span itemProp="name">Eugene Mirotin</span>
        </Media>
        <p className="lead">
          <strong>
            <span itemProp="jobTitle">Full-Stack Web Developer</span>.
          </strong>
          <br />
          Age: {getAge()}
          .&nbsp; Experience: {getProgrammingExp()} years as programmer,{" "}
          {getTotalExp()} years total in tech.
          <span className={css.contacts}>
            Contact:&nbsp;
            <MailMe />.
          </span>
          <span className={css.skills}>
            Core skills:&nbsp;
            <Skills />
          </span>
        </p>
      </Media>
    </Media>
  </header>
);

export default Header;
