# Smart Bookmark App

A production-ready SaaS application for managing and categorizing bookmarks intelligently. Built with **Next.js App Router**, **Supabase**, and styled with **Tailwind CSS & shadcn/ui**.

## Features Overview
- **Premium Dashboard**: Glassmorphic UI, responsive grids, and subtle animations.
- **Authentication**: Secure Google OAuth integration using Supabase Auth.
- **Realtime Sync**: Bookmark additions and deletions synchronize instantly across all open tabs via WebSockets.
- **Optimistic UI**: Lightning-fast frontend updates before the database responds.
- **High-Performance Filtering**: Debounced search and dynamic category chips.
- **Security**: Database-level isolation using PostgreSQL Row Level Security (RLS).
- **Privacy Controls**: Users can export their bookmarks, delete individual bookmarks, or permanently delete their account and saved data.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime, Google OAuth)
- **Styling**: Tailwind CSS v4
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
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
   `SUPABASE_SERVICE_ROLE_KEY` is only used on the server-side account deletion route. Never expose it in client-side code.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase & Google OAuth Setup Guide

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Go to **Project Settings > API** to find your `URL` and `anon` key. Add these to your `.env.local`.

### 2. Configure Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and configure the OAuth consent screen.
3. Under **Credentials**, create an OAuth Client ID (Web Application).
4. Set the **Authorized redirect URI** to: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. Copy your **Client ID** and **Client Secret**.
6. Back in your **Supabase Dashboard**, go to **Authentication > Providers**.
7. Enable **Google** and paste your Client ID and Secret.

---

## Database Security & RLS Explanation

This application relies strictly on **Row Level Security (RLS)** to keep user data isolated. Security is enforced at the PostgreSQL database layer, not just the frontend API routes.

1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Run the `supabase/schema.sql` file included in this repository.

### Why are RLS Policies Secure?
The SQL script binds the `user_id` of every bookmark directly to `auth.uid()`. When the Next.js server or client makes a request to Supabase using the Anon Key, it passes a secure, cryptographically signed JWT. 
PostgreSQL intercepts the raw SQL queries and dynamically injects `WHERE user_id = auth.uid()` natively. 

**This guarantees that:**
- Even if a malicious user manipulates a frontend API call to request `SELECT * FROM bookmarks`, the database will physically refuse to return rows belonging to other users.
- `INSERT` policies use a `WITH CHECK` constraint, preventing users from forging a payload to assign a bookmark to a different `user_id`.

---

## User Privacy & Data Handling

User privacy is handled as a core part of the application architecture:

1. **Minimal User Data**: The app stores only the authenticated user's bookmark data: title, URL, category, creation date, and the Supabase `user_id` required for ownership checks.
2. **Private By Default**: Every bookmark row is tied to `auth.uid()` through Row Level Security, so users can only view, create, update, or delete their own records.
3. **Secure Authentication**: Google OAuth is managed through Supabase Auth. The app uses Supabase session cookies/JWTs rather than storing passwords directly.
4. **User-Controlled Export**: The Account Center includes an **Export data** action that downloads the signed-in user's bookmarks as a JSON file.
5. **Data Deletion**: Users can delete individual bookmarks, and the Account Center includes a protected account deletion flow that requires typing `DELETE` before removal.
6. **Cascade Cleanup**: The `bookmarks.user_id` foreign key uses `on delete cascade`, so when an account is deleted through `/api/account/delete`, the user's saved bookmarks are removed with the auth user.
7. **Secret Isolation**: The Supabase service role key is only read inside the server route used for account deletion and must never be exposed with a `NEXT_PUBLIC_` prefix.

---

## Realtime Implementation & Cleanup Explanation

We leverage Supabase's PostgreSQL triggers to broadcast changes to connected clients instantly.

### Architecture
- **Publication**: The `bookmarks` table is added to the `supabase_realtime` publication in our schema.
- **Listener**: The `useBookmarksRealtime` custom React Hook subscribes to the `realtime_bookmarks` channel using WebSockets.

### Subscription Cleanup & Memory Management
In React, setting up persistent connections like WebSockets inside a `useEffect` can cause severe memory leaks and duplicate listeners if not handled correctly.
In `useBookmarksRealtime.js`, we explicitly return a cleanup function:
```javascript
return () => {
  supabase.removeChannel(channel);
};
```
When the Dashboard component unmounts (e.g., the user logs out or navigates away), React fires this cleanup function, gracefully detaching the WebSocket listener. This ensures the application remains highly performant and production-ready without phantom subscriptions.

---

## Bonus Feature Explanation: Categories & Filtering

**What was built?**
A dynamic categorization system where users can assign text-based tags to bookmarks, accompanied by a high-performance filtering UI.

**Why does this improve UX?**
As a user's bookmark library grows from 10 items to 1,000 items, a simple flat list becomes unmanageable. By implementing:
1. **Debounced Search**: Users can instantly narrow down results by typing, without the browser stuttering from re-rendering on every keystroke.
2. **Dynamic Category Chips**: Users can visually click chips to filter items. This reduces cognitive load because users don't have to remember what they named their categories; the UI extracts and displays the unique tags automatically. 

This transitions the app from a simple storage locker into a powerful productivity dashboard.

---

## Deployment Instructions (Vercel)

This project is pre-configured for Vercel with a `vercel.json` file providing secure HTTP headers.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. **Important**: Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

*Note: Once deployed, ensure you add your new Vercel production URL to Google Cloud Console's **Authorized JavaScript origins** and Supabase's **Authentication > URL Configuration > Site URL** to ensure OAuth redirects function properly in production.*

---

## Problems Faced & Future Improvements

### Problems Faced
1. **Optimistic UI vs. Realtime Sync Conflicts**: When a user adds a bookmark, the Optimistic UI inserts it into the state immediately. A fraction of a second later, the Supabase Realtime WebSocket fires an `INSERT` event. This initially caused the bookmark to duplicate on the screen. 
   - *Solution*: I implemented a protective check inside the `useBookmarksRealtime` hook to verify if `payload.new.id` already exists in the local state array before inserting it.

### Future Improvements
1. **AI Categorization**: Integrate the OpenAI API to automatically parse the URL's metadata and suggest a relevant title and category.
2. **Pagination/Infinite Scroll**: As the dataset grows into the tens of thousands, fetching all bookmarks simultaneously will degrade performance. Implementing cursor-based pagination would maintain a snappy UX.
3. **Link Previews**: Fetching OpenGraph data to display image thumbnails for each bookmark instead of just text cards.
