# Security Architecture - Static Export

## 🏗️ Build Configuration

This application uses **static export** (`output: "export"`):

- ✅ No middleware
- ✅ No server-side code
- ✅ No dynamic routes
- ✅ Pre-built static files only

This deployment model requires **client-side security only**.

---

## 🔐 Security Strategy: Local Encryption

Since this is a static export, API keys cannot be protected by a server proxy. Instead, security is achieved through **local encryption**:

### How It Works

```
1. User enters API key in Settings
   ↓
2. Key encrypted with device fingerprint (XOR + Base64)
   ↓
3. Encrypted key stored in localStorage
   ↓
4. When making API call:
   - Key decrypted from localStorage
   - Sent to external API (exposed in this request only)
   - Key remains encrypted in storage
```

### What's Secure ✅

| Layer          | Protection                                         |
| -------------- | -------------------------------------------------- |
| **At Rest**    | Encrypted in localStorage (device-specific key)    |
| **In Memory**  | Only decrypted when actively making API calls      |
| **Recovery**   | Encryption key tied to device (can't be extracted) |
| **Accidental** | Casual access to browser storage won't reveal key  |

### What's NOT Secure ⚠️

| Issue                | Impact                                           |
| -------------------- | ------------------------------------------------ |
| API calls expose key | External API sees credentials in transit         |
| Browser DevTools     | F12 shows Authorization header during requests   |
| XSS vulnerabilities  | Malicious scripts can steal decrypted key        |
| Network sniffing     | HTTPS required to protect credentials in transit |

---

## 🎯 Appropriate Use Cases

✅ **GOOD USE**:

- Personal analytics tools
- Local development/testing
- Organizations analyzing their own content
- Low-sensitivity data analysis
- Learning/education

❌ **NOT RECOMMENDED**:

- Production commercial applications
- Sensitive enterprise data
- Large-scale deployments
- Public/untrusted environments

---

## 🛡️ Security Best Practices

### For Users

1. **Use HTTPS Only** 🔒
   - Never access over HTTP
   - API keys visible in network traffic on HTTP
   - Always use `https://your-domain.com`

2. **Rotate Keys Regularly**
   - Generate new API keys in your provider's dashboard
   - Update in BiasMapper settings
   - Delete old keys

3. **Environment Matters**
   - In trusted networks: Generally safe
   - In public WiFi: Risk of interception
   - On shared computers: Others can access LocalStorage

4. **Browser Security**
   - Keep browser updated
   - Use reputable plugins only
   - Clear browser data when lending device

5. **Monitor Usage**
   - Check API provider logs for unusual activity
   - Watch for unexpected charges from API calls
   - Set rate limits/alerts on API provider

### For Developers

1. **Never expose keys in code**

   ```javascript
   // ❌ WRONG
   const apiKey = "sk-1234567890abcdef";

   // ✅ RIGHT
   const apiKey = getAPIConfig().apiKey; // From encrypted storage
   ```

2. **Always use HTTPS in production**

   ```bash
   # ❌ Never deployed over HTTP
   http://your-site.com  # WRONG!

   # ✅ Always HTTPS
   https://your-site.com  # Correct
   ```

3. **Clear keys from memory when not needed**
   - Decryption happens only during API calls
   - Keys not kept in variables longer than necessary
   - This is handled automatically by encryption utils

4. **Test with test/limited keys**
   - Don't test with production API keys
   - Use provider's sandbox/test keys if available
   - Set API limits in provider dashboard

---

## 🔎 Encryption Details

### Browser-Side Encryption Implementation

**File**: [src/lib/encryption-utils.ts](src/lib/encryption-utils.ts)

**Algorithm**: XOR Cipher + Base64

- **Why**: Browser-native (no dependencies), sufficient for obfuscation
- **Key**: Derived from device fingerprint (user-agent, screen size, timezone)
- **Strength**: Defense-in-depth, not cryptographically strong
- **True Security**: Comes from HTTPS + local storage isolation

**How it works**:

1. Extract browser fingerprint
2. Generate consistent hash (encryption key)
3. XOR encrypt the API key
4. Base64 encode for storage
5. Reverse process for decryption

**Device Fingerprint Components**:

- User-Agent (browser type)
- Screen resolution
- Timezone
- Language settings

_Important_: Changing any of these makes the encrypted key unrecoverable (can't decrypt). This is by design - more privacy, but user must re-enter key if device settings change.

---

## 📊 Security Comparison

| Feature             | Static Export (This App) | Server Proxy           |
| ------------------- | ------------------------ | ---------------------- |
| Encryption at rest  | ✅ Yes (device-specific) | ✅ Yes (server)        |
| Direct API exposure | ⚠️ Yes (from browser)    | ✅ No (server only)    |
| Rate limiting       | ❌ No                    | ✅ Yes                 |
| Input validation    | ❌ No                    | ✅ Yes                 |
| Error sanitization  | ❌ No                    | ✅ Yes                 |
| Ease of deployment  | ✅ Yes (static host)     | ❌ No (needs server)   |
| Scalability         | ✅ Excellent             | ✅ Good                |
| Cost                | ✅ Cheaper               | ⚠️ More (needs server) |

**Recommendation**: For production/commercial use, deploy with server proxy instead.

---

## 🚀 Deployment

### Static Hosting Options

Since this is a static export, any static host works:

**Best Options**:

- Vercel (optimized for Next.js)
- Netlify
- GitHub Pages
- Any CDN (CloudFlare, AWS S3, etc.)
- Self-hosted web server (Nginx, Apache)

**Important**: Must use HTTPS everywhere

### Deployment Steps

```bash
# 1. Build static export
npm run build

# 2. Output is in: out/

# 3. Deploy from "out" folder to your host:
# - Vercel: Connect GitHub repo, auto-deploys
# - Netlify: Drag-drop "out" folder or connect Git
# - GitHub Pages: Push "out" folder to gh-pages branch
# - Self-hosted: Copy "out" contents to web server root

# 4. Verify HTTPS is enabled

# 5. Test app loads correctly
```

---

## ⚠️ Security Warnings

### HTTPS is CRITICAL

```bash
# ❌ NOT SECURE (HTTP)
http://your-site.com/settings
# API keys visible in network traffic
# Anyone on WiFi can see them

# ✅ SECURE (HTTPS)
https://your-site.com/settings
# API keys encrypted in transit
# Network sniffing won't reveal them
```

### XSS Risk

Since keys are exposed in the browser context:

- Malicious scripts can steal keys
- Keep browser extensions minimal
- Use security-focused browsers
- Keep browser updated

### Shared Devices Risk

```javascript
// On shared computer:
// - Other users can access localStorage
// - Browser history shows API calls
// - Cache contains API responses

// Solution: Click "Clear" in Settings when done
// Or use private browsing (doesn't persist localStorage)
```

---

## 🔄 Key Rotation Procedure

If you suspect compromise:

1. **Immediate**: Click "Clear" in Settings page
2. **Within 1 hour**:
   - Go to your API provider (OpenAI, Groq, etc.)
   - Generate new API key
   - Delete old key
3. **Check logs**:
   - Review provider's API usage logs
   - Look for suspicious requests
   - Check for unexpected charges
4. **Update**: Use new key in BiasMapper Settings

---

## 📋 Security Checklist

Before deploying to production:

- [ ] Using HTTPS everywhere (CRITICAL!)
- [ ] API keys are not in version control
- [ ] .env files are in .gitignore
- [ ] Testing with test/limited API keys
- [ ] API rate limits set in provider dashboard
- [ ] Monitoring alerts configured for unusual usage
- [ ] Browser is up to date
- [ ] Only necessary extensions installed
- [ ] Users understand security model
- [ ] Plan for key rotation exists

---

## ❓ FAQ

**Q: Why is my API key visible in DevTools?**
A: This is a static export. Keys are decrypted in the browser to make API calls. Use trusted networks only.

**Q: Is this safe for production?**
A: Not for sensitive data. This is best for personal/low-sensitivity use. For production, use server-side proxy deployment.

**Q: Why not just hide the key?**
A: Static export can't have server-side code. Browser must have the key to make API calls.

**Q: What if I use this at scale?**
A: Not recommended. Deploy with Node.js + server proxy instead for better security.

**Q: Can someone on my WiFi see my key?**
A: No, if using HTTPS. HTTP would expose it. Always use HTTPS.

**Q: What if I close browser, is key still safe?**
A: Yes, encrypted in localStorage. Only decrypted when you make API calls.

**Q: Can I extract the encryption key?**
A: No, it's derived from your device fingerprint. Can't be extracted or transferred.

**Q: What if my device is stolen?**
A: Thief could access localStorage, including encrypted keys. Risk is _lower_ than plaintext, but not zero.

---

## 📚 Files

| File                                                       | Purpose                         |
| ---------------------------------------------------------- | ------------------------------- |
| [src/lib/encryption-utils.ts](src/lib/encryption-utils.ts) | Encryption/decryption utilities |
| [src/lib/api-config.ts](src/lib/api-config.ts)             | Config storage with encryption  |
| [src/lib/api-service.ts](src/lib/api-service.ts)           | API calls to external endpoints |
| [src/app/settings/page.tsx](src/app/settings/page.tsx)     | Settings UI with key management |
| [next.config.ts](next.config.ts)                           | Static export configuration     |

---

## 🎯 Summary

**Security Model**: ✅ Local Encryption + Device Fingerprint

**Secure For**: Personal analytics, learning, low-sensitivity data

**Not Secure For**: Production, enterprise, sensitive data

**Key Protection**: Encrypted at rest, decrypted on-demand

**Requirements**: HTTPS deployment, browser security, user awareness

---

**Last Updated**: March 2026  
**Status**: Static export with local encryption  
**Recommended Use**: Personal/educational use only
