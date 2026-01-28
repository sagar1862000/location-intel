import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { TrendsContent } from './trends-content'

export const dynamic = 'force-dynamic'

export default function TrendsPage() {
  return (
    <>
      <Header 
        title="Performance Trends" 
        subtitle="Track KPI changes and identify patterns over time"
      />
      <div className="p-8">
        <Suspense fallback={<TrendsSkeleton />}>
          <TrendsContent />
        </Suspense>
      </div>
    </>
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
