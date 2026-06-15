import { useEffect, useRef } from "react";
import {
  ASCII_PORTRAIT,
  ASCII_PORTRAIT_HEIGHT,
  ASCII_PORTRAIT_SOURCE,
  ASCII_PORTRAIT_WIDTH,
} from "@/lib/ascii-portrait";
import { cn } from "@/lib/utils";

type TerminalApi = {
  dispose: () => void;
  loadAddon: (addon: unknown) => void;
  open: (element: HTMLElement) => void;
  writeln: (data: string) => void;
};

type FitAddonApi = {
  fit: () => void;
};

type RecruiterTerminalProps = {
  className?: string;
  cvMarkdown: string;
};

export function RecruiterTerminal({ className }: RecruiterTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The full assistant implementation is parked in recruiter-terminal-assistant.tsx.
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let terminal: TerminalApi | undefined;

    async function mountTerminal() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);

      if (disposed || !containerRef.current) {
        return;
      }

      const term = new Terminal({
        allowProposedApi: false,
        convertEol: true,
        cursorBlink: false,
        fontFamily:
          "'Geist Mono Variable', 'SFMono-Regular', 'Cascadia Code', 'Liberation Mono', Menlo, monospace",
        fontSize: 8,
        letterSpacing: 0,
        lineHeight: 1,
        rows: ASCII_PORTRAIT_HEIGHT + 4,
        scrollback: 160,
        theme: {
          background: "transparent",
          black: "#101112",
          blue: "#5b8def",
          brightBlack: "#5f656f",
          brightBlue: "#8fb2ff",
          brightCyan: "#7dd7c8",
          brightGreen: "#b4e06f",
          brightMagenta: "#d4a5ff",
          brightRed: "#ff8f8f",
          brightWhite: "#ffffff",
          brightYellow: "#f3d274",
          cursor: "#f4f1ea",
          cyan: "#53b7aa",
          foreground: "#f4f1ea",
          green: "#8dbf4f",
          magenta: "#b786d8",
          red: "#e56b6f",
          selectionBackground: "#4c5a64",
          white: "#f4f1ea",
          yellow: "#d4a84d",
        },
      }) as TerminalApi;
      const fitAddon = new FitAddon() as FitAddonApi;

      terminal = term;
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();
      runStartupProgram(term);

      resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(containerRef.current);
    }

    void mountTerminal();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      terminal?.dispose();
    };
  }, []);

  return (
    <div
      aria-label="Recruiter assistant terminal"
      className={cn(
        "h-full min-h-115 overflow-hidden rounded-lg border border-stone-800 bg-[#101112] shadow-2xl",
        className,
      )}
      data-testid="recruiter-terminal"
      ref={containerRef}
      role="application"
    />
  );
}

function runStartupProgram(term: TerminalApi) {
  term.writeln(
    `\x1b[32m$ ascii-portrait --source ${ASCII_PORTRAIT_SOURCE} --size ${ASCII_PORTRAIT_WIDTH}\x1b[0m`,
  );
  term.writeln("");

  for (const line of ASCII_PORTRAIT.split("\n")) {
    term.writeln(line);
  }

  term.writeln("");
  term.writeln(
    `\x1b[32mprogram exited 0 (${ASCII_PORTRAIT_WIDTH}x${ASCII_PORTRAIT_HEIGHT})\x1b[0m`,
  );
}
