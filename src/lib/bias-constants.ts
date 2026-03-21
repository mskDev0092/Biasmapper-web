/**
 * Shared Bias Constants
 * 
 * Centralizes all bias-related constants, colors, and labels
 * to ensure consistency across the application and reduce code duplication.
 */

// Bias code type for type safety
export type BiasCode = 
  | "L++" | "L+" | "L" 
  | "C" 
  | "R" | "R+" | "R++"
  | "T++" | "T+" | "T"
  | "B" | "B+" | "B++";

// Bias color mapping for consistent styling
export const BIAS_COLORS: Record<BiasCode, string> = {
  // Ideological Left (Progressive)
  "L++": "#dc2626", // Far Left - Red 600
  "L+": "#f87171",  // Progressive - Red 400
  "L": "#fca5a5",   // Left-leaning - Red 300
  
  // Center
  "C": "#6b7280",   // Center - Gray 500
  
  // Ideological Right (Conservative)
  "R": "#86efac",   // Right-leaning - Green 300
  "R+": "#4ade80",  // Conservative - Green 400
  "R++": "#16a34a", // Far Right - Green 600
  
  // Societal Establishment
  "T++": "#7c3aed", // Est. Extreme - Violet 600
  "T+": "#a78bfa",  // Mainstream - Violet 400
  "T": "#c4b5fd",   // Establishment - Violet 300
  
  // Societal Oppositional
  "B": "#fbbf24",   // Oppositional - Amber 400
  "B+": "#f59e0b",  // Grassroots - Amber 500
  "B++": "#d97706", // Radical - Amber 600
};

// Human-readable labels for bias codes
export const BIAS_LABELS: Record<BiasCode, string> = {
  // Ideological Left
  "L++": "Far Left",
  "L+": "Progressive",
  "L": "Left-leaning",
  
  // Center
  "C": "Center",
  
  // Ideological Right
  "R": "Right-leaning",
  "R+": "Conservative",
  "R++": "Far Right",
  
  // Societal Establishment
  "T++": "Est. Extreme",
  "T+": "Mainstream",
  "T": "Establishment",
  
  // Societal Oppositional
  "B": "Oppositional",
  "B+": "Grassroots",
  "B++": "Radical Dissent",
};

// Detailed bias definitions for educational purposes
export const BIAS_DEFINITIONS: Record<BiasCode, { 
  label: string; 
  description: string;
  color: string;
}> = {
  "L++": {
    label: "Far Left",
    description: "Radical progressive perspectives advocating for fundamental systemic change. Often anti-capitalist, advocating for complete economic restructuring.",
    color: "bg-red-500",
  },
  "L+": {
    label: "Progressive",
    description: "Center-left viewpoints supporting social reform, progressive policies, and government intervention for social equity.",
    color: "bg-red-400",
  },
  "L": {
    label: "Left-leaning",
    description: "Mild progressive tendencies, generally supportive of liberal social policies with moderate economic views.",
    color: "bg-red-300",
  },
  "C": {
    label: "Center",
    description: "Neutral or balanced perspectives that attempt to present multiple viewpoints without strong ideological leaning.",
    color: "bg-gray-400",
  },
  "R": {
    label: "Right-leaning",
    description: "Mild conservative tendencies, generally supportive of traditional values with moderate economic views.",
    color: "bg-blue-300",
  },
  "R+": {
    label: "Conservative",
    description: "Center-right viewpoints supporting traditional values, limited government, and free-market policies.",
    color: "bg-blue-400",
  },
  "R++": {
    label: "Far Right",
    description: "Radical conservative perspectives often nationalist in nature, advocating for significant traditionalist reforms.",
    color: "bg-blue-500",
  },
  "T++": {
    label: "Est. Extreme",
    description: "Complete alignment with institutional narratives and establishment viewpoints. Strong trust in official sources.",
    color: "bg-purple-500",
  },
  "T+": {
    label: "Mainstream",
    description: "General trust in establishment institutions and mainstream narratives. Accepts conventional wisdom.",
    color: "bg-purple-400",
  },
  "T": {
    label: "Establishment",
    description: "Moderate pro-institution stance. Generally accepts official narratives but maintains some skepticism.",
    color: "bg-purple-300",
  },
  "B": {
    label: "Oppositional",
    description: "Skeptical of institutions and official narratives. Questions conventional wisdom.",
    color: "bg-amber-300",
  },
  "B+": {
    label: "Grassroots",
    description: "Strong bottom-up perspective, amplifying marginalized voices. Anti-establishment orientation.",
    color: "bg-amber-400",
  },
  "B++": {
    label: "Radical Dissent",
    description: "Strongly anti-establishment, advocating for fundamental change to power structures. Deep institutional skepticism.",
    color: "bg-amber-500",
  },
};

// Array of all bias codes for iteration
export const ALL_BIAS_CODES: BiasCode[] = [
  "L++", "L+", "L", "C", "R", "R+", "R++",
  "T++", "T+", "T", "B", "B+", "B++",
];

// Ideological axis codes
export const IDEOLOGICAL_BIAS_CODES: BiasCode[] = [
  "L++", "L+", "L", "C", "R", "R+", "R++"
];

// Societal axis codes
export const SOCIETAL_BIAS_CODES: BiasCode[] = [
  "T++", "T+", "T", "B", "B+", "B++"
];

// Helper function to validate bias code
export function isValidBiasCode(code: string): code is BiasCode {
  return code in BIAS_COLORS;
}

// Helper function to get bias color with fallback
export function getBiasColor(code: string | undefined | null): string {
  if (!code || !isValidBiasCode(code)) {
    return "#6b7280"; // Default gray
  }
  return BIAS_COLORS[code];
}

// Helper function to get bias label with fallback
export function getBiasLabel(code: string | undefined | null): string {
  if (!code || !isValidBiasCode(code)) {
    return "Unknown";
  }
  return BIAS_LABELS[code];
}

// Bias options for select dropdowns
export const BIAS_SELECT_OPTIONS = [
  { value: "L++", label: "L++ — Far Left" },
  { value: "L+", label: "L+ — Progressive" },
  { value: "L", label: "L — Left-leaning" },
  { value: "C", label: "C — Center" },
  { value: "R", label: "R — Right-leaning" },
  { value: "R+", label: "R+ — Conservative" },
  { value: "R++", label: "R++ — Far Right" },
  { value: "T+", label: "T+ — Mainstream" },
  { value: "T++", label: "T++ — Establishment" },
  { value: "B+", label: "B+ — Grassroots" },
  { value: "B++", label: "B++ — Radical Dissent" },
];

// Format options for text generation
export const FORMAT_OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "article", label: "Article" },
  { value: "tweet", label: "Tweet / Short Post" },
  { value: "opinion piece", label: "Opinion Piece" },
  { value: "news headline", label: "News Headline" },
];

// Psychological indicator options
export const PSYCHOLOGICAL_INDICATORS = [
  "Emotional Framing",
  "Fear-mongering",
  "Appeal to Authority",
  "In-group Favoritism",
  "Scapegoating",
  "Urgency / Scarcity",
];

// Sociological indicator options
export const SOCIOLOGICAL_INDICATORS = [
  "Power Dynamics",
  "Marginalization",
  "Institutional Trust",
  "Group Identity",
  "Social Hierarchy",
  "Cultural Superiority",
];
