'use client'

import { AlertTriangle, TrendingDown, MessageSquareX, Star } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertItem } from '@/lib/types'
import Link from 'next/link'

interface AlertsPanelProps {
  alerts: AlertItem[]
}

const alertIcons = {
  rating: Star,
  trend: TrendingDown,
  review: MessageSquareX,
  response: MessageSquareX
}

const severityVariants = {
  high: 'danger',
  medium: 'warning',
  low: 'info'
} as const

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-500" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No alerts at this time. All locations are performing well.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Needs Attention
          </CardTitle>
          <Badge variant="danger">{alerts.length} alerts</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {alerts.slice(0, 5).map((alert, idx) => {
            const Icon = alertIcons[alert.alert_type]
            return (
              <Link 
                key={idx}
                href={`/locations/${alert.location_id}`}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-100' : 
                  alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    alert.severity === 'high' ? 'text-red-600' : 
                    alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{alert.store_code}</span>
                    <Badge variant={severityVariants[alert.severity]} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{alert.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                </div>
              </Link>
            )
          })}
        </div>
        {alerts.length > 5 && (
          <div className="p-4 border-t border-gray-100">
            <Link href="/locations?filter=alerts" className="text-sm text-blue-600 hover:underline">
              View all {alerts.length} alerts →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
