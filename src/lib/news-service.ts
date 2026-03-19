/**
 * News Fetch Service
 *
 * Fetches news from free APIs (GNews, NewsAPI, Currents, Google RSS)
 * and stores articles into the LocalDB (localStorage).
 *
 * Client-side only — designed for static SSG Next.js.
 */

import {
  NewsArticlesDB,
  NewsSettingsDB,
  type NewsArticle,
  type NewsApiSettings,
} from "./local-db";

// ─── Shared Article Shape ───────────────────────────────────────────

interface RawArticle {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  author: string | null;
  publishedAt: string;
}

// ─── GNews API (primary — generous free tier) ───────────────────────

async function fetchFromGNews(
  apiKey: string,
  country: string = "us",
  topic: string = "general",
  max: number = 10
): Promise<RawArticle[]> {
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      topic,
      country,
      lang: "en",
      max: String(max),
    });

    const res = await fetch(`https://gnews.io/api/v4/top-headlines?${params}`);
    if (!res.ok) {
      console.warn(`[GNews] ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      imageUrl: a.image || null,
      source: a.source?.name || "Unknown",
      author: null,
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[GNews] Fetch error:", e);
    return [];
  }
}

async function searchGNews(
  apiKey: string,
  query: string,
  max: number = 10
): Promise<RawArticle[]> {
  if (!apiKey || !query) return [];

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      q: query,
      lang: "en",
      max: String(max),
    });

    const res = await fetch(`https://gnews.io/api/v4/search?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      imageUrl: a.image || null,
      source: a.source?.name || "Unknown",
      author: null,
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[GNews] Search error:", e);
    return [];
  }
}

// ─── NewsAPI ────────────────────────────────────────────────────────

async function fetchFromNewsAPI(
  apiKey: string,
  country: string = "us",
  category: string = "general",
  pageSize: number = 10
): Promise<RawArticle[]> {
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      apiKey,
      country,
      category,
      pageSize: String(pageSize),
    });

    const res = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
    if (!res.ok) {
      console.warn(`[NewsAPI] ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      imageUrl: a.urlToImage || null,
      source: a.source?.name || "Unknown",
      author: a.author || null,
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[NewsAPI] Fetch error:", e);
    return [];
  }
}

// ─── Currents API ───────────────────────────────────────────────────

async function fetchFromCurrents(
  apiKey: string,
  country: string = "us",
  category: string = "general"
): Promise<RawArticle[]> {
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      apiKey,
      country: country.toUpperCase(),
      category,
      language: "en",
    });

    const res = await fetch(`https://api.currentsapi.services/v1/latest-news?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.news || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      imageUrl: a.image !== "None" ? a.image : null,
      source: a.author || "Unknown",
      author: a.author || null,
      publishedAt: a.published || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[Currents] Fetch error:", e);
    return [];
  }
}

// ─── Google News RSS (free, no key needed) ──────────────────────────

async function fetchFromGoogleRSS(
  country: string = "us",
  topic: string = "WORLD"
): Promise<RawArticle[]> {
  try {
    // Use a CORS proxy for client-side RSS (or direct if same-origin)
    const hl = country === "pk" ? "en-PK" : "en-US";
    const gl = country.toUpperCase();
    const ceid = `${gl}:en`;
    const url = `https://news.google.com/rss/headlines/section/topic/${topic}?hl=${hl}&gl=${gl}&ceid=${ceid}`;

    // Attempt via a known CORS proxy
    const corsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(corsProxy);
    if (!res.ok) return [];

    const text = await res.text();
    // Simple XML parse for RSS items
    const items: RawArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
      const itemXml = match[1];
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || itemXml.match(/<title>(.*?)<\/title>/)?.[1]
        || "";
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "Google News";

      if (title && link) {
        items.push({
          title: decodeHTMLEntities(title),
          description: "",
          url: link,
          imageUrl: null,
          source: decodeHTMLEntities(source),
          author: null,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
    return items;
  } catch (e) {
    console.error("[Google RSS] Fetch error:", e);
    return [];
  }
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (m) => entities[m] || m);
}

// ─── Main Fetch Orchestrator ────────────────────────────────────────

export interface FetchNewsOptions {
  countries?: string[];
  topic?: string;
  maxPerSource?: number;
}

/**
 * Fetch news from the preferred provider and store into LocalDB.
 * Returns the newly fetched articles.
 */
export async function fetchAndStoreNews(
  options: FetchNewsOptions = {}
): Promise<NewsArticle[]> {
  const settings = NewsSettingsDB.get();
  const countries = options.countries || settings.fetchCountries || ["us"];
  const topic = options.topic || "general";
  const maxPerSource = options.maxPerSource || 10;

  const allRaw: { article: RawArticle; country: string; provider: NewsApiSettings["preferredProvider"] }[] = [];

  for (const country of countries) {
    let articles: RawArticle[] = [];

    // Try preferred provider first, then fallback chain
    const providers = getProviderChain(settings);

    for (const provider of providers) {
      if (articles.length > 0) break;

      switch (provider) {
        case "gnews":
          articles = await fetchFromGNews(settings.gnewsApiKey, country, topic, maxPerSource);
          break;
        case "newsapi":
          articles = await fetchFromNewsAPI(settings.newsApiKey, country, topic === "general" ? "general" : "general", maxPerSource);
          break;
        case "currents":
          articles = await fetchFromCurrents(settings.currentsApiKey, country, topic);
          break;
        case "google-rss":
          articles = await fetchFromGoogleRSS(country, topic.toUpperCase());
          break;
      }

      if (articles.length > 0) {
        articles.forEach((a) => allRaw.push({ article: a, country, provider }));
        console.log(`✅ [${provider}] Fetched ${articles.length} articles for ${country}`);
      }
    }
  }

  // Store into LocalDB
  const stored = allRaw.map(({ article, country, provider }) =>
    NewsArticlesDB.upsert({
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.imageUrl,
      source: article.source,
      author: article.author,
      publishedAt: article.publishedAt,
      country,
      category: topic,
      fetchedVia: provider,
      analysisId: null,
    })
  );

  console.log(`✅ Stored ${stored.length} articles into LocalDB`);
  return stored;
}

/**
 * Search for news by query and store results.
 */
export async function searchAndStoreNews(
  query: string,
  maxResults: number = 10
): Promise<NewsArticle[]> {
  const settings = NewsSettingsDB.get();

  let articles: RawArticle[] = [];

  // Try GNews search first (best for search)
  if (settings.gnewsApiKey) {
    articles = await searchGNews(settings.gnewsApiKey, query, maxResults);
  }

  if (articles.length === 0) {
    // Fallback to Google RSS search
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const corsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(corsProxy);
      if (res.ok) {
        const text = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(text)) !== null && articles.length < maxResults) {
          const itemXml = match[1];
          const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
            || itemXml.match(/<title>(.*?)<\/title>/)?.[1]
            || "";
          const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
          const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const source = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "Google News";

          if (title && link) {
            articles.push({
              title: decodeHTMLEntities(title),
              description: "",
              url: link,
              imageUrl: null,
              source: decodeHTMLEntities(source),
              author: null,
              publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.error("[Google RSS Search] error:", e);
    }
  }

  // Store into LocalDB
  const stored = articles.map((a) =>
    NewsArticlesDB.upsert({
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.imageUrl,
      source: a.source,
      author: a.author,
      publishedAt: a.publishedAt,
      country: "us",
      category: "search",
      fetchedVia: "gnews",
      analysisId: null,
    })
  );

  return stored;
}

// ─── Provider Chain ─────────────────────────────────────────────────

function getProviderChain(settings: NewsApiSettings): NewsApiSettings["preferredProvider"][] {
  const allProviders: NewsApiSettings["preferredProvider"][] = ["gnews", "newsapi", "currents", "google-rss"];
  // Put preferred first, then the rest
  const chain = [settings.preferredProvider, ...allProviders.filter((p) => p !== settings.preferredProvider)];
  return chain;
}

// ─── Utility: Check if any news API is configured ───────────────────

export function isNewsApiConfigured(): boolean {
  const settings = NewsSettingsDB.get();
  return !!(settings.gnewsApiKey || settings.newsApiKey || settings.currentsApiKey);
}

/**
 * Get feed-ready articles from LocalDB, sorted by date, optionally filtered.
 */
export function getNewsFeed(options?: {
  country?: string;
  source?: string;
  limit?: number;
  onlyUnanalyzed?: boolean;
}): NewsArticle[] {
  let articles = NewsArticlesDB.getAll();

  if (options?.country) {
    articles = articles.filter((a) => a.country === options.country);
  }
  if (options?.source) {
    articles = articles.filter((a) => a.source.toLowerCase() === options.source!.toLowerCase());
  }
  if (options?.onlyUnanalyzed) {
    articles = articles.filter((a) => !a.analysisId);
  }

  return articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, options?.limit || 50);
}
