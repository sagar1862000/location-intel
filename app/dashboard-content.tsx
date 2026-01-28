'use client'

import { useEffect, useState } from 'react'
import { MapPin, Star, Phone, Eye, Calendar, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { TopPerformers } from '@/components/dashboard/top-performers'
import { InsightsPanel } from '@/components/dashboard/insights-panel'
import { LineChart } from '@/components/charts/line-chart'
import { 
  getLocations, 
  getDashboardStats, 
  getAlerts, 
  getWeeklyTrends,
  getCityPerformance,
  getCategoryPerformance
} from '@/lib/data'
import { 
  Location, 
  DashboardStats, 
  AlertItem, 
  WeeklyTrend,
  CityPerformance,
  CategoryPerformance 
} from '@/lib/types'
import { formatNumber } from '@/lib/utils'

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [trends, setTrends] = useState<WeeklyTrend[]>([])
  const [cityPerf, setCityPerf] = useState<CityPerformance[]>([])
  const [catPerf, setCatPerf] = useState<CategoryPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [s, l, a, t, cp, cap] = await Promise.all([
          getDashboardStats(),
          getLocations(),
          getAlerts(),
          getWeeklyTrends(),
          getCityPerformance(),
          getCategoryPerformance()
        ])
        setStats(s)
        setLocations(l)
        setAlerts(a)
        setTrends(t)
        setCityPerf(cp)
        setCatPerf(cap)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !stats) {
    return <DashboardSkeleton />
  }

  const weeklyChange = trends.length >= 2
    ? ((trends[trends.length - 1].impressions - trends[trends.length - 2].impressions) / trends[trends.length - 2].impressions) * 100
    : 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Locations"
          value={stats.total_locations}
          icon={MapPin}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Average Rating"
          value={stats.average_rating.toFixed(1)}
          icon={Star}
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Total Impressions"
          value={formatNumber(stats.total_impressions)}
          change={weeklyChange}
          icon={Eye}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Total Calls"
          value={formatNumber(stats.total_calls)}
          icon={Phone}
          iconColor="text-green-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={trends}
                xKey="week"
                lines={[
                  { key: 'impressions', color: '#8b5cf6', name: 'Impressions' },
                  { key: 'calls', color: '#10b981', name: 'Calls' },
                  { key: 'bookings', color: '#f59e0b', name: 'Bookings' }
                ]}
                height={320}
              />
            </CardContent>
          </Card>
        </div>

        <AlertsPanel alerts={alerts} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <TopPerformers locations={locations} />
        <div className="col-span-2">
          <InsightsPanel 
            locations={locations}
            cityPerformance={cityPerf}
            categoryPerformance={catPerf}
            weeklyChange={weeklyChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cityPerf.slice(0, 6).map((city) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{city.city}</p>
                      <p className="text-xs text-gray-500">{city.locations} locations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{city.avg_rating.toFixed(1)} ★</p>
                    <p className="text-xs text-gray-500">{formatNumber(city.total_calls)} calls</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {catPerf.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cat.category}</p>
                      <p className="text-xs text-gray-500">{cat.locations} locations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{cat.avg_rating.toFixed(1)} ★</p>
                    <p className="text-xs text-gray-500">{formatNumber(cat.avg_impressions)} avg imp</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-96 bg-gray-200 rounded-xl" />
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
