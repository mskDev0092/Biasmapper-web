/**
 * Encryption utility for sensitive data stored in browser
 *
 * IMPORTANT SECURITY NOTES:
 * - This provides obfuscation, NOT strong encryption
 * - Browser-side encryption provides defense-in-depth against casual attacks
 * - TRUE SECURITY comes from the server-side API proxy that never exposes keys to the client
 * - API keys are NEVER sent directly to external APIs from the browser
 * - For maximum security, consider not storing API keys in browser at all
 *
 * The password is generated from browser fingerprint data and cannot be recovered
 */

/**
 * Generate a pseudo-random key based on browser fingerprint
 * This ensures the encryption key is unique per browser/device
 */
function getEncryptionKey(): string {
  const navigator_info = navigator.userAgent;
  const screen_res = `${window.innerWidth}x${window.innerHeight}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.languages?.join(",") || navigator.language;

  // Create a fingerprint-based seed
  const fingerprint = `${navigator_info}|${screen_res}|${timezone}|${language}`;

  // Simple hash function to create a consistent key
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Simple XOR encryption for browser storage
 * This is NOT cryptographically secure but provides basic obfuscation
 */
function xorEncrypt(text: string, key: string): string {
  let encrypted = "";
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return encrypted;
}

/**
 * XOR decryption (symmetric operation)
 */
function xorDecrypt(encrypted: string, key: string): string {
  return xorEncrypt(encrypted, key); // XOR is symmetric
}

/**
 * Encrypt sensitive data for browser storage
 * @param data The sensitive data to encrypt (e.g., API key)
 * @returns Base64-encoded encrypted data
 */
export function encryptSensitiveData(data: string): string {
  try {
    const key = getEncryptionKey();
    const encrypted = xorEncrypt(data, key);
    // Encode to Base64 using browser API
    return btoa(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return ""; // Return empty string on error, don't store unencrypted data
  }
}

/**
 * Decrypt sensitive data from browser storage
 * @param encryptedData Base64-encoded encrypted data
 * @returns Decrypted original data
 */
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    // Decode from Base64 using browser API
    const encrypted = atob(encryptedData);
    return xorDecrypt(encrypted, key);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Safely mask API key for display purposes
 * Example: sk-1234567890abcdef... -> sk-•••••••••••••••...
 */
export function maskAPIKey(apiKey: string, visibleChars: number = 8): string {
  if (!apiKey || apiKey.length <= visibleChars) {
    return "•".repeat(Math.max(0, apiKey.length));
  }

  const start = apiKey.substring(0, visibleChars);
  const masked = "•".repeat(Math.max(0, apiKey.length - visibleChars - 3));
  return `${start}${masked}...`;
}

/**
 * Validate that sensitive data is not accidentally logged
 * Use in development to catch accidental exposure
 */
export function validateNoSensitiveDataInLogs(value: unknown): void {
  if (process.env.NODE_ENV === "development") {
    const str = JSON.stringify(value);
    // Check for common API key patterns
    if (
      str.match(/sk-[\w-]{20,}/) || // OpenAI
      str.match(/api[_-]?key[\w\-="':?\[\]{}.,]*(?:sk-|gsk-|[\w]{20,})/i) || // Generic API key
      str.match(
        /authorization[\\w\-="':?\[\]{}.,]*(?:Bearer\s+|sk-|[\w]{20,})/i,
      ) // Auth header
    ) {
      console.warn("⚠️ WARNING: Potential sensitive data detected in logs!");
    }
  }
}
