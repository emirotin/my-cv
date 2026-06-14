import { RiArrowRightLine, RiFileTextLine, RiTerminalBoxLine } from "@remixicon/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ContactCopyButton } from "@/components/contact-copy-button";
import { DownloadCvPdfButton } from "@/components/download-cv-pdf-button";
import { PageContent, PageHeader, PageShell } from "@/components/page-layout";
import { RecruiterTerminal } from "@/components/recruiter-terminal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCvMarkdown } from "@/lib/cv";
import { SITE_DESCRIPTION } from "@/lib/site-metadata";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eugene Mirotin - Interactive CV Assistant" },
      {
        name: "description",
        content: SITE_DESCRIPTION,
      },
      {
        property: "og:title",
        content: "Eugene Mirotin - Interactive CV Assistant",
      },
      {
        property: "og:description",
        content: SITE_DESCRIPTION,
      },
      {
        name: "twitter:title",
        content: "Eugene Mirotin - Interactive CV Assistant",
      },
      {
        name: "twitter:description",
        content: SITE_DESCRIPTION,
      },
    ],
  }),
  loader: async () => ({
    cvMarkdown: await getCvMarkdown(),
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const { cvMarkdown } = Route.useLoaderData();

  return (
    <PageShell>
      <PageHeader
        actions={
          <>
            <Button nativeButton={false} render={<Link to="/cv" />} size="sm" variant="outline">
              <RiFileTextLine aria-hidden="true" />
              CV
            </Button>
            <ContactCopyButton size="sm" />
          </>
        }
        leading={
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-8">
              <RiTerminalBoxLine className="size-4" aria-hidden="true" />
              Recruiter console
            </div>
          </div>
        }
      />

      <PageContent className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <section className="home-terminal-column min-h-115">
          <RecruiterTerminal className="home-terminal-frame" cvMarkdown={cvMarkdown} />
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eugene Mirotin</CardTitle>
              <CardDescription>Staff Software Engineer, Tallinn, remote.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Node.js</Badge>
                <Badge variant="secondary">PostgreSQL</Badge>
                <Badge variant="secondary">Temporal</Badge>
                <Badge variant="secondary">AI workflows</Badge>
              </div>
              <Separator />
              <p className="text-sm leading-6 text-muted-foreground">
                Full-stack engineer with 22 years in the software industry and 14+ years of hands-on
                engineering experience, focused on ambiguous product and infrastructure problems.
              </p>
              <div className="grid gap-2">
                <Button
                  className="w-full justify-between"
                  nativeButton={false}
                  render={<Link to="/cv" />}
                  variant="secondary"
                >
                  Read the CV
                  <RiArrowRightLine aria-hidden="true" />
                </Button>
                <DownloadCvPdfButton className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Focus</CardTitle>
              <CardDescription>
                AI product infrastructure, assistants, and memory systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  Streaming AI podcast generation across LLM, TTS, live transcription, Redis
                  Streams, and SSE.
                </li>
                <li>Zero-downtime Firestore to PostgreSQL migration for 20M+ records.</li>
                <li>
                  In-browser timeline editor architecture for TTS, media, and export workflows.
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </PageContent>
    </PageShell>
  );
}
