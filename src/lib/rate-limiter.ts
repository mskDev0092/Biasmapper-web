/**
 * Rate Limiting Utility
 * Manages API request throttling to prevent overwhelming external services
 */

// Configuration constants
export const RATE_LIMIT_CONFIG = {
  // Delay between individual outlet requests (ms)
  REQUEST_DELAY: 1000, // 1 second between requests

  // Maximum concurrent requests
  MAX_CONCURRENT: 3, // Only 3 parallel requests at a time

  // Minimum auto-refresh interval (seconds)
  MIN_AUTO_REFRESH: 300, // 5 minutes minimum

  // Maximum headlines per outlet to limit data size
  MAX_HEADLINES_PER_OUTLET: 5,

  // Maximum total outlets to analyze per refresh
  MAX_OUTLETS_PER_REFRESH: 5, // Rotate through outlets instead of all at once

  // Request timeout (ms)
  REQUEST_TIMEOUT: 30000, // 30 seconds

  // Cooldown after error (ms)
  ERROR_COOLDOWN: 5000, // 5 seconds before retry
};

/**
 * Queue for managing sequential API requests with delays
 */
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentCount = 0;

  async add<T>(
    fn: () => Promise<T>,
    delayMs: number = RATE_LIMIT_CONFIG.REQUEST_DELAY,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        this.concurrentCount++;

        // Wait for concurrent slot to be available
        while (this.concurrentCount > RATE_LIMIT_CONFIG.MAX_CONCURRENT) {
          await new Promise((r) => setTimeout(r, 100));
        }

        try {
          // Add delay between requests
          if (this.queue.length > 1) {
            await new Promise((r) => setTimeout(r, delayMs));
          }

          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.concurrentCount--;
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        try {
          await fn();
        } catch (error) {
          console.error("Queue processing error:", error);
        }
      }
    }
    this.processing = false;
  }

  clear() {
    this.queue = [];
    this.concurrentCount = 0;
  }
}

// Global request queue instance
export const requestQueue = new RequestQueue();

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Wait with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = RATE_LIMIT_CONFIG.REQUEST_TIMEOUT,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}

/**
 * Rotate through outlets to avoid fetching all at once
 * This distributes load over multiple refresh cycles
 */
export function rotateOutlets(
  allOutlets: string[],
  refreshCount: number,
  outletPerRefresh: number = RATE_LIMIT_CONFIG.MAX_OUTLETS_PER_REFRESH,
): string[] {
  const startIdx = (refreshCount * outletPerRefresh) % allOutlets.length;
  const rotated = [
    ...allOutlets.slice(startIdx),
    ...allOutlets.slice(0, startIdx),
  ];
  return rotated.slice(0, outletPerRefresh);
}

/**
 * Limit array size for content
 */
export function limitArraySize<T>(arr: T[], maxSize: number): T[] {
  return arr.slice(0, maxSize);
}

/**
 * Calculate backoff delay for retries
 */
export function getBackoffDelay(
  attemptNumber: number,
  baseMs: number = 1000,
): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc., capped at 30s
  const delay = baseMs * Math.pow(2, attemptNumber);
  return Math.min(delay, 30000);
}
