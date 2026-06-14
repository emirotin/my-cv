import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { EvalRunner } from "@/components/eval-runner";
import { Button } from "@/components/ui/button";
import { getCvMarkdown } from "@/lib/cv";

export const Route = createFileRoute("/eval")({
  head: () => ({
    meta: [
      { title: "Eugene Mirotin - WebLLM Eval" },
      {
        content: "Browser-based WebLLM model eval for the interactive CV assistant.",
        name: "description",
      },
    ],
  }),
  loader: async () => ({
    cvMarkdown: await getCvMarkdown(),
  }),
  component: EvalRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    manual: search.manual === "1" || search.manual === "true",
  }),
});

function EvalRoute() {
  const { cvMarkdown } = Route.useLoaderData();
  const { manual } = Route.useSearch();

  return (
    <main className="min-h-svh bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Browser-local WebLLM eval
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
              CV Assistant Model Evaluation
            </h1>
          </div>
          <Button nativeButton={false} render={<Link to="/" />} variant="outline">
            <ArrowLeft aria-hidden="true" />
            Assistant
          </Button>
        </header>

        <EvalRunner cvMarkdown={cvMarkdown} manual={manual} />
      </div>
    </main>
  );
}
