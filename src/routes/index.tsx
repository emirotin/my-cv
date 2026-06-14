import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText, TerminalSquare } from "lucide-react";
import { ContactCopyButton } from "@/components/contact-copy-button";
import { PageContent, PageHeader, PageHeaderTitle, PageShell } from "@/components/page-layout";
import { RecruiterTerminal } from "@/components/recruiter-terminal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCvMarkdown } from "@/lib/cv";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eugene Mirotin - Interactive CV Assistant" },
      {
        name: "description",
        content:
          "A terminal-style recruiter assistant powered by a browser-local LLM and Eugene Mirotin's CV.",
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
              <FileText aria-hidden="true" />
              CV
            </Button>
            <ContactCopyButton size="sm" />
          </>
        }
        leading={
          <PageHeaderTitle
            eyebrow="Local recruiter console"
            icon={<TerminalSquare className="size-4" aria-hidden="true" />}
            title="Eugene Mirotin CV Assistant"
          />
        }
      />

      <PageContent className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-[460px] lg:min-h-[calc(100svh-8.5rem)]">
          <RecruiterTerminal cvMarkdown={cvMarkdown} />
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
              <Button
                className="w-full justify-between"
                nativeButton={false}
                render={<Link to="/cv" />}
                variant="outline"
              >
                Read the CV
                <ArrowRight aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Focus</CardTitle>
              <CardDescription>
                AI product infrastructure, migrations, and interactive tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  Streaming AI podcast generation across LLM, TTS, Redis URLs, and transcription.
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
