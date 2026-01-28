'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Eye, Phone, Navigation, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart } from '@/components/charts/line-chart'
import { getWeeklyTrends, getLocations, getKPIs, getCityPerformance } from '@/lib/data'
import { WeeklyTrend, Location, KPI, CityPerformance } from '@/lib/types'
import { formatNumber, cn } from '@/lib/utils'

export function TrendsContent() {
  const [trends, setTrends] = useState<WeeklyTrend[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [cityPerf, setCityPerf] = useState<CityPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [t, l, k, cp] = await Promise.all([
          getWeeklyTrends(),
          getLocations(),
          getKPIs(),
          getCityPerformance()
        ])
        setTrends(t)
        setLocations(l)
        setKpis(k)
        setCityPerf(cp)
      } catch (error) {
        console.error('Failed to load trends:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <TrendsSkeleton />

  const latestWeek = trends[trends.length - 1]
  const previousWeek = trends[trends.length - 2]

  const calcChange = (current: number, previous: number) => 
    previous > 0 ? ((current - previous) / previous) * 100 : 0

  const impressionChange = calcChange(latestWeek?.impressions || 0, previousWeek?.impressions || 0)
  const callChange = calcChange(latestWeek?.calls || 0, previousWeek?.calls || 0)
  const bookingChange = calcChange(latestWeek?.bookings || 0, previousWeek?.bookings || 0)
  const directionChange = calcChange(latestWeek?.directions || 0, previousWeek?.directions || 0)

  const getLocationTrend = (locationId: string) => {
    const locKpis = kpis.filter(k => k.location_id === locationId)
    if (locKpis.length < 4) return 0
    
    const recent = locKpis.slice(-2)
    const older = locKpis.slice(-4, -2)
    const recentAvg = recent.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
    const olderAvg = older.reduce((s, k) => s + k.impressions_maps + k.impressions_search, 0) / 2
    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
  }

  const locationTrends = locations.map(loc => ({
    ...loc,
    trend: getLocationTrend(loc.location_id)
  })).sort((a, b) => b.trend - a.trend)

  const topGrowing = locationTrends.slice(0, 5)
  const topDeclining = locationTrends.slice(-5).reverse()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                impressionChange >= 0 ? 'bg-green-50' : 'bg-red-50'
              )}>
                <Eye className={cn(
                  'w-5 h-5',
                  impressionChange >= 0 ? 'text-green-500' : 'text-red-500'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(latestWeek?.impressions || 0)}</p>
                <p className="text-sm text-gray-500">Impressions</p>
              </div>
            </div>
            <Badge variant={impressionChange >= 0 ? 'success' : 'danger'}>
              {impressionChange >= 0 ? '+' : ''}{impressionChange.toFixed(1)}%
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                callChange >= 0 ? 'bg-green-50' : 'bg-red-50'
              )}>
                <Phone className={cn(
                  'w-5 h-5',
                  callChange >= 0 ? 'text-green-500' : 'text-red-500'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(latestWeek?.calls || 0)}</p>
                <p className="text-sm text-gray-500">Calls</p>
              </div>
            </div>
            <Badge variant={callChange >= 0 ? 'success' : 'danger'}>
              {callChange >= 0 ? '+' : ''}{callChange.toFixed(1)}%
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                directionChange >= 0 ? 'bg-green-50' : 'bg-red-50'
              )}>
                <Navigation className={cn(
                  'w-5 h-5',
                  directionChange >= 0 ? 'text-green-500' : 'text-red-500'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(latestWeek?.directions || 0)}</p>
                <p className="text-sm text-gray-500">Directions</p>
              </div>
            </div>
            <Badge variant={directionChange >= 0 ? 'success' : 'danger'}>
              {directionChange >= 0 ? '+' : ''}{directionChange.toFixed(1)}%
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                bookingChange >= 0 ? 'bg-green-50' : 'bg-red-50'
              )}>
                <Calendar className={cn(
                  'w-5 h-5',
                  bookingChange >= 0 ? 'text-green-500' : 'text-red-500'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(latestWeek?.bookings || 0)}</p>
                <p className="text-sm text-gray-500">Bookings</p>
              </div>
            </div>
            <Badge variant={bookingChange >= 0 ? 'success' : 'danger'}>
              {bookingChange >= 0 ? '+' : ''}{bookingChange.toFixed(1)}%
            </Badge>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>10-Week Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={trends}
            xKey="week"
            lines={[
              { key: 'impressions', color: '#8b5cf6', name: 'Impressions' },
              { key: 'calls', color: '#10b981', name: 'Calls' },
              { key: 'directions', color: '#3b82f6', name: 'Directions' },
              { key: 'bookings', color: '#f59e0b', name: 'Bookings' }
            ]}
            height={350}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Fastest Growing Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {topGrowing.map((loc, idx) => (
                <div key={loc.location_id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{loc.store_code}</p>
                      <p className="text-sm text-gray-500">{loc.city}</p>
                    </div>
                  </div>
                  <Badge variant="success">+{loc.trend.toFixed(1)}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Locations Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {topDeclining.map((loc, idx) => (
                <div key={loc.location_id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{loc.store_code}</p>
                      <p className="text-sm text-gray-500">{loc.city}</p>
                    </div>
                  </div>
                  <Badge variant="danger">{loc.trend.toFixed(1)}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>City-wise Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">City</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Locations</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Avg Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Total Calls</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Total Bookings</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Calls/Location</th>
                </tr>
              </thead>
              <tbody>
                {cityPerf.map((city) => (
                  <tr key={city.city} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{city.city}</td>
                    <td className="py-3 px-4">{city.locations}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'font-medium',
                        city.avg_rating >= 4.5 ? 'text-green-600' :
                        city.avg_rating >= 4.0 ? 'text-green-500' :
                        city.avg_rating >= 3.5 ? 'text-yellow-500' : 'text-red-500'
                      )}>
                        {city.avg_rating.toFixed(1)} ★
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatNumber(city.total_calls)}</td>
                    <td className="py-3 px-4">{formatNumber(city.total_bookings)}</td>
                    <td className="py-3 px-4">{Math.round(city.total_calls / city.locations)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TrendsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
