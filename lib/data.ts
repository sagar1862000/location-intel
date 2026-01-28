import { supabase } from './supabase'
import { 
  Location, Review, KPI, DashboardStats, AlertItem, 
  WeeklyTrend, CityPerformance, CategoryPerformance 
} from './types'
import { calculateHealthScore, categorizeFeedback } from './utils'

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('average_rating', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('location_id', id)
    .single()

  if (error) return null
  return data
}

export async function getReviews(locationId?: string): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*')
    .order('review_date', { ascending: false })

  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getKPIs(locationId?: string): Promise<KPI[]> {
  let query = supabase
    .from('kpis')
    .select('*')
    .order('week_start', { ascending: true })

  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [locations, reviews, kpis] = await Promise.all([
    getLocations(),
    getReviews(),
    getKPIs()
  ])

  const avgRating = locations.reduce((sum, loc) => sum + loc.average_rating, 0) / locations.length
  const totalImpressions = kpis.reduce((sum, k) => sum + k.impressions_maps + k.impressions_search, 0)
  const totalCalls = kpis.reduce((sum, k) => sum + k.phone_calls, 0)
  const totalBookings = kpis.reduce((sum, k) => sum + k.bookings, 0)

  const lowRatingLocations = locations.filter(loc => loc.average_rating < 3.5).length
  const topPerformers = locations.filter(loc => loc.average_rating >= 4.5).length

  return {
    total_locations: locations.length,
    average_rating: avgRating,
    total_reviews: reviews.length,
    total_impressions: totalImpressions,
    total_calls: totalCalls,
    total_bookings: totalBookings,
    locations_needing_attention: lowRatingLocations,
    top_performers: topPerformers
  }
}

export async function getAlerts(): Promise<AlertItem[]> {
  const [locations, reviews, kpis] = await Promise.all([
    getLocations(),
    getReviews(),
    getKPIs()
  ])

  const alerts: AlertItem[] = []

  for (const location of locations) {
    if (location.average_rating < 3.0) {
      alerts.push({
        location_id: location.location_id,
        store_code: location.store_code,
        name: location.name,
        city: location.city,
        alert_type: 'rating',
        severity: 'high',
        message: `Critical rating: ${location.average_rating} stars`
      })
    } else if (location.average_rating < 3.5) {
      alerts.push({
        location_id: location.location_id,
        store_code: location.store_code,
        name: location.name,
        city: location.city,
        alert_type: 'rating',
        severity: 'medium',
        message: `Low rating: ${location.average_rating} stars`
      })
    }

    const locationReviews = reviews.filter(r => r.location_id === location.location_id)
    const recentNegative = locationReviews
      .filter(r => r.rating <= 2)
      .slice(0, 5)
    const unanswered = recentNegative.filter(r => !r.has_reply)

    if (unanswered.length >= 2) {
      alerts.push({
        location_id: location.location_id,
        store_code: location.store_code,
        name: location.name,
        city: location.city,
        alert_type: 'response',
        severity: unanswered.length >= 3 ? 'high' : 'medium',
        message: `${unanswered.length} negative reviews without response`
      })
    }

    const locationKpis = kpis.filter(k => k.location_id === location.location_id)
    if (locationKpis.length >= 4) {
      const recent = locationKpis.slice(-2)
      const older = locationKpis.slice(-4, -2)
      
      const recentAvg = recent.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
      const olderAvg = older.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
      
      const change = ((recentAvg - olderAvg) / olderAvg) * 100
      
      if (change < -20) {
        alerts.push({
          location_id: location.location_id,
          store_code: location.store_code,
          name: location.name,
          city: location.city,
          alert_type: 'trend',
          severity: change < -30 ? 'high' : 'medium',
          message: `Visibility dropped ${Math.abs(change).toFixed(0)}% in 2 weeks`
        })
      }
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

export async function getWeeklyTrends(): Promise<WeeklyTrend[]> {
  const kpis = await getKPIs()
  
  const weeklyMap = new Map<string, WeeklyTrend>()
  
  for (const kpi of kpis) {
    const existing = weeklyMap.get(kpi.week_start)
    if (existing) {
      existing.impressions += kpi.impressions_maps + kpi.impressions_search
      existing.calls += kpi.phone_calls
      existing.bookings += kpi.bookings
      existing.directions += kpi.direction_requests
    } else {
      weeklyMap.set(kpi.week_start, {
        week: kpi.week_start,
        impressions: kpi.impressions_maps + kpi.impressions_search,
        calls: kpi.phone_calls,
        bookings: kpi.bookings,
        directions: kpi.direction_requests
      })
    }
  }
  
  return Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week))
}

export async function getCityPerformance(): Promise<CityPerformance[]> {
  const [locations, kpis] = await Promise.all([getLocations(), getKPIs()])
  
  const cityMap = new Map<string, { locations: Location[], kpis: KPI[] }>()
  
  for (const loc of locations) {
    if (!cityMap.has(loc.city)) {
      cityMap.set(loc.city, { locations: [], kpis: [] })
    }
    cityMap.get(loc.city)!.locations.push(loc)
  }
  
  for (const kpi of kpis) {
    const loc = locations.find(l => l.location_id === kpi.location_id)
    if (loc && cityMap.has(loc.city)) {
      cityMap.get(loc.city)!.kpis.push(kpi)
    }
  }
  
  const result: CityPerformance[] = []
  
  for (const [city, data] of cityMap) {
    const avgRating = data.locations.reduce((s, l) => s + l.average_rating, 0) / data.locations.length
    const totalCalls = data.kpis.reduce((s, k) => s + k.phone_calls, 0)
    const totalBookings = data.kpis.reduce((s, k) => s + k.bookings, 0)
    
    result.push({
      city,
      locations: data.locations.length,
      avg_rating: avgRating,
      total_calls: totalCalls,
      total_bookings: totalBookings
    })
  }
  
  return result.sort((a, b) => b.avg_rating - a.avg_rating)
}

export async function getCategoryPerformance(): Promise<CategoryPerformance[]> {
  const [locations, kpis] = await Promise.all([getLocations(), getKPIs()])
  
  const catMap = new Map<string, { locations: Location[], kpis: KPI[] }>()
  
  for (const loc of locations) {
    if (!catMap.has(loc.primary_category)) {
      catMap.set(loc.primary_category, { locations: [], kpis: [] })
    }
    catMap.get(loc.primary_category)!.locations.push(loc)
  }
  
  for (const kpi of kpis) {
    const loc = locations.find(l => l.location_id === kpi.location_id)
    if (loc && catMap.has(loc.primary_category)) {
      catMap.get(loc.primary_category)!.kpis.push(kpi)
    }
  }
  
  const result: CategoryPerformance[] = []
  
  for (const [category, data] of catMap) {
    const avgRating = data.locations.reduce((s, l) => s + l.average_rating, 0) / data.locations.length
    const totalImpressions = data.kpis.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0)
    
    result.push({
      category,
      locations: data.locations.length,
      avg_rating: avgRating,
      avg_impressions: totalImpressions / data.locations.length
    })
  }
  
  return result.sort((a, b) => b.avg_rating - a.avg_rating)
}

export async function getReviewAnalytics() {
  const reviews = await getReviews()
  
  const ratingDistribution = [0, 0, 0, 0, 0]
  const categoryCount: Record<string, { positive: number, negative: number }> = {}
  let totalResponded = 0
  let hindiCount = 0
  
  for (const review of reviews) {
    ratingDistribution[review.rating - 1]++
    
    if (review.has_reply) totalResponded++
    if (review.language === 'hi') hindiCount++
    
    const categories = categorizeFeedback(review.review_text)
    for (const cat of categories) {
      if (!categoryCount[cat]) {
        categoryCount[cat] = { positive: 0, negative: 0 }
      }
      if (review.rating >= 4) {
        categoryCount[cat].positive++
      } else if (review.rating <= 2) {
        categoryCount[cat].negative++
      }
    }
  }
  
  return {
    total: reviews.length,
    ratingDistribution: ratingDistribution.map((count, i) => ({
      rating: i + 1,
      count
    })),
    responseRate: (totalResponded / reviews.length) * 100,
    hindiPercentage: (hindiCount / reviews.length) * 100,
    categoryBreakdown: Object.entries(categoryCount).map(([category, counts]) => ({
      category,
      ...counts
    }))
  }
}

export async function getLocationInsights(locationId: string) {
  const [location, reviews, kpis] = await Promise.all([
    getLocationById(locationId),
    getReviews(locationId),
    getKPIs(locationId)
  ])
  
  if (!location) return null
  
  const recentReviews = reviews.slice(0, 10)
  const negativeReviews = reviews.filter(r => r.rating <= 2)
  const unansweredNegative = negativeReviews.filter(r => !r.has_reply)
  
  const kpiTrend = kpis.length >= 4 ? (() => {
    const recent = kpis.slice(-2)
    const older = kpis.slice(-4, -2)
    const recentAvg = recent.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
    const olderAvg = older.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
    return ((recentAvg - olderAvg) / olderAvg) * 100
  })() : 0
  
  const responseRate = reviews.length > 0 
    ? reviews.filter(r => r.has_reply).length / reviews.length 
    : 0
  
  const healthScore = calculateHealthScore(
    location.average_rating,
    0,
    responseRate,
    kpiTrend
  )
  
  const feedbackThemes: Record<string, number> = {}
  for (const review of negativeReviews) {
    const categories = categorizeFeedback(review.review_text)
    for (const cat of categories) {
      feedbackThemes[cat] = (feedbackThemes[cat] || 0) + 1
    }
  }
  
  const topIssues = Object.entries(feedbackThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([issue, count]) => ({ issue, count }))
  
  const weeklyKpis = kpis.map(k => ({
    week: k.week_start,
    impressions: k.impressions_maps + k.impressions_search,
    calls: k.phone_calls,
    bookings: k.bookings
  }))
  
  return {
    location,
    healthScore,
    kpiTrend,
    responseRate: responseRate * 100,
    recentReviews,
    unansweredNegative: unansweredNegative.length,
    topIssues,
    weeklyKpis,
    totalImpressions: kpis.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0),
    totalCalls: kpis.reduce((s, k) => s + k.phone_calls, 0),
    totalBookings: kpis.reduce((s, k) => s + k.bookings, 0)
  }
}
