import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { LocationsContent } from './locations-content'

export const dynamic = 'force-dynamic'

export default function LocationsPage() {
  return (
    <>
      <Header 
        title="Location Intelligence" 
        subtitle="Monitor and analyze all store locations"
      />
      <div className="p-8">
        <Suspense fallback={<LocationsSkeleton />}>
          <LocationsContent />
        </Suspense>
      </div>
    </>
  )
}

function LocationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg w-96" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
