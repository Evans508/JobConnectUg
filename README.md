
# JobConnect Uganda MVP

A centralized job marketplace connecting Ugandan job seekers with employers. This MVP features a unique automated ingestion pipeline that scrapes, parses, and publishes job listings from WhatsApp groups using Google Gemini AI.

## Features

- **Job Seeker:** Browse jobs, filter by location/type, apply via email/WhatsApp, order CV writing services (featuring AI Resume Analysis).
- **Employer:** Post manual jobs, manage listings, view applicants.
- **Admin:** Moderate WhatsApp-ingested jobs, manage users.
- **Automation:** Webhook receiver for WhatsApp Cloud API, Gemini-powered JSON extraction.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Node.js + NestJS
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Google Gemini API (via `@google/genai`)
- **Payments:** Flutterwave
- **Infrastructure:** Vercel (FE), Railway/Render (BE), Supabase (DB)

## Quick Start

1.  **Clone & Install:**
    ```bash
    npm install
    ```

2.  **Environment:**
    Copy `.env.example` to `.env` and fill in:
    - `DATABASE_URL`
    - `API_KEY` (Gemini)
    - `WHATSAPP_VERIFY_TOKEN`
    - `FLUTTERWAVE_PUBLIC_KEY`
    - `SUPABASE_URL` & `SUPABASE_KEY` (Required for real DB persistence)

3.  **Database Setup (Supabase):**
    1. Create a new project at [Supabase.com](https://supabase.com).
    2. Go to the **SQL Editor** in your dashboard.
    3. Click **New Query**.
    4. Open the file `supabase_schema.sql` located in the root of this repository.
    5. Copy its content, paste it into the editor, and click **Run**.
    6. Go to **Project Settings > API**, copy your **Project URL** and **anon public key**.
    7. Paste them into your `.env` file as `SUPABASE_URL` and `SUPABASE_KEY`.

4.  **Run Frontend:**
    ```bash
    # Starts the React SPA
    npm start
    ```

5.  **Run Backend (Simulated in this repo structure):**
    Real implementation would run `nest start`.

## Architecture

The `backend/src/workers/ingest.worker.ts` file contains the core logic for converting raw WhatsApp text into structured Job data using the Gemini 2.5 Flash model.
