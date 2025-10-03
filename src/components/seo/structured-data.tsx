'use client'

import { BRAND_NAME, MOBILE_NUMBER, FACEBOOK_URL } from '@/constants/common'

interface StructuredDataProps {
  type?: 'Organization' | 'SoftwareApplication' | 'Service'
  additionalData?: Record<string, unknown>
}

export default function StructuredData({ type = 'SoftwareApplication', additionalData = {} }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '/'

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'AI Text to Speech Generator - Công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: MOBILE_NUMBER,
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English'],
    },
    sameAs: [FACEBOOK_URL],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressLocality: 'Việt Nam',
    },
  }

  const localBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${BRAND_NAME} - AI Text to Speech Generator`,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'AI Text to Speech Generator - Công cụ chuyển đổi văn bản thành giọng nói AI tiên tiến. Tạo ra giọng nói tự nhiên, chất lượng cao từ văn bản với nhiều ngôn ngữ và giọng đọc khác nhau.',
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    author: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: baseUrl,
    },
    featureList: [
      'Chuyển đổi văn bản thành giọng nói AI',
      'Hỗ trợ nhiều ngôn ngữ',
      'Giọng đọc tự nhiên',
      'Tải xuống file âm thanh',
      'Miễn phí sử dụng',
      'Giao diện thân thiện',
    ],
    screenshot: `${baseUrl}/logo.png`,
    sameAs: [FACEBOOK_URL],
  }

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Text to Speech Generation Service',
    description:
      'Dịch vụ chuyển đổi văn bản thành giọng nói AI với công nghệ tiên tiến, hỗ trợ nhiều ngôn ngữ và giọng đọc tự nhiên',
    provider: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    serviceType: 'Text to Speech Conversion',
    category: 'AI Technology',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Text to Speech Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Text to Speech Conversion',
            description: 'Chuyển đổi văn bản thành giọng nói với AI',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Multi-language Support',
            description: 'Hỗ trợ nhiều ngôn ngữ khác nhau',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Voice Customization',
            description: 'Tùy chỉnh giọng đọc và tốc độ',
          },
        },
      ],
    },
  }

  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return { ...organizationData, ...additionalData }
      case 'Service':
        return { ...serviceData, ...additionalData }
      case 'SoftwareApplication':
      default:
        return { ...localBusinessData, ...additionalData }
    }
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2),
      }}
    />
  )
}
