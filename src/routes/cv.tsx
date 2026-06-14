import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Code2, TerminalSquare } from "lucide-react";
import { ContactCopyButton } from "@/components/contact-copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCvHtml } from "@/lib/cv";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "Eugene Mirotin - CV" },
      {
        name: "description",
        content: "Server-rendered CV for Eugene Mirotin, Senior / Staff Software Engineer.",
      },
    ],
  }),
  loader: async () => getCvHtml(),
  component: CvRoute,
});

function CvRoute() {
  const cv = Route.useLoaderData();

  return (
    <main className="min-h-svh bg-[#fbfaf7] text-stone-950">
      <header className="border-b bg-[#f6f3ef]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Assistant
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="https://github.com/emirotin" rel="noreferrer" target="_blank">
                <Code2 aria-hidden="true" />
                GitHub
              </a>
            </Button>
            <ContactCopyButton size="sm" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8">
        <article className="cv-content" dangerouslySetInnerHTML={{ __html: cv.markup }} />

        <aside className="order-first lg:order-last">
          <div className="sticky top-6 space-y-4 rounded-lg border bg-white p-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <TerminalSquare className="size-4" aria-hidden="true" />
                Server-rendered CV
              </div>
              <h2 className="mt-1 text-lg font-semibold">Contents</h2>
            </div>
            <nav aria-label="CV sections" className="space-y-2 text-sm">
              {cv.headings
                .filter((heading) => heading.level <= 2)
                .map((heading) => (
                  <a
                    className="block rounded-md px-2 py-1 text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                    href={`#${heading.id}`}
                    key={heading.id}
                  >
                    {heading.text}
                  </a>
                ))}
            </nav>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">SSR</Badge>
              <Badge variant="secondary">Prerendered</Badge>
              <Badge variant="outline">Markdown</Badge>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
