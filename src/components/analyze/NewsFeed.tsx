"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  Brain,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  Loader2,
  Globe,
  Zap,
  TrendingDown,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  type NewsArticle,
  type AnalysisResult,
  NewsArticlesDB,
  AnalysisResultsDB,
} from "@/lib/local-db";
import { fetchAndStoreNews, searchAndStoreNews, getNewsFeed, isNewsApiConfigured } from "@/lib/news-service";
import Link from "next/link";

// ─── Constants ──────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// ─── Component ──────────────────────────────────────────────────────

interface NewsFeedProps {
  onAnalyzeArticle?: (article: NewsArticle) => Promise<void>;
  isLLMReady: boolean;
  maxHeight?: string;
}

export function NewsFeed({ onAnalyzeArticle, isLLMReady, maxHeight = "750px" }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, AnalysisResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Load articles from LocalDB
  const loadArticles = useCallback(() => {
    const feed = getNewsFeed({
      country: filterCountry === "all" ? undefined : filterCountry,
      limit: 1000, // Load enough for local paging
    });
    setArticles(feed);

    // Sync analyses
    const allAnalyses = AnalysisResultsDB.getAll();
    const map = new Map<string, AnalysisResult>();
    allAnalyses.forEach((a) => {
      if (a.articleId) map.set(a.articleId, a);
    });
    setAnalyses(map);
  }, [filterCountry]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
  const currentArticles = articles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    setCurrentPage(p);
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FETCH FRESH from APIs
  const handleFetchNews = async (isLoadMore = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Increase amount if load more? No, just fetch fresh into DB
      const fetched = await fetchAndStoreNews({ maxPerSource: 20 });
      if (fetched.length === 0 && articles.length === 0) {
        setFetchError("No fresh articles found. Make sure your API keys are correct in Settings.");
      }
      loadArticles();
      if (!isLoadMore) setCurrentPage(1);
    } catch (e: any) {
      setFetchError(e.message || "Failed to fetch from news APIs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setFetchError(null);
    try {
      await searchAndStoreNews(searchQuery, 15);
      loadArticles();
      setCurrentPage(1);
    } catch (e: any) {
      setFetchError(e.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleAnalyze = async (article: NewsArticle) => {
    if (!onAnalyzeArticle || analyzingId) return;
    setAnalyzingId(article.id);
    try {
      await onAnalyzeArticle(article);
      loadArticles();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  const biasColorMap: Record<string, string> = {
    "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
    C: "#6b7280",
    R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
    "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
    B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Search Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Input
            placeholder="Search news topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-slate-900/50 border-slate-700/50 pl-10 text-white placeholder-slate-500 focus:ring-blue-500/50"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          {searching && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          >
            <option value="all">🌏 Global Feed</option>
            <option value="us">🇺🇸 United States</option>
            <option value="pk">🇵🇰 Pakistan News</option>
            <option value="gb">🇬🇧 United Kingdom</option>
            <option value="ca">🇨🇦 Canada</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <Button
            onClick={() => handleFetchNews()}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all group shadow-lg shadow-blue-500/10"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
            Fetch Fresh
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-4 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Newspaper className="h-3.5 w-3.5 text-blue-400" />
            {articles.length} RECENT ARTICLES
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Brain className="h-3.5 w-3.5 text-amber-400" />
            {analyses.size} PROCESSED
          </span>
        </div>
        {articles.length > 0 && (
          <div className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-700/50">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Error / Empty State */}
      {fetchError && (
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-red-300">{fetchError}</span>
          </CardContent>
        </Card>
      )}

      {articles.length === 0 ? (
        <Card className="bg-slate-900 border-2 border-dashed border-slate-800">
          <CardContent className="py-20 text-center">
            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Globe className="h-10 w-10 text-slate-500 animate-pulse" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">No Content Synced</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
              Start by fetching news from your configured APIs or the Google RSS fallback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleFetchNews()} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                Sync Latest News
              </Button>
              {!isNewsApiConfigured() && (
                <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-400">
                  <Link href="/settings">Set API Keys</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div 
          ref={feedRef}
          className="space-y-4 overflow-y-auto pr-2 custom-scrollbar smooth-scroll"
          style={{ maxHeight }}
        >
          {currentArticles.map((article) => {
            const analysis = analyses.get(article.id);
            const status = analyzingId === article.id ? "analyzing" : analysis ? "done" : "idle";

            return (
              <Card 
                key={article.id} 
                className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all group overflow-hidden"
              >
                <div className={`h-full w-1 absolute left-0 top-0 transition-colors ${status === 'analyzing' ? 'bg-amber-500 animate-pulse' : status === 'done' ? 'bg-blue-500' : 'bg-slate-800'}`} />
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-24 h-24 sm:h-20 bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden relative group-hover:ring-2 ring-slate-700 transition-all">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="h-6 w-6 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h4>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      
                      {article.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-4 font-medium leading-relaxed">
                          {article.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-slate-800 text-slate-300 font-bold border-none text-[10px] px-2 py-0.5">
                          {article.source}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <Clock className="h-3 w-3" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </div>

                        {/* Analysis Indicators */}
                        <div className="ml-auto flex items-center gap-2">
                          {status === "done" ? (
                            <div className="flex gap-2 items-center">
                              <Badge 
                                style={{ backgroundColor: biasColorMap[analysis!.dominantBias] }}
                                className="text-white shadow-lg shadow-black/40 px-3"
                              >
                                {analysis!.dominantBias}
                              </Badge>
                              
                              <div className="flex gap-1.5 ml-2">
                                {analysis!.logicalFallacies?.length > 0 && (
                                  <div className="p-1 px-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-1 tooltip-trigger">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{analysis!.logicalFallacies.length}</span>
                                  </div>
                                )}
                                {analysis!.cognitiveBiases?.length > 0 && (
                                  <div className="p-1 px-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{analysis!.cognitiveBiases.length}</span>
                                  </div>
                                )}
                                {analysis!.psychologicalIndicators?.length > 0 && (
                                  <div className="p-1 px-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{analysis!.psychologicalIndicators.length}</span>
                                  </div>
                                )}
                                {analysis!.sociologicalIndicators?.length > 0 && (
                                  <div className="p-1 px-2 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{analysis!.sociologicalIndicators.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAnalyze(article)}
                              disabled={!isLLMReady || status === "analyzing"}
                              className="h-8 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                              size="sm"
                            >
                              {status === "analyzing" ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                              ) : (
                                <Target className="h-3 w-3 mr-2 text-white" />
                              )}
                              {status === "analyzing" ? "Analyzing" : "Deep-Forensic Audit"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Fix / Load More UI */}
      {articles.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-800 hover:bg-slate-800 text-slate-400 h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "ghost"}
                    size="sm"
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 p-0 ${currentPage === p ? 'bg-blue-600' : 'text-slate-500'}`}
                  >
                    {p}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-600 px-2">...</span>}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-800 hover:bg-slate-800 text-slate-400 h-9"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFetchNews(true)}
            className="text-slate-500 hover:text-blue-400 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync More From Web
          </Button>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
