# AGENT.md - BiasMapper Development Guide

> **Purpose**: This document provides comprehensive context for AI agents working on the BiasMapper codebase. It contains architectural decisions, coding patterns, and development guidelines.

---

## 📋 Project Overview

**BiasMapper** is an AI-powered media bias analysis platform built with Next.js 16, TypeScript, and Tailwind CSS 4. The application analyzes text content for various forms of bias including ideological, societal, cognitive, and psychological indicators.

### Core Value Proposition
- Detect and classify media bias across multiple dimensions
- Support 25+ countries with regional news outlet profiles
- Privacy-first architecture with local API endpoint support
- Export capabilities in PDF, JSON, and CSV formats

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, routing, API routes |
| **Language** | TypeScript 5 | Type safety, developer experience |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first CSS, component library |
| **Database** | SQLite + Prisma ORM | Local persistence, type-safe queries |
| **AI SDK** | z-ai-web-dev-sdk | OpenAI-compatible API integration |
| **Charts** | Recharts | Data visualization |
| **State** | Zustand + React Query | Client state, server state caching |
| **Forms** | React Hook Form + Zod | Form handling, validation |

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page (marketing)
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles + Tailwind
│   ├── analyze/
│   │   └── page.tsx             # Main dashboard + analysis
│   ├── analyze-text/
│   │   └── page.tsx             # Single text analysis
│   ├── generate-text/
│   │   └── page.tsx             # Text generation with bias
│   ├── settings/
│   │   └── page.tsx             # API configuration
│   └── about/
│       └── page.tsx             # About page
│
├── components/
│   ├── ui/                      # shadcn/ui components (auto-generated)
│   ├── analyze/
│   │   ├── DashboardTab.tsx     # Dashboard with stats, charts, history
│   │   ├── AnalyzeTab.tsx       # Text input for analysis
│   │   ├── AnalyzeResultDisplay.tsx  # Analysis results display
│   │   ├── GenerateTab.tsx      # Text generation interface
│   │   ├── DebiasTab.tsx        # Bias adjustment interface
│   │   ├── NewsFeed.tsx         # News fetching and display
│   │   └── ThinkingProcess.tsx  # AI thinking animation
│   └── navigation.tsx           # Main navigation bar
│
├── lib/
│   ├── api-service.ts           # AI API integration functions
│   ├── api-config.ts            # API configuration management
│   ├── bias-constants.ts        # Bias codes, labels, indicators
│   ├── country-config.ts        # Country configurations (25+)
│   ├── export-utils.ts          # PDF/JSON/CSV export
│   ├── local-db.ts              # In-memory database with localStorage
│   ├── analysis-storage.ts      # Analysis state persistence
│   ├── news-service.ts          # News API integration
│   ├── lm-studio-service.ts     # LM-Studio specific functions
│   ├── rate-limiter.ts          # API rate limiting
│   ├── encryption-utils.ts      # Secure storage utilities
│   ├── service-detection.ts     # Auto-detect AI services
│   └── utils.ts                 # Utility functions
│
└── hooks/
    ├── use-mobile.ts            # Mobile detection hook
    └── use-toast.ts             # Toast notification hook
```

---

## 🎨 Design System

### Color Palette (Dark Theme)

The application uses a dark slate-based color scheme:

```css
/* Background colors */
--bg-primary: #0f172a;     /* slate-950 */
--bg-secondary: #1e293b;   /* slate-800 */
--bg-tertiary: #334155;    /* slate-700 */

/* Text colors */
--text-primary: #f8fafc;   /* slate-50 */
--text-secondary: #94a3b8; /* slate-400 */
--text-muted: #64748b;     /* slate-500 */

/* Accent colors */
--accent-blue: #3b82f6;
--accent-purple: #8b5cf6;
--accent-amber: #f59e0b;
--accent-emerald: #10b981;
```

### Bias Color Mapping

Defined in `src/lib/bias-constants.ts`:

```typescript
// Ideological (Left = Red spectrum)
L++: "#dc2626",  // Far Left - Red 600
L+:  "#f87171",  // Progressive - Red 400
L:   "#fca5a5",  // Left-leaning - Red 300

// Center
C:   "#6b7280",  // Gray 500

// Ideological (Right = Green spectrum)
R:   "#86efac",  // Right-leaning - Green 300
R+:  "#4ade80",  // Conservative - Green 400
R++: "#16a34a",  // Far Right - Green 600

// Societal (Establishment = Purple spectrum)
T++: "#7c3aed",  // Est. Extreme - Violet 600
T+:  "#a78bfa",  // Mainstream - Violet 400
T:   "#c4b5fd",  // Establishment - Violet 300

// Societal (Oppositional = Amber spectrum)
B:   "#fbbf24",  // Oppositional - Amber 400
B+:  "#f59e0b",  // Grassroots - Amber 500
B++: "#d97706",  // Radical - Amber 600
```

### Component Patterns

#### Card Component Pattern
```tsx
<Card className="bg-slate-900/50 border-slate-800">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
    <CardDescription className="text-slate-400">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Badge Component Pattern
```tsx
<Badge 
  variant="outline" 
  className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
>
  Status
</Badge>
```

#### Button Gradient Pattern
```tsx
<Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
  Action
</Button>
```

---

## 🧠 Key Business Logic

### Bias Classification System

The application uses a **dual-axis bias classification**:

1. **Ideological Axis** (Political Left-Right)
   - Range: L++ (Far Left) → C (Center) → R++ (Far Right)
   - Measures political/economic ideology

2. **Societal Axis** (Establishment-Oppositional)
   - Range: T++ (Est. Extreme) → B++ (Radical Dissent)
   - Measures trust in institutions and power structures

### Analysis Flow

```
User Input → API Service → AI Analysis → Result Storage → Display
     ↓            ↓             ↓              ↓            ↓
   Text      OpenAI API    Bias Codes    LocalStorage   Dashboard
   URL       LM-Studio     Confidence    DB (Prisma)    Charts
   News      Ollama        Indicators    Export         History
```

### API Service Functions

Located in `src/lib/api-service.ts`:

| Function | Purpose |
|----------|---------|
| `analyzeTextBias(text, source)` | Analyze single text for bias |
| `analyzeMultipleOutlets(outlets, progressCallback)` | Batch analyze outlets |
| `analyzeNarratives(outletData)` | Detect narrative patterns |
| `generateBiasedText(params)` | Generate text with specific bias |
| `debiasText(text, targetBias)` | Adjust text perspective |

### Country Configuration

Located in `src/lib/country-config.ts`:

Each country has:
- `code`: ISO country code (e.g., "pk", "us", "uk")
- `name`: Display name
- `flag`: Emoji flag
- `outlets`: Array of news outlet names
- `description`: Media landscape description
- `language`: Primary languages
- `region`: Geographic region

### Indicator Categories

Located in `src/lib/bias-constants.ts`:

1. **COGNITIVE_BIASES** (70+ items)
   - Decision-making biases
   - Social biases
   - Memory biases
   - Probability/belief biases

2. **LOGICAL_FALLACIES** (70+ items)
   - Relevance fallacies
   - Causal fallacies
   - Ambiguity fallacies
   - Presumption fallacies

3. **PSYCHOLOGICAL_INDICATORS** (50+ items)
   - Emotional manipulation
   - Persuasion techniques
   - Propaganda techniques

4. **SOCIOLOGICAL_INDICATORS** (70+ items)
   - Power dynamics
   - Group identity
   - Social stratification
   - Institutional dynamics

---

## 💾 Data Models

### Prisma Schema (simplified)

```prisma
model NewsArticle {
  id          String   @id @default(uuid())
  title       String
  description String?
  url         String   @unique
  source      String
  author      String?
  publishedAt String
  country     String
  category    String?
  imageUrl    String?
  analysisId  String?
  fetchedVia  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  analysis    AnalysisResult?
}

model AnalysisResult {
  id                    String   @id @default(uuid())
  articleId             String?
  source                String
  inputText             String
  dominantBias          String
  secondaryBias         String
  confidence            Float
  analysis              String
  keyThemes             String[]
  narrativeTone         String
  cognitiveBiases       Json
  logicalFallacies      Json
  psychologicalIndicators Json
  sociologicalIndicators  Json
  premises              String[]
  conclusions           String[]
  createdAt             DateTime @default(now())
  article               NewsArticle? @relation(fields: [articleId], references: [id])
}

model NarrativeSnapshot {
  id            String   @id @default(uuid())
  narratives    Json
  trendingTopics String[]
  biasTensions  String?
  createdAt     DateTime @default(now())
}
```

### Local Storage Keys

| Key | Purpose |
|-----|---------|
| `bm_api_config` | API endpoint and key |
| `bm_analysis_data` | Current analysis state |
| `bm_auto_operating` | Auto-operation flag |
| `bm_analysis_progress` | Analysis progress |
| `bm_selected_country` | Selected country code |
| `bm_db_*` | Local database tables |

---

## 🔧 Common Tasks

### Adding a New Country

1. Edit `src/lib/country-config.ts`
2. Add new country to `COUNTRIES` array:
```typescript
{
  code: "xx",
  name: "Country Name",
  flag: "🏳️",
  outlets: ["Outlet 1", "Outlet 2"],
  description: "Media landscape description",
  language: "en",
  region: "Region Name"
}
```

### Adding a New Bias Indicator

1. Edit `src/lib/bias-constants.ts`
2. Add to appropriate array (COGNITIVE_BIASES, LOGICAL_FALLACIES, etc.)
3. Update INDICATOR_GROUPS for UI display

### Modifying PDF Export

1. Edit `src/lib/export-utils.ts`
2. Modify `exportToPDF()` function
3. Update HTML template and CSS styles

### Adding New API Endpoint

1. Create `src/app/api/your-endpoint/route.ts`
2. Use `z-ai-web-dev-sdk` for AI integration:
```typescript
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [...],
  });
  return Response.json(completion);
}
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No AI Service Connected" | API not configured | Configure API in Settings |
| Analysis returns empty | Invalid API response | Check API endpoint and key |
| PDF export fails | Browser popup blocked | Allow popups for this site |
| Slow analysis | API rate limiting | Check rate limiter settings |

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('bm_debug', 'true');
```

### Reset Application State

```javascript
// Clear all local storage
Object.keys(localStorage)
  .filter(key => key.startsWith('bm_'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

---

## 📝 Code Style Guidelines

### TypeScript

- Use strict mode
- Prefer interfaces over types for objects
- Use type guards for runtime validation
- Document complex functions with JSDoc

### React

- Use function components with hooks
- Prefer composition over inheritance
- Use `useCallback` for event handlers
- Memoize expensive computations

### CSS

- Use Tailwind utility classes
- Follow mobile-first approach
- Use CSS variables for theming
- Avoid inline styles

### File Naming

- Components: PascalCase (e.g., `DashboardTab.tsx`)
- Utilities: camelCase (e.g., `api-service.ts`)
- Pages: lowercase (e.g., `page.tsx`)

---

## 🔒 Security Considerations

### API Key Storage

API keys are stored in localStorage with optional encryption:
- Located in `src/lib/encryption-utils.ts`
- Uses AES encryption when enabled
- Never logged or transmitted except to API endpoint

### Input Sanitization

All user inputs are:
- Trimmed of whitespace
- Validated with Zod schemas
- Sanitized for XSS prevention

### Rate Limiting

API calls are rate-limited:
- Located in `src/lib/rate-limiter.ts`
- Configurable intervals
- Automatic retry with backoff

---

## 📦 Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.x | Framework |
| `react` | 19.x | UI library |
| `typescript` | 5.x | Type system |
| `tailwindcss` | 4.x | Styling |
| `@prisma/client` | 6.x | Database ORM |
| `z-ai-web-dev-sdk` | 0.x | AI integration |
| `recharts` | 2.x | Charts |
| `zustand` | 5.x | State management |
| `react-hook-form` | 7.x | Forms |
| `zod` | 4.x | Validation |

### shadcn/ui Components Used

- Button, Card, Badge, Dialog, Tabs
- Select, Input, Textarea, Label
- ScrollArea, Progress, Alert
- Chart (custom recharts wrapper)

---

## 🚀 Deployment

### Production Build

```bash
bun run build
```

This creates:
- `.next/standalone/` - Standalone server
- `.next/static/` - Static assets
- Copies `public/` to standalone

### Docker Deployment

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build
EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL="file:./db/custom.db"
```

---

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Prisma](https://www.prisma.io/docs)
- [Recharts](https://recharts.org)

---

*Last updated: March 2026*
