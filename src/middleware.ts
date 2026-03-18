import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security middleware for adding security headers
 * Protects against common web vulnerabilities
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection in older browsers
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy - limit referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - restrict browser features
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );

  // Content Security Policy - prevent XSS and injection attacks
  // This is strict to prevent API credentials from being exfiltrated
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires this
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: "/:path*",
};
