# Location Intelligence Platform

A real-time intelligence platform for multi-location businesses, built with Next.js and Supabase.

![Dashboard Preview](docs/dashboard.png)

## Overview

Location Intelligence Platform transforms raw location data into actionable business insights. Instead of showing raw numbers, it answers key business questions:

- **Which locations need immediate attention and why?**
- **What patterns exist in customer feedback?**
- **How is performance trending across the network?**

Built for the assignment: Full-Stack Developer - Location Intelligence Platform

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Features

### Executive Dashboard
- Health scores for quick location assessment
- Real-time alerts for locations needing attention
- Performance trends over 10 weeks
- City and category performance comparisons
- Key insights auto-generated from data

### Location Intelligence
- Filterable list of all 50 locations
- Health score calculation (rating + trends + response rate)
- Individual location drill-down with:
  - Performance charts
  - Issue identification from reviews
  - Response rate tracking

### Review Intelligence
- Sentiment analysis by category (Wait Time, Staff, Cleanliness, etc.)
- Rating distribution visualization
- Response rate tracking
- Hindi/English language breakdown
- Unanswered negative review alerts

### Performance Trends
- 10-week KPI trend analysis
- Fastest growing locations
- Locations needing attention
- City-wise performance comparison

## Setup Instructions

### 1. Clone and Install

```bash
cd location-intel
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:

```sql
-- Copy contents from scripts/schema.sql
```

3. Get your credentials from Project Settings > API:
   - Project URL
   - anon/public key

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Seed the Database

```bash
npm run seed
```

This imports the CSV data from `/data` folder into Supabase.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
location-intel/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── locations/         # Locations list & detail
│   ├── reviews/           # Review intelligence
│   └── trends/            # Performance trends
├── components/
│   ├── ui/                # Reusable UI components
│   ├── charts/            # Chart components
│   ├── dashboard/         # Dashboard-specific components
│   └── layout/            # Navigation & layout
├── lib/
│   ├── data.ts           # Data fetching functions
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── scripts/
    ├── schema.sql        # Database schema
    └── seed.ts           # Data seeding script
```

## Architecture Decisions

### Why Server Components + Client Fetching?

Used client-side fetching (`useEffect`) instead of server components for:
- Real-time data updates without page refresh
- Better loading state handling
- Easier state management for filters

### Health Score Calculation

Combined multiple factors into a single 0-100 score:
- Rating (40%): Current Google rating
- Response Rate (20%): % of reviews with business reply
- KPI Trend (20%): Recent visibility changes
- Rating Trend (20%): Rating improvement/decline

### Alert System

Automatically flags locations based on:
- Rating below 3.0 (High severity)
- Rating below 3.5 (Medium severity)
- >20% visibility drop in 2 weeks
- Multiple unanswered negative reviews

## Data Insights Discovered

From analyzing the provided data:

### Struggling Locations
- **CHA-001** (Chandigarh): Lowest rating at 2.6, declining impressions
- **MUM-004** (Mumbai): 2.7 rating, needs immediate attention
- **HYD-004** (Hyderabad): 2.7 rating, low engagement

### Top Performers
- **CHE-002** (Chennai): Perfect 5.0 rating with 276 reviews
- **CHA-002** (Chandigarh): 4.9 rating, strong growth
- **AHM-003** (Ahmedabad): 4.7 rating, highest review volume (300)

### Common Feedback Themes
- **Wait Time**: Most frequent complaint in negative reviews
- **Staff Behavior**: Mix of positive ("helpful") and negative ("rude")
- **Cleanliness**: Key differentiator for high-rated locations
- **Billing Issues**: Present in several 1-2 star reviews

### Performance Patterns
- Diagnostic Centers have highest average rating
- Pharmacies show most variability
- Mumbai locations have highest call volume
- Week-over-week growth correlates with rating

## What I Would Build Next

With more time, I would add:

1. **AI-Powered Insights**: Use LLM to generate natural language summaries
2. **Predictive Alerts**: ML model to predict which locations might decline
3. **Competitor Analysis**: Compare against nearby competitors
4. **Response Templates**: AI-suggested replies for negative reviews
5. **Mobile App**: React Native version for on-the-go monitoring
6. **Export Reports**: PDF/Excel export for stakeholders
7. **Email Digests**: Daily/weekly summary emails
8. **Real-time Notifications**: Push alerts for critical issues

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## License

MIT
