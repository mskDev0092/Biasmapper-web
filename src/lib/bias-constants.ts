/**
 * Shared Bias Constants
 * 
 * Centralizes all bias-related constants, colors, labels, and indicators
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

// ═══════════════════════════════════════════════════════════════════════
// COGNITIVE BIASES - Comprehensive List
// ═══════════════════════════════════════════════════════════════════════

export const COGNITIVE_BIASES = [
  // Decision-making biases
  "Anchoring Bias",
  "Availability Heuristic",
  "Confirmation Bias",
  "Framing Effect",
  "Hindsight Bias",
  "Optimism Bias",
  "Pessimism Bias",
  "Sunk Cost Fallacy",
  "Status Quo Bias",
  "Decoy Effect",
  "Choice Overload",
  "Default Effect",
  "Loss Aversion",
  "Risk Compensation",
  "Zero-risk Bias",
  
  // Social biases
  "In-group Bias",
  "Out-group Homogeneity Bias",
  "Attribution Bias",
  "Self-serving Bias",
  "Actor-Observer Bias",
  "Fundamental Attribution Error",
  "Ultimate Attribution Error",
  "Halo Effect",
  "Horn Effect",
  "Cheerleader Effect",
  "Implicit Stereotype",
  "Just-world Hypothesis",
  
  // Memory biases
  "Misinformation Effect",
  "False Memory",
  "Source Amnesia",
  "Peak-end Rule",
  "Recency Bias",
  "Primacy Effect",
  "Rosy Retrospection",
  "Telescoping Effect",
  "Consistency Bias",
  
  // Probability/belief biases
  "Gambler's Fallacy",
  "Base Rate Fallacy",
  "Conjunction Fallacy",
  "Clustering Illusion",
  "Illusory Correlation",
  "Apophenia",
  "Pareidolia",
  "Illusion of Control",
  "Dunning-Kruger Effect",
  "Imposter Syndrome",
  "Barnum Effect",
  "Subjective Validation",
  "Survivorship Bias",
  "Sampling Bias",
  "Selection Bias",
  
  // Other cognitive biases
  "Negativity Bias",
  "Positivity Bias",
  "Neglect of Probability",
  "Attentional Bias",
  "Frequency Illusion",
  "Baader-Meinhof Phenomenon",
  "Spotlight Effect",
  "Curse of Knowledge",
  "Pro-innovation Bias",
  "Semmelweis Reflex",
  "System Justification",
  "Backfire Effect",
  "Continued Influence Effect",
  "Belief Bias",
  "Belief Perseverance",
];

// ═══════════════════════════════════════════════════════════════════════
// LOGICAL FALLACIES - Comprehensive List
// ═══════════════════════════════════════════════════════════════════════

export const LOGICAL_FALLACIES = [
  // Relevance fallacies
  "Ad Hominem",
  "Ad Hominem Tu Quoque",
  "Appeal to Authority",
  "Appeal to Consequences",
  "Appeal to Emotion",
  "Appeal to Fear",
  "Appeal to Flattery",
  "Appeal to Novelty",
  "Appeal to Pity",
  "Appeal to Popularity",
  "Appeal to Tradition",
  "Appeal to Nature",
  "Appeal to Wealth",
  "Appeal to Poverty",
  "Appeal to Spite",
  "Appeal to Ridicule",
  "Appeal to Celebrity",
  "Genetic Fallacy",
  "Red Herring",
  "Straw Man",
  "Gish Gallop",
  "Cherry Picking",
  "Texas Sharpshooter",
  "Poisoning the Well",
  "Tu Quoque",
  "Two Wrongs Make a Right",
  
  // Causal fallacies
  "Post Hoc Ergo Propter Hoc",
  "Cum Hoc Ergo Propter Hoc",
  "False Cause",
  "Slippery Slope",
  "Wrong Direction",
  "Regression Fallacy",
  "Third Cause Fallacy",
  "Circular Reasoning",
  "Begging the Question",
  "Fallacy of the Single Cause",
  
  // Ambiguity fallacies
  "Equivocation",
  "Amphiboly",
  "Accent Fallacy",
  "Quoting Out of Context",
  "Scope Fallacy",
  
  // Presumption fallacies
  "False Dilemma",
  "False Dichotomy",
  "Bifurcation",
  "Complex Question",
  "Loaded Question",
  "Leading Question",
  "No True Scotsman",
  "Appeal to Ignorance",
  "Hasty Generalization",
  "Sweeping Generalization",
  "Fallacy of Composition",
  "Fallacy of Division",
  "Spotlight Fallacy",
  "Anecdotal Evidence",
  "Middle Ground",
  "False Equivalence",
  "False Balance",
  "Moral Equivalence",
  
  // Formal fallacies
  "Affirming the Consequent",
  "Denying the Antecedent",
  "Illicit Major",
  "Illicit Minor",
  "Undistributed Middle",
  "Existential Fallacy",
  
  // Other fallacies
  "Naturalistic Fallacy",
  "Moralistic Fallacy",
  "Nirvana Fallacy",
  "Perfect Solution Fallacy",
  "Is-Ought Problem",
  "Appeal to Definition",
  "Equivocation",
  "Etymological Fallacy",
  "Moving the Goalposts",
  "Special Pleading",
  "Ad Lapidem",
  "Argument from Incredulity",
  "Argument from Silence",
  "Argumentum ad Populum",
  "Bandwagon Fallacy",
  "Category Mistake",
  "Continuum Fallacy",
  "Fallacy of Relative Privation",
  "Sentential Fallacy",
  "Suppressed Correlative",
];

// ═══════════════════════════════════════════════════════════════════════
// PSYCHOLOGICAL INDICATORS - Comprehensive List
// ═══════════════════════════════════════════════════════════════════════

export const PSYCHOLOGICAL_INDICATORS = [
  // Emotional manipulation
  "Emotional Framing",
  "Fear-mongering",
  "Anger Induction",
  "Disgust Appeals",
  "Sadness Exploitation",
  "Hope Manipulation",
  "Pride Appeals",
  "Guilt Tripping",
  "Shame Tactics",
  "Outrage Manufacturing",
  "Moral Panic",
  "Victim Narratives",
  
  // Persuasion techniques
  "Appeal to Authority",
  "Social Proof",
  "Scarcity Tactics",
  "Urgency Creation",
  "Reciprocity Triggers",
  "Commitment Escalation",
  "Liking/Attractiveness Bias",
  "Authority Positioning",
  
  // Cognitive manipulation
  "Framing Effect",
  "Priming",
  "Anchoring",
  "Decoy Effect",
  "Nudge Tactics",
  "Default Bias Exploitation",
  
  // In-group/Out-group dynamics
  "In-group Favoritism",
  "Out-group Derogation",
  "Othering",
  "Dehumanization",
  "Scapegoating",
  "Enemy Creation",
  "Tribalism",
  "Polarization Tactics",
  "Identity Politics",
  
  // Cognitive dissonance
  "Dissonance Exploitation",
  "Selective Exposure",
  "Confirmation Seeking",
  "Belief Reinforcement",
  
  // Propaganda techniques
  "Bandwagon Effect",
  "Card Stacking",
  "Glittering Generalities",
  "Name Calling",
  "Plain Folks Appeal",
  "Transfer Technique",
  "Testimonial Manipulation",
  "Euphemism Usage",
  "Doublespeak",
  "Thought-terminating Clichés",
  
  // Psychological warfare
  "Gaslighting",
  "Projection",
  "DARVO (Deny, Attack, Reverse)",
  "Love Bombing",
  "Intermittent Reinforcement",
  "Trauma Bonding",
  "Learned Helplessness",
  "Stockholm Syndrome Exploitation",
  
  // Influence techniques
  "Foot-in-the-door",
  "Door-in-the-face",
  "Low-ball Technique",
  "That's-not-all Technique",
  "Pique Technique",
  
  // Manipulative rhetoric
  "False Consensus Effect",
  "Illusion of Unanimity",
  "Manufacturing Consent",
  "Astroturfing",
  "Concern Trolling",
  "Sealioning",
];

// ═══════════════════════════════════════════════════════════════════════
// SOCIOLOGICAL INDICATORS - Comprehensive List
// ═══════════════════════════════════════════════════════════════════════

export const SOCIOLOGICAL_INDICATORS = [
  // Power dynamics
  "Power Dynamics",
  "Authority Structures",
  "Hierarchical Positioning",
  "Elite Narratives",
  "Counter-elite Framing",
  "Class Conflict Framing",
  "Privilege Discourse",
  "Oppression Narratives",
  "Liberation Rhetoric",
  
  // Group identity
  "Group Identity",
  "Collective Identity",
  "National Identity",
  "Ethnic Identity",
  "Religious Identity",
  "Political Identity",
  "Cultural Identity",
  "Professional Identity",
  "Generational Identity",
  
  // Social stratification
  "Social Hierarchy",
  "Social Stratification",
  "Class Positioning",
  "Socioeconomic Framing",
  "Elite vs Mass Framing",
  "Urban vs Rural Divide",
  "Educational Stratification",
  
  // Institutional dynamics
  "Institutional Trust",
  "Anti-institutional Sentiment",
  "Systemic Critique",
  "Institutional Criticism",
  "Establishment Alignment",
  "Anti-establishment Framing",
  
  // Marginalization
  "Marginalization",
  "Exclusion Narratives",
  "Inclusion Rhetoric",
  "Voice Amplification",
  "Silencing Tactics",
  "Representation Issues",
  "Tokenism",
  "Erasure",
  
  // Cultural dynamics
  "Cultural Superiority",
  "Cultural Relativism",
  "Cultural Imperialism",
  "Multiculturalism",
  "Assimilation Pressures",
  "Cultural Appropriation",
  "Cultural Defense",
  "Traditional Values",
  "Progressive Values",
  
  // Conflict dynamics
  "Inter-group Conflict",
  "Social Tension",
  "Polarization",
  "Division Sowing",
  "Unity Framing",
  "Reconciliation Rhetoric",
  "Conflict Escalation",
  "Conflict Resolution",
  
  // Movement dynamics
  "Social Movement Framing",
  "Activism Positioning",
  "Grassroots Organizing",
  "Elite Capture",
  "Co-optation",
  "Counter-movement",
  
  // Discourse analysis
  "Discourse Framing",
  "Narrative Construction",
  "Agenda Setting",
  "Issue Framing",
  "Problem Definition",
  "Solution Framing",
  
  // Media sociology
  "Media Framing",
  "Gatekeeping",
  "News Values",
  "Media Bias",
  "Information Control",
  "Propaganda Analysis",
  "Manufacturing Consent",
  
  // Economic sociology
  "Economic Inequality",
  "Wealth Distribution",
  "Labor vs Capital",
  "Consumer Culture",
  "Commodification",
  "Market Fundamentalism",
  "Anti-capitalism",
  
  // Political sociology
  "Political Polarization",
  "Partisan Framing",
  "Electoral Dynamics",
  "Political Participation",
  "Civic Engagement",
  "Democratic Values",
  "Authoritarian Appeals",
  
  // Global sociology
  "Globalization",
  "Nationalism",
  "Cosmopolitanism",
  "Global vs Local",
  "Transnational Dynamics",
  "Post-colonial Framing",
  "Imperial Narratives",
];

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

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
  { value: "essay", label: "Essay" },
  { value: "report", label: "Report" },
  { value: "analysis", label: "Analysis" },
  { value: "editorial", label: "Editorial" },
  { value: "speech", label: "Speech" },
];

// Grouped indicators for UI
export const INDICATOR_GROUPS = {
  cognitive_biases: {
    label: "Cognitive Biases",
    description: "Mental shortcuts and errors in thinking",
    items: COGNITIVE_BIASES.slice(0, 20), // Top 20 for selection
  },
  logical_fallacies: {
    label: "Logical Fallacies",
    description: "Errors in reasoning and argumentation",
    items: LOGICAL_FALLACIES.slice(0, 20), // Top 20 for selection
  },
  psychological: {
    label: "Psychological Indicators",
    description: "Emotional manipulation and persuasion techniques",
    items: PSYCHOLOGICAL_INDICATORS.slice(0, 15), // Top 15 for selection
  },
  sociological: {
    label: "Sociological Indicators",
    description: "Social dynamics and group structures",
    items: SOCIOLOGICAL_INDICATORS.slice(0, 15), // Top 15 for selection
  },
};
