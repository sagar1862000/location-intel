import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  showValue?: boolean
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, showValue = true, size = 'md' }: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn('font-medium text-gray-700 ml-1', textSize)}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
