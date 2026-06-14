import type { ReactNode } from "react";
import { RiArrowLeftLine, RiErrorWarningLine, RiFileTextLine } from "@remixicon/react";
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { ColorThemeSync } from "@/components/color-theme-sync";
import { PageContent, PageHeader, PageShell } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { COLOR_THEME_BOOTSTRAP_SCRIPT } from "@/state/color-theme-store";
import appStyles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Eugene Mirotin - CV Assistant",
      },
      {
        name: "description",
        content: "Eugene Mirotin CV with an interactive in-browser AI assistant.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appStyles,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundRoute,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_THEME_BOOTSTRAP_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <ColorThemeSync />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundRoute() {
  return (
    <PageShell>
      <PageHeader
        actions={
          <Button nativeButton={false} render={<Link to="/cv" />} size="sm" variant="outline">
            <RiFileTextLine aria-hidden="true" />
            CV
          </Button>
        }
        leading={
          <div className="flex h-8 items-center gap-2 text-sm font-medium text-muted-foreground">
            <RiErrorWarningLine className="size-4" aria-hidden="true" />
            Page not found
          </div>
        }
      />

      <PageContent className="py-14">
        <section className="max-w-xl space-y-4">
          <div className="text-sm font-medium text-muted-foreground">404</div>
          <h2 className="text-3xl font-semibold tracking-normal text-foreground">Page not found</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This CV assistant does not have a page at the requested address.
          </p>
          <Button nativeButton={false} render={<Link to="/" />}>
            <RiArrowLeftLine aria-hidden="true" />
            Assistant
          </Button>
        </section>
      </PageContent>
    </PageShell>
  );
}
