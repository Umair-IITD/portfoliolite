# Hapiimood Production Blueprint: From Scratch to Scale

This document serves as a master reference for the end-to-end development of **Hapiimood**. It outlines every critical architectural decision, security checklist, and deployment step taken to transform a collection of hackathon files into a production-grade mental wellness platform.

---

## 🏗️ Phase 1: The Core Infrastructure (Scratch to MVP)
The foundation of the app was built using **Next.js 15 (App Router)** and **TypeScript** for type-safe development.

### **1. AI Integration (Hapi Chat)**
- **Groq Llama-3 Engine:** Chosen for its lightning-fast inference (zero-latency streaming).
- **Vercel AI SDK:** Used to manage streaming responses and conversational UI states.
- **System Prompt Design:** Crafted a "Radically Empathetic" clinical persona for Hapi, explicitly instructing the AI NOT to diagnose but to validate emotions.

### **2. Data Architecture (Supabase)**
- **Schema:** Created `chat_messages` (with `sentiment_score` column) and `mood_logs` tables.
- **Sentiment Analysis:** Integrated a lightweight `sentiment` library to automatically score the "emotional valency" of every user message.

---

## 🔐 Phase 2: The Security Hardening (Production Checklist)
Recruiters and industry experts look for these specific "Invisible Armor" implementations.

### **1. Authentication (Clerk)**
- **Identity Provider:** Clerk v7 was selected for its robust Next.js integration and production-ready session management.
- **Security Check:** Verified that all routes (Dashboard, Analytics, Chat) are protected by `clerkMiddleware` and `auth().protect()`.

### **2. Row Level Security (RLS)**
- **The "Data Leak" Defense:** Every single table in the Supabase database has RLS enabled.
- **Logic:** `(auth.uid() = user_id)`. This ensures user A can **never** accidentally see user B's chat history even if they guess a message UUID.

### **3. Global API Rate Limiting**
- **DDoS/Spam Protection:** Implemented a custom middleware-level rate limiter.
- **Constraint:** Limited all /api/chat requests to **60 requests per minute per IP**.
- **Result:** Protects against bot-spam and expensive AI credit drain attacks.

### **4. Content Security Policy (CSP)**
- **CSP Adjustment:** While X-Frame-Options and XSS protection headers remain strict, the `Content-Security-Policy` text was intentionally relaxed. We discovered that Clerk's embedded Cloudflare Turnstile (Bot Protection) strictly requires dynamic worker permissions and `xr-spatial-tracking` access that conflicts with strict wildcard CSPs. Relaxing the strict CSP rule allows the OAuth 2.0 handshake to complete instantaneously without browser blockage.

---

## 🎨 Phase 3: UI/UX & Interactive Design
- **Framer Motion:** All transitions, especially the "Insight Carousel" and "Meditation Figures," use spring-physics animations for a calming, high-end feel.
- **Glassmorphism:** Applied an obsessive design language of frosted-glass overlays, glowing shadows, and backdrop-blurs.
- **Accessibility:** Ensured 100% of interactive elements feature `cursor-pointer` (via global `globals.css` overrides).
- **Static App Icon (Favicon):** Ensured visual branding integrity by using a hardcoded `icon.svg` instead of dynamic component compilation to prevent cache-misses on edge networks.

---

## 🚀 Phase 4: The Deployment Workflow
The final leap to production on **Vercel**.

1. **Git Lifecycle:** Cleaned the repo, hardened `.gitignore`, and pushed to a fresh `main` branch on GitHub.
2. **Environment Synchronization:** 
   - Transferred all local `.env` keys to Vercel (Groq, Supabase, Clerk).
   - **Critical Pivot:** Swapped Clerk from "Development" to "Production" mode.
3. **Custom Domain (DNS):**
   - Linked `hapiimood.me` via Namecheap.
   - Configured **A Records** and **CNAMEs** for Vercel.
   - Configured **Clerk CNAMEs** (`clerk`, `accounts`, `clkmail`) for the authentication to initialize on the custom domain.

---

## ✅ Master Launch Checklist
- [x] Clerk swapped to `clerk.hapiimood.me`
- [x] CSP updated to whitelist `.me` origin
- [x] Supabase RLS is enabled on all tables
- [x] Rate Limiting is active in Middleware
- [x] Production Build (`npm run build`) passes with Code 0
- [x] All `.env` secrets excluded from Git history

---

**Hapiimood is now live, secure, and recruiter-ready.**
*Reference this Blueprint for all future enterprise-grade deployments.*
