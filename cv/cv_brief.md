# Eugene Mirotin
 
**Staff Software Engineer**
Tallinn, Estonia · Remote · [github.com/emirotin](https://github.com/emirotin)
 
---
 
## Profile
 
Full-stack software engineer with 22 years in the software industry and 14+ years of hands-on engineering experience, progressing from business analysis into architecture, infrastructure, and technical leadership. Known for taking ambiguous, hard problems—where the desired outcome is clear but no implementation path exists—and shipping production solutions that become core product differentiators. Deep expertise in Node.js/TypeScript, React, PostgreSQL, and cloud infrastructure. Comfortable leading small teams, mentoring engineers, and making pragmatic architectural decisions at scale-up pace.
 
---
 
## Core Skills
 
**Languages:** TypeScript, JavaScript, HTML, CSS
**Frontend:** React, Next.js, Signals, SVG
**Backend:** Node.js, NestJS, Temporal
**Data:** PostgreSQL, Firestore, BigQuery, Redis
**Infrastructure:** AWS, GCP, Docker, Headless Chromium
**Practices:** System design, data migrations, streaming architectures, API design, OAuth, CI/CD
**AI / LLM:** Claude Code, Codex; Vertex AI, Vercel AI SDK, TTS/STT pipelines, prompt engineering, MCP integrations
 
---
 
## Experience
 
### Senior Software Engineer · Speechify · 2024 – Present
 
*AI-powered text-to-speech platform. Moved across three teams in two years, each time brought in to raise technical quality and unblock delivery.*
 
- Optimized AI podcast generation pipeline from 60s → 15–25s by orchestrating parallel streaming: Gemini script generation streams into TTS, which streams audio chunks through Redis-backed presigned URLs to the client, with concurrent Deepgram transcription for speech marks.
- Migrated 20M+ records from Firestore to PostgreSQL with zero downtime: double writes, BigQuery-accelerated snapshot transfer via a custom producer-consumer pipeline with backpressure and Postgres batch-insert optimization (32K cell limit). Reduced projected migration time from days to under two hours.
- Led ground-up rebuild of Voice Over Studio v2, an in-browser timeline editor for mixing TTS audio, music, video, and images. Replaced absolute block positioning with a relative model capturing semantic intent, eliminating cascading recalculations and write storms. Used signals for reactive position computation.
- Built a persistent memory system for AI assistants that ingests user signals (reading history, events), extracts profile attributes and core memories, and serves them to the conversational agent via MCP — enabling context-aware, personalized interactions across sessions.
- Designed OAuth token flow for client-side TTS integration, replacing long-lived API keys. Built backend token issuance, a reference Node.js relay for customers, and automatic token refresh in the JavaScript SDK.
- Introduced Temporal for job orchestration (replacing Bull) with an adapter layer that auto-discovers NestJS service classes and binds methods as Temporal activities, preserving existing DI patterns. Implemented dynamic worker provisioning.
- Prototyped AI Podcast feature end-to-end: deep research sourcing, speaker profiles, voice casting, script generation, TTS synthesis, preview, and export.
- Drove code review culture — personally reviewed ~30% of team PRs. Led developer dashboard redesign and built a shared design system (React, Tailwind, Storybook, Chromatic) later adopted across teams.
---
 
### Tech Lead / Principal Engineer · Moon Rocket · 2023 – 2024
 
*Online entertainment platform. Owned the full technical stack end-to-end as primary IC and team lead (1–3 direct reports).*
 
- Introduced Payload CMS and built the integration layer pulling content from CMS, external game catalogs, and SEO metadata into a Next.js frontend.
- Managed cross-functional coordination between marketing, SEO, and catalog teams, designing systems that gave each group autonomous control over their domain.
---
 
### Principal Full-Stack Engineer · Cosuno · 2022 – 2023
 
*German construction-tech company digitizing standards compliance, bills of material, and procurement workflows.*
 
- Replaced third-party PDF export service (€2–3K/mo) with in-house Headless Chromium solution — eliminated page-count limits, reduced export times from minutes to seconds.
- Built a complex spreadsheet-like Bill of Materials component with nested groups, validations, formulas, and Excel/PDF exports as part of a six-engineer team.
---
 
### Software Engineer · Play North · 2018 – 2022
 
*Online entertainment platform. Full-stack development with TypeScript, React, and Next.js. Launched and maintained multiple products over a 3.5-year tenure.*
 
---
 
### Full-Stack Engineer · Botpress · 2017 – 2018
 
*Open-source chatbot platform — "WordPress for chatbots." Visual flow editor with NLP skills, deployment to cloud, and analytics.*
 
- Designed the Ghost File System: a versioning layer tracking cloud config edits, detecting drift from git, and providing a CLI sync that pulls changes back as clean, reviewable diffs — solving the tension between non-technical users editing in production and developers needing version control.
---
 
### Full-Stack Engineer · Resin.io (now Balena) · 2014 – 2017
 
*IoT deployment platform — "Heroku for connected devices." Push code to git, receive Docker-based OTA updates on ARM devices.*
 
- Built device management dashboard and stable SSH tunnels into deployed containers. Refactored the SDK from Node.js-only to universal JavaScript in one week — team dogfooded it immediately. Presented architecture at DevClub.EU.
---
 
*Earlier: Like and Pay — Node.js micropayment platform (2012–14) · EPAM Systems — Viacom web component library (2011–12) · BuildSite LLC — in-browser PDF annotation tool in 2009 using cross-browser SVG+VML vector editor; shipped as core differentiator, still in use (2009–11) · BA / Tech Writer roles across multiple companies (2004–09)*
 
---
 
## Education & Speaking
 
**BSc in Applied Mathematics & Computer Science** + **MSc in Statistics** — Belarusian State University
 
Regular speaker at DevClub.EU and Digit.dev on JavaScript evolution, signals, async patterns, and hiring practices. Instructor at educational schools in Serbia and Estonia (math, algorithms, programming). Published **@emirotin/zerp** — lightweight HTML presentation engine built with Claude as a development partner.
 
---
 
**Location:** Based in Tallinn, Estonia. Available for remote B2B engagements.
