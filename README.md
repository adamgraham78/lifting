# Lifting Tracker - RP-Style Auto-Regulation

A personal hypertrophy training web application with intelligent volume auto-regulation, inspired by Renaissance Periodization principles.

## Features

### Core Functionality
- **Exercise Library** - Comprehensive database of exercises with filtering by muscle group, equipment, and movement pattern
- **Mesocycle Planning** - Create custom training programs with 4-8 week duration
- **Workout Tracking** - Log sets, reps, weight, and RPE during training sessions
- **Auto-Regulation** - Intelligent volume adjustment based on feedback (joint pain, pump, workload)
- **Muscle Prioritization** - Set priority levels for each muscle group to control volume progression
- **Progress Analytics** - Track volume, strength progression, and training history

### Auto-Regulation Algorithm

The system automatically adjusts training volume based on three priority levels:

**HIGH Priority** - Aggressive growth focus
- Increases volume with good pump or manageable workload
- Adds stimulus when under-stimulated
- Backs off with joint pain or excessive fatigue

**MEDIUM Priority** - Balanced approach
- Conservative volume increases
- Only adds volume if clearly under-stimulated
- Maintains when adequately challenged

**LOW Priority** - Maintenance mode
- Never increases volume
- Only reduces if joint pain or excessive fatigue
- Stable volume for non-focus muscles

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes / Server Actions
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lifting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the database to be provisioned
   - Go to Project Settings > API to get your credentials

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Initialize the database**

   In your Supabase project, go to the SQL Editor and run:

   a. First, run the migration:
   ```bash
   # Copy the contents of supabase/migrations/001_initial_schema.sql
   # and paste into Supabase SQL Editor, then run it
   ```

   b. Then seed the database:
   ```bash
   # Copy the contents of supabase/seed.sql
   # and paste into Supabase SQL Editor, then run it
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/lifting
├── /app                      # Next.js App Router pages
│   ├── /exercises           # Exercise library
│   ├── /workout             # Workout tracking
│   ├── /analytics           # Progress visualization
│   ├── /settings            # Muscle priorities and config
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Dashboard home
│   └── globals.css          # Global styles
├── /components
│   ├── /ui                  # Reusable UI components (Button, Input, Card, etc.)
│   └── Navigation.tsx       # Main navigation bar
├── /lib
│   ├── /services            # Business logic
│   │   ├── auto-regulation.ts  # Volume adjustment algorithm
│   │   ├── exercises.ts     # Exercise CRUD operations
│   │   └── muscle-groups.ts # Muscle group management
│   ├── /utils               # Helper functions
│   │   └── converters.ts    # DB row to TypeScript model converters
│   └── supabase.ts          # Supabase client configuration
├── /types
│   └── index.ts             # TypeScript type definitions
├── /supabase
│   ├── /migrations          # Database schema migrations
│   └── seed.sql             # Seed data (exercises, muscle groups)
├── .env.local.example       # Environment variables template
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Database Schema

### Core Tables
- `muscle_groups` - Muscle groups with priority settings
- `exercises` - Exercise library with muscle mapping
- `mesocycle_templates` - Training program templates
- `template_days` - Days within a mesocycle
- `template_exercises` - Exercises assigned to template days
- `active_mesocycles` - Currently running programs
- `workout_sessions` - Individual workout instances
- `workout_sets` - Logged sets with reps/weight/RPE
- `muscle_feedback` - Auto-regulation feedback data
- `weekly_set_overrides` - Manual volume adjustments

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Next.js + Supabase
- [x] Database schema and migrations
- [x] TypeScript types and models
- [x] Core UI components
- [x] Exercise library with CRUD
- [x] Muscle priority settings
- [x] Auto-regulation algorithm

### Phase 2: Core Features (In Progress)
- [ ] Mesocycle template builder
- [ ] Active workout tracking interface
- [ ] Feedback collection and auto-regulation UI
- [ ] Weekly set management view
- [ ] Session history and exercise PRs

### Phase 3: Enhanced Features
- [ ] Progress analytics and charts
- [ ] Big Arms Specialization template
- [ ] Exercise history visualization
- [ ] Deload week automation
- [ ] Export/import data

### Phase 4: Polish
- [ ] PWA support for mobile
- [ ] Rest timer with notifications
- [ ] Drag-and-drop exercise reordering
- [ ] Multi-device sync
- [ ] Dark mode refinements

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy!

3. **Configure domain** (optional)
   - Add custom domain in Vercel project settings

## Contributing

This is a personal project, but suggestions and bug reports are welcome! Open an issue or submit a pull request.

## License

MIT License - feel free to use this for your own training!

## Acknowledgments

- Renaissance Periodization for the auto-regulation methodology
- Supabase for the excellent backend platform
- Next.js team for the amazing framework

---

**Train hard, recover smart, grow consistently.** 💪
