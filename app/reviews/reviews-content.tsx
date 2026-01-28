'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, Globe } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/ui/rating-stars'
import { BarChart } from '@/components/charts/bar-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { getReviewAnalytics, getReviews, getLocations } from '@/lib/data'
import { Review, Location } from '@/lib/types'
import { getRelativeTime, cn } from '@/lib/utils'

export function ReviewsContent() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'unanswered'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [a, r, l] = await Promise.all([
          getReviewAnalytics(),
          getReviews(),
          getLocations()
        ])
        setAnalytics(a)
        setReviews(r)
        setLocations(l)
      } catch (error) {
        console.error('Failed to load reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !analytics) return <ReviewsSkeleton />

  // Filter reviews based on selection
  const filteredReviews = reviews.filter(r => {
    if (filter === 'positive') return r.rating >= 4
    if (filter === 'negative') return r.rating <= 2
    if (filter === 'unanswered') return !r.has_reply && r.rating <= 3
    return true
  })

  const positiveCount = reviews.filter(r => r.rating >= 4).length
  const negativeCount = reviews.filter(r => r.rating <= 2).length
  const unansweredCount = reviews.filter(r => !r.has_reply && r.rating <= 3).length

  const sentimentData = [
    { name: 'Positive (4-5★)', value: positiveCount, color: '#22c55e' },
    { name: 'Neutral (3★)', value: reviews.filter(r => r.rating === 3).length, color: '#eab308' },
    { name: 'Negative (1-2★)', value: negativeCount, color: '#ef4444' }
  ]

  const getLocationName = (locationId: string) => {
    const loc = locations.find(l => l.location_id === locationId)
    return loc ? loc.store_code : 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.total}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Reply className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.responseRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500">Response Rate</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.hindiPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-500">Hindi Reviews</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <ThumbsDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unansweredCount}</p>
              <p className="text-sm text-gray-500">Need Response</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analytics.ratingDistribution}
              dataKey="count"
              xKey="rating"
              height={250}
              colorByValue
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={sentimentData} height={250} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {analytics.categoryBreakdown.map((cat: any) => (
              <div key={cat.category} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{cat.category}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{cat.positive}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{cat.negative}</span>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ 
                      width: `${(cat.positive / (cat.positive + cat.negative || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reviews</CardTitle>
            <div className="flex items-center gap-2">
              {(['all', 'positive', 'negative', 'unanswered'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    filter === f
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {f === 'all' && 'All'}
                  {f === 'positive' && `Positive (${positiveCount})`}
                  {f === 'negative' && `Negative (${negativeCount})`}
                  {f === 'unanswered' && `Needs Reply (${unansweredCount})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredReviews.slice(0, 20).map((review) => (
              <div key={review.review_id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.reviewer_name}</span>
                      <RatingStars rating={review.rating} showValue={false} size="sm" />
                      <Badge variant="info">{getLocationName(review.location_id)}</Badge>
                      {review.language === 'hi' && (
                        <Badge variant="default">Hindi</Badge>
                      )}
                      {!review.has_reply && review.rating <= 3 && (
                        <Badge variant="danger">Needs Reply</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{review.review_text}</p>
                    {review.has_reply && review.reply_text && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200">
                        <p className="text-sm text-gray-600">{review.reply_text}</p>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {getRelativeTime(review.review_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
