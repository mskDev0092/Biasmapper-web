/**
 * Data Export Utilities
 *
 * Export analysis results, news articles, and narratives
 * to PDF, JSON, and CSV formats.
 */

import {
  exportAllData,
  importAllData,
  type LocalDBExport,
  type NewsArticle,
  type AnalysisResult,
  type NarrativeSnapshot,
} from "./local-db";

// ─── JSON Export / Import ───────────────────────────────────────────

export function exportToJSON(): void {
  const data = exportAllData();
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, "biasmapper-export.json", "application/json");
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
  downloadFile(csv, "biasmapper-articles.csv", "text/csv");
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
  downloadFile(csv, "biasmapper-analyses.csv", "text/csv");
}

// ─── PDF Export (HTML-based, no external lib) ───────────────────────

export function exportToPDF(options: {
  articles?: NewsArticle[];
  analyses?: AnalysisResult[];
  narrative?: NarrativeSnapshot;
  title?: string;
}): void {
  const { articles = [], analyses = [], narrative, title = "BiasMapper Report" } = options;

  const biasColorMap: Record<string, string> = {
    "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
    C: "#6b7280",
    R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
    "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
    B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .header h1 { font-size: 28px; color: #f8fafc; margin-bottom: 8px; }
    .header p { color: #94a3b8; font-size: 14px; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 20px; color: #f1f5f9; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .card h3 { font-size: 15px; color: #f8fafc; margin-bottom: 8px; }
    .card p { font-size: 13px; color: #94a3b8; line-height: 1.5; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: white; margin-right: 6px; }
    .meta { font-size: 12px; color: #64748b; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .bias-list { margin-top: 8px; }
    .bias-item { font-size: 12px; color: #cbd5e1; padding: 4px 0; border-bottom: 1px solid #1e293b; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #334155; color: #475569; font-size: 12px; }
    @media print { body { background: white; color: #1e293b; } .card { border-color: #e2e8f0; background: #f8fafc; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚖️ ${title}</h1>
    <p>Generated on ${new Date().toLocaleString()} • BiasMapper Analysis Report</p>
  </div>

  ${narrative ? `
  <div class="section">
    <h2>🔍 Detected Narratives</h2>
    <div class="grid">
      ${narrative.narratives.map((n) => `
        <div class="card">
          <h3>${n.title}</h3>
          <p>${n.description}</p>
          <div style="margin-top: 8px;">
            <span class="badge" style="background: ${biasColorMap[n.promotedBy] || "#6b7280"}">Promoted: ${n.promotedBy}</span>
            <span class="badge" style="background: ${biasColorMap[n.opposedBy] || "#6b7280"}">Opposed: ${n.opposedBy}</span>
            <span class="badge" style="background: ${n.intensity === "high" ? "#dc2626" : n.intensity === "medium" ? "#f59e0b" : "#6b7280"}">${n.intensity}</span>
          </div>
        </div>
      `).join("")}
    </div>
    ${narrative.trendingTopics.length > 0 ? `
      <div class="card">
        <h3>📈 Trending Topics</h3>
        <p>${narrative.trendingTopics.join(" • ")}</p>
        <p style="margin-top: 8px;">${narrative.biasTensions}</p>
      </div>
    ` : ""}
  </div>
  ` : ""}

  ${analyses.length > 0 ? `
  <div class="section">
    <h2>🧠 Analysis Results (${analyses.length})</h2>
    ${analyses.map((a) => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3>${a.inputText.substring(0, 80)}${a.inputText.length > 80 ? "..." : ""}</h3>
          <div>
            <span class="badge" style="background: ${biasColorMap[a.dominantBias] || "#6b7280"}">${a.dominantBias}</span>
            <span class="badge" style="background: transparent; border: 1px solid ${biasColorMap[a.secondaryBias] || "#6b7280"}; color: ${biasColorMap[a.secondaryBias] || "#6b7280"}">${a.secondaryBias}</span>
          </div>
        </div>
        <p>${a.analysis}</p>
        <div class="meta">Confidence: ${Math.round(a.confidence * 100)}% • Themes: ${a.keyThemes.join(", ")}</div>
        ${a.cognitiveBiases.length > 0 ? `
          <div class="bias-list">
            <p style="color: #fbbf24; font-size: 12px; font-weight: 600; margin-top: 8px;">⚠️ Cognitive Biases:</p>
            ${a.cognitiveBiases.map((b) => `<div class="bias-item">${b.name} (${b.severity}) — ${b.description}</div>`).join("")}
          </div>
        ` : ""}
        ${a.logicalFallacies.length > 0 ? `
          <div class="bias-list">
            <p style="color: #f87171; font-size: 12px; font-weight: 600; margin-top: 8px;">🚨 Logical Fallacies:</p>
            ${a.logicalFallacies.map((f) => `<div class="bias-item">${f.name} (${f.severity}) — ${f.description}</div>`).join("")}
          </div>
        ` : ""}
      </div>
    `).join("")}
  </div>
  ` : ""}

  ${articles.length > 0 ? `
  <div class="section">
    <h2>📰 News Articles (${articles.length})</h2>
    ${articles.map((a) => `
      <div class="card">
        <h3>${a.title}</h3>
        <p>${a.description || ""}</p>
        <div class="meta">${a.source} • ${new Date(a.publishedAt).toLocaleString()} • ${a.country.toUpperCase()}</div>
      </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="footer">
    <p>BiasMapper • Fair and Balanced Analysis Across Perspectives</p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto-trigger print dialog after a brief delay
    setTimeout(() => printWindow.print(), 500);
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
