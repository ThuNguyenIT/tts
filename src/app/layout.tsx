import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { Toaster } from '@/components/ui/sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Analytics from '@/components/seo/analytics'
import StructuredData from '@/components/seo/structured-data'
import DevToolsBlocker from './dev-tools-blocker'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME} - AI Text to Speech Generator`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: `${process.env.NEXT_PUBLIC_APP_NAME} là công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau. Hoàn toàn miễn phí và dễ sử dụng.`,
  keywords: [
    'text to speech',
    'chuyển văn bản thành giọng nói',
    'TTS online',
    'AI voice generator',
    'tạo giọng nói AI',
    'text to speech tiếng Việt',
    'chuyển đổi văn bản thành âm thanh',
    'giọng nói nhân tạo',
    'voice synthesis',
    'speech synthesis',
    'AI TTS',
    'free text to speech',
    'online voice generator',
    'text to speech miễn phí',
    'chuyển text thành giọng nói',
    'tạo âm thanh từ văn bản',
    'voice cloning',
    'AI voice',
    'speech to text',
    'voice over',
    'narrator AI',
    'audio generator',
    'voice synthesis online',
    'text to speech tool',
    `${process.env.NEXT_PUBLIC_APP_NAME}`,
  ],
  authors: [{ name: `${process.env.NEXT_PUBLIC_APP_NAME}` }],
  creator: `${process.env.NEXT_PUBLIC_APP_NAME}`,
  publisher: `${process.env.NEXT_PUBLIC_APP_NAME}`,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || '/'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: `${process.env.NEXT_PUBLIC_APP_NAME} - AI Text to Speech Generator`,
    description: `${process.env.NEXT_PUBLIC_APP_NAME} là công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau.`,
    siteName: `${process.env.NEXT_PUBLIC_APP_NAME}`,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} - AI Text to Speech Generator`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ttsgenerator',
    creator: '@ttsgenerator',
    title: `${process.env.NEXT_PUBLIC_APP_NAME} - AI Text to Speech Generator`,
    description: `${process.env.NEXT_PUBLIC_APP_NAME} là công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau.`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || '/',
    languages: {
      'vi-VN': process.env.NEXT_PUBLIC_APP_URL || '/',
      'en-US': process.env.NEXT_PUBLIC_APP_URL || '/',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo.png', sizes: '152x152', type: 'image/png' },
      { url: '/logo.png', sizes: '120x120', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.YANDEX_SITE_VERIFICATION || '',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': process.env.NEXT_PUBLIC_APP_NAME || 'AI TTS Generator',
    'application-name': process.env.NEXT_PUBLIC_APP_NAME || 'AI TTS Generator',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-TileImage': '/logo.png',
    'theme-color': '#3b82f6',
    'msapplication-navbutton-color': '#3b82f6',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi' className='system-ui'>
      <head>
        <StructuredData type='SoftwareApplication' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <DevToolsBlocker />
        <Analytics />
        <Toaster position='top-right' />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
