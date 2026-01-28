'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-blue-500' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={cn(
              'mt-1 text-sm font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-gray-50', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
