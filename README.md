# Location Intelligence Platform

A dashboard for multi-location businesses to track performance and get insights from their Google Business data.

## What I Built

Instead of just showing raw data in tables, I focused on building an **intelligence layer** that answers business questions:

- Which locations need attention right now?
- What are customers complaining about?
- Which locations are growing vs declining?

### Key Features

**Health Score** - Single 0-100 score combining rating, response rate, and KPI trends. A location with 5 stars but declining visibility will score lower than you'd expect.

**Alert System** - Automatically flags locations with:
- Rating below 3.0 or 3.5
- Unanswered negative reviews
- Big drops in impressions (>20% in 2 weeks)

**Review Analysis** - Categorizes reviews into themes (Wait Time, Staff Behavior, Cleanliness, etc.) to spot patterns.

**Trend Tracking** - Shows which locations are growing fastest and which are declining.

## Tech Stack

- Next.js 14 with App Router
- Supabase (PostgreSQL)
- Tailwind CSS
- Recharts for charts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create Supabase project and run schema from `scripts/schema.sql`

3. Add credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
```

4. Seed the database:
```bash
npm run seed
```

5. Run dev server:
```bash
npm run dev
```

## Project Structure

```
app/                 # Pages (dashboard, locations, reviews, trends)
components/          # UI components, charts, layout
lib/
  ├── data.ts       # Data fetching and aggregation
  ├── utils.ts      # Health score, sentiment analysis
  └── types.ts      # TypeScript interfaces
scripts/
  ├── schema.sql    # Database tables
  └── seed.ts       # CSV import script
```

## Decisions & Tradeoffs

**Client-side data fetching** - Used `useEffect` instead of server components. Easier to handle loading states and filters, but means more client-side processing. With 50 locations this is fine, but would need to rethink for larger datasets.

**Simple sentiment analysis** - Used keyword matching rather than ML/NLP. It's basic but works okay for the sample data. Would definitely want something more sophisticated in production.

**Health score weights** - The 40/20/20/20 split was a guess. Would need business input to tune these properly.

## Insights from the Data

Looking at the sample data:

- **Worst performers**: CHA-001 (2.6 rating), MUM-004 (2.7), HYD-004 (2.7)
- **Best performers**: CHE-002 (5.0 rating), CHA-002 (4.9), multiple at 4.7
- **Common complaints**: Wait time comes up a lot in negative reviews
- **Response rates vary a lot** - some locations reply to everything, others ignore complaints

## What I'd Add Next

With more time:
- Better NLP for review analysis (maybe use an LLM API)
- Export to PDF/Excel for sharing
- Email alerts when something needs attention
- Comparison between time periods
- Mobile responsive improvements

## Known Limitations

- Sentiment analysis is pretty basic (just keyword matching)
- Health score weights aren't validated against real business outcomes
- No caching - fetches everything on each page load
- Date handling could be more robust
