/**
 * LocalDB - A localStorage-based data persistence layer
 *
 * Designed to mirror a real database schema so migration to
 * Prisma/PostgreSQL/SQLite is straightforward.
 *
 * Tables:
 *   - news_articles: Raw fetched news articles
 *   - analysis_results: LLM bias analysis output per article
 *   - narratives: Detected narrative threads
 *   - outlet_profiles: Outlet metadata & aggregate bias
 *   - app_settings: User preferences / API keys state
 *
 * Each "table" is stored as a separate localStorage key with the
 * prefix `bm_db_`. Records use UUID-style IDs and timestamps.
 */

// ─── Shared Types ───────────────────────────────────────────────────

export interface DBRecord {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── News Articles ──────────────────────────────────────────────────

export interface NewsArticle extends DBRecord {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string; // outlet name, e.g. "CNN"
  author: string | null;
  publishedAt: string; // ISO 8601
  country: string; // "us", "pk", "gb", etc.
  category: string; // "general", "technology", etc.
  fetchedVia: "newsapi" | "gnews" | "currents" | "google-rss" | "lm-studio" | "manual";
  // LLM-appended fields (nullable before analysis)
  analysisId: string | null;
}

// ─── Analysis Results ───────────────────────────────────────────────

export interface AnalysisResult extends DBRecord {
  articleId: string | null; // FK to news_articles.id (null for custom text)
  source: string; // The origin of the text/article
  inputText: string; // the text that was analyzed
  dominantBias: string;
  secondaryBias: string;
  confidence: number;
  analysis: string;
  keyThemes: string[];
  narrativeTone: string;
  // V2: Advanced detection
  cognitiveBiases: CognitiveBiasEntry[];
  logicalFallacies: LogicalFallacyEntry[];
  psychologicalIndicators: PsychologicalIndicatorEntry[];
  sociologicalIndicators: SociologicalIndicatorEntry[];
  premises: string[];
  conclusions: string[];
}

export interface CognitiveBiasEntry {
  name: string; // e.g. "Confirmation Bias"
  description: string;
  severity: "low" | "medium" | "high";
}

export interface LogicalFallacyEntry {
  name: string; // e.g. "Ad Hominem"
  description: string;
  severity: "low" | "medium" | "high";
}

export interface PsychologicalIndicatorEntry {
  name: string; // e.g. "Fear-mongering"
  description: string;
  intensity: "low" | "medium" | "high";
}

export interface SociologicalIndicatorEntry {
  name: string; // e.g. "Out-group Villification"
  description: string;
  impact: "low" | "medium" | "high";
}

// ─── Narratives ─────────────────────────────────────────────────────

export interface NarrativeRecord extends DBRecord {
  title: string;
  description: string;
  promotedBy: string; // bias code
  opposedBy: string; // bias code
  intensity: "low" | "medium" | "high";
  relatedArticleIds: string[];
}

export interface NarrativeSnapshot extends DBRecord {
  narratives: NarrativeRecord[];
  trendingTopics: string[];
  biasTensions: string;
}

// ─── Outlet Profiles ────────────────────────────────────────────────

export interface OutletProfile extends DBRecord {
  name: string;
  country: string; // "international" | country code
  dominantBias: string;
  secondaryBias: string;
  confidence: number;
  analysis: string;
  keyThemes: string[];
  narrativeTone: string;
  lastFetchedAt: string | null;
}

// ─── App Settings ───────────────────────────────────────────────────

export interface NewsApiSettings {
  newsApiKey: string;
  gnewsApiKey: string;
  currentsApiKey: string;
  preferredProvider: "newsapi" | "gnews" | "currents" | "google-rss";
  fetchCountries: string[]; // e.g. ["us", "pk"]
  autoFetchEnabled: boolean;
  autoFetchIntervalSec: number;
}

// ─── DB Keys ────────────────────────────────────────────────────────

const DB_PREFIX = "bm_db_";
const TABLES = {
  newsArticles: `${DB_PREFIX}news_articles`,
  analysisResults: `${DB_PREFIX}analysis_results`,
  narrativeSnapshots: `${DB_PREFIX}narrative_snapshots`,
  outletProfiles: `${DB_PREFIX}outlet_profiles`,
  newsApiSettings: `${DB_PREFIX}news_api_settings`,
} as const;

// ─── Helpers ────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function readTable<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTable<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[LocalDB] Failed to write ${key}:`, e);
  }
}

function readSingleton<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeSingleton<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[LocalDB] Failed to write ${key}:`, e);
  }
}

// ─── News Articles CRUD ─────────────────────────────────────────────

export const NewsArticlesDB = {
  getAll(): NewsArticle[] {
    return readTable<NewsArticle>(TABLES.newsArticles);
  },

  getById(id: string): NewsArticle | undefined {
    return this.getAll().find((a) => a.id === id);
  },

  getBySource(source: string): NewsArticle[] {
    return this.getAll().filter((a) => a.source.toLowerCase() === source.toLowerCase());
  },

  getByCountry(country: string): NewsArticle[] {
    return this.getAll().filter((a) => a.country === country);
  },

  getRecent(limit: number = 50): NewsArticle[] {
    return this.getAll()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  },

  upsert(article: Omit<NewsArticle, "id" | "createdAt" | "updatedAt">): NewsArticle {
    const all = this.getAll();
    // Deduplicate by URL
    const existing = all.find((a) => a.url === article.url);
    if (existing) {
      const updated = { ...existing, ...article, updatedAt: now() };
      writeTable(TABLES.newsArticles, all.map((a) => (a.id === existing.id ? updated : a)));
      return updated;
    }
    const record: NewsArticle = { ...article, id: generateId(), createdAt: now(), updatedAt: now() };
    all.push(record);
    // Keep max 500 articles to avoid localStorage bloat
    const trimmed = all
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 500);
    writeTable(TABLES.newsArticles, trimmed);
    return record;
  },

  bulkUpsert(articles: Omit<NewsArticle, "id" | "createdAt" | "updatedAt">[]): NewsArticle[] {
    return articles.map((a) => this.upsert(a));
  },

  delete(id: string): void {
    const all = this.getAll().filter((a) => a.id !== id);
    writeTable(TABLES.newsArticles, all);
  },

  clear(): void {
    writeTable(TABLES.newsArticles, []);
  },

  count(): number {
    return this.getAll().length;
  },
};

// ─── Analysis Results CRUD ──────────────────────────────────────────

export const AnalysisResultsDB = {
  getAll(): AnalysisResult[] {
    return readTable<AnalysisResult>(TABLES.analysisResults);
  },

  getById(id: string): AnalysisResult | undefined {
    return this.getAll().find((a) => a.id === id);
  },

  getByArticleId(articleId: string): AnalysisResult | undefined {
    return this.getAll().find((a) => a.articleId === articleId);
  },

  getRecent(limit: number = 20): AnalysisResult[] {
    return this.getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  create(result: Omit<AnalysisResult, "id" | "createdAt" | "updatedAt">): AnalysisResult {
    const all = this.getAll();
    const record: AnalysisResult = { ...result, id: generateId(), createdAt: now(), updatedAt: now() };
    all.push(record);
    // Keep max 200 results
    const trimmed = all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200);
    writeTable(TABLES.analysisResults, trimmed);
    return record;
  },

  update(id: string, partial: Partial<AnalysisResult>): void {
    const all = this.getAll();
    writeTable(
      TABLES.analysisResults,
      all.map((a) => (a.id === id ? { ...a, ...partial, updatedAt: now() } : a))
    );
  },

  clear(): void {
    writeTable(TABLES.analysisResults, []);
  },
};

// ─── Narrative Snapshots CRUD ───────────────────────────────────────

export const NarrativeSnapshotsDB = {
  getAll(): NarrativeSnapshot[] {
    return readTable<NarrativeSnapshot>(TABLES.narrativeSnapshots);
  },

  getLatest(): NarrativeSnapshot | undefined {
    const all = this.getAll();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  create(snapshot: Omit<NarrativeSnapshot, "id" | "createdAt" | "updatedAt">): NarrativeSnapshot {
    const all = this.getAll();
    const record: NarrativeSnapshot = { ...snapshot, id: generateId(), createdAt: now(), updatedAt: now() };
    all.push(record);
    // Keep max 50 snapshots
    const trimmed = all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
    writeTable(TABLES.narrativeSnapshots, trimmed);
    return record;
  },

  clear(): void {
    writeTable(TABLES.narrativeSnapshots, []);
  },
};

// ─── Outlet Profiles CRUD ───────────────────────────────────────────

export const OutletProfilesDB = {
  getAll(): OutletProfile[] {
    return readTable<OutletProfile>(TABLES.outletProfiles);
  },

  getByCountry(country: string): OutletProfile[] {
    return this.getAll().filter((o) => o.country === country);
  },

  getByName(name: string): OutletProfile | undefined {
    return this.getAll().find((o) => o.name.toLowerCase() === name.toLowerCase());
  },

  upsert(profile: Omit<OutletProfile, "id" | "createdAt" | "updatedAt">): OutletProfile {
    const all = this.getAll();
    const existing = all.find((o) => o.name.toLowerCase() === profile.name.toLowerCase());
    if (existing) {
      const updated = { ...existing, ...profile, updatedAt: now() };
      writeTable(TABLES.outletProfiles, all.map((o) => (o.id === existing.id ? updated : o)));
      return updated;
    }
    const record: OutletProfile = { ...profile, id: generateId(), createdAt: now(), updatedAt: now() };
    all.push(record);
    writeTable(TABLES.outletProfiles, all);
    return record;
  },

  clear(): void {
    writeTable(TABLES.outletProfiles, []);
  },
};

// ─── News API Settings ──────────────────────────────────────────────

export const DEFAULT_NEWS_SETTINGS: NewsApiSettings = {
  newsApiKey: process.env.NEXT_PUBLIC_NEWSAPI_KEY || "",
  gnewsApiKey: process.env.NEXT_PUBLIC_GNEWS_KEY || "",
  currentsApiKey: process.env.NEXT_PUBLIC_CURRENTS_KEY || "",
  preferredProvider: (process.env.NEXT_PUBLIC_NEWS_PROVIDER as any) || "gnews",
  fetchCountries: ["us", "pk"],
  autoFetchEnabled: false,
  autoFetchIntervalSec: 600,
};

export const NewsSettingsDB = {
  get(): NewsApiSettings {
    return readSingleton<NewsApiSettings>(TABLES.newsApiSettings, DEFAULT_NEWS_SETTINGS);
  },

  update(partial: Partial<NewsApiSettings>): NewsApiSettings {
    const current = this.get();
    const updated = { ...current, ...partial };
    writeSingleton(TABLES.newsApiSettings, updated);
    return updated;
  },

  reset(): void {
    writeSingleton(TABLES.newsApiSettings, DEFAULT_NEWS_SETTINGS);
  },
};

// ─── Bulk Export / Import ───────────────────────────────────────────

export interface LocalDBExport {
  version: 1;
  exportedAt: string;
  newsArticles: NewsArticle[];
  analysisResults: AnalysisResult[];
  narrativeSnapshots: NarrativeSnapshot[];
  outletProfiles: OutletProfile[];
  newsApiSettings: NewsApiSettings;
}

export function exportAllData(): LocalDBExport {
  return {
    version: 1,
    exportedAt: now(),
    newsArticles: NewsArticlesDB.getAll(),
    analysisResults: AnalysisResultsDB.getAll(),
    narrativeSnapshots: NarrativeSnapshotsDB.getAll(),
    outletProfiles: OutletProfilesDB.getAll(),
    newsApiSettings: NewsSettingsDB.get(),
  };
}

export function importAllData(data: LocalDBExport): void {
  if (data.version !== 1) {
    throw new Error(`Unsupported export version: ${data.version}`);
  }
  writeTable(TABLES.newsArticles, data.newsArticles);
  writeTable(TABLES.analysisResults, data.analysisResults);
  writeTable(TABLES.narrativeSnapshots, data.narrativeSnapshots);
  writeTable(TABLES.outletProfiles, data.outletProfiles);
  writeSingleton(TABLES.newsApiSettings, data.newsApiSettings);
}

export function clearAllData(): void {
  // Clear Table-based DBs
  NewsArticlesDB.clear();
  AnalysisResultsDB.clear();
  NarrativeSnapshotsDB.clear();
  OutletProfilesDB.clear();
  NewsSettingsDB.reset();
  
  // Clear persistent states
  if (typeof window !== "undefined") {
    localStorage.removeItem("biasmapper_analysis_data");
    localStorage.removeItem("bias_mapper_api_config");
    localStorage.removeItem("bm_app_state"); // future-proofing
    console.log("🔥 FULL SYSTEM RESET: Local data cleared");
  }
}
