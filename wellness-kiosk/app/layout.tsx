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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wellness Kiosk" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
