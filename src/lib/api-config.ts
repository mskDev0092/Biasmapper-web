import {
  encryptSensitiveData,
  decryptSensitiveData,
  validateNoSensitiveDataInLogs,
} from "./encryption-utils";

/**
 * API Configuration for OpenAI-compatible endpoints
 *
 * SECURITY NOTES:
 * - API keys are encrypted before storage using browser fingerprint
 * - API calls are proxied through /api/proxy endpoint on server
 * - Keys are NEVER sent directly to external APIs from the browser
 * - All API requests are rate-limited and validated server-side
 */
export interface APIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_CONFIG: APIConfig = {
  endpoint: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2048,
};

const STORAGE_KEY = "biasmapper_api_config";
const ENCRYPTED_KEY_SUFFIX = "_encrypted";

/**
 * Get the stored configuration from localStorage
 * Decrypts the API key from encrypted storage
 */
export function getAPIConfig(): APIConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Decrypt API key if it was stored encrypted
      if (parsed.apiKey) {
        const encryptedKey = localStorage.getItem(
          `${STORAGE_KEY}${ENCRYPTED_KEY_SUFFIX}`,
        );
        if (encryptedKey) {
          try {
            parsed.apiKey = decryptSensitiveData(encryptedKey);
          } catch (decryptError) {
            console.error("Failed to decrypt API key:", decryptError);
            parsed.apiKey = "";
          }
        }
      }

      const config = { ...DEFAULT_CONFIG, ...parsed };
      validateNoSensitiveDataInLogs(config); // Development-only check

      return config;
    }
  } catch (e) {
    console.error("Failed to load API config:", e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Save API configuration with encrypted API key storage
 * The API key is encrypted before being stored in localStorage
 */
export function saveAPIConfig(config: Partial<APIConfig>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getAPIConfig();
    const updated = { ...current, ...config };

    // Validate inputs before saving
    if (updated.apiKey && updated.apiKey.length > 1000) {
      console.error("API key too long - possible attack attempt");
      return;
    }

    if (updated.endpoint && updated.endpoint.length > 500) {
      console.error("Endpoint URL too long");
      return;
    }

    // Encrypt the API key before storing
    let encryptedKey = "";
    if (updated.apiKey) {
      encryptedKey = encryptSensitiveData(updated.apiKey);
    }

    // Store the config without the actual API key
    const configToStore = { ...updated };
    delete (configToStore as any).apiKey;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToStore));

    // Store encrypted API key separately
    if (encryptedKey) {
      localStorage.setItem(
        `${STORAGE_KEY}${ENCRYPTED_KEY_SUFFIX}`,
        encryptedKey,
      );
    } else {
      localStorage.removeItem(`${STORAGE_KEY}${ENCRYPTED_KEY_SUFFIX}`);
    }
  } catch (e) {
    console.error("Failed to save API config:", e);
  }
}

/**
 * Clear all stored API configuration
 */
export function clearAPIConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(`${STORAGE_KEY}${ENCRYPTED_KEY_SUFFIX}`);
}

/**
 * Check if API is configured and ready to use
 */
export function isAPIConfigured(): boolean {
  const config = getAPIConfig();
  return !!(config.apiKey && config.endpoint);
}

// Predefined endpoints
export const PREDEFINED_ENDPOINTS = [
  {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    name: "Ollama (Local)",
    endpoint: "http://localhost:11434/v1",
    models: ["llama3.2", "llama3.1", "mistral", "codellama"],
  },
  {
    name: "Together AI",
    endpoint: "https://api.together.xyz/v1",
    models: [
      "meta-llama/Llama-3-70b-chat-hf",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
    ],
  },
  {
    name: "Groq",
    endpoint: "https://api.groq.com/openai/v1",
    models: [
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ],
  },
  {
    name: "Anthropic (via proxy)",
    endpoint: "https://api.anthropic.com/v1",
    models: [
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ],
  },
  { name: "Custom", endpoint: "", models: [] },
];
