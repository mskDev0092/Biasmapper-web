/**
 * Service Detection Utility
 * Auto-detects local LLM services (Ollama, LM-Studio) on common ports
 */

export interface DetectedService {
  name: string;
  endpoint: string;
  port: number;
  available: boolean;
  models?: string[];
}

// Common ports to check for each service
export const COMMON_PORTS = {
  ollama: [11434, 11435, 8080],
  lmstudio: [8000, 8001, 1234],
};

/**
 * Check if a service is available at a specific port
 */
async function checkServiceHealth(
  url: string,
  timeout: number = 2000,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Get available models from Ollama on a specific port
 */
async function getOllamaModels(port: number): Promise<string[]> {
  try {
    const response = await fetch(`http://localhost:${port}/api/tags`, {
      timeout: 2000,
    } as any);
    if (!response.ok) return [];

    const data = (await response.json()) as {
      models?: Array<{ name: string }>;
    };
    return data.models?.map((m) => m.name) || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get available models from LM-Studio on a specific port
 */
async function getLMStudioModels(port: number): Promise<string[]> {
  try {
    const response = await fetch(`http://localhost:${port}/v1/models`, {
      timeout: 2000,
    } as any);
    if (!response.ok) return [];

    const data = (await response.json()) as {
      data?: Array<{ id: string }>;
    };
    return data.data?.map((m) => m.id) || [];
  } catch (error) {
    return [];
  }
}

/**
 * Auto-detect Ollama on common ports
 */
async function detectOllama(): Promise<DetectedService | null> {
  for (const port of COMMON_PORTS.ollama) {
    const isAvailable = await checkServiceHealth(
      `http://localhost:${port}/api/tags`,
    );
    if (isAvailable) {
      const models = await getOllamaModels(port);
      return {
        name: "Ollama (Local)",
        endpoint: `http://localhost:${port}/v1`,
        port,
        available: true,
        models: models.length > 0 ? models : undefined,
      };
    }
  }
  return null;
}

/**
 * Auto-detect LM-Studio on common ports
 */
async function detectLMStudio(): Promise<DetectedService | null> {
  for (const port of COMMON_PORTS.lmstudio) {
    const isAvailable = await checkServiceHealth(
      `http://localhost:${port}/v1/models`,
    );
    if (isAvailable) {
      const models = await getLMStudioModels(port);
      return {
        name: "LM-Studio",
        endpoint: `http://localhost:${port}/v1`,
        port,
        available: true,
        models: models.length > 0 ? models : undefined,
      };
    }
  }
  return null;
}

/**
 * Auto-detect available local LLM services on common ports
 */
export async function detectLocalServices(): Promise<DetectedService[]> {
  const detected: DetectedService[] = [];

  const ollama = await detectOllama();
  if (ollama) {
    detected.push(ollama);
  }

  const lmstudio = await detectLMStudio();
  if (lmstudio) {
    detected.push(lmstudio);
  }

  return detected;
}

/**
 * Attempt to auto-connect to the first available service
 * Returns config object or null if no services found
 */
export async function autoConnectToService(): Promise<{
  endpoint: string;
  model: string;
  apiKey: string;
} | null> {
  const detectedServices = await detectLocalServices();

  if (detectedServices.length === 0) {
    return null;
  }

  // Use the first detected service
  const service = detectedServices[0];
  // Use first available model or let user specify
  const model = service.models?.[0] || "";

  return {
    endpoint: service.endpoint,
    model: model,
    apiKey: "local", // Placeholder for local models
  };
}
