import {
  CreateMLCEngine,
  prebuiltAppConfig,
  type ChatCompletion,
  type ChatCompletionRequest,
  type InitProgressReport,
  type MLCEngine,
} from "@mlc-ai/web-llm";

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

type WorkerRequest = WorkerLoadRequest | WorkerChatCompletionRequest | WorkerUnloadRequest;

type WorkerResponse =
  | {
      id: number;
      type: "progress";
      progress: InitProgressReport;
    }
  | {
      id: number;
      type: "result";
      result: unknown;
    }
  | {
      id: number;
      type: "error";
      error: string;
    };

let engine: MLCEngine | null = null;
let loadedModelId: string | null = null;

self.onmessage = (message: MessageEvent<WorkerRequest>) => {
  void handleRequest(message.data);
};

async function handleRequest(request: WorkerRequest) {
  try {
    if (request.type === "load") {
      const modelId = await loadModel(request);
      postResult(request.id, { modelId });
      return;
    }

    if (request.type === "chatCompletion") {
      if (!engine) {
        throw new Error("WebLLM engine has not been loaded.");
      }

      const response = (await engine.chat.completions.create(request.request)) as ChatCompletion;
      postResult(request.id, response);
      return;
    }

    await engine?.unload();
    engine = null;
    loadedModelId = null;
    postResult(request.id, undefined);
  } catch (error) {
    postError(request.id, getErrorMessage(error));
  }
}

async function loadModel(request: WorkerLoadRequest) {
  const modelId = request.modelId ?? selectModelId(request.preferredModelIds ?? []);
  if (engine && loadedModelId === modelId) {
    return modelId;
  }

  await engine?.unload();
  loadedModelId = null;
  engine = await CreateMLCEngine(modelId, {
    initProgressCallback: (progress) => {
      postMessage({
        id: request.id,
        progress,
        type: "progress",
      } satisfies WorkerResponse);
    },
  });
  loadedModelId = modelId;

  return modelId;
}

function selectModelId(preferredModelIds: Array<string>) {
  const models = prebuiltAppConfig?.model_list ?? [];
  const modelIds = new Set(models.map((model) => model.model_id));
  const preferredModel = preferredModelIds.find((modelId) => modelIds.has(modelId));
  const selectedModelId = preferredModel ?? models.at(0)?.model_id ?? preferredModelIds.at(0);

  if (!selectedModelId) {
    throw new Error("No WebLLM model id is available.");
  }

  return selectedModelId;
}

function postResult(id: number, result: unknown) {
  postMessage({
    id,
    result,
    type: "result",
  } satisfies WorkerResponse);
}

function postError(id: number, error: string) {
  postMessage({
    error,
    id,
    type: "error",
  } satisfies WorkerResponse);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
