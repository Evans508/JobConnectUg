# MVP Sprint Plan (6 Weeks)

## Week 1: Foundation
- **Goals:** Project setup, Database Schema, Auth Flow.
- **Tasks:**
  - Initialize Repo (Next.js + NestJS).
  - Setup Supabase & Prisma Schema.
  - Implement Auth (Login/Signup/JWT).
  - **Acceptance:** User can sign up and log in.

## Week 2: Core Job Board
- **Goals:** Manual job posting and listing.
- **Tasks:**
  - Create Job Model CRUD endpoints.
  - Frontend: Job Listing & Detail pages.
  - Employer Dashboard (Post Job).
  - **Acceptance:** Employer can post a job; Seeker can view it.

## Week 3: WhatsApp Ingestion (Backend)
- **Goals:** Webhook and Parsing Logic.
- **Tasks:**
  - Setup Meta App & Webhook endpoint.
  - Implement `JobIngestLog`.
  - Integrate Gemini API for parsing.
  - **Acceptance:** Sending a message to the bot logs it in DB and parses JSON.

## Week 4: Admin Moderation & Deduplication
- **Goals:** Human-in-the-loop flow.
- **Tasks:**
  - Admin Dashboard (Ingest Queue).
  - Edit/Approve/Reject UI.
  - Implement Deduplication logic (check messageId/similarity).
  - **Acceptance:** Admin can approve a parsed message -> becomes a Job.

## Week 5: Payments & Monetization
- **Goals:** Revenue features.
- **Tasks:**
  - Integrate Flutterwave.
  - "Feature Job" payment flow.
  - CV Writing Service request flow.
  - **Acceptance:** User can complete a test payment.

## Week 6: QA & Polish
- **Goals:** Stability and Launch.
- **Tasks:**
  - End-to-end testing (Cypress).
  - UI Polish (Mobile responsiveness).
  - Deployment to Prod.
  - **Acceptance:** All critical bugs resolved; App live on URL.
