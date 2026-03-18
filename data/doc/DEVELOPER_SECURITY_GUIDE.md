# Developer Security Reference Guide

## Quick Start for Security Features

### Understanding the Security Architecture

#### Three-Layer Security Model

```
Layer 1: Browser    → Encrypt API key before storage
Layer 2: Network    → Send encrypted to /api/proxy via HTTPS
Layer 3: Server     → Proxy validates, calls API, returns result
```

---

## Using the Encryption Utilities

### Encrypt Sensitive Data

```typescript
import { encryptSensitiveData } from "@/lib/encryption-utils";

const apiKey = "sk-your-actual-key-here";
const encrypted = encryptSensitiveData(apiKey);
localStorage.setItem("my_key", encrypted);
```

### Decrypt Sensitive Data

```typescript
import { decryptSensitiveData } from "@/lib/encryption-utils";

const encrypted = localStorage.getItem("my_key");
const apiKey = decryptSensitiveData(encrypted);
```

### Mask API Keys for Display

```typescript
import { maskAPIKey } from "@/lib/encryption-utils";

const apiKey = "sk-1234567890abcdef123456";
const display = maskAPIKey(apiKey);
// Result: sk-12345678••••••••••••••...
```

---

## API Config Management

### Getting Current Configuration

```typescript
import { getAPIConfig } from "@/lib/api-config";

const config = getAPIConfig();
console.log(config.endpoint); // Available immediately
console.log(config.apiKey); // Decrypted from storage
console.log(config.model); // Current model
```

### Saving Configuration

```typescript
import { saveAPIConfig } from "@/lib/api-config";

saveAPIConfig({
  endpoint: "https://api.openai.com/v1",
  apiKey: "sk-actual-key",
  model: "gpt-4o",
  temperature: 0.7,
});
// API key is automatically encrypted before storage
```

### Checking if Configured

```typescript
import { isAPIConfigured } from "@/lib/api-config";

if (isAPIConfigured()) {
  console.log("API is ready to use");
} else {
  console.log("User must configure API first");
}
```

### Clearing Configuration

```typescript
import { clearAPIConfig } from "@/lib/api-config";

clearAPIConfig(); // Removes both config and encrypted key
```

---

## Using the API Service

### Making Secure API Calls

```typescript
import { createChatCompletion, ChatMessage } from "@/lib/api-service";

const messages: ChatMessage[] = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello!" },
];

try {
  const response = await createChatCompletion(messages);
  // Response comes from /api/proxy (never directly from external API)
  console.log(response);
} catch (error) {
  console.error("API call failed:", error.message);
}
```

### With Custom Configuration

```typescript
import { createChatCompletion } from "@/lib/api-service";

const response = await createChatCompletion(messages, {
  endpoint: "https://custom-api.example.com/v1",
  apiKey: "custom-key",
  model: "custom-model",
  temperature: 0.5,
  maxTokens: 1000,
});
```

**Important**: The function automatically calls `/api/proxy`, so your custom `apiKey` is never exposed to the external API from the browser.

---

## Server-Side API Proxy

### How It Works

1. Browser sends: `POST /api/proxy` with `{ endpoint, apiKey, model, messages }`
2. Server validates all inputs
3. Server makes request to external API (keeping apiKey on server)
4. Server returns result to browser

### Request Format

```typescript
POST /api/proxy
Content-Type: application/json

{
  "endpoint": "https://api.openai.com/v1",
  "apiKey": "sk-...",  // Sent to server only
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### Response Format

```json
{
  "choices": [
    {
      "message": {
        "content": "Response content",
        "role": "assistant"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Error Responses

```json
// 429 - Rate Limited
{ "error": "Too many requests. Please try again later." }

// 400 - Invalid Input
{ "error": "Missing required fields: endpoint, apiKey, model, messages" }

// 400 - Invalid API Key
{ "error": "Invalid API key format" }

// 429 - Timeout
{ "error": "An error occurred while processing your request" }
```

---

## Security Best Practices for Development

### ✅ DO

```typescript
// ✅ Use encryption utilities for sensitive data
const encrypted = encryptSensitiveData(apiKey);

// ✅ Get config through proper function
const config = getAPIConfig();

// ✅ Use the API service (goes through proxy)
const response = await createChatCompletion(messages);

// ✅ Let the proxy handle external API calls
// (don't fetch directly to external APIs)

// ✅ Validate inputs on server-side
if (!validateAPIKey(key)) return error;

// ✅ Sanitize error messages before sending to client
if (!response.ok) {
  return { error: "API request failed" }; // Generic message
}
```

### ❌ DON'T

```typescript
// ❌ Don't store API keys in plain text
localStorage.setItem("apiKey", apiKey); // WRONG!

// ❌ Don't call external APIs directly from browser
const res = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { Authorization: `Bearer ${apiKey}` }, // WRONG!
});

// ❌ Don't log sensitive data
console.log("API Key:", apiKey); // WRONG!
console.log("Config:", config); // If config includes apiKey, WRONG!

// ❌ Don't expose full error details
throw new Error(`API failed: ${fullErrorResponse}`); // WRONG!

// ❌ Don't trust client-side validation alone
if (userInput.length > 0) {
  /*...*/
} // Also validate on server!

// ❌ Don't accept arbitrary endpoints
fetch(userProvidedEndpoint); // Always validate on server!
```

---

## Testing Security Features

### Test Encryption

```bash
# In browser console:
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/encryption-utils'

const original = 'sk-test-key-12345'
const encrypted = encryptSensitiveData(original)
const decrypted = decryptSensitiveData(encrypted)

console.assert(original === decrypted, 'Encryption failed!')
```

### Test API Proxy

```bash
# Using curl:
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.openai.com/v1",
    "apiKey": "sk-test",
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

### Test Rate Limiting

```javascript
// Send 31+ requests in 1 minute to test rate limit
for (let i = 0; i < 35; i++) {
  fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: "https://api.openai.com/v1",
      apiKey: "test",
      model: "test",
      messages: [{ role: "user", content: "test" }],
    }),
  }).then((r) => console.log(`Request ${i}: ${r.status}`));
}
```

### Test Security Headers

```bash
curl -I https://localhost:3000
# Look for these headers:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
```

---

## Common Issues & Solutions

### Issue: "Decryption failed"

**Cause**: Browser fingerprint changed (e.g., screen resize, timezone change)
**Solution**: User needs to re-enter API key in Settings

### Issue: Rate limit (429) error

**Cause**: More than 30 requests in 60 seconds
**Solution**: Wait 1 minute, then retry. Or adjust limits in src/app/api/proxy/route.ts

### Issue: "Invalid endpoint URL"

**Cause**: Endpoint doesn't start with http:// or https://, or is localhost in production
**Solution**:

- Ensure endpoint starts with http:// or https://
- Use full URL (e.g., https://api.openai.com/v1, not just api.openai.com)
- For localhost/Ollama, only works in development (NODE_ENV=development)

### Issue: API key showing in browser console

**Cause**: Developer logged config object that includes apiKey
**Solution**: Use `maskAPIKey()` for display, never log just the key

---

## Environment Variables

### Development

```env
NODE_ENV=development
# Allows localhost endpoints (for testing Ollama, etc.)
# Enables security checks for potential data leaks
```

### Production

```env
NODE_ENV=production
# Blocks localhost/internal network endpoints
# Disables verbose security logging
```

---

## Updating the System

### Adding a New API Provider

1. Add to `PREDEFINED_ENDPOINTS` in [src/lib/api-config.ts](src/lib/api-config.ts):

```typescript
export const PREDEFINED_ENDPOINTS = [
  // ... existing providers ...
  {
    name: "YourAPI",
    endpoint: "https://api.yourservice.com/v1",
    models: ["model1", "model2", "model3"],
  },
];
```

2. No changes needed to API proxy (validates all endpoints)
3. Settings page automatically includes new provider in dropdown

### Adjusting Rate Limits

Edit [src/app/api/proxy/route.ts](src/app/api/proxy/route.ts):

```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // requests per window
```

### Adding Additional Validation

Edit [src/app/api/proxy/route.ts](src/app/api/proxy/route.ts) in the POST handler:

```typescript
// Add your custom validation here
if (!myCustomCheck(body.model)) {
  return NextResponse.json(
    { error: "Invalid model for custom check" },
    { status: 400 },
  );
}
```

---

## Documentation References

- [SECURITY.md](../SECURITY.md) - Comprehensive security guide
- [SECURITY_IMPLEMENTATION.md](../SECURITY_IMPLEMENTATION.md) - Implementation details
- [.env.example](../.env.example) - Environment configuration
- [src/middleware.ts](../src/middleware.ts) - Security headers
- [src/app/api/proxy/route.ts](../src/app/api/proxy/route.ts) - API proxy with validation

---

## Support & Questions

For security-related questions:

1. Check [SECURITY.md](../SECURITY.md) first
2. Review this guide for specific functionality
3. Check the implementation files (they have detailed comments)
4. See [src/app/settings/page.tsx](../src/app/settings/page.tsx) for UI examples

---

**Last Updated**: March 2026  
**Version**: 1.0.0
