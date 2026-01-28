export interface Location {
  location_id: string
  store_code: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  latitude: number
  longitude: number
  primary_category: string
  phone: string
  website: string
  average_rating: number
  total_reviews: number
  is_verified: boolean
}

export interface Review {
  review_id: string
  location_id: string
  rating: number
  review_text: string
  reviewer_name: string
  review_date: string
  language: string
  has_reply: boolean
  reply_text: string | null
}

export interface KPI {
  kpi_id: string
  location_id: string
  week_start: string
  impressions_maps: number
  impressions_search: number
  phone_calls: number
  direction_requests: number
  website_clicks: number
  bookings: number
}

export interface LocationWithMetrics extends Location {
  health_score: number
  trend: 'up' | 'down' | 'stable'
  recent_reviews: Review[]
  kpi_summary: {
    total_impressions: number
    total_calls: number
    total_bookings: number
    impression_change: number
    call_change: number
  }
}

export interface DashboardStats {
  total_locations: number
  average_rating: number
  total_reviews: number
  total_impressions: number
  total_calls: number
  total_bookings: number
  locations_needing_attention: number
  top_performers: number
}

export interface AlertItem {
  location_id: string
  store_code: string
  name: string
  city: string
  alert_type: 'rating' | 'trend' | 'review' | 'response'
  severity: 'high' | 'medium' | 'low'
  message: string
}

export interface ReviewSentiment {
  category: string
  positive: number
  negative: number
  neutral: number
}

export interface WeeklyTrend {
  week: string
  impressions: number
  calls: number
  bookings: number
  directions: number
}

export interface CityPerformance {
  city: string
  locations: number
  avg_rating: number
  total_calls: number
  total_bookings: number
}

export interface CategoryPerformance {
  category: string
  locations: number
  avg_rating: number
  avg_impressions: number
}
