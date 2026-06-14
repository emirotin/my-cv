import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";

function PageShell({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <main className={cn("min-h-svh bg-background text-foreground", className)}>{children}</main>
  );
}

function PageHeader({
  actions,
  leading,
}: Readonly<{
  actions?: ReactNode;
  leading: ReactNode;
}>) {
  return (
    <header className="border-b bg-muted/30">
      <div className="mx-auto flex min-h-[5.5rem] max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {leading}
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

function PageHeaderTitle({
  eyebrow,
  icon,
  title,
}: Readonly<{
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
}>) {
  return (
    <div className="min-w-0">
      {eyebrow ? (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {eyebrow}
        </div>
      ) : null}
      <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
        {title}
      </h1>
    </div>
  );
}

function PageContent({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return <div className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export { PageContent, PageHeader, PageHeaderTitle, PageShell };
