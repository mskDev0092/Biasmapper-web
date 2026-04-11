# BiasMapper

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**AI-Powered Media Bias Analysis Platform**

_Uncover hidden bias in any text — Detect ideological, societal, and cognitive biases using advanced NLP_

[🚀 Quick Start](#-quick-start) · [📖 Documentation](#-documentation) · [🎯 Features](#-features) · [⚙️ Configuration](#️-configuration)

</div>

---

## 📋 Overview

BiasMapper is a sophisticated web application designed to help journalists, researchers, educators, and critical thinkers analyze media content for various forms of bias. Using AI-powered natural language processing, it detects and classifies:

- **Ideological Bias**: Political leanings from Far Left (L++) to Far Right (R++)
- **Societal Bias**: Establishment (T++) to Oppositional (B++) positioning
- **Cognitive Biases**: 70+ cognitive distortions including confirmation bias, anchoring, and availability heuristic
- **Logical Fallacies**: 70+ reasoning errors including ad hominem, straw man, and false dichotomy
- **Psychological Indicators**: Emotional manipulation, persuasion techniques, and propaganda tactics
- **Sociological Indicators**: Power dynamics, group identity, and social stratification patterns

---

## 🎯 Features

### Core Analysis Capabilities

| Feature                                 | Description                                                      |
| --------------------------------------- | ---------------------------------------------------------------- |
| 🔍 **Multi-Dimensional Bias Detection** | Analyze text across ideological and societal axes simultaneously |
| 🌍 **Multi-Country Support**            | 25+ countries with regional news outlet profiles                 |
| 🧠 **Cognitive Bias Analysis**          | Detect 70+ cognitive biases with severity ratings                |
| 📊 **Logical Fallacy Detection**        | Identify 70+ reasoning errors in arguments                       |
| 📈 **Narrative Mapping**                | Track how stories are framed across different media perspectives |
| 📰 **Multi-Source Analysis**            | Compare coverage across international and national outlets       |

### Technical Features

- **Privacy First**: All processing happens at your configured endpoint — your data never leaves your infrastructure
- **Universal API Support**: Works with OpenAI, LM-Studio, Ollama, or any OpenAI-compatible API
- **Real-time Analysis**: Instant AI-powered bias classification with confidence scores
- **Export Options**: PDF, JSON, and CSV export formats
- **Local Storage**: Analysis history stored locally in browser
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- An OpenAI-compatible API endpoint (OpenAI, LM-Studio, Ollama, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/mskDev0092/Biasmapper-web.git
cd Biasmapper-web

# Install dependencies
bun install

# Set up the database
bun run db:push

# Start development server
bun run dev
```

### Configuration

1. Navigate to **Settings** page (`/settings`)
2. Enter your API endpoint URL (e.g., `http://localhost:1234/v1` for LM-Studio)
3. Enter your API key (if required)
4. Click **Save Configuration**

---

## 📖 Documentation

### Bias Classification Framework

BiasMapper uses a dual-axis bias classification system:

#### Ideological Axis (Left-Right)

| Code | Label         | Description                                                                    |
| ---- | ------------- | ------------------------------------------------------------------------------ |
| L++  | Far Left      | Radical progressive perspectives advocating fundamental systemic change        |
| L+   | Progressive   | Center-left viewpoints supporting social reform and progressive policies       |
| L    | Left-leaning  | Mild progressive tendencies with moderate economic views                       |
| C    | Center        | Neutral or balanced perspectives presenting multiple viewpoints                |
| R    | Right-leaning | Mild conservative tendencies with moderate economic views                      |
| R+   | Conservative  | Center-right viewpoints supporting traditional values and free-market policies |
| R++  | Far Right     | Radical conservative perspectives often nationalist in nature                  |

#### Societal Axis (Establishment-Oppositional)

| Code | Label           | Description                                                  |
| ---- | --------------- | ------------------------------------------------------------ |
| T++  | Est. Extreme    | Complete alignment with institutional narratives             |
| T+   | Mainstream      | General trust in establishment institutions                  |
| T    | Establishment   | Moderate pro-institution stance with some skepticism         |
| B    | Oppositional    | Skeptical of institutions and official narratives            |
| B+   | Grassroots      | Strong bottom-up perspective, anti-establishment orientation |
| B++  | Radical Dissent | Strongly anti-establishment, advocating fundamental change   |

### Supported Countries

BiasMapper supports 25+ countries with regional news outlet profiles:

| Region             | Countries                                                               |
| ------------------ | ----------------------------------------------------------------------- |
| **North America**  | 🇺🇸 United States, 🇨🇦 Canada, 🇲🇽 Mexico                                  |
| **Europe**         | 🇬🇧 United Kingdom, 🇩🇪 Germany, 🇫🇷 France, 🇮🇹 Italy, 🇪🇸 Spain, 🇹🇷 Turkey |
| **South Asia**     | 🇵🇰 Pakistan, 🇮🇳 India                                                   |
| **East Asia**      | 🇨🇳 China, 🇯🇵 Japan, 🇰🇷 South Korea                                      |
| **Middle East**    | 🇦🇪 UAE/Gulf, 🇮🇷 Iran, 🇪🇬 Egypt                                          |
| **South America**  | 🇧🇷 Brazil                                                               |
| **Africa**         | 🇿🇦 South Africa, 🇳🇬 Nigeria                                             |
| **Southeast Asia** | 🇮🇩 Indonesia                                                            |
| **Oceania**        | 🇦🇺 Australia                                                            |
| **Eastern Europe** | 🇷🇺 Russia                                                               |

### Indicator Categories

#### Cognitive Biases (70+)

- Decision-making: Anchoring, Availability Heuristic, Confirmation Bias, Framing Effect
- Social: In-group Bias, Halo Effect, Attribution Bias
- Memory: Misinformation Effect, False Memory, Recency Bias
- Probability: Gambler's Fallacy, Base Rate Fallacy, Survivorship Bias

#### Logical Fallacies (70+)

- Relevance: Ad Hominem, Appeal to Authority, Straw Man, Red Herring
- Causal: Post Hoc, Slippery Slope, False Cause
- Ambiguity: Equivocation, Quoting Out of Context
- Presumption: False Dilemma, Begging the Question, Hasty Generalization

#### Psychological Indicators

- Emotional Manipulation: Fear-mongering, Outrage Manufacturing, Victim Narratives
- Propaganda Techniques: Bandwagon, Card Stacking, Gaslighting, DARVO
- Influence: Social Proof, Scarcity Tactics, Authority Positioning

#### Sociological Indicators

- Power Dynamics: Elite Narratives, Class Conflict Framing, Privilege Discourse
- Group Identity: National, Ethnic, Religious, Political Identity
- Social Stratification: Urban vs Rural Divide, Educational Stratification
- Institutional Dynamics: Systemic Critique, Anti-establishment Framing

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# API Configuration (optional - can be set in UI)
OPENAI_API_KEY="your-api-key"
OPENAI_API_BASE="http://localhost:1234/v1"
```

### API Endpoints

BiasMapper works with any OpenAI-compatible API:

| Provider     | Endpoint                                                                    | Notes              |
| ------------ | --------------------------------------------------------------------------- | ------------------ |
| OpenAI       | `https://api.openai.com/v1`                                                 | Requires API key   |
| LM-Studio    | `http://localhost:1234/v1`                                                  | Free, runs locally |
| Ollama       | `http://localhost:11434/v1`                                                 | Free, runs locally |
| Azure OpenAI | `https://your-resource.openai.azure.com/openai/deployments/your-deployment` | Requires API key   |

### Database

The application uses SQLite by default with Prisma ORM:

```bash
# Push schema changes
bun run db:push

# Generate Prisma client
bun run db:generate

# Reset database
bun run db:reset
```

---

## 🛠️ Development

### Project Structure

```
biasmapper/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── analyze/           # Main dashboard
│   │   ├── analyze-text/      # Text analysis page
│   │   ├── generate-text/     # Text generation page
│   │   ├── settings/          # Configuration page
│   │   └── about/             # About page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── analyze/           # Analysis-specific components
│   │   └── navigation.tsx     # Navigation component
│   ├── lib/
│   │   ├── api-service.ts     # AI API integration
│   │   ├── bias-constants.ts  # Bias codes, labels, indicators
│   │   ├── country-config.ts  # Country configurations
│   │   ├── export-utils.ts    # PDF/JSON export utilities
│   │   ├── local-db.ts        # Local storage database
│   │   └── news-service.ts    # News fetching service
│   └── hooks/                 # Custom React hooks
├── public/
│   └── data/json/             # Sample news data
├── db/
│   └── custom.db              # SQLite database
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

### Scripts

```bash
# Development
bun run dev          # Start development server on port 3000

# Production
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database

# Linting
bun run lint         # Run ESLint
```

## 📦 Static Export (SSG) for GitHub Pages

This project can be exported as a static site suitable for GitHub Pages using Next's `next export`.

- Build and export to the `out/` folder:

```bash
# From project root
npm run export
# or
npm run build:export
```

- The `out/` directory can be pushed to the `gh-pages` branch or uploaded to GitHub Pages.

- If you're deploying under a repository subpath (username.github.io/repo), set `assetPrefix` and `basePath` in `next.config.js` accordingly before exporting, or host the `out/` directory under that path.

Note: The app uses only client-side features and local detection; server API routes were removed to ensure a fully static export.

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: SQLite with Prisma ORM
- **AI Integration**: z-ai-web-dev-sdk (OpenAI-compatible)
- **Charts**: Recharts
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod

---

## 📤 Export Formats

### PDF Export

Generates a professionally formatted HTML report with:

- Executive summary with key statistics
- Bias distribution visualizations
- Outlet-by-outlet analysis
- Detected narratives with intensity ratings
- Cognitive biases and logical fallacies with severity

### JSON Export

Complete data export including:

- All news articles
- All analysis results
- Narrative snapshots
- Outlet profiles
- Dashboard state

### CSV Export

Tabular export for spreadsheet analysis:

- Articles CSV
- Analyses CSV

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

BiasMapper provides directional classification as a guide, not absolute truth. Always review and validate content in its full sociological context. The tool is designed to assist critical thinking, not replace human judgment.

---

<div align="center">

**Built with ❤️ by [mskDev0092](https://github.com/mskDev0092)**

[⬆ Back to Top](#biasmapper)

</div>
