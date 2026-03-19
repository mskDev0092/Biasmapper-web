# BiasMapper LLM Integration Patterns

This document defines the input prompts and required JSON response formats for all LLM-powered features in BiasMapper.

## 1. Core System Prompt
Used as the `system` role message for all bias-related analysis tasks.

```text
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
1. Primary bias classification (CODE)
2. Secondary bias classification (CODE)
3. Confidence level (0.0-1.0)
4. Detection of Cognitive Biases & Logical Fallacies
5. Extraction of Premises and Conclusions
6. Brief analysis explaining the classification
7. Key themes and Narrative tone description

Always respond in valid JSON format.
```

---

## 2. Feature: Bias Analysis
Fired when a user clicks "Analyze" on an article or provides custom text.

### Input Prompt (User Role)
```text
Analyze the following content for bias:

TEXT TO ANALYZE:
"""
{{input_text}}
"""

Return ONLY valid JSON (MUST be object, not array). Do not include any markdown, code blocks, or text before/after JSON.
```

### Required JSON Response
```json
{
  "dominant_bias": "CODE",
  "secondary_bias": "CODE",
  "confidence": 0.95,
  "analysis": "Explanation of the detected bias...",
  "key_themes": ["theme1", "theme2"],
  "narrative_tone": "The tone is...",
  "cognitive_biases": [
    { "name": "Confirmation Bias", "description": "...", "severity": "medium" }
  ],
  "logical_fallacies": [
    { "name": "Ad Hominem", "description": "...", "severity": "low" }
  ],
  "premises": ["Premise A", "Premise B"],
  "conclusions": ["Resulting Conclusion"]
}
```

---

## 3. Feature: Narrative Extraction
Fired when analyzing multiple outlets to find trending narrative threads.

### Input Prompt (User Role)
```text
Based on the following media bias analysis results, identify major narratives:

{{outlet_name_1}}: {{bias_code_1}}
{{outlet_name_2}}: {{bias_code_2}}
...

Return ONLY a JSON object with this structure:
```

### Required JSON Response
```json
{
  "narratives": [
    {
      "title": "Narrative Title",
      "description": "How this story is being framed",
      "promoted_by": "CODE",
      "opposed_by": "CODE",
      "intensity": "high"
    }
  ],
  "trending_topics": ["topic1", "topic2"],
  "bias_tensions": "Description of the ideological conflict detected"
}
```

---

## 4. Feature: Text Debiasing (Neutralization)
Rewrites biased text into a neutral, factual version.

### Input Prompt (User Role)
```text
Analyze and neutralize the bias in this text:

"""
{{biased_text}}
"""

Return ONLY valid JSON:
```

### Required JSON Response
```json
{
  "original_bias": "CODE",
  "neutralized_text": "The neutral version of the text...",
  "changes_made": [
    "Removed loaded adjective 'X'",
    "Reframed target as Y instead of Z"
  ]
}
```

---

## 5. Feature: Biased Generation
Generates content from a specific ideological perspective.

### Input Prompt (User Role)
```text
Write a {{format}} about "{{topic}}" from a {{targetBias}} perspective.

Bias code: {{targetBias}} (e.g. L++, R+, B)

IMPORTANT: Return ONLY the text content, not JSON or arrays.
```

### Required Response
`Plain text content without formatting or JSON.`

---

## 6. Feature: Web & Outlet News Search
Uses LLM web-search capability to find live headlines.

### Input Prompt (User Role)
```text
Search the web for the latest news headlines from {{outletName}}.
Find their most recent articles and breaking news.

Return a JSON array of 5-10 verified headlines:
```

### Required JSON Response
```json
[
  "Headline 1",
  "Headline 2",
  "Headline 3"
]
```
