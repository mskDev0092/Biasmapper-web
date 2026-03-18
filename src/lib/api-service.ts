import { getAPIConfig, APIConfig } from "./api-config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Create a chat completion using the secure API proxy
 *
 * IMPORTANT SECURITY:
 * - This function calls /api/proxy on the server, NOT the external API directly
 * - API credentials are never exposed to external services from the browser
 * - All requests are rate-limited and validated server-side
 * - Never pass credentials directly in API calls from the browser
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  config?: APIConfig,
): Promise<string> {
  const apiConfig = config || getAPIConfig();

  if (!apiConfig.apiKey) {
    throw new Error(
      "API key not configured. Please configure your API settings.",
    );
  }

  if (!apiConfig.endpoint) {
    throw new Error(
      "API endpoint not configured. Please configure your API settings.",
    );
  }

  // Call the server-side proxy instead of the API directly
  // This keeps the API key on the server and prevents exposure
  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: apiConfig.endpoint,
      apiKey: apiConfig.apiKey,
      model: apiConfig.model,
      messages,
      temperature: apiConfig.temperature || 0.7,
      max_tokens: apiConfig.maxTokens || 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    try {
      const errorData = JSON.parse(error);
      throw new Error(
        errorData.error || `API request failed: ${response.status}`,
      );
    } catch {
      throw new Error(`API request failed: ${response.status}`);
    }
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

// BiasMapper-specific analysis functions
const BIASMAPPER_SYSTEM_PROMPT = `You are a BiasMapper analyst. Your task is to analyze text and classify its bias using the BiasMapper framework.

The BiasMapper framework uses two primary axes:

**Ideological Axis (L/R):**
- L++ : Far Left - Radical progressive, anti-capitalist
- L+  : Progressive - Center-left, reform-oriented
- L   : Left-leaning - Mild progressive tendencies
- C   : Center - Neutral, balanced
- R   : Right-leaning - Mild conservative tendencies
- R+  : Conservative - Center-right, tradition-oriented
- R++ : Far Right - Radical conservative, nationalist

**Societal Axis (T/B):**
- T++ : Establishment Extreme - Complete institutional alignment
- T+  : Mainstream - Trusts establishment institutions
- T   : Moderate Establishment - Generally pro-institution
- B   : Moderate Oppositional - Skeptical of institutions
- B+  : Grassroots - Bottom-up, anti-establishment
- B++ : Radical Dissent - Strongly anti-establishment

Analyze text content and provide:
1. Primary bias classification
2. Secondary bias (if applicable)
3. Confidence level (0.0-1.0)
4. Brief analysis explaining the classification
5. Key themes identified
6. Narrative tone description

Always respond in valid JSON format.`;

export interface BiasAnalysis {
  dominant_bias: string;
  secondary_bias: string;
  confidence: number;
  analysis: string;
  key_themes: string[];
  narrative_tone: string;
}

export async function analyzeTextBias(
  text: string,
  outletName?: string,
): Promise<BiasAnalysis> {
  const prompt = `Analyze the following ${outletName ? `from "${outletName}"` : ""} content for bias:

TEXT TO ANALYZE:
"""
${text}
"""

Return ONLY valid JSON with this structure:
{
  "dominant_bias": "CODE",
  "secondary_bias": "CODE", 
  "confidence": 0.0-1.0,
  "analysis": "Brief explanation",
  "key_themes": ["theme1", "theme2", "theme3"],
  "narrative_tone": "Description of tone"
}`;

  const response = await createChatCompletion([
    { role: "system", content: BIASMAPPER_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse bias analysis response");
}

export async function analyzeMultipleOutlets(
  outlets: Array<{ name: string; headlines: string[]; description?: string }>,
): Promise<Array<{ outlet: string } & BiasAnalysis>> {
  const results = [];

  for (const outlet of outlets) {
    const text = [
      outlet.description
        ? `Outlet: ${outlet.name} - ${outlet.description}`
        : `Outlet: ${outlet.name}`,
      "Headlines:",
      ...outlet.headlines.map((h) => `- ${h}`),
    ].join("\n");

    try {
      const analysis = await analyzeTextBias(text, outlet.name);
      results.push({ outlet: outlet.name, ...analysis });
    } catch (error) {
      console.error(`Failed to analyze ${outlet.name}:`, error);
      // Use default analysis on failure
      results.push({
        outlet: outlet.name,
        dominant_bias: "C",
        secondary_bias: "T+",
        confidence: 0.5,
        analysis: "Unable to analyze - API error",
        key_themes: ["general news"],
        narrative_tone: "Unknown",
      });
    }
  }

  return results;
}

export async function analyzeNarratives(
  analyses: Array<{ outlet: string; dominant_bias: string }>,
): Promise<{
  narratives: Array<{
    title: string;
    description: string;
    promoted_by: string;
    opposed_by: string;
    intensity: string;
  }>;
  trending_topics: string[];
  bias_tensions: string;
}> {
  const prompt = `Based on the following media bias analysis results, identify dominant narratives:

${analyses.map((a) => `${a.outlet}: ${a.dominant_bias}`).join("\n")}

Identify 5 major narratives and return ONLY valid JSON:
{
  "narratives": [
    {
      "title": "Narrative title",
      "description": "Description",
      "promoted_by": "Bias code",
      "opposed_by": "Opposing bias code",
      "intensity": "low/medium/high"
    }
  ],
  "trending_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "bias_tensions": "Description of major tensions"
}`;

  const response = await createChatCompletion([
    { role: "system", content: BIASMAPPER_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse narrative analysis");
}

// Debiasing function
export async function debiasText(text: string): Promise<{
  original_bias: string;
  neutralized_text: string;
  changes_made: string[];
}> {
  const prompt = `Analyze and neutralize the bias in this text:

"""
${text}
"""

Return ONLY valid JSON:
{
  "original_bias": "CODE",
  "neutralized_text": "The rewritten neutral version",
  "changes_made": ["change1", "change2", "change3"]
}`;

  const response = await createChatCompletion([
    {
      role: "system",
      content:
        BIASMAPPER_SYSTEM_PROMPT +
        "\n\nYou can also rewrite text to be more neutral while preserving factual accuracy.",
    },
    { role: "user", content: prompt },
  ]);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse debiasing response");
}

// Generate text with specific bias
export async function generateWithBias(
  topic: string,
  targetBias: string,
  format: string = "paragraph",
): Promise<string> {
  const prompt = `Write a ${format} about "${topic}" from a ${targetBias} perspective.

Bias code: ${targetBias}

Remember:
- L++/L+/L = Left/Progressive perspectives
- C = Neutral/Centrist
- R/R+/R++ = Right/Conservative perspectives
- T++/T+/T = Establishment/Mainstream alignment
- B/B+/B++ = Oppositional/Grassroots alignment

Write compelling content that reflects this perspective.`;

  return createChatCompletion([
    {
      role: "system",
      content:
        BIASMAPPER_SYSTEM_PROMPT +
        "\n\nYou can also generate content with specific bias perspectives.",
    },
    { role: "user", content: prompt },
  ]);
}
