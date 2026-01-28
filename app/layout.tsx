import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Location Intelligence Platform',
  description: 'Location intelligence platform for multi-location businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
