'use client'

import { Lightbulb, TrendingUp, MapPin, MessageSquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Location, CityPerformance, CategoryPerformance } from '@/lib/types'

interface InsightsPanelProps {
  locations: Location[]
  cityPerformance: CityPerformance[]
  categoryPerformance: CategoryPerformance[]
  weeklyChange: number
}

export function InsightsPanel({ 
  locations, 
  cityPerformance, 
  categoryPerformance,
  weeklyChange 
}: InsightsPanelProps) {
  const topCity = cityPerformance[0]
  const topCategory = categoryPerformance[0]
  const highRatingCount = locations.filter(l => l.average_rating >= 4.5).length
  const lowRatingCount = locations.filter(l => l.average_rating < 3.5).length

  const insights = [
    {
      icon: MapPin,
      color: 'text-blue-500 bg-blue-50',
      text: `${topCity?.city || 'N/A'} leads with ${topCity?.avg_rating.toFixed(1) || 'N/A'} avg rating across ${topCity?.locations || 0} locations`
    },
    {
      icon: TrendingUp,
      color: weeklyChange >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50',
      text: `Overall visibility ${weeklyChange >= 0 ? 'up' : 'down'} ${Math.abs(weeklyChange).toFixed(1)}% this week`
    },
    {
      icon: MessageSquare,
      color: 'text-purple-500 bg-purple-50',
      text: `${topCategory?.category || 'N/A'} category has highest satisfaction at ${topCategory?.avg_rating.toFixed(1) || 'N/A'} stars`
    },
    {
      icon: Lightbulb,
      color: 'text-yellow-500 bg-yellow-50',
      text: `${highRatingCount} locations above 4.5★, ${lowRatingCount} need improvement`
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
