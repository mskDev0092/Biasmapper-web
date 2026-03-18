/**
 * Analyze Data Storage Utility
 * Manages persistence of analysis data in browser localStorage
 */

export interface StoredAnalysisData {
  international: any[];
  pakistan: any[];
  narratives: any;
  lastUpdated: number;
  timestamp: string;
}

const STORAGE_KEY = "biasmapper_analysis_data";

/**
 * Save analysis data to localStorage
 */
export function saveAnalysisData(data: {
  international: any[];
  pakistan: any[];
  narratives: any;
}): void {
  if (typeof window === "undefined") return;

  try {
    const storageData: StoredAnalysisData = {
      international: data.international,
      pakistan: data.pakistan,
      narratives: data.narratives,
      lastUpdated: Date.now(),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    console.log("✅ Analysis data saved to localStorage");
  } catch (error) {
    console.error("Failed to save analysis data:", error);
  }
}

/**
 * Load analysis data from localStorage
 */
export function loadAnalysisData(): StoredAnalysisData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      console.log(
        "✅ Loaded analysis data from localStorage (last updated:",
        new Date(data.lastUpdated).toLocaleTimeString(),
        ")",
      );
      return data;
    }
  } catch (error) {
    console.error("Failed to load analysis data:", error);
  }

  return null;
}

/**
 * Clear analysis data from localStorage
 */
export function clearAnalysisData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("✅ Analysis data cleared from localStorage");
  } catch (error) {
    console.error("Failed to clear analysis data:", error);
  }
}

/**
 * Get last update time
 */
export function getLastUpdateTime(): Date | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Date(data.lastUpdated);
    }
  } catch (error) {
    console.error("Failed to get last update time:", error);
  }

  return null;
}

/**
 * Format time since last update
 */
export function getTimeSinceUpdate(): string {
  const lastUpdate = getLastUpdateTime();
  if (!lastUpdate) return "Never";

  const now = Date.now();
  const diffMs = now - lastUpdate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  if (diffMins === 0) {
    return `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ${diffSecs}s ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  }
}
