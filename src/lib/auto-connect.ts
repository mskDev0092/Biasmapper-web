/**
 * Generic Auto-Connect Service
 * Tries common local and predefined endpoints (LM-Studio, Ollama, etc.)
 * and saves a working API config when detected.
 */
import { PREDEFINED_ENDPOINTS, getAPIConfig } from "./api-config";
import { saveAPIConfig } from "./api-config";

export interface AutoConnectStatus {
  isConnected: boolean;
  endpoint?: string;
  model?: string;
  provider?: string;
  latency?: number;
  error?: string;
}

const COMMON_LOCAL_VARIANTS = [
  "http://localhost:8000/v1", // LM-Studio
  "http://127.0.0.1:8000/v1",
  "http://localhost:1234/v1",
  "http://localhost:11434/v1", // Ollama default
  "http://127.0.0.1:11434/v1",
];

async function tryModelsEndpoint(endpoint: string, timeout = 3000) {
  try {
    const start = Date.now();
    // Try multiple known paths for different providers
    const paths = ["/models", "/v1/models", "/v1/models/list"];
    for (const p of paths) {
      try {
        const url = `${endpoint.replace(/\/$/, "")}${p.startsWith("/") ? p : `/${p}`}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(timeout),
        });
        const latency = Date.now() - start;

        // Capture common HTTP errors to surface
        if (res.status === 401 || res.status === 403) {
          return { ok: false, error: `unauthorized (${res.status})` };
        }

        if (!res.ok) continue;

        const data = await res.json();

        // Normalize possible model lists
        const models = data?.data || data?.models || data || [];
        if (Array.isArray(models) && models.length > 0) {
          const model = models[0].id || models[0].name || models[0];
          // Provider detection heuristics (endpoint + response content)
          let provider: string | undefined = undefined;
          if (endpoint.includes("11434") || endpoint.includes("ollama"))
            provider = "Ollama";
          if (
            endpoint.includes("8000") ||
            (data && data.data && Array.isArray(data.data))
          )
            provider = provider || "LM-Studio";
          if (
            endpoint.includes("jan.ai") ||
            endpoint.includes("janai") ||
            String(endpoint).toLowerCase().includes("jan")
          )
            provider = provider || "Jan.ai";
          if (
            (data &&
              data.models &&
              Array.isArray(data.models) &&
              data.models[0] &&
              String(data.models[0]).toLowerCase().includes("gpt")) ||
            endpoint.includes("openai")
          )
            provider = provider || "OpenAI-compatible";
          // Additional data-based hints
          try {
            const raw = JSON.stringify(data).toLowerCase();
            if (!provider && raw.includes("ollama")) provider = "Ollama";
            if (!provider && raw.includes("lm-studio")) provider = "LM-Studio";
            if (!provider && raw.includes("jan"))
              provider = provider || "Jan.ai";
          } catch (e) {}

          return { ok: true, model: String(model), latency, provider };
        }
      } catch (innerErr) {
        // ignore and try next path
        continue;
      }
    }
    return { ok: false };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Try an endpoint directly (with /models) and return status if available
 */
async function probeEndpoint(endpoint: string) {
  // Try common variants
  const tried = [
    endpoint,
    endpoint.replace(/\/v1\/?$/, ""),
    endpoint.replace(/\/$/, ""),
  ];
  for (const e of tried) {
    const result: any = await tryModelsEndpoint(e);
    if (result.ok)
      return {
        endpoint: e,
        model: result.model,
        latency: result.latency,
        provider: result.provider,
      };
    if (result.error) return { endpoint: e, error: result.error };
  }
  return null;
}

/**
 * Auto-detect any available local AI service and save config
 */
export async function autoConnectAny(): Promise<AutoConnectStatus> {
  // If already configured and looks local, verify it first
  try {
    let lastError: string | undefined;
    const current = getAPIConfig();
    if (current.endpoint && current.endpoint.includes("localhost")) {
      const ok = await probeEndpoint(current.endpoint);
      if (ok) {
        return {
          isConnected: true,
          endpoint: current.endpoint,
          model: current.model || ok.model,
          provider: "Configured",
          latency: ok.latency,
        };
      }
    }

    // Prepare list: common local variants first, then PREDEFINED endpoints
    const candidates = [...COMMON_LOCAL_VARIANTS];
    for (const p of PREDEFINED_ENDPOINTS) {
      if (p.endpoint) candidates.push(p.endpoint);
    }

    for (const endpoint of candidates) {
      const res: any = await probeEndpoint(endpoint);
      if (res && res.model) {
        // Save minimal config (no API key for local)
        saveAPIConfig({ endpoint: res.endpoint, model: res.model, apiKey: "" });
        return {
          isConnected: true,
          endpoint: res.endpoint,
          model: res.model,
          provider: res.provider || "auto-detected",
          latency: res.latency,
        };
      }
      if (res && res.error) {
        // capture first meaningful error to present to the user
        lastError = `Failed ${endpoint}: ${res.error}`;
      }
    }

    return {
      isConnected: false,
      error: lastError || "No local AI service detected",
    };
  } catch (err: any) {
    return { isConnected: false, error: err?.message || String(err) };
  }
}

export default autoConnectAny;
