'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  noindex?: boolean
  canonical?: string
}

export default function SEOHead({
  title = 'AI Text to Speech Generator - Chuyển Văn Bản Thành Giọng Nói',
  description = 'Công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau. Hoàn toàn miễn phí và dễ sử dụng.',
  keywords = [
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
  ],
  image = '/logo.png',
  url = '/',
  type = 'website',
  noindex = false,
  canonical,
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '/'
  const fullUrl = `${baseUrl}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : fullUrl

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords.join(', ')} />
      <meta name='author' content='ThuNguyenIT' />
      <meta name='robots' content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel='canonical' href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={fullUrl} />
      <meta property='og:image' content={fullImageUrl} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content='AI Text to Speech Generator' />
      <meta property='og:locale' content='vi_VN' />

      {/* Twitter Card Meta Tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={fullImageUrl} />
      <meta name='twitter:image:alt' content={title} />

      {/* Additional Meta Tags */}
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='theme-color' content='#847445' />
      <meta name='msapplication-TileColor' content='#847445' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
      <meta name='apple-mobile-web-app-title' content='AI TTS Generator' />

      {/* Language and Geo Tags */}
      <meta name='language' content='Vietnamese' />
      <meta name='geo.region' content='VN' />
      <meta name='geo.country' content='Vietnam' />

      {/* Business/Contact Info */}
      <meta name='contact' content='0359998753' />
      <meta name='reply-to' content='contact@thunguyenit.com' />
      <meta name='owner' content='ThuNguyenIT' />
      <meta name='url' content={baseUrl} />
      <meta name='identifier-URL' content={baseUrl} />
      <meta name='category' content='AI Technology' />
      <meta name='coverage' content='Vietnam' />
      <meta name='distribution' content='global' />
      <meta name='rating' content='general' />
      <meta name='revisit-after' content='7 days' />

      {/* Preconnect to external domains for performance */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      <link rel='dns-prefetch' href='https://www.facebook.com' />
    </Head>
  )
}
