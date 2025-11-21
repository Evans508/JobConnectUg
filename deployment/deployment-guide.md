# Deployment Guide

## 1. Database (Supabase)
1. Create a new project on Supabase.
2. Get the `DATABASE_URL` from settings.
3. Run `npx prisma migrate deploy` to push the schema.
4. Enable Storage for CV uploads.

## 2. Backend (Render/Railway)
1. Connect your GitHub repo.
2. Set Environment Variables:
   - `DATABASE_URL`
   - `API_KEY` (Google Gemini)
   - `WHATSAPP_VERIFY_TOKEN`
   - `FLUTTERWAVE_PUBLIC_KEY`
   - `FLUTTERWAVE_SECRET_KEY`
3. Build Command: `npm run build`
4. Start Command: `npm run start:prod`

## 3. Frontend (Vercel)
1. Import project to Vercel.
2. Set Build Command: `npm run build`
3. Configure Output Directory: `dist` (or `build`)
4. Add Environment Variables if needed (e.g., API URL).

## 4. WhatsApp Cloud API
1. Create App in Meta Developers Console.
2. Configure "WhatsApp" product.
3. Set Webhook Callback URL to `https://your-backend-url.com/webhooks/whatsapp`.
4. Verify token matching `WHATSAPP_VERIFY_TOKEN`.
