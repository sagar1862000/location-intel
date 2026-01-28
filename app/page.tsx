import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { DashboardContent } from './dashboard-content'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <>
      <Header 
        title="Executive Dashboard" 
        subtitle="Real-time overview of all 50 locations"
      />
      <div className="p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
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
