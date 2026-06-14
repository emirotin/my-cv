import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiClipboardLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiPlayLine,
  RiStopLine,
} from "@remixicon/react";
import {
  ACTION_RESPONSE_SCHEMA,
  EVAL_CASES,
  EVAL_MODELS,
  NATIVE_TOOL_MODEL_IDS,
  SEND_EMAIL_TOOL,
  buildActionSystemPrompt,
  buildNativeToolUserPrompt,
  scoreActionResponse,
  type CaseScore,
  type EvalModel,
} from "@/lib/eval-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type EvalRunnerProps = {
  cvMarkdown: string;
  manual?: boolean;
};

type InitProgress = {
  progress?: number;
  text?: string;
};

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ChatCompletionRequest = {
  messages: Array<ChatMessage>;
  temperature?: number;
  max_tokens?: number;
  seed?: number;
  response_format?: {
    type: "json_object";
    schema?: string;
  };
  tools?: Array<typeof SEND_EMAIL_TOOL>;
  tool_choice?: "auto" | "none";
  extra_body?: {
    enable_thinking?: boolean;
  };
};

type WebLlmModule = {
  CreateWebWorkerMLCEngine: (
    worker: Worker,
    modelId: string,
    config: {
      initProgressCallback?: (progress: InitProgress) => void;
    },
  ) => Promise<WebLlmEngine>;
};

type WebLlmEngine = {
  chat: {
    completions: {
      create: (request: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
    };
  };
  unload?: () => Promise<void>;
};

type ChatCompletionResponse = {
  choices: Array<{
    finish_reason?: string;
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
  }>;
};

type GpuEnvironment = {
  hasWebGpu: boolean;
  hasAdapter: boolean;
  adapterInfo: Record<string, unknown> | null;
  userAgent: string;
};

type EvalCaseResult = {
  caseId: string;
  title: string;
  elapsedMs: number;
  score: CaseScore;
};

type NativeToolResult = {
  status: "passed" | "failed" | "skipped";
  reason?: string;
  elapsedMs?: number;
  toolName?: string | null;
  raw?: unknown;
};

type ModelRun = {
  modelId: string;
  label: string;
  vramMb: number;
  nativeTools: boolean;
  status: "pending" | "loading" | "running" | "passed" | "failed" | "skipped";
  progressText: string;
  progressPercent: number | null;
  progressMessages: Array<string>;
  loadMs: number | null;
  totalMs: number | null;
  caseResults: Array<EvalCaseResult>;
  nativeToolResult: NativeToolResult;
  error?: string;
};

type EvalReport = {
  createdAt: string;
  status: "idle" | "running" | "complete" | "failed" | "stopped" | "skipped";
  environment: GpuEnvironment | null;
  cases: typeof EVAL_CASES;
  models: Array<ModelRun>;
  selectedModelIds: Array<string>;
  summary: {
    passedCases: number;
    totalCases: number;
    bestModelId: string | null;
  };
};

const EMPTY_NATIVE_TOOL_RESULT: NativeToolResult = {
  reason: "Not run yet.",
  status: "skipped",
};

export function EvalRunner({ cvMarkdown, manual = false }: EvalRunnerProps) {
  const [selectedModelIds, setSelectedModelIds] = useState(() =>
    EVAL_MODELS.filter((model) => model.selectedByDefault).map((model) => model.id),
  );
  const [environment, setEnvironment] = useState<GpuEnvironment | null>(null);
  const [modelRuns, setModelRuns] = useState<Array<ModelRun>>(() =>
    createInitialModelRuns(selectedModelIds),
  );
  const [status, setStatus] = useState<EvalReport["status"]>("idle");
  const [copied, setCopied] = useState<"json" | "markdown" | null>(null);
  const startedRef = useRef(false);
  const stopRequestedRef = useRef(false);

  const selectedModels = useMemo(
    () => EVAL_MODELS.filter((model) => selectedModelIds.includes(model.id)),
    [selectedModelIds],
  );

  const report = useMemo(
    () => buildEvalReport(status, environment, selectedModelIds, modelRuns),
    [environment, modelRuns, selectedModelIds, status],
  );
  const jsonReport = useMemo(() => JSON.stringify(report, null, 2), [report]);
  const markdownReport = useMemo(() => buildMarkdownReport(report), [report]);

  const runEval = useCallback(async () => {
    if (status === "running") {
      return;
    }

    stopRequestedRef.current = false;
    const initialRuns = createInitialModelRuns(selectedModelIds);
    setModelRuns(initialRuns);
    setStatus("running");

    const gpuEnvironment = await getGpuEnvironment();
    setEnvironment(gpuEnvironment);

    if (!gpuEnvironment.hasWebGpu || !gpuEnvironment.hasAdapter) {
      setModelRuns(
        initialRuns.map((modelRun) => ({
          ...modelRun,
          error: "WebGPU adapter was not available in this browser.",
          nativeToolResult: {
            reason: "Skipped because WebGPU is unavailable.",
            status: "skipped",
          },
          status: "skipped",
        })),
      );
      setStatus("skipped");
      return;
    }

    for (const model of selectedModels) {
      if (stopRequestedRef.current) {
        setStatus("stopped");
        return;
      }

      await runOneModel(model, cvMarkdown, updateModelRun, stopRequestedRef);
    }

    setStatus(stopRequestedRef.current ? "stopped" : "complete");
  }, [cvMarkdown, selectedModelIds, selectedModels, status]);

  useEffect(() => {
    if (manual || startedRef.current) {
      return;
    }

    startedRef.current = true;
    void runEval();
  }, [manual, runEval]);

  function updateModelRun(modelId: string, patch: Partial<ModelRun>) {
    setModelRuns((current) =>
      current.map((modelRun) =>
        modelRun.modelId === modelId
          ? {
              ...modelRun,
              ...patch,
            }
          : modelRun,
      ),
    );
  }

  function toggleModel(modelId: string) {
    if (status === "running") {
      return;
    }

    setSelectedModelIds((current) => {
      const next = current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId];
      setModelRuns(createInitialModelRuns(next));
      return next;
    });
  }

  async function copyReport(kind: "json" | "markdown") {
    const text = kind === "json" ? jsonReport : markdownReport;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Model Eval Run</CardTitle>
            <CardDescription>
              JSON action protocol, CV factuality, unknown handling, and optional native tool
              support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={status === "complete" ? "default" : "secondary"}>{status}</Badge>
              <Badge variant="outline">
                {selectedModelIds.length} model{selectedModelIds.length === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline">{EVAL_CASES.length} cases</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={status === "running" || selectedModelIds.length === 0}
                onClick={runEval}
              >
                <RiPlayLine aria-hidden="true" />
                Run Eval
              </Button>
              <Button
                disabled={status !== "running"}
                onClick={() => {
                  stopRequestedRef.current = true;
                }}
                variant="outline"
              >
                <RiStopLine aria-hidden="true" />
                Stop
              </Button>
            </div>

            {environment ? (
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div>WebGPU: {environment.hasWebGpu ? "available" : "missing"}</div>
                <div>Adapter: {environment.hasAdapter ? "available" : "missing"}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Models</CardTitle>
            <CardDescription>Defaults are selected for a reasonable first run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {EVAL_MODELS.map((model) => (
              <label
                className="grid cursor-pointer gap-2 rounded-md border p-3 transition-colors hover:bg-muted sm:grid-cols-[20px_1fr_auto]"
                key={model.id}
              >
                <input
                  checked={selectedModelIds.includes(model.id)}
                  className="mt-1 size-4"
                  disabled={status === "running"}
                  onChange={() => toggleModel(model.id)}
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{model.label}</span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    {model.note}
                  </span>
                </span>
                <span className="flex flex-wrap items-start justify-start gap-1 sm:justify-end">
                  <Badge variant="outline">{Math.round(model.vramMb)} MB</Badge>
                  {model.nativeTools ? <Badge variant="secondary">native tools</Badge> : null}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {modelRuns.map((modelRun) => (
            <ModelRunPanel key={modelRun.modelId} modelRun={modelRun} />
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Copy Results</CardTitle>
            <CardDescription>
              Send either format back after the browser run finishes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => void copyReport("json")} variant="outline">
                <RiClipboardLine aria-hidden="true" />
                {copied === "json" ? "Copied" : "JSON"}
              </Button>
              <Button onClick={() => void copyReport("markdown")} variant="outline">
                <RiClipboardLine aria-hidden="true" />
                {copied === "markdown" ? "Copied" : "Markdown"}
              </Button>
            </div>
            <textarea
              className="min-h-[320px] w-full resize-y rounded-md border bg-foreground p-3 font-mono text-xs leading-5 text-background outline-none focus:ring-2 focus:ring-ring"
              readOnly
              value={markdownReport}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protocol Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Main eval path uses WebLLM JSON mode with a strict action object. The app executes
              tool actions from JSON instead of relying on natural-language instructions.
            </p>
            <p>
              WebLLM native `tools` are only attempted for models marked as native-tool capable. The
              installed package hard-codes that support to Hermes-class models.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function ModelRunPanel({ modelRun }: Readonly<{ modelRun: ModelRun }>) {
  const passed = modelRun.caseResults.filter((result) => result.score.passed).length;
  const total = modelRun.caseResults.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{modelRun.label}</CardTitle>
            <CardDescription>{modelRun.modelId}</CardDescription>
          </div>
          <StatusBadge status={modelRun.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <div>VRAM: {Math.round(modelRun.vramMb)} MB</div>
          <div>Load: {formatMs(modelRun.loadMs)}</div>
          <div>
            Score: {passed}/{total || EVAL_CASES.length}
          </div>
        </div>

        {modelRun.progressText ? (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {modelRun.progressPercent === null ? null : `${modelRun.progressPercent}% `}
            {modelRun.progressText}
          </div>
        ) : null}

        {modelRun.error ? (
          <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <RiErrorWarningLine className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{modelRun.error}</span>
          </div>
        ) : null}

        {modelRun.caseResults.length > 0 ? (
          <div className="space-y-2">
            {modelRun.caseResults.map((result) => (
              <div className="rounded-md border p-3" key={result.caseId}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{result.title}</div>
                  {result.score.passed ? (
                    <RiCheckboxCircleLine className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <RiCloseCircleLine className="size-4 text-destructive" aria-hidden="true" />
                  )}
                </div>
                {result.score.failures.length > 0 ? (
                  <div className="mt-2 text-xs leading-5 text-destructive">
                    {result.score.failures.join(" ")}
                  </div>
                ) : null}
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-foreground p-2 text-xs leading-5 text-background">
                  {result.score.raw}
                </pre>
              </div>
            ))}
          </div>
        ) : null}

        <Separator />
        <div className="text-sm leading-6 text-muted-foreground">
          Native tools: {modelRun.nativeToolResult.status}
          {modelRun.nativeToolResult.reason ? ` - ${modelRun.nativeToolResult.reason}` : ""}
          {modelRun.nativeToolResult.toolName ? ` (${modelRun.nativeToolResult.toolName})` : ""}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: Readonly<{ status: ModelRun["status"] }>) {
  if (status === "passed") {
    return <Badge>passed</Badge>;
  }

  if (status === "failed") {
    return <Badge variant="destructive">failed</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

async function runOneModel(
  model: EvalModel,
  cvMarkdown: string,
  updateModelRun: (modelId: string, patch: Partial<ModelRun>) => void,
  stopRequestedRef: React.MutableRefObject<boolean>,
) {
  const startedAt = performance.now();
  let worker: Worker | null = null;
  let engine: WebLlmEngine | null = null;

  updateModelRun(model.id, {
    progressMessages: [],
    progressPercent: null,
    progressText: "Loading model",
    status: "loading",
  });

  try {
    const webllm = (await import("@mlc-ai/web-llm")) as WebLlmModule;
    worker = new Worker(new URL("../workers/webllm.worker.ts", import.meta.url), {
      type: "module",
    });
    const loadStartedAt = performance.now();
    engine = await webllm.CreateWebWorkerMLCEngine(worker, model.id, {
      initProgressCallback: (progress) => {
        const percent =
          typeof progress.progress === "number" ? Math.round(progress.progress * 100) : null;
        const text = progress.text ?? "Loading model";
        updateModelRun(model.id, {
          progressMessages: [`${percent ?? "-"}% ${text}`],
          progressPercent: percent,
          progressText: text,
        });
      },
    });
    updateModelRun(model.id, {
      loadMs: performance.now() - loadStartedAt,
      progressPercent: 100,
      progressText: "Model loaded",
      status: "running",
    });

    const caseResults: Array<EvalCaseResult> = [];
    for (const evalCase of EVAL_CASES) {
      if (stopRequestedRef.current) {
        break;
      }

      const caseStartedAt = performance.now();
      const request: ChatCompletionRequest = {
        max_tokens: 520,
        messages: [
          {
            content: buildActionSystemPrompt(cvMarkdown),
            role: "system",
          },
          {
            content: evalCase.prompt,
            role: "user",
          },
        ],
        response_format: {
          schema: ACTION_RESPONSE_SCHEMA,
          type: "json_object",
        },
        seed: 7,
        temperature: 0,
      };
      if (model.id.startsWith("Qwen3")) {
        request.extra_body = { enable_thinking: false };
      }

      const response = await engine.chat.completions.create(request);
      const raw = response.choices.at(0)?.message?.content?.trim() ?? "";
      caseResults.push({
        caseId: evalCase.id,
        elapsedMs: performance.now() - caseStartedAt,
        score: scoreActionResponse(evalCase, raw),
        title: evalCase.title,
      });
      updateModelRun(model.id, {
        caseResults: [...caseResults],
      });
    }

    const nativeToolResult = await runNativeToolEval(model, engine, cvMarkdown);
    const failedCases = caseResults.filter((result) => !result.score.passed);
    updateModelRun(model.id, {
      nativeToolResult,
      status:
        failedCases.length === 0 && nativeToolResult.status !== "failed" ? "passed" : "failed",
      totalMs: performance.now() - startedAt,
    });
  } catch (error) {
    updateModelRun(model.id, {
      error: getErrorMessage(error),
      status: "failed",
      totalMs: performance.now() - startedAt,
    });
  } finally {
    await engine?.unload?.().catch(() => undefined);
    worker?.terminate();
  }
}

async function runNativeToolEval(
  model: EvalModel,
  engine: WebLlmEngine,
  cvMarkdown: string,
): Promise<NativeToolResult> {
  if (!NATIVE_TOOL_MODEL_IDS.has(model.id)) {
    return {
      reason: "WebLLM native tools are not supported for this model ID.",
      status: "skipped",
    };
  }

  const startedAt = performance.now();
  try {
    const response = await engine.chat.completions.create({
      max_tokens: 240,
      messages: [
        {
          content: buildNativeToolUserPrompt(
            cvMarkdown,
            "Please provide Eugene's contact details so I can follow up.",
          ),
          role: "user",
        },
      ],
      seed: 7,
      temperature: 0,
      tool_choice: "auto",
      tools: [SEND_EMAIL_TOOL],
    });
    const toolName = response.choices.at(0)?.message?.tool_calls?.at(0)?.function?.name ?? null;
    const passed = toolName === "send_email";

    return {
      elapsedMs: performance.now() - startedAt,
      raw: response,
      ...(passed ? {} : { reason: "No send_email tool call returned." }),
      status: passed ? "passed" : "failed",
      toolName,
    };
  } catch (error) {
    return {
      elapsedMs: performance.now() - startedAt,
      reason: getErrorMessage(error),
      status: "failed",
    };
  }
}

async function getGpuEnvironment(): Promise<GpuEnvironment> {
  const gpu = (
    navigator as Navigator & {
      gpu?: {
        requestAdapter: () => Promise<{
          info?: Record<string, unknown>;
        } | null>;
      };
    }
  ).gpu;
  const adapter = gpu ? await gpu.requestAdapter() : null;
  const adapterInfo = adapter?.info
    ? Object.fromEntries(Object.entries(adapter.info as unknown as Record<string, unknown>))
    : null;

  return {
    adapterInfo,
    hasAdapter: Boolean(adapter),
    hasWebGpu: Boolean(gpu),
    userAgent: navigator.userAgent,
  };
}

function createInitialModelRuns(modelIds: Array<string>): Array<ModelRun> {
  return EVAL_MODELS.filter((model) => modelIds.includes(model.id)).map((model) => ({
    caseResults: [],
    label: model.label,
    loadMs: null,
    modelId: model.id,
    nativeToolResult: EMPTY_NATIVE_TOOL_RESULT,
    nativeTools: model.nativeTools,
    progressMessages: [],
    progressPercent: null,
    progressText: "",
    status: "pending",
    totalMs: null,
    vramMb: model.vramMb,
  }));
}

function buildEvalReport(
  status: EvalReport["status"],
  environment: GpuEnvironment | null,
  selectedModelIds: Array<string>,
  modelRuns: Array<ModelRun>,
): EvalReport {
  const passedCases = modelRuns.reduce(
    (sum, modelRun) => sum + modelRun.caseResults.filter((result) => result.score.passed).length,
    0,
  );
  const totalCases = modelRuns.reduce((sum, modelRun) => sum + modelRun.caseResults.length, 0);
  const bestModel = [...modelRuns]
    .filter((modelRun) => modelRun.caseResults.length > 0)
    .sort((left, right) => {
      const rightPassed = right.caseResults.filter((result) => result.score.passed).length;
      const leftPassed = left.caseResults.filter((result) => result.score.passed).length;
      return rightPassed - leftPassed;
    })
    .at(0);

  return {
    cases: EVAL_CASES,
    createdAt: new Date().toISOString(),
    environment,
    models: modelRuns,
    selectedModelIds,
    status,
    summary: {
      bestModelId: bestModel?.modelId ?? null,
      passedCases,
      totalCases,
    },
  };
}

function buildMarkdownReport(report: EvalReport) {
  const lines = [
    "# WebLLM CV Assistant Eval",
    "",
    `Status: ${report.status}`,
    `Created: ${report.createdAt}`,
    `WebGPU: ${report.environment?.hasWebGpu ? "available" : "missing"}`,
    `Adapter: ${report.environment?.hasAdapter ? "available" : "missing"}`,
    `Summary: ${report.summary.passedCases}/${report.summary.totalCases} passed`,
    `Best model: ${report.summary.bestModelId ?? "n/a"}`,
    "",
    "## Models",
    "",
  ];

  for (const model of report.models) {
    const passed = model.caseResults.filter((result) => result.score.passed).length;
    lines.push(`### ${model.label}`);
    lines.push("");
    lines.push(`- ID: ${model.modelId}`);
    lines.push(`- Status: ${model.status}`);
    lines.push(`- Score: ${passed}/${model.caseResults.length || EVAL_CASES.length}`);
    lines.push(`- Load: ${formatMs(model.loadMs)}`);
    lines.push(`- Total: ${formatMs(model.totalMs)}`);
    lines.push(
      `- Native tools: ${model.nativeToolResult.status}${model.nativeToolResult.reason ? ` - ${model.nativeToolResult.reason}` : ""}`,
    );
    if (model.error) {
      lines.push(`- Error: ${model.error}`);
    }
    lines.push("");

    for (const result of model.caseResults) {
      lines.push(`#### ${result.title}: ${result.score.passed ? "PASS" : "FAIL"}`);
      if (result.score.failures.length > 0) {
        lines.push(`Failures: ${result.score.failures.join(" ")}`);
      }
      lines.push("");
      lines.push("```json");
      lines.push(result.score.raw);
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function formatMs(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "n/a";
  }

  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }

  return `${(value / 1000).toFixed(1)} s`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
