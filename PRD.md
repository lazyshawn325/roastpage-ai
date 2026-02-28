# Product Requirements Document (PRD)

## Project: RoastPage.ai
**Tagline:** Get your landing page roasted by an AI expert, fix your conversion rate.

### 1. Market Analysis & Problem Statement
*   **Problem:** Founders and indie hackers build landing pages but often suffer from poor copy, bad UX, or unclear value propositions, leading to low conversion rates. Hiring a human CRO (Conversion Rate Optimization) expert is expensive ($500+).
*   **Solution:** A fully automated AI service that takes a URL, captures a screenshot, analyzes the visual and textual content, and provides a brutally honest "roast" along with actionable UX/UI and copy improvements.
*   **Monetization Strategy (Freemium):**
    *   **Free:** A quick text-based roast of the hero section. (Viral loop for Twitter/X sharing).
    *   **Pro ($9):** A comprehensive PDF report including full-page screenshot analysis, component-by-component tear down, SEO audit, and re-written copy suggestions.

### 2. Core Features (MVP)
*   **Input:** A simple input field for the user to submit their website URL.
*   **Engine:**
    *   Puppeteer/Browserbase to navigate to the URL and capture a full-page screenshot.
    *   Google Gemini Vision API to analyze the image and HTML context.
*   **Output (The Roast):** A witty, slightly sarcastic but highly educational breakdown of the page (Design, Copy, Trust Signals, Call-to-Action).
*   **Payment:** Stripe integration for the "Deep Dive" PDF report.

### 3. Tech Stack
*   **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Shadcn UI, Framer Motion (for polished aesthetics).
*   **Backend:** Next.js Route Handlers.
*   **AI/Vision:** Gemini Flash/Pro Vision via `@google/genai`.
*   **Automation:** Browserbase / Puppeteer (for screenshotting).
*   **Database (Optional for MVP):** PostgreSQL (Supabase) to store roast history for viral galleries.

### 4. Development Phases
1.  **Phase 1: Foundation:** Next.js setup, UI scaffold, Vercel deployment setup.
2.  **Phase 2: Core Engine:** Integrate screenshot API and Gemini Vision prompt engineering for the "Roast" persona.
3.  **Phase 3: The MVP UI:** Landing page for RoastPage.ai, loading states (skeleton loaders while AI thinks), and the results page.
4.  **Phase 4: Monetization (V2):** Stripe integration for PDF exports.
