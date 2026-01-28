import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Health score weights - might need tuning based on business feedback
export function calculateHealthScore(
  rating: number,
  ratingTrend: number,
  responseRate: number,
  kpiTrend: number
): number {
  // Rating is most important - 40%
  const ratingScore = (rating / 5) * 40
  
  // TODO: ratingTrend calculation needs more historical data to be accurate
  const trendScore = Math.min(Math.max((ratingTrend + 1) / 2, 0), 1) * 20
  const responseScore = responseRate * 20
  const kpiScore = Math.min(Math.max((kpiTrend + 50) / 100, 0), 1) * 20
  
  return Math.round(ratingScore + trendScore + responseScore + kpiScore)
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4.0) return 'text-green-500'
  if (rating >= 3.5) return 'text-yellow-500'
  if (rating >= 3.0) return 'text-orange-500'
  return 'text-red-500'
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50'
  if (score >= 40) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

export function getTrendIcon(change: number): { icon: string; color: string } {
  if (change > 5) return { icon: '↑', color: 'text-green-500' }
  if (change < -5) return { icon: '↓', color: 'text-red-500' }
  return { icon: '→', color: 'text-gray-500' }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatPercentage(num: number): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(1)}%`
}

export function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInDays = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

// Simple keyword-based sentiment - could use NLP library for better accuracy
export function extractSentimentKeywords(text: string): {
  positive: string[]
  negative: string[]
} {
  // These keywords were picked from manually reviewing the sample data
  const positiveKeywords = [
    'clean', 'professional', 'friendly', 'helpful', 
    'excellent', 'great', 'best', 'recommend', 'quick',
    'hygienic', 'polite', 'caring'
  ]
  
  const negativeKeywords = [
    'wait', 'waiting', 'long', 'rude', 'dirty',
    'expensive', 'overpriced', 'unprofessional',
    'wrong', 'uncomfortable'
  ]
  
  const lowerText = text.toLowerCase()
  
  return {
    positive: positiveKeywords.filter(kw => lowerText.includes(kw)),
    negative: negativeKeywords.filter(kw => lowerText.includes(kw))
  }
}

// Categorize feedback into themes based on keywords
// TODO: This is pretty basic - would be better with proper NLP
export function categorizeFeedback(text: string): string[] {
  const categories: string[] = []
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('wait') || lowerText.includes('time')) {
    categories.push('Wait Time')
  }
  if (lowerText.includes('staff') || lowerText.includes('rude') || lowerText.includes('helpful')) {
    categories.push('Staff Behavior')
  }
  if (lowerText.includes('clean') || lowerText.includes('dirty')) {
    categories.push('Cleanliness')
  }
  if (lowerText.includes('price') || lowerText.includes('expensive') || lowerText.includes('bill')) {
    categories.push('Billing')
  }
  if (lowerText.includes('doctor') || lowerText.includes('treatment')) {
    categories.push('Medical Care')
  }
  
  return categories.length > 0 ? categories : ['General']
}