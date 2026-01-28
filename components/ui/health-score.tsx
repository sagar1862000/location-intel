import { cn } from '@/lib/utils'

interface HealthScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function HealthScore({ score, size = 'md' }: HealthScoreProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50'
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 border-orange-200 bg-orange-50'
    return 'text-red-600 border-red-200 bg-red-50'
  }

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl'
  }

  return (
    <div className={cn(
      'rounded-full border-2 flex items-center justify-center font-bold',
      getColor(),
      sizes[size]
    )}>
      {score}
    </div>
  )
}
