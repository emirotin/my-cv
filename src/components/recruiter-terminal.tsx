import { type CSSProperties, useEffect, useRef } from "react";
import {
  type AssistantTerminalApi,
  formatTerminalSystemMessage,
  runSendEmailTool,
  startRecruiterAssistantSession,
} from "@/components/recruiter-terminal-assistant";
import {
  ASCII_PORTRAIT,
  ASCII_PORTRAIT_CHARSET_NAME,
  ASCII_PORTRAIT_HEIGHT,
  ASCII_PORTRAIT_MATCHER,
  ASCII_PORTRAIT_SOURCE,
  ASCII_PORTRAIT_WIDTH,
} from "@/lib/ascii-portrait";
import terminalPortraitConfig from "@/lib/terminal-portrait-config.json";
import { cn } from "@/lib/utils";

type DisposableApi = {
  dispose: () => void;
};

type TerminalBufferApi = {
  active: {
    baseY: number;
    cursorY: number;
  };
};

type TerminalLinkApi = {
  activate: (event: MouseEvent, text: string) => void;
  decorations: {
    pointerCursor: boolean;
    underline: boolean;
  };
  range: {
    end: {
      x: number;
      y: number;
    };
    start: {
      x: number;
      y: number;
    };
  };
  text: string;
};

type TerminalLinkProviderApi = {
  provideLinks: (
    bufferLineNumber: number,
    callback: (links: Array<TerminalLinkApi> | undefined) => void,
  ) => void;
};

type TerminalApi = AssistantTerminalApi & {
  buffer: TerminalBufferApi;
  cols: number;
  dispose: () => void;
  element: HTMLElement | undefined;
  loadAddon: (addon: unknown) => void;
  open: (element: HTMLElement) => void;
  registerLinkProvider: (linkProvider: TerminalLinkProviderApi) => DisposableApi;
};

type FitAddonApi = {
  fit: () => void;
};

type RecruiterTerminalProps = {
  className?: string;
  cvMarkdown: string;
};

type MenuOptionId = 1 | 2 | 3;

type MenuOption = {
  id: MenuOptionId;
  label: string;
};

type MenuLine = {
  option?: MenuOption;
  text: string;
};

type MenuLink = {
  option: MenuOption;
  range: TerminalLinkApi["range"];
  text: string;
};

const MENU_OPTIONS: Array<MenuOption> = [
  {
    id: 1,
    label: "See CV",
  },
  {
    id: 2,
    label: "Send email",
  },
  {
    id: 3,
    label: "Launch interactive LLM assistant",
  },
];

const MENU_HELP_TEXT = "Use Up/Down + Enter, press 1/2/3, or click an option.";

const terminalStyle = {
  "--terminal-font-family": terminalPortraitConfig.fontFamily,
} as CSSProperties;

export function RecruiterTerminal({ className, cvMarkdown }: RecruiterTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let terminal: TerminalApi | undefined;
    let terminalClickElement: HTMLElement | undefined;
    let menuDataSubscription: DisposableApi | undefined;
    let menuLinkSubscription: DisposableApi | undefined;
    let assistantSession: DisposableApi | undefined;
    let menuActive = false;
    let menuBusy = false;
    let menuRendered = false;
    let menuLinks: Array<MenuLink> = [];
    let selectedOptionIndex = 0;
    let menuRenderQueue = Promise.resolve();

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
        cursorBlink: true,
        cursorStyle: "bar",
        fontFamily: terminalPortraitConfig.fontFamily,
        fontSize: terminalPortraitConfig.fontSize,
        letterSpacing: 0,
        lineHeight: terminalPortraitConfig.lineHeight,
        rows: ASCII_PORTRAIT_HEIGHT + 8,
        scrollback: 240,
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
      term.focus();

      menuLinkSubscription = term.registerLinkProvider({
        provideLinks(bufferLineNumber, callback) {
          if (!menuActive) {
            callback(undefined);
            return;
          }

          const links = menuLinks
            .filter(
              ({ range }) => range.start.y <= bufferLineNumber && range.end.y >= bufferLineNumber,
            )
            .map(({ option, range, text }) => ({
              activate(event: MouseEvent) {
                event.preventDefault();
                void selectMenuOption(term, option.id);
              },
              decorations: {
                pointerCursor: true,
                underline: true,
              },
              range,
              text,
            }));

          callback(links.length > 0 ? links : undefined);
        },
      });
      terminalClickElement = containerRef.current;
      terminalClickElement?.addEventListener("mousedown", handleTerminalClick, true);

      await runStartupProgram(term);
      await writeAsync(term, "Welcome to Eugene Mirotin's interactive CV terminal.\r\n");
      menuActive = true;
      await renderMenu(term, { replace: false });

      if (disposed) {
        return;
      }

      menuDataSubscription = term.onData((data) => {
        void handleMenuInput(term, data);
      });

      resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(containerRef.current);
    }

    async function handleMenuInput(term: TerminalApi, data: string) {
      if (!menuActive || menuBusy) {
        return;
      }

      if (data.includes("\u001B[A")) {
        await moveSelection(term, -1);
        return;
      }

      if (data.includes("\u001B[B")) {
        await moveSelection(term, 1);
        return;
      }

      const numericChoice = data.match(/[123]/)?.[0];
      if (numericChoice) {
        await selectMenuOption(term, Number(numericChoice) as MenuOptionId);
        return;
      }

      if (data.includes("\r")) {
        const selectedOption = MENU_OPTIONS[selectedOptionIndex] ?? MENU_OPTIONS[0];
        if (!selectedOption) {
          return;
        }
        await selectMenuOption(term, selectedOption.id);
      }
    }

    function handleTerminalClick(event: MouseEvent) {
      if (!terminal || !menuActive || menuBusy) {
        return;
      }

      const option = findMenuOptionAtPoint(terminal, event.clientX, event.clientY);
      if (!option) {
        return;
      }

      event.preventDefault();
      void selectMenuOption(terminal, option.id);
    }

    async function moveSelection(term: TerminalApi, delta: number) {
      selectedOptionIndex =
        (selectedOptionIndex + delta + MENU_OPTIONS.length) % MENU_OPTIONS.length;
      await queueMenuRender(term, { replace: true });
    }

    async function selectMenuOption(term: TerminalApi, optionId: MenuOptionId) {
      if (!menuActive || menuBusy) {
        return;
      }

      selectedOptionIndex = MENU_OPTIONS.findIndex((option) => option.id === optionId);
      menuBusy = true;
      await queueMenuRender(term, { replace: true });

      if (optionId === 1) {
        await writeAsync(term, "\r\nOpening /cv...\r\n");
        window.location.assign("/cv");
        return;
      }

      if (optionId === 2) {
        const contactText = await runSendEmailTool();
        await writeAsync(term, `\r\n${formatTerminalSystemMessage(contactText)}\r\n\r\n`);
        menuRendered = false;
        await renderMenu(term, { replace: false });
        menuBusy = false;
        return;
      }

      menuActive = false;
      menuLinks = [];
      menuDataSubscription?.dispose();
      menuDataSubscription = undefined;
      await writeAsync(term, "\r\nLaunching interactive LLM assistant...\r\n\r\n");
      assistantSession = startRecruiterAssistantSession({
        cvMarkdown,
        term,
      });
    }

    function queueMenuRender(term: TerminalApi, options: { replace: boolean }) {
      menuRenderQueue = menuRenderQueue.then(() => renderMenu(term, options));
      return menuRenderQueue;
    }

    async function renderMenu(term: TerminalApi, { replace }: { replace: boolean }) {
      const lines = buildMenuLines(selectedOptionIndex);

      if (replace && menuRendered) {
        await writeAsync(term, `\x1b[${lines.length}F`);
      }

      const firstLineNumber = getCurrentBufferLineNumber(term);
      menuLinks = buildMenuLinks(lines, firstLineNumber);
      await writeAsync(term, `${lines.map(({ text }) => `\x1b[2K\r${text}`).join("\r\n")}\r\n`);
      menuRendered = true;
    }

    void mountTerminal();

    return () => {
      disposed = true;
      assistantSession?.dispose();
      menuDataSubscription?.dispose();
      menuLinkSubscription?.dispose();
      terminalClickElement?.removeEventListener("mousedown", handleTerminalClick, true);
      resizeObserver?.disconnect();
      terminal?.dispose();
    };
  }, [cvMarkdown]);

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
      style={terminalStyle}
    />
  );
}

async function runStartupProgram(term: TerminalApi) {
  await writeAsync(
    term,
    [
      `\x1b[32m$ ascii-portrait --matrix ${ASCII_PORTRAIT_WIDTH}x${ASCII_PORTRAIT_HEIGHT} --charset ${ASCII_PORTRAIT_CHARSET_NAME} --fit ${ASCII_PORTRAIT_MATCHER}\x1b[0m`,
      `\x1b[33msource:\x1b[0m ${ASCII_PORTRAIT_SOURCE}`,
      "",
      ...ASCII_PORTRAIT.split("\n"),
      "",
      `\x1b[32mprogram exited 0 (${ASCII_PORTRAIT_WIDTH}x${ASCII_PORTRAIT_HEIGHT})\x1b[0m`,
      "",
    ].join("\r\n") + "\r\n",
  );
}

function buildMenuLines(selectedOptionIndex: number): Array<MenuLine> {
  return [
    {
      text: "Choose an option:",
    },
    ...MENU_OPTIONS.map((option, index) => ({
      option,
      text: formatMenuOption(option, index === selectedOptionIndex),
    })),
    {
      text: `\x1b[2m${MENU_HELP_TEXT}\x1b[0m`,
    },
  ];
}

function formatMenuOption(option: MenuOption, selected: boolean) {
  const text = `${selected ? ">" : " "} ${option.id}. ${option.label}`;
  return selected ? `\x1b[7m${text}\x1b[0m` : text;
}

function buildMenuLinks(lines: Array<MenuLine>, firstLineNumber: number): Array<MenuLink> {
  return lines.flatMap((line, index) => {
    if (!line.option) {
      return [];
    }

    const text = stripAnsiControlSequences(line.text);
    return [
      {
        option: line.option,
        range: {
          end: {
            x: text.length,
            y: firstLineNumber + index,
          },
          start: {
            x: 1,
            y: firstLineNumber + index,
          },
        },
        text,
      },
    ];
  });
}

function findMenuOptionAtPoint(term: TerminalApi, clientX: number, clientY: number) {
  const hitTargets = Array.from(
    term.element?.querySelectorAll<HTMLElement>(
      ".xterm-rows span, .xterm-accessibility-tree > div",
    ) ?? [],
  );

  return (
    hitTargets
      .map((element) => ({
        option: MENU_OPTIONS.find((option) =>
          (element.textContent ?? "").includes(`${option.id}. ${option.label}`),
        ),
        rect: element.getBoundingClientRect(),
      }))
      .find(
        ({ option, rect }) =>
          option &&
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom,
      )?.option ?? null
  );
}

function getCurrentBufferLineNumber(term: TerminalApi) {
  return term.buffer.active.baseY + term.buffer.active.cursorY + 1;
}

function writeAsync(term: TerminalApi, data: string) {
  return new Promise<void>((resolve) => {
    term.write(data, resolve);
  });
}

function stripAnsiControlSequences(text: string) {
  let clean = "";
  let inEscape = false;

  for (const char of text) {
    if (!inEscape && char === "\u001B") {
      inEscape = true;
      continue;
    }

    if (inEscape) {
      const code = char.charCodeAt(0);
      if (code >= 0x40 && code <= 0x7e) {
        inEscape = false;
      }
      continue;
    }

    clean += char;
  }

  return clean;
}
