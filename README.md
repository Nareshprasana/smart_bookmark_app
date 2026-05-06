# Smart Bookmark App

A modern, production-ready SaaS application for managing and categorizing your bookmarks intelligently. Built with **Next.js App Router**, **Supabase**, and styled with **Tailwind CSS & shadcn/ui**.

## Features
- **Premium Dashboard**: Glassmorphic UI, responsive grids, and subtle animations.
- **Authentication**: Secure Google OAuth integration using Supabase Auth.
- **Realtime Sync**: Bookmark additions and deletions synchronize instantly across all open tabs via WebSockets.
- **Optimistic UI**: Lightning-fast frontend updates before the database even responds.
- **High-Performance Filtering**: Debounced search and dynamic category chips.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime)
- **Styling**: Tailwind CSS v4 + Class Variance Authority
- **Form Validation**: React Hook Form + Zod
- **Notifications**: Sonner

---

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart_bookmark_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root of the project and populate it with your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase & Google OAuth Setup Guide

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Once provisioned, go to **Project Settings > API** to find your `URL` and `anon` key. Add these to your `.env.local`.

### 2. Configure Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and configure the OAuth consent screen.
3. Under **Credentials**, create an OAuth Client ID (Web Application).
4. Set the **Authorized redirect URI** to: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. Copy your **Client ID** and **Client Secret**.
6. Back in your **Supabase Dashboard**, go to **Authentication > Providers**.
7. Enable **Google** and paste your Client ID and Secret.

---

## Database & Security (RLS)

This application relies strictly on **Row Level Security (RLS)** to keep user data isolated. This means security is enforced at the database layer, not just the frontend.

1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Run the `supabase/schema.sql` file included in this repository.

### Why is this secure?
The SQL script binds the `user_id` of every bookmark to `auth.uid()`. When our Next.js server/client makes a request to Supabase, it passes a secure JWT. Supabase intercepts the raw SQL queries and dynamically injects `WHERE user_id = auth.uid()`. No user can ever `SELECT`, `UPDATE`, or `DELETE` rows belonging to another user, even if they manipulate the frontend API calls.

---

## Realtime Architecture

We leverage Supabase's PostgreSQL triggers to broadcast changes to connected clients instantly.
- **Publication**: The `bookmarks` table is added to the `supabase_realtime` publication.
- **Listener**: The `useBookmarksRealtime` custom hook subscribes to this channel using WebSockets.
- **De-duplication**: To support our Optimistic UI (where the frontend updates instantly before the database responds), the realtime listener intelligently ignores `INSERT` payloads if the bookmark's ID already exists in the local state.

---

## Deployment Guide (Vercel)

This project is pre-configured for Vercel with a `vercel.json` file providing security headers.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. **Important**: Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

Vercel will automatically detect Next.js and build the application. Once deployed, ensure you add your new Vercel production URL to Google Cloud Console's **Authorized JavaScript origins** and Supabase's **Authentication > URL Configuration > Site URL**.
