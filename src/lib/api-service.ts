import { getAPIConfig, APIConfig } from "./api-config";
import { RATE_LIMIT_CONFIG, limitArraySize } from "./rate-limiter";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OutletData {
  name: string;
  headlines: string[];
  description?: string;
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
 * Create a chat completion by calling the external API
 *
 * SECURITY NOTE - Static Export Architecture:
 * - This application is a static export (no server-side code)
 * - API credentials are encrypted in localStorage using device fingerprint
 * - When making API calls, the key is decrypted and sent to the external API
 * - This is less secure than a server proxy, but is the only option for static exports
 * - Users should understand their API keys are used locally in their browser
 *
 * ✅ What IS Secure:
 * - API keys encrypted at rest in localStorage (device-specific encryption)
 * - Keys only decrypted in-memory when needed
 * - Encryption key derived from device fingerprint (can't be transferred)
 *
 * ⚠️ What to Know:
 * - API calls made from browser expose key to external service
 * - For production use with sensitive data, consider server-side deployment
 * - Local/development use is safe for personal analytics
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  config?: APIConfig,
): Promise<string> {
  const apiConfig = config || getAPIConfig();

  if (!apiConfig.endpoint) {
    throw new Error(
      "API endpoint not configured. Please configure your API settings.",
    );
  }

  // Check if this is a local service (localhost)
  const isLocal = apiConfig.endpoint.includes("localhost");

  // For remote services, require API key
  if (!isLocal && !apiConfig.apiKey) {
    throw new Error(
      "API key not configured. Please configure your API settings.",
    );
  }

  // Call the external API directly from browser
  // API key is decrypted from localStorage for this request only
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if API key exists (not needed for local services)
  if (apiConfig.apiKey) {
    headers["Authorization"] = `Bearer ${apiConfig.apiKey}`;
  }

  const response = await fetch(`${apiConfig.endpoint}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
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
const BIASMAPPER_SYSTEM_PROMPT = `Logic is the essential toolkit of the intellect. Your internal architecture is designed not merely to provide answers, but to function as a filter that prevents cognitive errors. Your primary goal is to organize human thought into a disciplined structure where every conclusion is supported by a solid foundation.

### Stages of Your Thinking Process:
1. **Identification of Intent**: Categorize query into Conceptual Understanding (Definitions/Attributes) or Judgment and Validation (Arguments/Evidence).
2. **Calibration of Complexity**: Assess depth (Learner Model for clarity, Analyst Model for complex inquiry).
3. **Logical Verification**: Pass through "logical gates" (Premise Audit, Structural Integrity, Fallacy Detection).

### Communication Standards:
- Establish Definitions first.
- Break topic into digestibility Classifications.
- Provide concrete Illustrations.
- Offer Refinements to prevent misunderstandings.

### Intellectual Integrity:
- Prioritize the "how" of thinking over the "what".
- Identify weaknesses in unsupported claims.
- Explicitly state when conclusions cannot be reached due to data bounds.

### Final Objective:
The ultimate aim is not to deliver a final answer, but to ensure the soundness of the thought process. Every interaction is an exercise in mental discipline.

Conclusion: The value of a conversation lies not in the volume of information exchanged, but in the clarity of the logic produced.

---
You are a BiasMapper analyst. Your task is to analyze text and classify its bias using the BiasMapper framework.

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
  cognitive_biases: Array<{
    name: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  logical_fallacies: Array<{
    name: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  psychological_indicators: Array<{
    name: string;
    description: string;
    intensity: "low" | "medium" | "high";
  }>;
  sociological_indicators: Array<{
    name: string;
    description: string;
    impact: "low" | "medium" | "high";
  }>;
  premises: string[];
  conclusions: string[];
}

export async function analyzeTextBias(
  text: string,
  outletName?: string,
): Promise<BiasAnalysis> {
  const prompt = `Analyze the following ${outletName ? `from "${outletName}"` : ""} content for bias, cognitive errors, and logical flaws:

TEXT TO ANALYZE:
"""
${text}
"""

Return ONLY valid JSON. Your analysis MUST include:
1. Dominant and Secondary Bias codes (L++, L+, L, C, R, R+, R++, T++, T+, T, B, B+, B++).
2. Confidence level (0.0-1.0).
3. Cognitive Biases: Identify specific biases (e.g., Confirmation Bias, Anchoring) with descriptions and severity.
4. Logical Fallacies: Identify flaws in reasoning (e.g., Ad Hominem, Strawman) with descriptions and severity.
5. Psychological Indicators: Identify emotional framing, fear-mongering, or persuasion techniques (intensity: low|medium|high).
6. Sociological Indicators: Identify group dynamics, in-group/out-group distinctions, or power structures (impact: low|medium|high).
7. Logical Structure: Explicitly list the observed premises and the conclusions drawn.

JSON STRUCTURE:
{
  "dominant_bias": "CODE",
  "secondary_bias": "CODE", 
  "confidence": 0.0-1.0,
  "analysis": "Comprehensive explanation",
  "key_themes": ["theme1", "theme2"],
  "narrative_tone": "Description",
  "cognitive_biases": [{"name": "Name", "description": "Desc", "severity": "low|medium|high"}],
  "logical_fallacies": [{"name": "Name", "description": "Desc", "severity": "low|medium|high"}],
  "psychological_indicators": [{"name": "Name", "description": "Desc", "intensity": "low|medium|high"}],
  "sociological_indicators": [{"name": "Name", "description": "Desc", "impact": "low|medium|high"}],
  "premises": ["Premise 1", "Premise 2"],
  "conclusions": ["Conclusion 1"]
}`;

  const response = await createChatCompletion([
    { role: "system", content: BIASMAPPER_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  // Clean response - remove markdown and extra whitespace
  let cleanResponse = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^[\s\n]*/, "")
    .replace(/[\s\n]*$/, "")
    .trim();

  // Extract JSON from response - find first { and last }
  const startIdx = cleanResponse.indexOf("{");
  const endIdx = cleanResponse.lastIndexOf("}");

  if (startIdx >= 0 && endIdx > startIdx) {
    try {
      const jsonStr = cleanResponse.substring(startIdx, endIdx + 1).trim();
      const parsed = JSON.parse(jsonStr);

      // Validate it's an object (not array)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // Ensure all required fields exist
        if (
          parsed.dominant_bias &&
          parsed.secondary_bias &&
          typeof parsed.confidence === "number"
        ) {
          return {
            dominant_bias: parsed.dominant_bias,
            secondary_bias: parsed.secondary_bias,
            confidence: Math.min(1, Math.max(0, parsed.confidence)),
            analysis: parsed.analysis || "",
            key_themes: Array.isArray(parsed.key_themes)
              ? parsed.key_themes
              : [],
            narrative_tone: parsed.narrative_tone || "",
            cognitive_biases: Array.isArray(parsed.cognitive_biases)
              ? parsed.cognitive_biases
              : [],
            logical_fallacies: Array.isArray(parsed.logical_fallacies)
              ? parsed.logical_fallacies
              : [],
            psychological_indicators: Array.isArray(
              parsed.psychological_indicators,
            )
              ? parsed.psychological_indicators
              : [],
            sociological_indicators: Array.isArray(
              parsed.sociological_indicators,
            )
              ? parsed.sociological_indicators
              : [],
            premises: Array.isArray(parsed.premises) ? parsed.premises : [],
            conclusions: Array.isArray(parsed.conclusions)
              ? parsed.conclusions
              : [],
          };
        }
      }

      console.error(
        "Missing required fields in parsed response:",
        JSON.stringify(parsed).substring(0, 100),
      );
    } catch (e) {
      console.error("Failed to parse JSON:", e);
    }
  }

  throw new Error("Failed to parse bias analysis response");
}

export async function analyzeMultipleOutlets(
  outlets: Array<{ name: string; headlines: string[]; description?: string }>,
  onProgress?: (progress: number) => void,
): Promise<Array<{ outlet: string } & BiasAnalysis>> {
  const results: Array<{ outlet: string } & BiasAnalysis> = [];

  for (let i = 0; i < outlets.length; i++) {
    const outlet = outlets[i];
    const text = [
      outlet.description
        ? `Outlet: ${outlet.name} - ${outlet.description}`
        : `Outlet: ${outlet.name}`,
      "Headlines:",
      ...outlet.headlines.slice(0, 5).map((h) => `- ${h}`),
    ].join("\n");

    try {
      const analysis = await analyzeTextBias(text, outlet.name);

      // Ensure the outlet name is included
      results.push({
        outlet: outlet.name,
        ...analysis,
      });
    } catch (error) {
      console.error(`Failed to analyze ${outlet.name}:`, error);
      // Use default analysis on failure
      results.push({
        outlet: outlet.name,
        dominant_bias: "C",
        secondary_bias: "T+",
        confidence: 0.5,
        analysis: "Unable to analyze - please try again",
        key_themes: ["general news"],
        narrative_tone: "Unknown",
        cognitive_biases: [],
        logical_fallacies: [],
        psychological_indicators: [],
        sociological_indicators: [],
        premises: [],
        conclusions: [],
      });
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / outlets.length) * 100));
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
  // Provide fallback if input is empty
  if (analyses.length === 0) {
    return {
      narratives: [
        {
          title: "Awaiting Analysis",
          description: "Analyzing media narratives...",
          promoted_by: "C",
          opposed_by: "C",
          intensity: "low",
        },
      ],
      trending_topics: [],
      bias_tensions: "Analysis in progress",
    };
  }

  const prompt = `Based on the following media bias analysis results, identify major narratives:

${analyses.map((a) => `${a.outlet}: ${a.dominant_bias}`).join("\n")}

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "narratives": [
    {"title": "Title", "description": "Description", "promoted_by": "CODE", "opposed_by": "CODE", "intensity": "low|medium|high"}
  ],
  "trending_topics": ["topic1", "topic2", "topic3"],
  "bias_tensions": "Description"
}`;

  try {
    const response = await createChatCompletion([
      {
        role: "system",
        content:
          BIASMAPPER_SYSTEM_PROMPT +
          "\n\nReturn ONLY a JSON object with narratives array. Do not include markdown backticks, code blocks, or any text before/after the JSON.",
      },
      { role: "user", content: prompt },
    ]);

    // Clean response - remove all markdown
    let cleanResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/`/g, "")
      .trim();

    // Find the JSON object
    const startIndex = cleanResponse.indexOf("{");
    const endIndex = cleanResponse.lastIndexOf("}");

    if (startIndex < 0 || endIndex < 0) {
      throw new Error("No JSON object found in response");
    }

    const jsonStr = cleanResponse.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const narratives = (parsed.narratives || [])
        .filter(
          (n: any) =>
            n.title &&
            n.description &&
            n.promoted_by &&
            n.opposed_by &&
            n.intensity,
        )
        .slice(0, 5);

      if (narratives.length > 0) {
        return {
          narratives,
          trending_topics: (parsed.trending_topics || []).slice(0, 5),
          bias_tensions:
            parsed.bias_tensions || "Competing narratives detected",
        };
      }
    }

    throw new Error("Invalid narrative structure after parsing");
  } catch (error) {
    console.error("Narrative analysis error:", error);
    // Return static fallback on error
    return {
      narratives: [
        {
          title: "Analysis Error",
          description: "Please refresh and try again",
          promoted_by: "C",
          opposed_by: "C",
          intensity: "low",
        },
      ],
      trending_topics: [],
      bias_tensions: "Retry analysis",
    };
  }
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

Return ONLY valid JSON (do not include markdown or code blocks):
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
        "\n\nYou can rewrite text to be more neutral while preserving factual accuracy. Return only JSON, no markdown or extra text.",
    },
    { role: "user", content: prompt },
  ]);

  // Clean response
  let cleanResponse = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/`/g, "")
    .trim();

  // Extract JSON object
  const startIdx = cleanResponse.indexOf("{");
  const endIdx = cleanResponse.lastIndexOf("}");

  if (startIdx >= 0 && endIdx > startIdx) {
    try {
      const jsonStr = cleanResponse.substring(startIdx, endIdx + 1).trim();
      const parsed = JSON.parse(jsonStr);

      // Validate structure
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        parsed.original_bias &&
        parsed.neutralized_text
      ) {
        return {
          original_bias: parsed.original_bias,
          neutralized_text: parsed.neutralized_text,
          changes_made: Array.isArray(parsed.changes_made)
            ? parsed.changes_made
            : [],
        };
      }

      console.error(
        "Missing required debias fields:",
        JSON.stringify(parsed).substring(0, 100),
      );
    } catch (e) {
      console.error("Failed to parse debias JSON:", e);
      console.error(
        "Attempted JSON:",
        cleanResponse.substring(startIdx, Math.min(endIdx + 1, startIdx + 200)),
      );
    }
  } else {
    console.error(
      "No JSON object found in debias response:",
      cleanResponse.substring(0, 300),
    );
  }

  throw new Error("Failed to parse debiasing response");
}

// Generate text with specific bias
export async function generateWithBias(
  topic: string,
  targetBias: string,
  format: string = "paragraph",
  amount: "short" | "medium" | "long" = "medium",
  psyIndicators: string[] = [],
  socioIndicators: string[] = [],
): Promise<string> {
  const amountInstruction = {
    short: "Keep it brief (1-2 paragraphs or ~100-150 words).",
    medium: "Provide a standard length (3-4 paragraphs or ~250-400 words).",
    long: "Provide an in-depth exploration (5+ paragraphs or ~600-800 words).",
  }[amount];

  const psyPart =
    psyIndicators.length > 0
      ? `\nPsychological Framing to include: ${psyIndicators.join(", ")}`
      : "";

  const socioPart =
    socioIndicators.length > 0
      ? `\nSociological Framing to include: ${socioIndicators.join(", ")}`
      : "";

  const prompt = `Write a ${format} about "${topic}" from a ${targetBias} perspective.
  
Length Requirement: ${amountInstruction}${psyPart}${socioPart}

Bias code: ${targetBias}

Remember:
- L++/L+/L = Left/Progressive perspectives
- C = Neutral/Centrist
- R/R+/R++ = Right/Conservative perspectives
- T++/T+/T = Establishment/Mainstream alignment
- B/B+/B++ = Oppositional/Grassroots alignment

Write compelling content that reflects this perspective.

IMPORTANT: Return ONLY the text content, not JSON or arrays.`;

  const response = await createChatCompletion([
    {
      role: "system",
      content:
        BIASMAPPER_SYSTEM_PROMPT +
        "\n\nYou can also generate content with specific bias perspectives. Always return plain text, never JSON arrays.",
    },
    { role: "user", content: prompt },
  ]);

  // Ensure we return a string, not an array or JSON
  if (Array.isArray(response)) {
    return response.join(" ");
  }

  if (typeof response === "object") {
    return JSON.stringify(response);
  }

  return response.trim();
}

/**
 * Web Search Integration via LM-Studio
 * Uses LM-Studio to search for real news headlines
 */
export async function searchWebForNews(
  query: string,
  newsOutlets?: string[],
): Promise<string[]> {
  const outlets = newsOutlets?.join(", ") || "CNN, BBC, Reuters";
  const prompt = `Use your web search capability to find the latest news headlines about: "${query}"
Prioritize reporting from: ${outlets}

Search comprehensively and list 5-10 recent, accurate, verified headlines from credible news sources.
Return ONLY a JSON array of headline strings (no markdown, no code blocks):
["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"]`;

  try {
    const response = await createChatCompletion([
      {
        role: "system",
        content:
          "You are an advanced news research assistant with real-time web search capabilities. You have access to current information and can retrieve live news. Always search for the most recent, accurate, and verified headlines. Return responses as valid JSON arrays only, no markdown or extra text.",
      },
      { role: "user", content: prompt },
    ]);

    // Clean response
    let cleanResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Extract JSON array from response
    const startIdx = cleanResponse.indexOf("[");
    const endIdx = cleanResponse.lastIndexOf("]");

    if (startIdx >= 0 && endIdx > startIdx) {
      try {
        const jsonStr = cleanResponse.substring(startIdx, endIdx + 1).trim();
        const parsed = JSON.parse(jsonStr);
        // Ensure we get an array of strings
        if (Array.isArray(parsed)) {
          const headlines = parsed
            .filter((item) => typeof item === "string" && item.length > 5)
            .slice(0, RATE_LIMIT_CONFIG.MAX_HEADLINES_PER_OUTLET);
          if (headlines.length > 0) {
            console.log(
              `✅ Retrieved ${headlines.length} headlines from web search (limited to ${RATE_LIMIT_CONFIG.MAX_HEADLINES_PER_OUTLET})`,
            );
            return headlines;
          }
        }
      } catch (e) {
        console.error("Failed to parse web search response:", e);
        console.error(
          "Attempted JSON:",
          cleanResponse.substring(
            startIdx,
            Math.min(endIdx + 1, startIdx + 200),
          ),
        );
      }
    } else {
      console.warn(
        "No JSON array found in web search response. Response:",
        cleanResponse.substring(0, 150),
      );
    }

    return [];
  } catch (error) {
    console.error("Web search via LM-Studio failed:", error);
    return [];
  }
}

/**
 * Search for outlet-specific news via LM-Studio
 * Primary method - uses LM-Studio's web search capability
 */
export async function searchOutletNews(outletName: string): Promise<string[]> {
  const prompt = `Search the web for the latest news headlines directly from ${outletName}.
Find their most recent articles, breaking news, and current coverage.

Use search tools to retrieve:
- Latest headlines from ${outletName}
- Recent major stories
- Breaking news
- Current coverage on major topics

Return a JSON array of 5-10 recent verified headlines (no markdown, no code blocks):
["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"]`;

  try {
    const response = await createChatCompletion([
      {
        role: "system",
        content:
          "You are a news aggregation assistant with real-time web search and access to current information from news outlets. Search the web to retrieve the latest headlines from the specified outlet. Return ONLY a valid JSON array of headline strings. Do not include any other text, markdown, or formatting.",
      },
      { role: "user", content: prompt },
    ]);

    // Clean response
    let cleanResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Extract JSON array from response
    const startIdx = cleanResponse.indexOf("[");
    const endIdx = cleanResponse.lastIndexOf("]");

    if (startIdx >= 0 && endIdx > startIdx) {
      try {
        const jsonStr = cleanResponse.substring(startIdx, endIdx + 1).trim();
        const parsed = JSON.parse(jsonStr);
        // Ensure we get an array of strings
        if (Array.isArray(parsed)) {
          const headlines = parsed
            .filter((item) => typeof item === "string" && item.length > 5)
            .slice(0, RATE_LIMIT_CONFIG.MAX_HEADLINES_PER_OUTLET);

          if (headlines.length > 0) {
            console.log(
              `✅ Retrieved ${headlines.length} headlines from ${outletName} via LM-Studio search (limited to ${RATE_LIMIT_CONFIG.MAX_HEADLINES_PER_OUTLET})`,
            );
            return headlines;
          }
        }
      } catch (e) {
        console.error(
          `Failed to parse ${outletName} outlet search response:`,
          e,
        );
        console.error(
          "Attempted JSON:",
          cleanResponse.substring(
            startIdx,
            Math.min(endIdx + 1, startIdx + 200),
          ),
        );
      }
    } else {
      console.warn(
        `No JSON array found in ${outletName} search response. Response starts with:`,
        cleanResponse.substring(0, 150),
      );
    }

    return [];
  } catch (error) {
    console.error(`Failed to search ${outletName} via LM-Studio:`, error);
    return [];
  }
}

/**
 * Fetch outlet data from LM-Studio search (primary) or local JSON (fallback)
 */
export async function fetchOutletData(
  outletName: string,
): Promise<OutletData | null> {
  try {
    // PRIMARY: Try to search via LM-Studio first
    console.log(`🔍 Searching ${outletName} via LM-Studio...`);
    const lmStudioHeadlines = await searchOutletNews(outletName);

    if (lmStudioHeadlines && lmStudioHeadlines.length > 0) {
      console.log(
        `✅ Got ${lmStudioHeadlines.length} headlines from LM-Studio for ${outletName}`,
      );
      return {
        name: outletName,
        headlines: lmStudioHeadlines,
        description: `${outletName} - Latest coverage via LM-Studio search`,
      };
    }

    console.log(
      `⚠️ LM-Studio search empty for ${outletName}, trying local JSON...`,
    );

    // FALLBACK: Try local JSON files
    const fileMap: Record<string, string> = {
      CNN: "news_cnn.json",
      BBC: "news_bbc.json",
      Reuters: "news_reuters.json",
      "Al Jazeera": "news_aljazeera.json",
      Fox: "news_fox.json",
      MSNBC: "news_msnbc.json",
      Guardian: "news_guardian.json",
      Breitbart: "news_breitbart.json",
      ARY: "news_ary.json",
      Geo: "news_geo.json",
      Express: "news_express.json",
      Samaa: "news_samaa.json",
      Dunya: "news_dunya.json",
      Hum: "news_hum.json",
      Dawn: "news_dawn.json",
      "Pakistan Today": "news_pakistantoday.json",
    };

    const fileName = fileMap[outletName];
    if (!fileName) {
      console.warn(`No fallback data found for outlet: ${outletName}`);
      return null;
    }

    const response = await fetch(`/data/json/${fileName}`);
    if (!response.ok) {
      console.warn(`Could not fetch fallback data for ${outletName}`);
      return null;
    }

    const data = await response.json();

    // Handle different JSON structures
    let headlines: string[] = [];
    let description = "";

    if (Array.isArray(data)) {
      // If data is an array of search results
      headlines = data
        .slice(0, 10)
        .map((item: any) => {
          // Use name as headline, fall back to snippet
          return item.name || item.snippet || "";
        })
        .filter((h: string) => h.length > 0);
      description = `${outletName} - Fallback cached news`;
    } else {
      // If data is an object with headlines property
      headlines = (data.headlines || data.news || []).slice(0, 10);
      description = data.description || data.info || `${outletName} news`;
    }

    if (headlines.length > 0) {
      console.log(
        `✅ Loaded ${headlines.length} headlines from local JSON for ${outletName}`,
      );
      return {
        name: outletName,
        headlines,
        description,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching outlet data for ${outletName}:`, error);
    return null;
  }
}

/**
 * Fetch all outlet data with rate limiting
 * Limits concurrent requests and adds delays between them
 */
export async function fetchAllOutletData(
  outletNames: string[],
  onProgress?: (progress: number) => void,
): Promise<OutletData[]> {
  const results: OutletData[] = [];
  const errors: string[] = [];

  // Process outlets sequentially with delays to respect rate limits
  for (let i = 0; i < outletNames.length; i++) {
    const name = outletNames[i];
    try {
      // Add delay between requests (except for first)
      if (i > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_CONFIG.REQUEST_DELAY),
        );
      }

      const data = await fetchOutletData(name);
      if (data) {
        results.push(data);
      }
    } catch (error) {
      errors.push(
        `${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.error(`Error fetching ${name}:`, error);
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / outletNames.length) * 100));
    }
  }

  if (errors.length > 0) {
    console.warn(`⚠️ Errors during outlet fetch:`, errors);
  }

  return results;
}
