import { useEffect, useRef } from "react";

type ChatRole = "assistant" | "system" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type InitProgress = {
  progress?: number;
  text?: string;
};

type WebLlmModule = {
  CreateWebWorkerMLCEngine: (
    worker: Worker,
    modelId: string,
    config: {
      initProgressCallback?: (progress: InitProgress) => void;
    },
  ) => Promise<WebLlmEngine>;
  prebuiltAppConfig?: {
    model_list?: Array<{ model_id: string }>;
  };
};

type WebLlmEngine = {
  chat: {
    completions: {
      create: (request: {
        messages: Array<ChatMessage>;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<{
        choices: Array<{
          message?: {
            content?: string;
          };
        }>;
      }>;
    };
  };
};

type TerminalApi = {
  dispose: () => void;
  focus: () => void;
  loadAddon: (addon: unknown) => void;
  onData: (callback: (data: string) => void) => { dispose: () => void };
  open: (element: HTMLElement) => void;
  write: (data: string) => void;
  writeln: (data: string) => void;
};

type FitAddonApi = {
  fit: () => void;
};

type AssistantTool = {
  name: string;
  description: string;
  run: () => Promise<string>;
};

type RecruiterTerminalProps = {
  cvMarkdown: string;
};

const GREETING =
  "I am the personal assistant for Eugene Mirotin, a Senior / Staff Software Engineer based in Tallinn. I can answer recruiter questions from Eugene's CV and help open an email draft when it is time to follow up.";

const DEFAULT_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f32_1-MLC";

const PREFERRED_MODELS = [
  DEFAULT_MODEL_ID,
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
];

export function RecruiterTerminal({ cvMarkdown }: RecruiterTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let dataSubscription: { dispose: () => void } | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let terminal: TerminalApi | undefined;
    let inputBuffer = "";
    let busy = false;
    let enginePromise: Promise<WebLlmEngine | null> | undefined;
    let engineStatus: "fallback" | "idle" | "loading" | "ready" = "idle";
    let lastProgressPercent = -1;
    const messages: Array<ChatMessage> = [
      {
        role: "system",
        content: buildSystemPrompt(cvMarkdown),
      },
      {
        role: "assistant",
        content: GREETING,
      },
    ];
    const tools = createAssistantTools();

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
        fontFamily: "'SFMono-Regular', 'Cascadia Code', 'Liberation Mono', Menlo, monospace",
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 1.45,
        rows: 28,
        theme: {
          background: "#101112",
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

      writeBanner(term);
      writeAssistant(term, GREETING);
      prompt(term);

      dataSubscription = term.onData((data) => {
        void handleInputData(data);
      });
      resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(containerRef.current);

      if (shouldLoadWebLlm()) {
        void ensureEngine(term);
      } else {
        engineStatus = "fallback";
      }
    }

    async function handleInputData(data: string) {
      if (!terminal || busy) {
        return;
      }

      for (const char of data) {
        if (char === "\r") {
          const userText = inputBuffer.trim();
          inputBuffer = "";
          terminal.write("\r\n");

          if (userText.length === 0) {
            prompt(terminal);
            continue;
          }

          busy = true;
          try {
            await respondToUser(terminal, userText);
          } finally {
            busy = false;
            prompt(terminal);
          }
          continue;
        }

        if (char === "\u0003") {
          inputBuffer = "";
          terminal.write("^C\r\n");
          prompt(terminal);
          continue;
        }

        if (char === "\u007F") {
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            terminal.write("\b \b");
          }
          continue;
        }

        if (isPrintable(char)) {
          inputBuffer += char;
          terminal.write(char);
        }
      }
    }

    async function respondToUser(term: TerminalApi, userText: string) {
      messages.push({
        role: "user",
        content: userText,
      });

      const commandResult = await maybeRunLocalCommand(userText, tools);
      if (commandResult) {
        writeSystem(term, commandResult);
        messages.push({
          role: "assistant",
          content: commandResult,
        });
        return;
      }

      const engine = await ensureEngine(term);
      if (!engine) {
        const fallback = buildFallbackAnswer(userText, cvMarkdown);
        writeAssistant(term, fallback);
        messages.push({
          role: "assistant",
          content: fallback,
        });
        return;
      }

      writeSystem(term, "Thinking locally in this browser...");
      const response = await engine.chat.completions.create({
        max_tokens: 520,
        messages,
        temperature: 0.3,
      });
      const rawReply =
        response.choices.at(0)?.message?.content?.trim() ??
        "I could not produce a useful answer from the local model.";
      const { cleanReply, toolNames } = extractToolCalls(rawReply);

      if (cleanReply.length > 0) {
        writeAssistant(term, cleanReply);
        messages.push({
          role: "assistant",
          content: cleanReply,
        });
      }

      for (const toolName of toolNames) {
        const tool = tools.get(toolName);
        if (!tool) {
          writeSystem(term, `Tool is not available: ${toolName}`);
          continue;
        }

        writeSystem(term, await tool.run());
      }
    }

    async function ensureEngine(term: TerminalApi) {
      if (engineStatus === "fallback") {
        return null;
      }

      if (enginePromise) {
        return enginePromise;
      }

      if (!("gpu" in navigator)) {
        engineStatus = "fallback";
        writeSystem(
          term,
          "WebGPU is not available here, so I will answer from the CV search fallback.",
        );
        return null;
      }

      engineStatus = "loading";
      enginePromise = loadWebLlm((progress) => {
        if (!terminal) {
          return;
        }

        const percent =
          typeof progress.progress === "number" ? Math.round(progress.progress * 100) : -1;

        if (percent >= 0 && percent !== lastProgressPercent) {
          lastProgressPercent = percent;
          if (percent % 10 === 0 || percent >= 98) {
            writeSystem(terminal, `Loading local model: ${percent}%`);
          }
          return;
        }

        if (progress.text) {
          writeSystem(terminal, progress.text);
        }
      })
        .then((engine) => {
          engineStatus = "ready";
          writeSystem(term, "Local in-browser model is ready.");
          return engine;
        })
        .catch((error: unknown) => {
          engineStatus = "fallback";
          writeSystem(term, `Local model failed to initialize: ${getErrorMessage(error)}`);
          writeSystem(term, "Continuing with CV search fallback.");
          return null;
        });

      return enginePromise;
    }

    void mountTerminal();

    return () => {
      disposed = true;
      dataSubscription?.dispose();
      resizeObserver?.disconnect();
      terminal?.dispose();
    };
  }, [cvMarkdown]);

  return (
    <div
      aria-label="Recruiter assistant terminal"
      className="h-full min-h-[460px] overflow-hidden rounded-lg border border-stone-800 bg-[#101112] shadow-2xl"
      data-testid="recruiter-terminal"
      ref={containerRef}
      role="application"
    />
  );
}

function createAssistantTools() {
  const tools = new Map<string, AssistantTool>();

  tools.set("send_email", {
    name: "send_email",
    description: "Open a mail client draft addressed to Eugene with the subject From CV.",
    run: async () => {
      const href = "mailto:emirotin@gmail.com?Subject=From+CV";
      const link = document.createElement("a");
      link.href = href;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.append(link);
      link.click();
      link.remove();
      return "Opened an email draft to emirotin@gmail.com.";
    },
  });

  return tools;
}

function buildSystemPrompt(cvMarkdown: string) {
  return [
    "You are the personal assistant for Eugene Mirotin.",
    "You are speaking with a recruiter or hiring manager.",
    "Answer from the CV below. If the CV does not support an answer, say that clearly and keep it concise.",
    "Do not invent employers, dates, technologies, locations, compensation, availability, or personal details.",
    "When the user wants to contact Eugene or asks for an email draft, you may call the send_email tool by writing [[tool:send_email]] on its own line.",
    "Available tools:",
    "- send_email: opens mailto:emirotin@gmail.com?Subject=From+CV in the browser.",
    "",
    "CV:",
    cvMarkdown,
  ].join("\n");
}

async function loadWebLlm(onProgress: (progress: InitProgress) => void) {
  const webllm = (await import("@mlc-ai/web-llm")) as WebLlmModule;
  const modelId = selectModelId(webllm);
  const worker = new Worker(new URL("../workers/webllm.worker.ts", import.meta.url), {
    type: "module",
  });

  return webllm.CreateWebWorkerMLCEngine(worker, modelId, {
    initProgressCallback: onProgress,
  });
}

function selectModelId(webllm: WebLlmModule) {
  const models = webllm.prebuiltAppConfig?.model_list ?? [];
  const modelIds = new Set(models.map((model) => model.model_id));
  const preferredModel = PREFERRED_MODELS.find((modelId) => modelIds.has(modelId));

  return preferredModel ?? models.at(0)?.model_id ?? DEFAULT_MODEL_ID;
}

function shouldLoadWebLlm() {
  if (import.meta.env.SSR) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return !params.has("noai");
}

async function maybeRunLocalCommand(text: string, tools: Map<string, AssistantTool>) {
  const normalized = text.trim().toLowerCase();
  if (!["/email", "email", "send email", "contact"].includes(normalized)) {
    return null;
  }

  const tool = tools.get("send_email");
  return tool?.run() ?? null;
}

function extractToolCalls(reply: string) {
  const toolNames = new Set<string>();
  const cleanReply = reply
    .replace(/\[\[tool:([a-z_]+)\]\]/gi, (_, toolName: string) => {
      toolNames.add(toolName.toLowerCase());
      return "";
    })
    .trim();

  return {
    cleanReply,
    toolNames: Array.from(toolNames),
  };
}

function buildFallbackAnswer(userText: string, cvMarkdown: string) {
  const sections = cvMarkdown
    .split(/\n(?=##? )/g)
    .map((section) => section.trim())
    .filter(Boolean);
  const queryTokens = tokenize(userText);
  const scoredSections = sections
    .map((section) => ({
      score: Array.from(tokenize(section)).filter((token) => queryTokens.has(token)).length,
      section,
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);
  const bestSections = scoredSections.slice(0, 2).map(({ section }) =>
    section
      .replace(/^#+\s+/gm, "")
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 5)
      .join(" "),
  );

  if (bestSections.length === 0) {
    return "I do not see a directly supported answer in the CV. Eugene is a Senior / Staff Software Engineer with deep TypeScript, React, Node.js, PostgreSQL, cloud infrastructure, and AI workflow experience.";
  }

  return `From Eugene's CV: ${bestSections.join(" ")}`;
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#/.-]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function writeBanner(term: TerminalApi) {
  term.writeln("\x1b[32mEugene Mirotin CV Assistant\x1b[0m");
  term.writeln("browser-local assistant session");
  term.writeln("");
}

function writeAssistant(term: TerminalApi, text: string) {
  term.writeln(`\x1b[36massistant>\x1b[0m ${formatForTerminal(text)}`);
}

function writeSystem(term: TerminalApi, text: string) {
  term.writeln(`\x1b[33msystem>\x1b[0m ${formatForTerminal(text)}`);
}

function prompt(term: TerminalApi) {
  term.write("\r\n\x1b[32mrecruiter>\x1b[0m ");
}

function formatForTerminal(text: string) {
  return stripControlCharacters(stripAnsiControlSequences(text)).replace(/\n/g, "\r\n");
}

function isPrintable(char: string) {
  const code = char.charCodeAt(0);
  return code >= 0x20 && code !== 0x7f;
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

function stripControlCharacters(text: string) {
  let clean = "";

  for (const char of text) {
    const code = char.charCodeAt(0);
    if (char === "\n" || char === "\t" || (code >= 0x20 && code !== 0x7f)) {
      clean += char;
    }
  }

  return clean;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
