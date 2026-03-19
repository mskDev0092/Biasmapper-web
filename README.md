# BiasMapper ⚖️

BiasMapper is a powerful AI-driven platform for analyzing ideological, societal, and cognitive biases in media and text content. It uses advanced directional frameworks to classify content across multiple dimensions, helping users uncover hidden narratives and understand media bias.

## 🚀 Getting Started

To get BiasMapper working "out of the box" with a live news feed, you'll need to configure at least one free News API key.

### 1. Get Your Free API Keys

We recommend getting keys from these providers:

*   **GNews (Recommended)**: [gnews.io](https://gnews.io/) (100 free requests per day)
*   **NewsAPI**: [newsapi.org](https://newsapi.org/) (Developer free tier)
*   **Currents API**: [currentsapi.services](https://currentsapi.services/)

### 2. Add API Keys (Two Ways)

#### Option A: Via the UI (Easiest)
1. Open BiasMapper and navigate to the **Settings** page.
2. Scroll down to the **News API Configuration** section.
3. Paste your keys into the corresponding fields.
4. Set your **Preferred Provider** and select the **Countries** you want to track.
5. Click **Save Configuration**.

#### Option B: Via Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_GNEWS_KEY=your_key_here
   NEXT_PUBLIC_NEWSAPI_KEY=your_key_here
   NEXT_PUBLIC_CURRENTS_KEY=your_key_here
   ```
3. Restart the development server.

### 3. Fetch News
1. Navigate to the **Analyze** tab.
2. If the News Feed is empty, click **Fetch Latest News**.
3. Articles will be stored in your browser's local storage for future analysis.

## 🧠 LLM Analysis Setup

BiasMapper requires an OpenAI-compatible API to perform bias analysis:
*   **Local**: Supports [Ollama](https://ollama.ai/) and [LM-Studio](https://lmstudio.ai/) for 100% private, local analysis.
*   **Cloud**: Supports OpenAI, Groq, Together AI, and more.

Configure your LLM endpoint in the **Settings** page under **API Configuration**.

## 🛠️ Tech Stack

*   **Framework**: Next.js 15+ (App Router)
*   **Styling**: Tailwind CSS & Shadcn/UI
*   **Database**: LocalStorage-based persistence (LocalDB)
*   **AI**: Any OpenAI-compatible endpoint

## 📝 License

See the LICENSE file for details.
