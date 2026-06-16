import { CONTACT_TERMINAL_TEXT } from "@/lib/contact";
import {
  ACTION_RESPONSE_SCHEMA,
  buildActionSystemPrompt,
  parseActionResponse,
} from "@/lib/eval-config";
import {
  createWebLlmEngine,
  type InitProgress,
  type WebLlmEngine,
} from "@/lib/webllm-worker-client";

type ChatRole = "assistant" | "system" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AssistantTerminalApi = {
  focus: () => void;
  onData: (callback: (data: string) => void) => { dispose: () => void };
  write: (data: string, callback?: () => void) => void;
  writeln: (data: string, callback?: () => void) => void;
};

type AssistantTool = {
  name: string;
  description: string;
  run: () => Promise<string>;
};

type RecruiterAssistantSessionOptions = {
  cvMarkdown: string;
  term: AssistantTerminalApi;
};

const GREETING =
  "I am the personal assistant for Eugene Mirotin, a Staff Software Engineer based in Tallinn. I can answer recruiter questions from Eugene's CV and provide Eugene's contact details when it is time to follow up.";

const DEFAULT_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f32_1-MLC";

const PREFERRED_MODELS = [
  DEFAULT_MODEL_ID,
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
];
const MIN_WEBLLM_STORAGE_BUFFERS_PER_SHADER_STAGE = 10;

export function startRecruiterAssistantSession({
  cvMarkdown,
  term,
}: RecruiterAssistantSessionOptions) {
  let disposed = false;
  let dataSubscription: { dispose: () => void } | undefined;
  let inputBuffer = "";
  let busy = false;
  let enginePromise: Promise<WebLlmEngine | null> | undefined;
  let engineStatus: "fallback" | "idle" | "loading" | "ready" = "idle";
  let conversationReady = false;
  let lastProgressPercent = -1;
  let renderedLoadingMessageCount = 0;
  const loadingMessages: Array<string> = [];
  const messages: Array<ChatMessage> = [
    {
      role: "system",
      content: buildActionSystemPrompt(cvMarkdown),
    },
    {
      role: "assistant",
      content: JSON.stringify({
        answer: GREETING,
        kind: "answer",
        tool: null,
      }),
    },
  ];
  const tools = createAssistantTools();

  term.focus();
  writeBanner(term);
  const isLoadingEngine = startEngineLoad();
  renderLoadingMessages(term);

  if (!isLoadingEngine) {
    markConversationReady(term);
  }

  dataSubscription = term.onData((data) => {
    void handleInputData(data);
  });

  async function handleInputData(data: string) {
    if (!conversationReady || busy) {
      return;
    }

    for (const char of data) {
      if (char === "\r") {
        const userText = inputBuffer.trim();
        inputBuffer = "";
        term.write("\r\n");

        if (userText.length === 0) {
          prompt(term);
          continue;
        }

        busy = true;
        try {
          await respondToUser(term, userText);
        } finally {
          busy = false;
          prompt(term);
        }
        continue;
      }

      if (char === "\u0003") {
        inputBuffer = "";
        term.write("^C\r\n");
        prompt(term);
        continue;
      }

      if (char === "\u007F") {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          term.write("\b \b");
        }
        continue;
      }

      if (isPrintable(char)) {
        inputBuffer += char;
        term.write(char);
      }
    }
  }

  function startEngineLoad() {
    if (!shouldLoadWebLlm()) {
      engineStatus = "fallback";
      queueLoadingMessage("Local model loading skipped; using CV search fallback.");
      return false;
    }

    if (!hasWebGpu()) {
      engineStatus = "fallback";
      queueLoadingMessage(
        "WebGPU is not available here, so I will answer from the CV search fallback.",
      );
      return false;
    }

    engineStatus = "loading";
    queueLoadingMessage("Checking local WebGPU support...");
    enginePromise = loadCompatibleWebLlm((progress) => {
      const percent =
        typeof progress.progress === "number" ? Math.round(progress.progress * 100) : -1;

      if (percent >= 0 && percent !== lastProgressPercent) {
        lastProgressPercent = percent;
        if (percent % 10 === 0 || percent >= 98) {
          queueLoadingMessage(`Loading local model: ${percent}%`);
        }
        return;
      }

      if (progress.text) {
        queueLoadingMessage(progress.text);
      }
    })
      .then((engine) => {
        if (disposed) {
          return engine;
        }

        engineStatus = "ready";
        queueLoadingMessage("Local in-browser model is ready.");
        markConversationReady(term);
        return engine;
      })
      .catch((error: unknown) => {
        if (disposed) {
          return null;
        }

        engineStatus = "fallback";
        queueLoadingMessage(`Local model failed to initialize: ${getErrorMessage(error)}`);
        queueLoadingMessage("Continuing with CV search fallback.");
        markConversationReady(term);
        return null;
      });
    return true;
  }

  function queueLoadingMessage(message: string) {
    if (disposed) {
      return;
    }

    if (loadingMessages.at(-1) === message) {
      return;
    }

    loadingMessages.push(message);
    if (!conversationReady) {
      writeSystem(term, message);
      renderedLoadingMessageCount = loadingMessages.length;
    }
  }

  function renderLoadingMessages(term: AssistantTerminalApi) {
    for (const message of loadingMessages.slice(renderedLoadingMessageCount)) {
      writeSystem(term, message);
    }
    renderedLoadingMessageCount = loadingMessages.length;
  }

  function markConversationReady(term: AssistantTerminalApi) {
    if (conversationReady) {
      return;
    }

    renderLoadingMessages(term);
    conversationReady = true;
    writeAssistant(term, GREETING);
    prompt(term);
  }

  async function respondToUser(term: AssistantTerminalApi, userText: string) {
    messages.push({
      role: "user",
      content: userText,
    });

    const commandResult = await maybeRunLocalCommand(userText, tools);
    if (commandResult) {
      writeSystem(term, commandResult);
      messages.push({
        role: "assistant",
        content: JSON.stringify({
          answer: null,
          kind: "tool",
          tool: "send_email",
        }),
      });
      return;
    }

    const engine = await getEngine();
    if (!engine) {
      const fallback = buildFallbackAnswer(userText, cvMarkdown);
      writeAssistant(term, fallback);
      messages.push({
        role: "assistant",
        content: JSON.stringify({
          answer: fallback,
          kind: "answer",
          tool: null,
        }),
      });
      return;
    }

    writeSystem(term, "Thinking locally in this browser...");
    const response = await engine.chat.completions.create({
      max_tokens: 520,
      messages,
      response_format: {
        schema: ACTION_RESPONSE_SCHEMA,
        type: "json_object",
      },
      temperature: 0,
    });
    const rawReply =
      response.choices.at(0)?.message?.content?.trim() ??
      "I could not produce a useful answer from the local model.";
    const action = parseActionResponse(rawReply);

    if (!action) {
      const fallback =
        "I could not parse the local model response, so I am falling back to CV search for this answer.";
      writeSystem(term, fallback);
      const answer = buildFallbackAnswer(userText, cvMarkdown);
      writeAssistant(term, answer);
      messages.push({
        role: "assistant",
        content: JSON.stringify({
          answer,
          kind: "answer",
          tool: null,
        }),
      });
      return;
    }

    messages.push({
      role: "assistant",
      content: JSON.stringify(action),
    });

    if (action.kind === "tool") {
      const toolName = action.tool;
      const tool = toolName ? tools.get(toolName) : undefined;
      if (!tool) {
        writeSystem(term, `Tool is not available: ${toolName ?? "unknown"}`);
        return;
      }

      writeSystem(term, await tool.run());
      return;
    }

    writeAssistant(
      term,
      action.answer ?? "I do not see a directly supported answer in Eugene's CV.",
    );
  }

  async function getEngine() {
    if (engineStatus === "fallback") {
      return null;
    }

    if (enginePromise) {
      return enginePromise;
    }

    startEngineLoad();
    return enginePromise ?? null;
  }

  return {
    dispose() {
      disposed = true;
      void enginePromise?.then(async (engine) => {
        await engine?.unload().catch(() => undefined);
        engine?.terminate();
      });
      dataSubscription?.dispose();
    },
  };
}

function createAssistantTools() {
  const tools = new Map<string, AssistantTool>();

  tools.set("send_email", {
    name: "send_email",
    description: "Print Eugene's email address and the suggested subject line.",
    run: runSendEmailTool,
  });

  return tools;
}

export async function runSendEmailTool() {
  return CONTACT_TERMINAL_TEXT;
}

async function loadCompatibleWebLlm(onProgress: (progress: InitProgress) => void) {
  const compatibility = await getWebLlmGpuCompatibility();

  if (compatibility.status === "missing-adapter") {
    throw new Error("WebGPU adapter is not available here.");
  }

  if (compatibility.status === "insufficient-storage-buffers") {
    throw new Error(
      `This browser's WebGPU adapter exposes ${compatibility.limit} storage buffers per shader stage, but the WebLLM runtime needs ${MIN_WEBLLM_STORAGE_BUFFERS_PER_SHADER_STAGE}.`,
    );
  }

  return createWebLlmEngine({
    onProgress,
    preferredModelIds: PREFERRED_MODELS,
  });
}

function shouldLoadWebLlm() {
  if (import.meta.env.SSR) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return !params.has("noai");
}

function hasWebGpu() {
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

async function getWebLlmGpuCompatibility() {
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    return {
      status: "missing-adapter" as const,
    };
  }

  if (
    adapter.limits.maxStorageBuffersPerShaderStage < MIN_WEBLLM_STORAGE_BUFFERS_PER_SHADER_STAGE
  ) {
    return {
      limit: adapter.limits.maxStorageBuffersPerShaderStage,
      status: "insufficient-storage-buffers" as const,
    };
  }

  return {
    status: "compatible" as const,
  };
}

async function maybeRunLocalCommand(text: string, tools: Map<string, AssistantTool>) {
  if (!isEmailToolRequest(text)) {
    return null;
  }

  const tool = tools.get("send_email");
  return tool?.run() ?? null;
}

function isEmailToolRequest(text: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[?!.,:;]+/g, " ")
    .replace(/\s+/g, " ");

  if (["/email", "email", "send email", "contact"].includes(normalized)) {
    return true;
  }

  const asksContact =
    /\b(contact|email|message|reach|follow up|get in touch)\b/.test(normalized) ||
    /\bhow can i (contact|email|message|reach)\b/.test(normalized);
  const targetsEugene = /\b(eugene|mirotin|him)\b/.test(normalized);

  return asksContact && targetsEugene;
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
    return "I do not see a directly supported answer in the CV. Eugene is a Staff Software Engineer with deep TypeScript, React, Node.js, PostgreSQL, cloud infrastructure, and AI workflow experience.";
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

function writeBanner(term: AssistantTerminalApi) {
  term.writeln("\x1b[32mEugene Mirotin CV Assistant\x1b[0m");
  term.writeln("browser-local assistant session");
  term.writeln("");
}

function writeAssistant(term: AssistantTerminalApi, text: string) {
  term.writeln(`\x1b[36massistant>\x1b[0m ${formatForTerminal(text)}`);
}

function writeSystem(term: AssistantTerminalApi, text: string) {
  term.writeln(formatTerminalSystemMessage(text));
}

export function formatTerminalSystemMessage(text: string) {
  return `\x1b[33msystem>\x1b[0m ${formatForTerminal(text)}`;
}

function prompt(term: AssistantTerminalApi) {
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
