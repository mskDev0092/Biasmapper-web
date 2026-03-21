/**
 * Data Export Utilities
 *
 * Export analysis results, news articles, outlet analysis, narratives
 * to PDF, JSON, and CSV formats — including full dashboard data.
 */

import {
  exportAllData,
  importAllData,
  type LocalDBExport,
  type NewsArticle,
  type AnalysisResult,
  type NarrativeSnapshot,
  type OutletProfile,
  OutletProfilesDB,
  NewsArticlesDB,
  AnalysisResultsDB,
  NarrativeSnapshotsDB,
} from "./local-db";
import { loadAnalysisData } from "./analysis-storage";
import type { CountryConfig } from "./country-config";

// ─── JSON Export / Import ───────────────────────────────────────────

export interface FullExportData extends LocalDBExport {
  dashboardState?: {
    international: any[];
    pakistan: any[];
    narratives: any;
  };
  exportedAt: string;
  version: string;
  selectedCountry?: string;
}

export function exportToJSON(): void {
  const data: FullExportData = {
    ...exportAllData(),
    dashboardState: loadAnalysisData() || undefined,
    exportedAt: new Date().toISOString(),
    version: "2.0.0",
  };
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `biasmapper-export-${dateStamp()}.json`, "application/json");
}

export function importFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as LocalDBExport;
        importAllData(data);
        resolve();
      } catch (e) {
        reject(new Error("Invalid JSON file format"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// ─── CSV Export ─────────────────────────────────────────────────────

export function exportArticlesToCSV(articles: NewsArticle[]): void {
  const headers = ["Title", "Source", "Country", "Published At", "URL", "Description", "Analysis ID"];
  const rows = articles.map((a) => [
    escapeCSV(a.title),
    escapeCSV(a.source),
    a.country,
    a.publishedAt,
    a.url,
    escapeCSV(a.description),
    a.analysisId || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csv, `biasmapper-articles-${dateStamp()}.csv`, "text/csv");
}

export function exportAnalysesToCSV(analyses: AnalysisResult[]): void {
  const headers = [
    "ID", "Article ID", "Dominant Bias", "Secondary Bias", "Confidence",
    "Analysis", "Key Themes", "Narrative Tone",
    "Cognitive Biases", "Logical Fallacies",
    "Premises", "Conclusions", "Created At",
  ];
  const rows = analyses.map((a) => [
    a.id,
    a.articleId || "",
    a.dominantBias,
    a.secondaryBias,
    String(a.confidence),
    escapeCSV(a.analysis),
    escapeCSV(a.keyThemes.join("; ")),
    escapeCSV(a.narrativeTone),
    escapeCSV(a.cognitiveBiases.map((b) => `${b.name} (${b.severity})`).join("; ")),
    escapeCSV(a.logicalFallacies.map((f) => `${f.name} (${f.severity})`).join("; ")),
    escapeCSV(a.premises.join("; ")),
    escapeCSV(a.conclusions.join("; ")),
    a.createdAt,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csv, `biasmapper-analyses-${dateStamp()}.csv`, "text/csv");
}

// ─── PDF Export (Excellent Professional Formatting) ────────

export function exportToPDF(options: {
  articles?: NewsArticle[];
  analyses?: AnalysisResult[];
  narrative?: NarrativeSnapshot;
  outletProfiles?: OutletProfile[];
  dashboardState?: { international: any[]; pakistan: any[]; narratives: any } | null;
  title?: string;
  country?: CountryConfig;
}): void {
  const { title = "BiasMapper Dashboard Report", country } = options;

  // Gather comprehensive data
  const dashState = options.dashboardState || loadAnalysisData();
  const articles = options.articles || NewsArticlesDB.getRecent(30);
  const analyses = options.analyses || AnalysisResultsDB.getRecent(30);
  const narrative = options.narrative || NarrativeSnapshotsDB.getLatest();
  const outlets = options.outletProfiles || OutletProfilesDB.getAll();

  const international = dashState?.international || [];
  const countryData = dashState?.pakistan || [];
  const narrativeData = dashState?.narratives;

  const biasColorMap: Record<string, string> = {
    "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
    C: "#6b7280",
    R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
    "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
    B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
  };

  const biasLabels: Record<string, string> = {
    "L++": "Far Left", "L+": "Progressive", L: "Left",
    C: "Center",
    R: "Right", "R+": "Conservative", "R++": "Far Right",
    "T++": "Est. Extreme", "T+": "Mainstream", T: "Establishment",
    B: "Oppositional", "B+": "Grassroots", "B++": "Radical",
  };

  // Compute bias distribution with visual bars
  function biasDistribution(outletList: any[], accentColor: string): string {
    if (outletList.length === 0) return '<p class="text-slate-500 italic">No data available</p>';
    const dist: Record<string, number> = {};
    outletList.forEach((o: any) => {
      dist[o.dominant_bias] = (dist[o.dominant_bias] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .map(([bias, count]) => {
        const pct = Math.round((count / outletList.length) * 100);
        const label = biasLabels[bias] || bias;
        const color = biasColorMap[bias] || "#6b7280";
        return `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding: 12px 16px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8)); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.5);">
            <span style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; min-width: 50px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              ${bias}
            </span>
            <div style="flex: 1; background: rgba(15, 23, 42, 0.8); border-radius: 6px; height: 28px; overflow: hidden; position: relative; border: 1px solid rgba(51, 65, 85, 0.5);">
              <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, ${color}, ${color}cc); border-radius: 6px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
                <span style="color: white; font-size: 11px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${pct}%</span>
              </div>
            </div>
            <div style="text-align: right; min-width: 80px;">
              <span style="font-size: 14px; font-weight: 700; color: #e2e8f0;">${count}</span>
              <span style="font-size: 11px; color: #64748b; display: block;">outlet${count > 1 ? 's' : ''}</span>
            </div>
          </div>`;
      }).join("");
  }

  // Normalize promoted/opposed to string
  function normalizeBias(value: any): string {
    if (!value) return "—";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  }

  // Format severity badge
  function severityBadge(severity: string): string {
    const colors: Record<string, string> = {
      high: "linear-gradient(135deg, #dc2626, #b91c1c)",
      medium: "linear-gradient(135deg, #f59e0b, #d97706)",
      low: "linear-gradient(135deg, #6b7280, #4b5563)",
    };
    const bg = colors[severity] || colors.low;
    return `<span style="background: ${bg}; color: white; padding: 3px 10px; border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2);">${severity}</span>`;
  }

  // Match articles to analyses
  const analysisMap = new Map<string, AnalysisResult>();
  analyses.forEach(a => { if (a.articleId) analysisMap.set(a.articleId, a); });

  // Country name
  const countryName = country ? `${country.flag} ${country.name}` : 'Regional';
  const countryDescription = country?.description || '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    /* Header Section */
    .report-header {
      text-align: center;
      margin-bottom: 48px;
      padding: 48px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 24px;
      border: 1px solid rgba(59, 130, 246, 0.2);
      position: relative;
      overflow: hidden;
    }
    
    .report-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    .report-header h1 { 
      font-size: 42px;
      font-weight: 800;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
      position: relative;
    }
    
    .report-header .subtitle {
      color: #94a3b8;
      font-size: 15px;
      font-weight: 500;
      position: relative;
    }
    
    .report-header .timestamp {
      color: #64748b;
      font-size: 13px;
      margin-top: 16px;
      font-weight: 500;
      position: relative;
    }
    
    /* Stats Grid */
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 20px; 
      margin-bottom: 48px; 
    }
    
    .stat-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 20px;
      padding: 28px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    }
    
    .stat-card:nth-child(2)::before { background: linear-gradient(90deg, #10b981, #059669); }
    .stat-card:nth-child(3)::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .stat-card:nth-child(4)::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
    
    .stat-card .value { 
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, #f8fafc, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    
    .stat-card .label { 
      font-size: 13px;
      color: #64748b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .stat-card .icon {
      font-size: 24px;
      margin-bottom: 12px;
    }
    
    /* Section Styles */
    .section { 
      margin-bottom: 48px;
      page-break-inside: avoid;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(59, 130, 246, 0.2);
    }
    
    .section-header h2 { 
      font-size: 28px;
      color: #f8fafc;
      font-weight: 700;
    }
    
    .section-badge {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    
    /* Card Styles */
    .card { 
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
      transition: border-color 0.3s ease, transform 0.2s ease;
    }
    
    .card:hover {
      border-color: rgba(59, 130, 246, 0.3);
    }
    
    .card h3 { 
      font-size: 18px;
      color: #f8fafc;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    .card p { 
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.7;
    }
    
    /* Badge Styles */
    .badge { 
      display: inline-block;
      padding: 5px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      margin-right: 8px;
      box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2);
    }
    
    .badge-outline { 
      background: transparent !important;
      border: 2px solid;
      box-shadow: none;
    }
    
    /* Outlet Row */
    .outlet-row { 
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.3);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3));
      border-radius: 14px;
      margin-bottom: 10px;
      transition: background 0.3s ease;
    }
    
    .outlet-row:last-child { border-bottom: none; }
    
    .outlet-name { 
      font-weight: 700;
      color: #f8fafc;
      font-size: 16px;
    }
    
    .outlet-desc { 
      font-size: 14px;
      color: #94a3b8;
      margin-top: 6px;
      line-height: 1.5;
    }
    
    /* Narrative Card */
    .narrative-card { 
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
      border: 1px solid rgba(251, 191, 36, 0.2);
      border-radius: 18px;
      padding: 24px;
      transition: border-color 0.3s ease;
    }
    
    .narrative-card:hover {
      border-color: rgba(251, 191, 36, 0.4);
    }
    
    .narrative-meta { 
      display: flex;
      gap: 24px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    
    .narrative-meta .label { 
      font-size: 11px;
      color: #64748b;
      margin-right: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    /* Article Analysis Box */
    .article-analysis { 
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4));
      border-left: 4px solid;
      padding: 20px;
      margin-top: 16px;
      border-radius: 0 14px 14px 0;
    }
    
    /* Bias Item */
    .bias-list { margin-top: 16px; }
    
    .bias-item { 
      font-size: 14px;
      color: #cbd5e1;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.3);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3));
      border-radius: 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    
    .bias-item:last-child { border-bottom: none; }
    
    /* Footer */
    .footer { 
      text-align: center;
      margin-top: 64px;
      padding: 32px;
      border-top: 1px solid rgba(51, 65, 85, 0.5);
      color: #64748b;
      font-size: 14px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
      border-radius: 20px;
    }
    
    .footer-logo {
      font-size: 20px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    
    /* Grid Layout */
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    
    /* Responsive */
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .report-header h1 { font-size: 32px; }
      .section-header h2 { font-size: 22px; }
    }
    
    /* Print Styles */
    @media print {
      body { 
        background: white;
        color: #1e293b;
        padding: 20px;
      }
      
      .card, .stat-card, .narrative-card, .outlet-row, .report-header { 
        border-color: #e2e8f0;
        background: #f8fafc;
        break-inside: avoid;
      }
      
      .card h3, .outlet-name, .stat-card .value, .section-header h2, .report-header h1 { 
        color: #1e293b;
        -webkit-text-fill-color: #1e293b;
      }
      
      .card p, .outlet-desc, .stat-card .label { color: #475569; }
      
      .badge { box-shadow: none; }
      
      .stat-card::before { opacity: 0.5; }
      
      .report-header { background: #f1f5f9; }
      
      .bias-item { background: #f8fafc; border-color: #e2e8f0; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="report-header">
    <h1>⚖️ ${title}</h1>
    <p class="subtitle">Comprehensive Bias Analysis & Intelligence Report</p>
    <p class="timestamp">
      Generated on ${new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
      ${country ? ` • Region: ${countryName}` : ''}
    </p>
  </div>

  <!-- Stats Summary -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="icon">🌍</div>
      <div class="value">${international.length}</div>
      <div class="label">International Outlets</div>
    </div>
    <div class="stat-card">
      <div class="icon">${country?.flag || '🏳️'}</div>
      <div class="value">${countryData.length}</div>
      <div class="label">${countryName} Outlets</div>
    </div>
    <div class="stat-card">
      <div class="icon">📰</div>
      <div class="value">${articles.length}</div>
      <div class="label">News Articles</div>
    </div>
    <div class="stat-card">
      <div class="icon">🔍</div>
      <div class="value">${analyses.length}</div>
      <div class="label">Analyses</div>
    </div>
  </div>

  ${international.length > 0 ? `
  <!-- International Bias Distribution -->
  <div class="section">
    <div class="section-header">
      <h2>🌍 International Media Bias Distribution</h2>
      <span class="section-badge">${international.length} Outlets</span>
    </div>
    <div class="card">
      ${biasDistribution(international, '#3b82f6')}
    </div>
    <div class="card" style="margin-top: 20px;">
      <h3>📊 Outlet Breakdown</h3>
      ${international.map((o: any) => `
        <div class="outlet-row">
          <div style="flex: 1; min-width: 0;">
            <div class="outlet-name">${o.outlet}</div>
            <div class="outlet-desc">${o.analysis}</div>
            ${o.key_themes?.length > 0 ? `
              <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                ${o.key_themes.slice(0, 3).map((t: string) => `<span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 10px; padding: 3px 8px;">${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div style="text-align: right; flex-shrink: 0; margin-left: 20px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <span class="badge" style="background: ${biasColorMap[o.dominant_bias] || '#6b7280'}">${o.dominant_bias}</span>
              <span class="badge badge-outline" style="border-color: ${biasColorMap[o.secondary_bias] || '#6b7280'}; color: ${biasColorMap[o.secondary_bias] || '#6b7280'}">${o.secondary_bias}</span>
            </div>
            <span style="font-size: 13px; color: #94a3b8; font-weight: 600;">${Math.round(o.confidence * 100)}% confidence</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${countryData.length > 0 ? `
  <!-- ${countryName} Bias Distribution -->
  <div class="section">
    <div class="section-header">
      <h2>${country?.flag || '🏳️'} ${countryName} Media Bias Distribution</h2>
      <span class="section-badge" style="background: linear-gradient(135deg, #10b981, #059669);">${countryData.length} Outlets</span>
    </div>
    ${countryDescription ? `<p style="color: #94a3b8; margin-bottom: 20px; font-size: 15px; font-style: italic;">${countryDescription}</p>` : ''}
    <div class="card">
      ${biasDistribution(countryData, '#10b981')}
    </div>
    <div class="card" style="margin-top: 20px;">
      <h3>📊 Outlet Breakdown</h3>
      ${countryData.map((o: any) => `
        <div class="outlet-row">
          <div style="flex: 1; min-width: 0;">
            <div class="outlet-name">${o.outlet}</div>
            <div class="outlet-desc">${o.analysis}</div>
            ${o.key_themes?.length > 0 ? `
              <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                ${o.key_themes.slice(0, 3).map((t: string) => `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 10px; padding: 3px 8px;">${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div style="text-align: right; flex-shrink: 0; margin-left: 20px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <span class="badge" style="background: ${biasColorMap[o.dominant_bias] || '#6b7280'}">${o.dominant_bias}</span>
              <span class="badge badge-outline" style="border-color: ${biasColorMap[o.secondary_bias] || '#6b7280'}; color: ${biasColorMap[o.secondary_bias] || '#6b7280'}">${o.secondary_bias}</span>
            </div>
            <span style="font-size: 13px; color: #94a3b8; font-weight: 600;">${Math.round(o.confidence * 100)}% confidence</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${narrativeData?.narratives?.length > 0 ? `
  <!-- Detected Narratives -->
  <div class="section">
    <div class="section-header">
      <h2>🔍 Detected Narratives</h2>
      <span class="section-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${narrativeData.narratives.length} Narratives</span>
    </div>
    <div class="grid">
      ${narrativeData.narratives.map((n: any) => `
        <div class="narrative-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <h3 style="margin: 0; flex: 1;">${n.title}</h3>
            <span class="badge" style="background: ${n.intensity === "high" ? "linear-gradient(135deg, #dc2626, #b91c1c)" : n.intensity === "medium" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #6b7280, #4b5563)"}; margin-left: 12px;">
              ${n.intensity}
            </span>
          </div>
          <p style="margin-bottom: 20px; font-style: italic; color: #94a3b8;">"${n.description}"</p>
          <div class="narrative-meta" style="background: rgba(15, 23, 42, 0.5); padding: 16px; border-radius: 12px;">
            <div>
              <span class="label">Promoted by</span>
              <span class="badge" style="background: ${biasColorMap[normalizeBias(n.promoted_by)] || '#6b7280'}">${normalizeBias(n.promoted_by)}</span>
            </div>
            <div>
              <span class="label">Opposed by</span>
              <span class="badge badge-outline" style="border-color: ${biasColorMap[normalizeBias(n.opposed_by)] || '#6b7280'}; color: ${biasColorMap[normalizeBias(n.opposed_by)] || '#94a3b8'}">${normalizeBias(n.opposed_by)}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
    ${narrativeData.trending_topics?.length > 0 ? `
      <div class="card" style="margin-top: 20px;">
        <h3>📈 Trending Topics</h3>
        <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px;">
          ${narrativeData.trending_topics.map((t: string) => `<span class="badge" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">${t}</span>`).join("")}
        </div>
        ${narrativeData.bias_tensions ? `
          <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1)); border-radius: 12px; border-left: 4px solid #8b5cf6;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a78bfa; margin-bottom: 8px; font-weight: 600;">Bias Tensions</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">${narrativeData.bias_tensions}</p>
          </div>
        ` : ""}
      </div>
    ` : ""}
  </div>
  ` : ""}

  ${analyses.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <h2>🧠 Analysis Results</h2>
      <span class="section-badge" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">${analyses.length} Analyses</span>
    </div>
    ${analyses.map((a) => {
      const relatedArticle = a.articleId ? articles.find(art => art.id === a.articleId) : null;
      return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <h3 style="flex: 1; min-width: 250px; margin: 0; word-break: break-word;">${a.inputText.substring(0, 100)}${a.inputText.length > 100 ? "..." : ""}</h3>
          <div style="flex-shrink: 0; display: flex; gap: 8px;">
            <span class="badge" style="background: ${biasColorMap[a.dominantBias] || '#6b7280'}">${a.dominantBias}</span>
            <span class="badge badge-outline" style="border-color: ${biasColorMap[a.secondaryBias] || '#6b7280'}; color: ${biasColorMap[a.secondaryBias] || '#6b7280'}">${a.secondaryBias}</span>
          </div>
        </div>
        <p>${a.analysis}</p>
        <div style="margin-top: 12px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; font-size: 13px; color: #94a3b8;">
          <span style="font-weight: 600; color: #60a5fa;">Confidence:</span> ${Math.round(a.confidence * 100)}% • 
          <span style="font-weight: 600; color: #60a5fa;">Tone:</span> ${a.narrativeTone} • 
          <span style="font-weight: 600; color: #60a5fa;">Themes:</span> ${a.keyThemes.join(", ")}
        </div>
        ${a.cognitiveBiases.length > 0 ? `
          <div class="bias-list">
            <p style="color: #fbbf24; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">⚠️</span> Cognitive Biases (${a.cognitiveBiases.length})
            </p>
            ${a.cognitiveBiases.map((b) => `
              <div class="bias-item">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <strong style="color: #fbbf24;">${b.name}</strong>
                    ${severityBadge(b.severity)}
                  </div>
                  <p style="font-size: 13px; color: #94a3b8; margin: 0;">${b.description}</p>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}
        ${a.logicalFallacies.length > 0 ? `
          <div class="bias-list">
            <p style="color: #f87171; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🚨</span> Logical Fallacies (${a.logicalFallacies.length})
            </p>
            ${a.logicalFallacies.map((f) => `
              <div class="bias-item">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <strong style="color: #f87171;">${f.name}</strong>
                    ${severityBadge(f.severity)}
                  </div>
                  <p style="font-size: 13px; color: #94a3b8; margin: 0;">${f.description}</p>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}
        ${relatedArticle ? `
          <div class="article-analysis" style="border-color: ${biasColorMap[a.dominantBias] || '#6b7280'};">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">📰 Related Article</div>
            <div style="font-size: 16px; color: #e2e8f0; font-weight: 600; margin-bottom: 4px;">${relatedArticle.title}</div>
            <div style="font-size: 13px; color: #64748b;">${relatedArticle.source} • ${new Date(relatedArticle.publishedAt).toLocaleDateString()}</div>
          </div>
        ` : ""}
      </div>`;
    }).join("")}
  </div>
  ` : ""}

  <!-- Footer -->
  <div class="footer">
    <p class="footer-logo">⚖️ BiasMapper</p>
    <p style="margin-bottom: 8px;">Fair and Balanced Analysis Across Perspectives</p>
    <p style="font-size: 12px; color: #475569;">
      This report provides directional classification as a guide, not absolute truth. 
      Always review results in their full sociological context.
    </p>
    <p style="margin-top: 16px; font-size: 11px; color: #475569;">
      Generated by BiasMapper v2.0 • ${new Date().toLocaleString()}
    </p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 800);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function escapeCSV(value: string): string {
  if (!value) return '""';
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateStamp(): string {
  return new Date().toISOString().split("T")[0];
}
