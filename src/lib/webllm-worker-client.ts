export type InitProgress = {
  progress?: number;
  text?: string;
};

export type ChatMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

export type ChatCompletionRequest = {
  messages: Array<ChatMessage>;
  temperature?: number;
  max_tokens?: number;
  seed?: number;
  response_format?: {
    type: "json_object";
    schema?: string;
  };
  tools?: Array<unknown>;
  tool_choice?: "auto" | "none";
  extra_body?: {
    enable_thinking?: boolean;
  };
};

export type ChatCompletionResponse = {
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

export type WebLlmEngine = {
  modelId: string;
  chat: {
    completions: {
      create: (request: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
    };
  };
  unload: () => Promise<void>;
  terminate: () => void;
};

type CreateWebLlmEngineOptions = {
  modelId?: string | undefined;
  preferredModelIds?: Array<string> | undefined;
  onProgress?: (progress: InitProgress) => void;
};

type WorkerLoadRequest = {
  id: number;
  type: "load";
  modelId?: string | undefined;
  preferredModelIds?: Array<string> | undefined;
};

type WorkerChatCompletionRequest = {
  id: number;
  type: "chatCompletion";
  request: ChatCompletionRequest;
};

type WorkerUnloadRequest = {
  id: number;
  type: "unload";
};

type ClientWorkerRequest =
  | Omit<WorkerLoadRequest, "id">
  | Omit<WorkerChatCompletionRequest, "id">
  | Omit<WorkerUnloadRequest, "id">;

type WorkerProgressResponse = {
  id: number;
  type: "progress";
  progress: InitProgress;
};

type WorkerResultResponse = {
  id: number;
  type: "result";
  result: unknown;
};

type WorkerErrorResponse = {
  id: number;
  type: "error";
  error: string;
};

type WorkerResponse = WorkerProgressResponse | WorkerResultResponse | WorkerErrorResponse;

type PendingRequest = {
  onProgress: ((progress: InitProgress) => void) | undefined;
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
};

export async function createWebLlmEngine({
  modelId,
  onProgress,
  preferredModelIds,
}: CreateWebLlmEngineOptions): Promise<WebLlmEngine> {
  const worker = new Worker(new URL("../workers/webllm.worker.ts", import.meta.url), {
    type: "module",
  });
  const client = new WebLlmWorkerClient(worker);
  const loadResult = (await client.request(
    {
      modelId,
      preferredModelIds,
      type: "load",
    },
    onProgress,
  )) as { modelId: string };

  return {
    chat: {
      completions: {
        create: (request) =>
          client.request({
            request,
            type: "chatCompletion",
          }) as Promise<ChatCompletionResponse>,
      },
    },
    modelId: loadResult.modelId,
    terminate: () => {
      client.terminate();
    },
    unload: () =>
      client.request({
        type: "unload",
      }) as Promise<void>,
  };
}

class WebLlmWorkerClient {
  private nextRequestId = 1;
  private readonly pendingRequests = new Map<number, PendingRequest>();

  constructor(private readonly worker: Worker) {
    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      this.handleMessage(event.data);
    });
    worker.addEventListener("error", (event) => {
      this.rejectAll(event.message || "WebLLM worker failed.");
    });
    worker.addEventListener("messageerror", () => {
      this.rejectAll("WebLLM worker sent an unreadable message.");
    });
  }

  request(
    request: ClientWorkerRequest,
    onProgress?: (progress: InitProgress) => void,
  ): Promise<unknown> {
    const id = this.nextRequestId;
    this.nextRequestId += 1;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        onProgress,
        reject,
        resolve,
      });
      this.worker.postMessage({
        ...request,
        id,
      });
    });
  }

  terminate() {
    this.rejectAll("WebLLM worker was terminated.");
    this.worker.terminate();
  }

  private handleMessage(response: WorkerResponse) {
    const pendingRequest = this.pendingRequests.get(response.id);
    if (!pendingRequest) {
      return;
    }

    if (response.type === "progress") {
      pendingRequest.onProgress?.(response.progress);
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.type === "error") {
      pendingRequest.reject(new Error(response.error));
      return;
    }

    pendingRequest.resolve(response.result);
  }

  private rejectAll(message: string) {
    for (const pendingRequest of this.pendingRequests.values()) {
      pendingRequest.reject(new Error(message));
    }
    this.pendingRequests.clear();
  }
}
