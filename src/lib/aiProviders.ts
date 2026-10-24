import type { AiContentPart } from "./aiPrompts";

/**
 * Bring-your-own-key (BYOK) transport.
 *
 * The key never reaches our Supabase project: it is stored in this browser (only when the user
 * opts in) and sent straight to the provider they chose. That also means the provider sees the
 * clinical text/image directly — the settings UI says so.
 *
 * Models are selectable, not hardcoded. `models` holds fallbacks used before the provider's own
 * model list is fetched; the user can also type any identifier the provider accepts.
 */

export type AiProviderId = "openai" | "anthropic" | "gemini" | "openrouter";

export interface AiProviderInfo {
  id: AiProviderId;
  label: string;
  /** Fallback identifiers, most preferred first, used until (or instead of) a live fetch. */
  models: string[];
  placeholder: string;
  docsUrl: string;
  helpLabel: string;
}

export const AI_PROVIDERS: Record<AiProviderId, AiProviderInfo> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    placeholder: "sk-…",
    docsUrl: "https://platform.openai.com/api-keys",
    helpLabel: "How do I get an OpenAI key?",
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic Claude",
    models: ["claude-sonnet-4-5", "claude-haiku-4-5", "claude-opus-4-1"],
    placeholder: "sk-ant-…",
    docsUrl: "https://console.anthropic.com/settings/keys",
    helpLabel: "How do I get an Anthropic key?",
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
    placeholder: "AIza…",
    docsUrl: "https://aistudio.google.com/app/apikey",
    helpLabel: "How do I get a Gemini key?",
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    models: ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "anthropic/claude-sonnet-4.5"],
    placeholder: "sk-or-…",
    docsUrl: "https://openrouter.ai/settings/keys",
    helpLabel: "How do I get an OpenRouter key?",
  },
};

export const PROVIDER_ORDER: AiProviderId[] = ["openai", "anthropic", "gemini", "openrouter"];

export interface AiSettings {
  provider: AiProviderId;
  apiKey: string;
  model: string;
  /** true = persist in localStorage; false = keep in memory for this tab only. */
  saveLocally: boolean;
}

const STORAGE_KEY = "strokesuite.ai.byok.v1";

/** Non-persistent settings live here; module scope keeps them for the life of the tab. */
let memorySettings: AiSettings | null = null;

function isProviderId(value: unknown): value is AiProviderId {
  return (
    value === "openai" ||
    value === "anthropic" ||
    value === "gemini" ||
    value === "openrouter"
  );
}

export function defaultModel(provider: AiProviderId): string {
  return AI_PROVIDERS[provider].models[0];
}

function normalize(value: unknown): AiSettings | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (!isProviderId(record.provider)) return null;
  if (typeof record.apiKey !== "string" || record.apiKey.trim() === "") return null;
  const model =
    typeof record.model === "string" && record.model.trim() !== ""
      ? record.model.trim()
      : defaultModel(record.provider);
  return {
    provider: record.provider,
    apiKey: record.apiKey.trim(),
    model,
    saveLocally: record.saveLocally === true,
  };
}

export function getAiSettings(): AiSettings | null {
  if (memorySettings) return memorySettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = normalize(JSON.parse(raw));
    memorySettings = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function setAiSettings(settings: AiSettings | null): void {
  const next = settings ? normalize(settings) : null;
  memorySettings = next;
  try {
    if (next && next.saveLocally) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Private mode / blocked storage: the in-memory copy still works for this tab.
  }
}

export function clearAiSettings(): void {
  setAiSettings(null);
}

export function hasByokKey(): boolean {
  return getAiSettings() !== null;
}

export type AiErrorKind = "auth" | "quota" | "rate" | "model" | "network" | "unknown";

export class AiProviderError extends Error {
  readonly kind: AiErrorKind;
  readonly provider: AiProviderId;
  readonly status?: number;

  constructor(provider: AiProviderId, kind: AiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "AiProviderError";
    this.provider = provider;
    this.kind = kind;
    this.status = status;
  }
}

function errorKind(status: number, body: string): AiErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 400 && /api key|api_key|credential|invalid key/i.test(body)) return "auth";
  if (status === 402) return "quota";
  if (status === 429) return /insufficient_quota|billing|credit/i.test(body) ? "quota" : "rate";
  if (status === 404) return "model";
  if (status === 400 && /model/i.test(body)) return "model";
  return "unknown";
}

async function readError(provider: AiProviderId, response: Response): Promise<AiProviderError> {
  const text = await response.text().catch(() => "");
  let detail = text;
  try {
    const parsed = JSON.parse(text) as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof parsed.error === "string") detail = parsed.error;
    else if (parsed.error?.message) detail = parsed.error.message;
    else if (parsed.message) detail = parsed.message;
  } catch {
    // keep the raw body
  }
  return new AiProviderError(
    provider,
    errorKind(response.status, text),
    detail.slice(0, 300) || `HTTP ${response.status}`,
    response.status,
  );
}

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (match) return { mediaType: match[1], data: match[2] };
  return { mediaType: "image/jpeg", data: dataUrl };
}

function openAiStyleBody(
  model: string,
  system: string | undefined,
  user: AiContentPart[],
  maxTokens: number,
) {
  return {
    model,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      {
        role: "user",
        content: user.map((part) =>
          part.type === "text"
            ? { type: "text", text: part.text }
            : { type: "image_url", image_url: { url: part.dataUrl } },
        ),
      },
    ],
    max_tokens: maxTokens,
  };
}

/**
 * Send one chat request to the user's provider and return the reply text.
 * Throws AiProviderError for anything the UI should explain.
 */
export async function callAiProvider(args: {
  provider: AiProviderId;
  apiKey: string;
  model?: string;
  system?: string;
  user: AiContentPart[];
  maxTokens?: number;
}): Promise<string> {
  const { provider, apiKey, system, user } = args;
  const model = args.model?.trim() || defaultModel(provider);
  const maxTokens = args.maxTokens ?? 4000;

  try {
    if (provider === "anthropic") {
      const content = user.map((part) => {
        if (part.type === "text") return { type: "text", text: part.text };
        const parsed = parseDataUrl(part.dataUrl);
        return {
          type: "image",
          source: { type: "base64", media_type: parsed.mediaType, data: parsed.data },
        };
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages: [{ role: "user", content }],
        }),
      });
      if (!response.ok) throw await readError(provider, response);

      const data = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      return (data.content ?? [])
        .filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("\n")
        .trim();
    }

    if (provider === "gemini") {
      const parts = user.map((part) => {
        if (part.type === "text") return { text: part.text };
        const parsed = parseDataUrl(part.dataUrl);
        return { inlineData: { mimeType: parsed.mediaType, data: parsed.data } };
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
            contents: [{ role: "user", parts }],
            generationConfig: { maxOutputTokens: maxTokens },
          }),
        },
      );
      if (!response.ok) throw await readError(provider, response);

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return (data.candidates?.[0]?.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .join("\n")
        .trim();
    }

    const endpoint =
      provider === "openrouter"
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? { "X-Title": "StrokeSuite ID" } : {}),
      },
      body: JSON.stringify(openAiStyleBody(model, system, user, maxTokens)),
    });
    if (!response.ok) throw await readError(provider, response);

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError(
      provider,
      "network",
      error instanceof Error ? error.message : "Network request failed",
    );
  }
}

/** Ask the provider which model identifiers the key can use. Throws AiProviderError. */
export async function listAiModels(provider: AiProviderId, apiKey: string): Promise<string[]> {
  try {
    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      );
      if (!response.ok) throw await readError(provider, response);
      const data = (await response.json()) as {
        models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
      };
      return (data.models ?? [])
        .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
        .map((model) => (model.name ?? "").replace(/^models\//, ""))
        .filter(Boolean)
        .slice(0, 60);
    }

    if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
      });
      if (!response.ok) throw await readError(provider, response);
      const data = (await response.json()) as { data?: Array<{ id?: string }> };
      return (data.data ?? []).map((model) => model.id ?? "").filter(Boolean).slice(0, 60);
    }

    if (provider === "openrouter") {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      if (!response.ok) throw await readError(provider, response);
      const data = (await response.json()) as { data?: Array<{ id?: string }> };
      return (data.data ?? []).map((model) => model.id ?? "").filter(Boolean).slice(0, 60);
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) throw await readError(provider, response);
    const data = (await response.json()) as { data?: Array<{ id?: string }> };
    return (data.data ?? [])
      .map((model) => model.id ?? "")
      .filter((id) => id && /^(gpt-|o\d|chatgpt-)/.test(id))
      .sort()
      .slice(0, 60);
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError(
      provider,
      "network",
      error instanceof Error ? error.message : "Network request failed",
    );
  }
}

/** Lightweight credential check. Resolves on success, throws AiProviderError otherwise. */
export async function testAiConnection(provider: AiProviderId, apiKey: string): Promise<void> {
  try {
    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      );
      if (!response.ok) throw await readError(provider, response);
      return;
    }

    const headers: Record<string, string> = {};
    let url: string;

    if (provider === "anthropic") {
      url = "https://api.anthropic.com/v1/models";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else if (provider === "openrouter") {
      url = "https://openrouter.ai/api/v1/key";
      headers.Authorization = `Bearer ${apiKey}`;
    } else {
      url = "https://api.openai.com/v1/models";
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw await readError(provider, response);
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError(
      provider,
      "network",
      error instanceof Error ? error.message : "Network request failed",
    );
  }
}

/** One sentence a clinician can act on, without provider jargon. */
export function describeAiError(error: unknown, providerLabel?: string): string {
  if (!(error instanceof AiProviderError)) {
    return error instanceof Error ? error.message : "The AI request failed. Please try again.";
  }
  const provider = providerLabel ?? AI_PROVIDERS[error.provider].label;
  switch (error.kind) {
    case "auth":
      return `${provider} rejected this API key. Open AI Settings, check the key, and test the connection again.`;
    case "quota":
      return `${provider} says this key has no remaining credits or is over its billing limit. Check the provider's billing dashboard.`;
    case "rate":
      return `${provider} is rate-limiting this key. Wait a moment and try again.`;
    case "model":
      return `${provider} does not offer the selected model for that key. Choose a different model in AI Settings.`;
    case "network":
      return `Could not reach ${provider}. Check your connection, and make sure the key's account allows browser requests.`;
    default:
      return `${provider} returned an error${error.status ? ` (${error.status})` : ""}. ${error.message}`;
  }
}
