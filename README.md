# Bookmarks App

A personal bookmarks application where users can save links, mark them as public or private, and share a public profile page. Built with React and Supabase.

## Live Demo

[https://bookmarks-app-teal.vercel.app](https://bookmarks-app-teal.vercel.app)

## Tech Stack

- **Frontend:** React + Vite
- **Backend & Auth:** Supabase (PostgreSQL + Auth)
- **Emails:** Resend (SMTP configured)
- **Deployment:** Vercel
- **Routing:** React Router

## Features

- User signup with email confirmation (via Resend SMTP)
- User login and logout
- Claim a unique public handle
- Add bookmarks with title, URL, and public/private toggle
- View all bookmarks in the dashboard
- Toggle bookmarks between public and private
- Delete bookmarks
- Public profile page at `/[handle]` showing only public bookmarks
- Row Level Security (RLS) policies ensure users can only access their own data

## How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bookmarks-app.git
   cd bookmarks-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** and visit `http://localhost:5173`

> **Note:** For email confirmation to work locally, ensure you've configured Resend SMTP in your Supabase project settings, or disable email confirmation for testing.

## Database Schema

### Profiles Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | References auth.users |
| `handle` | TEXT (UNIQUE) | User's public handle |
| `created_at` | TIMESTAMP | Creation timestamp |

### Bookmarks Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `title` | TEXT | Bookmark title |
| `url` | TEXT | Bookmark URL |
| `is_public` | BOOLEAN | Visibility on public profile |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### RLS Policies
- Users can only SELECT their own bookmarks or public bookmarks
- Users can only INSERT, UPDATE, or DELETE their own bookmarks

## AI Agent Process

This project was built using Cursor as the primary AI coding agent.

### What the AI Agent Got Wrong

The AI agent initially generated RLS policies that did not include the `is_public = true` condition for the SELECT policy. This caused public profiles to show no bookmarks, as the policy only allowed users to see bookmarks where `auth.uid() = user_id`. The issue was identified when testing the `/[handle]` page in an incognito window. The fix involved adding `OR is_public = true` to the SELECT policy, allowing public bookmarks to be viewed by anyone.

### One Thing to Improve

Add pagination or infinite scroll for users with many bookmarks. Currently, all bookmarks are loaded at once, which could become slow with hundreds of entries. Additionally, implementing real-time updates using Supabase Realtime would allow users to see new bookmarks without refreshing the page.

## Deployment

The application is deployed on Vercel. The `vercel.json` file ensures client-side routing works correctly:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Author

Paras Poria