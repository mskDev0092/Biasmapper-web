"use client";

import React from "react";
import { COUNTRIES } from "@/lib/country-config";

interface WorldMapProps {
  accepters?: string[];
  opposers?: string[];
  width?: number;
  height?: number;
}

interface Point { code: string; name: string; x: number; y: number; relation: "friend" | "foe" | "neutral" }

const REL_COLORS = {
  friend: "#22c55e",
  foe: "#f87171",
  neutral: "#64748b",
} as const;

const COORDS: Record<string, { x: number; y: number }> = {
  // Major countries
  us: { x: 120, y: 100 },
  ca: { x: 90, y: 80 },
  mx: { x: 110, y: 130 },
  gb: { x: 220, y: 55 },
  de: { x: 230, y: 85 },
  fr: { x: 220, y: 85 },
  it: { x: 240, y: 90 },
  es: { x: 205, y: 95 },
  pl: { x: 260, y: 70 },
  nl: { x: 230, y: 70 },
  ru: { x: 320, y: 50 },
  cn: { x: 400, y: 95 },
  jp: { x: 480, y: 90 },
  kr: { x: 500, y: 95 },
  in: { x: 360, y: 140 },
  pk: { x: 350, y: 130 },
  au: { x: 490, y: 180 },
  br: { x: 90, y: 170 },
  za: { x: 140, y: 210 },
  ng: { x: 130, y: 200 },
  id: { x: 430, y: 175 },
  tr: { x: 300, y: 110 },
  ae: { x: 340, y: 140 },
  eg: { x: 330, y: 130 },
  il: { x: 320, y: 120 },
  ir: { x: 330, y: 115 },
  sa: { x: 310, y: 130 },
  ua: { x: 290, y: 70 },
  // Additional for entity matching
  qa: { x: 350, y: 145 },
  gr: { x: 270, y: 100 },
  va: { x: 250, y: 95 },
  rs: { x: 280, y: 85 },
};

function getCoordsFor(code: string): { x: number; y: number } {
  return COORDS[code] ?? { x: 200, y: 100 };
}

export function WorldMap({ accepters = [], opposers = [], width = 600, height = 300 }: WorldMapProps) {
  const points: Point[] = COUNTRIES.map((c) => {
    const { x, y } = getCoordsFor(c.code);
    const rel = accepters.includes(c.code) ? "friend" : opposers.includes(c.code) ? "foe" : "neutral";
    return { code: c.code, name: c.name, x, y, relation: rel };
  });

  const acceptCount = accepters.length;
  const opposeCount = opposers.length;
  const neutralCount = COUNTRIES.length - acceptCount - opposeCount;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REL_COLORS.friend }} />
          <span className="text-emerald-400 font-medium">Accepters: {acceptCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REL_COLORS.foe }} />
          <span className="text-red-400 font-medium">Opposers: {opposeCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REL_COLORS.neutral }} />
          <span className="text-slate-400 font-medium">Neutral: {neutralCount}</span>
        </div>
      </div>
      <svg viewBox="0 0 600 300" width="100%" height={height} role="img" aria-label="World map showing country relations">
        <rect x="0" y="0" width="600" height="300" fill="#0f172a" rx="8" />
        <text x="10" y="20" fill="#94a3b8" fontSize="10" fontWeight="600">Global Relations Map</text>
        {points.map((p) => (
          <g key={p.code}>
            <circle cx={p.x} cy={p.y} r={6} fill={REL_COLORS[p.relation]} stroke="white" strokeWidth={1.5}>
              <title>{`${p.name} (${p.code}) — ${p.relation}`}</title>
            </circle>
            {p.x > 50 && p.x < 550 && p.y > 25 && p.y < 275 && (
              <text x={p.x} y={p.y - 10} fill="#cbd5e1" fontSize="7" textAnchor="middle" fontWeight="500">
                {p.code.toUpperCase()}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}