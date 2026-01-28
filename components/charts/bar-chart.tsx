'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface BarChartProps {
  data: any[]
  dataKey: string
  xKey: string
  color?: string
  height?: number
  colorByValue?: boolean
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export function BarChart({ 
  data, 
  dataKey, 
  xKey, 
  color = '#3b82f6', 
  height = 300,
  colorByValue = false 
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {colorByValue ? (
            data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[Math.min(entry.rating - 1, 4)]} />
            ))
          ) : (
            <Cell fill={color} />
          )}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
