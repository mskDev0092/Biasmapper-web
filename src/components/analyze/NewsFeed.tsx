"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  Brain,
  AlertTriangle,
  Clock,
  ChevronDown,
  Sparkles,
  Filter,
} from "lucide-react";
import {
  type NewsArticle,
  type AnalysisResult,
  NewsArticlesDB,
  AnalysisResultsDB,
} from "@/lib/local-db";
import { fetchAndStoreNews, searchAndStoreNews, getNewsFeed } from "@/lib/news-service";

interface NewsFeedProps {
  onAnalyzeArticle?: (article: NewsArticle) => Promise<void>;
  isLLMReady: boolean;
  maxHeight?: string;
}

export function NewsFeed({ onAnalyzeArticle, isLLMReady, maxHeight = "600px" }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, AnalysisResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  // Load articles from LocalDB on mount
  const loadArticles = useCallback(() => {
    const feed = getNewsFeed({
      country: filterCountry === "all" ? undefined : filterCountry,
      limit: 100,
    });
    setArticles(feed);

    // Load matching analyses
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

  // Fetch fresh news
  const handleFetchNews = async () => {
    setLoading(true);
    try {
      await fetchAndStoreNews();
      loadArticles();
    } catch (e) {
      console.error("Fetch news error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Search news
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      await searchAndStoreNews(searchQuery);
      loadArticles();
    } catch (e) {
      console.error("Search news error:", e);
    } finally {
      setSearching(false);
    }
  };

  // Analyze single article
  const handleAnalyze = async (article: NewsArticle) => {
    if (!onAnalyzeArticle || analyzingId) return;
    setAnalyzingId(article.id);
    try {
      await onAnalyzeArticle(article);
      loadArticles();
    } catch (e) {
      console.error("Analyze error:", e);
    } finally {
      setAnalyzingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      if (diffHrs < 1) return `${Math.floor(diffMs / 60000)}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const biasColorMap: Record<string, string> = {
    "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
    C: "#6b7280",
    R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
    "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
    B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
  };

  const displayArticles = articles.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search news topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {searching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white"
            aria-label="Filter by country"
          >
            <option value="all">All Countries</option>
            <option value="us">🇺🇸 US</option>
            <option value="pk">🇵🇰 Pakistan</option>
            <option value="gb">🇬🇧 UK</option>
          </select>
          <Button
            onClick={handleFetchNews}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Fetch</span>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Newspaper className="h-3 w-3" />
          {articles.length} articles
        </span>
        <span className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          {analyses.size} analyzed
        </span>
      </div>

      {/* Articles Feed */}
      {articles.length === 0 ? (
        <Card className="bg-slate-800/30 border-slate-700/50 border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">
              No articles yet. Configure a News API key in Settings or click Fetch to get started.
            </p>
            <Button
              onClick={handleFetchNews}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Fetch News
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea style={{ maxHeight }} className="pr-3">
          <div className="space-y-3">
            {displayArticles.map((article) => {
              const analysis = analyses.get(article.id);
              const isAnalyzing = analyzingId === article.id;

              return (
                <Card
                  key={article.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-500 transition-all duration-200 group"
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      {article.imageUrl && (
                        <div className="hidden sm:block flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-slate-700">
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
                            {article.title}
                          </h4>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-slate-500 hover:text-blue-400 transition-colors"
                            aria-label={`Open ${article.title} in new tab`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {article.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                            {article.description}
                          </p>
                        )}

                        <div className="flex items-center flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {article.source}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(article.publishedAt)}
                          </span>

                          {/* Analysis badges */}
                          {analysis ? (
                            <div className="flex gap-1 ml-auto">
                              <Badge
                                style={{ backgroundColor: biasColorMap[analysis.dominantBias] || "#6b7280" }}
                                className="text-white text-xs"
                              >
                                {analysis.dominantBias}
                              </Badge>
                              {analysis.cognitiveBiases.length > 0 && (
                                <Badge className="bg-amber-600/40 text-amber-300 text-xs border-none">
                                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                  {analysis.cognitiveBiases.length} bias
                                </Badge>
                              )}
                              {analysis.logicalFallacies.length > 0 && (
                                <Badge className="bg-red-600/40 text-red-300 text-xs border-none">
                                  {analysis.logicalFallacies.length} fallacy
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAnalyze(article)}
                              disabled={!isLLMReady || isAnalyzing}
                              size="sm"
                              variant="ghost"
                              className="ml-auto h-6 px-2 text-xs text-slate-400 hover:text-amber-400"
                            >
                              {isAnalyzing ? (
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              {isAnalyzing ? "Analyzing..." : "Analyze"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Load More */}
            {visibleCount < articles.length && (
              <Button
                onClick={() => setVisibleCount((v) => v + 20)}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Show More ({articles.length - visibleCount} remaining)
              </Button>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
