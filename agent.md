# BiasMapper Agent Instructions

This document provides instructions, guidelines, and context for AI agents working on the BiasMapper project.

## Project Structure

BiasMapper is built using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma**.

- `src/app/`: Next.js App Router routing (`/analyze`, `/about`, `/settings`).
- `src/components/`: Reusable React components.
  - `src/components/ui/`: Base Shadcn UI components (Radix UI + Tailwind).
  - `src/components/analyze/`: Analysis-specific UI features.
- `src/lib/`: Core logic and configurations.
  - `db.ts`: Prisma client initialization.
  - `api-service.ts`, `lm-studio-service.ts`: Backend integrations and LLM connection.
  - `encryption-utils.ts`, `rate-limiter.ts`: Security and utility features.
- `src/hooks/`: Custom React hooks (`use-mobile.ts`, `use-toast.ts`).
- `prisma/`: Prisma schema and database migrations.

## Coding Style Guide

1. **Language & Types**: Write in **TypeScript** (`strict: true`). Avoid `any` - always define interfaces for component props and state.
2. **Components**: Use React Functional Components. Prioritize cleanly separating logic from presentation.
3. **Styling**: Strictly use **Tailwind CSS** following a mobile-first approach. Use `lucide-react` for icons and `framer-motion` for animations. Combine classes securely using `clsx` and `tailwind-merge`.
4. **State Management**: Use `zustand` for global app state, and `@tanstack/react-query` for API data fetching/caching when applicable.
5. **Accessibility**: Strictly adhere to WCAG standards. Add `aria-label` to interactive elements (especially icon-only buttons), use semantic HTML elements (`<nav>`, `<section>`, `<main>`), and support keyboard navigation.
6. **Error Handling & UX**: Provide meaningful user feedback via toast notifications (`sonner`). Avoid swallowing errors silently in catch blocks without user notification or fallback.
7. **Performance**: Prevent unnecessary re-renders with `useCallback` or `useMemo` where appropriate. Add `suppressHydrationWarning` on elements matching client/server timestamps.
8. **Programming Paradigms**: Adhere to core engineering principles:
   - **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
   - **KISS**: (Keep It Simple, Stupid) Avoid over-engineering; favor readability and maintainability.
   - **DRY**: (Don't Repeat Yourself) Abstract redundant logic into reusable hooks or utils.
   - **YAGNI**: (You Ain't Gonna Need It) Don't implement features or logic until they are actually required.

## Todo List & Roadmap

Check off items as they are completed by placing an `x` inside the brackets `[x]`.

### Pending Improvements

- [ ] **Code Organization**: Break down the `src/app/analyze/page.tsx` (or related analyze components) into smaller, more specific sub-components.
- [ ] **Loading UX**: Add loading skeletons for analytical content to improve perceived performance during data fetching.
- [ ] **Error Boundaries**: Implement robust React Error Boundaries across different route segments.
- [ ] **Error Handling**: Add more comprehensive local error handling and fallback states for failed sub-tasks in API calls.
- [ ] **Dark Mode**: Integrate and refine a full Dark Mode experience (leveraging `next-themes`).
- [ ] **Analytics**: Implement analytics tracking (ensuring user privacy where required).
- [ ] **PWA**: Add Progressive Web App capabilities for offline behavior and installability.

## V2 Feature & Architecture Roadmap

### 1. UI/UX & Architecture Rethink

- **UI/UX Overhaul**: App-wide UI/UX improvements to deliver a modern, premium experience (glassmorphism, animations).
- **Architecture & Security**: Use static Next.js SSG. Model `localStorage` strictly like a database schema. This keeps the application static while ensuring the data structure is well-organized, making the codebase easy to maintain and straightforward to migrate to a real DB in the future.

### 2. Tab Reorganization & Analyze Tab Revamp

- **Feature Extraction**: Separate "Generate Text" and "Analyze Text" into their own standalone tabs.
- **Analyze Tab Reorder**: Make it general-purpose (news, custom text, narratives). It must NOT auto-start; require explicit user action.
- **Export/Import capability**: Support exporting results, charts, and news snippets beautifully to **PDF**, and allow data export/import via **JSON** and **CSV**.

### 3. Advanced Bias & Narrative Feeds

- **Cognitive Biases & Logic**: Implement detection for Cognitive Biases, Logical Fallacies, Premises, and Results.
- **Narrative Workflow & News Feed**: Implement a scrollable news feed. Fetch data directly from free news APIs (e.g., [Free News APIs](https://publicapis.io/blog/free-news-apis)) directly into `localStorage` using a structured and controlled format.
- **LLM as the Brain**: The LLM will consume these formatted news schemas from `localStorage` to label them on-the-go or later. The analyzed logic and detected narratives will be appended to the entries and displayed beautifully in UI cards.

### 4. Outlets & Country Comparison

- **Advanced Outlets**: Allow users to add another country for comparison (e.g., International vs. specific country based on user interests). This will dynamically affect data retrieval methods and LLM prompts.
