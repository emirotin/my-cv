import type React from "react";

import MailMe from "./MailMe";

import css from "./cv.module.scss";

const Bio: React.FC = () => (
  <>
    <section className={css.body}>
      <h2>Summary</h2>

      <p>
        I work in tech since 2004, since 2011—as full-time JS developer,{" "}
        <em>since 2012—as full-stack JS (started using Node.js)</em>.
      </p>
      <p>
        I worked for several <em>large companies</em> (including Epam Systems){" "}
        and for several <em>startups</em> (including{" "}
        <a href="https://balena.io" target="_blank" rel="noreferrer">
          balena.io
        </a>
        ,{" "}
        <a href="https://botpress.io/" target="_blank" rel="noreferrer">
          Botpress
        </a>
        , and{" "}
        <a href="https://www.cosuno.com/" target="_blank" rel="noreferrer">
          Cosuno
        </a>
        ), as well as did multiple short- to mid-term freelance projects.
      </p>
      <p>
        In addition to programming, I've also handled a fair amount of{" "}
        <em>interviews</em>, created a{" "}
        <em>
          <a
            href="https://skillbox.ru/course/nodejs/"
            target="_blank"
            rel="noreferrer"
          >
            course
          </a>{" "}
          on Node.js
        </em>
        , and wrote some technical interview questions for the automated hiring{" "}
        platform (
        <a href="https://toggl.com/hire/" target="_blank" rel="noreferrer">
          Toggl Hire
        </a>
        ).
      </p>
      <p>
        In my free time I enjoy playing <em>mind games</em> and creating{" "}
        questions for them.
      </p>
      <p>
        I love writing <em>clean and expressive code</em> and sometimes have fun{" "}
        experimenting with the new tech.
      </p>

      <h2>Current Position</h2>

      <p>
        Since 2022 I work through my company, MIROTIN OÜ, registered in Estonia,{" "}
        with various clients. Between several smaller projects, I have kept the{" "}
        positions of Principal Full-Stack Engineer at{" "}
        <a href="https://www.cosuno.com/" target="_blank" rel="noreferrer">
          Cosuno
        </a>
        , the German startup working in the area of construction business{" "}
        automation, and later the Team Lead for Moon Rocket, an iGaming company.
      </p>

      <h2>Notable Projects</h2>
      <p>
        NB: this is not the full list of projects I've worked on, just several
        most recent and the ones I consider the most interesting.
      </p>

      <h3>iGaming platform</h3>
      <p>
        As Team Lead and architect for Moon Rocket (2023), I was responsible for{" "}
        selecting the tools (SaaS, frameworks, and libraries) to cater for the{" "}
        rapidly changing requirements of the industry and the small team size at{" "}
        the same time.
      </p>
      <p>
        As a result, we have configured <em>Payload CMS</em>, created the{" "}
        <em>Vercel</em>-based API (with PostgreSQL for the database),{" "}
        <em>Next.js</em> frontend, <em>Algolia search</em>, and all the{" "}
        necessary automation to have the CI/CD pipeline in place, and to{" "}
        synchronize data between multiple sources.
      </p>

      <h3>Construction business automation</h3>
      <p>
        <strong>
          <a href="https://www.cosuno.com/" target="_blank" rel="noreferrer">
            https://www.cosuno.com/
          </a>
        </strong>
      </p>
      <p>
        As Principal Full-Stack Engineer at Cosuno (2022–2023), I was
        responsible for developing various features for the construction
        business automation platform, built with <em>Next.js</em>,{" "}
        <em>GraphQL</em>, and <em>Prisma ORM</em>. The achievements include the
        redesign and refactoring of the Bill of Quantities editor (one of the
        most complex React components I ever worked with), export of its data to
        PDF and Excel formats, and a set of changes and improvements related to
        singing the contracts with <em>DocuSign</em>. Among other things, I have
        developed in-house PDF printer, based on <em>Playwright</em>, to replace
        the pricey third-party SaaS solution.
      </p>

      <h3>In-browser 3D experience for Sarine</h3>
      <p>
        <strong>
          <a
            href="https://sarine.com/diamond-journey360/"
            target="_blank"
            rel="noreferrer"
          >
            https://sarine.com/diamond-journey360/
          </a>
        </strong>
      </p>
      <p>
        In 2022 I have created an in-browser 3D experience for Sarine, the
        Israeli company that specializes in researching and analyzing diamonds.
        The project, built with <em>Svelte</em> and <em>Three.js</em>,
        introduces the visitor to the evolution of diamonds, from the hot rocks
        deep under the Earth surface, and to the perfectly shaped gems available
        to the customers.
      </p>
      <p>
        I was responsible for the entire programming, including optimizing the
        3D models (<em>glTF</em> files) for the best possible combination of
        performance and quality.
      </p>

      <h3>Exponential View</h3>
      <p>
        <strong>
          <a
            href="https://www.exponentialview.co/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.exponentialview.co/
          </a>
        </strong>
      </p>
      <p>
        Between 2021 and 2023 I have been working with Azeem Azhar, the author
        of <em>Exponential View</em>, the popular newsletter on the intersection
        of technology, business, and society. I was responsible for developing
        the new website for the newsletter, built with <em>Ghost</em>
        (the newsletter and its site were later migrated to Substack), as well
        as an <em>Airtable</em>-based CRM with <em>Stripe</em> data syncing.
      </p>

      <h3>Technical interview questions creation and review</h3>
      <p>
        <strong>
          <a href="https://toggl.com/hire/" target="_blank" rel="noreferrer">
            https://toggl.com/hire/
          </a>
        </strong>
      </p>
      <p>
        Since 2020 I collaborate with Toggl Hire, for whom I create and review
        the practice-focused technical interview questions on various topics
        (JS, TS, Node.js, React, Vue.js, git, HTML/CSS, SQL, general algorithms,
        etc.)
      </p>

      <h3>Node.js Course</h3>
      <p>
        <strong>
          <a
            href="https://skillbox.ru/course/nodejs/"
            target="_blank"
            rel="noreferrer"
          >
            https://skillbox.ru/course/nodejs/
          </a>
        </strong>
      </p>
      <p>
        Between 2019 and 2022 (when the war started) I've been doing webinars
        and workshops for{" "}
        <a href="https://skillbox.ru/" target="_blank" rel="noreferrer">
          Skillbox
        </a>{" "}
        online university, and in 2020 I've created a Node.js course for them.
        The course covers the basics of Node.js and Express, working with
        MongoDB and PostgreSQL, using some popular libraries, as well as the
        fundamentals such as async programming.
      </p>

      <h3>Cross-site Widgets for Viacom</h3>
      <p>
        In 2011–2012, while working as <em>Senior Front-end Engineer</em> at{" "}
        <a href="https://www.epam.com/" target="_blank" rel="noreferrer">
          Epam Systems
        </a>{" "}
        (office, 2011–2012), I&apos;ve been leading the development of a set of{" "}
        <em>reusable client-side widgets</em> (jQuery, custom templates)
        deployed for several dozens number of <em>Viacom</em> web-sites, such as
        MTV EMA, Colbert Nation, and GameTrailers.
      </p>
      <p>
        In addition, I was assigned a position of{" "}
        <em>Front-end Skill Manager</em> for the 100+ people department,
        assessing the developers&apos; levels of proficiency, recommending the
        topics to improve their skill, suggesting level promotions to the
        managers, doing <em>interviews</em>, and organizing workshops.
      </p>

      <h3>In-browser PDF annotation tool</h3>
      <p>
        Around 2010, while working as a Project Manager for{" "}
        <a href="https://www.buildsite.com/" target="_blank" rel="noreferrer">
          BuildSite
        </a>
        , I&apos;ve created the fully functional prototype for the feature that
        remains one of my most favorite achievement over the years: a completely
        OSS-based <em>in-browser PDF annotation tool</em> (jQuery, Django, bash,
        PDF Toolkit, Inkscape). That was a fun project, given we still had to
        support IE6. I think it is still in use on their website, but probably a
        rewrite or two have happened.
      </p>

      <h2>Origin Story</h2>

      <p className={css.smaller}>
        I&apos;ve started working in tech industry in 2004 and for the first 7
        years have held a number of BA- and PM-related positions, including Tech
        Writer, Business Analyst, UI/UX designer, and Project Manager.
      </p>
      <p className={css.smaller}>
        At the same time I&apos;ve been always keen on programming and have
        self-learned a pack of languages, including HTML/CSS,{" "}
        <strong>JS</strong> (with jQuery), Perl (that was fun),{" "}
        <strong>Python</strong> (with Django), C#, OCaml / F#.
      </p>
      <p className={css.smaller}>
        Around 2010 I&apos;ve started doing my first paid freelance projects as
        front-end/full-stack developer, using JS + jQuery, HTML/CSS (and
        sometimes HAML/SASS) on the front-end, and <em>Python + Django</em> on
        the back-end.
      </p>
      <p>
        In 2010 I have failed the JS interview for{" "}
        <a
          href="https://www.apptio.com/products/targetprocess/"
          rel="noreferrer"
        >
          TargetProcess
        </a>
        , a Belarusian startup later acquired by IBM. Now that I have your
        attention, I did not fail it completely, and I was offered the position,
        but I was not happy with my performance and the knowledge gaps, which
        has led me to dedicating more energy to properly learning JS with its
        gotchas and quirks.
      </p>
      <p>
        In 2011 I&apos;ve accepted my first full-time developer position at
        Epam, and since then I&apos;ve been writing JS full-time.
      </p>
      <p>
        In 2012 I started using Node.js and have been doing full-stack JS ever
        since.
      </p>

      <h2>Full Employment History</h2>
      <p>
        The full list of my employment history is available on{" "}
        <a
          href="https://www.linkedin.com/in/emirotin"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        .
      </p>
    </section>

    <section className={css.body}>
      <h2>What else</h2>
      <p>
        I have a formal CS education if you care about that kind of stuff. I own
        the Masters degree in Applied Math from the BSU (Minsk).
      </p>
      <p>
        I have a hobby I spend quite some time on. It's broadly called{" "}
        <em>mind games</em>, and it's a quiz-like kind of intellectual
        entertainment popular in xUSSR countries and among Russian-speaking
        people in the West. It bears similarities to pub-quizzes but with more
        competitive atmosphere and entourage, making it a bit similar to chess
        tournaments in that sense. I play, author and edit questions, and
        sometimes host the tournaments.
      </p>
      <p>
        I like traveling with my family. That&apos;s one of the reasons why
        I&apos;m focused on remote job. Despite that, I love meeting with the
        team I work with, either occasionally in the office, or during the
        regular company retreats.
      </p>
    </section>
    <section className={css.body}>
      <h2>What I am looking for</h2>
      <p>
        <em>Remote</em> (occasional visits to the office are OK), front-end or
        full-stack JS/TS.
      </p>
      <p>
        I can work with multiple technologies and can learn new stuff but as of
        now my go-to stack is{" "}
        <em>
          Node.js, React (or Svelte), TypeScript (highly preferable) or modern
          ES
        </em>
        .
      </p>
      <p>
        I can work independently or in the remote team with (mostly) async
        communication.
      </p>
      <p>I live in Tallinn , Estonia (UTC +2/3).</p>
    </section>
    <section className={css.body}>
      Interested? Shoot me an email: <MailMe />.
    </section>
  </>
);

export default Bio;
