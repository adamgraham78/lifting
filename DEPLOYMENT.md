# Deploying to Vercel

This guide will help you deploy your lifting tracker app to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your Supabase credentials (URL and anon key)

## Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select this repository

2. **Configure the project:**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `your-project.vercel.app`

## Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## After Deployment

- Your app will be automatically redeployed on every push to your main branch
- You can view deployment logs and analytics in the Vercel dashboard
- Custom domains can be added in Project Settings → Domains

## Troubleshooting

- **Build fails:** Check the Vercel deployment logs
- **Runtime errors:** Verify environment variables are set correctly
- **Supabase connection issues:** Ensure your Supabase project URL and anon key are correct
