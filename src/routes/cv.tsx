import { RiArrowLeftLine, RiCodeLine } from "@remixicon/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ContactCopyButton } from "@/components/contact-copy-button";
import { PageContent, PageHeader, PageShell } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { getCvHtml } from "@/lib/cv";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "Eugene Mirotin - CV" },
      {
        name: "description",
        content: "Eugene Mirotin, Staff Software Engineer, CV.",
      },
    ],
  }),
  loader: async () => getCvHtml(),
  component: CvRoute,
});

function CvRoute() {
  const cv = Route.useLoaderData();

  return (
    <PageShell>
      <PageHeader
        actions={
          <>
            <Button
              nativeButton={false}
              render={<a href="https://github.com/emirotin" rel="noreferrer" target="_blank" />}
              size="sm"
              variant="outline"
            >
              <RiCodeLine aria-hidden="true" />
              GitHub
            </Button>
            <ContactCopyButton size="sm" />
          </>
        }
        leading={
          <Button
            nativeButton={false}
            render={<Link to="/" />}
            variant="ghost"
            className="w-fit -ml-2.5"
          >
            <RiArrowLeftLine aria-hidden="true" />
            Assistant
          </Button>
        }
      />

      <PageContent className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="cv-content" dangerouslySetInnerHTML={{ __html: cv.markup }} />

        <aside className="order-first lg:order-last">
          <div className="sticky top-6 space-y-4 rounded-lg bg-card p-4 text-card-foreground ring-1 ring-foreground/10">
            <div>
              <h2 className="mt-1 text-lg font-semibold">Contents</h2>
            </div>
            <nav aria-label="CV sections" className="space-y-2 text-sm">
              {cv.headings
                .filter((heading) => heading.level === 2)
                .map((heading) => (
                  <a
                    className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    href={`#${heading.id}`}
                    key={heading.id}
                  >
                    {heading.text}
                  </a>
                ))}
            </nav>
          </div>
        </aside>
      </PageContent>
    </PageShell>
  );
}
