# Eugene Mirotin
 
**Senior / Staff Software Engineer**
Tallinn, Estonia · Remote · [github.com/emirotin](https://github.com/emirotin)
 
---
 
## Profile
 
Full-stack software engineer with 22 years in the software industry and 14+ years of hands-on engineering experience, progressing from business analysis into architecture, infrastructure, and technical leadership. Known for taking ambiguous, hard problems—where the desired outcome is clear but no implementation path exists—and shipping production solutions that become core product differentiators. Deep experience with Node.js/TypeScript, React, PostgreSQL, and cloud infrastructure. Comfortable leading small teams, mentoring engineers, and making pragmatic architectural decisions at scale-up pace.
 
---
 
## Core Skills
 
**Languages:** TypeScript, JavaScript, HTML, CSS
**Frontend:** React, Next.js, Signals, SVG
**Backend:** Node.js, NestJS, Temporal
**Data:** PostgreSQL, Firestore, BigQuery, Redis
**Infrastructure:** AWS, GCP, Docker, Headless Chromium
**Practices:** System design, data migrations, streaming architectures, API design, OAuth, code review culture, feature flags, CI/CD
**AI / LLM:** Daily user of Claude Code and Codex for development workflows; Vertex AI, Vercel AI SDK, TTS/STT pipelines, prompt engineering
 
---
 
## Experience
 
### Senior Software Engineer · Speechify · 2024 – Present
 
*AI-powered text-to-speech platform. Moved across three teams in two years, each time brought in to raise technical quality and unblock delivery.*
 
**Platform Team (Oct 2025 – Present)**
 
- Optimized AI podcast generation pipeline from 60+ seconds to 15–25 seconds by orchestrating parallel streaming: Gemini script generation streams into TTS, which streams audio chunks through Redis-backed presigned URLs to the client, with concurrent Deepgram transcription for speech marks.
- Migrated background jobs from Bull to Temporal, implementing dynamic worker provisioning to scale with demand and eliminate idle resource costs.
- Built a persistent memory system for AI assistants that ingests user signals (reading history, events), extracts profile attributes and core memories, and serves them to the conversational agent via MCP — enabling context-aware, personalized interactions across sessions.
**AI Studio Team (Oct 2024 – Oct 2025)**
 
- Led the ground-up rebuild of Voice Over Studio v2, an in-browser timeline editor for mixing TTS audio, music, video, and images. Shipped to production with measurably better user satisfaction from UX research.
- Replaced absolute block positioning with a relative positioning data model that captures semantic intent ("block B follows block A, zero gap"), eliminating cascading recalculations and database write storms. Used signals for reactive position computation on the frontend.
- Migrated 20M+ records from Firestore to PostgreSQL using a zero-downtime strategy: double writes, BigQuery-accelerated snapshot transfer via a custom producer-consumer pipeline with backpressure, feature-flagged read switchover, and full cutover.
- Built the producer-consumer migration tool in Node.js with async generators, controlled parallelism, memory caps, and Postgres batch-insert optimization respecting the 32K cell limit. Reduced migration runtime from projected days to under two hours.
- Introduced Temporal for export job orchestration, replacing Bull. Built an adapter layer that auto-discovers relevant NestJS service classes and binds their methods as Temporal activities, preserving the team's existing DI patterns.
- Prototyped the AI Podcast feature end-to-end: deep research sourcing, speaker profile generation, voice casting from a directory, script generation, TTS synthesis, preview, and export.
- Drove code review culture transformation by leading by example—personally reviewing ~30% of the team's pull requests to unblock delivery and raise quality standards.
**AI API Team (Apr 2024 – Oct 2024)**
 
- Designed and implemented OAuth token flow for client-side TTS integration, replacing long-lived API keys. Built the backend token issuance, a reference Node.js relay implementation for customers, and an automatic token refresh manager in the JavaScript SDK.
- Led a full redesign of the developer dashboard and built a shared design system (React, Tailwind, Storybook, Chromatic) that was later adopted by the AI Studio team as the foundation for the Voice Over Studio v2 redesign.
- Created a streaming audio delivery system using presigned URLs and PostgreSQL LISTEN/NOTIFY, allowing HTML audio elements to consume TTS output in near real-time without authentication headers.
---
 
### Tech Lead / Principal Engineer · Moon Rocket · 2023 – 2024
 
*Online entertainment platform. Owned the full technical stack end-to-end as the primary individual contributor and team lead (1–3 direct reports).*
 
- Introduced Payload CMS and built the integration layer pulling content from CMS, external game catalogs, and SEO metadata into a Next.js frontend.
- Managed cross-functional coordination between marketing, SEO, and game catalog teams, designing systems that gave each group autonomous control over their domain.
---
 
### Principal Full-Stack Engineer · Cosuno · 2022 – 2023
 
*German construction-tech company digitizing standards compliance, bills of material, and procurement workflows.*
 
- Replaced a third-party PDF export service (€2–3K/month) with an in-house Headless Chromium solution, eliminating page-count limits and reducing export times from minutes to seconds.
- Worked on a complex spreadsheet-like Bill of Materials component with nested groups, validations, formulas, and Excel/PDF exports as part of a six-engineer team.
---
 
### Software Engineer · Play North · 2018 – 2022
 
*Online entertainment platform. Full-stack development with TypeScript, React, and Next.js. Launched and maintained multiple products over a 3.5-year tenure.*
 
---
 
### Full-Stack Engineer · Botpress · 2017 – 2018
 
*Open-source chatbot creation platform—the "WordPress for chatbots." Visual flow editor with NLP skills, deployment to cloud, and analytics.*
 
- Designed and built the Ghost File System: a versioning layer that tracks configuration file edits made in the cloud, detects drift from the git-managed codebase, and provides a CLI sync command that pulls changes back as clean, reviewable diffs.
- Solved the fundamental tension between non-technical users needing to make quick edits in production and developers needing those changes in version control.
---
 
### Full-Stack Engineer · Resin.io (now Balena) · 2014 – 2017
 
*IoT deployment platform—"Heroku for connected devices." Push code to git, receive Docker-based OTA updates on ARM devices (Raspberry Pi, BeagleBone).*
 
- Built the device management dashboard and introduced stable SSH tunnels into deployed containers via Node.js and HAProxy, with an in-browser terminal for remote diagnostics.
- Refactored the Resin SDK from a Node.js-only library to a universal JavaScript SDK by abstracting transport and authentication into injectable factories. Delivered in one week; the team dogfooded it immediately in the dashboard. Presented the architecture at DevClub.EU ("Creating Universal (Isomorphic) JavaScript Libraries," 2017).
- Rebuilt the marketing website using a static site generator (Wintersmith), delivering near-instant page loads.
---
 
### Full-Stack Engineer · Like and Pay · 2012 – 2014
 
*Micropayment platform for content creators. Embeddable donation button for independent media, similar to Facebook's Like button but transferring real money to journalists and publishers.*
 
- First production experience with Node.js. Built the full-stack payment and widget integration system.
---
 
### Senior / Lead Software Engineer · EPAM Systems · 2011 – 2012
 
*Maintained and modernized a reusable web component library serving Viacom properties (MTV, VH1, CMT, GameTrailers). Introduced jQuery templating and SCSS preprocessing to improve developer productivity.*
 
---
 
### Engineering Manager / Technical Lead · BuildSite LLC · 2009 – 2011
 
*Construction document management platform for contractors and subcontractors.*
 
- Prototyped an in-browser PDF annotation and page-selection tool in 2009, years before comparable solutions existed. Built a cross-browser vector editor (SVG + VML for IE6) on top of a Python/Django/ImageMagick/Inkscape pipeline that split PDFs into images, overlaid annotations, and reassembled annotated pages into new PDFs.
- The feature shipped as a core product differentiator and remains in use (with iterations) today.
---
 
### Business Analyst / Technical Writer · Various (Red Graphic, EPAM, Oxagile, VicMan) · 2004 – 2009
 
*Documentation, interactive HTML prototyping, and UX design across multiple outsourcing and product companies. These roles built foundational skills in understanding user needs, writing clear specifications, and bridging the gap between business and engineering.*
 
---
 
## Side Projects & Speaking
 
- **@emirotin/zerp** — Lightweight HTML-based presentation engine, published to npm. Built using Claude as a development partner for research, prototyping, and code generation.
- **Extracurricular teaching** — Regular instructor at educational schools in Serbia and Estonia, teaching math, algorithms, programming, and software engineering to students.
- **"Signals: the 'New' State Management Primitive in JS, and Why You Should Care"** — Digit.dev, 2025. Why signals stand apart from the churn of JS state management libraries: a fundamental idea (traceable to the 1960s) converging across frameworks, heading toward a TC39 proposal, and semantically closer to normal variables than external stores.
- **"Evolution of JavaScript"** — DevClub.EU, March 2023. Language history, design mistakes, the standardization process, and significant modern changes.
- **"Recruiting and Tech Interviews: The Good, the Bad and the Ugly"** — DevClub.EU, April 2022. What's broken in hiring and technical interviews, and how to do better.
- **"Working with Asynchrony in JS, Staying Sane and Influencing People"** — DevClub.EU, June 2021. Why asynchrony is unavoidable, how to handle it, and common pitfalls to avoid.
---
 
## Education
 
**BSc in Applied Mathematics & Computer Science** — Belarusian State University, Minsk, 2007
**MSc in Statistics** — Belarusian State University, Minsk, 2008
 
---
 
**Location:** Based in Tallinn, Estonia. Available for remote B2B engagements.
