import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText, TerminalSquare } from "lucide-react";
import { ContactCopyButton } from "@/components/contact-copy-button";
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
    <main className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <section className="flex min-h-[calc(100svh-2rem)] flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TerminalSquare className="size-4" aria-hidden="true" />
                Local recruiter console
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                Eugene Mirotin CV Assistant
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button nativeButton={false} render={<Link to="/cv" />} variant="outline">
                <FileText aria-hidden="true" />
                CV
              </Button>
              <ContactCopyButton />
            </div>
          </div>

          <div className="min-h-[460px] flex-1">
            <RecruiterTerminal cvMarkdown={cvMarkdown} />
          </div>
        </section>

        <aside className="space-y-4 lg:py-[4.25rem]">
          <Card>
            <CardHeader>
              <CardTitle>Eugene Mirotin</CardTitle>
              <CardDescription>Senior / Staff Software Engineer, Tallinn, remote.</CardDescription>
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
                Read the server-rendered CV
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
      </div>
    </main>
  );
}
