import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedLocations() {
  console.log('Seeding locations...')
  
  const csvPath = path.join(__dirname, '../../data/locations.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  const locations = records.map((r: any) => ({
    location_id: r.location_id,
    store_code: r.store_code,
    name: r.name,
    address: r.address,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    primary_category: r.primary_category,
    phone: r.phone,
    website: r.website,
    average_rating: parseFloat(r.average_rating),
    total_reviews: parseInt(r.total_reviews),
    is_verified: r.is_verified === 'True'
  }))

  const { error } = await supabase.from('locations').upsert(locations)
  
  if (error) {
    console.error('Error seeding locations:', error)
    return false
  }
  
  console.log(`Seeded ${locations.length} locations`)
  return true
}

async function seedReviews() {
  console.log('Seeding reviews...')
  
  const csvPath = path.join(__dirname, '../../data/reviews.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  const reviews = records.map((r: any) => ({
    review_id: r.review_id,
    location_id: r.location_id,
    rating: parseInt(r.rating),
    review_text: r.review_text,
    reviewer_name: r.reviewer_name,
    review_date: r.review_date,
    language: r.language,
    has_reply: r.has_reply === 'True',
    reply_text: r.reply_text || null
  }))

  const { error } = await supabase.from('reviews').upsert(reviews)
  
  if (error) {
    console.error('Error seeding reviews:', error)
    return false
  }
  
  console.log(`Seeded ${reviews.length} reviews`)
  return true
}

async function seedKPIs() {
  console.log('Seeding KPIs...')
  
  const csvPath = path.join(__dirname, '../../data/kpis.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  const kpis = records.map((r: any) => ({
    kpi_id: r.kpi_id,
    location_id: r.location_id,
    week_start: r.week_start,
    impressions_maps: parseInt(r.impressions_maps),
    impressions_search: parseInt(r.impressions_search),
    phone_calls: parseInt(r.phone_calls),
    direction_requests: parseInt(r.direction_requests),
    website_clicks: parseInt(r.website_clicks),
    bookings: parseInt(r.bookings)
  }))

  const batchSize = 100
  for (let i = 0; i < kpis.length; i += batchSize) {
    const batch = kpis.slice(i, i + batchSize)
    const { error } = await supabase.from('kpis').upsert(batch)
    
    if (error) {
      console.error('Error seeding KPIs batch:', error)
      return false
    }
  }
  
  console.log(`Seeded ${kpis.length} KPIs`)
  return true
}

async function main() {
  console.log('Starting database seed...\n')
  
  const locationsOk = await seedLocations()
  if (!locationsOk) return
  
  const reviewsOk = await seedReviews()
  if (!reviewsOk) return
  
  const kpisOk = await seedKPIs()
  if (!kpisOk) return
  
  console.log('\nDatabase seeded successfully!')
}

main().catch(console.error)
