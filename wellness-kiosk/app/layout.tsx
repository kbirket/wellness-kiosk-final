import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Hub',
  description: 'Patterson Health Centers Wellness Hub',
  manifest: '/manifest.json',
  themeColor: '#001f3f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
