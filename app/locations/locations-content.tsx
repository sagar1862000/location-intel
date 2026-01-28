'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, ExternalLink, ChevronRight, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/ui/rating-stars'
import { HealthScore } from '@/components/ui/health-score'
import { getLocations, getKPIs, getReviews } from '@/lib/data'
import { Location, KPI, Review } from '@/lib/types'
import { calculateHealthScore, cn } from '@/lib/utils'

type FilterOption = 'all' | 'attention' | 'top' | 'verified'

export function LocationsContent() {
  const [locations, setLocations] = useState<Location[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<FilterOption>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [l, k, r] = await Promise.all([
          getLocations(),
          getKPIs(),
          getReviews()
        ])
        setLocations(l)
        setKpis(k)
        setReviews(r)
      } catch (error) {
        console.error('Failed to load locations:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <LocationsSkeleton />

  const cities = [...new Set(locations.map(l => l.city))].sort()

  const getLocationHealth = (loc: Location) => {
    const locReviews = reviews.filter(r => r.location_id === loc.location_id)
    const responseRate = locReviews.length > 0
      ? locReviews.filter(r => r.has_reply).length / locReviews.length
      : 0

    const locKpis = kpis.filter(k => k.location_id === loc.location_id)
    const kpiTrend = locKpis.length >= 4 ? (() => {
      const recent = locKpis.slice(-2)
      const older = locKpis.slice(-4, -2)
      const recentAvg = recent.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
      const olderAvg = older.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
      return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
    })() : 0

    return calculateHealthScore(loc.average_rating, 0, responseRate, kpiTrend)
  }

  const filteredLocations = locations.filter(loc => {
    if (cityFilter !== 'all' && loc.city !== cityFilter) return false
    
    const health = getLocationHealth(loc)
    
    switch (filter) {
      case 'attention':
        return loc.average_rating < 3.5 || health < 50
      case 'top':
        return loc.average_rating >= 4.5
      case 'verified':
        return loc.is_verified
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {(['all', 'attention', 'top', 'verified'] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {f === 'all' && 'All'}
                {f === 'attention' && 'Needs Attention'}
                {f === 'top' && 'Top Performers'}
                {f === 'verified' && 'Verified'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredLocations.length} of {locations.length} locations
      </p>

      <div className="space-y-3">
        {filteredLocations.map(location => {
          const health = getLocationHealth(location)
          const locKpis = kpis.filter(k => k.location_id === location.location_id)
          const recentKpi = locKpis[locKpis.length - 1]

          return (
            <Link key={location.location_id} href={`/locations/${location.location_id}`}>
              <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-6">
                  <HealthScore score={health} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{location.store_code}</h3>
                      <Badge variant={location.is_verified ? 'success' : 'default'}>
                        {location.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant="info">{location.primary_category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{location.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location.city}, {location.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {location.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <RatingStars rating={location.average_rating} />
                    <p className="text-xs text-gray-500 mt-1">
                      {location.total_reviews} reviews
                    </p>
                  </div>

                  <div className="text-right w-32">
                    {recentKpi && (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {(recentKpi.impressions_maps + recentKpi.impressions_search).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">impressions/week</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {recentKpi.phone_calls}
                        </p>
                        <p className="text-xs text-gray-500">calls/week</p>
                      </>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function LocationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg w-96" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
