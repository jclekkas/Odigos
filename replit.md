# Odigos - Car Deal Analyzer

## Overview

Odigos is a web application that helps users evaluate car purchase offers before visiting a dealership. Users paste dealer quotes, texts, or emails into the app, and an AI-powered backend analyzes the deal to provide a clear GO/NO-GO recommendation with a color-coded score (GREEN/YELLOW/RED), extracted pricing details, and suggested questions to ask the dealer.

## User Preferences

Preferred communication style: Simple, everyday language.
Owner email: jclekkas@gmail.com
Email notifications: Deferred (user opted to use deployment logs for now; can add Resend integration later)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Build Tool**: Vite with React plugin

The frontend follows a single-page architecture with the main functionality on the home page. Components are organized with reusable UI primitives in `client/src/components/ui/` and page-level components in `client/src/pages/`.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js HTTP server wrapping Express
- **API Design**: RESTful JSON API with Zod schema validation
- **AI Integration**: OpenAI-compatible API via Replit AI Integrations

The backend exposes a single primary endpoint `/api/analyze` that receives dealer text and optional context, sends it to an LLM for analysis, and returns structured JSON with deal scoring and extracted fields.

### Data Flow
1. User submits dealer text via form
2. Frontend validates with Zod and sends POST to `/api/analyze`
3. Backend constructs LLM prompt with system instructions for structured JSON output
4. LLM response is parsed and returned to frontend
5. Frontend renders results with visual hierarchy (score badge, summary, detected fields)

### Shared Code
- `shared/schema.ts`: Zod schemas for request/response validation shared between frontend and backend
- `shared/models/chat.ts`: Drizzle ORM table definitions for conversation persistence (optional chat feature)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` and `shared/models/`
- **Migrations**: Managed via `drizzle-kit push`

Note: The database is used for metrics tracking and optional features. The core deal analysis is stateless.

### Metrics System
- **Table**: `metrics_events` stores all tracked events with type, timestamp, and JSON metadata
- **Event Types**: submission, submission_score, checkout_started, payment_completed, page_view
- **API Endpoint**: `GET /api/metrics` returns aggregated statistics
- **Admin Dashboard**: `/admin/metrics` displays key business metrics (private, not in sitemap)
- **Tracked Data**: Submissions, payments, revenue, conversion rate, score distribution, activity timeline

### Development vs Production
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds static assets to `dist/public`, Express serves them with `serveStatic`

## External Dependencies

### AI Services
- **OpenAI-compatible API**: Used via Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Models used: GPT for text analysis, `gpt-image-1` for image generation (optional)

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **Session Store**: `connect-pg-simple` for session persistence

### Key NPM Packages
- `openai`: OpenAI SDK for LLM calls
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `zod`: Runtime schema validation
- `@tanstack/react-query`: Async state management
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework