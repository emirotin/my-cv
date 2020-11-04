import { Fragment } from "react";

import MailMe from "./MailMe";

import css from "./cv.module.scss";

const Bio = () => (
  <Fragment>
    <section className={css.body}>
      <h2>Summary</h2>

      <p>
        I work in IT since 2004, since 2011 — as full-time JS developer,{" "}
        <em>since 2012 — as full-stack</em>.
      </p>
      <p>
        I worked for several <em>large companies</em> (including Epam Systems)
        and for several <em>startups</em> (including balena.io).
      </p>
      <p>
        In addition to programming, I've also handled a fair amount of
        <em>interviews</em>, created a course on Node.js, and wrote some
        technical interview questions for the automated hiring platform
        (Toggle.Hire).
      </p>
      <p>
        Other than doing IT I do play <em>intellectual games</em> and create
        questions for them.
      </p>
      <p>
        I love writing <em>clean and expressive code</em> and enjoy playing with
        the new tech.
      </p>

      <h2>Work Story</h2>

      <p className={css.smaller}>
        I&apos;ve started working in IT in 2004 and for the first 7 years have
        held a number of BA- and PM-related positions, including Tech Writer,
        Business Analyst, UI/UX designer, and Project Manager.
      </p>
      <p className={css.smaller}>
        At the same time I&apos;ve been always keen on programming and have
        self-learned a bunch of languages, including HTML/CSS,{" "}
        <strong>JS</strong> (with jQuery), Perl (that was fun),{" "}
        <strong>Python</strong> (with Django), C#, OCaml / F#.
      </p>
      <p>
        Even when not holding the engineering position officially I&apos;ve been
        participating in the development process. While being a Project Manager
        for{" "}
        <a href="https://www.buildsite.com/" target="_blank">
          BuildSite
        </a>{" "}
        I&apos;ve introuced the highly customized Django as CRUD admin panel,
        and also produced (designed and implemented from scratch) the feature
        that remains one of my most favorite achievement over the years: a
        completely OSS-based <em>in-browser PDF annotation tool</em> (jQuery,
        Django, bash, PDF Toolkit, Inkscape) .
      </p>
      <p className={css.smaller}>
        Around 2010 I&apos;ve started doing my first paid freelance projects as
        front-end / full-stack developer, using JS + jQuery, HTML/CSS (and
        sometimes HAML/SASS) on the front-end, and Python + Django on the
        back-end.
      </p>
      <p>
        In 2011 I&apos;ve accepted my first full-time developer position as{" "}
        <em>Senior Front-end Engineer</em> at{" "}
        <a href="https://www.epam.com/" target="_blank">
          Epam Systems
        </a>{" "}
        (office, 2011–2012). There I&apos;ve been leading the development of a
        set of <em>reusable client-side widgets (jQuery, custom templates)</em>{" "}
        used across a wild number of <em>Viacom</em> web-sites.
      </p>
      <p>
        I&apos;ve also been assigned a position of{" "}
        <em>Front-end Skill Manager</em> there in a 100+ people department,
        assessing the developer&apos;s levels of proffeciency, recommending the
        topics to pay attention to, suggesting level promotions to the managers,
        doing <em>interviews</em> and organizing workshops.
      </p>
      <p>
        At LikeAndPay (remote, 2012-2014), a startup aimed at creating the
        industry of <em>micro-payments</em> (you liked an article? how about
        giving a buck to the author) in Russia I&apos;ve lead the development of
        the entire product (
        <em>
          embeddable widget with some iFrame magic – vanilla JS, admin panel
          – Meteor.js, backend – Node.js
        </em>
        ).
      </p>
      <p>
        At <a href="https://balena.io/">balena.io</a> (remote, 2014–2017), a
        startup focused on solving the <em>IoT</em> development and deployment
        complexities, I&apos;ve done a lot of stuff: <em>UI (Angular 1)</em>,{" "}
        <em>back-end (Node.js, PostgreSQL)</em>, full-stack (a single codebase
        SDK delivered as Node.js module and as a UMD bundle), etc. I have also{" "}
        <em>interviewed</em> probably a hundred of people there (and we&apos;ve
        hired some half a dozen of great engineers during that time).
      </p>
      <p>
        I&apos;ve also worked as a consultant on the graphical games framework
        project (<em>TypeScript, canvas</em>) and as a Team Lead (another
        widgets project, <em>React, Redux</em>) at Skywind (office, 2017–2018),
        as a full-stack developer (<em>React, Redux, Node.js, TypeScript</em>)
        at <a href="https://botpress.io/">Botpress</a> (remote, 2017–2018), a
        startup dreaming of making developing chatbots as simple as the
        Wordpress-powered websites, and as a full-stack developer (
        <em>React, Redux, Next.js, Node.js</em>) for a European online casino
        company (2018–present time).
      </p>
      <p>
        Since 2019 I've been doing webinars and workshops for{" "}
        <a href="https://skillbox.ru/" target="_blank">
          Skillbox
        </a>
        , the Russian online university, and in 2020 I've created a{" "}
        <em>
          <a href="https://skillbox.ru/course/nodejs/" target="_blank">
            Node.js course
          </a>
        </em>{" "}
        for them.
      </p>
    </section>
    <section className={css.body}>
      <h2>What else</h2>
      <p>
        I have a formal CS education if you care about that kind of stuff. I own
        the Masters degree in Applied Math from the BSU (Minsk).
      </p>
      <p>
        I have a hobby I spend quite some time on, we call it{" "}
        <em>Intellectual games</em>, it&apos;s a special kind of intellectual
        entertainment popular in xUSSR countries and among Russian-speaking
        people in the West. It&apos;s like a pub-quiz but with more sportish
        atmosphere and entourage, making it a bit similar to chess tournaments
        in that sense. I play, write and edit questions, and sometimes host the
        tournaments.
      </p>
      <p>
        I like travelling and dislike going to the office 9-to-5 (or even worse
        10-to-8, you name it). That&apos;s why I&apos;m looking for remote
        position. It also means I have more flexibility to spend time with the
        people I love. I don't mind and actually enjoy visiting the office
        occasionally to communicate with the team.
      </p>
    </section>
    <section className={css.body}>
      <h2>What am I looking for</h2>
      <p>
        I look for <em>remote</em>, well-paid senior position in front-end or
        full-stack.
      </p>
      <p>
        I can work with multiple technologies and can learn new stuff but as of
        now I prefer doing{" "}
        <em>Node.js, React (or Svelte), ES6+ or TypeScript</em>.
      </p>
      <p>
        I can work independently or in the remote team if semi-async
        communication is fine.
      </p>
      <p>
        Currently I live in Tallinn (ET timezone) but have flexibility on
        working hours (it&apos;s fine to me to have a call in the evening or
        answer some emails before I go to bed around midnight).
      </p>
    </section>
    <section className={css.body}>
      Interested? Write me an email at <MailMe />.
    </section>
  </Fragment>
);

export default Bio;
