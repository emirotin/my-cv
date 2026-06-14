import type { ReactNode } from "react";
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { ColorThemeSync } from "@/components/color-theme-sync";
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
