-- Supabase SQL Schema for Location Intelligence Platform
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  location_id UUID PRIMARY KEY,
  store_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  primary_category VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  average_rating DECIMAL(2, 1) NOT NULL,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id UUID PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  review_date DATE NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  has_reply BOOLEAN NOT NULL DEFAULT false,
  reply_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIs table
CREATE TABLE IF NOT EXISTS kpis (
  kpi_id UUID PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  impressions_maps INTEGER NOT NULL DEFAULT 0,
  impressions_search INTEGER NOT NULL DEFAULT 0,
  phone_calls INTEGER NOT NULL DEFAULT 0,
  direction_requests INTEGER NOT NULL DEFAULT 0,
  website_clicks INTEGER NOT NULL DEFAULT 0,
  bookings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, week_start)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_location ON reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_kpis_location ON kpis(location_id);
CREATE INDEX IF NOT EXISTS idx_kpis_week ON kpis(week_start);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_rating ON locations(average_rating);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access on kpis" ON kpis FOR SELECT USING (true);

-- Grant usage to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
