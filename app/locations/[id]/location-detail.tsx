'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Phone, Globe, Star, Eye, 
  TrendingUp, TrendingDown, MessageSquare, AlertTriangle,
  CheckCircle, XCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HealthScore } from '@/components/ui/health-score'
import { RatingStars } from '@/components/ui/rating-stars'
import { LineChart } from '@/components/charts/line-chart'
import { getLocationInsights } from '@/lib/data'
import { formatNumber, getRelativeTime } from '@/lib/utils'

interface LocationDetailProps {
  locationId: string
}

export function LocationDetail({ locationId }: LocationDetailProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const insights = await getLocationInsights(locationId)
        setData(insights)
      } catch (error) {
        console.error('Failed to load location:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [locationId])

  if (loading) return <DetailSkeleton />
  if (!data) return <NotFound />

  const { location, healthScore, kpiTrend, responseRate, recentReviews, unansweredNegative, topIssues, weeklyKpis, totalImpressions, totalCalls, totalBookings } = data

  return (
    <div className="space-y-6">
      <Link href="/locations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Locations
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <HealthScore score={healthScore} size="lg" />
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{location.store_code}</h1>
                <Badge variant={location.is_verified ? 'success' : 'warning'}>
                  {location.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="info">{location.primary_category}</Badge>
              </div>
              <p className="text-lg text-gray-600 mt-1">{location.name}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location.address}, {location.city}, {location.state} - {location.pincode}
                </span>
              </div>
              <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {location.phone}
                </span>
                <a href={location.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              </div>
            </div>

            <div className="text-right">
              <RatingStars rating={location.average_rating} />
              <p className="text-sm text-gray-500 mt-1">{location.total_reviews} reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
              <p className="text-sm text-gray-500">Total Impressions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(totalCalls)}</p>
              <p className="text-sm text-gray-500">Total Calls</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${kpiTrend >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {kpiTrend >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold ${kpiTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpiTrend >= 0 ? '+' : ''}{kpiTrend.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Visibility Trend</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{responseRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500">Response Rate</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={weeklyKpis}
                xKey="week"
                lines={[
                  { key: 'impressions', color: '#8b5cf6', name: 'Impressions' },
                  { key: 'calls', color: '#10b981', name: 'Calls' },
                  { key: 'bookings', color: '#f59e0b', name: 'Bookings' }
                ]}
                height={280}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Issues to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topIssues.length > 0 ? (
              <div className="space-y-3">
                {topIssues.map((issue: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-orange-700">{issue.issue}</span>
                    <Badge variant="warning">{issue.count} mentions</Badge>
                  </div>
                ))}
                {unansweredNegative > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-700">Unanswered Reviews</span>
                    <Badge variant="danger">{unansweredNegative} pending</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>No major issues detected</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {recentReviews.slice(0, 5).map((review: any) => (
              <div key={review.review_id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.reviewer_name}</span>
                      <RatingStars rating={review.rating} showValue={false} size="sm" />
                      <Badge variant={review.language === 'hi' ? 'info' : 'default'}>
                        {review.language === 'hi' ? 'Hindi' : 'English'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mt-1">{review.review_text}</p>
                    {review.has_reply && review.reply_text && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Business Response:</p>
                        <p className="text-sm text-gray-600">{review.reply_text}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {review.has_reply ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className="text-sm text-gray-500">{getRelativeTime(review.review_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold text-gray-900">Location Not Found</h2>
      <p className="text-gray-500 mt-2">The location you're looking for doesn't exist.</p>
      <Link href="/locations" className="mt-4 text-blue-500 hover:underline">
        ← Back to Locations
      </Link>
    </div>
  )
}
