/**
 * LM-Studio Auto-Connect Service
 * Handles automatic detection and connection to LM-Studio
 */

import { saveAPIConfig, getAPIConfig } from "./api-config";

export interface LMStudioConnectionStatus {
  isConnected: boolean;
  endpoint: string;
  model: string;
  latency?: number;
  error?: string;
}

const LM_STUDIO_ENDPOINTS = [
  "http://localhost:8000/v1",
  "http://127.0.0.1:8000/v1",
  "http://localhost:1234/v1", // Alternative port
];

/**
 * Test connection to LM-Studio
 */
export async function testLMStudioConnection(
  endpoint: string,
): Promise<{ connected: boolean; model?: string; latency?: number }> {
  try {
    const startTime = Date.now();

    const response = await fetch(`${endpoint}/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return { connected: false };
    }

    const data = await response.json();
    const models = data.data || [];

    if (models.length === 0) {
      return { connected: false };
    }

    // Get the first available model
    const model = models[0].id;

    return { connected: true, model, latency };
  } catch (error) {
    console.error(`Failed to connect to ${endpoint}:`, error);
    return { connected: false };
  }
}

/**
 * Auto-detect and connect to LM-Studio
 * Tries multiple endpoints and saves config if found
 */
export async function autoConnectLMStudio(): Promise<LMStudioConnectionStatus> {
  // Check if already configured
  const currentConfig = getAPIConfig();
  if (currentConfig.endpoint?.includes("8000") && currentConfig.model) {
    // Try to verify the existing connection
    const status = await testLMStudioConnection(currentConfig.endpoint);
    if (status.connected) {
      return {
        isConnected: true,
        endpoint: currentConfig.endpoint,
        model: currentConfig.model,
        latency: status.latency,
      };
    }
  }

  // Try to find LM-Studio on standard endpoints
  for (const endpoint of LM_STUDIO_ENDPOINTS) {
    console.log(`Attempting to connect to LM-Studio at ${endpoint}`);
    const result = await testLMStudioConnection(endpoint);

    if (result.connected && result.model) {
      // Save the configuration
      saveAPIConfig({
        endpoint,
        model: result.model,
        temperature: 0.7,
        maxTokens: 2048,
      });

      console.log(`Successfully auto-connected to LM-Studio: ${endpoint}`);

      return {
        isConnected: true,
        endpoint,
        model: result.model,
        latency: result.latency,
      };
    }
  }

  return {
    isConnected: false,
    endpoint: "",
    model: "",
    error:
      "Could not auto-detect LM-Studio. Make sure it's running on localhost:8000",
  };
}

/**
 * Monitor LM-Studio connection status
 */
export async function checkLMStudioStatus(): Promise<LMStudioConnectionStatus> {
  const config = getAPIConfig();

  if (!config.endpoint?.includes("8000")) {
    return {
      isConnected: false,
      endpoint: "",
      model: "",
      error: "LM-Studio not configured",
    };
  }

  const result = await testLMStudioConnection(config.endpoint);

  if (result.connected) {
    return {
      isConnected: true,
      endpoint: config.endpoint,
      model: config.model,
      latency: result.latency,
    };
  }

  return {
    isConnected: false,
    endpoint: config.endpoint,
    model: config.model,
    error: "LM-Studio connection lost",
  };
}

/**
 * Parallel check all endpoints and return the first available one
 */
export async function findLMStudio(): Promise<string | null> {
  const promises = LM_STUDIO_ENDPOINTS.map((endpoint) =>
    testLMStudioConnection(endpoint),
  );

  const results = await Promise.allSettled(promises);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (
      result.status === "fulfilled" &&
      result.value.connected &&
      result.value.model
    ) {
      return LM_STUDIO_ENDPOINTS[i];
    }
  }

  return null;
}
