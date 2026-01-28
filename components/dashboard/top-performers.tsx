'use client'

import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RatingStars } from '@/components/ui/rating-stars'
import { Location } from '@/lib/types'
import Link from 'next/link'

interface TopPerformersProps {
  locations: Location[]
}

export function TopPerformers({ locations }: TopPerformersProps) {
  const topLocations = locations
    .filter(l => l.average_rating >= 4.5)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {topLocations.map((location, idx) => (
            <Link
              key={location.location_id}
              href={`/locations/${location.location_id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{location.name}</p>
                <p className="text-sm text-gray-500">{location.city}</p>
              </div>
              <RatingStars rating={location.average_rating} size="sm" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
