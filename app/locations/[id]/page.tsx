import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { LocationDetail } from './location-detail'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default function LocationDetailPage({ params }: Props) {
  return (
    <>
      <Header 
        title="Location Details" 
        subtitle="In-depth analysis and recommendations"
      />
      <div className="p-8">
        <Suspense fallback={<DetailSkeleton />}>
          <LocationDetail locationId={params.id} />
        </Suspense>
      </div>
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
