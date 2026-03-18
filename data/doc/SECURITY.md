# Security Documentation

> **IMPORTANT**: This application includes multiple layers of security to protect your API credentials and sensitive data.

## ⚠️ Critical Security Architecture

### API Key Handling (Three-Layer Protection)

Your API keys are protected by a three-layer security architecture:

#### Layer 1: Browser-Side Encryption

- API keys are **encrypted** before being stored in browser localStorage
- Encryption uses a unique key derived from your device fingerprint
- This provides protection against casual local attacks and XSS vulnerabilities
- **Note**: This is obfuscation, not cryptographically strong encryption

#### Layer 2: Server-Side Proxy

- **All API calls go through `/api/proxy` on the server** — never directly to external APIs
- Your API credentials stay on the server and are never exposed to the browser's network layer
- This is the **primary security mechanism**
- External APIs never directly contact your credentials from the client

#### Layer 3: Request Validation & Rate Limiting

- All requests are **validated** server-side before proxying
- Strict input validation prevents injection attacks
- **Rate limiting** (30 requests/minute per IP) prevents abuse
- Harmful request patterns are blocked

### Key Points

✅ **What's Secure:**

- API keys are encrypted + never sent directly from browser to external APIs
- Server proxy validates all inputs before forwarding
- No sensitive data in browser network layer
- Rate limiting prevents credential stuffing attacks
- CORS and CSP headers prevent unauthorized access

❌ **What's NOT Secure:**

- If your computer is compromised, browser storage can be accessed
- If the server is compromised, API keys can be extracted
- localStorage persists across browser sessions (feature, not a bug)
- If someone gains physical access to your device, they can access stored keys

---

## Sensitive Data Handling

### API Keys

- **Storage**: Encrypted in localStorage (device-specific encryption)
- **Transport**: Only sent to `/api/proxy` endpoint via HTTPS
- **External APIs**: Only accessed by the server, never from the browser
- **Logging**: Never logged or exposed in error messages
- **Clearing**: Use "Clear" button in Settings to securely remove

### API Endpoints

- Validated to prevent SSRF attacks
- In production, internal network IPs are rejected (e.g., localhost, 192.168, 10.x)
- In development, local endpoints (Ollama at localhost) are allowed
- Maximum length enforced to prevent buffer overflow attacks

### Request Messages

- Validated for size (max 100,000 characters)
- JSON structure validated before proxying
- No direct access to external APIs

---

## Server-Side API Proxy (`/api/proxy`)

The proxy endpoint at `/api/proxy` handles all external API calls with these protections:

### Request Validation

```typescript
✓ Content-Type must be application/json
✓ All required fields present (endpoint, apiKey, model, messages)
✓ API key format validation
✓ Endpoint URL validation (protocol, domain, SSRF checks)
✓ Model name validation (alphanumeric + . _ -)
✓ Message array validation (non-empty, proper structure)
```

### Rate Limiting

- **30 requests per minute** per IP address
- Returns 429 (Too Many Requests) when exceeded
- Helps prevent abuse and credential stuffing

### Error Handling

- Errors are sanitized before being sent to client
- Sensitive information is never exposed
- Generic messages are returned for security failures

### Request Timeout

- 30-second timeout per request
- Prevents hanging connections
- Automatically aborts long-running requests

---

## Security Headers

These headers are automatically added by the middleware:

```
X-Frame-Options: SAMEORIGIN              # Prevents clickjacking
X-Content-Type-Options: nosniff           # Prevents MIME sniffing
X-XSS-Protection: 1; mode=block          # XSS protection
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: (all features disabled)
Content-Security-Policy: strict with dangerous-host restrictions
```

---

## Environment Variables

### Development (Optional)

```env
# NODE_ENV controls some security features:
NODE_ENV=development  # Enables development-only security checks
NODE_ENV=production   # Stricter security, blocks localhost endpoints
```

### Production Deployment

For production, ensure:

1. **HTTPS Only**
   - All traffic must use HTTPS/TLS
   - Set secure cookies: `Secure; HttpOnly; SameSite=Strict`

2. **Environment Variables**
   - Never commit `.env.local` files
   - API keys should come from environment, never hardcoded
   - Example:
     ```bash
     # Set on server, not in code
     export API_KEY="sk-actual-key-here"
     ```

3. **CORS Configuration**
   - Restrict origins to your domain only
   - Prevent cross-origin requests from untrusted sites

4. **API Rate Limiting**
   - Consider using a reverse proxy (nginx, Cloudflare) for rate limiting
   - Add DDoS protection (Cloudflare, AWS WAF)

---

## Best Practices

### For Users

1. ✅ Use the app over HTTPS only (never HTTP)
2. ✅ Click "Clear" in Settings if lending your computer to someone
3. ✅ Use strong, unique API keys from your provider
4. ✅ Regularly rotate API keys in your provider's dashboard
5. ✅ Don't share your "Saved as" key display with anyone
6. ❌ Don't use production API keys for testing
7. ❌ Don't screenshot the API key field (even partially)

### For Developers

1. ✅ Never log API keys or sensitive data
2. ✅ Always validate input on server-side
3. ✅ Use HTTPS in production
4. ✅ Keep dependencies updated for security patches
5. ✅ Run security audits regularly: `npm audit`
6. ✅ Use `.gitignore` to exclude `.env` files
7. ❌ Don't expose error stack traces to users
8. ❌ Don't commit `.env` or credential files

---

## Encryption Details

### Browser-Side Encryption (Obfuscation Layer)

- **Algorithm**: XOR cipher with Base64 encoding
- **Key**: Browser fingerprint (user-agent, screen size, timezone, language)
- **Purpose**: Defense-in-depth against casual attacks and XSS
- **Not for**: Cryptographically strong encryption (use TLS for that)

### True Security

- **TLS/HTTPS**: All data in transit is encrypted with TLS
- **Server Proxy**: Keeps credentials out of browser network exposure
- **Input Validation**: Prevents injection and abuse

---

## Incident Response

### If You Suspect Compromise

1. **Immediately clear settings**: Use the "Clear" button in Settings
2. **Rotate your API keys**: Go to your provider (OpenAI, Together AI, etc.) and generate new keys
3. **Review provider logs**: Check if the key was used maliciously
4. **Update application**: Ensure you're running the latest security patches

### Reporting Security Issues

If you find a security vulnerability:

1. Do NOT create a public GitHub issue
2. Document the issue privately
3. Report to maintainers with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

---

## Compliance & Standards

This application implements security controls based on:

- **OWASP Top 10**: Protection against common web vulnerabilities
- **CWE/SANS Top 25**: Common weakness enumeration mitigation
- **NIST Guidelines**: Cryptography and key management
- **Best practices** from security-focused frameworks

---

## Related Files

- [src/middleware.ts](src/middleware.ts) - Security headers middleware
- [src/app/api/proxy/route.ts](src/app/api/proxy/route.ts) - Server proxy with validation
- [src/lib/encryption-utils.ts](src/lib/encryption-utils.ts) - Encryption utilities
- [src/lib/api-config.ts](src/lib/api-config.ts) - Secure config storage
- [src/lib/api-service.ts](src/lib/api-service.ts) - Uses proxy instead of direct API calls

---

**Last Updated**: March 2026
**Version**: 1.0.0
