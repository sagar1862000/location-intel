import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { ReviewsContent } from './reviews-content'

export const dynamic = 'force-dynamic'

export default function ReviewsPage() {
  return (
    <>
      <Header 
        title="Review Intelligence" 
        subtitle="Analyze customer feedback patterns and sentiments"
      />
      <div className="p-8">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsContent />
        </Suspense>
      </div>
    </>
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
