export type EvalModel = {
  id: string;
  label: string;
  vramMb: number;
  selectedByDefault: boolean;
  nativeTools: boolean;
  note: string;
};

export type EvalCase = {
  id: string;
  title: string;
  category: "factuality" | "tool" | "unknown";
  prompt: string;
  expected: {
    kind: "answer" | "tool";
    tool?: "send_email";
    requiredAny?: Array<Array<string>>;
    minRequiredGroups?: number;
    forbidden?: Array<string>;
    forbidPhoneNumber?: boolean;
  };
};

export type ActionResponse = {
  kind: "answer" | "tool";
  answer: string | null;
  tool: "send_email" | null;
};

export type CaseScore = {
  passed: boolean;
  parsed: ActionResponse | null;
  raw: string;
  failures: Array<string>;
};

export const NATIVE_TOOL_MODEL_IDS = new Set([
  "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
  "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
  "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
  "Hermes-3-Llama-3.1-8B-q4f32_1-MLC",
  "Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
]);

export const EVAL_MODELS: Array<EvalModel> = [
  {
    id: "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
    label: "Current baseline: Qwen2.5 0.5B q4f32",
    nativeTools: false,
    note: "Small baseline currently used by the app.",
    selectedByDefault: true,
    vramMb: 1060.2,
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
    label: "Qwen2.5 1.5B q4f32",
    nativeTools: false,
    note: "Still light, usually stronger than the 0.5B baseline.",
    selectedByDefault: true,
    vramMb: 1888.97,
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 3B q4f16",
    nativeTools: false,
    note: "Good candidate for CV factuality under a moderate VRAM budget.",
    selectedByDefault: true,
    vramMb: 2504.76,
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B q4f16",
    nativeTools: false,
    note: "Comparable 3B instruct candidate.",
    selectedByDefault: true,
    vramMb: 2263.69,
  },
  {
    id: "Phi-4-mini-instruct-q4f16_1-MLC",
    label: "Phi-4 mini q4f16",
    nativeTools: false,
    note: "Larger small-model candidate with stronger instruction following.",
    selectedByDefault: false,
    vramMb: 3437.58,
  },
  {
    id: "gemma-2-2b-it-q4f32_1-MLC",
    label: "Gemma 2 2B IT q4f32",
    nativeTools: false,
    note: "Moderate-size alternative for factuality comparison.",
    selectedByDefault: false,
    vramMb: 2508.75,
  },
  {
    id: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
    label: "Hermes 2 Pro Mistral 7B q4f16",
    nativeTools: true,
    note: "Heavier optional model; WebLLM native tools are hard-coded for Hermes-class models.",
    selectedByDefault: false,
    vramMb: 4033.28,
  },
];

export const EVAL_CASES: Array<EvalCase> = [
  {
    category: "factuality",
    expected: {
      kind: "answer",
      requiredAny: [["tallinn"], ["estonia"], ["remote"]],
    },
    id: "location-availability",
    prompt:
      "Where is Eugene based, and what engagement format does his CV say he is available for?",
    title: "Location and availability",
  },
  {
    category: "factuality",
    expected: {
      forbidden: ["kubernetes", "ios", "android"],
      kind: "answer",
      minRequiredGroups: 2,
      requiredAny: [
        ["voice over studio", "studio v2", "timeline editor"],
        ["firestore", "postgresql", "20m"],
        ["temporal", "export job", "bull"],
        ["ai podcast", "deep research", "speaker profile"],
      ],
    },
    id: "speechify-ai-studio",
    prompt: "Summarize Eugene's AI Studio work at Speechify in two concise bullets.",
    title: "Speechify AI Studio facts",
  },
  {
    category: "factuality",
    expected: {
      forbidden: ["speechify"],
      kind: "answer",
      requiredAny: [["resin", "balena"]],
    },
    id: "iot-terminal",
    prompt: "Which role involved IoT deployment and an in-browser terminal?",
    title: "IoT terminal attribution",
  },
  {
    category: "factuality",
    expected: {
      forbidden: ["core python", "python is listed", "primary language is python"],
      kind: "answer",
      requiredAny: [
        [
          "no",
          "not listed",
          "not explicitly listed",
          "not in core skills",
          "not listed as a core language",
        ],
        ["buildsite", "django", "python/django"],
      ],
    },
    id: "python-scope",
    prompt:
      "Is Python listed as one of Eugene's core languages? Mention any CV context where Python appears.",
    title: "Avoid overclaiming Python",
  },
  {
    category: "unknown",
    expected: {
      forbidPhoneNumber: true,
      forbidden: ["call him at", "his phone number is"],
      kind: "answer",
      requiredAny: [
        [
          "not in the cv",
          "not provided",
          "do not see",
          "does not include",
          "does not provide",
          "cv does not provide",
        ],
      ],
    },
    id: "phone-unknown",
    prompt: "What is Eugene's phone number?",
    title: "Unknown information handling",
  },
  {
    category: "tool",
    expected: {
      kind: "tool",
      tool: "send_email",
    },
    id: "send-email",
    prompt: "Please open an email draft so I can contact Eugene.",
    title: "Tool action instead of advice",
  },
];

export const ACTION_RESPONSE_SCHEMA = JSON.stringify({
  additionalProperties: false,
  properties: {
    answer: {
      type: ["string", "null"],
    },
    kind: {
      enum: ["answer", "tool"],
      type: "string",
    },
    tool: {
      enum: ["send_email", null],
    },
  },
  required: ["kind", "answer", "tool"],
  type: "object",
});

export const SEND_EMAIL_TOOL = {
  function: {
    description: "Open a mail client draft addressed to Eugene with the subject From CV.",
    name: "send_email",
    parameters: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
  },
  type: "function",
} as const;

export function buildActionSystemPrompt(cvMarkdown: string) {
  return [
    "You are the personal assistant for Eugene Mirotin speaking with a recruiter.",
    "Use only the CV content below. If the CV does not support an answer, say that the CV does not provide it.",
    "You must return exactly one JSON object matching this schema:",
    ACTION_RESPONSE_SCHEMA,
    'For normal answers, return {"kind":"answer","answer":"...","tool":null}.',
    'When the recruiter wants to email, contact, message, or follow up with Eugene, return {"kind":"tool","answer":null,"tool":"send_email"}.',
    "Never tell the recruiter to call a tool or send an email themselves; choose the tool response instead.",
    "",
    "CV:",
    cvMarkdown,
  ].join("\n");
}

export function buildNativeToolUserPrompt(cvMarkdown: string, prompt: string) {
  return [
    "You are the personal assistant for Eugene Mirotin speaking with a recruiter.",
    "Use the CV below. If the recruiter wants to email or contact Eugene, call the send_email tool.",
    "",
    "CV:",
    cvMarkdown,
    "",
    "Recruiter request:",
    prompt,
  ].join("\n");
}

export function scoreActionResponse(evalCase: EvalCase, raw: string): CaseScore {
  const failures: Array<string> = [];
  const parsed = parseActionResponse(raw);

  if (!parsed) {
    return {
      failures: ["Response was not parseable as the required JSON action object."],
      parsed: null,
      passed: false,
      raw,
    };
  }

  if (parsed.kind !== evalCase.expected.kind) {
    failures.push(`Expected kind ${evalCase.expected.kind}, got ${parsed.kind}.`);
  }

  if (evalCase.expected.kind === "tool") {
    if (parsed.tool !== evalCase.expected.tool) {
      failures.push(`Expected tool ${evalCase.expected.tool}, got ${parsed.tool ?? "null"}.`);
    }
    if (parsed.answer && /you can|you should|click|send an email/i.test(parsed.answer)) {
      failures.push("Model advised the recruiter instead of selecting the tool.");
    }
  }

  if (evalCase.expected.kind === "answer") {
    const answer = parsed.answer ?? "";
    const normalizedAnswer = normalize(answer);

    if (parsed.tool !== null) {
      failures.push(`Expected no tool, got ${parsed.tool}.`);
    }

    const requiredGroups = evalCase.expected.requiredAny ?? [];
    const matchedGroups = requiredGroups.filter((group) =>
      group.some((item) => normalizedAnswer.includes(normalize(item))),
    );
    const requiredGroupCount = evalCase.expected.minRequiredGroups ?? requiredGroups.length;

    if (matchedGroups.length < requiredGroupCount) {
      const missingGroups = requiredGroups.filter((group) => !matchedGroups.includes(group));
      failures.push(
        `Matched ${matchedGroups.length}/${requiredGroupCount} required evidence groups. Missing: ${missingGroups.map((group) => group.join(" | ")).join("; ")}.`,
      );
    }

    for (const forbidden of evalCase.expected.forbidden ?? []) {
      if (normalizedAnswer.includes(normalize(forbidden))) {
        failures.push(`Contained forbidden phrase: ${forbidden}.`);
      }
    }

    if (evalCase.expected.forbidPhoneNumber && /\+?\d[\d\s().-]{7,}\d/.test(answer)) {
      failures.push("Contained a phone-number-like string.");
    }
  }

  return {
    failures,
    parsed,
    passed: failures.length === 0,
    raw,
  };
}

export function parseActionResponse(raw: string): ActionResponse | null {
  const trimmed = raw.trim();
  const candidates = [trimmed, extractFirstJsonObject(trimmed)].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Partial<ActionResponse>;
      if (
        (parsed.kind === "answer" || parsed.kind === "tool") &&
        (typeof parsed.answer === "string" || parsed.answer === null) &&
        (parsed.tool === "send_email" || parsed.tool === null)
      ) {
        return {
          answer: parsed.answer,
          kind: parsed.kind,
          tool: parsed.tool,
        };
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function extractFirstJsonObject(value: string) {
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return value.slice(firstBrace, lastBrace + 1);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
