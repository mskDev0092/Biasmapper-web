import { NextRequest, NextResponse } from "next/server";

// Rate limiting map: IP -> request count and timestamp
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // requests per window per IP

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0].trim() || realIP || "unknown";
}

/**
 * Check rate limit for client IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);

  if (!limitData || now > limitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limitData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limitData.count++;
  return true;
}

/**
 * Validate API key format (basic checks)
 */
function validateAPIKey(key: string): boolean {
  if (typeof key !== "string" || key.length === 0) {
    return false;
  }
  // Prevent extremely long keys that could be attacks
  if (key.length > 1000) {
    return false;
  }
  return true;
}

/**
 * Validate endpoint URL
 */
function validateEndpoint(endpoint: string): boolean {
  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return false;
  }

  try {
    const url = new URL(endpoint);
    // Only allow http and https
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }
    // Prevent localhost/internal network exploitation in production
    if (process.env.NODE_ENV === "production") {
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.")
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize error messages to prevent information leakage
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose full error details to client
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized")) {
      return "Authentication failed. Please check your API key.";
    }
    if (message.includes("not found")) {
      return "The specified endpoint or model was not found.";
    }
    if (message.includes("rate limit")) {
      return "API rate limit exceeded. Please try again later.";
    }
    if (message.includes("connection") || message.includes("timeout")) {
      return "Failed to connect to the API endpoint.";
    }
  }

  return "An error occurred while processing your request.";
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // Verify request content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { endpoint, apiKey, model, messages, temperature, max_tokens } = body;

    // Validate required fields
    if (!endpoint || !apiKey || !model || !messages) {
      return NextResponse.json(
        { error: "Missing required fields: endpoint, apiKey, model, messages" },
        { status: 400 },
      );
    }

    // Validate API key and endpoint
    if (!validateAPIKey(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 },
      );
    }

    if (!validateEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Invalid endpoint URL" },
        { status: 400 },
      );
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages must be a non-empty array" },
        { status: 400 },
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (typeof msg.role !== "string" || typeof msg.content !== "string") {
        return NextResponse.json(
          { error: "Invalid message format" },
          { status: 400 },
        );
      }
      // Prevent extremely large messages
      if (msg.content.length > 100000) {
        return NextResponse.json(
          { error: "Message content is too large" },
          { status: 400 },
        );
      }
    }

    // Validate model name (prevent injection)
    if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
      return NextResponse.json(
        { error: "Invalid model name format" },
        { status: 400 },
      );
    }

    // Call the external API from server (credentials stay on server)
    const apiResponse = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "BiasMapper-API-Proxy/1.0",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
      }),
      // Set a timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    // Check if the API response is successful
    if (!apiResponse.ok) {
      // Don't expose full error details from upstream API
      const statusText = apiResponse.statusText || "API Error";
      return NextResponse.json(
        {
          error: `API request failed: ${apiResponse.status} - ${sanitizeErrorMessage(new Error(statusText))}`,
        },
        { status: apiResponse.status },
      );
    }

    // Stream the response or return it
    const result = await apiResponse.json();

    // Validate response structure
    if (
      !result.choices ||
      !Array.isArray(result.choices) ||
      result.choices.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid response from API" },
        { status: 502 },
      );
    }

    // Return only necessary data to client (don't expose all metadata)
    return NextResponse.json({
      choices: result.choices,
      usage: result.usage || undefined,
    });
  } catch (error: unknown) {
    console.error("API Proxy Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Failed to connect to API endpoint" },
        { status: 502 },
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}

// Disable GET requests
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
