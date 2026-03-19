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

// ─── JSON Export / Import ───────────────────────────────────────────

export interface FullExportData extends LocalDBExport {
  dashboardState?: {
    international: any[];
    pakistan: any[];
    narratives: any;
  };
}

export function exportToJSON(): void {
  const data: FullExportData = {
    ...exportAllData(),
    dashboardState: loadAnalysisData() || undefined,
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

// ─── PDF Export (HTML-based, comprehensive dashboard report) ────────

export function exportToPDF(options: {
  articles?: NewsArticle[];
  analyses?: AnalysisResult[];
  narrative?: NarrativeSnapshot;
  outletProfiles?: OutletProfile[];
  dashboardState?: { international: any[]; pakistan: any[]; narratives: any } | null;
  title?: string;
}): void {
  const { title = "BiasMapper Dashboard Report" } = options;

  // Gather comprehensive data
  const dashState = options.dashboardState || loadAnalysisData();
  const articles = options.articles || NewsArticlesDB.getRecent(30);
  const analyses = options.analyses || AnalysisResultsDB.getRecent(30);
  const narrative = options.narrative || NarrativeSnapshotsDB.getLatest();
  const outlets = options.outletProfiles || OutletProfilesDB.getAll();

  const international = dashState?.international || [];
  const pakistan = dashState?.pakistan || [];
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

  // Compute bias distribution for text-based chart
  function biasDistribution(outletList: any[]): string {
    const dist: Record<string, number> = {};
    outletList.forEach((o: any) => {
      dist[o.dominant_bias] = (dist[o.dominant_bias] || 0) + 1;
    });
    return Object.entries(dist)
      .map(([bias, count]) => {
        const pct = Math.round((count / outletList.length) * 100);
        const label = biasLabels[bias] || bias;
        const color = biasColorMap[bias] || "#6b7280";
        return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span class="badge" style="background: ${color}; min-width: 40px; text-align: center;">${bias}</span>
          <div style="flex: 1; background: #1e293b; border-radius: 4px; height: 20px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
          </div>
          <span style="font-size: 12px; color: #94a3b8; min-width: 60px;">${count} (${pct}%)</span>
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

  // Match articles to analyses for the "related" section
  const analysisMap = new Map<string, AnalysisResult>();
  analyses.forEach(a => { if (a.articleId) analysisMap.set(a.articleId, a); });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #334155; }
    .header h1 { font-size: 32px; color: #f8fafc; margin-bottom: 8px; }
    .header p { color: #94a3b8; font-size: 14px; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-card .value { font-size: 28px; font-weight: 700; color: #f8fafc; }
    .stat-card .label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .section { margin-bottom: 36px; page-break-inside: avoid; }
    .section h2 { font-size: 20px; color: #f1f5f9; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 8px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .card h3 { font-size: 15px; color: #f8fafc; margin-bottom: 8px; }
    .card p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: white; margin-right: 6px; }
    .badge-outline { background: transparent !important; border: 1px solid; }
    .meta { font-size: 12px; color: #64748b; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .outlet-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #1e293b; }
    .outlet-row:last-child { border-bottom: none; }
    .outlet-name { font-weight: 600; color: #f8fafc; font-size: 14px; }
    .outlet-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .conf-bar { width: 60px; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-left: 8px; }
    .conf-fill { height: 100%; border-radius: 3px; }
    .narrative-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
    .narrative-meta { display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
    .narrative-meta .label { font-size: 11px; color: #64748b; margin-right: 4px; }
    .article-analysis { background: #1a2332; border-left: 3px solid; padding: 12px 16px; margin-top: 8px; border-radius: 0 8px 8px 0; }
    .bias-list { margin-top: 8px; }
    .bias-item { font-size: 12px; color: #cbd5e1; padding: 4px 0; border-bottom: 1px solid #1e293b; }
    .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 2px solid #334155; color: #475569; font-size: 12px; }
    @media print {
      body { background: white; color: #1e293b; padding: 20px; }
      .card, .stat-card, .narrative-card { border-color: #e2e8f0; background: #f8fafc; }
      .card h3, .outlet-name, .stat-card .value { color: #1e293b; }
      .card p, .outlet-desc, .stat-card .label { color: #475569; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚖️ ${title}</h1>
    <p>Generated on ${new Date().toLocaleString()} • BiasMapper Comprehensive Report</p>
  </div>

  <!-- Stats Summary -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="value">${international.length}</div>
      <div class="label">International Outlets</div>
    </div>
    <div class="stat-card">
      <div class="value">${pakistan.length}</div>
      <div class="label">Pakistan Outlets</div>
    </div>
    <div class="stat-card">
      <div class="value">${articles.length}</div>
      <div class="label">News Articles</div>
    </div>
    <div class="stat-card">
      <div class="value">${analyses.length}</div>
      <div class="label">Analyses</div>
    </div>
  </div>

  ${international.length > 0 ? `
  <!-- International Bias Distribution -->
  <div class="section">
    <h2>🌍 International Media Bias Distribution</h2>
    <div class="card">
      ${biasDistribution(international)}
    </div>
    <div class="card" style="margin-top: 12px;">
      <h3>Outlet Breakdown</h3>
      ${international.map((o: any) => `
        <div class="outlet-row">
          <div>
            <div class="outlet-name">${o.outlet}</div>
            <div class="outlet-desc">${o.analysis}</div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <span class="badge" style="background: ${biasColorMap[o.dominant_bias] || "#6b7280"}">${o.dominant_bias}</span>
            <span class="badge badge-outline" style="border-color: ${biasColorMap[o.secondary_bias] || "#6b7280"}; color: ${biasColorMap[o.secondary_bias] || "#6b7280"}">${o.secondary_bias}</span>
            <span style="font-size: 11px; color: #94a3b8;">${Math.round(o.confidence * 100)}%</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${pakistan.length > 0 ? `
  <!-- Pakistan Bias Distribution -->
  <div class="section">
    <h2>🇵🇰 Pakistan Media Bias Distribution</h2>
    <div class="card">
      ${biasDistribution(pakistan)}
    </div>
    <div class="card" style="margin-top: 12px;">
      <h3>Outlet Breakdown</h3>
      ${pakistan.map((o: any) => `
        <div class="outlet-row">
          <div>
            <div class="outlet-name">${o.outlet}</div>
            <div class="outlet-desc">${o.analysis}</div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <span class="badge" style="background: ${biasColorMap[o.dominant_bias] || "#6b7280"}">${o.dominant_bias}</span>
            <span class="badge badge-outline" style="border-color: ${biasColorMap[o.secondary_bias] || "#6b7280"}; color: ${biasColorMap[o.secondary_bias] || "#6b7280"}">${o.secondary_bias}</span>
            <span style="font-size: 11px; color: #94a3b8;">${Math.round(o.confidence * 100)}%</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${narrativeData?.narratives?.length > 0 ? `
  <!-- Detected Narratives -->
  <div class="section">
    <h2>🔍 Detected Narratives</h2>
    <div class="grid">
      ${narrativeData.narratives.map((n: any) => `
        <div class="narrative-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3>${n.title}</h3>
            <span class="badge" style="background: ${n.intensity === "high" ? "#dc2626" : n.intensity === "medium" ? "#f59e0b" : "#6b7280"}">${n.intensity}</span>
          </div>
          <p>${n.description}</p>
          <div class="narrative-meta">
            <div>
              <span class="label">Promoted by:</span>
              <span class="badge" style="background: ${biasColorMap[normalizeBias(n.promoted_by)] || "#6b7280"}">${normalizeBias(n.promoted_by)}</span>
            </div>
            <div>
              <span class="label">Opposed by:</span>
              <span class="badge badge-outline" style="border-color: ${biasColorMap[normalizeBias(n.opposed_by)] || "#6b7280"}; color: ${biasColorMap[normalizeBias(n.opposed_by)] || "#94a3b8"}">${normalizeBias(n.opposed_by)}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
    ${narrativeData.trending_topics?.length > 0 ? `
      <div class="card" style="margin-top: 12px;">
        <h3>📈 Trending Topics</h3>
        <p>${narrativeData.trending_topics.join(" • ")}</p>
        ${narrativeData.bias_tensions ? `<p style="margin-top: 8px;">${narrativeData.bias_tensions}</p>` : ""}
      </div>
    ` : ""}
  </div>
  ` : ""}

  ${narrative ? `
  <div class="section">
    <h2>🗂️ Narrative Snapshot (LocalDB)</h2>
    <div class="grid">
      ${narrative.narratives.map((n) => `
        <div class="narrative-card">
          <h3>${n.title}</h3>
          <p>${n.description}</p>
          <div class="narrative-meta">
            <div>
              <span class="label">Promoted:</span>
              <span class="badge" style="background: ${biasColorMap[n.promotedBy] || "#6b7280"}">${n.promotedBy}</span>
            </div>
            <div>
              <span class="label">Opposed:</span>
              <span class="badge badge-outline" style="border-color: ${biasColorMap[n.opposedBy] || "#6b7280"}; color: ${biasColorMap[n.opposedBy] || "#94a3b8"}">${n.opposedBy}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${analyses.length > 0 ? `
  <div class="section">
    <h2>🧠 Analysis Results (${analyses.length})</h2>
    ${analyses.map((a) => {
      // Find related article
      const relatedArticle = a.articleId ? articles.find(art => art.id === a.articleId) : null;
      return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3>${a.inputText.substring(0, 100)}${a.inputText.length > 100 ? "..." : ""}</h3>
          <div>
            <span class="badge" style="background: ${biasColorMap[a.dominantBias] || "#6b7280"}">${a.dominantBias}</span>
            <span class="badge badge-outline" style="border-color: ${biasColorMap[a.secondaryBias] || "#6b7280"}; color: ${biasColorMap[a.secondaryBias] || "#6b7280"}">${a.secondaryBias}</span>
          </div>
        </div>
        <p>${a.analysis}</p>
        <div class="meta">Confidence: ${Math.round(a.confidence * 100)}% • Tone: ${a.narrativeTone} • Themes: ${a.keyThemes.join(", ")}</div>
        ${a.cognitiveBiases.length > 0 ? `
          <div class="bias-list">
            <p style="color: #fbbf24; font-size: 12px; font-weight: 600; margin-top: 10px;">⚠️ Cognitive Biases:</p>
            ${a.cognitiveBiases.map((b) => `<div class="bias-item">• ${b.name} <span class="badge" style="background: ${b.severity === "high" ? "#dc2626" : b.severity === "medium" ? "#f59e0b" : "#6b7280"}; font-size: 10px;">${b.severity}</span> — ${b.description}</div>`).join("")}
          </div>
        ` : ""}
        ${a.logicalFallacies.length > 0 ? `
          <div class="bias-list">
            <p style="color: #f87171; font-size: 12px; font-weight: 600; margin-top: 10px;">🚨 Logical Fallacies:</p>
            ${a.logicalFallacies.map((f) => `<div class="bias-item">• ${f.name} <span class="badge" style="background: ${f.severity === "high" ? "#dc2626" : f.severity === "medium" ? "#f59e0b" : "#6b7280"}; font-size: 10px;">${f.severity}</span> — ${f.description}</div>`).join("")}
          </div>
        ` : ""}
        ${relatedArticle ? `
          <div class="article-analysis" style="border-color: ${biasColorMap[a.dominantBias] || "#6b7280"};">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">📰 Related Article</div>
            <div style="font-size: 13px; color: #e2e8f0; font-weight: 500;">${relatedArticle.title}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${relatedArticle.source} • ${new Date(relatedArticle.publishedAt).toLocaleDateString()}</div>
          </div>
        ` : ""}
      </div>`;
    }).join("")}
  </div>
  ` : ""}

  ${articles.length > 0 ? `
  <div class="section">
    <h2>📰 News Articles (${articles.length})</h2>
    ${articles.slice(0, 30).map((a) => {
      const matchedAnalysis = analysisMap.get(a.id);
      return `
      <div class="card">
        <h3>${a.title}</h3>
        <p>${a.description || ""}</p>
        <div class="meta">${a.source} • ${new Date(a.publishedAt).toLocaleString()} • ${a.country.toUpperCase()} • Fetched via: ${a.fetchedVia}</div>
        ${matchedAnalysis ? `
          <div class="article-analysis" style="border-color: ${biasColorMap[matchedAnalysis.dominantBias] || "#6b7280"};">
            <div style="display: flex; gap: 6px; margin-bottom: 6px;">
              <span class="badge" style="background: ${biasColorMap[matchedAnalysis.dominantBias] || "#6b7280"}">${matchedAnalysis.dominantBias}</span>
              <span style="font-size: 11px; color: #94a3b8;">Confidence: ${Math.round(matchedAnalysis.confidence * 100)}%</span>
            </div>
            <p style="font-size: 12px;">${matchedAnalysis.analysis.substring(0, 200)}${matchedAnalysis.analysis.length > 200 ? "..." : ""}</p>
          </div>
        ` : ""}
      </div>`;
    }).join("")}
  </div>
  ` : ""}

  <div class="footer">
    <p>⚖️ BiasMapper • Fair and Balanced Analysis Across Perspectives</p>
    <p style="margin-top: 4px;">This report provides directional classification as a guide, not absolute truth. Always review in context.</p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 600);
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
